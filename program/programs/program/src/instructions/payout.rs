use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct Payout<'info> {
    #[account(
        mut,
        seeds = [b"lottery", lottery.lottery_id.to_le_bytes().as_ref()],
        bump = lottery.bump
    )]
    pub lottery: Account<'info, Lottery>,

    #[account(
        mut,
        seeds = [b"round", lottery.key().as_ref(), round.round_id.to_le_bytes().as_ref()],
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
    pub winner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Payout>) -> Result<()> {
    let round = &mut ctx.accounts.round;
    let vault_account = &mut ctx.accounts.vault_account;
    let lottery = &ctx.accounts.lottery;

    require!(round.status == RoundStatus::Finished, crate::LotteryError::RoundNotFinished);
    require!(round.winner.is_none(), crate::LotteryError::PayoutAlreadyClaimed);

    let winning_ticket_id = round.winner_ticket_id.ok_or(crate::LotteryError::NoWinner)?;

    // For simplicity, we'll set the winner directly here
    // In a real implementation, you'd verify ticket ownership through a separate account
    
    // Calculate payout (90% of prize pool to winner, 10% as house fee)
    let total_prize = round.prize_amount;
    let house_fee = total_prize / 10; // 10%
    let winner_payout = total_prize - house_fee;

    // Transfer winnings to winner
    let lottery_key = lottery.key();
    let vault_seeds = &[
        b"vault_sol",
        lottery_key.as_ref(),
        &[ctx.bumps.vault]
    ];

    **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= winner_payout;
    **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += winner_payout;

    // Update vault account
    vault_account.withdraw(winner_payout)?;

    // Mark winner in round
    round.winner = Some(ctx.accounts.winner.key());
    round.status = RoundStatus::Closed;

    msg!(
        "Payout of {} lamports sent to winner {} for round {} (ticket {})",
        winner_payout,
        ctx.accounts.winner.key(),
        round.round_id,
        winning_ticket_id
    );

    Ok(())
}