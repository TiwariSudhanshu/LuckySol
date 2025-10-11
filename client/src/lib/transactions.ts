import { useProgram } from "./useProgram";
import * as anchor from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, SendTransactionError, Connection, Transaction, ConfirmOptions } from "@solana/web3.js";

// Account sizes based on current struct definitions
// Layout (bytes): 8 discriminator + 32 authority + 8 lottery_id + 8 ticket_price + 4 max_tickets
// + 4 tickets_sold + 8 total_prize_pool + 1 option + 4 winner + 8 created_at + 8 duration
// + 1 randomness_fulfilled + 1 bump = 87 (+ padding if any). Use 95 original to be safe.
const LOTTERY_ACCOUNT_SIZE = 95;
const TICKET_ACCOUNT_SIZE = 85;

// Transaction retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const CONFIRM_TIMEOUT = 30000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateTransactionId = () => `${Date.now()}-${Math.random().toString(36).substring(2)}`;
const recentTransactions = new Map<string, number>();

const cleanupOldTransactions = () => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  for (const [id, timestamp] of recentTransactions.entries()) {
    if (timestamp < fiveMinutesAgo) {
      recentTransactions.delete(id);
    }
  }
};

export const formatDuration = (seconds: number | string | null | undefined): string => {

  console.log("Formatting duration:", seconds);
  if (seconds === null || seconds === undefined) {
    return "N/A";
  }

  const totalSeconds = typeof seconds === 'string' ? parseInt(seconds) : seconds;
  
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return "N/A";
  }

  if (totalSeconds === 0) {
    return "0s";
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0 || remainingSeconds > 0) {
    parts.push(`${remainingSeconds}s`);
  }
  console.log("Formatted duration parts:", parts);
  return parts.join(" ");
};

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
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = wallet.publicKey;

      const signedTx = await wallet.signTransaction(transaction);
      
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        maxRetries: 0,
        preflightCommitment: 'confirmed'
      });

      console.log(`${transactionType} sent with signature: ${signature}`);
      
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
      
      if (error instanceof SendTransactionError) {
        console.error(`SendTransactionError on attempt ${attempt}:`, error.message);
        
        try {
          const logs = error.getLogs && typeof error.getLogs === 'function' 
            ? await error.getLogs(connection) 
            : null;
          console.error('Transaction logs:', logs || 'No logs available');
        } catch (logError) {
          console.error('Failed to get transaction logs:', logError);
        }
        
        if (error.message.includes('already been processed') || error.message.includes('duplicate')) {
          console.log('Transaction already processed, might be a duplicate submission');
          throw new Error('Transaction already processed - this may be a duplicate submission');
        }
        
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
      
      if (attempt === MAX_RETRIES) {
        break;
      }
      
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`Waiting ${delay}ms before retry...`);
      await sleep(delay);
    }
  }
  
  throw lastError || new Error(`${transactionType} failed after ${MAX_RETRIES} attempts`);
};

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
  _manualParse?: boolean;
}

/**
 * FIXED: Parses duration correctly by treating it as u64 instead of i64
 */
