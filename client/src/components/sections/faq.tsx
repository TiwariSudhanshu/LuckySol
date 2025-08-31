
export function FAQ() {
  return (
    <section id="faq" className="relative z-10 border-t border-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <h2 className="text-pretty text-center text-2xl font-bold md:text-3xl">Frequently Asked Questions</h2>

        <div className="mt-6 space-y-3">
          <details className="group rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 transition-colors hover:border-zinc-700">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-2 py-1 text-left font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/60">
              <span>Is this connected to a real lottery?</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
              >
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <div className="mt-3 text-sm leading-relaxed text-zinc-300">
              Not yet—this is a UI-only template designed to match your dark neon theme. Add wallet connection and your
              on-chain logic when you’re ready.
            </div>
          </details>

          <details className="group rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 transition-colors hover:border-zinc-700">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-2 py-1 text-left font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/60">
              <span>Which wallets will be supported?</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
              >
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <div className="mt-3 text-sm leading-relaxed text-zinc-300">
              Any Solana wallet provider you choose. The header and hero buttons are ready to wire into your wallet
              adapter of choice.
            </div>
          </details>

          <details className="group rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 transition-colors hover:border-zinc-700">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-2 py-1 text-left font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/60">
              <span>Can I change the visuals?</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
              >
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <div className="mt-3 text-sm leading-relaxed text-zinc-300">
              Yes, but per your request we preserved the color theme: lime accents, dark neutrals, and violet/pink
              highlights. We can extend sections or swap visuals without changing the palette.
            </div>
          </details>

          <details className="group rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 transition-colors hover:border-zinc-700">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-2 py-1 text-left font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/60">
              <span>How do ticket purchases work?</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
              >
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <div className="mt-3 text-sm leading-relaxed text-zinc-300">
              In this UI, you’ll connect a wallet and enter an amount in SOL. Your contract can mint tickets, assign
              entries, and return odds in real-time. This demo focuses on layout and styling—you add the on-chain calls.
            </div>
          </details>

          <details className="group rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 transition-colors hover:border-zinc-700">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-2 py-1 text-left font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/60">
              <span>Is dark mode supported?</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
              >
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <div className="mt-3 text-sm leading-relaxed text-zinc-300">
              Yes—the entire design is built for a neon-on-black aesthetic with proper contrast. Headings, controls, and
              borders use accessible color tokens and hover states.
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}
