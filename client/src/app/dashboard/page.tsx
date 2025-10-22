"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { useProgram } from "@/lib/useProgram";
import { useEffect, useState } from "react";
import {
  getAllLotteries,
  getCreatedLotteries,
  getMyTickets,
  formatDuration,
} from "@/lib/transactions";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

export default function DashboardPage() {
  const program = useProgram();
  const [exploreLotteries, setExploreLotteries] = useState<any[]>([]);
  const [createdLotteries, setCreatedLotteries] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const wallet = useAnchorWallet();

  // Convert lamports to SOL string
  const lamportsToSolString = (lamports: any) => {
    if (lamports == null) return "0 SOL";
    const str =
      typeof lamports === "object" && typeof lamports.toString === "function"
        ? lamports.toString()
        : String(lamports);

    try {
      const big = BigInt(str);
      const SOL_DIV = BigInt(1_000_000_000);
      const whole = big / SOL_DIV;
      const rem = big % SOL_DIV;
      const frac = rem.toString().padStart(9, "0").replace(/0+$/, "");
      return frac
        ? `${whole.toString()}.${frac} SOL`
        : `${whole.toString()} SOL`;
    } catch (e) {
      const n = Number(str);
      if (isNaN(n)) return "0 SOL";
      return `${n / 1e9}`.replace(/(?:\.0+|(\.\d+?)0+)$/, "$1") + " SOL";
    }
  };

  // Note: formatDuration is now imported from transactions

  // Format timestamp -> date only
  const formatDateOnly = (value: unknown): string => {
    if (value == null) return "N/A";

    let ts: number | null = null;

    if (
      typeof value === "object" &&
      value !== null &&
      "toNumber" in value &&
      typeof (value as any).toNumber === "function"
    ) {
      ts = (value as { toNumber: () => number }).toNumber();
    } else if (typeof value === "string" || typeof value === "number") {
      ts = Number(value);
    }

    if (ts == null || isNaN(ts) || ts <= 0) return "N/A";

    return new Date(ts * 1000).toLocaleDateString();
  };

  const fetchlotteries = async (showToast = false) => {
    try {
      if (!program) {
        if (showToast) toast.error("Program not initialized");
        return;
      }
      setLoading(true);
      console.log('Dashboard: Fetching all lotteries...');
      const data = await getAllLotteries(program);

      const transformedLotteries = data.map((lotteryData: any, index: number) => {
        try {
          // Use the data we already have from getAllLotteries instead of fetching again
          const lottery = lotteryData._manualParse ? lotteryData : lotteryData;
          // determine if lottery has ended based on createdAt + duration
          let isEnded = false
          try {
            const createdAtSec = lottery.createdAt ? parseInt(lottery.createdAt) : null
            const durationSec = lottery.duration ? parseInt(lottery.duration) : null
            if (createdAtSec && durationSec) {
              const endTime = createdAtSec + durationSec
              const nowSec = Math.floor(Date.now() / 1000)
              isEnded = nowSec >= endTime
            }
          } catch (err) {
            isEnded = false
          }

          // compute status prioritizing randomnessFulfilled, tickets full, ended, otherwise open
          let status = "Open"
          if (lottery.randomnessFulfilled) status = "Completed"
          else if (lottery.ticketsSold >= lottery.maxTickets) status = "Drawing"
          else if (isEnded) status = "Ended"

          return {
            id: lottery.id || lotteryData.id,
            name: `Lottery #${lottery.lotteryId || index + 1}`,
            ticketPrice: lamportsToSolString(lottery.ticketPrice),
            ticketPriceRaw: lottery.ticketPrice,
            duration: formatDuration(lottery.duration),
            ticketsSold: lottery.ticketsSold?.toString() || "0",
            createdAt: formatDateOnly(lottery.createdAt),
            status,
            isEnded,
            maxTickets: lottery.maxTickets?.toString() || "0",
          };
        } catch (error) {
          console.error(`Error transforming lottery ${index}:`, error, lotteryData);
          return null;
        }
      });

      const validLotteries = transformedLotteries.filter(Boolean);
      // sort so that ended lotteries appear last in Explore
      validLotteries.sort((a: any, b: any) => {
        if (a.isEnded === b.isEnded) return 0
        return a.isEnded ? 1 : -1
      })
      setExploreLotteries(validLotteries);
      console.log(`Dashboard: Loaded ${validLotteries.length} lotteries for explore`);
      if (showToast) toast.success(`Loaded ${validLotteries.length} lotteries`);
    } catch (error) {
      console.error("Error fetching lotteries:", error);
      if (showToast) toast.error("Error fetching lotteries");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatedLotteries = async (showToast = false) => {
    try {
      if (!program) {
        if (showToast) toast.error("Program not initialized");
        return;
      }
      if (!wallet) {
        if (showToast) toast.error("Wallet not connected");
        return;
      }
      setLoading(true);
      console.log('Dashboard: Fetching created lotteries...');

      const data = await getCreatedLotteries(program, wallet);

      // Transform created lotteries using the data we already have
      const transformed = data.map((lotteryData: any, index: number) => {
        try {
          // Use the data we already have from getCreatedLotteries instead of fetching again
          const lottery = lotteryData._manualParse ? lotteryData : lotteryData;

          const status = lottery.randomnessFulfilled ? "Completed" : "Open";

          return {
            id: lottery.id || lotteryData.id,
            name: `Lottery #${lottery.lotteryId || index + 1}`,
            ticketPrice: lamportsToSolString(lottery.ticketPrice),
            ticketPriceRaw: lottery.ticketPrice,
            duration: formatDuration(lottery.duration),
            ticketsSold: lottery.ticketsSold?.toString() || "0",
            createdAt: formatDateOnly(lottery.createdAt),
            status,
            maxTickets: lottery.maxTickets?.toString() || "0",
            creator: lottery.authority || lottery.creator,
          };
        } catch (error) {
          console.error("Error transforming created lottery", lotteryData, error);
          // Fallback using original data
          return {
            id: lotteryData.id || `created-${index}`,
            name: `Lottery #${lotteryData.lotteryId || index + 1}`,
            ticketPrice: lotteryData.ticketPrice
              ? lamportsToSolString(lotteryData.ticketPrice)
              : "0 SOL",
            ticketPriceRaw: lotteryData.ticketPrice || "0",
            duration: lotteryData.duration
              ? formatDuration(lotteryData.duration)
              : "0s",
            ticketsSold: lotteryData.ticketsSold?.toString() || "0",
            createdAt: lotteryData.createdAt
              ? formatDateOnly(lotteryData.createdAt)
              : "N/A",
            status: lotteryData.randomnessFulfilled ? "Completed" : "Open",
            maxTickets: lotteryData.maxTickets?.toString() || "0",
            creator: lotteryData.authority || lotteryData.creator,
          };
        }
      });

      const validCreatedLotteries = transformed.filter(Boolean);
      setCreatedLotteries(validCreatedLotteries);
      console.log(`Dashboard: Loaded ${validCreatedLotteries.length} created lotteries`);
      if (showToast) toast.success(`Loaded ${validCreatedLotteries.length} created lotteries`);
    } catch (error) {
      console.error("Error fetching created lotteries:", error);
      if (showToast) toast.error("Error fetching created lotteries");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTickets = async (showToast = false) => {
    try {
      if (!program || !wallet) {
        if (showToast) toast.error("Program not or Wallet not connected");
        return;
      }
      setTicketsLoading(true);
      console.log('Dashboard: Fetching my tickets...');

      const tickets = await getMyTickets(program, wallet);

      const ticketsWithLottery = tickets.map((ticket: any, index: number) => {
        let lotteryName = `Lottery #${index + 1}`;
        let lotteryStatus = "Unknown";
        let purchasedAt = new Date();

        // Use lottery ID from ticket if available
        if (ticket.lottery) {
          try {
            // Try to get lottery ID from the ticket's lottery field
            if (typeof ticket.lottery === 'string') {
              lotteryName = `Lottery ${ticket.lottery.slice(0, 8)}...`;
            }
          } catch (err) {
            console.error("Error processing lottery for ticket", ticket, err);
          }
        }

        // Parse purchased timestamp
        try {
          if (ticket.purchasedAt) {
            if (typeof ticket.purchasedAt === 'string') {
              purchasedAt = new Date(parseInt(ticket.purchasedAt) * 1000);
            } else if (typeof ticket.purchasedAt.toNumber === "function") {
              purchasedAt = new Date(ticket.purchasedAt.toNumber() * 1000);
            } else if (typeof ticket.purchasedAt === 'number') {
              purchasedAt = new Date(ticket.purchasedAt * 1000);
            }
          }
        } catch (err) {
          console.error("Error parsing purchasedAt for ticket", ticket, err);
        }

        return {
          ...ticket,
          lotteryName,
          lotteryStatus,
          purchasedAt,
        };
      });

      setMyTickets(ticketsWithLottery);
      console.log(`Dashboard: Loaded ${ticketsWithLottery.length} tickets`);
      if (showToast) toast.success(`Loaded ${ticketsWithLottery.length} tickets`);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      if (showToast) toast.error("Error fetching tickets");
    } finally {
      setTicketsLoading(false);
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    console.log('Dashboard: Refreshing all data...');
    await Promise.all([
      fetchlotteries(true),
      fetchCreatedLotteries(true),
      fetchMyTickets(true)
    ]);
  };

  useEffect(() => {
    if (program) {
      console.log('Dashboard: Initial data load...');
      fetchlotteries();
      fetchCreatedLotteries();
      fetchMyTickets();
    }
  }, [program, wallet]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!program) return;
    
    const interval = setInterval(() => {
      console.log('Dashboard: Auto-refreshing data...');
      fetchlotteries();
      fetchCreatedLotteries();
      fetchMyTickets();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [program, wallet]);

  const [activeTab, setActiveTab] = useState("explore");

  const renderLotteryCard = (lottery: any, type: string) => {
    // compute prize pool (raw ticketPrice × maxTickets)
    let prizePool = "0 SOL";
    try {
      const lamports = BigInt(lottery.ticketPriceRaw?.toString() || "0");
      const max = BigInt(lottery.maxTickets || "0");
      const poolLamports = lamports * max;
      prizePool = lamportsToSolString(poolLamports);
    } catch {
      prizePool = "0 SOL";
    }

    return (
      <div
        key={lottery.id}
        className="relative rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-colors hover:border-zinc-700"
      >
        {/* Created At in top-right corner */}
        <div className="absolute right-4 top-4 text-xs text-zinc-500">
          {lottery.createdAt}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">
              {lottery.name}
            </h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              {type === "explore"
                ? `Max Tickets: ${lottery.maxTickets}`
                : `Round #${lottery.id}`}
            </p>
          </div>
          {type === 'explore' && lottery.isEnded && (
            <div className="ml-2 inline-flex items-center px-2 py-1 rounded-full bg-zinc-700 text-xs font-semibold text-zinc-300">
              Ended
            </div>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-400">Ticket Price</dt>
            <dd className="mt-0.5 font-semibold text-white">
              {lottery.ticketPrice}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-400">Duration</dt>
            <dd className="mt-0.5 font-semibold text-white">
              {lottery.duration}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-400">Tickets Sold</dt>
            <dd className="mt-0.5 text-white">{lottery.ticketsSold}</dd>
          </div>
          <div>
            <dt className="text-zinc-400">Prize Pool</dt>
            <dd className="mt-0.5 font-semibold text-lime-400">{prizePool}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            {type === "explore" &&
              (lottery.status === "Live" || lottery.status === "Open") &&
              "Join before the timer ends."}
            {type === "created" &&
              lottery.creator &&
              "You created this lottery."}
          </p>

          {type === "explore" &&
            (lottery.status === "Live" || lottery.status === "Open") && (
              <Link
                href={`/lottery/${lottery.id}`}
                className="rounded-full bg-lime-500 px-4 py-2 text-sm font-semibold text-black hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
              >
                Join Now
              </Link>
            )}

          {type === "created" && (
            <Link
              href={`admin/lottery/${lottery.id}`}
              className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            >
              Manage
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="relative min-h-dvh bg-black text-white font-sans">
      <Header />

      <section className="relative z-10 px-4 pt-10 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-pretty text-center text-3xl font-extrabold leading-tight md:text-5xl">
            Lottery Dashboard
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-zinc-300 md:text-base">
            Manage your lottery experience - explore new draws, track your
            tickets, and manage your created lotteries.
          </p>

          <div className="mt-8 flex justify-center px-2">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar rounded-full border border-zinc-800 bg-zinc-950/70 p-1 px-2 items-center max-w-full">
              <button
                onClick={() => setActiveTab("explore")}
                aria-label="Explore lotteries"
                className={`rounded-full px-3 sm:px-5 py-2 text-[13px] sm:text-sm font-medium transition flex items-center justify-center min-w-[72px] sm:min-w-0 whitespace-nowrap ${
                  activeTab === "explore"
                    ? "bg-lime-500 text-black"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                <span className="hidden sm:inline">Explore Lotteries</span>
                <span className="inline sm:hidden">Explore</span>
              </button>
              <button
                onClick={() => setActiveTab("bought")}
                aria-label="My tickets"
                className={`rounded-full px-3 sm:px-5 py-2 text-[13px] sm:text-sm font-medium transition flex items-center justify-center min-w-[72px] sm:min-w-0 whitespace-nowrap ${
                  activeTab === "bought"
                    ? "bg-lime-500 text-black"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                <span className="hidden sm:inline">My Tickets</span>
                <span className="inline sm:hidden">Tickets</span>
              </button>
              <button
                onClick={() => setActiveTab("created")}
                aria-label="Created lotteries"
                className={`rounded-full px-3 sm:px-5 py-2 text-[13px] sm:text-sm font-medium transition flex items-center justify-center min-w-[72px] sm:min-w-0 whitespace-nowrap ${
                  activeTab === "created"
                    ? "bg-lime-500 text-black"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                <span className="hidden sm:inline">Created Lotteries</span>
                <span className="inline sm:hidden">Created Lotteries</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-pretty text-2xl font-bold md:text-3xl">
                {activeTab === "explore" && "Explore Running Lotteries"}
                {activeTab === "bought" && "Your Lottery Tickets"}
                {activeTab === "created" && "Your Created Lotteries"}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {activeTab === "explore" &&
                  "Pick an active round to join right now."}
                {activeTab === "bought" &&
                  "View all your purchased lottery tickets."}
                {activeTab === "created" &&
                  "Manage the lotteries you've created."}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-nowrap">
              <button
                onClick={refreshAllData}
                disabled={loading || ticketsLoading}
                className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 sm:px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg 
                  className={`h-4 w-4 ${loading || ticketsLoading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              {activeTab === "created" && (
                <Link
                  href="/create"
                  className="flex items-center gap-2 rounded-full bg-lime-500 px-3 py-2 text-sm font-semibold text-black hover:bg-lime-400 min-w-0"
                >
                  <span className="hidden sm:inline truncate">+ Create New</span>
                  <span className="inline sm:hidden">+</span>
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeTab === "explore" && (
              <>
                {loading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-lime-500 border-t-transparent"></div>
                      Loading lotteries...
                    </div>
                  </div>
                ) : exploreLotteries.length > 0 ? (
                  exploreLotteries.map((lottery) =>
                    renderLotteryCard(lottery, "explore")
                  )
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <div className="text-zinc-400 mb-2">No lotteries available</div>
                    <button 
                      onClick={() => refreshAllData()} 
                      className="text-lime-400 hover:text-lime-300 text-sm"
                    >
                      Click to refresh
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === "bought" && (
              <>
                {ticketsLoading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-lime-500 border-t-transparent"></div>
                      Loading tickets...
                    </div>
                  </div>
                ) : myTickets.length > 0 ? (
                  myTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-colors hover:border-zinc-700"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            Ticket #{String(ticket.id).slice(0, 6)}
                          </h3>
                          <p className="mt-0.5 text-xs text-zinc-400">
                            {ticket.lotteryName}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                            ticket.lotteryStatus === "Open" ||
                            ticket.lotteryStatus === "Live"
                              ? "border-lime-500/30 bg-lime-900 text-white"
                              : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                          }`}
                        >
                          {ticket.lotteryStatus}
                        </span>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-zinc-400">Purchased</dt>
                          <dd className="mt-0.5 text-white">
                            {ticket.purchasedAt instanceof Date
                              ? ticket.purchasedAt.toLocaleDateString()
                              : "N/A"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <div className="text-zinc-400 mb-2">
                      No tickets purchased yet.
                    </div>
                    <button 
                      onClick={() => refreshAllData()} 
                      className="text-lime-400 hover:text-lime-300 text-sm"
                    >
                      Click to refresh
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === "created" && (
              <>
                {loading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-lime-500 border-t-transparent"></div>
                      Loading created lotteries...
                    </div>
                  </div>
                ) : createdLotteries.length > 0 ? (
                  createdLotteries.map((lottery) =>
                    renderLotteryCard(lottery, "created")
                  )
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <div className="text-zinc-400 mb-2">
                      No lotteries created yet.
                    </div>
                    <button 
                      onClick={() => refreshAllData()} 
                      className="text-lime-400 hover:text-lime-300 text-sm"
                    >
                      Click to refresh
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
