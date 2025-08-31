"use client"

export function Stats() {
  return (
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
  )
}
