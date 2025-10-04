use anchor_lang::prelude::*;

#[account]
pub struct Lottery {
    pub authority: Pubkey,
    pub lottery_id: u64,
    pub ticket_price: u64,
    pub max_tickets: u32,
    pub tickets_sold: u32,
    pub total_prize_pool: u64,
    pub winner: Option<u32>,  
    pub created_at: i64,
    pub duration: i64,        
    pub randomness_fulfilled: bool,
    pub bump: u8,
}

impl Space for Lottery {
    const INIT_SPACE: usize = 8 + // discriminator
        32 + // authority
        8 +  // lottery_id
        8 +  // ticket_price
        4 +  // max_tickets
        4 +  // tickets_sold
        8 +  // total_prize_pool
        (1 + 4) + // winner (Option<u32>)
        8 +  // created_at
        8 +  // duration
        1 +  // randomness_fulfilled
        1;   // bump
}


