use crate::state::*;
use anchor_lang::prelude::*;

// space = 8 + std::mem::size_of::<FarmData>(),
#[derive(Accounts)]
#[instruction(bump_auth: u8)]
pub struct InitFarm<'info> {
    // farm
    #[account(
        init, 
        payer = payer, 
        space = 8 + std::mem::size_of::<Farm>()
    )]
    pub farm: Box<Account<'info, Farm>>,

    /// CHECK:
    #[account(mut, seeds = [farm.key().as_ref()], bump = bump_auth)]
    pub farm_authority: AccountInfo<'info>,

    /* the authority will also receive SOL from sales fees */
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,

    // misc
    #[account(mut)]
    pub payer: Signer<'info>,

    // #[account(mut)]
    pub creator_authority: Signer<'info>,
}

pub fn handler(
    ctx: Context<InitFarm>,
    bump_auth: u8,
    data: FarmData,
) -> Result<()> {
    let farm = &mut ctx.accounts.farm;
    
    farm.data = data;
    farm.authority = *ctx.accounts.authority.key;
    
    farm.farm_authority = ctx.accounts.farm_authority.key();
    farm.farm_authority_seed = farm.key();
    farm.farm_authority_bump_seed = [bump_auth];

    Ok(())
}