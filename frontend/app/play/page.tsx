"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import HUD from "@/components/game/HUD";
import GlobalChat from "@/components/game/GlobalChat";
import NetworkGuard from "@/components/shared/NetworkGuard";

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

  const isLight = mapMode === "light";

  return (
    <main className={`w-full h-screen overflow-hidden flex flex-col relative ${isLight ? 'bg-white' : 'bg-bg-base'}`}>
      <NetworkGuard>
        <HUD selectedColor={selectedColor} onSelectColor={setSelectedColor} mapMode={mapMode} />
        <GlobalChat mapMode={mapMode} />
        <MapCanvas selectedColor={selectedColor} mapMode={mapMode} />

        {/* Map Mode Switcher */}
        <div className={`fixed bottom-6 left-4 z-[1000] flex p-1 rounded-xl backdrop-blur-xl border shadow-xl ${isLight ? 'bg-white/80 border-black/10' : 'bg-black/90 border-white/[0.1]'}`}>
          {(["dark", "light", "satellite"] as MapMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setMapMode(mode)}
              className={`px-4 py-2 text-sm rounded-lg capitalize transition-all ${
                mapMode === mode 
                  ? 'bg-celo-yellow text-black font-semibold' 
                  : (isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-black/5' : 'text-text-secondary hover:text-white hover:bg-white/10')
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
