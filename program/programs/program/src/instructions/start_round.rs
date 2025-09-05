use anchor_lang::prelude::*;
use crate::contexts::StartRound;
use crate::state::LotteryState;
use crate::errors::LotteryError;

pub fn start_round_handler(ctx: Context<StartRound>) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;

    require!(lottery.state == LotteryState::WaitingForTickets, LotteryError::InvalidLotteryState);
    require!(lottery.tickets_sold > 0, LotteryError::NoTicketsSold);

    lottery.state = LotteryState::WaitingForRandomness;

    msg!("Lottery round started with {} tickets sold", lottery.tickets_sold);

    Ok(())
}
