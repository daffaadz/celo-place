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

export default function PlayPage() {
  const [selectedColor, setSelectedColor] = useState<string>("#FF0000");

  return (
    <main className="w-full h-screen overflow-hidden flex flex-col bg-bg-base relative">
      <NetworkGuard>
        <HUD selectedColor={selectedColor} onSelectColor={setSelectedColor} />
        <GlobalChat />
        <MapCanvas selectedColor={selectedColor} />
      </NetworkGuard>
    </main>
  );
}
