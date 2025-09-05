use anchor_lang::prelude::*;
use crate::state::{Lottery, LotteryState};

#[derive(Accounts)]
pub struct CloseRound<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority,
        constraint = lottery.state == LotteryState::WaitingForPayout
    )]
    pub lottery: Account<'info, Lottery>,
}
