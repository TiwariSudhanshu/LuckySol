use anchor_lang::prelude::*;
use crate::state::lottery;

pub fn handle(
    ctx: Context<InitializeLottery>,
    ticket_price: u64
)->Result<()>{
    let lottery = &mut ctx.accounts.lottery;
    lottery.admin = *ctx.accounts.admin.key;
    lottery.ticket_price = ticket_price;
    lottery.current_round = 0;
    lottery.bump = *ctx.bumps.get("lottery").unwrap();
    Ok(())
}


#[derive(Accounts)]
pub struct InitializeLottery<'info>{

    #[account(
        init,
        payer=admin,
        space=8+32+8+8+1,
        seeds=[b"lottery"],
        bump
    )]

    pub lottery : Account<'info, Lottery>,

    #[account(mut)]
    pub admin: Signer<'info>

    pub system_program: Program<'info, System>
}