const parseLotteryAccount = (data: Uint8Array, pubkey: PublicKey): ParsedLottery => {
  if (data.length < 87) {
    throw new Error(`Invalid lottery account data size: ${data.length}, expected at least 87 bytes`);
  }

  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 8; // Skip 8-byte Anchor discriminator
  
  try {
    console.log('Parsing lottery account:', pubkey.toBase58());
    console.log('Data length:', data.length);

    // Parse authority (Pubkey - 32 bytes)
    const authority = new PublicKey(data.slice(offset, offset + 32));
    console.log('Authority parsed at offset', offset, authority.toBase58());
    offset += 32;

    // Parse lottery_id (u64 - 8 bytes)
    const lotteryId = dv.getBigUint64(offset, true);
    console.log('Lottery ID parsed at offset', offset, lotteryId.toString());
    offset += 8;

    // Parse ticket_price (u64 - 8 bytes)
    const ticketPrice = dv.getBigUint64(offset, true);
    console.log('Ticket price parsed at offset', offset, ticketPrice.toString());
    offset += 8;

    // Parse max_tickets (u32 - 4 bytes)
    const maxTickets = dv.getUint32(offset, true);
    console.log('Max tickets parsed at offset', offset, maxTickets);
    offset += 4;

    // Parse tickets_sold (u32 - 4 bytes)
    const ticketsSold = dv.getUint32(offset, true);
    console.log('Tickets sold parsed at offset', offset, ticketsSold);
    offset += 4;

    // Parse total_prize_pool (u64 - 8 bytes)
    const totalPrizePool = dv.getBigUint64(offset, true);
    console.log('Total prize pool parsed at offset', offset, totalPrizePool.toString());
    offset += 8;

    // Parse winner (Option<u32> - 1 + 4 bytes)
    const hasWinner = data[offset] === 1;
    console.log('Winner flag at offset', offset, hasWinner);
    offset += 1;
    let winner: number | null = null;
    if (hasWinner) {
      winner = dv.getUint32(offset, true);
      console.log('Winner ID parsed at offset', offset, winner);
    }
    offset += 4;

    // Parse created_at (i64 - 8 bytes)
    const expectedCreatedAtOffset = 77; 
    if (offset !== expectedCreatedAtOffset) {
      console.warn(`Expected created_at offset ${expectedCreatedAtOffset} but found ${offset}. Parsing may be misaligned.`);
    }
    const createdAt = dv.getBigInt64(offset, true);
    console.log('Created_at parsed at offset', offset, createdAt.toString());
    offset += 8;

    // Parse duration (u64 - 8 bytes)
    const durationOffset = offset;
    const durationUnsigned = dv.getBigUint64(offset, true);
    console.log('Raw duration bytes at offset', durationOffset, data.slice(durationOffset, durationOffset + 8));
    console.log('Parsed duration (u64) at offset', durationOffset, durationUnsigned.toString());
    offset += 8;

    const TEN_YEARS_IN_SECONDS = BigInt(10 * 365 * 24 * 60 * 60);
    const durationValue = durationUnsigned;
    if (durationValue > TEN_YEARS_IN_SECONDS) {
      console.warn(`Suspicious duration value (unsigned): ${durationValue}. Check raw bytes above.`);
    }

    // Parse randomness_fulfilled (bool - 1 byte)
    const randomnessFulfilled = data[offset] === 1;
    console.log('Randomness fulfilled at offset', offset, randomnessFulfilled);
    offset += 1;

    // Parse bump (u8 - 1 byte)
    const bump = data[offset];
    console.log('Bump parsed at offset', offset, bump);
    offset += 1;

    console.log(`Successfully parsed lottery ID=${lotteryId}, duration=${durationValue}s, tickets=${ticketsSold}/${maxTickets}`);

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
      duration: durationValue.toString(),
      randomnessFulfilled,
      bump,
      _manualParse: true,
    };
  } catch (error) {
    console.error('Error parsing lottery account:', error);
    console.error('Account data length:', data.length);
    console.error('Current offset:', offset);
    console.error('Raw data slice near duration:', data.slice(offset - 8, offset + 8));
    throw new Error(`Failed to parse lottery account ${pubkey.toBase58()}: ${error}`);
  }
};

