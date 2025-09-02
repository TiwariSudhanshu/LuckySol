use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(lottery_id: u64)]
pub struct InitializeLottery<'info> {
    #[account(
        init,
        payer = authority,
        space = Lottery::SPACE,
        seeds = [b"lottery", lottery_id.to_le_bytes().as_ref()],
        bump
    )]
    pub lottery: Account<'info, Lottery>,

    #[account(
        init,
        payer = authority,
        space = VaultAccount::SPACE,
        seeds = [b"vault", lottery.key().as_ref()],
        bump
    )]
    pub vault_account: Account<'info, VaultAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeLottery>,
    lottery_id: u64,
    ticket_price: u64,
    max_tickets: u32,
) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;
    let vault_account = &mut ctx.accounts.vault_account;

    require!(ticket_price > 0, crate::LotteryError::InvalidTicketCount);
    require!(max_tickets > 0, crate::LotteryError::InvalidTicketCount);

    lottery.lottery_id = lottery_id;
    lottery.authority = ctx.accounts.authority.key();
    lottery.ticket_price = ticket_price;
    lottery.max_tickets = max_tickets;
    lottery.current_round = 0;
    lottery.is_active = true;
    lottery.total_prize_pool = 0;
    lottery.bump = ctx.bumps.lottery;

    vault_account.lottery = lottery.key();
    vault_account.authority = ctx.accounts.authority.key();
    vault_account.total_deposits = 0;
    vault_account.total_withdrawals = 0;
    vault_account.bump = ctx.bumps.vault_account;

    msg!("Lottery {} initialized with ticket price: {} lamports", lottery_id, ticket_price);

    Ok(())
}