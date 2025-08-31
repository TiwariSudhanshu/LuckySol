use anchor_lang::prelude::*;
use crate::state::{Round, Lottery};
use crate::errors::LotteryError;

pub fn handle(ctx: Context<CloseRound>) -> Result<()> {
    let round = &mut ctx.accounts.round;
    require!(!round.is_closed, LotteryError::RoundClosed);
     round.is_closed = true;
     Ok(());
}


#[derive(Accounts)]
pub struct CloseRound<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,

    pub admin: Signer<'info>,  

    pub system_program: Program<'info, System>,
}