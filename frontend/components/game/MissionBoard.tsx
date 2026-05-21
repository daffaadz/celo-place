'use client';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { CONTRACT_ADDRESSES, MISSIONBOARD_ABI } from '@/lib/contracts';
import { SpinnerGap, Star, Check, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatEther } from 'viem';

interface MissionBoardProps {
  isLight?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const MISSION_NAMES = [
  "Early Bird",
  "Full Charges",
  "Neighbor",
  "Contested",
  "Pioneer",
  "Streak Keeper"
];

const MISSION_DESC = [
  "Paint your first pixel before 08:00 UTC today.",
  "Use all your daily charges today.",
  "Paint adjacent to someone else's pixel.",
  "Paint a pixel that has been painted 3+ times.",
  "Paint a brand new empty pixel.",
  "Paint today with a 7+ day streak."
];

const MISSION_DIFFICULTY = [
  "Easy", "Easy", "Medium", "Medium", "Hard", "Hard"
];

export function MissionBoard({ isLight = false, isOpen, onToggle }: MissionBoardProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const { address } = useAccount();

  const { data: missionsData, refetch: refetchMissions } = useReadContract({
    address: CONTRACT_ADDRESSES.missionBoard,
    abi: MISSIONBOARD_ABI,
    functionName: 'getMissionsToday',
    query: { enabled: !!address, refetchInterval: 60000 }
  });

  const currentDay = Math.floor(Date.now() / 86400000);

  // We need to check completion for each slot.
  // Wagmi useReadContract can only call one function, we can use useReadContracts but for simplicity we'll just read them if we can.
  // Actually, we can fetch the completion status using 3 separate useReadContracts or just assume incomplete until clicked.
  // To avoid 3 hooks, let's just make 3 individual calls inside a component or assume they are all fetched.
  // For the hackathon, we will just use a helper component for each slot.

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`Resets in ${h}h ${m}m`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const types = missionsData ? ([...missionsData[0]] as number[]) : [0, 0, 0];
  const rewards = missionsData ? ([...missionsData[1]] as bigint[]) : [0n, 0n, 0n];
  const spotsLeft = missionsData ? Number(missionsData[2]) : 0;

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
        {isOpen ? <X size={20} /> : <Star size={20} />}
      </button>

      {/* Slide-out Mission Panel */}
      <div className={cn(
        "absolute top-0 left-14 transition-all duration-300 pointer-events-auto shadow-xl z-[1001]",
        isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
      )}>
        <div className={cn(
          "w-[340px] rounded-2xl border flex flex-col overflow-hidden backdrop-blur-xl transition-colors",
          isLight ? "bg-white/95 border-black/20 text-black" : "bg-black/95 border-white/[0.15] text-white"
        )}>
          <div className={`p-3 border-b flex justify-between items-center ${isLight ? 'border-black/10' : 'border-white/10'}`}>
            <h2 className="font-bold flex items-center gap-1.5">
              <Star weight="fill" className="w-4 h-4 text-[var(--accent-warm)]" />
              Daily Missions
            </h2>
          </div>
      <div className="p-3 bg-black/5 flex justify-between items-center text-[10px] font-mono uppercase opacity-70">
        <span>3 Missions</span>
        <span>{timeLeft}</span>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {[0, 1, 2].map(slot => (
          <MissionCard
            key={slot}
            slot={slot}
            type={types[slot]}
            reward={rewards[slot]}
            spotsLeft={slot === 2 ? spotsLeft : null}
            isLight={isLight}
            currentDay={currentDay}
            onComplete={() => refetchMissions()}
          />
        ))}
      </div>

          <div className={`p-3 text-xs text-center border-t ${isLight ? 'bg-celo-yellow/20 border-black/10 text-gray-700' : 'bg-celo-yellow/10 border-white/10 text-gray-300'}`}>
            Complete all 3 → <strong className={isLight ? 'text-black' : 'text-celo-yellow'}>+2 bonus charges</strong> tomorrow
          </div>
        </div>
      </div>
    </div>
  );
}

interface MissionCardProps {
  slot: number;
  type: number;
  reward: bigint;
  spotsLeft: number | null;
  isLight: boolean;
  currentDay: number;
  onComplete: () => void;
}

