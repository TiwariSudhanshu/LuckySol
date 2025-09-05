use anchor_lang::prelude::*;

#[error_code]
pub enum LotteryError {
    #[msg("Invalid lottery ID")]
    InvalidLotteryId,
    
    #[msg("Lottery is not active")]
    LotteryNotActive,
    
    #[msg("Lottery is full")]
    LotteryFull,
    
    #[msg("Invalid lottery state")]
    InvalidLotteryState,
    
    #[msg("No tickets have been sold")]
    NoTicketsSold,
    
    #[msg("Randomness already fulfilled")]
    RandomnessAlreadyFulfilled,
    
    #[msg("Randomness not fulfilled")]
    RandomnessNotFulfilled,
    
    #[msg("No winner determined")]
    NoWinner,
    
    #[msg("Invalid winner ticket")]
    InvalidWinnerTicket,
    
    #[msg("Invalid payout calculation")]
    InvalidPayout,
}