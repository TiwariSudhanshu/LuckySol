use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("EN3hAGsNiDrR8rnNriVaMc2sYPzZQjiRugeXESy4CKMz");

#[program]
pub mod lottery {
    use super::*;

    pub fn initialize_lottery(
        ctx: Context<InitializeLottery>,
        lottery_id: u64,
        ticket_price: u64,
        max_tickets: u32,
    ) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        let clock = Clock::get()?;

        lottery.authority = ctx.accounts.authority.key();
        lottery.lottery_id = lottery_id;
        lottery.ticket_price = ticket_price;
        lottery.max_tickets = max_tickets;
        lottery.tickets_sold = 0;
        lottery.total_prize_pool = 0;
        lottery.state = LotteryState::WaitingForTickets;
        lottery.winner = None;
        lottery.created_at = clock.unix_timestamp;
        lottery.randomness_fulfilled = false;
        lottery.bump = ctx.bumps.lottery;

        msg!("Lottery initialized with ID: {}, ticket price: {}, max tickets: {}", 
             lottery_id, ticket_price, max_tickets);

        Ok(())
    }

    pub fn buy_ticket(
        ctx: Context<BuyTicket>,
        lottery_id: u64,
    ) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        let player = &ctx.accounts.player;
        let ticket = &mut ctx.accounts.ticket;

        require!(lottery.lottery_id == lottery_id, LotteryError::InvalidLotteryId);
        require!(lottery.state == LotteryState::WaitingForTickets, LotteryError::LotteryNotActive);
        require!(lottery.tickets_sold < lottery.max_tickets, LotteryError::LotteryFull);

        // Transfer ticket price from player to lottery account
        let transfer_instruction = system_program::Transfer {
            from: player.to_account_info(),
            to: lottery.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        );
        
        system_program::transfer(cpi_ctx, lottery.ticket_price)?;

        // Initialize ticket
        ticket.lottery = lottery.key();
        ticket.player = player.key();
        ticket.ticket_number = lottery.tickets_sold;
        ticket.purchased_at = Clock::get()?.unix_timestamp;
        ticket.bump = ctx.bumps.ticket;

        // Update lottery state
        lottery.tickets_sold += 1;
        lottery.total_prize_pool += lottery.ticket_price;

        msg!("Ticket {} purchased by {} for lottery {}", 
             ticket.ticket_number, player.key(), lottery_id);

        Ok(())
    }

    pub fn start_round(ctx: Context<StartRound>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;

        require!(lottery.state == LotteryState::WaitingForTickets, LotteryError::InvalidLotteryState);
        require!(lottery.tickets_sold > 0, LotteryError::NoTicketsSold);

        lottery.state = LotteryState::WaitingForRandomness;

        msg!("Lottery round started with {} tickets sold", lottery.tickets_sold);

        Ok(())
    }

    pub fn fulfill_randomness(
        ctx: Context<FulfillRandomness>,
        randomness: [u8; 32],
    ) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;

        require!(lottery.state == LotteryState::WaitingForRandomness, LotteryError::InvalidLotteryState);
        require!(!lottery.randomness_fulfilled, LotteryError::RandomnessAlreadyFulfilled);

        // Convert randomness to winning ticket number
        let random_number = u64::from_le_bytes([
            randomness[0], randomness[1], randomness[2], randomness[3],
            randomness[4], randomness[5], randomness[6], randomness[7],
        ]);
        
        let winning_ticket_number = (random_number % lottery.tickets_sold as u64) as u32;

        lottery.winner = Some(winning_ticket_number);
        lottery.randomness_fulfilled = true;
        lottery.state = LotteryState::WaitingForPayout;

        msg!("Randomness fulfilled. Winning ticket number: {}", winning_ticket_number);

        Ok(())
    }

    pub fn close_round(ctx: Context<CloseRound>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;

        require!(lottery.state == LotteryState::WaitingForPayout, LotteryError::InvalidLotteryState);
        require!(lottery.randomness_fulfilled, LotteryError::RandomnessNotFulfilled);

        lottery.state = LotteryState::Closed;

        msg!("Lottery round closed. Ready for payout.");

        Ok(())
    }

    pub fn payout(ctx: Context<Payout>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        let winner_ticket = &ctx.accounts.winner_ticket;

        require!(lottery.state == LotteryState::Closed, LotteryError::InvalidLotteryState);
        require!(lottery.winner.is_some(), LotteryError::NoWinner);
        require!(
            winner_ticket.ticket_number == lottery.winner.unwrap(), 
            LotteryError::InvalidWinnerTicket
        );

        let prize_amount = lottery.total_prize_pool;
        
        // Transfer prize to winner
        **lottery.to_account_info().try_borrow_mut_lamports()? -= prize_amount;
        **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += prize_amount;

        lottery.state = LotteryState::PaidOut;
        lottery.total_prize_pool = 0;

        msg!("Payout completed. Winner {} received {} lamports", 
             ctx.accounts.winner.key(), prize_amount);

        Ok(())
    }
}

