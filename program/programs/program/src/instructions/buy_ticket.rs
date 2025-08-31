use anchor_lang::prelude::*;
use crate::state::{Round, TicketBook};
use anchor_lang::solana_program::system_program;

pub fn handle(ctx: Context<BuyTicket>) -> Result<()> {
    let round = &mut ctx.accounts.round;
    let ticket_book = &mut ctx.accounts.ticket_book;
     require!(!round.is_closed, crate::errors::LotteryError::RoundClosed);

     let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.buyer.key(),
        &ctx.accounts.vault.key(),
        round.ticket_price,
     );

      anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
        ],
    )?;

      ticket_book.entrants.push(*ctx.accounts.buyer.key);
    round.total_tickets += 1;
    round.prize_pool += round.ticket_price;

    Ok(())
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,

    #[account(init_if_needed, payer = buyer, space = 8 + 8 + 4 + (32 * 1000), 
              seeds = [b"ticket_book", round.key().as_ref()], bump)]
    pub ticket_book: Account<'info, TicketBook>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}