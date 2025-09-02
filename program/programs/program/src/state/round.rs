// use anchor_lang::prelude::*;

// #[account]
// pub struct Round {
//     pub round_number: u64,
//     pub total_tickets: u64,
//     pub ticket_price: u64,
//     pub is_closed: bool,
//     pub prize_pool: u64,
//     pub winner: Option<Pubkey>,
//     pub bump: u8,
// }

use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RoundStatus {
    Pending,
    Active,
    Drawing,
    Finished,
    Closed,
}

#[account]
pub struct Round {
    pub lottery: Pubkey,
    pub round_id: u64,
    pub status: RoundStatus,
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub tickets_sold: u32,
    pub winner_ticket_id: Option<u32>,
    pub winner: Option<Pubkey>,
    pub prize_amount: u64,
    pub randomness_requested: bool,
    pub randomness: Option<[u8; 32]>,
    pub bump: u8,
}

impl Round {
    pub const SPACE: usize = 8 + // discriminator
        32 + // lottery
        8 + // round_id
        1 + // status
        8 + // start_time
        9 + // end_time (Option<i64>)
        4 + // tickets_sold
        5 + // winner_ticket_id (Option<u32>)
        33 + // winner (Option<Pubkey>)
        8 + // prize_amount
        1 + // randomness_requested
        33 + // randomness (Option<[u8; 32]>)
        1; // bump
}