'use client';
import { useAccount, useReadContract, useBalance } from "wagmi";
import { CONTRACT_ADDRESSES, CELOPLACE_ABI } from "@/lib/contracts";
import { formatEther } from "viem";
import { Flame, Trophy } from "lucide-react";
import { usePixelCanvas } from "@/hooks/usePixelCanvas";

interface EconomyStatsProps {
  isLight?: boolean;
}

export function StreakDisplay({ isLight = false }: EconomyStatsProps) {
  const { address } = useAccount();

  const { data: tierInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.celoPlace,
    abi: CELOPLACE_ABI,
    functionName: "getTierInfo",
    args: [address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!address,
    }
  });

  const streak = tierInfo ? Number(tierInfo[0]) : 0;
  const baseCharges = streak <= 2 ? 3 : streak <= 6 ? 4 : streak <= 13 ? 5 : streak <= 29 ? 6 : 8;

  return (
    <div className={`p-2 flex items-center space-x-2 backdrop-blur-xl border rounded-xl shadow-sm transition-colors ${isLight ? 'bg-white/80 border-black/10 text-black' : 'bg-black/60 border-white/10 text-white'}`}>
      <div className={`p-1.5 rounded-lg ${isLight ? 'bg-orange-100 text-orange-500' : 'bg-orange-500/20 text-orange-400'}`}>
        <Flame className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <div className="font-bold text-sm">Day {streak}</div>
        <div className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{baseCharges} Charges/Day</div>
      </div>
    </div>
  );
}

export function EconomyStats({ isLight = false }: EconomyStatsProps) {
  const { data: poolBalance } = useBalance({
    address: CONTRACT_ADDRESSES.rewardPool,
  });

  const pBal = poolBalance ? Number(formatEther(poolBalance.value)).toFixed(3) : "0.000";

  const { pixels } = usePixelCanvas();

  const userCounts = pixels.reduce((acc, p) => {
    if (p.painter !== "0x0000000000000000000000000000000000000000") {
      acc[p.painter] = (acc[p.painter] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topPainters = Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className={`p-3 w-full flex flex-col space-y-2 backdrop-blur-xl border rounded-lg shadow-sm transition-colors ${isLight ? 'bg-white/90 border-black/10 text-black' : 'bg-black/80 border-white/10 text-white'}`}>
      <div className="flex justify-between items-center border-b pb-1.5 border-white/10">
        <span className={`text-[10px] font-semibold tracking-wider uppercase opacity-80 flex justify-center items-center gap-1.5 ${isLight ? 'text-black' : 'text-celo-yellow'}`}>
          <Trophy className="w-3 h-3" /> Top Painters
        </span>
        <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-green-700' : 'text-celo-green'}`}>{pBal} CELO</span>
      </div>

      <div className="flex flex-col space-y-1">
        {topPainters.length === 0 ? (
          <span className="text-xs opacity-50 italic text-center py-2">No painters yet</span>
        ) : (
          topPainters.map(([address, count], idx) => (
            <div key={address} className="flex justify-between text-[11px] items-center gap-4">
              <span className="opacity-70 font-mono">
                {idx + 1}. {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <span className="font-semibold">{count} pixels</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}