use solana_program::{
    system_instruction,
    program::{invoke, invoke_signed}
};
use {
    crate::{
        error::CandyError,
        state::{CandyMachine, PREFIX},
    },
    mpl_token_metadata::{
        state::Creator,
        instruction::{
            create_metadata_accounts_v2,
            update_metadata_accounts,
            verify_collection,
            sign_metadata
        }
    },
    anchor_lang::prelude::*,
    anchor_spl::token::Token
};

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut, seeds = [PREFIX.as_bytes()], bump = candy_machine.bump)]
    pub candy_machine: Account<'info, CandyMachine>,

    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: account checked in CPI
    pub metadata: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: AccountInfo<'info>,
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
    pub creator: AccountInfo<'info>,

    /// CHECK: account constraints checked in account trait
    #[account(
        mut, 
        seeds = [
            b"collection".as_ref(), 
            candy_machine.to_account_info().key.as_ref(),
            creator.to_account_info().key.as_ref()
        ], 
        bump
    )]
    pub collection_pda: UncheckedAccount<'info>,

    /// CHECK: account constraints checked in account trait
    #[account(
        mut, 
        seeds = [
            b"creator".as_ref(), 
            candy_machine.to_account_info().key.as_ref(),
            creator.to_account_info().key.as_ref()
        ], 
        bump
    )]
    pub creator_pda: UncheckedAccount<'info>,
}

pub fn handle_mint_nft(ctx: Context<MintNFT>, nft_name: String, nft_uri: String) -> Result<()> {

    let candy_machine = &mut ctx.accounts.candy_machine;
    let now = Clock::get()?.unix_timestamp;

    if let Some(go_live_date) = candy_machine.data.go_live_date {
        /* only the authority can mint before the launch date */
        if now < go_live_date && *ctx.accounts.mint_authority.key != candy_machine.authority {
            return Err(CandyError::CandyMachineNotLiveYet.into());
        }
    }

    /* check if the payer (mint_authority) has enough SOL to pay the mint cost */
    if ctx.accounts.mint_authority.lamports() < candy_machine.data.price {
        return Err(CandyError::NotEnoughSOL.into());
    }

    msg!("Current max supply: {:?}", candy_machine.data.max_supply);
    /* check if the collection still has NFTs to mint */
    if let Some(max_supply) = candy_machine.data.max_supply {
        msg!("NFTs minted and max supply: {} {}", candy_machine.data.nfts_minted, max_supply);
        if candy_machine.data.nfts_minted >= max_supply {
            return Err(CandyError::CandyMachineEmpty.into());
        }
    }

    /* pay fees - transfer SOL from the buyer to the authority account */
    invoke(
        &system_instruction::transfer(
            &ctx.accounts.mint_authority.key,
            ctx.accounts.authority.key,
            candy_machine.data.price,
        ),
        &[
            ctx.accounts.mint_authority.to_account_info().clone(),
            ctx.accounts.authority.clone(),
            ctx.accounts.system_program.to_account_info().clone(),
        ],
    )?;

    /* increment the counter of total mints by 1 */
    candy_machine.data.nfts_minted += 1;

    let authority_seeds = [PREFIX.as_bytes(), &[candy_machine.bump]];

    let mut creators: Vec<Creator> = vec![Creator {
        address: candy_machine.key(),
        verified: true,
        share: 0,
    }];

    /* add the creators that will receive royalties from secondary sales */
    for c in &candy_machine.data.creators {
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
        candy_machine.to_account_info().clone(),
    ];

    let collection_info: Option<mpl_token_metadata::state::Collection>;

    if let Some(collection_pub) = candy_machine.data.collection_mint_key {
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
            candy_machine.key(),
            nft_name,
            candy_machine.data.symbol.to_string(),
            nft_uri,
            Some(creators),
            candy_machine.data.seller_fee_basis_points, // royalties percentage in basis point 500 = 5%
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
        &update_metadata_accounts(
            *ctx.accounts.token_metadata_program.key,
            *ctx.accounts.metadata.key,
            candy_machine.key(),
            None,
            None,
            Some(true),
        ),
        &[
            ctx.accounts.token_metadata_program.clone(),
            ctx.accounts.metadata.clone(),
            candy_machine.to_account_info().clone(),
        ],
        &[&authority_seeds],
    )?;

    let candy_machine_key = ctx.accounts.candy_machine.key();
    let creator_key = ctx.accounts.creator.key();

    let creator_authority_seeds = [
        b"creator".as_ref(), 
        candy_machine_key.as_ref(),
        creator_key.as_ref(),
        &[*ctx.bumps.get("creator_pda").unwrap()]
    ];

    invoke_signed(
        &sign_metadata(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.creator.key(), // this is the signer
        ),
        &[
            ctx.accounts.token_metadata_program.clone(),
            ctx.accounts.metadata.clone(),
            ctx.accounts.creator_pda.to_account_info().clone(),
            ctx.accounts.creator.to_account_info().clone()
        ],
        &[&creator_authority_seeds],
    )?;

    let collection_infos = vec![
        ctx.accounts.metadata.to_account_info().clone(),
        // derived from PDA collectionPDA
        ctx.accounts.collection_pda.to_account_info().clone(), // mint authority 
        // derived from PDA collectionPDA
        ctx.accounts.collection_pda.to_account_info().clone(), // payer
        ctx.accounts.collection_mint.to_account_info().clone(),
        ctx.accounts.collection_metadata.to_account_info().clone(),
        ctx.accounts.collection_master_edition.to_account_info().clone(),
        ctx.accounts.token_metadata_program.to_account_info().clone(),
        ctx.accounts.creator.to_account_info().clone(),
    ];

    let collection_authority_seeds = [
        b"collection".as_ref(), 
        candy_machine_key.as_ref(),
        creator_key.as_ref(),
        &[*ctx.bumps.get("collection_pda").unwrap()]
    ];

    // verify collection
    invoke_signed(
        &verify_collection(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.creator.key(),
            ctx.accounts.creator.key(),
            ctx.accounts.collection_mint.key(),
            ctx.accounts.collection_metadata.key(),
            ctx.accounts.collection_master_edition.key(),
            None,
        ),
        collection_infos.as_slice(),
        &[&collection_authority_seeds, &collection_authority_seeds],
    )?;

    Ok(())
}