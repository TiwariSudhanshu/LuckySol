use anchor_lang::prelude::*;
use crate::state::{Lottery,Round};

pub fn handle(ctx: Context<StartRound>) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;
    let round = &mut ctx.accounts.round;
let vault = &mut ctx.accounts.vault;
     lottery.current_round += 1;
    round.round_number = lottery.current_round;
    round.total_tickets = 0;
    round.is_closed = false;
    round.prize_pool = 0;
    round.winner = None;
    round.bump = *ctx.bumps.get("round").unwrap();

    Ok(())

}

#[derive(Accounts)]
pub struct StartRound<'info> {
    #[account(mut, has_one = admin)]
    
    pub lottery: Account<'info, Lottery>,
    
    
    #[account(
        init,
        payer = admin,
        space = 8 + 8 + 8 + 1 + 8 + 32 + 1, 
        seeds = [b"round", lottery.key().as_ref(), &lottery.current_round.to_le_bytes()], bump)]
    
        pub round: Account<'info, Round>,

           #[account(
        init,
        payer = admin,
        seeds = [b"vault", round.key().as_ref()],
        bump,
        space = 8 
    )]
    pub vault: Account<'info, VaultAccount>,
    
    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}
