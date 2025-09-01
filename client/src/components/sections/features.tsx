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
  <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
    <h2 className="text-pretty text-center text-3xl font-bold md:text-4xl">Why LuckySol</h2>
    <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
      {items.map((f) => (
        <div
          key={f.title}
          className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
        >
          <div className={`mb-4 h-4 w-4 rounded-full ${f.dot}`} aria-hidden="true" />
          <h3 className="text-base font-semibold md:text-lg">{f.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300 md:text-base">{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

  )
}
