"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import WalletButton from "@/components/shared/WalletButton";

export default function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const { address, isConnected } = useAccount();
  const [name, setName] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address) return;
    
    // Save to local storage specifically for this address
    localStorage.setItem(`celoplace_name_${address.toLowerCase()}`, name.trim());
    onComplete();
  };

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-celo-yellow/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-celo-green/20 rounded-full blur-[60px] pointer-events-none" />
        
        <h2 className="text-3xl font-black text-white relative z-10 text-center mb-2">
          Join Celo<span className="text-celo-yellow">Place</span>
        </h2>
        <p className="text-text-secondary text-center mb-8 relative z-10 text-sm">
          Before creating art on the blockchain, connect your wallet and choose a display name so others know who placed the pixel.
        </p>

        <div className="flex flex-col gap-6 relative z-10">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-white/80 uppercase tracking-wider">1. Connect Wallet</label>
            <div className="flex justify-center bg-white/5 border border-white/10 rounded-xl p-4">
              <WalletButton variant="hud" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-white/80 uppercase tracking-wider">2. Choose Name</label>
            <input 
              type="text" 
              placeholder="e.g. Satoshi" 
              required
              disabled={!isConnected}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-celo-yellow focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            
            <button 
              type="submit" 
              disabled={!isConnected || !name.trim()}
              className="mt-4 w-full bg-celo-yellow text-black font-bold py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
            >
              Enter the Canvas
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
