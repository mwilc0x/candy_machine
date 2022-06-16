use anchor_lang::prelude::*;
use instructions::*;

declare_id!("8VWkHD4LHMtHz4Er1AVkGvAnJbtLYrbC13JCHNyvDDYL");

pub mod instructions;
pub mod state;

#[program]
pub mod bank {
    use super::*;

    pub fn init_bank(ctx: Context<InitBank>) -> Result<()> {
        instructions::init_bank::handler(ctx)
    }

}