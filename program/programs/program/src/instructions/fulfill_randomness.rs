use anchor_lang::prelude::*;
use crate::contexts::FulfillRandomness;
use crate::errors::LotteryError;

pub fn fulfill_randomness_handler(
    ctx: Context<FulfillRandomness>,
    randomness: [u8; 32],
) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;

    require!(!lottery.randomness_fulfilled, LotteryError::RandomnessAlreadyFulfilled);
    require!(lottery.tickets_sold > 0, LotteryError::NoTicketsSold);

    // Convert randomness to winning ticket number
    let random_number = u64::from_le_bytes([
        randomness[0], randomness[1], randomness[2], randomness[3],
        randomness[4], randomness[5], randomness[6], randomness[7],
    ]);
    
    let winning_ticket_number = (random_number % lottery.tickets_sold as u64) as u32;

    lottery.winner = Some(winning_ticket_number);
    lottery.randomness_fulfilled = true;

    msg!("Randomness fulfilled. Winning ticket number: {}", winning_ticket_number);

    Ok(())
}
