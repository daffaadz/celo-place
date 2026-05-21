"use client";

import { useAccount } from "wagmi";
import WalletButton from "./WalletButton";
import { useEffect, useState } from "react";
import { PaintBrush, Warning } from "@phosphor-icons/react";

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, chain } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] text-center p-4 pixel-grid">
        <div className="w-20 h-20 bg-[var(--accent-primary-dim)] rounded-3xl flex items-center justify-center mb-6 border border-[var(--accent-primary)]/30">
          <PaintBrush className="w-10 h-10 text-[var(--accent-primary)]" weight="fill" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">Connect Your Wallet</h1>
        <p className="text-text-secondary max-w-md mb-8">
          You must connect your wallet to view and interact with the global canvas.
        </p>
        <WalletButton variant="hero" />
      </div>
    );
  }

  // 42220 is Celo Mainnet
  if (chain?.id !== 42220) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] text-center p-4 pixel-grid">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
          <Warning className="w-10 h-10 text-red-500" weight="fill" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">Wrong Network</h1>
        <p className="text-text-secondary max-w-md mb-8">
          CeloPlace runs on Celo Mainnet. Please switch networks in your wallet to continue.
        </p>
        <WalletButton variant="hero" />
      </div>
    );
  }

  return <>{children}</>;
}
