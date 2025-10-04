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
import {
  payoutWinner,
  fulfillRandomness,
  getLotteryByPda,
} from "@/lib/transactions"

interface LotteryData {
  authority: PublicKey
  bump: number
  createdAt: number
  id: string
  lotteryId: any
  maxTickets: number
  randomnessFulfilled: boolean
  state: any
  ticketPrice: any
  ticketsSold: number
  totalPrizePool: any
  winner: PublicKey | null
  duration: number 
}

const formatTime = (seconds: number) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
};

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
      const lotteryAccount = await (program.account as any).lottery.fetch(
        new PublicKey(id)
      )
      setLotteryData(lotteryAccount)
      setLoading(false)
      toast.success("Lottery fetched successfully!")

      // Set countdown timer
      const now = Math.floor(Date.now() / 1000)
      const endTime = lotteryAccount.createdAt.toNumber() + lotteryAccount.duration
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
    const isAuthority = lottery.authority.toBase58() === wallet.publicKey.toBase58();
    if (!isAuthority) {
      toast.error("You are not the lottery authority!");
      return;
    }

    // Check if the lottery is in the correct state
    const lotteryState = Object.keys(lottery.state)[0]; // e.g., "waitingForTickets", "waitingForRandomness"
    if (lotteryState !== "waitingForRandomness") {
      toast.error(`Lottery not ready for randomness. Current state: ${lotteryState}`);
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
      const tx = await payoutWinner(
        program,
        new PublicKey(id),
        wallet,
        lotteryData.winner,
        lotteryData.authority,
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
    if (!lamports || typeof lamports.toNumber !== "function") return 0
    return lamports.toNumber() / 1_000_000_000
  }

  const getLotteryStatus = (state: any) => {
    if (state?.waitingForTickets) return "Open"
    if (state?.drawing) return "Drawing"
    if (state?.completed) return "Completed"
    return "Unknown"
  }

  if (loading) return <LoadingScreen />
  if (!lotteryData) return <ErrorScreen fetchLottery={fetchLottery} />

  const ticketPrice = lamportsToSol(lotteryData.ticketPrice)
  const totalPrizePool = lamportsToSol(lotteryData.totalPrizePool)
  const status = getLotteryStatus(lotteryData.state)
  const lotteryIdNumber = lotteryData.lotteryId?.toNumber() || 0
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

      {lotteryData.winner && (
        <div>
          <label className="text-xs text-zinc-400 uppercase tracking-wide">Winner</label>
          <div className="mt-1 p-3 bg-green-800/20 rounded-lg border border-green-700">
            <code className="text-sm text-green-200 break-all">{lotteryData.winner.toString()}</code>
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
        <div className="mt-1 text-lg font-semibold text-orange-400">{formatTime(timeLeft)}</div>
      </div>
    </div>
  </div>
)