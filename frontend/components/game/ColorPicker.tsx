"use client";

import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const PALETTE = [
  "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", 
  "#0000FF", "#4B0082", "#9400D3", "#FFFFFF",
  "#000000", "#808080", "#FFC0CB", "#A52A2A"
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  mapMode?: string;
}

export default function ColorPicker({ selectedColor, onSelectColor, mapMode = "dark" }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(selectedColor);

  useEffect(() => {
    setHexInput(selectedColor);
  }, [selectedColor]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('#')) val = '#' + val;
    setHexInput(val);
    
    // Validate hex before updating parent
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onSelectColor(val);
    }
  };

  const isLight = mapMode === "light";

  return (
    <div className={cn(
      "backdrop-blur-xl border rounded-2xl p-4 flex flex-col gap-3 pointer-events-auto transition-colors",
      isLight ? "bg-white/80 border-black/10" : "bg-black/90 border-white/[0.1]"
    )}>
      <div className={cn("text-xs font-semibold uppercase tracking-wider pl-1", isLight ? "text-gray-500" : "text-text-secondary")}>
        Palette & Custom
      </div>
      
      {/* Predefined Palette */}
      <div className="grid grid-cols-6 gap-2">
        {PALETTE.map((color) => {
          const isSelected = selectedColor.toUpperCase() === color.toUpperCase();
          return (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className={cn(
                "w-8 h-8 rounded-full transition-all duration-200 border-2",
                isSelected 
                  ? (isLight ? "scale-110 border-black shadow-[0_0_8px_rgba(0,0,0,0.2)]" : "scale-110 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]")
                  : (isLight ? "border-black/5 hover:scale-105" : "border-white/5 hover:scale-105")
              )}
              style={{ backgroundColor: color }}
              title={color}
            >
              {isSelected && ['#FFFFFF', '#FFFF00'].includes(color.toUpperCase()) && <Check size={16} className="text-black mx-auto" />}
              {isSelected && !['#FFFFFF', '#FFFF00'].includes(color.toUpperCase()) && <Check size={16} className="text-white mx-auto drop-shadow-md" />}
            </button>
          );
        })}
      </div>

      <div className={cn("h-px w-full my-1", isLight ? "bg-black/5" : "bg-white/10")} />

      {/* Advanced Custom Color Picker */}
      <div className="flex justify-between items-center gap-2">
        <div className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-lg border",
          isLight ? "bg-gray-100 border-gray-200 text-black" : "bg-white/5 border-white/10 text-white font-mono"
        )}>
           <span className={isLight ? "text-gray-400 font-sans" : "text-gray-500"}>Hex</span>
           <input 
             type="text" 
             value={hexInput}
             onChange={handleHexChange}
             className="bg-transparent outline-none w-20 text-sm uppercase"
             maxLength={7}
           />
        </div>

        <div className={cn(
          "relative w-10 h-10 rounded-lg overflow-hidden border-2 cursor-pointer transition-transform hover:scale-105",
          isLight ? "border-gray-200" : "border-white/20"
        )}>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onSelectColor(e.target.value)}
            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
