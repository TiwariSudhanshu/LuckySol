import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/providers/WalletContextProvider";
// require('@solana/wallet-adapter-react-ui/styles.css');


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LuckySol | Decentralized Lottery on Solana",
  description:
    "LuckySol is a decentralized lottery platform built on Solana. Buy tickets, join fair draws, and win big with transparent on-chain randomness.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletContextProvider>
        {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
