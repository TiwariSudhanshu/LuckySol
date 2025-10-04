
import { useProgram } from "./useProgram";
import * as anchor from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, SendTransactionError, Connection, Transaction, ConfirmOptions } from "@solana/web3.js";

// Account sizes based on current struct definitions
// Lottery: 8 (discriminator) + 32 + 8 + 8 + 4 + 4 + 8 + 5 + 8 + 8 + 1 + 1 = 95 bytes
const LOTTERY_ACCOUNT_SIZE = 95;
const TICKET_ACCOUNT_SIZE = 85;

// Transaction retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const CONFIRM_TIMEOUT = 30000; // 30 seconds

// Helper function to sleep/wait
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a unique transaction ID for deduplication
const generateTransactionId = () => `${Date.now()}-${Math.random().toString(36).substring(2)}`;

// Store of recent transaction IDs to prevent duplicates
const recentTransactions = new Map<string, number>();

// Clean up old transaction IDs (older than 5 minutes)
const cleanupOldTransactions = () => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  for (const [id, timestamp] of recentTransactions.entries()) {
    if (timestamp < fiveMinutesAgo) {
      recentTransactions.delete(id);
    }
  }
};

// Enhanced transaction sending with retry logic and proper error handling
const sendTransactionWithRetry = async (
  connection: Connection,
  transaction: Transaction,
  wallet: AnchorWallet,
  transactionType: string = "transaction"
): Promise<string> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempting ${transactionType} (attempt ${attempt}/${MAX_RETRIES})`);
      
      // Get fresh blockhash for each attempt
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = wallet.publicKey;

      // Sign transaction
      const signedTx = await wallet.signTransaction(transaction);
      
      // Send transaction with proper options
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        maxRetries: 0, // We handle retries manually
        preflightCommitment: 'confirmed'
      });

      console.log(`${transactionType} sent with signature: ${signature}`);
      
      // Confirm transaction with timeout
      const confirmationPromise = connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction confirmation timeout')), CONFIRM_TIMEOUT);
      });

      await Promise.race([confirmationPromise, timeoutPromise]);
      
      console.log(`${transactionType} confirmed: ${signature}`);
      return signature;
      
    } catch (error: any) {
      lastError = error;
      
      // Handle SendTransactionError specifically as requested
      if (error instanceof SendTransactionError) {
        console.error(`SendTransactionError on attempt ${attempt}:`, error.message);
        
        // Get full logs as requested in the user prompt
        try {
          // SendTransactionError.getLogs() might require the connection parameter
          const logs = error.getLogs && typeof error.getLogs === 'function' 
            ? await error.getLogs(connection) 
            : null;
          console.error('Transaction logs:', logs || 'No logs available');
        } catch (logError) {
          console.error('Failed to get transaction logs:', logError);
        }
        
        // Check if it's a duplicate transaction error
        if (error.message.includes('already been processed') || error.message.includes('duplicate')) {
          console.log('Transaction already processed, might be a duplicate submission');
          // For duplicate transactions, we should not retry
          throw new Error('Transaction already processed - this may be a duplicate submission');
        }
        
        // Check if it's a recoverable error
        const recoverableErrors = [
          'blockhash not found',
          'transaction expired',
          'network error',
          'timeout',
          'insufficient funds'
        ];
        
        const isRecoverable = recoverableErrors.some(errType => 
          error.message.toLowerCase().includes(errType)
        );
        
        if (!isRecoverable) {
          console.error(`Non-recoverable SendTransactionError: ${error.message}`);
          break;
        }
      }
      
      console.error(`${transactionType} failed on attempt ${attempt}:`, error.message);
      
      // Don't retry on the last attempt
      if (attempt === MAX_RETRIES) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`Waiting ${delay}ms before retry...`);
      await sleep(delay);
    }
  }
  
  throw lastError || new Error(`${transactionType} failed after ${MAX_RETRIES} attempts`);
};

// ---- Manual parsing ----
// TypeScript type for the parsed Lottery account
interface ParsedLottery {
  id: string;
  authority: string;
  lotteryId: string;
  ticketPrice: string;
  maxTickets: number;
  ticketsSold: number;
  totalPrizePool: string;
  winner: number | null;
  createdAt: string;
  duration: string;
  randomnessFulfilled: boolean;
  bump: number;
  _manualParse: boolean;
}

/**
 * Parses a Lottery account from raw Solana account data
 * 
 * Rust struct layout:
 * - authority: Pubkey (32 bytes)
 * - lottery_id: u64 (8 bytes)
 * - ticket_price: u64 (8 bytes)
 * - max_tickets: u32 (4 bytes)
 * - tickets_sold: u32 (4 bytes)
 * - total_prize_pool: u64 (8 bytes)
 * - winner: Option<u32> (1 + 4 bytes)
 * - created_at: i64 (8 bytes)
 * - duration: i64 (8 bytes)
 * - randomness_fulfilled: bool (1 byte)
 * - bump: u8 (1 byte)
 * 
 * @param data Raw account data from Solana
 * @param pubkey PublicKey of the account
 * @returns Parsed lottery object
 */
const parseLotteryAccount = (data: Uint8Array, pubkey: PublicKey): ParsedLottery => {
  if (data.length < 87) { // Minimum expected size: 8 (discriminator) + 79 (struct) = 87
    throw new Error(`Invalid lottery account data size: ${data.length}, expected at least 87 bytes`);
  }

  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 8; // Skip 8-byte Anchor discriminator
  
  try {
    // Parse authority (Pubkey - 32 bytes)
    const authority = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;

    // Parse lottery_id (u64 - 8 bytes)
    const lotteryId = dv.getBigUint64(offset, true); // little-endian
    offset += 8;

    // Parse ticket_price (u64 - 8 bytes)
    const ticketPrice = dv.getBigUint64(offset, true);
    offset += 8;

    // Parse max_tickets (u32 - 4 bytes)
    const maxTickets = dv.getUint32(offset, true);
    offset += 4;

    // Parse tickets_sold (u32 - 4 bytes)
    const ticketsSold = dv.getUint32(offset, true);
    offset += 4;

    // Parse total_prize_pool (u64 - 8 bytes)
    const totalPrizePool = dv.getBigUint64(offset, true);
    offset += 8;

    // Parse winner (Option<u32> - 1 + 4 bytes)
    // Option<T> in Rust is serialized as: 0x00 for None, 0x01 + T for Some(T)
    const hasWinner = data[offset] === 1;
    offset += 1;
    let winner: number | null = null;
    if (hasWinner) {
      winner = dv.getUint32(offset, true);
    }
    offset += 4; // Always advance 4 bytes for u32, regardless of Option state

    // Parse created_at (i64 - 8 bytes)
    const createdAt = dv.getBigInt64(offset, true);
    offset += 8;

    // Parse duration (i64 - 8 bytes)
    const duration = dv.getBigInt64(offset, true);
    offset += 8;

    // Parse randomness_fulfilled (bool - 1 byte)
    const randomnessFulfilled = data[offset] === 1;
    offset += 1;

    // Parse bump (u8 - 1 byte)
    const bump = data[offset];
    offset += 1;

    console.log(`Parsed lottery: ID=${lotteryId}, tickets=${ticketsSold}/${maxTickets}, winner=${winner}, fulfilled=${randomnessFulfilled}`);

    return {
      id: pubkey.toBase58(),
      authority: authority.toBase58(),
      lotteryId: lotteryId.toString(),
      ticketPrice: ticketPrice.toString(),
      maxTickets,
      ticketsSold,
      totalPrizePool: totalPrizePool.toString(),
      winner,
      createdAt: createdAt.toString(),
      duration: duration.toString(),
      randomnessFulfilled,
      bump,
      _manualParse: true,
    };
  } catch (error) {
    console.error('Error parsing lottery account:', error);
    console.error('Account data length:', data.length);
    console.error('Current offset:', offset);
    throw new Error(`Failed to parse lottery account ${pubkey.toBase58()}: ${error}`);
  }
};

const parseTicketAccount = (data: Uint8Array, pubkey: PublicKey) => {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 8; // discriminator

  const lottery = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const player = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const ticketNumber = dv.getUint32(offset, true);
  offset += 4;

  const purchasedAt = dv.getBigInt64(offset, true);
  offset += 8;

  const bump = data[offset];

  return {
    id: pubkey.toBase58(),
    lottery: lottery.toBase58(),
    player: player.toBase58(),
    ticketNumber,
    purchasedAt: purchasedAt.toString(),
    bump,
    _manualParse: true,
  };
};

// ---- Fetch all lotteries ----
export const getAllLotteries = async (program: anchor.Program) => {
  if (!program) {
    console.warn('Program not available for getAllLotteries');
    return [];
  }

  console.log('Fetching all lotteries...');
  
  try {
    // Use manual account fetching as primary method due to IDL parsing issues
    const accounts = await program.provider.connection.getProgramAccounts(
      program.programId, 
      {
        filters: [{ dataSize: LOTTERY_ACCOUNT_SIZE }],
        commitment: 'confirmed'
      }
    );
    
    console.log(`Found ${accounts.length} lottery accounts via manual fetch`);
    
    const parsedLotteries = accounts.map(acc => {
      try {
        return parseLotteryAccount(acc.account.data, acc.pubkey);
      } catch (parseError) {
        console.error('Error parsing lottery account:', acc.pubkey.toString(), parseError);
        return null;
      }
    }).filter(Boolean);
    
    console.log(`Successfully parsed ${parsedLotteries.length} lotteries`);
    return parsedLotteries;
    
  } catch (error) {
    console.error('Failed to fetch lotteries:', error);
    
    // Fallback: try Anchor method as last resort
    try {
      console.log('Trying Anchor fetch as fallback...');
      const lotteries = await (program.account as any).lottery.all([], 'confirmed');
      console.log(`Found ${lotteries.length} lotteries via Anchor fallback`);
      
      return lotteries.map((l: any) => ({
        id: l.publicKey.toBase58(),
        ...l.account,
      }));
    } catch (anchorError) {
      console.error('Both manual and Anchor fetch failed:', anchorError);
      return [];
    }
  }
};

// ---- Fetch lotteries created by wallet ----
export const getCreatedLotteries = async (program: anchor.Program, wallet: AnchorWallet) => {
  if (!program || !wallet) {
    console.warn('Program or wallet not available for getCreatedLotteries');
    return [];
  }

  console.log(`Fetching lotteries created by: ${wallet.publicKey.toBase58()}`);
  
  try {
    // Use manual account fetching as primary method due to IDL parsing issues
    const accounts = await program.provider.connection.getProgramAccounts(
      program.programId, 
      {
        filters: [
          { dataSize: LOTTERY_ACCOUNT_SIZE },
          { memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } },
        ],
        commitment: 'confirmed'
      }
    );
    
    console.log(`Found ${accounts.length} created lottery accounts via manual fetch`);
    
    const parsedLotteries = accounts.map(acc => {
      try {
        return parseLotteryAccount(acc.account.data, acc.pubkey);
      } catch (parseError) {
        console.error('Error parsing created lottery account:', acc.pubkey.toString(), parseError);
        return null;
      }
    }).filter(Boolean);
    
    console.log(`Successfully parsed ${parsedLotteries.length} created lotteries`);
    return parsedLotteries;
    
  } catch (error) {
    console.error('Failed to fetch created lotteries:', error);
    
    // Fallback: try Anchor method as last resort
    try {
      console.log('Trying Anchor fetch for created lotteries as fallback...');
      const lotteries = await (program.account as any).lottery.all([
        {
          memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() },
        },
      ], 'confirmed');
      
      console.log(`Found ${lotteries.length} created lotteries via Anchor fallback`);
      
      return lotteries.map((l: any) => ({
        id: l.publicKey.toBase58(),
        ...l.account,
      }));
    } catch (anchorError) {
      console.error('Both manual and Anchor fetch failed for created lotteries:', anchorError);
      return [];
    }
  }
};

// ---- Fetch tickets by wallet ----
export const getMyTickets = async (program: anchor.Program, wallet: AnchorWallet) => {
  if (!program || !wallet) {
    console.warn('Program or wallet not available for getMyTickets');
    return [];
  }

  console.log(`Fetching tickets for: ${wallet.publicKey.toBase58()}`);
  
  try {
    // Use manual account fetching as primary method due to IDL parsing issues
    const accounts = await program.provider.connection.getProgramAccounts(
      program.programId, 
      {
        filters: [
          { dataSize: TICKET_ACCOUNT_SIZE },
          { memcmp: { offset: 40, bytes: wallet.publicKey.toBase58() } },
        ],
        commitment: 'confirmed'
      }
    );
    
    console.log(`Found ${accounts.length} ticket accounts via manual fetch`);
    
    const parsedTickets = accounts.map(acc => {
      try {
        return parseTicketAccount(acc.account.data, acc.pubkey);
      } catch (parseError) {
        console.error('Error parsing ticket account:', acc.pubkey.toString(), parseError);
        return null;
      }
    }).filter(Boolean);
    
    console.log(`Successfully parsed ${parsedTickets.length} tickets`);
    return parsedTickets;
    
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    
    // Fallback: try Anchor method as last resort
    try {
      console.log('Trying Anchor fetch for tickets as fallback...');
      const tickets = await (program.account as any).ticket.all([
        {
          memcmp: { offset: 40, bytes: wallet.publicKey.toBase58() },
        },
      ], 'confirmed');
      
      console.log(`Found ${tickets.length} tickets via Anchor fallback`);
      
      return tickets.map((t: any) => ({
        id: t.publicKey.toBase58(),
        ...t.account,
      }));
    } catch (anchorError) {
      console.error('Both manual and Anchor fetch failed for tickets:', anchorError);
      return [];
    }
  }
};

// ---- Fetch lottery by PDA ----
export const getLotteryByPda = async (program: anchor.Program, lotteryPda: PublicKey) => {
  try {
    // Use manual parsing as primary method due to IDL parsing issues
    const info = await program.provider.connection.getAccountInfo(lotteryPda, 'confirmed');
    if (!info) {
      console.log(`Lottery account not found: ${lotteryPda.toString()}`);
      return null;
    }
    
    return parseLotteryAccount(info.data, lotteryPda);
  } catch (error) {
    console.warn(`Failed to fetch lottery ${lotteryPda.toString()} via manual parsing:`, error);
    
    // Fallback to Anchor method
    try {
      return await (program.account as any).lottery.fetch(lotteryPda);
    } catch (anchorError) {
      console.error(`Both manual and Anchor fetch failed for lottery ${lotteryPda.toString()}:`, anchorError);
      return null;
    }
  }
};

// ---- Create lottery ----
export const createLottery = async (
  lotteryId: number,
  ticketPriceSol: number,
  maxTickets: number,
  duration: number,
  program: anchor.Program,
  wallet: AnchorWallet
) => {
  if (!program || !wallet) {
    throw new Error("Program or wallet not available");
  }

  // Clean up old transactions
  cleanupOldTransactions();

  // Generate transaction ID for deduplication
  const transactionId = `create-lottery-${lotteryId}-${wallet.publicKey.toString()}`;
  const now = Date.now();
  
  // Check for recent duplicate transactions
  if (recentTransactions.has(transactionId)) {
    const lastTime = recentTransactions.get(transactionId)!;
    if (now - lastTime < 10000) { // 10 seconds
      throw new Error("Duplicate lottery creation attempt detected. Please wait before trying again.");
    }
  }
  
  // Mark this transaction as in progress
  recentTransactions.set(transactionId, now);

  try {
    const ticketPriceLamports = new anchor.BN(ticketPriceSol * LAMPORTS_PER_SOL);
    const [lotteryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("lottery"), new anchor.BN(lotteryId).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Check if lottery already exists
    try {
      const existingLottery = await program.provider.connection.getAccountInfo(lotteryPda);
      if (existingLottery) {
        throw new Error(`Lottery with ID ${lotteryId} already exists`);
      }
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        console.warn('Could not check existing lottery:', error.message);
      } else {
        throw error;
      }
    }

    const tx = await program.methods
      .initializeLottery(new anchor.BN(lotteryId), ticketPriceLamports, new anchor.BN(maxTickets), new anchor.BN(duration))
      .accounts({
        lottery: lotteryPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const signature = await sendTransactionWithRetry(
      program.provider.connection,
      tx,
      wallet,
      `Create Lottery #${lotteryId}`
    );

    console.log(`Lottery #${lotteryId} created successfully with signature: ${signature}`);
    return signature;
    
  } catch (error: any) {
    // Remove transaction from recent transactions on error
    recentTransactions.delete(transactionId);
    
    // Re-throw with more context
    throw new Error(`Failed to create lottery: ${error.message}`);
  }
};

