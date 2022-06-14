use solana_program::{
    system_instruction,
    program::{invoke, invoke_signed}
};
use {
    crate::{
        error::FarmError,
        state::{Farm, PREFIX},
    },
    mpl_token_metadata::{
        state::Creator,
        instruction::{
            create_metadata_accounts_v2,
            update_metadata_accounts_v2,
            // verify_collection,
            // sign_metadata
        }
    },
    anchor_lang::prelude::*,
    anchor_spl::token::Token
};

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut, seeds = [PREFIX.as_bytes()], bump = farm.bump)]
    pub farm: Account<'info, Farm>,

    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: account checked in CPI
    pub metadata: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: AccountInfo<'info>,
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = mpl_token_metadata::id())]
    pub token_metadata_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

    /// CHECK: Unsafe
    pub collection_mint: AccountInfo<'info>,
    /// CHECK: Unsafe
    pub collection_metadata: AccountInfo<'info>,
    /// CHECK: Unsafe
    pub collection_master_edition: AccountInfo<'info>,

    /// CHECK: Unsafe
    #[account(mut)]
    pub creator: AccountInfo<'info>,
}

pub fn handle_mint_nft(ctx: Context<MintNFT>, nft_name: String, nft_uri: String) -> Result<()> {

    let farm = &mut ctx.accounts.farm;

    let now = Clock::get()?.unix_timestamp;

    if let Some(go_live_date) = farm.data.go_live_date {
        /* only the authority can mint before the launch date */
        if now < go_live_date && *ctx.accounts.mint_authority.key != farm.authority {
            return Err(FarmError::FarmNotLiveYet.into());
        }
    }

    /* check if the payer (mint_authority) has enough SOL to pay the mint cost */
    if ctx.accounts.mint_authority.lamports() < farm.data.price {
        return Err(FarmError::NotEnoughSOL.into());
    }

    msg!("Current max supply: {:?}", farm.data.max_supply);
    /* check if the collection still has NFTs to mint */
    if let Some(max_supply) = farm.data.max_supply {
        msg!("NFTs minted and max supply: {} {}", farm.data.nfts_minted, max_supply);
        if farm.data.nfts_minted >= max_supply {
            return Err(FarmError::FarmEmpty.into());
        }
    }

    /* pay fees - transfer SOL from the buyer to the authority account */
    invoke(
        &system_instruction::transfer(
            &ctx.accounts.mint_authority.key,
            ctx.accounts.authority.key,
            farm.data.price,
        ),
        &[
            ctx.accounts.mint_authority.to_account_info().clone(),
            ctx.accounts.authority.clone(),
            ctx.accounts.system_program.to_account_info().clone(),
        ],
    )?;

    /* increment the counter of total mints by 1 */
    farm.data.nfts_minted += 1;

    let authority_seeds = [PREFIX.as_bytes(), &[farm.bump]];

    let mut creators: Vec<Creator> = vec![Creator {
        address: farm.key(),
        verified: true,
        share: 0,
    }];

    /* add the creators that will receive royalties from secondary sales */
    for c in &farm.data.creators {
        creators.push(Creator {
            address: c.address,
            verified: false, // TODO: How do I verify creator?
            share: c.share,
        });
    }

    let metadata_infos = vec![
        ctx.accounts.metadata.clone(),
        ctx.accounts.mint.clone(),
        ctx.accounts.mint_authority.to_account_info().clone(),
        ctx.accounts.mint_authority.to_account_info().clone(),
        ctx.accounts.token_metadata_program.clone(),
        ctx.accounts.token_program.to_account_info().clone(),
        ctx.accounts.system_program.to_account_info().clone(),
        ctx.accounts.rent.to_account_info().clone(),
        farm.to_account_info().clone(),
    ];

    let collection_info: Option<mpl_token_metadata::state::Collection>;

    if let Some(collection_pub) = farm.data.collection_mint_key {
        collection_info = Some(mpl_token_metadata::state::Collection {
            verified: false,
            key: collection_pub,
        });
    } else {
        collection_info = None;
    }

    /* set the metadata of the NFT */
    invoke_signed(
        &create_metadata_accounts_v2(
            *ctx.accounts.token_metadata_program.key,
            *ctx.accounts.metadata.key,
            *ctx.accounts.mint.key,
            *ctx.accounts.mint_authority.key,
            *ctx.accounts.mint_authority.key,
            farm.key(),
            nft_name,
            farm.data.symbol.to_string(),
            nft_uri,
            Some(creators),
            farm.data.seller_fee_basis_points, // royalties percentage in basis point 500 = 5%
            true,                                       // update auth is signer?
            true,                                      // is mutable?
            collection_info,
            None, // uses
        ),
        metadata_infos.as_slice(),
        &[&authority_seeds],
    )?;

    /* at this point the NFT is already minted with the metadata */
    /* this invoke call will disable more mints to the account */
    invoke(
        &spl_token::instruction::set_authority(
            &ctx.accounts.token_program.key(),
            &ctx.accounts.mint.key(),
            None,
            spl_token::instruction::AuthorityType::MintTokens,
            &ctx.accounts.mint_authority.key(),
            &[&ctx.accounts.mint_authority.key()],
        )?,
        &[
            ctx.accounts.mint_authority.to_account_info().clone(),
            ctx.accounts.mint.clone(),
            ctx.accounts.token_program.to_account_info().clone(),
        ],
    )?;

    /* denote that the primary sale has happened */
    /* and disable future updates to the NFT, so it is truly immutable */
    invoke_signed(
        &update_metadata_accounts_v2(
            *ctx.accounts.token_metadata_program.key,
            *ctx.accounts.metadata.key,
            farm.key(),
            None,
            None,
            Some(true),
            None
        ),
        &[
            ctx.accounts.token_metadata_program.clone(),
            ctx.accounts.metadata.clone(),
            farm.to_account_info().clone(),
        ],
        &[&authority_seeds],
    )?;

    Ok(())
}