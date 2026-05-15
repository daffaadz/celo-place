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
  mapMode?: string;
}

export default function HUD({ selectedColor, onSelectColor, mapMode = "dark" }: HUDProps) {
  const { address } = useAccount();
  const { getRemainingPixels, pixels } = usePixelCanvas();
  
  const { data: remaining, isLoading, refetch } = getRemainingPixels(address);

  // Auto-refetch remaining pixels periodically if connected
  useEffect(() => {
    if (!address) return;
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [address, refetch]);

  const isLight = mapMode === "light";

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-[1000] flex justify-between items-start">
      {/* Left side HUD */}
      <div className="flex flex-col gap-4">
        {/* Branding / Info Box */}
        <div className={\ackdrop-blur-xl border rounded-2xl p-4 flex flex-col gap-1 pointer-events-auto transition-colors \\}>
          <h1 className={\	ext-xl font-black \\}>
            Celo<span className="text-celo-yellow">Place</span>
          </h1>
          <div className="text-sm flex items-center gap-2 mt-2">
            <span className={isLight ? "text-gray-500" : "text-text-secondary"}>Remaining Pixels:</span>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-celo-green" />
            ) : (
              <span className={\ont-mono px-2 py-0.5 rounded font-semibold \\}>
                 {remaining !== undefined ? Number(remaining) : 3}/3
              </span>
            )}
          </div>
          <p className={\	ext-xs mt-1 max-w-[200px] \\}>
            Click the map to paint. Limits reset daily.
          </p>
        </div>

        {/* Tools */}
        <ColorPicker selectedColor={selectedColor} onSelectColor={onSelectColor} mapMode={mapMode} />
      </div>

      {/* Center HUD - Global Pixel Counter (Rev 6) */}
      <div className="flex justify-center pointer-events-auto absolute left-1/2 -translate-x-1/2 top-4">
        <div className={\ackdrop-blur-xl border rounded-full px-6 py-2 flex items-center gap-3 transition-colors shadow-lg \\}>
          <div className="w-2 h-2 rounded-full bg-celo-green animate-pulse" />
          <span className={\	ext-xs font-semibold uppercase tracking-wider \\}>Pixels Placed</span>
          <span className="font-mono text-lg font-bold text-celo-yellow">
            {pixels.length.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Right side HUD */}
      <div className="flex flex-col items-end gap-4 pointer-events-auto">
        <WalletButton variant="hud" />
      </div>
    </div>
  );
}
