import { useProgram } from "./useProgram";
import * as anchor from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";


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



