"use client"

export function HowItWorks() {
  return (
    <section id="how" className="relative z-10 border-t border-zinc-900 bg-zinc-950 py-28 md:py-36">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-16">
        <h2 className="mb-10 text-pretty text-center text-3xl font-bold md:text-4xl lg:text-5xl">
          How LuckySol Works
        </h2>
        <p className="mx-auto mb-16 max-w-4xl text-center text-base md:text-lg leading-relaxed text-zinc-300">
          LuckySol is your go-to decentralized lottery platform. Connect your wallet, pick your lucky numbers, and participate in
          a fair, transparent, and verifiable on-chain lottery. Winners get instant payouts directly to their wallets!
        </p>

        {/* Steps / Features */}
        <div className="mx-auto mb-16 grid w-full grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center shadow-lg hover:shadow-xl transition">
            <h3 className="mb-3 text-xl font-semibold text-lime-500">Fair & Transparent</h3>
            <p className="text-sm text-zinc-300">
              All draws are verifiable on-chain. No hidden tricks, no manipulation—just pure luck.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center shadow-lg hover:shadow-xl transition">
            <h3 className="mb-3 text-xl font-semibold text-violet-400">Instant Payouts</h3>
            <p className="text-sm text-zinc-300">
              Winners receive their prizes instantly with minimal fees, directly in their wallet.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center shadow-lg hover:shadow-xl transition">
            <h3 className="mb-3 text-xl font-semibold text-cyan-400">Secure & Decentralized</h3>
            <p className="text-sm text-zinc-300">
              Powered by Solana, LuckySol ensures your funds and data stay safe with blockchain security.
            </p>
          </div>
        </div>

        {/* Connect Wallet Button */}
        <div className="mx-auto flex max-w-xs justify-center">
          <button
            type="button"
            onClick={() => {}}
            className="w-full rounded-full bg-lime-500 px-8 py-3 text-lg font-semibold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
          >
            Connect Wallet
          </button>
        </div>

        {/* Extra Content */}
        <p className="mt-16 text-center text-sm md:text-base text-zinc-400 max-w-3xl mx-auto">
          Whether you're a first-timer or a pro, LuckySol makes playing lottery simple and fun. Stay tuned for upcoming
          tournaments, seasonal jackpots, and community rewards. Your next big win is just a click away!
        </p>
      </div>
    </section>
  )
}
