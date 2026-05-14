"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PALETTE = [
  "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", 
  "#0000FF", "#4B0082", "#9400D3", "#FFFFFF",
  "#000000", "#808080", "#FFC0CB", "#A52A2A"
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  return (
    <div className="bg-black/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-3 pointer-events-auto">
      <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider pl-1">
        Palette
      </div>
      <div className="grid grid-cols-6 gap-2">
        {PALETTE.map((color) => {
          const isSelected = selectedColor === color;
          return (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className={cn(
                "w-8 h-8 rounded-full transition-all duration-200 border-2",
                isSelected ? "scale-110 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: color }}
              title={color}
            >
              {isSelected && color === "#FFFFFF" && <Check size={16} className="text-black mx-auto" />}
              {isSelected && color !== "#FFFFFF" && <Check size={16} className="text-white mx-auto drop-shadow-md" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