const parseTicketAccount = (data: Uint8Array, pubkey: PublicKey) => {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 8;

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

export const getAllLotteries = async (program: anchor.Program) => {
  if (!program) {
    console.warn('Program not available for getAllLotteries');
    return [];
  }

  console.log('Fetching all lotteries...');
  
  try {
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

export const getCreatedLotteries = async (program: anchor.Program, wallet: AnchorWallet) => {
  if (!program || !wallet) {
    console.warn('Program or wallet not available for getCreatedLotteries');
    return [];
  }

  console.log(`Fetching lotteries created by: ${wallet.publicKey.toBase58()}`);
  
  try {
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

export const getMyTickets = async (program: anchor.Program, wallet: AnchorWallet) => {
  if (!program || !wallet) {
    console.warn('Program or wallet not available for getMyTickets');
    return [];
  }

  console.log(`Fetching tickets for: ${wallet.publicKey.toBase58()}`);
  
  try {
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

export const getLotteryByPda = async (program: anchor.Program, lotteryPda: PublicKey) => {
  try {
    const info = await program.provider.connection.getAccountInfo(lotteryPda, 'confirmed');
    if (!info) {
      console.log(`Lottery account not found: ${lotteryPda.toString()}`);
      return null;
    }
    
    return parseLotteryAccount(info.data, lotteryPda);
  } catch (error) {
    console.warn(`Failed to fetch lottery ${lotteryPda.toString()} via manual parsing:`, error);
    
    try {
      return await (program.account as any).lottery.fetch(lotteryPda);
    } catch (anchorError) {
      console.error(`Both manual and Anchor fetch failed for lottery ${lotteryPda.toString()}:`, anchorError);
      return null;
    }
  }
};

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

  cleanupOldTransactions();

  const transactionId = `create-lottery-${lotteryId}-${wallet.publicKey.toString()}`;
  const now = Date.now();
  
  if (recentTransactions.has(transactionId)) {
    const lastTime = recentTransactions.get(transactionId)!;
    if (now - lastTime < 10000) {
      throw new Error("Duplicate lottery creation attempt detected. Please wait before trying again.");
    }
  }
  
  recentTransactions.set(transactionId, now);

  try {
    const ticketPriceLamports = new anchor.BN(ticketPriceSol * LAMPORTS_PER_SOL);
    const [lotteryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("lottery"), new anchor.BN(lotteryId).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

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

    console.log(`Creating lottery with duration: ${duration} seconds`);

    const tx = await program.methods
      .initializeLottery(
        new anchor.BN(lotteryId), 
        ticketPriceLamports, 
        new anchor.BN(maxTickets), 
        new anchor.BN(duration) // Duration is sent correctly as seconds
      )
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
    
    recentTransactions.delete(transactionId);
    
    return signature;
    
  } catch (error: any) {
    recentTransactions.delete(transactionId);
    throw new Error(`Failed to create lottery: ${error.message}`);
  }
};

export const buyTicket = async (
  program: anchor.Program,
  lotteryPdaString: string,
  wallet: AnchorWallet
) => {
  if (!program || !wallet) {
    throw new Error("Program or wallet not available");
  }

  cleanupOldTransactions();

  const lotteryPda = new PublicKey(lotteryPdaString);
  
  const transactionId = `buy-ticket-${lotteryPdaString}-${wallet.publicKey.toString()}-${Math.floor(Date.now() / 1000)}`;
  const now = Date.now();
  
  if (recentTransactions.has(transactionId)) {
    const lastTime = recentTransactions.get(transactionId)!;
    if (now - lastTime < 2000) {
      throw new Error("Please wait a moment before purchasing another ticket.");
    }
  }
  
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
    const ticketPriceLamports = BigInt(lotteryAccount.ticketPrice);
    const balance = BigInt(await program.provider.connection.getBalance(wallet.publicKey));
    const requiredBalance = ticketPriceLamports + BigInt(0.01 * LAMPORTS_PER_SOL);
    
    if (balance < requiredBalance) {
      throw new Error(
        `Insufficient SOL! Your balance is ${(Number(balance) / LAMPORTS_PER_SOL).toFixed(3)} SOL, but you need at least ${(Number(requiredBalance) / LAMPORTS_PER_SOL).toFixed(3)} SOL (ticket + fees)`
      );
    }

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
    
    recentTransactions.delete(transactionId);
    
    return signature;
    
  } catch (error: any) {
    recentTransactions.delete(transactionId);
    throw new Error(`Failed to buy ticket: ${error.message}`);
  }
};

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