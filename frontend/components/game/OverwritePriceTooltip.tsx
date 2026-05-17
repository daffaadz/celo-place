import { formatEther } from "viem";
import { truncateAddress } from "@/lib/utils";

interface TooltipProps {
  x: number;
  y: number;
  isLight: boolean;
  painter: string;
  priceWei: bigint;
  ageSeconds: number;
}

export function OverwritePriceTooltip({ x, y, isLight, painter, priceWei, ageSeconds }: TooltipProps) {
  const formattedPrice = formatEther(priceWei);
  
  return (
    <div 
      className={`absolute z-[1000] pointer-events-none px-3 py-2 rounded-lg shadow-xl backdrop-blur-md transform -translate-x-1/2 -translate-y-[120%] text-xs flex flex-col gap-1 ${isLight ? 'bg-white border-black/10 text-black' : 'bg-black/90 border border-white/20 text-white'}`}
      style={{ left: x, top: y }}
    >
      <div className="flex justify-between items-center gap-4">
        <span className="font-semibold opacity-70">Painter:</span>
        <span className="text-celo-yellow font-mono">{localStorage.getItem(`celoplace_name_${painter.toLowerCase()}`) || truncateAddress(painter)}</span>
      </div>
      
      <div className="flex justify-between items-center gap-4">
        <span className="font-semibold opacity-70">Age:</span>
        <span className="font-mono">{Math.floor(ageSeconds / 3600)}h {Math.floor((ageSeconds % 3600) / 60)}m</span>
      </div>
      
      <div className="flex justify-between items-center gap-4 border-t border-white/10 pt-1 mt-1">
        <span className="font-semibold">Overwrite:</span>
        <span className="text-celo-green font-bold">{formattedPrice} CELO</span>
      </div>

      <div className={`absolute bottom-[-10px] left-1/2 -translate-x-1/2 border-[5px] border-transparent ${isLight ? 'border-t-white' : 'border-t-black/90'}`}></div>
    </div>
  );
}
