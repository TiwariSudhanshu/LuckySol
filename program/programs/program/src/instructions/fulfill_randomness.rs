use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct FulfillRandomness<'info> {
    #[account(
        has_one = authority
    )]
    pub lottery: Account<'info, Lottery>,

    #[account(
        mut,
        seeds = [b"round", lottery.key().as_ref(), lottery.current_round.to_le_bytes().as_ref()],
        bump = round.bump
    )]
    pub round: Account<'info, Round>,

    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<FulfillRandomness>, randomness: [u8; 32]) -> Result<()> {
    let round = &mut ctx.accounts.round;

    require!(round.status == RoundStatus::Drawing, crate::LotteryError::RoundNotStarted);
    require!(round.randomness_requested, crate::LotteryError::InvalidRandomness);
    require!(round.tickets_sold > 0, crate::LotteryError::InvalidTicketCount);

    // Store the randomness
    round.randomness = Some(randomness);

    // Generate winning ticket number using the randomness
    let random_u64 = u64::from_le_bytes([
        randomness[0], randomness[1], randomness[2], randomness[3],
        randomness[4], randomness[5], randomness[6], randomness[7],
    ]);

    let winning_ticket_id = (random_u64 % round.tickets_sold as u64) as u32;
    round.winner_ticket_id = Some(winning_ticket_id);

    // Update status to finished
    round.status = RoundStatus::Finished;
    round.end_time = Some(Clock::get()?.unix_timestamp);

    msg!("Round {} randomness fulfilled, winning ticket: {}", round.round_id, winning_ticket_id);

    Ok(())
}