// ---- Buy ticket ----
export const buyTicket = async (
  program: anchor.Program,
  lotteryPdaString: string,
  wallet: AnchorWallet
) => {
  if (!program || !wallet) {
    throw new Error("Program or wallet not available");
  }

  // Clean up old transactions
  cleanupOldTransactions();

  const lotteryPda = new PublicKey(lotteryPdaString);
  
  // Generate transaction ID for deduplication
  const transactionId = `buy-ticket-${lotteryPdaString}-${wallet.publicKey.toString()}`;
  const now = Date.now();
  
  // Check for recent duplicate transactions
  if (recentTransactions.has(transactionId)) {
    const lastTime = recentTransactions.get(transactionId)!;
    if (now - lastTime < 5000) { // 5 seconds for ticket purchases
      throw new Error("Duplicate ticket purchase attempt detected. Please wait before trying again.");
    }
  }
  
  // Mark this transaction as in progress
  recentTransactions.set(transactionId, now);

  try {
    let lotteryAccount: any;

    try {
      lotteryAccount = await (program.account as any).lottery.fetch(lotteryPda);
    } catch {
      const info = await program.provider.connection.getAccountInfo(lotteryPda);
      if (!info) throw new Error("Lottery account not found");
      lotteryAccount = parseLotteryAccount(info.data, lotteryPda);
    }

    const lotteryId = parseInt(lotteryAccount.lotteryId);

    // Ticket price in lamports
    const ticketPriceLamports = BigInt(lotteryAccount.ticketPrice);

    // Check wallet balance with some buffer for transaction fees
    const balance = BigInt(await program.provider.connection.getBalance(wallet.publicKey));
    const requiredBalance = ticketPriceLamports + BigInt(0.01 * LAMPORTS_PER_SOL); // Add 0.01 SOL buffer for fees
    
    if (balance < requiredBalance) {
      throw new Error(
        `Insufficient SOL! Your balance is ${(Number(balance) / LAMPORTS_PER_SOL).toFixed(3)} SOL, but you need at least ${(Number(requiredBalance) / LAMPORTS_PER_SOL).toFixed(3)} SOL (ticket + fees)`
      );
    }

    // Check if lottery is still accepting tickets
    if (lotteryAccount.ticketsSold >= lotteryAccount.maxTickets) {
      throw new Error("This lottery is sold out");
    }
 
    

    const [ticketPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("ticket"),
        lotteryPda.toBuffer(),
        new anchor.BN(lotteryAccount.ticketsSold).toArrayLike(Buffer, "le", 4),
      ],
      program.programId
    );

    // Check if ticket already exists (shouldn't happen, but safety check)
    try {
      const existingTicket = await program.provider.connection.getAccountInfo(ticketPda);
      if (existingTicket) {
        throw new Error("Ticket PDA already exists - this may be a duplicate transaction");
      }
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        console.warn('Could not check existing ticket:', error.message);
      } else {
        throw error;
      }
    }

    // Build transaction
    const tx = await program.methods.buyTicket(new anchor.BN(lotteryId))
      .accounts({
        player: wallet.publicKey,
        lottery: lotteryPda,
        ticket: ticketPda,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const signature = await sendTransactionWithRetry(
      program.provider.connection,
      tx,
      wallet,
      `Buy Ticket for Lottery #${lotteryId}`
    );

    console.log(`Ticket purchased successfully for Lottery #${lotteryId} with signature: ${signature}`);
    return signature;
    
  } catch (error: any) {
    // Remove transaction from recent transactions on error
    recentTransactions.delete(transactionId);
    
    // Re-throw with more context
    throw new Error(`Failed to buy ticket: ${error.message}`);
  }
};


