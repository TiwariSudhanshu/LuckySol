use anchor_lang::prelude::*;
use crate::state::{Lottery, LotteryState};

#[derive(Accounts)]
pub struct FulfillRandomness<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority,
        constraint = lottery.state == LotteryState::WaitingForRandomness
    )]
    pub lottery: Account<'info, Lottery>,
}
