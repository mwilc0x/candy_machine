use anchor_lang::prelude::*;
use instructions::*;

declare_id!("5EMuxVuRsFDq9dNZzsPz6BFuY1CzndU9HW6dX7VWB3ez");

pub mod instructions;
pub mod state;

#[program]
pub mod bank {
    use super::*;

    pub fn init_bank(ctx: Context<InitBank>) -> Result<()> {
        instructions::init_bank::handler(ctx)
    }

}