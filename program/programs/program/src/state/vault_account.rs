// #[account]
// pub struct VaultAccount {
//     pub bump: u8,
// }

use anchor_lang::prelude::*;

#[account]
pub struct VaultAccount {
    pub lottery: Pubkey,
    pub authority: Pubkey,
    pub total_deposits: u64,
    pub total_withdrawals: u64,
    pub bump: u8,
}

impl VaultAccount {
    pub const SPACE: usize = 8 + // discriminator
        32 + // lottery
        32 + // authority
        8 + // total_deposits
        8 + // total_withdrawals
        1; // bump

    pub fn deposit(&mut self, amount: u64) {
        self.total_deposits = self.total_deposits.saturating_add(amount);
    }

    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        require!(
            self.total_deposits >= self.total_withdrawals.saturating_add(amount),
            crate::LotteryError::InsufficientFunds
        );
        self.total_withdrawals = self.total_withdrawals.saturating_add(amount);
        Ok(())
    }

    pub fn available_balance(&self) -> u64 {
        self.total_deposits.saturating_sub(self.total_withdrawals)
    }
}