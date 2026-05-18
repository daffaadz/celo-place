"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import HUD from "@/components/game/HUD";
import GlobalChat from "@/components/game/GlobalChat";
import NetworkGuard from "@/components/shared/NetworkGuard";
import { useAccount } from "wagmi";
import OnboardingModal from "@/components/game/OnboardingModal";

import EconomyModal from "@/components/game/EconomyModal";

const MapCanvas = dynamic(() => import("@/components/game/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-bg-base text-celo-yellow">
      <div className="w-12 h-12 border-4 border-celo-yellow border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 font-mono">Loading World Canvas...</p>
    </div>
  ),
});

export type MapMode = "dark" | "light" | "satellite";

export default function PlayPage() {
  const [selectedColor, setSelectedColor] = useState<string>("#FF0000");
  const [mapMode, setMapMode] = useState<MapMode>("dark");
  const [flyToCoord, setFlyToCoord] = useState<{ lat: number; lng: number } | null>(null);
  const { address, isConnected } = useAccount();

  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showEconomyModal, setShowEconomyModal] = useState(false);

  // Check login status on mount and when account changes
  useEffect(() => {
    if (isConnected && address) {
      const savedName = localStorage.getItem(`celoplace_name_${address.toLowerCase()}`);
      if (savedName) {
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(true);
    }
  }, [isConnected, address]);


  const isLight = mapMode === "light";

  return (
    <main className={`w-full h-screen overflow-hidden flex flex-col relative ${isLight ? 'bg-white' : 'bg-[#0a0a0a]'}`}>
      <NetworkGuard>
        {showOnboarding && <OnboardingModal onComplete={() => setShowOnboarding(false)} />}
        {showEconomyModal && <EconomyModal onClose={() => setShowEconomyModal(false)} isLight={isLight} />}
        <HUD 
          selectedColor={selectedColor} 
          onSelectColor={setSelectedColor} 
          onSearchLocation={(lat, lng) => setFlyToCoord({ lat, lng })}
          mapMode={mapMode} 
          onOpenEconomy={() => setShowEconomyModal(true)}
        />
        <GlobalChat mapMode={mapMode} />
        {!showOnboarding && <MapCanvas selectedColor={selectedColor} mapMode={mapMode} flyToCoord={flyToCoord} />}
        
        {/* Map Mode Switcher */}
        <div className={`fixed bottom-6 left-4 z-[1000] flex p-1 rounded-xl backdrop-blur-xl border shadow-xl ${isLight ? 'bg-white/90 border-black/20' : 'bg-black/90 border-white/[0.15]'}`}>
          {(["dark", "light", "satellite"] as MapMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setMapMode(mode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                mapMode === mode 
                  ? 'bg-celo-yellow text-black' 
                  : (isLight ? 'text-gray-600 hover:text-gray-900 hover:bg-black/5' : 'text-text-secondary hover:text-white hover:bg-white/10')
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </NetworkGuard>
    </main>
  );
}
