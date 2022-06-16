use {anchor_lang::prelude::*};
use crate::state::Farm;

#[derive(Accounts)]
pub struct UpdateFarm<'info> {
    #[account(mut, has_one = farm_manager)]
    farm: Account<'info, Farm>,
    farm_manager: Signer<'info>,
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