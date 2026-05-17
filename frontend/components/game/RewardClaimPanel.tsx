'use client';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { CONTRACT_ADDRESSES, REWARDPOOL_ABI } from '@/lib/contracts';
import { Loader2, Check } from 'lucide-react';
import { formatEther } from 'viem';

interface RewardClaimPanelProps {
  isLight?: boolean;
}

export function RewardClaimPanel({ isLight = false }: RewardClaimPanelProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const [proofData, setProofData] = useState<{ amount: string, proof: string[] } | null>(null);
  const [success, setSuccess] = useState(false);

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

  // Handle success auto-dismissal
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!address) return null;

  // Only visible when a claimable reward exists and hasn't been claimed (or is showing success)
  const isEligible = proofData !== null;
  const canClaim = isEligible && !hasClaimed;

  if (!canClaim && !success) return null;

  const rewardAmount = proofData ? formatEther(BigInt(proofData.amount)) : "0";

  const handleClaim = async () => {
    if (!canClaim || !currentWeekId) return;
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.rewardPool,
        abi: REWARDPOOL_ABI,
        functionName: 'claimWeeklyReward',
        args: [currentWeekId, BigInt(proofData.amount), proofData.proof as `0x${string}`[]],
      });
      refetchClaimStatus();
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["pixel-logs"] });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`fixed bottom-[72px] left-1/2 -translate-x-1/2 w-[340px] p-4 rounded-2xl border shadow-2xl z-[1001] transition-all
      ${isLight ? 'bg-white/95 border-black/20 text-black' : 'bg-[#111]/95 border-white/20 text-white backdrop-blur-xl'}`}
    >
      {success ? (
        <div className="flex flex-col items-center justify-center gap-2 py-2">
          <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <p className="font-bold text-green-500">✓ {Number(rewardAmount).toFixed(2)} CELO claimed</p>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            🏆 Weekly Reward Available
          </h2>
          <p className={`text-sm mb-4 leading-tight ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            You held territory last week — you earned <strong className={isLight ? 'text-black' : 'text-celo-yellow'}>{Number(rewardAmount).toFixed(2)} CELO</strong>
          </p>
          <button 
            disabled={isPending}
            onClick={handleClaim}
            className={`w-full py-2.5 px-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95
              ${isLight ? 'bg-celo-yellow text-black hover:bg-[#e5d100]' : 'bg-celo-yellow text-black hover:brightness-110'}`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Claim {Number(rewardAmount).toFixed(2)} CELO
          </button>
        </>
      )}
    </div>
  );
}