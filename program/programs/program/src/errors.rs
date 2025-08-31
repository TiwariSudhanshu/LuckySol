use anchor_lang::prelude::*;

#[error_code]
pub enum LotteryError{
     #[msg("The round is already closed, you cannot buy tickets.")]
    RoundClosed,  

    #[msg("The round is not closed yet, cannot fulfill randomness.")]
    RoundNotClosed,  

    #[msg("There are no tickets in this round.")]
    NoTickets,  

    #[msg("No winner has been determined yet.")]
    NoWinner,  

    #[msg("You are not authorized to perform this action.")]
    Unauthorized,  

    #[msg("Overflow occurred during calculation.")]
    OverflowError,
}