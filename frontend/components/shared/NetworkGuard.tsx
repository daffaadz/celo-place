"use client";

import { useAccount } from "wagmi";
import WalletButton from "./WalletButton";
import { useEffect, useState } from "react";
import { Paintbrush } from "lucide-react";

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, chain } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-bg-base text-center p-4">
        <div className="w-20 h-20 bg-celo-yellow/10 rounded-3xl flex items-center justify-center mb-6 border border-celo-yellow/20">
          <Paintbrush className="w-10 h-10 text-celo-yellow" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">Connect Your Wallet</h1>
        <p className="text-text-secondary max-w-md mb-8">
          You must connect your MetaMask wallet to view and interact with the global canvas.
        </p>
        <WalletButton variant="hero" />
      </div>
    );
  }

  if (chain?.id !== 11142220) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-bg-base text-center p-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-4">Wrong Network</h1>
        <p className="text-text-secondary max-w-md mb-8">
          CeloPlace runs on the Celo Sepolia testnet. Please switch networks in your wallet to continue.
        </p>
        <WalletButton variant="hero" />
      </div>
    );
  }

  return <>{children}</>;
}
