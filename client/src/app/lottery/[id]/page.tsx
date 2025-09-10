"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import BuyTicketModal from "@/components/BuyTicketModal"

// Sample lottery data
const sampleLottery = {
  id: "1",
  title: "Weekly Mega Draw",
  organizer: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  roundNumber: 42,
  ticketPrice: 0.1,
  totalTickets: 1000,
  soldTickets: 687,
  prizePool: 68.7,
  timeRemaining: "2d 14h 32m",
  status: "active",
  description: "Join our biggest weekly lottery with guaranteed payouts and transparent draws on Solana blockchain.",
  endDate: "2024-01-15T18:00:00Z",
  isPurchased: false, // Dummy status
}

export default function LotteryPage() {
  const params = useParams()
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [isPurchased, setIsPurchased] = useState(sampleLottery.isPurchased)

  const sampleResults = [
    { rank: 1, wallet: "7XzC...9kLm", tickets: 15, prize: 34.35 },
    { rank: 2, wallet: "4Bv2...8nQp", tickets: 12, prize: 20.61 },
    { rank: 3, wallet: "9Km1...5rTx", tickets: 8, prize: 13.74 },
  ]

  const handleBuyTicket = () => {
    setShowBuyModal(true)
  }

  const handlePurchaseComplete = () => {
    setIsPurchased(true)
    setShowBuyModal(false)
  }

  return (
    <main className="relative min-h-screen bg-black text-white font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
              Round #{sampleLottery.roundNumber}
            </p>
            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl text-white mb-4">{sampleLottery.title}</h1>
            <p className="text-zinc-300 max-w-2xl mx-auto leading-relaxed">{sampleLottery.description}</p>
          </div>

          {/* Main Lottery Card */}
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-8 backdrop-blur-sm mb-8">
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-lime-500/20 text-lime-400 border border-lime-500/30">
                <div className="w-2 h-2 bg-lime-400 rounded-full mr-2 animate-pulse"></div>
                {sampleLottery.status.toUpperCase()}
              </span>
              {isPurchased && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  ✓ PURCHASED
                </span>
              )}
            </div>

            {/* Lottery Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wide">Organizer</label>
                  <div className="mt-1 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <code className="text-sm text-zinc-200 break-all">{sampleLottery.organizer}</code>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 uppercase tracking-wide">Ticket Price</label>
                    <div className="mt-1 text-xl font-bold text-lime-400">{sampleLottery.ticketPrice} SOL</div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 uppercase tracking-wide">Round Number</label>
                    <div className="mt-1 text-xl font-bold text-white">#{sampleLottery.roundNumber}</div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wide">Prize Pool</label>
                  <div className="mt-1 text-3xl font-bold text-white">{sampleLottery.prizePool} SOL</div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wide">Tickets Sold</label>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-lg font-semibold text-white">
                      {sampleLottery.soldTickets} / {sampleLottery.totalTickets}
                    </span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lime-500 to-lime-400 rounded-full"
                        style={{ width: `${(sampleLottery.soldTickets / sampleLottery.totalTickets) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wide">Time Remaining</label>
                  <div className="mt-1 text-lg font-semibold text-orange-400">{sampleLottery.timeRemaining}</div>
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

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-zinc-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center mx-auto mb-2">
                    <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                  </div>
                  <p className="text-xs text-zinc-400">Provably Fair</p>
                </div>
                <div>
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
                    <div className="w-3 h-3 rounded-full bg-violet-400"></div>
                  </div>
                  <p className="text-xs text-zinc-400">Instant Payouts</p>
                </div>
                <div>
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-2">
                    <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                  </div>
                  <p className="text-xs text-zinc-400">Blockchain Verified</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6">Results</h2>

            {sampleLottery.status === "active" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 border-2 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-zinc-400 text-lg">Results will be declared soon...</p>
                <p className="text-zinc-500 text-sm mt-2">Winners will be announced after the round ends</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-xs text-zinc-400 uppercase tracking-wide font-semibold border-b border-zinc-800 pb-3">
                  <div>Rank</div>
                  <div>Wallet</div>
                  <div>Tickets</div>
                  <div>Prize</div>
                </div>

                {sampleResults.map((result) => (
                  <div
                    key={result.rank}
                    className="grid grid-cols-4 gap-4 items-center py-3 border-b border-zinc-800/50 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          result.rank === 1
                            ? "bg-yellow-500/20 text-yellow-400"
                            : result.rank === 2
                              ? "bg-gray-500/20 text-gray-400"
                              : result.rank === 3
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        {result.rank}
                      </div>
                    </div>
                    <div>
                      <code className="text-sm text-zinc-200">{result.wallet}</code>
                    </div>
                    <div className="text-zinc-300">{result.tickets}</div>
                    <div className="text-lime-400 font-semibold">{result.prize} SOL</div>
                  </div>
                ))}
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
        lotteryId={sampleLottery.id}
        ticketPrice={sampleLottery.ticketPrice}
      />
    </main>
  )
}
