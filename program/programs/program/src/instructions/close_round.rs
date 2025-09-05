use anchor_lang::prelude::*;
use crate::contexts::CloseRound;
use crate::state::LotteryState;
use crate::errors::LotteryError;

pub fn close_round_handler(ctx: Context<CloseRound>) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;

    require!(lottery.state == LotteryState::WaitingForPayout, LotteryError::InvalidLotteryState);
    require!(lottery.randomness_fulfilled, LotteryError::RandomnessNotFulfilled);

    lottery.state = LotteryState::Closed;

    msg!("Lottery round closed. Ready for payout.");

    Ok(())
}
