import { useProgram } from "./useProgram";
import * as anchor from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";


export const createLottery = async (  
  lotteryId: number,
  ticketPrice: number,
  maxTickets: number,
  program: anchor.Program,   
  wallet: AnchorWallet
) => {


  if (!program) {
    console.log("Program not initialized");
    return;
  }

  if(!wallet){
    console.log("No wallet found");
    return;
  }

  const [lotteryPda] = PublicKey.findProgramAddressSync(
[
  Buffer.from("lottery"),
  new anchor.BN(lotteryId).toArrayLike(Buffer, "le", 8),
],
program.programId
);

  try {

    const tx = await program.methods.initializeLottery(
      new anchor.BN(lotteryId),
      new anchor.BN(ticketPrice),
      new anchor.BN(maxTickets)
    )
    .accounts({
      lottery: lotteryPda,
      authority: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

    console.log("Lottery created with tx:", tx);
    return tx;


  } catch (error) {
    console.log("Error creating lottery:", error);
    return;
  }


}

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


export const startLottery = async(program:anchor.Program, lotteryPda: PublicKey, wallet: AnchorWallet)=>{
  if (!program) {
    console.log("Program not initialized");
    return;
  }
  if (!wallet) {
    console.log("No wallet found");
    return;
  }

try {
  const tx = await program.methods.startRound()
  .accounts({
   authority: wallet.publicKey,
    lottery: lotteryPda,
  })
  .rpc();
} catch (error) {
  console.log("Error starting lottery:", error);
  return;
}
}

export const buyTicket = async (
  program: anchor.Program,
  lotteryPdaString: string, // pass params.id (PDA string)
  wallet: AnchorWallet
) => {
  if (!program) {
    console.log("Program not initialized");
    return;
  }
  if (!wallet) {
    console.log("No wallet found");
    return;
  }

  try {
    // 1️⃣ Convert PDA string to PublicKey
    const lotteryPda = new PublicKey(lotteryPdaString);

    // 2️⃣ Fetch lottery account
    const lotteryAccount: any = await (program.account as any).lottery.fetch(lotteryPda);

    // 3️⃣ Extract numeric lotteryId
    const lotteryId = lotteryAccount.lotteryId.toNumber();

    // 4️⃣ Re-derive PDA to ensure it matches lotteryId
    const [derivedPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("lottery"),
        new anchor.BN(lotteryId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    if (!derivedPda.equals(lotteryPda)) {
      throw new Error("PDA mismatch with lotteryId!");
    }

    // 5️⃣ Call the program
    const tx = await program.methods
      .buyTicket(new anchor.BN(lotteryId))
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