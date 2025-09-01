"use client"

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";

export function BottomCTA() {
    const router = useRouter();
    const {connected} = useWallet();
    const {setVisible} = useWalletModal();
  
    const handleNavigate = async()=>{
    if(connected){
      router.push("/dashboard");
    }else{
      alert("Please connect your wallet to proceed.");
      setVisible(true);
    }
  }
  return (
    <section id="cta" className="relative z-10 border-t border-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-14 md:py-20 text-center">
        <h2 className="text-pretty text-2xl font-extrabold md:text-4xl">Ready to try your luck?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-300">
          Connect your wallet and jump in. When you’re ready, wire this UI to your Solana program for real draws.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleNavigate}
            className="rounded-full bg-lime-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
          >
            Hope In
          </button>
          <a
            href="#features"
            className="rounded-full border border-zinc-800 px-6 py-3 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            Explore Features
          </a>
        </div>
      </div>
    </section>
  )
}
