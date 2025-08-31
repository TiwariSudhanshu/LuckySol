"use client"

export function Confetti() {
  return (
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
  )
}
