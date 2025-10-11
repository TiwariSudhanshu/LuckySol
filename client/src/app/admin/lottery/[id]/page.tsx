"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import BuyTicketModal from "@/components/BuyTicketModal"
import { useProgram } from "@/lib/useProgram"
import { toast } from "sonner"
import { PublicKey } from "@solana/web3.js"
import { useAnchorWallet } from "@solana/wallet-adapter-react"
import * as anchor from "@coral-xyz/anchor"
import {
  payoutWinner,
  fulfillRandomness,
  getLotteryByPda,
  formatDuration,
} from "@/lib/transactions"

interface LotteryData {
  authority: string
  bump: number
  createdAt: string
  id: string
  lotteryId: string
  maxTickets: number
  randomnessFulfilled: boolean
  ticketPrice: string
  ticketsSold: number
  totalPrizePool: string
  winner: number | null
  duration: string
  state?: string // Add state field for compatibility
}

// formatTime is now imported as formatDuration from transactions

export default function AdminLotteryPage() {
  const params = useParams()
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [lotteryData, setLotteryData] = useState<LotteryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  const program = useProgram()
  const wallet = useAnchorWallet()
  const id = params.id

  const fetchLottery = async () => {
    if (!program) return toast.error("Program not initialized")
    if (!id) return toast.error("Lottery ID not found in URL")

    try {
      console.log(`Admin: Fetching lottery details for ID: ${id}`);
      const lotteryAccount = await getLotteryByPda(program, new PublicKey(id as string));
      
      if (!lotteryAccount) {
        toast.error("Lottery not found")
        return
      }
      
      console.log('Admin: Fetched lottery data:', lotteryAccount);
      setLotteryData({
        ...lotteryAccount,
        id: lotteryAccount.id
      })
      setLoading(false)
      toast.success("Lottery fetched successfully!")

      // Set countdown timer
      const now = Math.floor(Date.now() / 1000)
      const createdAt = parseInt(lotteryAccount.createdAt)
      const duration = parseInt(lotteryAccount.duration)
      const endTime = createdAt + duration
      setTimeLeft(Math.max(endTime - now, 0))
    } catch (error) {
      console.error("Error fetching lottery:", error)
      setLoading(false)
      toast.error("Error fetching lottery")
    }
  }

  useEffect(() => {
    if (program && id) fetchLottery()
  }, [program, id])

  // Countdown timer for lottery
  useEffect(() => {
    if (!timeLeft) return
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])
const declareWinner = async () => {
  if (!program || !wallet || !id) return;

  try {
    // Fetch the lottery data first
    const lottery = await getLotteryByPda(program, new PublicKey(id));
    if (!lottery) {
      toast.error("Lottery not found");
      return;
    }

    // Check if the connected wallet is the authority
    const isAuthority = lottery.authority === wallet.publicKey.toBase58();
    if (!isAuthority) {
      toast.error("You are not the lottery authority!");
      return;
    }

    // Check if randomness was already fulfilled
    if (lottery.randomnessFulfilled) {
      toast.error("Randomness already fulfilled for this lottery");
      return;
    }

    // Check if the lottery is ready for randomness (has sold tickets and either reached max or expired)
    if (lottery.ticketsSold === 0) {
      toast.error("Cannot declare winner: No tickets sold");
      return;
    }

    // Check if lottery has reached max tickets or has expired
    const now = Math.floor(Date.now() / 1000);
    const createdAt = parseInt(lottery.createdAt);
    const duration = parseInt(lottery.duration);
    const endTime = createdAt + duration;
    const hasExpired = now >= endTime;
    const isMaxTickets = lottery.ticketsSold >= lottery.maxTickets;

    if (!hasExpired && !isMaxTickets) {
      toast.error("Lottery not ready for winner declaration. Must either reach max tickets or expire.");
      return;
    }

    // Generate randomness array
    const randomness = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));

    // Call fulfillRandomness
    const tx = await fulfillRandomness(program, new PublicKey(id), wallet, randomness);
    toast.success("Winner declared successfully!");
    console.log("Winner tx:", tx);

    // Refresh lottery data
    await fetchLottery();
  } catch (error) {
    console.error(error);
    toast.error("Error declaring winner");
  }
};


  const payout = async () => {
    if (!program || !wallet || !id || !lotteryData?.winner || !lotteryData?.authority) return
    const platformFeeAccount = process.env.NEXT_PUBLIC_PLATFORM_FEE_ACCOUNT
    if (!platformFeeAccount) return console.error("Platform fee account not set")

    try {
      // Derive the winner ticket PDA based on lottery and winner ticket number
      const lotteryPda = new PublicKey(id);
      const winnerTicketNumber = lotteryData.winner; // This should be the ticket number
      
      const [winnerTicketPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("ticket"),
          lotteryPda.toBuffer(),
          new anchor.BN(winnerTicketNumber).toArrayLike(Buffer, "le", 4),
        ],
        program.programId
      );

      // Get the actual winner's public key from the ticket account
      const winnerTicketAccount = await program.provider.connection.getAccountInfo(winnerTicketPda);
      if (!winnerTicketAccount) {
        throw new Error("Winner ticket account not found");
      }

      // Parse the ticket to get the winner's public key
      // The player public key is at offset 8 + 32 = 40 in the ticket account
      const winnerPublicKey = new PublicKey(winnerTicketAccount.data.slice(40, 72));

      const tx = await payoutWinner(
        program,
        lotteryPda,
        wallet,
        winnerTicketPda,
        winnerPublicKey,
        new PublicKey(lotteryData.authority),
        new PublicKey(platformFeeAccount)
      )
      toast.success("Winner paid out successfully!")
      console.log("Payout tx:", tx)
      // Refresh lottery data after payout
      await fetchLottery()
    } catch (error) {
      console.error(error)
      toast.error("Error paying out winner")
    }
  }

  const lamportsToSol = (lamports: any) => {
    if (!lamports) return 0
    // Handle both string and number formats
    const lamportsValue = typeof lamports === 'string' ? parseInt(lamports) : 
                         typeof lamports === 'number' ? lamports :
                         typeof lamports.toNumber === 'function' ? lamports.toNumber() : 0
    return lamportsValue / 1_000_000_000
  }



  if (loading) return <LoadingScreen />
  if (!lotteryData) return <ErrorScreen fetchLottery={fetchLottery} />

  const ticketPrice = lamportsToSol(lotteryData.ticketPrice)
  const totalPrizePool = lamportsToSol(lotteryData.totalPrizePool)
  const lotteryIdNumber = parseInt(lotteryData.lotteryId) || 0
  
  // Determine status based on available data
  let status = "Open"
  if (lotteryData.randomnessFulfilled) {
    status = "Completed"
  } else if (lotteryData.ticketsSold >= lotteryData.maxTickets) {
    status = "Drawing"
  } else {
    // Check if lottery has expired
    const createdAtMs = parseInt(lotteryData.createdAt) * 1000
    const durationMs = parseInt(lotteryData.duration) * 1000
    const endTime = createdAtMs + durationMs
    if (Date.now() > endTime) {
      status = "Drawing"
    }
  }
  console.log("Lottery Data:", lotteryData)
  return (
    <main className="relative min-h-screen bg-black text-white font-sans">
      <Header />

      <section className="relative z-10 pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
              Admin Panel - Round #{lotteryIdNumber}
            </p>
            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl text-white mb-4">Lottery #{lotteryIdNumber}</h1>
            <p className="text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Admin control panel for managing this blockchain lottery with transparent draws and instant payouts on Solana.
            </p>
          </div>

          {/* Lottery Card */}
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-8 backdrop-blur-sm mb-8">
            <StatusControls
              status={status}
              declareWinner={declareWinner}
              payout={payout}
              isPurchased={isPurchased}
              hasWinner={!!lotteryData.winner}
              randomnessFulfilled={lotteryData.randomnessFulfilled}
            />

            <LotteryDetails
              lotteryData={lotteryData}
              ticketPrice={ticketPrice}
              totalPrizePool={totalPrizePool}
              timeLeft={timeLeft}
              lotteryIdNumber={lotteryIdNumber}
            />

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowBuyModal(true)}
                disabled={isPurchased}
                className={`px-8 py-4 rounded-full font-semibold text-lg transition-colors ${
                  isPurchased
                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30 cursor-not-allowed"
                    : "bg-lime-500 hover:bg-lime-400 text-black"
                }`}
              >
                {isPurchased ? "✓ Tickets Purchased" : "Buy Tickets"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <BuyTicketModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        lotteryId={id as string}
        ticketPrice={ticketPrice}
      />
    </main>
  )
}

