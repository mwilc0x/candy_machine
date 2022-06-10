use crate::state::*;
use { anchor_lang::prelude::* };

#[derive(Accounts)]
pub struct GetCandyMachineState<'info> {
    #[account(mut, seeds = [PREFIX.as_bytes()], bump = candy_machine.bump)]
    pub candy_machine: Account<'info, CandyMachine>,

    #[account(mut)]
    authority: AccountInfo<'info>,
}

pub fn handle_get_candy_machine_state(
    ctx: Context<GetCandyMachineState>,
) -> Result<CandyMachineData> {
    let candy_machine = &mut ctx.accounts.candy_machine;
    Ok(candy_machine.data.clone())
}