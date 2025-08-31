"use client"

export function Features() {
  const items = [
    {
      title: "Fair Odds",
      desc: "Transparent draws with verifiable randomness once you wire up your on-chain program.",
      dot: "bg-lime-500",
    },
    {
      title: "Instant Payouts",
      desc: "When integrated, winners receive prizes to their wallet with minimal fees.",
      dot: "bg-violet-400",
    },
    {
      title: "Gas-Efficient",
      desc: "Designed for low-cost participation suitable for frequent micro-entries.",
      dot: "bg-pink-400",
    },
    {
      title: "Wallet Ready",
      desc: "UI-first; plug in your preferred Solana wallet provider when ready.",
      dot: "bg-zinc-300",
    },
  ]
  return (
    <section id="features" className="relative z-10 border-t border-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 className="text-pretty text-center text-2xl font-bold md:text-3xl">Why LuckySol</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          {items.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
            >
              <div className={`mb-3 inline-block size-2 rounded-full ${f.dot}`} aria-hidden="true" />
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
