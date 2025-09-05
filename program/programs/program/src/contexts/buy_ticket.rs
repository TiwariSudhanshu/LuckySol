use anchor_lang::prelude::*;
use crate::state::{Lottery, Ticket};

#[derive(Accounts)]
#[instruction(lottery_id: u64)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"lottery", lottery_id.to_le_bytes().as_ref()],
        bump = lottery.bump
    )]
    pub lottery: Account<'info, Lottery>,
    
    #[account(
        init,
        payer = player,
        space = Ticket::INIT_SPACE,
        seeds = [b"ticket", lottery.key().as_ref(), lottery.tickets_sold.to_le_bytes().as_ref()],
        bump
    )]
    pub ticket: Account<'info, Ticket>,
    
    pub system_program: Program<'info, System>,
}
