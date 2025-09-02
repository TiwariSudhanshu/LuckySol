// use anchor_lang::prelude::*;

// #[account]
// pub struct TicketBook {
//     pub round_number: u64,
//     pub chunk_idx: u32,
//     pub entrants: Vec<Pubkey>
// }


use anchor_lang::prelude::*;

#[account]
pub struct TicketBook {
    pub lottery: Pubkey,
    pub round_id: u64,
    pub owner: Pubkey,
    pub tickets: Vec<u32>,
    pub bump: u8,
}

impl TicketBook {
    pub const SPACE: usize = 8 + // discriminator
        32 + // lottery
        8 + // round_id
        32 + // owner
        4 + (4 * 100) + // tickets (assuming max 100 tickets per user)
        1; // bump

    pub fn add_ticket(&mut self, ticket_id: u32) {
        self.tickets.push(ticket_id);
    }

    pub fn has_winning_ticket(&self, winning_ticket: u32) -> bool {
        self.tickets.contains(&winning_ticket)
    }
}