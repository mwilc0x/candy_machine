use {anchor_lang::prelude::*};
use crate::state::Farm;

#[derive(Accounts)]
pub struct AddUri<'info> {
    #[account(mut, has_one = authority)]
    farm: Account<'info, Farm>,
    pub authority: Signer<'info>,
}

pub fn handler(
  ctx: Context<AddUri>,
  uri: Vec<u8>,
) -> Result<()> {  
  ctx.accounts.farm.data.manifest_uri.push(uri);

  Ok(())
}