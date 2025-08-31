"use client"

export function HowItWorks() {
  return (
    <section id="how" className="relative z-10 border-t border-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <h2 className="mb-3 text-pretty text-center text-2xl font-bold md:text-3xl">How LuckySol Works</h2>
        <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-zinc-300">
          This is a UI-only landing page modeled after the provided dark neon theme. Add wallet connection and on-chain
          logic when you’re ready.
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
  )
}
