use anchor_lang::prelude::*;
use crate::state::Lottery;

#[derive(Accounts)]
#[instruction(lottery_id: u64)]
pub struct InitializeLottery<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Lottery::INIT_SPACE,
        seeds = [b"lottery", lottery_id.to_le_bytes().as_ref()],
        bump
    )]
    pub lottery: Account<'info, Lottery>,

    pub system_program: Program<'info, System>,
}
