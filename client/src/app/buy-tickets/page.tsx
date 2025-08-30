"use client"

import Link from "next/link"

export default function BuyTicketsPage() {
  return (
    <main className="relative min-h-dvh bg-black text-white font-sans">
      {/* Decorative confetti (aria-hidden) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-8 left-6 size-2 rounded-full bg-lime-500" />
        <div className="absolute top-16 right-10 h-2 w-4 rotate-12 rounded bg-pink-400" />
        <div className="absolute top-28 left-1/3 size-2 rounded-full bg-violet-400" />
        <div className="absolute top-40 right-1/4 h-3 w-3 -rotate-12 rounded-sm bg-lime-500" />
        <div className="absolute top-64 left-10 h-2 w-5 rotate-45 rounded bg-violet-400" />
        <div className="absolute top-72 right-8 size-2 rounded-full bg-pink-400" />
        <div className="absolute top-1/2 left-1/5 h-2 w-4 -rotate-12 rounded bg-lime-400" />
        <div className="absolute bottom-24 left-1/3 size-2 rounded-full bg-violet-400" />
        <div className="absolute bottom-16 right-1/4 h-2 w-5 rotate-12 rounded bg-pink-400" />
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
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 md:pt-14 md:pb-16">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
            Enter the next LuckySol round
          </p>
          <h1 className="mx-auto max-w-3xl text-balance text-center text-3xl font-extrabold leading-tight md:text-5xl">
            Buy Tickets
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-zinc-300 md:text-base">
            Choose how many tickets to purchase. UI only—no wallet or on-chain logic yet.
          </p>
        </div>
      </section>

      {/* Purchase Card */}
      <section className="relative z-10">
        <div className="mx-auto w-full max-w-xl px-4 pb-16">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
            {/* Number of Tickets */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="ticket-count" className="text-xs text-zinc-400">
                  Number of tickets
                </label>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">#</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-2.5">
                <input
                  id="ticket-count"
                  type="number"
                  min={0}
                  placeholder="0"
                  className="w-full bg-transparent text-lg outline-none placeholder:text-zinc-600"
                  aria-readonly="true"
                  readOnly
                />
                <div className="size-5 rounded-full border border-zinc-700" aria-hidden="true" />
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="mb-5">
              <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                <span>Estimated cost</span>
                <span className="text-white">— SOL</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-900" aria-hidden="true">
                <div className="h-2 w-1/5 rounded-full bg-lime-500/70" aria-hidden="true" />
              </div>
            </div>

            {/* Address (UI only) */}
            <div className="mb-5">
              <div className="mb-1 text-xs text-zinc-400">Solana Address</div>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-black px-3 py-2.5">
                <span className="text-zinc-500">0x</span>
                <input
                  type="text"
                  placeholder="(UI only) Your wallet address"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
                  aria-readonly="true"
                  readOnly
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-2xl bg-lime-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
              >
                Connect Wallet
              </button>
              <button
                type="button"
                aria-disabled="true"
                className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-300"
              >
                Confirm (UI only)
              </button>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block size-3 rounded-full bg-lime-400" aria-hidden="true" />
                <span className="inline-block size-3 rounded-full bg-violet-400" aria-hidden="true" />
                <span className="inline-block size-3 rounded-full bg-pink-400" aria-hidden="true" />
              </div>
              <p className="text-[11px] text-zinc-400">
                1 Ticket ≈ <span className="text-white">—</span> SOL
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