// State structs
#[account]
pub struct Lottery {
    pub authority: Pubkey,
    pub lottery_id: u64,
    pub ticket_price: u64,
    pub max_tickets: u32,
    pub tickets_sold: u32,
    pub total_prize_pool: u64,
    pub state: LotteryState,
    pub winner: Option<u32>,
    pub created_at: i64,
    pub randomness_fulfilled: bool,
    pub bump: u8,
}

impl Space for Lottery {
    const INIT_SPACE: usize = 8 + // discriminator
        32 + // authority
        8 +  // lottery_id
        8 +  // ticket_price
        4 +  // max_tickets
        4 +  // tickets_sold
        8 +  // total_prize_pool
        1 +  // state
        1 + 4 + // winner (Option<u32>)
        8 +  // created_at
        1 +  // randomness_fulfilled
        1;   // bump
}

#[account]
pub struct Ticket {
    pub lottery: Pubkey,
    pub player: Pubkey,
    pub ticket_number: u32,
    pub purchased_at: i64,
    pub bump: u8,
}

impl Space for Ticket {
    const INIT_SPACE: usize = 8 + // discriminator
        32 + // lottery
        32 + // player
        4 +  // ticket_number
        8 +  // purchased_at
        1;   // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum LotteryState {
    WaitingForTickets,
    WaitingForRandomness,
    WaitingForPayout,
    Closed,
    PaidOut,
}

// Context structs
#[derive(Accounts)]
#[instruction(lottery_id: u64)]
pub struct InitializeLottery<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = Lottery::INIT_SPACE,
        seeds = [b"lottery", lottery_id.to_le_bytes().as_ref()],
        bump
    )]
    pub lottery: Account<'info, Lottery>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(lottery_id: u64)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"lottery", lottery_id.to_le_bytes().as_ref()],
        bump = lottery.bump
    )]
    pub lottery: Account<'info, Lottery>,
    
    #[account(
        init,
        payer = player,
        space = Ticket::INIT_SPACE,
        seeds = [b"ticket", lottery.key().as_ref(), lottery.tickets_sold.to_le_bytes().as_ref()],
        bump
    )]
    pub ticket: Account<'info, Ticket>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StartRound<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority,
        constraint = lottery.state == LotteryState::WaitingForTickets
    )]
    pub lottery: Account<'info, Lottery>,
}

#[derive(Accounts)]
pub struct FulfillRandomness<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority,
        constraint = lottery.state == LotteryState::WaitingForRandomness
    )]
    pub lottery: Account<'info, Lottery>,
}

#[derive(Accounts)]
pub struct CloseRound<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority,
        constraint = lottery.state == LotteryState::WaitingForPayout
    )]
    pub lottery: Account<'info, Lottery>,
}

#[derive(Accounts)]
pub struct Payout<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority,
        constraint = lottery.state == LotteryState::Closed
    )]
    pub lottery: Account<'info, Lottery>,
    
    #[account(
        constraint = winner_ticket.lottery == lottery.key(),
        constraint = winner_ticket.ticket_number == lottery.winner.unwrap()
    )]
    pub winner_ticket: Account<'info, Ticket>,
    
    /// CHECK: This is the winner's account that will receive the payout
    #[account(
        mut,
        constraint = winner.key() == winner_ticket.player
    )]
    pub winner: AccountInfo<'info>,
}

// Error definitions
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
}