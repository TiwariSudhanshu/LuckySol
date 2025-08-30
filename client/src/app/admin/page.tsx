"use client"

import Link from "next/link"

export default function AdminPage() {
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
            Admin controls (UI only)
          </p>
          <h1 className="text-balance text-center text-3xl font-extrabold leading-tight md:text-5xl">
            LuckySol Admin Panel
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-zinc-300 md:text-base">
            Start, close, or draw winners for a round. Buttons are non-functional in this preview.
          </p>
        </div>
      </section>

      {/* Admin Actions */}
      <section className="relative z-10">
        <div className="mx-auto w-full max-w-3xl px-4 pb-16">
          <div className="grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur">
            <div className="grid gap-2">
              <label htmlFor="round" className="text-sm text-zinc-300">
                Current Round
              </label>
              <input
                id="round"
                type="text"
                placeholder="e.g., 42"
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-lime-500"
                aria-readonly="true"
                readOnly
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button className="rounded-xl border border-zinc-800 bg-black px-5 py-3 font-semibold text-zinc-300 hover:bg-zinc-900">
                Start New Round
              </button>
              <button className="rounded-xl border border-zinc-800 bg-black px-5 py-3 font-semibold text-zinc-300 hover:bg-zinc-900">
                Close Entries
              </button>
              <button className="rounded-xl bg-lime-500 px-5 py-3 font-semibold text-black hover:bg-lime-400">
                Trigger Draw
              </button>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-300">System Log (UI only)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-zinc-400">
                <li>Awaiting next administrative action…</li>
                <li>Preview build—no on-chain effects.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
