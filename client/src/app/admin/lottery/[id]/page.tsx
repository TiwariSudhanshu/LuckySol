"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import BuyTicketModal from "@/components/BuyTicketModal"
import { useProgram } from "@/lib/useProgram"
import { toast } from "sonner"
import { PublicKey } from "@solana/web3.js"
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react"
import { startLottery } from "@/lib/transactions"

interface LotteryData {
  authority: any
  bump: number
  createdAt: any
  id: string
  lotteryId: any
  maxTickets: number
  randomnessFulfilled: boolean
  state: any
  ticketPrice: any
  ticketsSold: number
  totalPrizePool: any
  winner: any
}

export default function AdminLotteryPage() {
  const params = useParams()
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [lotteryData, setLotteryData] = useState<LotteryData | null>(null)
  const [loading, setLoading] = useState(true)
  const program = useProgram()
  const id = params.id
  const wallet = useAnchorWallet();
  const fetchLottery = async () => {
    try {
      if (!program) {
        toast.error("Program not initialized")
        return
      }

      if (!id) {
        toast.error("Lottery ID not found in URL")
        return
      }

      console.log("Fetching lottery with id:", id)

      const lotteryAccount = await (program.account as any).lottery.fetch(
        new PublicKey(id), // 👈 params.id is the PDA string
      )
      

      console.log("Fetched lottery:", lotteryAccount)
      setLotteryData(lotteryAccount)
      setLoading(false)
      toast.success("Lottery fetched successfully!")
    } catch (error) {
      console.error("Error fetching lottery:", error)
      setLoading(false)
      toast.error("Error fetching lottery")
    }
  }

  const startRound = async () => {
    if (!program) {
      console.log("Program not initialized");
      return;
    }
    if (!wallet) {
      console.log("No wallet found");
      return;
    }
    if (!id) {
      console.log("No lottery ID found in URL");
      return;
    }

    try {
      const tx = await startLottery(program, new PublicKey(id), wallet);
      console.log("Round started with tx:", tx);
      toast.success("Round started successfully!");
    } catch (error) {
      console.log("Error starting round:", error);
      toast.error("Error starting round");
    }
  }

  useEffect(() => {
    if (program && id) {
      fetchLottery()
    }
  }, [program, id])

  const lamportsToSol = (lamports: any) => {
    if (!lamports || typeof lamports.toNumber !== "function") return 0
    return lamports.toNumber() / 1000000000 // 1 SOL = 1,000,000,000 lamports
  }

  const getLotteryStatus = (state: any) => {
    if (state?.waitingForTickets) return "Open"
    if (state?.drawing) return "Drawing"
    if (state?.completed) return "Completed"
    return "Unknown"
  }


  const handleEndRound = () => {
    console.log("[v0] Admin: Ending round")
    toast.success("Round ended!")
  }

  const handleDeclareResults = () => {
    console.log("[v0] Admin: Declaring results")
    toast.success("Results declared!")
  }

  const handleBuyTicket = () => {
    setShowBuyModal(true)
  }

  const handlePurchaseComplete = () => {
    setIsPurchased(true)
    setShowBuyModal(false)
  }

  if (loading) {
    return (
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
  }

  if (!lotteryData) {
    return (
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
  }

  const ticketPrice = lamportsToSol(lotteryData.ticketPrice)
  const totalPrizePool = lamportsToSol(lotteryData.totalPrizePool)
  const status = getLotteryStatus(lotteryData.state)
  const lotteryIdNumber = lotteryData.lotteryId?.toNumber() || 0

  return (
    <main className="relative min-h-screen bg-black text-white font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
              Admin Panel - Round #{lotteryIdNumber}
            </p>
            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl text-white mb-4">Lottery #{lotteryIdNumber}</h1>
            <p className="text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Admin control panel for managing this blockchain lottery with transparent draws and instant payouts on
              Solana.
            </p>
          </div>

          {/* Main Admin Card */}
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-8 backdrop-blur-sm mb-8">
            {/* Status and Admin Controls */}
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
              </div>

              <div className="flex gap-3">
                {status === "Open" && (
                  <button
                    onClick={startRound}
                    className="px-4 py-2 bg-lime-500 hover:bg-lime-400 text-black rounded-lg font-semibold text-sm transition-colors"
                  >
                    Start Round
                  </button>
                )}

                {status === "Open" && (
                  <button
                    onClick={handleEndRound}
                    className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg font-semibold text-sm transition-colors"
                  >
                    End Round
                  </button>
                )}

                {status === "Completed" && (
                  <button
                    onClick={handleDeclareResults}
                    className="px-4 py-2 bg-violet-500 hover:bg-violet-400 text-white rounded-lg font-semibold text-sm transition-colors"
                  >
                    Declare Results
                  </button>
                )}
              </div>
            </div>

            {/* Lottery Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Column */}
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
              </div>

              {/* Right Column */}
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
                  <div className="mt-1 text-lg font-semibold text-orange-400">24:00:00</div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              {isPurchased ? (
                <button
                  disabled
                  className="px-8 py-4 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-full font-semibold text-lg cursor-not-allowed"
                >
                  ✓ Tickets Purchased
                </button>
              ) : (
                <button
                  onClick={handleBuyTicket}
                  className="px-8 py-4 bg-lime-500 hover:bg-lime-400 text-black rounded-full font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  Buy Tickets
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6">Results</h2>

            {status === "Open" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 border-2 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-zinc-400 text-lg">Results will be declared soon...</p>
                <p className="text-zinc-500 text-sm mt-2">Winners will be announced after the round ends</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-zinc-400 text-lg">Results have been declared!</p>
                <p className="text-zinc-500 text-sm mt-2">Check back for winner announcements</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* Buy Ticket Modal */}
      <BuyTicketModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        lotteryId={id as string}
        ticketPrice={ticketPrice}
      />
    </main>
  )
}
