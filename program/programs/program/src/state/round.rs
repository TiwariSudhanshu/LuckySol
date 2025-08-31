use anchor_lang::prelude::*;

#[account]
pub struct Round {
    pub round_number: u64,
    pub total_tickets: u64,
    pub is_closed: bool,
    pub prize_pool: u64,
    pub winner: Option<PubKey>
}