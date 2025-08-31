"use client"

export function Header() {
  return (
    <header className="relative z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-lime-500" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-wide">LuckySol</span>
        </div>
        <nav className="flex items-center gap-3">
          <a
            href="#features"
            className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block"
          >
            Features
          </a>
          <a
            href="#leaderboard"
            className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block"
          >
            Leaderboard
          </a>
          <a href="#about" className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block">
            About
          </a>
          <a href="#how" className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block">
            How it works
          </a>
          <a href="#faq" className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block">
            FAQ
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
  )
}
