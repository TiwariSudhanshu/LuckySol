"use client"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function Header() {
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
    <header className="relative z-10">
  <div className="mx-auto flex max-w-7xl items-center justify-between py-5 md:py-6 px-4">
        <button onClick={()=>{window.location.href = '/dashboard'}} className="cursor-pointer flex items-center gap-2">
          {/* Use the logo from /public/logo.png instead of the green circle */}
          <img src="/logo.png" alt="LuckySol" className="h-8 w-8 object-contain" />
          <span className="text-lg font-semibold tracking-wide">LuckySol</span>
        </button>
  <nav className="flex items-center gap-3 flex-wrap">
          <a
            href="#features"
            className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block"
          >
            Features
          </a>
          <a
            href="#leaderboard"
            className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block"
          >
            Leaderboard
          </a>
          <a href="#about" className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block">
            About
          </a>
          <a href="#how" className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block">
            How it works
          </a>
          <a href="#faq" className="hidden rounded px-3 py-2 text-sm text-zinc-300 hover:text-white md:inline-block">
            FAQ
          </a>
          <button
            type="button"
            className="rounded-full bg-lime-500 px-3 sm:px-4 py-2 text-sm font-semibold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black min-w-0 flex items-center justify-center"
            onClick={handleWalletAction}
            aria-label={connected ? "Disconnect Wallet" : "Connect Wallet"}
          >
            {connected ? (
              <span className="truncate max-w-[9rem] sm:max-w-[140px]">{formatPublicKey(publicKey?.toBase58() || '')}</span>
            ) : (
              <span className="whitespace-nowrap">Connect Wallet</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}