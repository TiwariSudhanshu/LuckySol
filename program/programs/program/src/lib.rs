use anchor_lang::prelude::*;
pub const PLATFORM_FEE_WALLET: Pubkey = pubkey!("JDyrxP92FsPYjhsx145ogbTXQqXnkZhWHUQxz9ocd3ZD");

pub mod instructions;
pub mod state;
pub mod contexts;
pub mod errors;

use instructions::*;
use contexts::*;

declare_id!("9hH3njmbadFWYXE5J9HB7ewvKBpqxYJd47BdecmQEGmt");

#[program]
pub mod lottery {
    use super::*;

    pub fn initialize_lottery(
        ctx: Context<InitializeLottery>,
        lottery_id: u64,
        ticket_price: u64,
        max_tickets: u32,
    ) -> Result<()> {
        initialize_lottery_handler(ctx, lottery_id, ticket_price, max_tickets)
    }

    pub fn buy_ticket(
        ctx: Context<BuyTicket>,
        lottery_id: u64,
    ) -> Result<()> {
        buy_ticket_handler(ctx, lottery_id)
    }

    pub fn start_round(ctx: Context<StartRound>) -> Result<()> {
        start_round_handler(ctx)
    }

    pub fn fulfill_randomness(
        ctx: Context<FulfillRandomness>,
        randomness: [u8; 32],
    ) -> Result<()> {
        fulfill_randomness_handler(ctx, randomness)
    }

    pub fn close_round(ctx: Context<CloseRound>) -> Result<()> {
        close_round_handler(ctx)
    }

    pub fn payout(ctx: Context<Payout>) -> Result<()> {
        payout_handler(ctx)
    }
}
