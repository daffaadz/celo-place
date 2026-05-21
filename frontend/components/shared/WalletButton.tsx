"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { useRouter } from "next/navigation";
import { cn, truncateAddress } from "@/lib/utils";
import { SignOut } from "@phosphor-icons/react";

interface WalletButtonProps {
  variant?: "hero" | "hud";
}

export default function WalletButton({ variant = "hero" }: WalletButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const handleConnect = () => {
    connect({ connector: metaMask() });
  };

  if (!mounted || !isConnected) {
    return (
      <button
        onClick={handleConnect}
        className={cn(
          "font-bold rounded-xl transition-all duration-200",
          "bg-[var(--accent-primary)] text-white hover:brightness-110 hover:shadow-[0_0_20px_rgba(228,76,255,0.4)]",
          variant === "hero" ? "px-8 py-3.5 text-base" : "px-4 py-2 text-sm pointer-events-auto"
        )}
      >
        Connect Wallet
      </button>
    );
  }

  // 42220 is Celo Mainnet
  if (chain?.id !== 42220) {
    if (variant === "hero") {
      return (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-red-400">Please switch to Celo Mainnet</p>
          <button
            onClick={() => switchChain({ chainId: 42220 })}
            className="border border-[var(--accent-primary)]/40 text-text-primary px-6 py-3 rounded-xl hover:bg-[var(--accent-primary)]/10 transition-all duration-200"
          >
            Switch to Celo Mainnet
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-3 py-1.5 text-xs">
          Wrong network
        </div>
        <button
          onClick={() => switchChain({ chainId: 42220 })}
          className="border border-white/10 text-text-primary px-4 py-2 rounded-xl hover:bg-white/[0.04] transition-all duration-200 text-sm bg-black/50 backdrop-blur-md"
        >
          Switch to Celo Mainnet
        </button>
      </div>
    );
  }

  // Connected and correct network
  if (variant === "hero") {
    return (
      <button
        onClick={() => router.push('/play')}
        className="bg-[var(--accent-primary)] text-white font-bold px-8 py-3.5 rounded-xl hover:brightness-110 hover:shadow-[0_0_24px_rgba(228,76,255,0.5)] transition-all duration-200 text-base"
      >
        Start Painting →
      </button>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-[#12121A]/80 border border-white/[0.08] rounded-2xl px-4 py-3 flex items-center gap-4 pointer-events-auto">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[var(--celo-green)] animate-pulse"></div>
        <div className="flex flex-col">
          <span className="text-sm font-mono text-text-primary">{truncateAddress(address)}</span>
          <span className="text-xs text-text-secondary">
            {balance ? Number(balance.formatted).toFixed(4) : "0.0000"} CELO
          </span>
        </div>
      </div>
      <button 
        onClick={() => disconnect()}
        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-text-secondary hover:text-white"
        title="Disconnect"
      >
        <SignOut size={16} />
      </button>
    </div>
  );
}
