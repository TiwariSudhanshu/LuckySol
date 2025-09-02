use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;

#[derive(Accounts)]
#[instruction(lottery_id: u64)]
pub struct BuyTicket<'info> {
    #[account(
        mut,
        seeds = [b"lottery", lottery_id.to_le_bytes().as_ref()],
        bump = lottery.bump
    )]
    pub lottery: Account<'info, Lottery>,

    #[account(
        mut,
        seeds = [b"round", lottery.key().as_ref(), lottery.current_round.to_le_bytes().as_ref()],
        bump = round.bump
    )]
    pub round: Account<'info, Round>,

    #[account(
        mut,
        seeds = [b"vault", lottery.key().as_ref()],
        bump = vault_account.bump
    )]
    pub vault_account: Account<'info, VaultAccount>,

    /// CHECK: This is the vault account for holding SOL
    #[account(
        mut,
        seeds = [b"vault_sol", lottery.key().as_ref()],
        bump
    )]
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<BuyTicket>, _lottery_id: u64) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;
    let round = &mut ctx.accounts.round;
    let vault_account = &mut ctx.accounts.vault_account;

    require!(lottery.is_active, crate::LotteryError::LotteryNotActive);
    require!(round.status == RoundStatus::Active, crate::LotteryError::RoundNotStarted);
    require!(round.tickets_sold < lottery.max_tickets, crate::LotteryError::LotteryFull);

    // Transfer ticket price to vault
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        lottery.ticket_price,
    )?;

    // Get ticket ID
    let ticket_id = round.tickets_sold;

    // Update round state
    round.tickets_sold += 1;
    round.prize_amount = round.prize_amount.saturating_add(lottery.ticket_price);

    // Update vault account
    vault_account.deposit(lottery.ticket_price);

    // Update lottery total prize pool
    lottery.total_prize_pool = lottery.total_prize_pool.saturating_add(lottery.ticket_price);

    msg!("Ticket {} purchased by {} for round {}", ticket_id, ctx.accounts.buyer.key(), round.round_id);

    Ok(())
}