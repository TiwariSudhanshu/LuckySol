use anchor_lang::prelude::*;
use crate::state::{Lottery, Ticket, LotteryState};
use crate::PLATFORM_FEE_WALLET;

#[derive(Accounts)]
pub struct Payout<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority,
        constraint = lottery.state == LotteryState::WaitingForPayout
    )]
    pub lottery: Account<'info, Lottery>,
    
    #[account(
        constraint = winner_ticket.lottery == lottery.key(),
        constraint = winner_ticket.ticket_number == lottery.winner.unwrap()
    )]
    pub winner_ticket: Account<'info, Ticket>,
    
    /// CHECK: This is the winner's account that will receive the payout
    #[account(
        mut,
        constraint = winner.key() == winner_ticket.player
    )]
    pub winner: AccountInfo<'info>,
    
    /// CHECK: This is the lottery creator's account that will receive 5% fee
    #[account(
        mut,
        constraint = lottery_creator.key() == lottery.authority
    )]
    pub lottery_creator: AccountInfo<'info>,
    
    /// CHECK: This is the platform fee account - must be the designated platform wallet
    #[account(
        mut,
        constraint = platform_fee_account.key() == PLATFORM_FEE_WALLET
    )]
    pub platform_fee_account: AccountInfo<'info>,
}
