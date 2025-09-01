"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function ConnectWallet(){
    return(
        <div className="flex justify-center">
            <WalletMultiButton></WalletMultiButton>
        </div>
    )
}