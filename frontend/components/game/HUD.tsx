"use client";

import { useAccount } from "wagmi";
import WalletButton from "@/components/shared/WalletButton";
import ColorPicker from "./ColorPicker";
import { usePixelCanvas } from "@/hooks/usePixelCanvas";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface HUDProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export default function HUD({ selectedColor, onSelectColor }: HUDProps) {
  const { address } = useAccount();
  const { getRemainingPixels } = usePixelCanvas();
  
  const { data: remaining, isLoading, refetch } = getRemainingPixels(address);

  // Auto-refetch remaining pixels periodically if connected
  useEffect(() => {
    if (!address) return;
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [address, refetch]);

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-[1000] flex justify-between items-start">
      {/* Left side HUD */}
      <div className="flex flex-col gap-4">
        {/* Branding / Info Box */}
        <div className="bg-black/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-1 pointer-events-auto">
          <h1 className="text-xl font-black text-white">
            Celo<span className="text-celo-yellow">Place</span>
          </h1>
          <div className="text-sm flex items-center gap-2 mt-2">
            <span className="text-text-secondary">Remaining Pixels:</span>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-celo-green" />
            ) : (
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-semibold">
                 {remaining !== undefined ? Number(remaining) : 3}/3
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-1 max-w-[200px]">
            Click the map to paint. Limits reset daily.
          </p>
        </div>

        {/* Tools */}
        <ColorPicker selectedColor={selectedColor} onSelectColor={onSelectColor} />
      </div>

      {/* Right side HUD */}
      <div className="flex flex-col items-end gap-4">
        <WalletButton variant="hud" />
      </div>
    </div>
  );
}
