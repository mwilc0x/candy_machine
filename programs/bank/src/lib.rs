use anchor_lang::prelude::*;
use instructions::*;

declare_id!("ChNJdVCzoAxQM5u6d56M39jpwVxd77M31k9fnz9pFzhj");

pub mod instructions;
pub mod state;

#[program]
pub mod bank {
    use super::*;

    pub fn init_bank(ctx: Context<InitBank>) -> Result<()> {
        instructions::init_bank::handler(ctx)
    }

}