// Components for cleaner code
const LoadingScreen = () => (
  <main className="relative min-h-screen bg-black text-white font-sans">
    <Header />
    <section className="relative z-10 pt-20 pb-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 border-2 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg">Loading lottery details...</p>
        </div>
      </div>
    </section>
    <Footer />
  </main>
)

const ErrorScreen = ({ fetchLottery }: { fetchLottery: () => void }) => (
  <main className="relative min-h-screen bg-black text-white font-sans">
    <Header />
    <section className="relative z-10 pt-20 pb-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center py-20">
          <p className="text-red-400 text-lg">Failed to load lottery details</p>
          <button
            onClick={fetchLottery}
            className="mt-4 px-6 py-2 bg-lime-500 hover:bg-lime-400 text-black rounded-lg font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </section>
    <Footer />
  </main>
)

const StatusControls = ({
  status,
  declareWinner,
  payout,
  isPurchased,
  hasWinner,
  randomnessFulfilled,
}: {
  status: string
  declareWinner: () => void
  payout: () => void
  isPurchased: boolean
  hasWinner: boolean
  randomnessFulfilled: boolean
}) => (
  <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-lime-500/20 text-lime-400 border border-lime-500/30">
        <div className="w-2 h-2 bg-lime-400 rounded-full mr-2 animate-pulse"></div>
        {status.toUpperCase()}
      </span>
      {isPurchased && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/30">
          ✓ PURCHASED
        </span>
      )}
      {randomnessFulfilled && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
          🎲 RANDOMNESS FULFILLED
        </span>
      )}
      {hasWinner && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          🏆 WINNER SELECTED
        </span>
      )}
    </div>

    <div className="flex gap-3 flex-wrap">
      {!randomnessFulfilled && (
        <button 
          onClick={declareWinner} 
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold transition-colors"
        >
          🎲 Declare Winner
        </button>
      )}
      {hasWinner && randomnessFulfilled && (
        <button 
          onClick={payout} 
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
        >
          💰 Payout Winner
        </button>
      )}
    </div>
  </div>
)

