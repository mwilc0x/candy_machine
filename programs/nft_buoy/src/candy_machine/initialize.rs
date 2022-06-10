use crate::state::*;
use { anchor_lang::prelude::*, mpl_token_metadata };
use mpl_token_metadata::state::{
    MAX_CREATOR_LEN, MAX_CREATOR_LIMIT, MAX_SYMBOL_LENGTH,
};

#[derive(Accounts)]
#[instruction(data: CandyMachineData)]
pub struct InitializeCandyMachine<'info> {
    #[account(
        init,
        seeds=[PREFIX.as_bytes()],
        payer = authority,
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
        constraint = candy_machine.to_account_info().owner == program_id
    )]
    pub candy_machine: Account<'info, CandyMachine>,

    /* the authority will also receive SOL from sales fees */
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_candy_machine(
    ctx: Context<InitializeCandyMachine>,
    data: CandyMachineData,
) -> Result<()> {

    let candy_machine = &mut ctx.accounts.candy_machine;

    candy_machine.data = data;
    candy_machine.authority = *ctx.accounts.authority.key;
    candy_machine.bump = *ctx.bumps.get("candy_machine").unwrap();

    Ok(())
}