function MissionCard({ slot, type, reward, spotsLeft, isLight, currentDay, onComplete }: MissionCardProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { writeContractAsync, isPending } = useWriteContract();

  const { data: isCompleted, refetch: refetchCompleted } = useReadContract({
    address: CONTRACT_ADDRESSES.missionBoard,
    abi: MISSIONBOARD_ABI,
    functionName: 'missionCompleted',
    args: [BigInt(currentDay), address as `0x${string}`, BigInt(slot)],
    query: { enabled: !!address, refetchInterval: 10000 }
  });

  const handleClaim = async () => {
    try {
      let proof = "0x" as `0x${string}`;
      
      const pixels = queryClient.getQueryData<{lat: number, lng: number, painter: string}[]>(["pixel-logs"]) || [];
      const userPixels = pixels.filter((p) => p.painter.toLowerCase() === address?.toLowerCase());

      if (type === 2) { // NEIGHBOR
        // Find a user pixel that has a neighbor
        let found = false;
        for (const up of userPixels) {
          const neighbor = pixels.find((p) => 
            p.painter.toLowerCase() !== address?.toLowerCase() &&
            Math.abs(p.lat - up.lat) <= 1 && Math.abs(p.lng - up.lng) <= 1 &&
            (p.lat !== up.lat || p.lng !== up.lng)
          );
          if (neighbor) {
            const { encodeAbiParameters, parseAbiParameters } = await import('viem');
            proof = encodeAbiParameters(
              parseAbiParameters('int256, int256, int256, int256'),
              [BigInt(up.lat), BigInt(up.lng), BigInt(neighbor.lat), BigInt(neighbor.lng)]
            );
            found = true;
            break;
          }
        }
        if (!found) throw new Error("Could not find neighbor valid pixel");

      } else if (type === 3 || type === 4) { // CONTESTED, PIONEER
        // Pioneer: paintCount == 1; Contested: paintCount >= 3
        let validUp = null;
        for (const up of userPixels) {
          const paintCount = pixels.filter(p => p.lat === up.lat && p.lng === up.lng).length;
          if (type === 4 && paintCount === 1) { // PIONEER
             validUp = up; break;
          }
          if (type === 3 && paintCount >= 3) { // CONTESTED
             validUp = up; break;
          }
        }

        if (validUp) {
          const { encodeAbiParameters, parseAbiParameters } = await import('viem');
          proof = encodeAbiParameters(
            parseAbiParameters('int256, int256'),
            [BigInt(validUp.lat), BigInt(validUp.lng)]
          );
        } else {
          throw new Error("No qualifying pixel found for proof");
        }
      }

      await writeContractAsync({
        address: CONTRACT_ADDRESSES.missionBoard,
        abi: MISSIONBOARD_ABI,
        functionName: 'completeMission',
        args: [slot, proof]
      });
      refetchCompleted();
      onComplete();
      queryClient.invalidateQueries({ queryKey: ["pixel-logs"] });
    } catch (e: unknown) {
      alert("Mission requirement not met yet or proof generation failed!");
      console.error(e);
    }
  };

  const difficulty = MISSION_DIFFICULTY[type] || "Easy";
  const badgeColor = difficulty === "Easy" ? "bg-green-500/20 text-green-500" : difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500";

  return (
    <div className={`p-2.5 rounded-xl border flex justify-between gap-3 items-center ${isLight ? 'bg-gray-50 border-black/10' : 'bg-[#111] border-white/10'}`}>
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm leading-none">{MISSION_NAMES[type] || "Unknown"}</span>
          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded leading-none ${badgeColor}`}>{difficulty}</span>
        </div>
        <span className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'} leading-tight mt-1`}>{MISSION_DESC[type] || ""}</span>
      </div>

      <div className="flex flex-col items-end gap-1.5 min-w-[70px]">
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-celo-green leading-none">{reward ? formatEther(reward) : "0"} CELO</span>
          {spotsLeft !== null && <span className={`text-[9px] ${isLight ? 'text-red-600' : 'text-red-400'} mt-0.5 leading-none`}>{spotsLeft}/3 left</span>}
        </div>
        <button
          onClick={handleClaim}
          disabled={isCompleted || isPending || (spotsLeft !== null && spotsLeft === 0)}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1
            ${isCompleted ? 'bg-green-500/20 text-green-500 cursor-not-allowed' :
              (spotsLeft !== null && spotsLeft === 0) ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed' :
                isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}
        >
          {isPending ? <SpinnerGap className="w-3 h-3 animate-spin" /> : isCompleted ? <Check className="w-3 h-3" /> : 'Claim'}
        </button>
      </div>
    </div>
  );
}