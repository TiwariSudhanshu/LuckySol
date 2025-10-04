use anchor_lang::prelude::*;
use crate::state::{Lottery};

#[derive(Accounts)]
pub struct FulfillRandomness<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority,
    )]
    pub lottery: Account<'info, Lottery>,
}
