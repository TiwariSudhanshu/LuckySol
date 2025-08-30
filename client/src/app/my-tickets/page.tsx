"use client"

import Link from "next/link"

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
            Your entries
          </p>
          <h1 className="text-balance text-center text-3xl font-extrabold leading-tight md:text-5xl">My Tickets</h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-zinc-300 md:text-base">
            Review your recent LuckySol tickets. Sample data only—no live statuses.
          </p>
        </div>
      </section>

      {/* Tickets */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoTickets.map((t) => (
              <div key={t.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">{t.id}</h2>
                  <StatusPill status={t.status} />
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-400">Round</dt>
                    <dd className="font-medium text-white">#{t.round}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-400">Purchased</dt>
                    <dd className="font-medium text-white">{t.purchasedAt}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-xl bg-lime-500 px-3 py-2 text-sm font-semibold text-black hover:bg-lime-400"
                  >
                    Connect Wallet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
