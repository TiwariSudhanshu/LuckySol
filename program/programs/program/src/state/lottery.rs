use anchor_lang::prelude::*;

#[account]
pub struct Lottery{
    pub admin: PubKey,
    pub ticket_price: u64,
    pub current_round: u64,
    pub bump: u8,
}