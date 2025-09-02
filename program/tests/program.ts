import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Lottery } from "../target/types/lottery";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert, expect } from "chai";
import { BN } from "bn.js";

describe("lottery", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Lottery as Program<Lottery>;
  const provider = anchor.getProvider();

  // Test accounts
  let authority: Keypair;
  let players: Keypair[] = [];

  // Test parameters
  const LOTTERY_ID = new BN(1);
  const TICKET_PRICE = new BN(0.001 * LAMPORTS_PER_SOL); // 0.001 SOL
  const MAX_TICKETS = 100;

  before(async () => {
    // Initialize authority
    authority = Keypair.generate();

    // Airdrop SOL to authority
    const signature = await provider.connection.requestAirdrop(
      authority.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Create test players
    for (let i = 0; i < 5; i++) {
      const player = Keypair.generate();
      
      // Airdrop SOL to each player
      const playerSignature = await provider.connection.requestAirdrop(
        player.publicKey,
        1 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(playerSignature);
      
      players.push(player);
    }
  });

  // Helper function to get lottery PDA
  const getLotteryPDA = (lotteryId: BN): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("lottery"), lotteryId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
  };

  // Helper function to get ticket PDA
  const getTicketPDA = (lottery: PublicKey, ticketNumber: number): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("ticket"),
        lottery.toBuffer(),
        new BN(ticketNumber).toArrayLike(Buffer, "le", 4)
      ],
      program.programId
    );
  };

  // Helper function to get account balance
  const getBalance = async (pubkey: PublicKey): Promise<number> => {
    return await provider.connection.getBalance(pubkey);
  };

  it("Initialize Lottery", async () => {
    const [lotteryPDA] = getLotteryPDA(LOTTERY_ID);

    const tx = await program.methods
      .initializeLottery(LOTTERY_ID, TICKET_PRICE, MAX_TICKETS)
      .accounts({
        authority: authority.publicKey,
        lottery: lotteryPDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    console.log("Initialize lottery transaction signature:", tx);

    // Fetch and verify lottery account
    const lotteryAccount = await program.account.lottery.fetch(lotteryPDA);
    
    assert.ok(lotteryAccount.authority.equals(authority.publicKey));
    assert.ok(lotteryAccount.lotteryId.eq(LOTTERY_ID));
    assert.ok(lotteryAccount.ticketPrice.eq(TICKET_PRICE));
    assert.equal(lotteryAccount.maxTickets, MAX_TICKETS);
    assert.equal(lotteryAccount.ticketsSold, 0);
    assert.ok(lotteryAccount.totalPrizePool.eq(new BN(0)));
    assert.deepEqual(lotteryAccount.state, { waitingForTickets: {} });
    assert.equal(lotteryAccount.winner, null);
    assert.equal(lotteryAccount.randomnessFulfilled, false);
  });

  it("Buy Ticket", async () => {
    const [lotteryPDA] = getLotteryPDA(LOTTERY_ID);
    const player = players[0];
    const [ticketPDA] = getTicketPDA(lotteryPDA, 0);

    const playerBalanceBefore = await getBalance(player.publicKey);
    const lotteryBalanceBefore = await getBalance(lotteryPDA);

    const tx = await program.methods
      .buyTicket(LOTTERY_ID)
      .accounts({
        player: player.publicKey,
        lottery: lotteryPDA,
        ticket: ticketPDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([player])
      .rpc();

    console.log("Buy ticket transaction signature:", tx);

    // Verify ticket account
    const ticketAccount = await program.account.ticket.fetch(ticketPDA);
    assert.ok(ticketAccount.lottery.equals(lotteryPDA));
    assert.ok(ticketAccount.player.equals(player.publicKey));
    assert.equal(ticketAccount.ticketNumber, 0);

    // Verify lottery account updated
    const lotteryAccount = await program.account.lottery.fetch(lotteryPDA);
    assert.equal(lotteryAccount.ticketsSold, 1);
    assert.ok(lotteryAccount.totalPrizePool.eq(TICKET_PRICE));

    // Verify balances changed
    const playerBalanceAfter = await getBalance(player.publicKey);
    const lotteryBalanceAfter = await getBalance(lotteryPDA);

    expect(playerBalanceBefore - playerBalanceAfter).to.be.greaterThan(TICKET_PRICE.toNumber());
    expect(lotteryBalanceAfter - lotteryBalanceBefore).to.equal(TICKET_PRICE.toNumber());
  });

  it("Buy Multiple Tickets", async () => {
    const [lotteryPDA] = getLotteryPDA(LOTTERY_ID);

    // Buy tickets for players 1-4 (player 0 already bought)
    for (let i = 1; i < 5; i++) {
      const player = players[i];
      const [ticketPDA] = getTicketPDA(lotteryPDA, i);

      await program.methods
        .buyTicket(LOTTERY_ID)
        .accounts({
          player: player.publicKey,
          lottery: lotteryPDA,
          ticket: ticketPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([player])
        .rpc();

      // Verify ticket
      const ticketAccount = await program.account.ticket.fetch(ticketPDA);
      assert.ok(ticketAccount.player.equals(player.publicKey));
      assert.equal(ticketAccount.ticketNumber, i);
    }

    // Verify lottery has 5 tickets sold
    const lotteryAccount = await program.account.lottery.fetch(lotteryPDA);
    assert.equal(lotteryAccount.ticketsSold, 5);
    assert.ok(lotteryAccount.totalPrizePool.eq(TICKET_PRICE.mul(new BN(5))));
  });

  it("Start Round", async () => {
    const [lotteryPDA] = getLotteryPDA(LOTTERY_ID);

    const tx = await program.methods
      .startRound()
      .accounts({
        authority: authority.publicKey,
        lottery: lotteryPDA,
      })
      .signers([authority])
      .rpc();

    console.log("Start round transaction signature:", tx);

    // Verify lottery state changed
    const lotteryAccount = await program.account.lottery.fetch(lotteryPDA);
    assert.deepEqual(lotteryAccount.state, { waitingForRandomness: {} });
  });

  it("Fulfill Randomness", async () => {
    const [lotteryPDA] = getLotteryPDA(LOTTERY_ID);

    // Mock randomness (in real implementation, this would come from an oracle)
    const randomness = Array.from({ length: 32 }, (_, i) => i % 256);

    const tx = await program.methods
      .fulfillRandomness(randomness)
      .accounts({
        authority: authority.publicKey,
        lottery: lotteryPDA,
      })
      .signers([authority])
      .rpc();

    console.log("Fulfill randomness transaction signature:", tx);

    // Verify lottery state and winner
    const lotteryAccount = await program.account.lottery.fetch(lotteryPDA);
    assert.deepEqual(lotteryAccount.state, { waitingForPayout: {} });
    assert.equal(lotteryAccount.randomnessFulfilled, true);
    assert.isNotNull(lotteryAccount.winner);
    assert.isTrue(lotteryAccount.winner < 5); // Winner should be 0-4
    
    console.log("Winning ticket number:", lotteryAccount.winner);
  });

  it("Close Round", async () => {
    const [lotteryPDA] = getLotteryPDA(LOTTERY_ID);

    const tx = await program.methods
      .closeRound()
      .accounts({
        authority: authority.publicKey,
        lottery: lotteryPDA,
      })
      .signers([authority])
      .rpc();

    console.log("Close round transaction signature:", tx);

    // Verify lottery state
    const lotteryAccount = await program.account.lottery.fetch(lotteryPDA);
    assert.deepEqual(lotteryAccount.state, { closed: {} });
  });

  it("Payout Winner", async () => {
    const [lotteryPDA] = getLotteryPDA(LOTTERY_ID);
    
    // Get lottery account to find winner
    const lotteryAccount = await program.account.lottery.fetch(lotteryPDA);
    const winningTicketNumber = lotteryAccount.winner;
    
    // Get winner ticket and player
    const [winnerTicketPDA] = getTicketPDA(lotteryPDA, winningTicketNumber);
    const winnerTicketAccount = await program.account.ticket.fetch(winnerTicketPDA);
    const winnerPlayer = winnerTicketAccount.player;

    const winnerBalanceBefore = await getBalance(winnerPlayer);
    const lotteryBalanceBefore = await getBalance(lotteryPDA);
    const totalPrizePool = lotteryAccount.totalPrizePool.toNumber();

    const tx = await program.methods
      .payout()
      .accounts({
        authority: authority.publicKey,
        lottery: lotteryPDA,
        winnerTicket: winnerTicketPDA,
        winner: winnerPlayer,
      })
      .signers([authority])
      .rpc();

    console.log("Payout transaction signature:", tx);

    // Verify balances
    const winnerBalanceAfter = await getBalance(winnerPlayer);
    const lotteryBalanceAfter = await getBalance(lotteryPDA);

    expect(winnerBalanceAfter - winnerBalanceBefore).to.equal(totalPrizePool);
    expect(lotteryBalanceBefore - lotteryBalanceAfter).to.equal(totalPrizePool);

    // Verify lottery state
    const updatedLotteryAccount = await program.account.lottery.fetch(lotteryPDA);
    assert.deepEqual(updatedLotteryAccount.state, { paidOut: {} });
    assert.ok(updatedLotteryAccount.totalPrizePool.eq(new BN(0)));

    console.log(`Winner ${winnerPlayer.toBase58()} received ${totalPrizePool / LAMPORTS_PER_SOL} SOL`);
  });

  // Error test cases
  describe("Error Cases", () => {
    const ERROR_LOTTERY_ID = new BN(999);

    it("Should fail to buy ticket for non-existent lottery", async () => {
      const [nonExistentLotteryPDA] = getLotteryPDA(ERROR_LOTTERY_ID);
      const [ticketPDA] = getTicketPDA(nonExistentLotteryPDA, 0);
      const player = players[0];

      try {
        await program.methods
          .buyTicket(ERROR_LOTTERY_ID)
          .accounts({
            player: player.publicKey,
            lottery: nonExistentLotteryPDA,
            ticket: ticketPDA,
            systemProgram: SystemProgram.programId,
          })
          .signers([player])
          .rpc();
        
        assert.fail("Expected transaction to fail");
      } catch (error) {
        expect(error.message).to.include("AccountNotInitialized");
      }
    });

    it("Should fail to start round without authority", async () => {
      // Create a new lottery first
      const newLotteryId = new BN(2);
      const [newLotteryPDA] = getLotteryPDA(newLotteryId);

      await program.methods
        .initializeLottery(newLotteryId, TICKET_PRICE, MAX_TICKETS)
        .accounts({
          authority: authority.publicKey,
          lottery: newLotteryPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Try to start round with wrong authority
      const fakeAuthority = players[0];

      try {
        await program.methods
          .startRound()
          .accounts({
            authority: fakeAuthority.publicKey,
            lottery: newLotteryPDA,
          })
          .signers([fakeAuthority])
          .rpc();
        
        assert.fail("Expected transaction to fail");
      } catch (error) {
        expect(error.message).to.include("ConstraintHasOne");
      }
    });

    it("Should fail to start round with no tickets sold", async () => {
      const newLotteryId = new BN(3);
      const [newLotteryPDA] = getLotteryPDA(newLotteryId);

      await program.methods
        .initializeLottery(newLotteryId, TICKET_PRICE, MAX_TICKETS)
        .accounts({
          authority: authority.publicKey,
          lottery: newLotteryPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      try {
        await program.methods
          .startRound()
          .accounts({
            authority: authority.publicKey,
            lottery: newLotteryPDA,
          })
          .signers([authority])
          .rpc();
        
        assert.fail("Expected transaction to fail");
      } catch (error) {
        expect(error.message).to.include("NoTicketsSold");
      }
    });
  });

  // Complete lottery flow test
  it("Complete Lottery Flow - New Lottery", async () => {
    const newLotteryId = new BN(10);
    const [newLotteryPDA] = getLotteryPDA(newLotteryId);
    const numPlayers = 3;

    // 1. Initialize new lottery
    await program.methods
      .initializeLottery(newLotteryId, TICKET_PRICE, MAX_TICKETS)
      .accounts({
        authority: authority.publicKey,
        lottery: newLotteryPDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    // 2. Players buy tickets
    for (let i = 0; i < numPlayers; i++) {
      const [ticketPDA] = getTicketPDA(newLotteryPDA, i);
      await program.methods
        .buyTicket(newLotteryId)
        .accounts({
          player: players[i].publicKey,
          lottery: newLotteryPDA,
          ticket: ticketPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([players[i]])
        .rpc();
    }

    // 3. Start round
    await program.methods
      .startRound()
      .accounts({
        authority: authority.publicKey,
        lottery: newLotteryPDA,
      })
      .signers([authority])
      .rpc();

    // 4. Fulfill randomness
    const randomness = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
    await program.methods
      .fulfillRandomness(randomness)
      .accounts({
        authority: authority.publicKey,
        lottery: newLotteryPDA,
      })
      .signers([authority])
      .rpc();

    // 5. Close round
    await program.methods
      .closeRound()
      .accounts({
        authority: authority.publicKey,
        lottery: newLotteryPDA,
      })
      .signers([authority])
      .rpc();

    // 6. Payout
    const lotteryAccount = await program.account.lottery.fetch(newLotteryPDA);
    const winningTicketNumber = lotteryAccount.winner;
    const [winnerTicketPDA] = getTicketPDA(newLotteryPDA, winningTicketNumber);
    const winnerTicketAccount = await program.account.ticket.fetch(winnerTicketPDA);

    await program.methods
      .payout()
      .accounts({
        authority: authority.publicKey,
        lottery: newLotteryPDA,
        winnerTicket: winnerTicketPDA,
        winner: winnerTicketAccount.player,
      })
      .signers([authority])
      .rpc();

    // Verify final state
    const finalLotteryAccount = await program.account.lottery.fetch(newLotteryPDA);
    assert.deepEqual(finalLotteryAccount.state, { paidOut: {} });
    assert.ok(finalLotteryAccount.totalPrizePool.eq(new BN(0)));

    console.log("Complete lottery flow test passed!");
  });
});