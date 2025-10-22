"use client"
import { buyTicket } from "@/lib/transactions"
import { useProgram } from "@/lib/useProgram"
import { program } from "@coral-xyz/anchor/dist/cjs/native/system"
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { PublicKey } from "@solana/web3.js"
import { useState } from "react"
import { toast } from "sonner"

interface BuyTicketModalProps {
  isOpen: boolean
  onClose: () => void
  lotteryId: string
  ticketPrice: number
  // id:  string
}

export default function BuyTicketModal({ isOpen, onClose, lotteryId, ticketPrice }: BuyTicketModalProps) {
  const [ticketCount, setTicketCount] = useState(1)
  const { publicKey, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const [loading, setLoading] = useState(false)
  const program = useProgram();
  const wallet = useAnchorWallet();

  const handleWalletAction = () => {
    setVisible(true)
  }


const handleBuyTickets = async () => {
  // Prevent double-clicks and multiple submissions
  if (loading) {
    console.log("Transaction already in progress, ignoring click");
    return;
  }
  
  setLoading(true);

  try {
    if (!program || !wallet) {
      toast.error("Program or wallet not found!");
      return;
    }

    if (!lotteryId) {
      toast.error("No lottery ID found!");
      return;
    }

    if (!connected) {
      toast.error("Wallet not connected!");
      return;
    }

    // Show processing toast
    const processingToast = toast.loading("🎟️ Processing ticket purchase...", {
      duration: 30000 // 30 second timeout
    });

    try {
      // Call the improved buyTicket function
      const response = await buyTicket(program, lotteryId, wallet);

      if (response) {
        // Dismiss processing toast and show success
        toast.dismiss(processingToast);
        toast.success("� Ticket purchased successfully!", {
          description: `Transaction: ${response.slice(0, 8)}...${response.slice(-8)}`
        });
        console.log("Transaction signature:", response);
        
        // Close modal after a brief delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (txError: any) {
      // Dismiss processing toast
      toast.dismiss(processingToast);
      throw txError;
    }
    
  } catch (error: any) {
    // More specific error handling
    let errorMessage = "Something went wrong while purchasing tickets!";
    
    if (error.message.includes("Insufficient SOL")) {
      errorMessage = error.message;
    } else if (error.message.includes("sold out")) {
      errorMessage = "This lottery is sold out!";
    } else if (error.message.includes("no longer accepting")) {
      errorMessage = "This lottery has ended!";
    } else if (error.message.includes("duplicate")) {
      errorMessage = "Transaction already submitted. Please wait...";
    } else if (error.message.includes("network")) {
      errorMessage = "Network error. Please try again.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(`❌ ${errorMessage}`);
    console.error("Error purchasing tickets:", error);
  } finally {
    setLoading(false);
  }
};



  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
        {/* Close button */}
        <button onClick={onClose} className="absolute right-4 top-4 text-zinc-400 hover:text-white">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
          <div className="mb-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
            Enter the next LuckySol round
          </p>
          <h1 className="text-2xl font-extrabold leading-tight md:text-3xl">Buy Tickets</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300 break-words">
            Choose how many tickets to purchase for Lottery #{lotteryId}
          </p>
        </div>

        {/* Purchase Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
          {/* Number of Tickets */}
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="ticket-count" className="text-xs text-zinc-400">
                Number of tickets
              </label>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">#</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-2.5 min-w-0">
              <input
                id="ticket-count"
                type="number"
                min={1}
                value={ticketCount}
                onChange={(e) => setTicketCount(Number(e.target.value))}
                className="w-full min-w-0 bg-transparent text-lg outline-none placeholder:text-zinc-600"
              />
              <div className="size-5 rounded-full border border-zinc-700" />
            </div>
          </div>

          {/* Estimated Cost */}
          <div className="mb-5">
            <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
              <span>Estimated cost</span>
              <span className="text-white">{(ticketCount * ticketPrice).toFixed(3)} SOL</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-900">
              <div className="h-2 w-1/5 rounded-full bg-lime-500/70" />
            </div>
          </div>

          {/* Address */}
            <div className="mb-5">
            <div className="mb-1 text-xs text-zinc-400">Solana Address</div>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-black px-3 py-2.5">
              <span className="text-zinc-500">0x</span>
              <input
                type="text"
                value={connected && publicKey ? publicKey.toBase58() : ""}
                placeholder={connected ? "Wallet connected" : "Connect your wallet first"}
                className="w-full min-w-0 break-all bg-transparent text-sm outline-none placeholder:text-zinc-600"
                readOnly
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {connected ? (
              <button
                type="button"
                disabled
                className="flex-1 rounded-2xl bg-zinc-700 px-5 py-3 text-sm font-bold text-zinc-400 cursor-not-allowed min-w-0"
              >
                <span className="truncate">Wallet Connected</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleWalletAction}
                className="flex-1 rounded-2xl bg-lime-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black min-w-0"
              >
                <span className="truncate">Connect Wallet</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleBuyTickets}
              disabled={!connected || loading}
              className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-semibold cursor-pointer text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-900 transition-colors min-w-0"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                "Confirm Purchase"
              )}
            </button>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block size-3 rounded-full bg-lime-400" />
              <span className="inline-block size-3 rounded-full bg-violet-400" />
              <span className="inline-block size-3 rounded-full bg-pink-400" />
            </div>
            <p className="text-[11px] text-zinc-400">
              1 Ticket ≈ <span className="text-white">{ticketPrice}</span> SOL
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
