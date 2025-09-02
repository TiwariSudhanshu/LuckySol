use anchor_lang::prelude::*;

#[error_code]
pub enum LotteryError {
    #[msg("Lottery is not active")]
    LotteryNotActive,
    #[msg("Lottery is full")]
    LotteryFull,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Round not started")]
    RoundNotStarted,
    #[msg("Round already started")]
    RoundAlreadyStarted,
    #[msg("Round not finished")]
    RoundNotFinished,
    #[msg("No winner found")]
    NoWinner,
    #[msg("Invalid randomness")]
    InvalidRandomness,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid ticket count")]
    InvalidTicketCount,
    #[msg("Payout already claimed")]
    PayoutAlreadyClaimed,
}