// ---- Fulfill randomness ----
export const fulfillRandomness = async (
  program: anchor.Program,
  lotteryPda: PublicKey,
  wallet: AnchorWallet,
  randomness: number[]
) => {
  if (!program || !wallet) {
    throw new Error("Program or wallet not available");
  }

  const randomnessArray = randomness.slice(0, 32).concat(Array(32 - randomness.length).fill(0));

  const tx = await program.methods.fulfillRandomness(randomnessArray)
    .accounts({
      authority: wallet.publicKey,
      lottery: lotteryPda,
    })
    .transaction();

  const signature = await sendTransactionWithRetry(
    program.provider.connection,
    tx,
    wallet,
    `Fulfill Randomness for Lottery ${lotteryPda.toString()}`
  );

  return signature;
};

// ---- Payout winner ----
export const payoutWinner = async (
  program: anchor.Program,
  lotteryPda: PublicKey,
  wallet: AnchorWallet,
  winnerTicketPda: PublicKey,
  winner: PublicKey,
  lotteryCreator: PublicKey,
  platformFeeAccount: PublicKey
) => {
  if (!program || !wallet) {
    throw new Error("Program or wallet not available");
  }

  const tx = await program.methods.payout()
    .accounts({
      authority: wallet.publicKey,
      lottery: lotteryPda,
      winnerTicket: winnerTicketPda,
      winner,
      lotteryCreator,
      platformFeeAccount,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const signature = await sendTransactionWithRetry(
    program.provider.connection,
    tx,
    wallet,
    `Payout Winner for Lottery ${lotteryPda.toString()}`
  );

  return signature;
};
