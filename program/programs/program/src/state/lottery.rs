// use anchor_lang::prelude::*;

// #[account]
// pub struct Lottery{
//     pub admin: Pubkey,
//     pub ticket_price: u64,
//     pub current_round: u64,
//     pub bump: u8,
// }

use anchor_lang::prelude::*;

#[account]
pub struct Lottery {
    pub lottery_id: u64,
    pub authority: Pubkey,
    pub ticket_price: u64,
    pub max_tickets: u32,
    pub current_round: u64,
    pub is_active: bool,
    pub total_prize_pool: u64,
    pub bump: u8,
}

impl Lottery {
    pub const SPACE: usize = 8 + // discriminator
        8 + // lottery_id
        32 + // authority
        8 + // ticket_price
        4 + // max_tickets
        8 + // current_round
        1 + // is_active
        8 + // total_prize_pool
        1; // bump
}