const LotteryDetails = ({ lotteryData, ticketPrice, totalPrizePool, timeLeft, lotteryIdNumber }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div className="space-y-4">
      <div>
        <label className="text-xs text-zinc-400 uppercase tracking-wide">Organizer</label>
        <div className="mt-1 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <code className="text-sm text-zinc-200 break-all">{lotteryData.authority.toString()}</code>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-zinc-400 uppercase tracking-wide">Ticket Price</label>
          <div className="mt-1 text-xl font-bold text-lime-400">{ticketPrice.toFixed(3)} SOL</div>
        </div>
        <div>
          <label className="text-xs text-zinc-400 uppercase tracking-wide">Round Number</label>
          <div className="mt-1 text-xl font-bold text-white">#{lotteryIdNumber}</div>
        </div>
      </div>

      {lotteryData.winner !== null && lotteryData.winner !== undefined && (
        <div>
          <label className="text-xs text-zinc-400 uppercase tracking-wide">Winner Ticket #</label>
          <div className="mt-1 p-3 bg-green-800/20 rounded-lg border border-green-700">
            <code className="text-sm text-green-200 break-all">Ticket #{lotteryData.winner}</code>
          </div>
        </div>
      )}
    </div>

    <div className="space-y-4">
      <div>
        <label className="text-xs text-zinc-400 uppercase tracking-wide">Prize Pool</label>
        <div className="mt-1 text-3xl font-bold text-white">{totalPrizePool.toFixed(3)} SOL</div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 uppercase tracking-wide">Tickets Sold</label>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-lg font-semibold text-white">
            {lotteryData.ticketsSold} / {lotteryData.maxTickets}
          </span>
          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-lime-500 to-lime-400 rounded-full"
              style={{ width: `${(lotteryData.ticketsSold / lotteryData.maxTickets) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 uppercase tracking-wide">Time Remaining</label>
        <div className="mt-1 text-lg font-semibold text-orange-400">{formatDuration(timeLeft)}</div>
      </div>
    </div>
  </div>
)