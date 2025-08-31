"use client"


export function LotteryModel({ className }: { className?: string }) {
  return (
    <div className={"relative mx-auto w-full max-w-sm"}>
      <div
        className="absolute -bottom-2 left-1/2 h-3 w-40 -translate-x-1/2 rounded-full bg-black/60 blur-md"
        aria-hidden="true"
      />
      <div
        className="relative aspect-square rounded-full bg-lime-500 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_12px_40px_rgba(132,204,22,0.35)]"
        style={{ animation: "spin 12s linear infinite" }}
        aria-hidden="true"
      >
        <div className="absolute inset-3 rounded-full bg-black/90 ring-1 ring-zinc-800" />
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 m-auto size-[70%]"
          role="img"
          aria-label="Decorative Solana-style mark"
        >
          <rect x="20" y="30" width="80" height="14" rx="4" fill="#a78bfa" />
          <rect x="20" y="53" width="80" height="14" rx="4" fill="#f472b6" />
          <rect x="20" y="76" width="80" height="14" rx="4" fill="#a78bfa" />
        </svg>
      </div>

      <div className="absolute -right-4 top-4 size-2 rounded-full bg-pink-400" />
      <div className="absolute -left-3 bottom-8 h-2 w-4 rotate-12 rounded bg-violet-400" />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
