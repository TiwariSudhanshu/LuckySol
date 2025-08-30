"use client"

import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"

const Dashboard: NextPage = () => {
  return (
    <>
      <Head>
        <title>LuckySol — Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-dvh bg-black text-white">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-zinc-900/80 bg-black/70 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              <span className="text-lime-400">Lucky</span>Sol
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white">
                Home
              </Link>
              <Link
                href="/buy-tickets"
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white"
              >
                Buy Tickets
              </Link>
              <Link
                href="/my-tickets"
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white"
              >
                My Tickets
              </Link>
              <Link href="/results" className="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white">
                Results
              </Link>
              <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white">
                Admin
              </Link>
              <button
                type="button"
                className="ml-2 inline-flex items-center rounded-full bg-lime-500 px-4 py-2 text-sm font-semibold text-black hover:bg-lime-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
              >
                Connect Wallet
              </button>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-4 pt-12 md:px-6 md:pt-16">
          <p className="text-center text-xs font-semibold tracking-widest text-lime-400 md:text-sm">
            CURRENT ROUND • UI ONLY
          </p>
          <h1 className="text-pretty mt-3 text-center text-3xl font-extrabold tracking-tight md:text-5xl">
            Current Lottery Round: #128
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-zinc-400 md:text-base">
            Participate in the current round and stand a chance to win the prize pool.
          </p>
        </section>

        {/* Stats */}
        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs text-zinc-400">Prize Pool</p>
              <p className="mt-2 text-2xl font-bold text-white">1,250.00 SOL</p>
              <p className="mt-1 text-xs text-zinc-500">Updated in real-time (placeholder)</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs text-zinc-400">Tickets Sold</p>
              <p className="mt-2 text-2xl font-bold text-white">3,210</p>
              <p className="mt-1 text-xs text-zinc-500">Total for current round (placeholder)</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs text-zinc-400">Time Remaining</p>
              <p className="mt-2 text-2xl font-bold text-white">00:12:34</p>
              <p className="mt-1 text-xs text-zinc-500">Countdown placeholder</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-lg font-semibold">How it works</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
                <li>Connect your wallet and buy tickets.</li>
                <li>Each ticket increases your chances.</li>
                <li>When the timer ends, a winner is drawn.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/buy-tickets"
                  className="rounded-full bg-lime-500 px-4 py-2 text-sm font-semibold text-black hover:bg-lime-400"
                >
                  Buy Tickets
                </Link>
                <Link
                  href="/my-tickets"
                  className="rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-600"
                >
                  View My Tickets
                </Link>
                <Link
                  href="/results"
                  className="rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-600"
                >
                  View Results
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default Dashboard
