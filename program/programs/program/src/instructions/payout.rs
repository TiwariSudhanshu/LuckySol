use anchor_lang::prelude::*;
use crate::contexts::Payout;
use crate::state::LotteryState;
use crate::errors::LotteryError;

pub fn payout_handler(ctx: Context<Payout>) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;
    let winner_ticket = &ctx.accounts.winner_ticket;

    // ✅ state should be WaitingForPayout, not Closed
    require!(
        lottery.state == LotteryState::WaitingForPayout,
        LotteryError::InvalidLotteryState
    );
    require!(lottery.winner.is_some(), LotteryError::NoWinner);
    require!(
        winner_ticket.ticket_number == lottery.winner.unwrap(),
        LotteryError::InvalidWinnerTicket
    );

    let total_prize_pool = lottery.total_prize_pool;

    // Calculate distribution amounts with strict policy
    let winner_amount = (total_prize_pool * 90) / 100; // 90% to winner
    let creator_amount = (total_prize_pool * 5) / 100; // 5% to lottery creator
    let platform_amount =
        total_prize_pool - winner_amount - creator_amount; // Remaining 5% to platform

    // Ensure we don't have any rounding issues
    require!(
        winner_amount + creator_amount + platform_amount == total_prize_pool,
        LotteryError::InvalidPayout
    );

    // Transfer 90% to winner
    **lottery.to_account_info().try_borrow_mut_lamports()? -= winner_amount;
    **ctx
        .accounts
        .winner
        .to_account_info()
        .try_borrow_mut_lamports()? += winner_amount;

    // Transfer 5% to lottery creator
    **lottery.to_account_info().try_borrow_mut_lamports()? -= creator_amount;
    **ctx
        .accounts
        .lottery_creator
        .to_account_info()
        .try_borrow_mut_lamports()? += creator_amount;

    // Transfer 5% to platform fee account
    **lottery.to_account_info().try_borrow_mut_lamports()? -= platform_amount;
    **ctx
        .accounts
        .platform_fee_account
        .to_account_info()
        .try_borrow_mut_lamports()? += platform_amount;

    // Update lottery state
    lottery.state = LotteryState::PaidOut;
    lottery.total_prize_pool = 0;

    msg!("Payout completed with strict 90/5/5 distribution:");
    msg!(
        "Winner {} received {} lamports (90%)",
        ctx.accounts.winner.key(),
        winner_amount
    );
    msg!(
        "Creator {} received {} lamports (5%)",
        ctx.accounts.lottery_creator.key(),
        creator_amount
    );
    msg!(
        "Platform {} received {} lamports (5%)",
        ctx.accounts.platform_fee_account.key(),
        platform_amount
    );

    Ok(())
}
