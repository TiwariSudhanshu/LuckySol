use anchor_lang::prelude::*;

#[account]
pub struct TicketBook {
    pub round_number: u64,
    pub chunk_idx: u32,
    pub entrants: Vec<PubKey>
}

