"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Sample lottery data with admin controls
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
  status: "active", // active, ended, pending
  description: "Join our biggest weekly lottery with guaranteed payouts and transparent draws on Solana blockchain.",
  endDate: "2024-01-15T18:00:00Z",
  roundStarted: true,
  resultDeclared: false,
}

// Sample results data
const sampleResults = [
  { rank: 1, wallet: "7XzC...9kLm", tickets: 15, prize: 34.35 },
  { rank: 2, wallet: "4Bv2...8nQp", tickets: 12, prize: 20.61 },
  { rank: 3, wallet: "9Km1...5rTx", tickets: 8, prize: 13.74 },
  { rank: 4, wallet: "2Nf7...3wYz", tickets: 5, prize: 6.87 },
  { rank: 5, wallet: "8Qp4...1mVc", tickets: 3, prize: 3.44 },
]

export default function AdminLotteryPage() {
  const params = useParams()
  const [lottery, setLottery] = useState(sampleLottery)
  const [results, setResults] = useState(sampleResults)

  const handleStartRound = () => {
    setLottery((prev) => ({ ...prev, roundStarted: true, status: "active" }))
    console.log("[v0] Round started")
  }

  const handleEndRound = () => {
    setLottery((prev) => ({ ...prev, status: "ended", resultDeclared: true }))
    console.log("[v0] Round ended and results declared")
  }

  const handleDeclareResults = () => {
    setLottery((prev) => ({ ...prev, resultDeclared: true }))
    console.log("[v0] Results declared")
  }

  return (
    <main className="relative min-h-screen bg-black text-white font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
              Admin Panel - Round #{lottery.roundNumber}
            </p>
            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl text-white mb-4">{lottery.title}</h1>
            <p className="text-zinc-300 max-w-2xl mx-auto leading-relaxed">{lottery.description}</p>
          </div>

          {/* Main Admin Card */}
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-8 backdrop-blur-sm mb-8">
            {/* Status and Admin Controls */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-lime-500/20 text-lime-400 border border-lime-500/30">
                <div className="w-2 h-2 bg-lime-400 rounded-full mr-2 animate-pulse"></div>
                {lottery.status.toUpperCase()}
              </span>

              <div className="flex gap-3">
                {!lottery.roundStarted ? (
                  <button
                    onClick={handleStartRound}
                    className="px-4 py-2 bg-lime-500 hover:bg-lime-400 text-black rounded-lg font-semibold text-sm transition-colors"
                  >
                    Start Round
                  </button>
                ) : lottery.status === "active" ? (
                  <button
                    onClick={handleEndRound}
                    className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg font-semibold text-sm transition-colors"
                  >
                    End Round
                  </button>
                ) : null}

                {lottery.status === "ended" && !lottery.resultDeclared && (
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
                    <code className="text-sm text-zinc-200 break-all">{lottery.organizer}</code>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 uppercase tracking-wide">Ticket Price</label>
                    <div className="mt-1 text-xl font-bold text-lime-400">{lottery.ticketPrice} SOL</div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 uppercase tracking-wide">Round Number</label>
                    <div className="mt-1 text-xl font-bold text-white">#{lottery.roundNumber}</div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wide">Prize Pool</label>
                  <div className="mt-1 text-3xl font-bold text-white">{lottery.prizePool} SOL</div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wide">Tickets Sold</label>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-lg font-semibold text-white">
                      {lottery.soldTickets} / {lottery.totalTickets}
                    </span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lime-500 to-lime-400 rounded-full"
                        style={{ width: `${(lottery.soldTickets / lottery.totalTickets) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wide">Time Remaining</label>
                  <div className="mt-1 text-lg font-semibold text-orange-400">{lottery.timeRemaining}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6">Results</h2>

            {!lottery.resultDeclared ? (
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

                {results.map((result) => (
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
    </main>
  )
}
