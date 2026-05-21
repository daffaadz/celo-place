"use client";

import { useState, useCallback } from "react";
import { Check, Palette, X } from "@phosphor-icons/react";

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  mapMode?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const PRESET_COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FF8800", "#8800FF",
  "#00FF88", "#FF0088", "#888888", "#444444", "#CCCCCC",
  "#FF4444", "#44FF44", "#4444FF", "#FFAA00", "#AA00FF",
  "#00FFAA", "#FF00AA", "#AA4400", "#004400", "#000088",
  "#884400", "#448800", "#004488", "#880044", "#448844",
  "#884488", "#FF8888", "#88FF88", "#8888FF", "#FFFF88",
];

export default function ColorPicker({ selectedColor, onSelectColor, mapMode = "dark", isOpen = false, onToggle }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(selectedColor);
  const isLight = mapMode === "light";

  const handleCustom = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
    onSelectColor(e.target.value);
  }, [onSelectColor]);

  const panelBg = isLight
    ? "bg-white/90 border-black/20 shadow-xl"
    : "bg-[#12121A]/90 border-white/[0.08] shadow-xl shadow-black/50";

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        title="Color Picker"
        className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all shadow-md ${
          isOpen
            ? "border-[var(--accent-primary)] shadow-[0_0_12px_rgba(228,76,255,0.4)]"
            : isLight ? "border-black/20 hover:border-black/40" : "border-white/[0.12] hover:border-white/30"
        }`}
        style={{ backgroundColor: selectedColor }}
      >
        {isOpen
          ? <X weight="bold" className="w-4 h-4 mix-blend-difference text-white" />
          : <Palette weight="bold" className="w-4 h-4 mix-blend-difference text-white" />
        }
      </button>

      {isOpen && (
        <div className={`absolute left-0 top-full mt-2 p-3 rounded-2xl backdrop-blur-xl border z-50 w-[220px] ${panelBg}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${isLight ? "text-gray-400" : "text-text-secondary"}`}>
            Preset Colors
          </p>
          <div className="grid grid-cols-7 gap-1.5 mb-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onSelectColor(color)}
                className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: selectedColor === color ? "var(--accent-primary)" : "transparent",
                  boxShadow: selectedColor === color ? "0 0 8px rgba(228,76,255,0.5)" : "none",
                }}
              >
                {selectedColor === color && (
                  <Check weight="bold" className="w-3 h-3 mx-auto mix-blend-difference text-white" />
                )}
              </button>
            ))}
          </div>
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${isLight ? "text-gray-400" : "text-text-secondary"}`}>
            Custom
          </p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={handleCustom}
              className="w-8 h-8 rounded-lg cursor-pointer border-2 border-white/10"
            />
            <span className={`text-xs font-mono ${isLight ? "text-gray-600" : "text-text-secondary"}`}>
              {customColor.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
