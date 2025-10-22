import * as anchor from '@coral-xyz/anchor';
import idl from '../idl/lottery.json'
import { useConnection} from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

export function useProgram(){
    const wallet = useAnchorWallet();
    const {connection} = useConnection();

    const program = useMemo(()=>{
        if(!wallet){
            // Wallet may be unavailable during initial render/hydration.
            // Use debug log instead of error to avoid noisy error reporting.
            console.debug("useProgram: wallet not connected");
            return null;
        }
 

    const provider = new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: "processed"
    });
    
    anchor.setProvider(provider);

    const program = new anchor.Program(
        idl as anchor.Idl,
        provider
    )

    return program;
   },[wallet, connection])

    return program;
}