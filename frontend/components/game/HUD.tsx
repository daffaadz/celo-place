"use client";

import { useAccount } from "wagmi";
import WalletButton from "@/components/shared/WalletButton";
import ColorPicker from "./ColorPicker";
import LocationSearch from "./LocationSearch";
import { usePixelCanvas } from "@/hooks/usePixelCanvas";
import { StreakDisplay, EconomyStats } from "./EconomyStats";
import { useEffect, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { MissionBoard } from "./MissionBoard";
import { RewardClaimPanel } from "./RewardClaimPanel";

interface HUDProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  onSearchLocation?: (lat: number, lng: number) => void;
  mapMode?: string;
  onOpenEconomy?: () => void;
}

export default function HUD({ selectedColor, onSelectColor, onSearchLocation, mapMode = "dark", onOpenEconomy }: HUDProps) {
  const { address } = useAccount();
  const { getTierInfo, getBaseCharges, pixels } = usePixelCanvas();

  const { data: tierInfo, isLoading: loadingTier, refetch: refetchTier } = getTierInfo(address);
  const { data: baseCharges, refetch: refetchBase } = getBaseCharges(address);

  const [activeTool, setActiveTool] = useState<'color' | 'search' | 'mission' | null>(null);

  const handleToggleTool = (tool: 'color' | 'search' | 'mission') => {
    setActiveTool(prev => prev === tool ? null : tool);
  };

  // Auto-refetch remaining pixels periodically if connected
  useEffect(() => {
    if (!address) return;
    const interval = setInterval(() => {
      refetchTier();
      refetchBase();
    }, 10000);
    return () => clearInterval(interval);
  }, [address, refetchTier, refetchBase]);

  const remaining = tierInfo ? Number(tierInfo[1]) + Number(tierInfo[2]) : undefined;
  const base = baseCharges ? Number(baseCharges) : 3;
  // Denominator reflects base + any currently held bonus to avoid confusion
  const denominator = remaining !== undefined && remaining > base ? remaining : base;

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
            {loadingTier ? (
              <Loader2 className="w-3 h-3 animate-spin text-celo-green" />
            ) : (
              <span className={`font-mono px-1.5 py-[1px] rounded font-semibold ${isLight ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>
                {remaining !== undefined ? remaining : 3}/{denominator}
              </span>
            )}
          </div>
          <p className={`text-[11px] mt-1 max-w-[180px] leading-tight ${isLight ? 'text-gray-500 font-medium' : 'text-text-secondary'}`}>
            Click the map to paint.<br />Limits reset daily.
          </p>
        </div>

        {address && <StreakDisplay isLight={isLight} />}

        {/* Tools */}
        {address && (
          <MissionBoard
            isLight={isLight}
            isOpen={activeTool === 'mission'}
            onToggle={() => handleToggleTool('mission')}
          />
        )}
        <ColorPicker
          selectedColor={selectedColor}
          onSelectColor={onSelectColor}
          mapMode={mapMode}
          isOpen={activeTool === 'color'}
          onToggle={() => handleToggleTool('color')}
        />
        {onSearchLocation && (
          <LocationSearch
            onSearch={onSearchLocation}
            mapMode={mapMode}
            isOpen={activeTool === 'search'}
            onToggle={() => handleToggleTool('search')}
          />
        )}
      </div>

      {/* Center HUD - Global Pixel Counter & Economy */}
      <div className="flex flex-col items-center gap-2 pointer-events-auto absolute left-1/2 -translate-x-1/2 top-4">
        <div className={`backdrop-blur-xl border rounded-full px-6 py-2 flex items-center gap-2 transition-colors shadow-lg ${isLight ? 'bg-white/80 border-black/10 text-black' : 'bg-black/80 border-white/[0.06] text-white'}`}>
          <div className="w-2 h-2 rounded-full bg-celo-green animate-pulse mr-1" />
          <span className={`text-xs font-semibold tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Pixels Placed :</span>
          <span className={`font-mono text-md font-semibold ${isLight ? 'text-green-800' : 'text-celo-yellow'}`}>
            {pixels.length.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Right side HUD */}
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        <WalletButton variant="hud" />
        {address && (
          <div className="flex flex-col gap-2 w-full max-w-[220px]">
            <EconomyStats isLight={isLight} />
            <RewardClaimPanel isLight={isLight} />
            <button
              onClick={onOpenEconomy}
              className={`w-full py-2 px-3 flex items-center justify-center gap-2 rounded-lg font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 ${isLight ? 'bg-celo-yellow text-black hover:bg-[#e5d100]' : 'bg-celo-yellow text-black hover:brightness-110'}`}
            >
              <Wallet className="w-4 h-4" /> Open Cplace Hub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
