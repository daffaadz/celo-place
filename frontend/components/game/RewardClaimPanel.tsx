'use client';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { CONTRACT_ADDRESSES, REWARDPOOL_ABI } from '@/lib/contracts';
import { SpinnerGap, Check, Trophy } from '@phosphor-icons/react';
import { formatEther } from 'viem';

interface RewardClaimPanelProps {
  isLight?: boolean;
}

export function RewardClaimPanel({ isLight = false }: RewardClaimPanelProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const [proofData, setProofData] = useState<{ amount: string, proof: string[] } | null>(null);
  const [success, setSuccess] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (address) {
      fetch('/weeklyDistribution.json')
        .then(res => res.json())
        .then(data => {
          if (data.claims && data.claims[address]) {
            setProofData(data.claims[address]);
          } else {
            setProofData(null);
          }
        })
        .catch(() => setProofData(null));
    }
  }, [address]);

  const { data: currentWeekId } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardPool,
    abi: REWARDPOOL_ABI,
    functionName: 'currentWeekId',
  });

  const { data: hasClaimed, refetch: refetchClaimStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardPool,
    abi: REWARDPOOL_ABI,
    functionName: 'hasClaimed',
    args: [currentWeekId || 0n, address as `0x${string}`],
    query: {
      enabled: !!address && !!currentWeekId && proofData !== null,
    }
  });

  const { writeContractAsync, isPending } = useWriteContract();

  if (!address) return null;

  const isEligible = proofData !== null;
  const canClaim = isEligible && !hasClaimed;

  if (!isEligible && !success) return null;

  const numericReward = proofData ? formatEther(BigInt(proofData.amount)) : "0";
  const rewardAmountObj = Number(numericReward);
  const isZero = rewardAmountObj === 0;
  
  const displayAmount = (rewardAmountObj > 0 && rewardAmountObj < 0.01) 
    ? rewardAmountObj.toFixed(4) 
    : rewardAmountObj.toFixed(2);

  const handleClaim = async () => {
    if (!canClaim || !currentWeekId || isZero) return;
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.rewardPool,
        abi: REWARDPOOL_ABI,
        functionName: 'claimWeeklyReward',
        args: [currentWeekId, BigInt(proofData.amount), proofData.proof as `0x${string}`[]],
      });
      refetchClaimStatus();
      setSuccess(true);
      setTimeout(() => setMinimized(true), 3000);
      queryClient.invalidateQueries({ queryKey: ["pixel-logs"] });
    } catch (e) {
      console.error(e);
    }
  };

  if (minimized) {
    return (
      <button 
        onClick={() => setMinimized(false)}
        className={`w-full py-2 px-3 flex items-center justify-center gap-2 rounded-lg font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 border ${isLight ? 'bg-white border-black/20 text-black hover:bg-gray-50' : 'bg-[#111] border-white/20 text-white hover:bg-[#222]'}`}
      >
        <Trophy weight="fill" className="w-4 h-4 text-celo-yellow" />
        {success ? "Reward Claimed" : "Weekly Reward"}
      </button>
    );
  }

  return (
    <div className={`w-full relative p-4 rounded-xl border shadow-xl transition-all
      ${isLight ? 'bg-white/95 border-black/20 text-black' : 'bg-[#111]/95 border-white/20 text-white backdrop-blur-xl'}`}
    >
      {success ? (
        <div className="flex flex-col items-center justify-center gap-2 py-2">
          <button onClick={() => setMinimized(true)} className="absolute top-1 right-2 text-gray-500 hover:text-gray-300">✕</button>
          <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <p className="font-bold text-green-500 text-sm">✓ {displayAmount} CELO claimed</p>
        </div>
      ) : (
        <>
          <button onClick={() => setMinimized(true)} className="absolute top-1 right-2 text-gray-500 hover:text-gray-300">✕</button>
          <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
            <Trophy weight="fill" className="w-4 h-4 text-celo-yellow" />
            Weekly Reward
          </h2>
          <p className={`text-xs mb-3 leading-tight pr-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Territory held last week earned: <strong className={isLight ? 'text-black' : 'text-celo-yellow'}>{displayAmount} CELO</strong>
          </p>
          <button 
            disabled={isPending || isZero || hasClaimed}
            onClick={handleClaim}
            className={`w-full py-2 px-3 rounded-lg font-bold text-sm flex justify-center items-center gap-2 shadow-md transition-all 
              ${(isPending || isZero || hasClaimed) ? 'opacity-50 cursor-not-allowed filter grayscale' : 'hover:scale-105 active:scale-95'}
              ${isLight ? 'bg-celo-yellow text-black hover:bg-[#e5d100]' : 'bg-celo-yellow text-black hover:brightness-110'}`}
          >
            {isPending && <SpinnerGap className="w-4 h-4 animate-spin" />}
            {hasClaimed ? "Already Claimed" : `Claim ${displayAmount} CELO`}
          </button>
        </>
      )}
    </div>
  );
}
