"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { useRouter } from "next/navigation";
import { cn, truncateAddress } from "@/lib/utils";
import { LogOut } from "lucide-react";

interface WalletButtonProps {
  variant?: "hero" | "hud";
}

export default function WalletButton({ variant = "hero" }: WalletButtonProps) {
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });
  const router = useRouter();

  const handleConnect = () => {
    connect({ connector: metaMask() });
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className={cn(
          "bg-celo-yellow text-black font-bold rounded-xl hover:brightness-110 transition-all duration-200",
          variant === "hero" ? "px-6 py-3 text-lg" : "px-4 py-2 text-sm pointer-events-auto"
        )}
      >
        Connect MetaMask
      </button>
    );
  }

  // 11142220 is Celo Sepolia
  if (chain?.id !== 11142220) {
    if (variant === "hero") {
      return (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-red-400">Please switch to Celo Sepolia</p>
          <button
            onClick={() => switchChain({ chainId: 11142220 })}
            className="border border-white/10 text-text-primary px-6 py-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200"
          >
            Switch Network
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
          onClick={() => switchChain({ chainId: 11142220 })}
          className="border border-white/10 text-text-primary px-4 py-2 rounded-xl hover:bg-white/[0.04] transition-all duration-200 text-sm bg-black/50 backdrop-blur-md"
        >
          Switch to Celo Sepolia
        </button>
      </div>
    );
  }

  // Connected and correct network
  if (variant === "hero") {
    return (
      <button
        onClick={() => router.push('/play')}
        className="bg-celo-yellow text-black font-bold px-6 py-3 rounded-xl hover:brightness-110 transition-all duration-200 text-lg"
      >
        Enter CeloPlace
      </button>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-black/[0.65] border border-white/[0.06] rounded-2xl px-4 py-3 flex items-center gap-4 pointer-events-auto">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-celo-green animate-pulse"></div>
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
        <LogOut size={16} />
      </button>
    </div>
  );
}
