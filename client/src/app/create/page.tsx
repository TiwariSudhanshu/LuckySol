"use client"

import generateLotteryId from "@/lib/generateLotteryId"
import { createLottery } from "@/lib/transactions"
import { useProgram } from "@/lib/useProgram"
import { useAnchorWallet } from "@solana/wallet-adapter-react"
import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

export default function CreateLottery() {
  const [ticketPrice, setTicketPrice] = useState("")
  const [maxTickets, setMaxTickets] = useState("")
  const [days, setDays] = useState("0")
  const [hours, setHours] = useState("0")
  const [minutes, setMinutes] = useState("0")
  const [isLoading, setIsLoading] = useState(false)

  const program = useProgram()
  const wallet = useAnchorWallet()

  // Convert days, hours, minutes to seconds
  const getDurationInSeconds = () => {
    const d = Number(days) || 0
    const h = Number(hours) || 0
    const m = Number(minutes) || 0
    return d * 24 * 3600 + h * 3600 + m * 60
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const lotteryId = generateLotteryId()
    const duration = getDurationInSeconds()

    console.log("Creating lottery with:", { lotteryId, ticketPrice, maxTickets, duration })

    try {
      if (!program || !wallet) {
        toast.error("Wallet or program not ready")
        return
      }

      const tx = await createLottery(
        lotteryId,
        Number(ticketPrice),
        Number(maxTickets),
        duration, // pass duration in seconds
        program,
        wallet
      )

      if (tx) {
        console.log("Transaction sent:", tx)
        toast.success("Lottery created successfully!")
        setTicketPrice("")
        setMaxTickets("")
        setDays("0")
        setHours("0")
        setMinutes("0")
      }
    } catch (error) {
      console.error("Error creating lottery:", error)
      toast.error("Failed to create lottery")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative z-10 bg-zinc-950 py-28 md:py-36">
      <div className="mx-auto w-full max-w-2xl px-6 md:px-16">
        <div className="text-center mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
            LuckySol Platform
          </p>
          <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl text-white">
            Create New Lottery
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-base md:text-lg leading-relaxed text-zinc-300">
            Set up your own decentralized lottery with custom ticket prices, participant limits, and duration.
            All draws are verifiable on-chain with instant payouts.
          </p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900 shadow-xl rounded-lg">
          <div className="text-center p-6 pb-0">
            <h2 className="text-xl font-semibold text-white">Lottery Configuration</h2>
            <p className="text-zinc-400 mt-2">Configure your lottery parameters below</p>
          </div>
          <div className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Ticket Price */}
              <div className="space-y-2">
                <label htmlFor="ticket-price" className="block text-sm font-medium text-zinc-200">
                  Ticket Price (SOL)
                </label>
                <input
                  id="ticket-price"
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="0.1"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none"
                  required
                />
                <p className="text-xs text-zinc-400">Minimum ticket price is 0.001 SOL</p>
              </div>

              {/* Max Tickets */}
              <div className="space-y-2">
                <label htmlFor="max-tickets" className="block text-sm font-medium text-zinc-200">
                  Maximum Tickets
                </label>
                <input
                  id="max-tickets"
                  type="number"
                  min="10"
                  max="10000"
                  placeholder="1000"
                  value={maxTickets}
                  onChange={(e) => setMaxTickets(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none"
                  required
                />
                <p className="text-xs text-zinc-400">Set between 10 and 10,000 tickets</p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-200">Lottery Duration</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Days"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-1/3 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="Hours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-1/3 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Minutes"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-1/3 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-xs text-zinc-400">Set the duration in days, hours, and minutes</p>
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4">
                <h3 className="text-sm font-semibold text-lime-400 mb-2">Lottery Summary</h3>
                <div className="space-y-1 text-sm text-zinc-300">
                  <div className="flex justify-between">
                    <span>Ticket Price:</span>
                    <span className="text-white">{ticketPrice || "0"} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Tickets:</span>
                    <span className="text-white">{maxTickets || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-white">{getDurationInSeconds()}s</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-700 pt-2 mt-2">
                    <span className="font-semibold">Max Prize Pool:</span>
                    <span className="text-lime-400 font-semibold">
                      {ticketPrice && maxTickets
                        ? (Number.parseFloat(ticketPrice) * Number.parseInt(maxTickets)).toFixed(3)
                        : "0"}{" "}
                      SOL
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !ticketPrice || !maxTickets}
                className="w-full rounded-full bg-lime-500 px-8 py-3 text-lg font-semibold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Creating Lottery...
                  </div>
                ) : (
                  "Create Lottery"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
