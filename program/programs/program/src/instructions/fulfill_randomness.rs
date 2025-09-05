use anchor_lang::prelude::*;
use crate::contexts::FulfillRandomness;
use crate::state::LotteryState;
use crate::errors::LotteryError;

pub fn fulfill_randomness_handler(
    ctx: Context<FulfillRandomness>,
    randomness: [u8; 32],
) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;

    require!(lottery.state == LotteryState::WaitingForRandomness, LotteryError::InvalidLotteryState);
    require!(!lottery.randomness_fulfilled, LotteryError::RandomnessAlreadyFulfilled);

    // Convert randomness to winning ticket number
    let random_number = u64::from_le_bytes([
        randomness[0], randomness[1], randomness[2], randomness[3],
        randomness[4], randomness[5], randomness[6], randomness[7],
    ]);
    
    let winning_ticket_number = (random_number % lottery.tickets_sold as u64) as u32;

    lottery.winner = Some(winning_ticket_number);
    lottery.randomness_fulfilled = true;
    lottery.state = LotteryState::WaitingForPayout;

    msg!("Randomness fulfilled. Winning ticket number: {}", winning_ticket_number);

    Ok(())
}
