
import { useProgram } from "./useProgram";
import * as anchor from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";

// Account sizes (from your IDL)
const LOTTERY_ACCOUNT_SIZE = 96;
const TICKET_ACCOUNT_SIZE = 85;

// ---- Manual parsing ----
const parseLotteryAccount = (data: Uint8Array, pubkey: PublicKey) => {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 8; // skip discriminator

  const authority = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const lotteryId = dv.getBigUint64(offset, true);
  offset += 8;

  const ticketPrice = dv.getBigUint64(offset, true);
  offset += 8;

  const maxTickets = dv.getUint32(offset, true);
  offset += 4;

  const ticketsSold = dv.getUint32(offset, true);
  offset += 4;

  const totalPrizePool = dv.getBigUint64(offset, true);
  offset += 8;

  const stateByte = data[offset];
  const stateNames = ['WaitingForTickets', 'WaitingForRandomness', 'WaitingForPayout', 'PaidOut'];
  offset += 1;

  const hasWinner = data[offset] === 1;
  offset += 1;
  let winner: number | null = null;
  if (hasWinner) winner = dv.getUint32(offset, true);
  offset += 4;

  const createdAt = dv.getBigInt64(offset, true);
  offset += 8;

  const duration = dv.getBigInt64(offset, true);
  offset += 8;

  const randomnessFulfilled = data[offset] === 1;
  offset += 1;

  const bump = data[offset];

  return {
    id: pubkey.toBase58(),
    authority: authority.toBase58(),
    lotteryId: lotteryId.toString(),
    ticketPrice: ticketPrice.toString(),
    maxTickets,
    ticketsSold,
    totalPrizePool: totalPrizePool.toString(),
    state: stateNames[stateByte] || 'Unknown',
    winner,
    createdAt: createdAt.toString(),
    duration: duration.toString(),
    randomnessFulfilled,
    bump,
    _manualParse: true,
  };
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
  if (!program) return [];

  try {
    return (await (program.account as any).lottery.all()).map((l: any) => ({
      id: l.publicKey.toBase58(),
      ...l.account,
    }));
  } catch {
    const accounts = await program.provider.connection.getProgramAccounts(program.programId, {
      filters: [{ dataSize: LOTTERY_ACCOUNT_SIZE }],
    });
    return accounts.map(acc => parseLotteryAccount(acc.account.data, acc.pubkey));
  }
};

// ---- Fetch lotteries created by wallet ----
export const getCreatedLotteries = async (program: anchor.Program, wallet: AnchorWallet) => {
  if (!program || !wallet) return [];

  try {
    return (await (program.account as any).lottery.all([
      {
        memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() },
      },
    ])).map((l: any) => ({
      id: l.publicKey.toBase58(),
      ...l.account,
    }));
  } catch {
    const accounts = await program.provider.connection.getProgramAccounts(program.programId, {
      filters: [
        { dataSize: LOTTERY_ACCOUNT_SIZE },
        { memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } },
      ],
    });
    return accounts.map(acc => parseLotteryAccount(acc.account.data, acc.pubkey));
  }
};

// ---- Fetch tickets by wallet ----
export const getMyTickets = async (program: anchor.Program, wallet: AnchorWallet) => {
  if (!program || !wallet) return [];

  try {
    return (await (program.account as any).ticket.all([
      {
        memcmp: { offset: 40, bytes: wallet.publicKey.toBase58() },
      },
    ])).map((t: any) => ({
      id: t.publicKey.toBase58(),
      ...t.account,
    }));
  } catch {
    const accounts = await program.provider.connection.getProgramAccounts(program.programId, {
      filters: [
        { dataSize: TICKET_ACCOUNT_SIZE },
        { memcmp: { offset: 40, bytes: wallet.publicKey.toBase58() } },
      ],
    });
    return accounts.map(acc => parseTicketAccount(acc.account.data, acc.pubkey));
  }
};

// ---- Fetch lottery by PDA ----
export const getLotteryByPda = async (program: anchor.Program, lotteryPda: PublicKey) => {
  try {
    return await (program.account as any).lottery.fetch(lotteryPda);
  } catch {
    const info = await program.provider.connection.getAccountInfo(lotteryPda);
    if (!info) return null;
    return parseLotteryAccount(info.data, lotteryPda);
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
  if (!program || !wallet) return;

  const ticketPriceLamports = new anchor.BN(ticketPriceSol * LAMPORTS_PER_SOL);
  const [lotteryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("lottery"), new anchor.BN(lotteryId).toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const tx = await program.methods
    .initializeLottery(new anchor.BN(lotteryId), ticketPriceLamports, new anchor.BN(maxTickets), new anchor.BN(duration))
    .accounts({
      lottery: lotteryPda,
      authority: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = wallet.publicKey;

  const signedTx = await wallet.signTransaction(tx);
  const sig = await program.provider.connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: false });
  await program.provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

  return sig;
};

// ---- Buy ticket ----
export const buyTicket = async (
  program: anchor.Program,
  lotteryPdaString: string,
  wallet: AnchorWallet
) => {
  if (!program || !wallet) return;

  const lotteryPda = new PublicKey(lotteryPdaString);
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

  // 🔥 Check wallet balance first
  const balance = BigInt(await program.provider.connection.getBalance(wallet.publicKey));
  if (balance < ticketPriceLamports) {
    throw new Error(
      `Insufficient SOL! Your balance is ${(balance / BigInt(LAMPORTS_PER_SOL))} SOL, but ticket costs ${(ticketPriceLamports / BigInt(LAMPORTS_PER_SOL))} SOL`
    );
  }

  const [ticketPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("ticket"),
      lotteryPda.toBuffer(),
      new anchor.BN(lotteryAccount.ticketsSold).toArrayLike(Buffer, "le", 4),
    ],
    program.programId
  );

  // Build transaction manually
  const tx = await program.methods.buyTicket(new anchor.BN(lotteryId))
    .accounts({
      player: wallet.publicKey,
      lottery: lotteryPda,
      ticket: ticketPda,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = wallet.publicKey;

  const signedTx = await wallet.signTransaction(tx);
  const sig = await program.provider.connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: false });
  await program.provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

  return sig;
};


// ---- Fulfill randomness ----
export const fulfillRandomness = async (
  program: anchor.Program,
  lotteryPda: PublicKey,
  wallet: AnchorWallet,
  randomness: number[]
) => {
  const randomnessArray = randomness.slice(0, 32).concat(Array(32 - randomness.length).fill(0));

  const tx = await program.methods.fulfillRandomness(randomnessArray)
    .accounts({
      authority: wallet.publicKey,
      lottery: lotteryPda,
    })
    .transaction();

  const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = wallet.publicKey;

  const signedTx = await wallet.signTransaction(tx);
  const sig = await program.provider.connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: false });
  await program.provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

  return sig;
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

  const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = wallet.publicKey;

  const signedTx = await wallet.signTransaction(tx);
  const sig = await program.provider.connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: false });
  await program.provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

  return sig;
};
