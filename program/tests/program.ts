import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Lottery } from "../target/types/lottery";
import { expect } from "chai";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";

describe("lottery", () => {
  // Configure the client to use devnet
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Lottery as Program<Lottery>;
  
  // Test accounts
  let authority: Keypair;
  let player1: Keypair;
  let player2: Keypair;
  let player3: Keypair;
  
  // Test parameters
  const ticketPrice = new anchor.BN(0.01 * LAMPORTS_PER_SOL); // Reduced to 0.01 SOL for testing
  const maxTickets = 10;

  before(async () => {
    // Generate test keypairs
    authority = Keypair.generate();
    player1 = Keypair.generate();
    player2 = Keypair.generate();
    player3 = Keypair.generate();

    console.log("Generated test accounts:");
    console.log(`Authority: ${authority.publicKey.toString()}`);
    console.log(`Player1: ${player1.publicKey.toString()}`);
    console.log(`Player2: ${player2.publicKey.toString()}`);
    console.log(`Player3: ${player3.publicKey.toString()}`);
    console.log("\nIf airdrops fail, fund these accounts manually with:");
    console.log(`solana airdrop 2 ${authority.publicKey.toString()} --url devnet`);
    console.log(`solana airdrop 2 ${player1.publicKey.toString()} --url devnet`);
    console.log(`solana airdrop 2 ${player2.publicKey.toString()} --url devnet`);
    console.log(`solana airdrop 2 ${player3.publicKey.toString()} --url devnet`);

    // Simple airdrop attempt - if it fails, the user can fund manually
    try {
      console.log("\nAttempting automatic airdrops...");
      
      const accounts = [
        { keypair: authority, name: "Authority" },
        { keypair: player1, name: "Player1" },
        { keypair: player2, name: "Player2" },
        { keypair: player3, name: "Player3" }
      ];
      
      for (const account of accounts) {
        try {
          const txId = await provider.connection.requestAirdrop(
            account.keypair.publicKey, 
            1 * LAMPORTS_PER_SOL
          );
          await provider.connection.confirmTransaction(txId, "confirmed");
          console.log(`✅ ${account.name} funded successfully`);
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.log(`❌ ${account.name} airdrop failed: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log("Airdrop process encountered errors - some accounts may need manual funding");
    }

    // Check balances and provide guidance
    console.log("\nChecking account balances...");
    const balances = await Promise.all([
      provider.connection.getBalance(authority.publicKey),
      provider.connection.getBalance(player1.publicKey),
      provider.connection.getBalance(player2.publicKey),
      provider.connection.getBalance(player3.publicKey)
    ]);

    console.log(`Authority balance: ${balances[0] / LAMPORTS_PER_SOL} SOL`);
    console.log(`Player1 balance: ${balances[1] / LAMPORTS_PER_SOL} SOL`);
    console.log(`Player2 balance: ${balances[2] / LAMPORTS_PER_SOL} SOL`);
    console.log(`Player3 balance: ${balances[3] / LAMPORTS_PER_SOL} SOL`);

    // Check if any account needs funding
    const minBalance = 0.1 * LAMPORTS_PER_SOL;
    if (balances.some(balance => balance < minBalance)) {
      console.log("\n⚠️  Some accounts have insufficient balance!");
      console.log("Fund the accounts manually using the commands above, then run the tests again.");
      // Don't throw error - let tests proceed and fail gracefully if needed
    } else {
      console.log("\n✅ All accounts have sufficient balance for testing");
    }
  });

  describe("Complete Lottery Flow", () => {
    let lotteryId: anchor.BN;
    let lotteryPda: PublicKey;
    let lotteryBump: number;
    let ticket1Pda: PublicKey;
    let ticket2Pda: PublicKey;
    let ticket3Pda: PublicKey;

    beforeEach(async () => {
      // Use timestamp to ensure unique lottery IDs
      lotteryId = new anchor.BN(Date.now());
      
      // Find lottery PDA
      [lotteryPda, lotteryBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("lottery"), lotteryId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
    });

    it("Should initialize a new lottery", async () => {
      await program.methods
        .initializeLottery(lotteryId, ticketPrice, maxTickets)
        .accounts({
          authority: authority.publicKey,
          lottery: lotteryPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Verify lottery state
      const lottery = await program.account.lottery.fetch(lotteryPda);
      expect(lottery.authority.toString()).to.equal(authority.publicKey.toString());
      expect(lottery.lotteryId.toString()).to.equal(lotteryId.toString());
      expect(lottery.ticketPrice.toString()).to.equal(ticketPrice.toString());
      expect(lottery.maxTickets).to.equal(maxTickets);
      expect(lottery.ticketsSold).to.equal(0);
      expect(lottery.totalPrizePool.toString()).to.equal("0");
      expect(lottery.state).to.deep.equal({ waitingForTickets: {} });
      expect(lottery.winner).to.be.null;
      expect(lottery.randomnessFulfilled).to.be.false;
      expect(lottery.bump).to.equal(lotteryBump);
    });

    it("Should allow player1 to buy a ticket", async () => {
      // Find ticket PDA - use current tickets_sold which is 0
      [ticket1Pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("ticket"), 
          lotteryPda.toBuffer(), 
          Buffer.from([0, 0, 0, 0]) // tickets_sold = 0 before this purchase
        ],
        program.programId
      );

      const initialBalance = await provider.connection.getBalance(player1.publicKey);
      
      await program.methods
        .buyTicket(lotteryId)
        .accounts({
          player: player1.publicKey,
          lottery: lotteryPda,
          ticket: ticket1Pda,
          systemProgram: SystemProgram.programId,
        })
        .signers([player1])
        .rpc();

      // Verify ticket
      const ticket = await program.account.ticket.fetch(ticket1Pda);
      expect(ticket.lottery.toString()).to.equal(lotteryPda.toString());
      expect(ticket.player.toString()).to.equal(player1.publicKey.toString());
      expect(ticket.ticketNumber).to.equal(0);

      // Verify lottery state updated
      const lottery = await program.account.lottery.fetch(lotteryPda);
      expect(lottery.ticketsSold).to.equal(1);
      expect(lottery.totalPrizePool.toString()).to.equal(ticketPrice.toString());

      // Verify player balance decreased
      const finalBalance = await provider.connection.getBalance(player1.publicKey);
      expect(initialBalance - finalBalance).to.be.greaterThan(ticketPrice.toNumber());
    });

    it("Should allow player2 to buy a ticket", async () => {
      [ticket2Pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("ticket"), 
          lotteryPda.toBuffer(), 
          Buffer.from([1, 0, 0, 0]) // tickets_sold = 1 before this purchase
        ],
        program.programId
      );

      await program.methods
        .buyTicket(lotteryId)
        .accounts({
          player: player2.publicKey,
          lottery: lotteryPda,
          ticket: ticket2Pda,
          systemProgram: SystemProgram.programId,
        })
        .signers([player2])
        .rpc();

      // Verify lottery state
      const lottery = await program.account.lottery.fetch(lotteryPda);
      expect(lottery.ticketsSold).to.equal(2);
      expect(lottery.totalPrizePool.toString()).to.equal(ticketPrice.mul(new anchor.BN(2)).toString());
    });

    it("Should allow player3 to buy a ticket", async () => {
      [ticket3Pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("ticket"), 
          lotteryPda.toBuffer(), 
          Buffer.from([2, 0, 0, 0]) // tickets_sold = 2 before this purchase
        ],
        program.programId
      );

      await program.methods
        .buyTicket(lotteryId)
        .accounts({
          player: player3.publicKey,
          lottery: lotteryPda,
          ticket: ticket3Pda,
          systemProgram: SystemProgram.programId,
        })
        .signers([player3])
        .rpc();

      // Verify lottery state
      const lottery = await program.account.lottery.fetch(lotteryPda);
      expect(lottery.ticketsSold).to.equal(3);
    });

    it("Should allow authority to start the round", async () => {
      await program.methods
        .startRound()
        .accounts({
          authority: authority.publicKey,
          lottery: lotteryPda,
        })
        .signers([authority])
        .rpc();

      // Verify state changed
      const lottery = await program.account.lottery.fetch(lotteryPda);
      expect(lottery.state).to.deep.equal({ waitingForRandomness: {} });
    });

    it("Should fulfill randomness and select winner", async () => {
      // Generate mock randomness
      const randomness = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        randomness[i] = Math.floor(Math.random() * 256);
      }

      await program.methods
        .fulfillRandomness(Array.from(randomness))
        .accounts({
          authority: authority.publicKey,
          lottery: lotteryPda,
        })
        .signers([authority])
        .rpc();

      // Verify randomness fulfilled
      const lottery = await program.account.lottery.fetch(lotteryPda);
      expect(lottery.randomnessFulfilled).to.be.true;
      expect(lottery.winner).to.not.be.null;
      expect(lottery.winner).to.be.lessThan(3); // Should be 0, 1, or 2
      expect(lottery.state).to.deep.equal({ waitingForPayout: {} });
    });

    it("Should close the round", async () => {
      await program.methods
        .closeRound()
        .accounts({
          authority: authority.publicKey,
          lottery: lotteryPda,
        })
        .signers([authority])
        .rpc();

      // Verify state changed
      const lottery = await program.account.lottery.fetch(lotteryPda);
      expect(lottery.state).to.deep.equal({ closed: {} });
    });

    it("Should complete payout to winner with fee distribution", async () => {
      // Get current lottery state to find winner
      const lottery = await program.account.lottery.fetch(lotteryPda);
      const winnerTicketNumber = lottery.winner;
      
      // Find the winning ticket PDA
      const [winnerTicketPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("ticket"), 
          lotteryPda.toBuffer(), 
          Buffer.from(new Uint8Array(new Uint32Array([winnerTicketNumber]).buffer))
        ],
        program.programId
      );

      // Get the winning ticket to find winner address
      const winnerTicket = await program.account.ticket.fetch(winnerTicketPda);
      const winnerAddress = winnerTicket.player;

      // Create platform fee account (in real app, this would be a predetermined account)
      const platformFeeAccount = Keypair.generate();

      // Get initial balances
      const initialWinnerBalance = await provider.connection.getBalance(winnerAddress);
      const initialCreatorBalance = await provider.connection.getBalance(authority.publicKey);
      const initialPlatformBalance = await provider.connection.getBalance(platformFeeAccount.publicKey);

      const totalPrizePool = lottery.totalPrizePool.toNumber();
      const expectedWinnerAmount = Math.floor((totalPrizePool * 90) / 100);
      const expectedCreatorAmount = Math.floor((totalPrizePool * 5) / 100);
      const expectedPlatformAmount = totalPrizePool - expectedWinnerAmount - expectedCreatorAmount;

      await program.methods
        .payout()
        .accounts({
          authority: authority.publicKey,
          lottery: lotteryPda,
          winnerTicket: winnerTicketPda,
          winner: winnerAddress,
          lotteryCreator: authority.publicKey, // Authority is the lottery creator
          platformFeeAccount: platformFeeAccount.publicKey,
        })
        .signers([authority])
        .rpc();

      // Verify payout completed
      const finalLottery = await program.account.lottery.fetch(lotteryPda);
      expect(finalLottery.state).to.deep.equal({ paidOut: {} });
      expect(finalLottery.totalPrizePool.toString()).to.equal("0");

      // Verify winner received 90%
      const finalWinnerBalance = await provider.connection.getBalance(winnerAddress);
      const winnerReceived = finalWinnerBalance - initialWinnerBalance;
      expect(winnerReceived).to.equal(expectedWinnerAmount);

      // Verify creator received 5%
      const finalCreatorBalance = await provider.connection.getBalance(authority.publicKey);
      const creatorReceived = finalCreatorBalance - initialCreatorBalance;
      expect(creatorReceived).to.be.greaterThan(expectedCreatorAmount - 10000); // Account for tx fees
      expect(creatorReceived).to.be.lessThan(expectedCreatorAmount + 10000);

      // Verify platform received 5%
      const finalPlatformBalance = await provider.connection.getBalance(platformFeeAccount.publicKey);
      const platformReceived = finalPlatformBalance - initialPlatformBalance;
      expect(platformReceived).to.equal(expectedPlatformAmount);

      console.log(`Payout Distribution:`);
      console.log(`Total Prize Pool: ${totalPrizePool} lamports (${totalPrizePool / LAMPORTS_PER_SOL} SOL)`);
      console.log(`Winner (90%): ${winnerReceived} lamports (${winnerReceived / LAMPORTS_PER_SOL} SOL)`);
      console.log(`Creator (5%): ${creatorReceived} lamports (${creatorReceived / LAMPORTS_PER_SOL} SOL)`);
      console.log(`Platform (5%): ${platformReceived} lamports (${platformReceived / LAMPORTS_PER_SOL} SOL)`);
    });
  });

  // Reduced test cases for faster execution when rate-limited
  describe("Basic Error Cases", () => {
    let lotteryId: anchor.BN;
    let lotteryPda: PublicKey;

    beforeEach(async () => {
      lotteryId = new anchor.BN(Date.now() + Math.random() * 1000);
      [lotteryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("lottery"), lotteryId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      // Initialize lottery for error tests
      await program.methods
        .initializeLottery(lotteryId, ticketPrice, maxTickets)
        .accounts({
          authority: authority.publicKey,
          lottery: lotteryPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();
    });

    it("Should fail to start round with no tickets", async () => {
      try {
        await program.methods
          .startRound()
          .accounts({
            authority: authority.publicKey,
            lottery: lotteryPda,
          })
          .signers([authority])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("No tickets have been sold");
      }
    });
  });
});