use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct CloseRound<'info> {
    #[account(
        mut,
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

pub fn handler(ctx: Context<CloseRound>) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;
    let round = &mut ctx.accounts.round;

    require!(
        round.status == RoundStatus::Active || round.status == RoundStatus::Finished,
        crate::LotteryError::RoundNotStarted
    );

    if round.status == RoundStatus::Active {
        // If round is still active but we're closing it, initiate drawing
        if round.tickets_sold > 0 {
            round.status = RoundStatus::Drawing;
            round.randomness_requested = true;
            msg!("Round {} closed and drawing initiated", round.round_id);
        } else {
            // No tickets sold, close directly
            round.status = RoundStatus::Closed;
            round.end_time = Some(Clock::get()?.unix_timestamp);
            msg!("Round {} closed with no tickets sold", round.round_id);
        }
    } else if round.status == RoundStatus::Finished {
        // Mark as closed
        round.status = RoundStatus::Closed;
        msg!("Round {} marked as closed", round.round_id);
    }

    // Increment lottery round counter for next round
    if round.status == RoundStatus::Closed {
        lottery.current_round += 1;
    }

    Ok(())
}