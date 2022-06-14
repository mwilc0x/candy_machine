use crate::state::*;
use anchor_lang::prelude::*;
use bank::{self, cpi::accounts::InitBank, program::Bank};

// space = 8 + std::mem::size_of::<FarmData>(),
#[derive(Accounts)]
#[instruction(bump_auth: u8)]
pub struct InitFarm<'info> {
    // farm
    #[account(init, payer = payer, space = 8 + std::mem::size_of::<Farm>())]
    pub farm: Box<Account<'info, Farm>>,
    pub farm_manager: Signer<'info>,
    /// CHECK:
    #[account(mut, seeds = [farm.key().as_ref()], bump = bump_auth)]
    pub farm_authority: AccountInfo<'info>,
    // /// CHECK:
    // #[account(seeds = [b"treasury".as_ref(), farm.key().as_ref()], bump = bump_treasury)]
    // pub farm_treasury: AccountInfo<'info>,

    /* the authority will also receive SOL from sales fees */
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,

    // cpi
    #[account(mut)]
    pub bank: Signer<'info>,
    pub art_bank: Program<'info, Bank>,

    // misc
    #[account(mut)]
    pub payer: Signer<'info>,
}

impl<'info> InitFarm<'info> {
    fn init_bank_ctx(&self) -> CpiContext<'_, '_, '_, 'info, InitBank<'info>> {
        CpiContext::new(
            self.art_bank.to_account_info(),
            InitBank {
                bank: self.bank.to_account_info(),
                // using farm_authority, NOT farm_manager, coz on certain ixs (eg lock/unclock)
                // we need manager's sig, but we don't have farm manager's KP.
                // unfortunately this means we have to write a CPI ix for farm for each ix for bank
                bank_manager: self.farm_authority.clone(),
                payer: self.payer.to_account_info(),
                system_program: self.system_program.to_account_info(),
            },
        )
    }
}

pub fn handler(
    ctx: Context<InitFarm>,
    bump_auth: u8,
    data: FarmData,
) -> Result<()> {

    let farm = &mut ctx.accounts.farm;

    farm.data = data;
    farm.authority = *ctx.accounts.authority.key;

    farm.farm_manager = ctx.accounts.farm_manager.key();
    // farm.farm_treasury = ctx.accounts.farm_treasury.key();
    
    farm.farm_authority = ctx.accounts.farm_authority.key();
    farm.farm_authority_seed = farm.key();
    farm.farm_authority_bump_seed = [bump_auth];
    farm.bank = ctx.accounts.bank.key();
    // farm.config = farm_config;

    // do a cpi call to start a new bank
    bank::cpi::init_bank(
        ctx.accounts
            .init_bank_ctx()
            .with_signer(&[&ctx.accounts.farm.farm_seeds()]),
    )?;

    Ok(())
}