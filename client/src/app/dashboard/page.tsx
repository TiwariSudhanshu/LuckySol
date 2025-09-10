"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useProgram } from "@/lib/useProgram"
import { useState } from "react"

const sampleLotteries = {
  explore: [
    { id: 129, name: "Daily Draw", prize: "720.00 SOL", endsIn: "01:22:15", ticketsSold: "1,840", status: "Live" },
    { id: 130, name: "Mega Pool", prize: "3,450.00 SOL", endsIn: "05:09:41", ticketsSold: "7,215", status: "Live" },
    { id: 131, name: "Weekend Special", prize: "980.00 SOL", endsIn: "12:44:03", ticketsSold: "2,067", status: "Live" },
  ],
  bought: [
    {
      id: 125,
      name: "Flash Round",
      prize: "265.00 SOL",
      endsIn: "Ended",
      ticketsSold: "611",
      status: "Completed",
      myTickets: 5,
    },
    {
      id: 127,
      name: "Night Owl",
      prize: "410.00 SOL",
      endsIn: "02:19:28",
      ticketsSold: "903",
      status: "Live",
      myTickets: 3,
    },
    {
      id: 128,
      name: "Community Pot",
      prize: "1,120.00 SOL",
      endsIn: "08:15:10",
      ticketsSold: "3,402",
      status: "Live",
      myTickets: 8,
    },
  ],
  created: [
    {
      id: 135,
      name: "My Custom Draw",
      prize: "150.00 SOL",
      endsIn: "24:00:00",
      ticketsSold: "45",
      status: "Live",
      creator: true,
    },
    {
      id: 136,
      name: "Private Pool",
      prize: "500.00 SOL",
      endsIn: "Ended",
      ticketsSold: "200",
      status: "Completed",
      creator: true,
    },
    {
      id: 137,
      name: "Friends Only",
      prize: "75.00 SOL",
      endsIn: "06:30:15",
      ticketsSold: "12",
      status: "Live",
      creator: true,
    },
  ],
}

export default function DashboardPage() {
  const program = useProgram()
  const [activeTab, setActiveTab] = useState("explore")
  console.log("Program:", program?.account)

  const renderLotteryCard = (lottery: any, type: string) => (
    <div
      key={lottery.id}
      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-colors hover:border-zinc-700"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{lottery.name}</h3>
          <p className="mt-0.5 text-xs text-zinc-400">Round #{lottery.id}</p>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
            lottery.status === "Live"
              ? "border-lime-500/30 bg-lime-900 text-white"
              : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
          }`}
        >
          {lottery.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-zinc-400">Prize</dt>
          <dd className="mt-0.5 font-semibold text-white">{lottery.prize}</dd>
        </div>
        <div>
          <dt className="text-zinc-400">{lottery.status === "Live" ? "Ends In" : "Status"}</dt>
          <dd className="mt-0.5 font-semibold text-white">{lottery.endsIn}</dd>
        </div>
        <div>
          <dt className="text-zinc-400">Tickets Sold</dt>
          <dd className="mt-0.5 text-white">{lottery.ticketsSold}</dd>
        </div>
        {type === "bought" && (
          <div>
            <dt className="text-zinc-400">My Tickets</dt>
            <dd className="mt-0.5 text-white">{lottery.myTickets}</dd>
          </div>
        )}
        {type !== "bought" && (
          <div>
            <dt className="text-zinc-400">Status</dt>
            <dd className="mt-0.5 text-white">{lottery.status === "Live" ? "Open" : "Closed"}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          {type === "explore" && lottery.status === "Live" && "Join before the timer ends."}
          {type === "bought" && lottery.status === "Live" && "You have tickets in this draw."}
          {type === "bought" && lottery.status === "Completed" && "Draw completed."}
          {type === "created" && lottery.creator && "You created this lottery."}
        </p>
        {type === "explore" && lottery.status === "Live" && (
          <Link
            href="/buy-tickets"
            className="rounded-full bg-lime-500 px-4 py-2 text-sm font-semibold text-black hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
          >
            Join Now
          </Link>
        )}
        {type === "bought" && (
          <Link
            href="/my-tickets"
            className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            View Details
          </Link>
        )}
        {type === "created" && (
          <Link
            href={`/lottery/${lottery.id}`}
            className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            Manage
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <>
      <main className="relative min-h-dvh bg-black text-white font-sans">
        {/* Header */}
        <Header />

        <section className="relative z-10 px-4 pt-10 md:pt-16">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-pretty text-center text-3xl font-extrabold leading-tight md:text-5xl">
              Lottery Dashboard
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-zinc-300 md:text-base">
              Manage your lottery experience - explore new draws, track your tickets, and manage your created lotteries.
            </p>

            {/* Tab Navigation */}
            <div className="mt-8 flex justify-center">
              <div className="flex rounded-full border border-zinc-800 bg-zinc-950/70 p-1">
                <button
                  onClick={() => setActiveTab("explore")}
                  className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                    activeTab === "explore" ? "bg-lime-500 text-black" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  Explore Lotteries
                </button>
                <button
                  onClick={() => setActiveTab("bought")}
                  className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                    activeTab === "bought" ? "bg-lime-500 text-black" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  Bought Lotteries
                </button>
                <button
                  onClick={() => setActiveTab("created")}
                  className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                    activeTab === "created" ? "bg-lime-500 text-black" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  Created Lotteries
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 border-t border-zinc-900">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-pretty text-2xl font-bold md:text-3xl">
                  {activeTab === "explore" && "Explore Running Lotteries"}
                  {activeTab === "bought" && "Your Lottery Tickets"}
                  {activeTab === "created" && "Your Created Lotteries"}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {activeTab === "explore" && "Pick an active round to join right now."}
                  {activeTab === "bought" && "Track your purchased tickets and winnings."}
                  {activeTab === "created" && "Manage the lotteries you've created."}
                </p>
              </div>
              {activeTab === "created" && (
                <Link
                  href="/create"
                  className="flex items-center gap-2 rounded-full bg-lime-500 px-4 py-2 text-sm font-semibold text-black hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New
                </Link>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeTab === "explore" &&
                sampleLotteries.explore.map((lottery) => renderLotteryCard(lottery, "explore"))}
              {activeTab === "bought" && sampleLotteries.bought.map((lottery) => renderLotteryCard(lottery, "bought"))}
              {activeTab === "created" &&
                sampleLotteries.created.map((lottery) => renderLotteryCard(lottery, "created"))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}
