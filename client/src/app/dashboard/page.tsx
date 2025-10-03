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

  // Format duration
  const formatDuration = (value: any) => {
    if (value == null) return "0s";
    let seconds = 0;
    if (typeof value === "object" && typeof value.toNumber === "function") {
      seconds = value.toNumber();
    } else {
      seconds = Number(value);
    }
    if (isNaN(seconds) || seconds <= 0) return "0s";

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (parts.length === 0) parts.push(`${secs}s`);
    return parts.join(" ");
  };

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

  const fetchlotteries = async () => {
    try {
      if (!program) {
        toast.error("Program not initialized");
        return;
      }
      setLoading(true);
      const data = await getAllLotteries(program);

      const transformedLotteries = await Promise.all(
        data.map(async (lotteryData: any, index: number) => {
          try {
            const lottery = await (program.account as any).lottery.fetch(
              new PublicKey(lotteryData.id)
            );

            const status = lottery.randomnessFulfilled ? "Completed" : "Open";

            return {
              id: lotteryData.id,
              name: `Lottery #${index + 1}`,
              ticketPrice: lamportsToSolString(lottery.ticketPrice),
              ticketPriceRaw: lottery.ticketPrice,
              duration: formatDuration(lottery.duration),
              ticketsSold: lottery.ticketsSold?.toString() || "0",
              createdAt: formatDateOnly(lottery.createdAt),
              status,
              maxTickets: lottery.maxTickets?.toString() || "0",
            };
          } catch (error) {
            console.error(`Error fetching lottery ${index}:`, error);
            return null;
          }
        })
      );

      setExploreLotteries(transformedLotteries.filter(Boolean));
      toast.success("Lotteries fetched successfully");
    } catch (error) {
      toast.error("Error fetching lotteries");
      console.log("Error fetching lotteries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatedLotteries = async () => {
    try {
      if (!program) {
        toast.error("Program not initialized");
        return;
      }
      if (!wallet) {
        toast.error("Wallet not connected");
        return;
      }
      setLoading(true);

      const data = await getCreatedLotteries(program, wallet);

      // Transform created lotteries to include the same fields as exploreLotteries
      const transformed = await Promise.all(
        data.map(async (lotteryData: any, index: number) => {
          try {
            // lotteryData should contain an id we can fetch
            const lottery = await (program.account as any).lottery.fetch(
              new PublicKey(lotteryData.id)
            );

            const status = lottery.randomnessFulfilled ? "Completed" : "Open";

            return {
              id: lotteryData.id,
              // keep name if the on-chain account has a name, otherwise fallback
              name:
                (typeof lottery.name === "string" && lottery.name.trim() !== "")
                  ? lottery.name
                  : `Lottery #${index + 1}`,
              ticketPrice: lamportsToSolString(lottery.ticketPrice),
              ticketPriceRaw: lottery.ticketPrice,
              duration: formatDuration(lottery.duration),
              ticketsSold: lottery.ticketsSold?.toString() || "0",
              createdAt: formatDateOnly(lottery.createdAt),
              status,
              maxTickets: lottery.maxTickets?.toString() || "0",
              // preserve creator if present on-chain (stringified)
              creator:
                lottery.creator && typeof lottery.creator.toString === "function"
                  ? lottery.creator.toString()
                  : undefined,
            };
          } catch (error) {
            console.error("Error fetching created lottery", lotteryData, error);
            // Fallback: try to use fields returned from getCreatedLotteries if present,
            // but ensure the fields our UI expects exist.
            try {
              return {
                id: lotteryData.id || lotteryData.publicKey || `created-${index}`,
                name: lotteryData.name || `Lottery #${index + 1}`,
                ticketPrice:
                  lotteryData.ticketPrice
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
                creator: lotteryData.creator,
              };
            } catch (err) {
              // final fallback
              return {
                id: lotteryData.id || `created-${index}`,
                name: `Lottery #${index + 1}`,
                ticketPrice: "0 SOL",
                ticketPriceRaw: "0",
                duration: "0s",
                ticketsSold: "0",
                createdAt: "N/A",
                status: "Open",
                maxTickets: "0",
                creator: undefined,
              };
            }
          }
        })
      );

      setCreatedLotteries(transformed.filter(Boolean));
      toast.success("Created lotteries fetched successfully");
    } catch (error) {
      toast.error("Error fetching created lotteries");
      console.log("Error fetching created lotteries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTickets = async () => {
    try {
      if (!program || !wallet) {
        toast.error("Program not or Wallet not connected");
        return;
      }
      setTicketsLoading(true);

      const tickets = await getMyTickets(program, wallet);

      const ticketsWithLottery = await Promise.all(
        tickets.map(async (ticket: any, index: number) => {
          let lotteryName = `Lottery #${index + 1}`;
          let lotteryStatus = "Unknown";
          let purchasedAt = new Date();

          if (ticket.lottery) {
            try {
              const lotteryAccount = await (
                program.account as any
              ).lottery.fetch(new PublicKey(ticket.lottery));
              lotteryName = lotteryAccount.name || lotteryName;
            } catch (err) {
              console.error("Error fetching lottery for ticket", ticket, err);
            }
          }

          if (
            ticket.purchasedAt &&
            typeof ticket.purchasedAt.toNumber === "function"
          ) {
            purchasedAt = new Date(ticket.purchasedAt.toNumber() * 1000);
          }

          return {
            ...ticket,
            lotteryName,
            lotteryStatus,
            purchasedAt,
          };
        })
      );

      setMyTickets(ticketsWithLottery);
      toast.success("Tickets fetched successfully");
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Error fetching tickets");
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchlotteries();
    fetchCreatedLotteries();
    fetchMyTickets();
  }, [program]);

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

          <div className="mt-8 flex justify-center">
            <div className="flex rounded-full border border-zinc-800 bg-zinc-950/70 p-1">
              <button
                onClick={() => setActiveTab("explore")}
                className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                  activeTab === "explore"
                    ? "bg-lime-500 text-black"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                Explore Lotteries
              </button>
              <button
                onClick={() => setActiveTab("bought")}
                className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                  activeTab === "bought"
                    ? "bg-lime-500 text-black"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                My Tickets
              </button>
              <button
                onClick={() => setActiveTab("created")}
                className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                  activeTab === "created"
                    ? "bg-lime-500 text-black"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                Created Lotteries
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
            {activeTab === "created" && (
              <Link
                href="/create"
                className="flex items-center gap-2 rounded-full bg-lime-500 px-4 py-2 text-sm font-semibold text-black hover:bg-lime-400"
              >
                + Create New
              </Link>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeTab === "explore" && (
              <>
                {loading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="text-zinc-400">Loading lotteries...</div>
                  </div>
                ) : exploreLotteries.length > 0 ? (
                  exploreLotteries.map((lottery) =>
                    renderLotteryCard(lottery, "explore")
                  )
                ) : (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="text-zinc-400">No lotteries available</div>
                  </div>
                )}
              </>
            )}

            {activeTab === "bought" && (
              <>
                {ticketsLoading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="text-zinc-400">Loading tickets...</div>
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
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="text-zinc-400">
                      No tickets purchased yet.
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "created" &&
              createdLotteries.map((lottery) =>
                renderLotteryCard(lottery, "created")
              )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
