use {
  crate::state::{CandyMachine},
  anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct UpdateCandyMachine<'info> {
    #[account(mut, has_one = authority)]
    candy_machine: Account<'info, CandyMachine>,
    #[account(mut)]
    authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handle_update_candy_machine_collection(
  ctx: Context<UpdateCandyMachine>,
  collection_mint_key: Option<Pubkey>,
) -> Result<()> {
  let candy_machine = &mut ctx.accounts.candy_machine;
  
  if let Some(cmint) = collection_mint_key {
      candy_machine.data.collection_mint_key = Some(cmint);
  };

  Ok(())
}