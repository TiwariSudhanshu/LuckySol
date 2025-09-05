use anchor_lang::prelude::*;

#[account]
pub struct Ticket {
    pub lottery: Pubkey,
    pub player: Pubkey,
    pub ticket_number: u32,
    pub purchased_at: i64,
    pub bump: u8,
}

impl Space for Ticket {
    const INIT_SPACE: usize = 8 + // discriminator
        32 + // lottery
        32 + // player
        4 +  // ticket_number
        8 +  // purchased_at
        1;   // bump
}
