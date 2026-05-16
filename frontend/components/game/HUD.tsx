"use client";

import { useAccount } from "wagmi";
import WalletButton from "@/components/shared/WalletButton";
import ColorPicker from "./ColorPicker";
import LocationSearch from "./LocationSearch";
import { usePixelCanvas } from "@/hooks/usePixelCanvas";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface HUDProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  onSearchLocation?: (lat: number, lng: number) => void;
  mapMode?: string;
}

export default function HUD({ selectedColor, onSelectColor, onSearchLocation, mapMode = "dark" }: HUDProps) {
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
      <div className="flex flex-col gap-2">
        {/* Branding / Info Box */}
        <div className={`backdrop-blur-xl border rounded-2xl p-3 flex flex-col gap-1 pointer-events-auto transition-colors shadow-md ${isLight ? 'bg-white/90 border-black/20' : 'bg-black/80 border-white/[0.15]'}`}>
          <h1 className={`text-lg font-black drop-shadow-[0_0_0.65px_rgba(0,0,0,1)] ${isLight ? 'text-black' : 'text-white'}`}>
            Celo<span className="text-celo-yellow drop-shadow-[0_0_0.65px_rgba(0,0,0,1)]">Place</span>
          </h1>
          <div className="text-xs flex items-center gap-2 mt-1">
            <span className={isLight ? "text-gray-600 font-medium" : "text-text-secondary"}>Remaining Pixels:</span>
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-celo-green" />
            ) : (
              <span className={`font-mono px-1.5 py-[1px] rounded font-semibold ${isLight ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>
                 {remaining !== undefined ? Number(remaining) : 3}/3
              </span>
            )}
          </div>
          <p className={`text-[11px] mt-1 max-w-[180px] leading-tight ${isLight ? 'text-gray-500 font-medium' : 'text-text-secondary'}`}>
            Click the map to paint.<br/>Limits reset daily.
          </p>
        </div>

        {/* Tools */}
        <ColorPicker selectedColor={selectedColor} onSelectColor={onSelectColor} mapMode={mapMode} />
        {onSearchLocation && <LocationSearch onSearch={onSearchLocation} mapMode={mapMode} />}
      </div>

      {/* Center HUD - Global Pixel Counter (Rev 6) */}
      <div className="flex justify-center pointer-events-auto absolute left-1/2 -translate-x-1/2 top-4">
        <div className={`backdrop-blur-xl border rounded-full px-6 py-2 flex items-center gap-3 transition-colors shadow-lg ${isLight ? 'bg-white/80 border-black/10 text-black' : 'bg-black/80 border-white/[0.06] text-white'}`}>
          <div className="w-2 h-2 rounded-full bg-celo-green animate-pulse" />
          <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Pixels Placed</span>
          <span className={`font-mono text-lg font-bold ${isLight ? 'text-black' : 'text-celo-yellow'}`}>
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
