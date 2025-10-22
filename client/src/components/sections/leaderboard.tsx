
"use client"

export function Leaderboard() {
  const rows = [
    { rank: 1, name: "alpha.sol", tickets: "1,240", prize: "32 SOL" },
    { rank: 2, name: "nova.sol", tickets: "1,100", prize: "20 SOL" },
    { rank: 3, name: "zen.sol", tickets: "990", prize: "12 SOL" },
    { rank: 4, name: "orbit.sol", tickets: "860", prize: "8 SOL" },
    { rank: 5, name: "glow.sol", tickets: "720", prize: "5 SOL" },
  ]
  return (
    <section id="leaderboard" className="relative z-10 border-t border-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 className="text-pretty text-center text-2xl font-bold md:text-3xl">Leaderboard</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black">
          <div className="hidden md:grid grid-cols-12 gap-0 border-b border-zinc-800 bg-zinc-950/60 px-4 py-3 text-xs text-zinc-400">
            <div className="col-span-2">Rank</div>
            <div className="col-span-5">User</div>
            <div className="col-span-3">Tickets</div>
            <div className="col-span-2 text-right">Best Prize</div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.name}
              className="grid grid-cols-12 md:grid-cols-12 items-center px-4 py-3 text-sm border-b border-zinc-900/60 last:border-b-0 gap-2 md:gap-0"
            >
              <div className="col-span-2 flex items-center gap-2">
                <span
                  className={`inline-flex size-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    i < 3 ? "bg-lime-500 text-black" : "bg-zinc-800 text-zinc-200"
                  }`}
                >
                  {r.rank}
                </span>
              </div>
              <div className="col-span-5 md:col-span-5 text-white min-w-0">
                <span className="truncate block md:inline">{r.name}</span>
              </div>
              <div className="col-span-3 md:col-span-3 text-zinc-300 min-w-0">
                <span className="truncate block md:inline">{r.tickets}</span>
              </div>
              <div className="col-span-2 md:col-span-2 text-right font-semibold min-w-0">
                <span className="truncate block md:inline">{r.prize}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
