use anchor_lang::prelude::*;
use crate::state::{Round, TicketBook};
use crate::errors::LotteryError;


pub fn handle(ctx: Context<FulfillRandomness>, random_number: u64) -> Result<()> {
    let round = &mut ctx.accounts.round;
    let ticket_book = &ctx.accounts.ticket_book;
      require!(round.is_closed, LotteryError::RoundNotClosed);
         require!(ticket_book.entrants.len() > 0, LotteryError::NoTickets);
          let winner_index = (random_number as usize) % ticket_book.entrants.len();
    round.winner = Some(ticket_book.entrants[winner_index]);
    Ok(())
}

#[derive(Accounts)]
pub struct FulfillRandomness<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,

    #[account(mut, seeds = [b"ticket_book", round.key().as_ref()], bump)]
    pub ticket_book: Account<'info, TicketBook>,
}