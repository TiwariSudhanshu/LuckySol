"use client"

import type React from "react"
import { useState } from "react"

export default function CreateLottery() {
  const [ticketPrice, setTicketPrice] = useState("")
  const [maxTickets, setMaxTickets] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Creating lottery with:", { ticketPrice, maxTickets })
    setIsLoading(false)
  }

  return (
    <section className="relative z-10 bg-zinc-950 py-28 md:py-36">
      <div className="mx-auto w-full max-w-2xl px-6 md:px-16">
        <div className="text-center mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">LuckySol Platform</p>
          <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl text-white">Create New Lottery</h1>
          <p className="mt-4 max-w-xl mx-auto text-base md:text-lg leading-relaxed text-zinc-300">
            Set up your own decentralized lottery with custom ticket prices and participant limits. All draws are
            verifiable on-chain with instant payouts.
          </p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900 shadow-xl rounded-lg">
          <div className="text-center p-6 pb-0">
            <h2 className="text-xl font-semibold text-white">Lottery Configuration</h2>
            <p className="text-zinc-400 mt-2">Configure your lottery parameters below</p>
          </div>
          <div className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 rounded-full bg-lime-500" />
                </div>
                <p className="text-xs text-zinc-400">Fair & Transparent</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 rounded-full bg-violet-400" />
                </div>
                <p className="text-xs text-zinc-400">Instant Payouts</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 rounded-full bg-pink-400" />
                </div>
                <p className="text-xs text-zinc-400">Blockchain Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
