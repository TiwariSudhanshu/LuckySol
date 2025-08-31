use anchor_lang::prelude::*;
use crate::state::{Round, VaultAccount};
use crate::errors::LotteryError;

pub fn handle(ctx: Context<Payout>) -> Result<()> {
    let round = &ctx.accounts.round;
    let vault = &mut ctx.accounts.vault;
      let winner_pubkey = round.winner.ok_or(LotteryError::NoWinner)?;
       let total = round.prize_pool;
    let platform_fee = total * 5 / 100;
    let admin_fee = total * 5 / 100;
    let winner_amount = total - platform_fee - admin_fee;

        // 1️⃣ Transfer to winner
    let ix_winner = anchor_lang::solana_program::system_instruction::transfer(
        &vault.key(),
        &winner_pubkey,
        winner_amount,
    );

    // 2️⃣ Transfer to platform
    let ix_platform = anchor_lang::solana_program::system_instruction::transfer(
        &vault.key(),
        &ctx.accounts.platform.key(),
        platform_fee,
    );

    // 3️⃣ Transfer to admin
    let ix_admin = anchor_lang::solana_program::system_instruction::transfer(
        &vault.key(),
        &ctx.accounts.admin.key(),
        admin_fee,
    );

    let seeds = &[b"vault", round.key().as_ref(), &[vault.bump]];

      anchor_lang::solana_program::program::invoke_signed(
        &ix_winner,
        &[vault.to_account_info(), ctx.accounts.winner.to_account_info()],
        &[seeds],
    )?;

    anchor_lang::solana_program::program::invoke_signed(
        &ix_platform,
        &[vault.to_account_info(), ctx.accounts.platform.to_account_info()],
        &[seeds],
    )?;

    anchor_lang::solana_program::program::invoke_signed(
        &ix_admin,
        &[vault.to_account_info(), ctx.accounts.admin.to_account_info()],
        &[seeds],
    )?;
    
    Ok(())
}


#[derive(Accounts)]
pub struct Payout<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,

    #[account(mut, seeds = [b"vault", round.key().as_ref()], bump)]
    pub vault: Account<'info, VaultAccount>,

    #[account(mut)]
    pub winner: AccountInfo<'info>,

    #[account(mut)]
    pub platform: AccountInfo<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,
}