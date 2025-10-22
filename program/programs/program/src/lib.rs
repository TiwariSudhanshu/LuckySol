use anchor_lang::prelude::*;
pub const PLATFORM_FEE_WALLET: Pubkey = pubkey!("CEYaRYc7QdEjEoojtHBS8YT8KfhUhfEaVPgdS8RcbSYF");

pub mod instructions;
pub mod state;
pub mod contexts;
pub mod errors;

use instructions::*;
use contexts::*;

declare_id!("3vUR35rbkJ4Wp6fMags3Scy6MLkyGmH99JpJWFYbPowQ");

#[program]
pub mod lottery {
    use super::*;

    pub fn initialize_lottery(
        ctx: Context<InitializeLottery>,
        lottery_id: u64,
        ticket_price: u64,
        max_tickets: u32,
        duration: u64, 
    ) -> Result<()> {
        initialize_lottery_handler(ctx, lottery_id, ticket_price, max_tickets, duration)
    }

    pub fn buy_ticket(
        ctx: Context<BuyTicket>,
        lottery_id: u64,
    ) -> Result<()> {
        buy_ticket_handler(ctx, lottery_id)
    }

    pub fn fulfill_randomness(
        ctx: Context<FulfillRandomness>,
        randomness: [u8; 32],
    ) -> Result<()> {
        fulfill_randomness_handler(ctx, randomness)
    }

    pub fn payout(ctx: Context<Payout>) -> Result<()> {
        payout_handler(ctx)
    }
}
