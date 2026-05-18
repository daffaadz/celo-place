import React from "react";
import { formatEther } from "viem";
import { truncateAddress } from "@/lib/utils";

interface TooltipProps {
  initialX: number;
  initialY: number;
  isLight: boolean;
  painter: string;
  priceWei: bigint;
  ageSeconds: number;
}

export const OverwritePriceTooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ initialX, initialY, isLight, painter, priceWei, ageSeconds }, ref) => {
    const formattedPrice = formatEther(priceWei);
    
    return (
      <div 
        ref={ref}
        className={`absolute z-[1000] pointer-events-none px-2.5 py-1.5 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-full mt-[-10px] text-[10px] flex flex-col gap-0.5 transition-opacity ${isLight ? 'bg-white text-black border border-black/10' : 'bg-[#111] text-white border border-white/10'}`}
        style={{ left: initialX, top: initialY, willChange: 'left, top' }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className={`font-semibold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Painter</span>
          <span className="text-celo-yellow font-mono">{localStorage.getItem(`celoplace_name_${painter.toLowerCase()}`) || truncateAddress(painter)}</span>
        </div>
        
        <div className="flex items-center justify-between gap-3">
          <span className={`font-semibold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Age</span>
          <span className="font-mono">{Math.floor(ageSeconds / 3600)}h {Math.floor((ageSeconds % 3600) / 60)}m</span>
        </div>
        
        <div className={`flex items-center justify-between gap-3 border-t pt-0.5 mt-0.5 ${isLight ? 'border-black/10' : 'border-white/10'}`}>
          <span className="font-bold">Price</span>
          <span className="text-celo-green font-bold">{formattedPrice} CELO</span>
        </div>

        {/* Performant CSS Triangle Pointer */}
        <div className={`absolute bottom-[-5px] left-1/2 -translate-x-1/2 border-[5px] border-transparent ${isLight ? 'border-t-white' : 'border-t-[#111]'}`}></div>
      </div>
    );
  }
);

OverwritePriceTooltip.displayName = "OverwritePriceTooltip";
