use crate::state::*;
use { anchor_lang::prelude::*, mpl_token_metadata };
use mpl_token_metadata::state::{
   MAX_CREATOR_LEN, MAX_CREATOR_LIMIT, MAX_SYMBOL_LENGTH,
};

// space = 8 + std::mem::size_of::<FarmData>(),
#[derive(Accounts)]
#[instruction(data: FarmData)]
pub struct InitializeFarm<'info> {
    #[account(
        init,
        payer = authority,
        seeds=[PREFIX.as_bytes()],
        space =
            8 + // discriminator
            8 + // price
            8 + // nfts_minted
            8 + // go_live_date
            4 + MAX_CREATOR_LIMIT*MAX_CREATOR_LEN + // creators
            (MAX_SYMBOL_LENGTH + 4) + // symbol
            2 + // seller fee
            32 +  // authority
            32 +  // start date
            1 + 32 +  // collection key
            1,   // bump + bonus
        bump,
        constraint = farm.to_account_info().owner == program_id
    )]
    pub farm: Account<'info, Farm>,

    /* the authority will also receive SOL from sales fees */
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_farm(
    ctx: Context<InitializeFarm>,
    data: FarmData,
) -> Result<()> {

    let farm = &mut ctx.accounts.farm;

    farm.data = data;
    farm.authority = *ctx.accounts.authority.key;
    farm.bump = *ctx.bumps.get("farm").unwrap();

    msg!(
        "Initialized farm: {}.",
        farm.key()
    );

    Ok(())
}