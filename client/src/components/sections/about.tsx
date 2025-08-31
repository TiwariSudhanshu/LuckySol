"use client"

export function About() {
  return (
    <section id="about" className="relative z-10 border-t border-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <h2 className="mb-3 text-pretty text-center text-2xl font-bold md:text-3xl">About LuckySol</h2>
        <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-zinc-300">
          LuckySol is a Solana-inspired lottery experience with a clean, neon-dark aesthetic. This page keeps the color
          theme intact: lime accents with neutral black/white and violet/pink highlights. Hook up your wallet and
          on-chain program when you’re ready.
        </p>
      </div>
    </section>
  )
}
