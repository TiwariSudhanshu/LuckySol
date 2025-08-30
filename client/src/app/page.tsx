"use client"

// Color system (max 5):
// - Primary: lime-500
// - Neutrals: black, white
// - Accents: violet-400, pink-400

export default function Page() {
  return (
    <main className="relative min-h-dvh bg-black text-white font-sans">
      {/* Decorative confetti based on reference (aria-hidden) */}
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
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-lime-500" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-wide">LuckySol</span>
          </div>
          <nav className="flex items-center gap-3">
            <a
              href="#about"
              className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block"
            >
              About
            </a>
            <a href="#how" className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block">
              How it works
            </a>
            <a
              href="#stats"
              className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block"
            >
              Stats
            </a>
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
            Team up with LuckySol
          </p>
          <h1 className="mx-auto max-w-3xl text-balance text-center text-3xl font-extrabold leading-tight md:text-5xl">
            Get your slice of the crypto gaming pie
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-zinc-300 md:text-base">
            A clean, dark neon landing page. UI only—add your wallet and contract logic later.
          </p>

          {/* Center Card (UI only, mirrors reference composition) */}
          <div className="mx-auto mt-8 w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
            {/* Row: Amount in SOL */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="amount-sol" className="text-xs text-zinc-400">
                  Amount in SOL
                </label>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">SOL</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-2.5">
                <input
                  id="amount-sol"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  className="w-full bg-transparent text-lg outline-none placeholder:text-zinc-600"
                  aria-readonly="true"
                  readOnly
                />
                <div className="h-1 w-full rounded bg-zinc-800" aria-hidden="true" />
              </div>
            </div>

            {/* Row: You get (LSOL) */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="you-get" className="text-xs text-zinc-400">
                  You get
                </label>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">LSOL</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-2.5">
                <input
                  id="you-get"
                  type="text"
                  placeholder="0.00"
                  className="w-full bg-transparent text-lg outline-none placeholder:text-zinc-600"
                  aria-readonly="true"
                  readOnly
                />
                <div className="size-5 rounded-full border border-zinc-700" aria-hidden="true" />
              </div>
            </div>

            {/* Row: Solana Address placeholder */}
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

            {/* CTA: Connect Wallet only */}
            <button
              type="button"
              onClick={() => {}}
              aria-label="Connect Wallet"
              className="mb-3 w-full rounded-2xl bg-lime-500 py-3 text-center text-sm font-bold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
            >
              Connect Wallet
            </button>

            {/* Small legend */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block size-3 rounded-full bg-lime-400" aria-hidden="true" />
                <span className="inline-block size-3 rounded-full bg-violet-400" aria-hidden="true" />
                <span className="inline-block size-3 rounded-full bg-pink-400" aria-hidden="true" />
              </div>
              <p className="text-[11px] text-zinc-400">
                1 SOL ≈ <span className="text-white">—</span> LSOL
              </p>
            </div>
          </div>

          {/* Helper link */}
          <div className="mt-4 text-center">
            <a href="#how" className="text-sm text-zinc-300 hover:text-white">
              Looking to learn more?
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section id="stats" className="relative z-10 border-t border-zinc-900">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3 md:py-12">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-center">
            <div className="mx-auto mb-2 size-2 rounded-full bg-lime-500" aria-hidden="true" />
            <div className="text-2xl font-extrabold text-lime-400">1B</div>
            <div className="text-sm text-zinc-400">Total Supply</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-center">
            <div className="mx-auto mb-2 size-2 rounded-full bg-violet-400" aria-hidden="true" />
            <div className="text-2xl font-extrabold text-white">100M</div>
            <div className="text-sm text-zinc-400">Circulation</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-center">
            <div className="mx-auto mb-2 size-2 rounded-full bg-pink-400" aria-hidden="true" />
            <div className="text-2xl font-extrabold text-white">$10M</div>
            <div className="text-sm text-zinc-400">Market Cap</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 border-t border-zinc-900">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
          <h2 className="mb-3 text-pretty text-center text-2xl font-bold md:text-3xl">How LuckySol Works</h2>
          <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-zinc-300">
            This is a UI-only landing page modeled after the provided dark neon theme. Add wallet connection and
            on-chain logic when you’re ready.
          </p>
          <div className="mx-auto mt-6 flex max-w-md flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {}}
              className="w-full rounded-full bg-lime-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black sm:w-auto"
            >
              Connect Wallet
            </button>
            <a
              href="#stats"
              className="w-full rounded-full border border-zinc-800 px-5 py-2.5 text-center text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white sm:w-auto"
            >
              View Stats
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-zinc-400 md:flex-row">
          <span>© {new Date().getFullYear()} LuckySol</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
