"use client";

import { MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LocationSearchProps {
  onSearch: (lat: number, lng: number) => void;
  mapMode?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function LocationSearch({ onSearch, mapMode = "dark", isOpen, onToggle }: LocationSearchProps) {
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (!isNaN(lat) && !isNaN(lng)) {
      onSearch(lat, lng);
    }
  };

  const isLight = mapMode === "light";

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center pointer-events-auto transition-transform hover:scale-105 shadow-md border",
          isLight 
            ? (isOpen ? "bg-celo-yellow border-black/20 text-black" : "bg-white/90 border-black/20 text-black") 
            : (isOpen ? "bg-celo-yellow border-white/20 text-black" : "bg-black/80 border-white/20 text-white backdrop-blur-md")
        )}
      >
        {isOpen ? <X size={20} /> : <Search size={20} />}
      </button>

      {/* Slide-out Search Panel */}
      <div className={cn(
        "absolute top-0 left-14 transition-all duration-300 pointer-events-auto shadow-xl",
        isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
      )}>
        <form onSubmit={handleSearch} className={cn(
          "backdrop-blur-xl border rounded-2xl p-4 flex flex-col gap-3 transition-colors w-[220px]",
          isLight ? "bg-white/95 border-black/20 text-black" : "bg-black/95 border-white/[0.15] text-white"
        )}>
          <div className={cn("text-xs font-semibold uppercase tracking-wider pl-1 flex items-center gap-1", isLight ? "text-gray-500" : "text-text-secondary")}>
            <MapPin size={12} /> Go to Coordinate
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Lat"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              className={cn(
                "w-full px-2 py-1.5 rounded-lg border text-sm outline-none",
                isLight ? "bg-gray-100 border-gray-300" : "bg-white/5 border-white/20"
              )}
            />
            <input 
              type="text" 
              placeholder="Lng"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              className={cn(
                "w-full px-2 py-1.5 rounded-lg border text-sm outline-none",
                isLight ? "bg-gray-100 border-gray-300" : "bg-white/5 border-white/20"
              )}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-celo-yellow text-black font-semibold py-1.5 rounded-lg text-sm transition-transform hover:scale-105 shadow-sm"
          >
            Teleport
          </button>
        </form>
      </div>
    </div>
  );
}
