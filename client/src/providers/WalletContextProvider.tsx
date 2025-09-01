"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

export const WalletContextProvider: FC<{children: ReactNode}> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(()=>{
    if (process.env.SOLANA_NETWORK){
        return process.env.SOLANA_NETWORK;
    }
    return clusterApiUrl(network);
  },[network])

  const wallets = useMemo(() => {
    return [
      new PhantomWalletAdapter(),
    ];
  }, [endpoint])

  return(
    <ConnectionProvider 
    endpoint={endpoint}
    config={{
      commitment: "processed",
    }}
    >
        <WalletProvider
        wallets={wallets}
        autoConnect={true}
        onError={(error:any) => {
          console.error("Wallet error:", error);
        }}
        >
            <WalletModalProvider>
                {children}
            </WalletModalProvider>

        </WalletProvider>

    </ConnectionProvider>
  )

};
