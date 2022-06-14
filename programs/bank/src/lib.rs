use anchor_lang::prelude::*;
use instructions::*;

declare_id!("bankHHdqMuaaST4qQk6mkzxGeKPHWmqdgor6Gs8r88m");

pub mod instructions;
pub mod state;

#[program]
pub mod bank {
    use super::*;

    pub fn init_bank(ctx: Context<InitBank>) -> Result<()> {
        instructions::init_bank::handler(ctx)
    }

}