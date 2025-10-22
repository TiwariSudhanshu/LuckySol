"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import BuyTicketModal from "@/components/BuyTicketModal"
import { useProgram } from "@/lib/useProgram"
import { getLotteryByPda, formatDuration } from "@/lib/transactions"
import { toast } from "sonner"
import { PublicKey } from "@solana/web3.js"

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
}

export default function LotteryPage() {
  const params = useParams()
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [lotteryData, setLotteryData] = useState<LotteryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState("00d 00h 00m 00s")
  const program = useProgram()
  const id = params.id

  const fetchlottery = async () => {
    try {
      if (!program) {
        toast.error("Program not initialized")
        return
      }
      if (!id) {
        toast.error("Lottery ID not found in URL")
        return
      }

      console.log(`Fetching lottery details for ID: ${id}`);
      const lotteryAccount = await getLotteryByPda(program, new PublicKey(id as string));

      if (!lotteryAccount) {
        toast.error("Lottery not found")
        setLoading(false)
        return
      }

      console.log('Fetched lottery data:', lotteryAccount);
      setLotteryData({
        ...lotteryAccount,
        id: lotteryAccount.id
      })
      setLoading(false)
      toast.success("Lottery fetched successfully!")
    } catch (error) {
      console.error("Error fetching lottery:", error)
      setLoading(false)
      toast.error("Error fetching lottery")
    }
  }

  useEffect(() => {
    if (program && id) {
      fetchlottery()
    }
  }, [program, id])

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

  // 🕒 Countdown Timer
  useEffect(() => {
    if (!lotteryData?.createdAt || !lotteryData?.duration) return

    const createdAtMs = parseInt(lotteryData.createdAt) * 1000
    const durationMs = parseInt(lotteryData.duration) * 1000
    const endTime = createdAtMs + durationMs

    const updateTimer = () => {
      const now = Date.now()
      const diff = Math.max(endTime - now, 0)
      
      // Convert milliseconds back to seconds and use our shared formatDuration utility
      const remainingSeconds = Math.floor(diff / 1000)
      setTimeRemaining(formatDuration(remainingSeconds))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [lotteryData])

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
                onClick={fetchlottery}
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
  const prizePool = ticketPrice * lotteryData.maxTickets // ✅ FIXED: maxTickets × ticketPrice
  const lotteryIdNumber = lotteryData.lotteryId || ''
  const displayLotteryId = typeof lotteryIdNumber === 'string' && lotteryIdNumber.length > 12
    ? `${lotteryIdNumber.slice(0,8)}...${lotteryIdNumber.slice(-4)}`
    : lotteryIdNumber
  
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

  return (
    <main className="relative min-h-screen bg-black text-white font-sans">
      <Header />

      <section className="relative z-10 pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-400 break-words">
              Round #{displayLotteryId}
            </p>
            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl text-white mb-4 break-words">
              Lottery #{displayLotteryId}
            </h1>
            <p className="text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Join this blockchain lottery with transparent draws and instant payouts on Solana.
            </p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-8 backdrop-blur-sm mb-8">
            <div className="flex items-center justify-between mb-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wide">Organizer</label>
                  <div className="mt-1 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <code className="text-sm text-zinc-200 break-all">
                      {lotteryData.authority.toString()}
                    </code>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 uppercase tracking-wide">Ticket Price</label>
                    <div className="mt-1 text-xl font-bold text-lime-400">
                      {ticketPrice.toFixed(3)} SOL
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 uppercase tracking-wide">Round Number</label>
                    <div className="mt-1 text-xl font-bold text-white">#{lotteryIdNumber}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wide">Prize Pool</label>
                  <div className="mt-1 text-3xl font-bold text-white">
                    {prizePool.toFixed(3)} SOL
                  </div>
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
                  <div className="mt-1 text-lg font-semibold text-orange-400">
                    {timeRemaining}
                  </div>
                </div>
              </div>
            </div>

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
                  onClick={() => setShowBuyModal(true)}
                  className="px-8 py-4 bg-lime-500 hover:bg-lime-400 text-black rounded-full font-semibold text-lg transition-colors"
                >
                  Buy Tickets
                </button>
              )}
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
