"use client"

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";


export function SwapCard() {
    const { publicKey, connected, disconnect } = useWallet();
    const { setVisible } = useWalletModal();
  
    const handleWalletAction = () => {
      if (connected) {
        disconnect();
      } else {
        setVisible(true);
      }
    };
  
    const formatPublicKey = (key: string) => {
      return `${key.slice(0, 4)}...${key.slice(-4)}`;
    };
  return (
    <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="amount-sol" className="text-xs text-zinc-400">
            Amount in SOL
          </label>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">SOL</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-2.5">
          <input
            id="amount-sol"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className="w-full bg-transparent text-lg outline-none placeholder:text-zinc-600"
            aria-readonly="true"
            readOnly
          />
          <div className="h-1 w-full rounded bg-zinc-800" aria-hidden="true" />
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="you-get" className="text-xs text-zinc-400">
            You get
          </label>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">LSOL</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-2.5">
          <input
            id="you-get"
            type="text"
            placeholder="0.00"
            className="w-full bg-transparent text-lg outline-none placeholder:text-zinc-600"
            aria-readonly="true"
            readOnly
          />
          <div className="size-5 rounded-full border border-zinc-700" aria-hidden="true" />
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-1 text-xs text-zinc-400">Solana Address</div>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-black px-3 py-2.5">
          <span className="text-zinc-500">0x</span>
          <input
            type="text"
            placeholder="(UI only) Your wallet address"
            className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
            aria-readonly="true"
            readOnly
          />
        </div>
      </div>

      <button
        type="button"
        aria-label="Connect Wallet"
        onClick={handleWalletAction}
        className="mb-3 w-full rounded-2xl bg-lime-500 py-3 text-center text-sm font-bold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
      >
         {connected ? (
              <span className="truncate max-w-full">{formatPublicKey(publicKey?.toBase58() || '')}</span>
            ) : (
              <span>Connect Wallet</span>
            )}
      </button>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block size-3 rounded-full bg-lime-400" aria-hidden="true" />
          <span className="inline-block size-3 rounded-full bg-violet-400" aria-hidden="true" />
          <span className="inline-block size-3 rounded-full bg-pink-400" aria-hidden="true" />
        </div>
        <p className="text-[11px] text-zinc-400">
          1 SOL ≈ <span className="text-white">—</span> LSOL
        </p>
      </div>
    </div>
  )
}
