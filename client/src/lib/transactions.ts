import { useProgram } from "./useProgram";
import * as anchor from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";




export const getAllLotteries = async (  program: anchor.Program) => {


  if (!program) {
    console.log("Program not initialized");
    return [];
  }

  try {
    const lotteries = await (program.account as any)["lottery"].all();
    return lotteries.map((lottery: any) => ({
      id: lottery.publicKey.toBase58(),
      ...lottery.account,
    }));
  } catch (error) {
    console.error("Error fetching lotteries:", error);
    return [];
  }
};

export const getCreatedLotteries = async (program: anchor.Program, wallet: AnchorWallet) => {
  if (!program) {
    console.log("Program not initialized");
    return [];
  }
  if (!wallet) {
    console.log("No wallet found");
    return [];
  }
  try {
    const lotteries = await (program.account as any)["lottery"].all([
      {
        memcmp: {
          offset: 8, // Skip the account discriminator
          bytes: wallet.publicKey.toBase58(),
        },
      },
    ]);
    return lotteries.map((lottery: any) => ({
      id: lottery.publicKey.toBase58(),
      ...lottery.account,
    }));
  } catch (error) {
    console.error("Error fetching created lotteries:", error);
    return [];
  }
};


// CREATE LOTTERY
export const createLottery = async (  
  lotteryId: number,
  ticketPrice: number,
  maxTickets: number,
  duration: number, // add duration
  program: anchor.Program,   
  wallet: AnchorWallet
) => {
  if (!program) return console.log("Program not initialized");
  if (!wallet) return console.log("No wallet found");

  const [lotteryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("lottery"), new anchor.BN(lotteryId).toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  try {
    const tx = await program.methods.initializeLottery(
      new anchor.BN(lotteryId),
      new anchor.BN(ticketPrice),
      new anchor.BN(maxTickets),
      new anchor.BN(duration)
    )
    .accounts({
      lottery: lotteryPda,
      authority: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

    console.log("Lottery created with tx:", tx);
    return tx;
  } catch (error) {
    console.error("Error creating lottery:", error);
  }
};

// BUY TICKET
export const buyTicket = async (
  program: anchor.Program,
  lotteryPdaString: string,
  wallet: AnchorWallet
) => {
  if (!program) return console.log("Program not initialized");
  if (!wallet) return console.log("No wallet found");

  try {
    const lotteryPda = new PublicKey(lotteryPdaString);
    const lotteryAccount: any = await (program.account as any).lottery.fetch(lotteryPda);
    const lotteryId = lotteryAccount.lotteryId.toNumber();

    const [derivedPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("lottery"),
        new anchor.BN(lotteryId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
    if (!derivedPda.equals(lotteryPda)) throw new Error("PDA mismatch!");

    const tx = await program.methods.buyTicket(new anchor.BN(lotteryId))
      .accounts({
        player: wallet.publicKey,
        lottery: lotteryPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("🎟️ Ticket purchased! Tx:", tx);
    return tx;
  } catch (error) {
    console.error("❌ Error buying ticket:", error);
  }
};



export const getMyTickets = async (
  program: anchor.Program,
  wallet: AnchorWallet
) => {
  if (!program) {
    console.log("Program not initialized");
    return [];
  }

  if (!wallet) {
    console.log("No wallet found");
    return [];
  }

  try {
    const tickets: any[] = await (program.account as any).ticket.all([
      {
        memcmp: {
          offset: 40, 
          bytes: wallet.publicKey.toBase58(),
        },
      },
    ]);

    return tickets.map(ticket => ({
      id: ticket.publicKey.toBase58(),
      ...ticket.account,
    }));
  } catch (error) {
    console.error("❌ Error fetching tickets:", error);
    return [];
  }
};



// FULFILL RANDOMNESS (after tickets done or duration hit)
export const fulfillRandomness = async (
  program: anchor.Program,
  lotteryPda: PublicKey,
  wallet: AnchorWallet,
  randomness: number[]
) => {
  try {
    const tx = await program.methods.fulfillRandomness(randomness)
      .accounts({
        authority: wallet.publicKey,
        lottery: lotteryPda,
      })
      .rpc();

    console.log("🎲 Randomness fulfilled! Tx:", tx);
    return tx;
  } catch (error) {
    console.error("❌ Error fulfilling randomness:", error);
  }
};

// PAYOUT WINNER
export const payoutWinner = async (
  program: anchor.Program,
  lotteryPda: PublicKey,
  wallet: AnchorWallet,
  winner: PublicKey,
  lotteryCreator: PublicKey,
  platformFeeAccount: PublicKey
) => {
  try {
    const tx = await program.methods.payout()
      .accounts({
        authority: wallet.publicKey,
        lottery: lotteryPda,
        winner,
        lotteryCreator,
        platformFeeAccount,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("💰 Winner paid out! Tx:", tx);
    return tx;
  } catch (error) {
    console.error("❌ Error paying out winner:", error);
  }
};