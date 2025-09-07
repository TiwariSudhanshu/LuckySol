"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useProgram } from "@/lib/useProgram"

export default function DashboardPage() {
  const program = useProgram();
  console.log("Program:", program?.account);
  return (
    <>
      <main className="relative min-h-dvh bg-black text-white font-sans">
        {/* Header */}
        <Header />

        {/* Hero-like overview */}
        <section className="relative z-10 px-4 pt-10 md:pt-16">
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-[11px] font-semibold tracking-[0.2em] text-lime-400">
              CURRENT ROUND • UI ONLY
            </p>
            <h1 className="text-pretty mt-3 text-center text-3xl font-extrabold leading-tight md:text-5xl">
              Round #128 — Live Now
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-zinc-300 md:text-base">
              Join the current LuckySol round and compete for the prize pool. Connect your wallet, buy tickets, and
              track your odds in real time. This page mirrors the home style for a seamless experience.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/buy-tickets"
                className="rounded-full bg-lime-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
              >
                Buy Tickets
              </Link>
              <Link
                href="/my-tickets"
                className="rounded-full border border-zinc-800 px-6 py-3 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
              >
                View My Tickets
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative z-10 border-t border-zinc-900">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                <p className="text-xs text-zinc-400">Prize Pool</p>
                <p className="mt-2 text-2xl font-bold">1,250.00 SOL</p>
                <p className="mt-1 text-xs text-zinc-500">Updates in real-time (placeholder)</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                <p className="text-xs text-zinc-400">Tickets Sold</p>
                <p className="mt-2 text-2xl font-bold">3,210</p>
                <p className="mt-1 text-xs text-zinc-500">Current round total (placeholder)</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                <p className="text-xs text-zinc-400">Time Remaining</p>
                <p className="mt-2 text-2xl font-bold">00:12:34</p>
                <p className="mt-1 text-xs text-zinc-500">Countdown (placeholder)</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works (richer card) */}
        <section className="relative z-10 border-t border-zinc-900">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                <h2 className="text-lg font-semibold">How it works</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
                  <li>Connect your wallet and choose the number of tickets to buy for the live round.</li>
                  <li>Each ticket is an on-chain entry; more tickets increase your odds of winning.</li>
                  <li>Prize pool updates in real time as tickets are purchased across all participants.</li>
                  <li>At round end, a winner is selected on-chain and can claim directly from the results page.</li>
                  <li>This is a UI demo—wire it to your program for production draws, payouts, and verifications.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Running Lotteries */}
        <section className="relative z-10 border-t border-zinc-900">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-pretty text-2xl font-bold md:text-3xl">Explore Running Lotteries</h2>
                <p className="mt-1 text-sm text-zinc-400">Pick an active round to join right now.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { id: 129, name: "Daily Draw", prize: "720.00 SOL", endsIn: "01:22:15", ticketsSold: "1,840" },
                { id: 130, name: "Mega Pool", prize: "3,450.00 SOL", endsIn: "05:09:41", ticketsSold: "7,215" },
                { id: 131, name: "Weekend Special", prize: "980.00 SOL", endsIn: "12:44:03", ticketsSold: "2,067" },
                { id: 132, name: "Night Owl", prize: "410.00 SOL", endsIn: "02:19:28", ticketsSold: "903" },
                { id: 133, name: "Flash Round", prize: "265.00 SOL", endsIn: "00:37:52", ticketsSold: "611" },
                { id: 134, name: "Community Pot", prize: "1,120.00 SOL", endsIn: "08:15:10", ticketsSold: "3,402" },
              ].map((lot) => (
                <div
                  key={lot.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">{lot.name}</h3>
                      <p className="mt-0.5 text-xs text-zinc-400">Round #{lot.id}</p>
                    </div>
                    <span className="rounded-full border border-lime-500/30 bg-lime-500/10 px-2 py-0.5 text-[11px] font-medium text-lime-400">
                      Live
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-zinc-400">Prize</dt>
                      <dd className="mt-0.5 font-semibold text-white">{lot.prize}</dd>
                    </div>
                    <div>
                      <dt className="text-zinc-400">Ends In</dt>
                      <dd className="mt-0.5 font-semibold text-white">{lot.endsIn}</dd>
                    </div>
                    <div>
                      <dt className="text-zinc-400">Tickets Sold</dt>
                      <dd className="mt-0.5 text-white">{lot.ticketsSold}</dd>
                    </div>
                    <div>
                      <dt className="text-zinc-400">Status</dt>
                      <dd className="mt-0.5 text-white">Open</dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xs text-zinc-500">Join before the timer ends.</p>
                    <Link
                      href="/buy-tickets"
                      className="rounded-full bg-lime-500 px-4 py-2 text-sm font-semibold text-black hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
                    >
                      Join Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent activity */}
        <section className="relative z-10 border-t border-zinc-900">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
            <h2 className="text-pretty text-2xl font-bold md:text-3xl">Recent Activity</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black">
              <div className="grid grid-cols-12 gap-0 border-b border-zinc-800 bg-zinc-950/60 px-4 py-3 text-xs text-zinc-400">
                <div className="col-span-4">User</div>
                <div className="col-span-4">Action</div>
                <div className="col-span-4 text-right">When</div>
              </div>
              {[
                { user: "alpha.sol", action: "Bought 10 tickets", when: "2m ago" },
                { user: "nova.sol", action: "Bought 3 tickets", when: "5m ago" },
                { user: "zen.sol", action: "Claimed prize (prev round)", when: "11m ago" },
                { user: "orbit.sol", action: "Bought 1 ticket", when: "15m ago" },
              ].map((r) => (
                <div
                  key={`${r.user}-${r.when}`}
                  className="grid grid-cols-12 items-center px-4 py-3 text-sm border-b border-zinc-900/60 last:border-b-0"
                >
                  <div className="col-span-4 text-white">{r.user}</div>
                  <div className="col-span-4 text-zinc-300">{r.action}</div>
                  <div className="col-span-4 text-right text-zinc-400">{r.when}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}
