use {anchor_lang::prelude::*};
use crate::state::Farm;

#[derive(Accounts)]
pub struct UpdateFarm<'info> {
    #[account(mut, has_one = authority)]
    farm: Account<'info, Farm>,
    #[account(mut)]
    authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handle_update_farm_collection(
  ctx: Context<UpdateFarm>,
  collection_mint_key: Option<Pubkey>,
) -> Result<()> {
  let farm = &mut ctx.accounts.farm;
  
  if let Some(cmint) = collection_mint_key {
      farm.data.collection_mint_key = Some(cmint);
  };

  Ok(())
}