"use client"

import Link from "next/link"

const demoResults = [
  { round: 41, winner: "3hX...9Qf", prize: "120 SOL", date: "2025-07-25" },
  { round: 40, winner: "7kM...2Lp", prize: "98 SOL", date: "2025-07-18" },
  { round: 39, winner: "9sP...1Gc", prize: "105 SOL", date: "2025-07-11" },
  { round: 38, winner: "5rZ...7Nt", prize: "87 SOL", date: "2025-07-04" },
]

export default function ResultsPage() {
  return (
    <main className="relative min-h-dvh bg-black text-white font-sans">
      {/* Decorative confetti */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-8 left-6 size-2 rounded-full bg-lime-500" />
        <div className="absolute top-16 right-10 h-2 w-4 rotate-12 rounded bg-pink-400" />
        <div className="absolute top-28 left-1/3 size-2 rounded-full bg-violet-400" />
        <div className="absolute top-40 right-1/4 h-3 w-3 -rotate-12 rounded-sm bg-lime-500" />
        <div className="absolute top-64 left-10 h-2 w-5 rotate-45 rounded bg-violet-400" />
        <div className="absolute top-72 right-8 size-2 rounded-full bg-pink-400" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:py-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-lime-500" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-wide">LuckySol</span>
          </Link>
          <nav className="hidden items-center gap-3 md:flex">
            <Link href="/buy-tickets" className="rounded px-3 py-2 text-sm text-zinc-300 hover:text-white">
              Buy Tickets
            </Link>
            <Link href="/my-tickets" className="rounded px-3 py-2 text-sm text-zinc-300 hover:text-white">
              My Tickets
            </Link>
            <Link href="/results" className="rounded px-3 py-2 text-sm text-zinc-300 hover:text-white">
              Results
            </Link>
            <Link href="/admin" className="rounded px-3 py-2 text-sm text-zinc-300 hover:text-white">
              Admin
            </Link>
            <button
              type="button"
              className="rounded-full bg-lime-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
              onClick={() => {}}
              aria-label="Connect Wallet"
            >
              Connect Wallet
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 md:pt-14 md:pb-10">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
            LuckySol history
          </p>
          <h1 className="text-balance text-center text-3xl font-extrabold leading-tight md:text-5xl">
            Results & Winners
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-zinc-300 md:text-base">
            Explore past rounds and prize distributions. UI-only preview with sample data.
          </p>
        </div>
      </section>

      {/* Results Table-like list */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pb-16">
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 backdrop-blur">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 p-6">
                <thead>
                  <tr className="text-left text-sm text-zinc-300">
                    <th className="px-6 py-2">Round</th>
                    <th className="px-6 py-2">Winner</th>
                    <th className="px-6 py-2">Prize</th>
                    <th className="px-6 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {demoResults.map((r) => (
                    <tr key={r.round}>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center rounded-lg bg-black px-3 py-1 font-semibold ring-1 ring-zinc-800">
                          #{r.round}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-medium text-white">{r.winner}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-semibold text-lime-400">{r.prize}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-zinc-300">{r.date}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-900 px-6 py-4 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-violet-400" />
                UI-only preview • No on-chain data
              </span>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-zinc-800 bg-black px-3 py-1.5 text-zinc-300 hover:bg-zinc-900">
                  Previous
                </button>
                <button className="rounded-lg border border-zinc-800 bg-black px-3 py-1.5 text-zinc-300 hover:bg-zinc-900">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
