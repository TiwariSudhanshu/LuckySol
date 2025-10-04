use anchor_lang::prelude::*;
use crate::contexts::BuyTicket;
use crate::errors::LotteryError;

pub fn buy_ticket_handler(
    ctx: Context<BuyTicket>,
    lottery_id: u64,
) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;
    let player = &ctx.accounts.player;
    let ticket = &mut ctx.accounts.ticket;

    require!(lottery.lottery_id == lottery_id, LotteryError::InvalidLotteryId);

    // Check if lottery expired by time
    let now = Clock::get()?.unix_timestamp;
    if now >= lottery.created_at + lottery.duration {
        return err!(LotteryError::LotteryClosed);
    }

    require!(lottery.tickets_sold < lottery.max_tickets, LotteryError::LotteryFull);

    // Transfer ticket price from player to lottery account
    let cpi_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: player.to_account_info(),
            to: lottery.to_account_info(),
        },
    );
    
    anchor_lang::system_program::transfer(cpi_ctx, lottery.ticket_price)?;

    // Initialize ticket
    ticket.lottery = lottery.key();
    ticket.player = player.key();
    ticket.ticket_number = lottery.tickets_sold;
    ticket.purchased_at = now;
    ticket.bump = ctx.bumps.ticket;

    // Update lottery state
    lottery.tickets_sold += 1;
    lottery.total_prize_pool += lottery.ticket_price;

    // If max tickets reached → close buying
    if lottery.tickets_sold == lottery.max_tickets {
        msg!("All tickets sold! Lottery {} is now waiting for randomness.", lottery_id);
    }

    msg!(
        "Ticket {} purchased by {} for lottery {}",
        ticket.ticket_number,
        player.key(),
        lottery_id
    );

    Ok(())
}
