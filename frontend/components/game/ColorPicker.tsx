"use client";

import { Check, Palette, X } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center pointer-events-auto transition-transform hover:scale-105 shadow-md border",
          isLight 
            ? (isOpen ? "bg-celo-yellow border-black/20 text-black" : "bg-white/90 border-black/20 text-black") 
            : (isOpen ? "bg-celo-yellow border-white/20 text-black" : "bg-black/80 border-white/20 text-white backdrop-blur-md")
        )}
      >
        {isOpen ? <X size={20} /> : <Palette size={20} />}
      </button>

      {/* Slide-out Picker Panel */}
      <div className={cn(
        "absolute top-0 left-14 transition-all duration-300 pointer-events-auto shadow-xl",
        isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
      )}>
        <div className={cn(
          "backdrop-blur-xl border rounded-2xl p-3 flex flex-col gap-3 transition-colors w-[220px]",
          isLight ? "bg-white/95 border-black/20" : "bg-black/95 border-white/[0.15]"
        )}>
          <div className={cn("text-xs font-semibold uppercase tracking-wider pl-1", isLight ? "text-gray-500" : "text-text-secondary")}>
            Palette & Custom
          </div>
          
          {/* Predefined Palette */}
          <div className="grid grid-cols-4 gap-2">
            {PALETTE.map((color) => {
              const isSelected = selectedColor.toUpperCase() === color.toUpperCase();
              return (
                <button
                  key={color}
                  onClick={() => onSelectColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all duration-200 border-2 mx-auto",
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

          <div className={cn("h-px w-full my-1", isLight ? "bg-black/10" : "bg-white/10")} />

          {/* Advanced Custom Color Picker */}
          <div className="flex justify-between items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-lg border flex-1",
              isLight ? "bg-gray-100 border-gray-300 text-black" : "bg-white/5 border-white/20 text-white font-mono"
            )}>
               <span className={isLight ? "text-gray-500 font-sans text-xs" : "text-gray-400 text-xs"}>Hex</span>
               <input 
                 type="text" 
                 value={hexInput}
                 onChange={handleHexChange}
                 className="bg-transparent outline-none w-16 text-sm uppercase"
                 maxLength={7}
               />
            </div>

            <div className={cn(
              "relative w-8 h-8 rounded-lg overflow-hidden border-2 cursor-pointer transition-transform hover:scale-105 shrink-0",
              isLight ? "border-gray-300" : "border-white/20"
            )}>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onSelectColor(e.target.value)}
                className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
