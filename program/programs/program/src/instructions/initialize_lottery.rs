use anchor_lang::prelude::*;
use crate::contexts::InitializeLottery;

pub fn initialize_lottery_handler(
    ctx: Context<InitializeLottery>,
    lottery_id: u64,
    ticket_price: u64,
    max_tickets: u32,
    duration: i64, // ⏳ new param
) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;
    let clock = Clock::get()?;

    lottery.authority = ctx.accounts.authority.key();
    lottery.lottery_id = lottery_id;
    lottery.ticket_price = ticket_price;
    lottery.max_tickets = max_tickets;
    lottery.tickets_sold = 0;
    lottery.total_prize_pool = 0;
    lottery.winner = None;
    lottery.created_at = clock.unix_timestamp;
    lottery.duration = duration; 
    lottery.randomness_fulfilled = false;
    lottery.bump = ctx.bumps.lottery;

    msg!(
        "Lottery initialized with ID: {}, ticket price: {}, max tickets: {}, duration: {} sec",
        lottery_id,
        ticket_price,
        max_tickets,
        duration
    );

    Ok(())
}
