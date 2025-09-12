"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useProgram } from "@/lib/useProgram"
import { useEffect, useState } from "react"
import { getAllLotteries, getCreatedLotteries, getMyTickets } from "@/lib/transactions"
import { toast } from "sonner"
import { PublicKey } from "@solana/web3.js"
import { useAnchorWallet } from "@solana/wallet-adapter-react"

const sampleLotteries = {
  bought: [
    {
      id: 125,
      name: "Flash Round",
      prize: "265.00 SOL",
      endsIn: "Ended",
      ticketsSold: "611",
      status: "Completed",
      myTickets: 5,
    },
    {
      id: 127,
      name: "Night Owl",
      prize: "410.00 SOL",
      endsIn: "02:19:28",
      ticketsSold: "903",
      status: "Live",
      myTickets: 3,
    },
    {
      id: 128,
      name: "Community Pot",
      prize: "1,120.00 SOL",
      endsIn: "08:15:10",
      ticketsSold: "3,402",
      status: "Live",
      myTickets: 8,
    },
  ],
}

export default function DashboardPage() {
  const program = useProgram()
  const [exploreLotteries, setExploreLotteries] = useState<any[]>([])
  const [createdLotteries, setCreatedLotteries] = useState<any[]>([])
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const wallet = useAnchorWallet()

  const fetchlotteries = async () => {
    try {
      if (!program) {
        toast.error("Program not initialized")
        return
      }
      setLoading(true)
      const data = await getAllLotteries(program)
      console.log("Fetched lotteries:", data)

      const transformedLotteries = await Promise.all(
        data.map(async (lotteryData: any, index: number) => {
          try {
            const lottery = await (program.account as any).lottery.fetch(new PublicKey(lotteryData.id))
            console.log(`Fetched lottery ${index}:`, lottery)

            return {
              id: lotteryData.id,
              name: `Lottery #${index + 1}`,
              prize: `${(lottery.totalPrizePool?.toNumber() || 0) / 1000000000} SOL`,
              endsIn: "24:00:00",
              ticketsSold: lottery.ticketsSold?.toString() || "0",
              status: "Open",
              maxTickets: lottery.maxTickets?.toString() || "0",
            }
          } catch (error) {
            console.error(`Error fetching lottery ${index}:`, error)
            return {
              id: lotteryData.id,
              name: `Lottery #${index + 1}`,
              prize: "0 SOL",
              endsIn: "24:00:00",
              ticketsSold: "0",
              status: "Open",
              maxTickets: "0",
            }
          }
        }),
      )

      setExploreLotteries(transformedLotteries)
      toast.success("Lotteries fetched successfully")
    } catch (error) {
      toast.error("Error fetching lotteries")
      console.log("Error fetching lotteries:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCreatedLotteries = async () => {
    try {
      if (!program) {
        toast.error("Program not initialized")
        return
      }
      if (!wallet) {
        toast.error("Wallet not connected")
        return
      }
      setLoading(true)
      const data = await getCreatedLotteries(program, wallet)
      console.log("Fetched created lotteries:", data)
      setCreatedLotteries(data)
      toast.success("Created lotteries fetched successfully")
    } catch (error) {
      toast.error("Error fetching created lotteries")
      console.log("Error fetching created lotteries:", error)
    } finally {
      setLoading(false)
    }
  }

const fetchMyTickets = async () => {
  try {
    if (!program || !wallet) {
      toast.error("Program not initialized or Wallet not connected");
      return;
    }
    setTicketsLoading(true);

    const tickets = await getMyTickets(program, wallet);
    console.log("Fetched tickets:", tickets);

    const ticketsWithLottery = await Promise.all(
      tickets.map(async (ticket: any, index: number) => {
        let lotteryName = `Lottery #${index + 1}`;
        let lotteryStatus = "Unknown";
        let lotteryEndTime: Date | null = null;
        let purchasedAt = new Date();

        if (ticket.lotteryPda) {
          try {
            const lotteryAccount = await (program.account as any).lottery.fetch(
              new PublicKey(ticket.lotteryPda)
            );
            lotteryName = lotteryAccount.name || lotteryName;
            lotteryStatus = lotteryAccount.status === 0 ? "Open" : "Completed";
            lotteryEndTime = lotteryAccount.endsAt
              ? new Date(lotteryAccount.endsAt.toNumber() * 1000)
              : null;
          } catch (err) {
            console.error("Error fetching lottery for ticket", ticket, err);
          }
        }

        // Safely parse purchasedAt
        if (ticket.purchasedAt && typeof ticket.purchasedAt.toNumber === "function") {
          purchasedAt = new Date(ticket.purchasedAt.toNumber() * 1000);
        }

        return {
          ...ticket,
          lotteryName,
          lotteryStatus,
          lotteryEndTime,
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
    fetchlotteries()
    fetchCreatedLotteries()
    fetchMyTickets()
  }, [program])

  const [activeTab, setActiveTab] = useState("explore")

  const renderTicketCard = (ticket: any) => (
    <div
      key={ticket.id }
      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-colors hover:border-zinc-700"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Ticket #{ ticket.id.toString().slice(0, 6)}</h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            {ticket.lotteryName || `Lottery: ${ticket.lotteryPda?.slice(0, 8)}...`}
          </p>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
            ticket.lotteryStatus === "Open" || ticket.lotteryStatus === "Live"
              ? "border-lime-500/30 bg-lime-900 text-white"
              : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
          }`}
        >
          {ticket.lotteryStatus || "Unknown"}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-zinc-400">Lottery PDA</dt>
          <dd className="mt-0.5 font-mono text-xs text-white">
            {ticket.lotteryPda ? `${ticket.lotteryPda.slice(0, 12)}...` : "N/A"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-400">Purchased</dt>
          <dd className="mt-0.5 text-white">
            {ticket.purchasedAt ? new Date(ticket.purchasedAt).toLocaleDateString() : "N/A"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-400">Status</dt>
          <dd className="mt-0.5 text-white">{ticket.lotteryStatus || "Unknown"}</dd>
        </div>
        <div>
          <dt className="text-zinc-400">Ticket ID</dt>
          <dd className="mt-0.5 text-white">#{ ticket.id.toString().slice(0, 6)}</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          {ticket.lotteryStatus === "Open" || ticket.lotteryStatus === "Live"
            ? "Lottery is still active"
            : "Lottery has ended"}
        </p>
        {ticket.lotteryPda && (
          <Link
            href={`/lottery/${ticket.lotteryPda}`}
            className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            View Lottery
          </Link>
        )}
      </div>
    </div>
  )

  const renderLotteryCard = (lottery: any, type: string) => (
    <div
      key={lottery.id}
      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-colors hover:border-zinc-700"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{lottery.name}</h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            {type === "explore" ? `Max Tickets: ${lottery.maxTickets}` : `Round #${lottery.id}`}
          </p>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
            lottery.status === "Live" || lottery.status === "Open"
              ? "border-lime-500/30 bg-lime-900 text-white"
              : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
          }`}
        >
          {lottery.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-zinc-400">Prize</dt>
          <dd className="mt-0.5 font-semibold text-white">{lottery.prize}</dd>
        </div>
        <div>
          <dt className="text-zinc-400">
            {lottery.status === "Live" || lottery.status === "Open" ? "Ends In" : "Status"}
          </dt>
          <dd className="mt-0.5 font-semibold text-white">{lottery.endsIn}</dd>
        </div>
        <div>
          <dt className="text-zinc-400">Tickets Sold</dt>
          <dd className="mt-0.5 text-white">{lottery.ticketsSold}</dd>
        </div>
        {type !== "bought" && (
          <div>
            <dt className="text-zinc-400">Status</dt>
            <dd className="mt-0.5 text-white">
              {lottery.status === "Live" || lottery.status === "Open" ? "Open" : "Closed"}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          {type === "explore" &&
            (lottery.status === "Live" || lottery.status === "Open") &&
            "Join before the timer ends."}
          {type === "created" && lottery.creator && "You created this lottery."}
        </p>
        {type === "explore" && (lottery.status === "Live" || lottery.status === "Open") && (
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
  )

  return (
    <>
      <main className="relative min-h-dvh bg-black text-white font-sans">
        {/* Header */}
        <Header />

        <section className="relative z-10 px-4 pt-10 md:pt-16">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-pretty text-center text-3xl font-extrabold leading-tight md:text-5xl">
              Lottery Dashboard
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-zinc-300 md:text-base">
              Manage your lottery experience - explore new draws, track your tickets, and manage your created lotteries.
            </p>

            {/* Tab Navigation */}
            <div className="mt-8 flex justify-center">
              <div className="flex rounded-full border border-zinc-800 bg-zinc-950/70 p-1">
                <button
                  onClick={() => setActiveTab("explore")}
                  className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                    activeTab === "explore" ? "bg-lime-500 text-black" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  Explore Lotteries
                </button>
                <button
                  onClick={() => setActiveTab("bought")}
                  className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                    activeTab === "bought" ? "bg-lime-500 text-black" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  My Tickets
                </button>
                <button
                  onClick={() => setActiveTab("created")}
                  className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                    activeTab === "created" ? "bg-lime-500 text-black" : "text-zinc-300 hover:text-white"
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
                  {activeTab === "explore" && "Pick an active round to join right now."}
                  {activeTab === "bought" && "View all your purchased lottery tickets."}
                  {activeTab === "created" && "Manage the lotteries you've created."}
                </p>
              </div>
              {activeTab === "created" && (
                <Link
                  href="/create"
                  className="flex items-center gap-2 rounded-full bg-lime-500 px-4 py-2 text-sm font-semibold text-black hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New
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
                    exploreLotteries.map((lottery) => renderLotteryCard(lottery, "explore"))
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
                    myTickets.map((ticket) => renderTicketCard(ticket))
                  ) : (
                    <div className="col-span-full flex items-center justify-center py-12">
                      <div className="text-zinc-400">No tickets purchased yet.</div>
                    </div>
                  )}
                </>
              )}
              {activeTab === "created" && createdLotteries.map((lottery) => renderLotteryCard(lottery, "created"))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}
