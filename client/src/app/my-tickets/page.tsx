"use client"

import Link from "next/link"
import BgElements from "@/components/bgElements"

type Status = "Pending" | "Won" | "Lost"

const demoTickets: { id: string; round: number; status: Status; purchasedAt: string }[] = [
  { id: "LS-001234", round: 42, status: "Pending", purchasedAt: "2025-08-01 10:24" },
  { id: "LS-001235", round: 41, status: "Won", purchasedAt: "2025-07-25 13:10" },
  { id: "LS-001236", round: 40, status: "Lost", purchasedAt: "2025-07-18 09:02" },
]

function StatusPill({ status }: { status: Status }) {
  const cls =
    status === "Won"
      ? "bg-lime-400 text-black"
      : status === "Pending"
        ? "bg-amber-300 text-black"
        : "bg-pink-400 text-black"
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{status}</span>
  )
}

export default function MyTicketsPage() {
  const total = demoTickets.length
  const wins = demoTickets.filter((t) => t.status === "Won").length
  const pending = demoTickets.filter((t) => t.status === "Pending").length

  return (
    <main className="relative min-h-dvh bg-black text-white font-sans">
      <BgElements />

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
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 md:pt-14 md:pb-8">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
            Your entries
          </p>
          <h1 className="text-balance text-center text-3xl font-extrabold leading-tight md:text-5xl">My Tickets</h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-zinc-300 md:text-base">
            Review your recent LuckySol tickets. Sample data only—no live statuses.
          </p>
        </div>
      </section>

      <section className="relative z-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 pb-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-wider text-zinc-400">Total Tickets</div>
            <div className="mt-2 text-3xl font-bold text-white">{total}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-wider text-zinc-400">Wins</div>
            <div className="mt-2 text-3xl font-bold text-white">{wins}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-wider text-zinc-400">Pending</div>
            <div className="mt-2 text-3xl font-bold text-white">{pending}</div>
          </div>
        </div>
      </section>

      {/* Toolbar for filters/sorting */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pb-2">
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <button className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-900">
                All
              </button>
              <button className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-900">
                Pending
              </button>
              <button className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-900">
                Won
              </button>
              <button className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-900">
                Lost
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-zinc-800 bg-black px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-900">
                Sort by: Recent
              </button>
              <button className="rounded-xl bg-lime-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-lime-400">
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tickets - wider boxes layout */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid grid-cols-1 gap-4">
            {demoTickets.map((t) => (
              <div key={t.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="hidden size-10 shrink-0 rounded-xl bg-lime-500 md:block" aria-hidden="true" />
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-sm font-semibold text-white">{t.id}</h2>
                        <StatusPill status={t.status} />
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:grid-cols-3">
                        <div className="flex items-center justify-between md:justify-start md:gap-2">
                          <dt className="text-zinc-400">Round</dt>
                          <dd className="font-medium text-white">#{t.round}</dd>
                        </div>
                        <div className="flex items-center justify-between md:justify-start md:gap-2">
                          <dt className="text-zinc-400">Purchased</dt>
                          <dd className="font-medium text-white">{t.purchasedAt}</dd>
                        </div>
                        <div className="hidden items-center justify-between md:flex md:justify-start md:gap-2">
                          <dt className="text-zinc-400">Mode</dt>
                          <dd className="font-medium text-white">Standard</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="flex w-full items-center gap-2 md:w-auto">
                    <button
                      type="button"
                      className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 md:w-auto"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-xl bg-lime-500 px-3 py-2 text-sm font-semibold text-black hover:bg-lime-400 md:w-auto"
                    >
                      Connect Wallet
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {demoTickets.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-8 text-center text-sm text-zinc-300">
              You don’t have any tickets yet.{" "}
              <Link href="/buy-tickets" className="font-semibold text-lime-400 hover:text-lime-300">
                Buy your first ticket
              </Link>
              .
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
