use anchor_lang::prelude::*;

declare_id!("EN3hAGsNiDrR8rnNriVaMc2sYPzZQjiRugeXESy4CKMz");

pub mod state;
pub mod instructions;
pub mod errors;

pub use instructions::initialize_lottery::*;
pub use instructions::start_round::*;
pub use instructions::buy_ticket::*;
pub use instructions::close_round::*;
pub use instructions::fulfill_randomness::*;
pub use instructions::payout::*;


#[program]
pub mod lucky_sol {
    use super::*;

     // Initialize Lottery instruction
    pub fn initialize_lottery(ctx: Context<InitializeLottery>, ticket_price: u64) -> Result<()> {
        handle(ctx, ticket_price)
    }

    // Start a new round
    pub fn start_round(ctx: Context<StartRound>) -> Result<()> {
        handle(ctx)
    }

    // Buy ticket
    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        handle(ctx)
    }

    // Close round
    pub fn close_round(ctx: Context<CloseRound>) -> Result<()> {
        handle(ctx)
    }

    // Fulfill randomness (from VRF / off-chain)
    pub fn fulfill_randomness(ctx: Context<FulfillRandomness>, random_number: u64) -> Result<()> {
        handle(ctx, random_number)
    }

    // Payout SOL to winner, platform, and admin
    pub fn payout(ctx: Context<Payout>) -> Result<()> {
        handle(ctx)
    }
}

