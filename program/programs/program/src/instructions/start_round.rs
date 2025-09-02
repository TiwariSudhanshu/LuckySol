use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct StartRound<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub lottery: Account<'info, Lottery>,

    #[account(
        init,
        payer = authority,
        space = Round::SPACE,
        seeds = [b"round", lottery.key().as_ref(), lottery.current_round.to_le_bytes().as_ref()],
        bump
    )]
    pub round: Account<'info, Round>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<StartRound>) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;
    let round = &mut ctx.accounts.round;

    require!(lottery.is_active, crate::LotteryError::LotteryNotActive);

    let clock = Clock::get()?;

    round.lottery = lottery.key();
    round.round_id = lottery.current_round;
    round.status = RoundStatus::Active;
    round.start_time = clock.unix_timestamp;
    round.end_time = None;
    round.tickets_sold = 0;
    round.winner_ticket_id = None;
    round.winner = None;
    round.prize_amount = 0;
    round.randomness_requested = false;
    round.randomness = None;
    round.bump = ctx.bumps.round;

    msg!("Round {} started for lottery {}", lottery.current_round, lottery.lottery_id);

    Ok(())
}