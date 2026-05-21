"use client";

import { X, Trophy, Coins, Lightning } from "@phosphor-icons/react";

interface EconomyModalProps {
  onClose: () => void;
  isLight: boolean;
}

export default function EconomyModal({ onClose, isLight }: EconomyModalProps) {
  const bg = isLight ? "bg-white border-black/10" : "bg-[#12121A] border-white/[0.08]";
  const text = isLight ? "text-black" : "text-text-primary";
  const sub = isLight ? "text-gray-500" : "text-text-secondary";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative rounded-2xl border p-6 max-w-md w-full shadow-2xl ${bg}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${isLight ? "hover:bg-black/5" : "hover:bg-white/5"}`}
        >
          <X weight="bold" className={`w-4 h-4 ${sub}`} />
        </button>

        <h2 className={`text-base font-black mb-4 ${text}`}>Economy Overview</h2>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${isLight ? "bg-gray-50 border-black/5" : "bg-white/[0.03] border-white/[0.06]"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Lightning weight="fill" className="w-4 h-4 text-[var(--accent-warm)]" />
              <span className={`text-sm font-bold ${text}`}>Overwrite Pricing</span>
            </div>
            <p className={`text-xs leading-relaxed ${sub}`}>
              Overwriting a pixel costs an exponentially increasing fee. The first overwrite is cheap, but each subsequent overwrite of the same pixel costs more. This creates a natural ownership economy.
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? "bg-gray-50 border-black/5" : "bg-white/[0.03] border-white/[0.06]"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Coins weight="fill" className="w-4 h-4 text-[var(--accent-secondary)]" />
              <span className={`text-sm font-bold ${text}`}>Reward Pool</span>
            </div>
            <p className={`text-xs leading-relaxed ${sub}`}>
              20% of every overwrite fee goes to the community Reward Pool. Active painters can claim their share based on participation. Distributions happen weekly.
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? "bg-gray-50 border-black/5" : "bg-white/[0.03] border-white/[0.06]"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy weight="fill" className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className={`text-sm font-bold ${text}`}>Missions & Streaks</span>
            </div>
            <p className={`text-xs leading-relaxed ${sub}`}>
              Complete daily painting missions to earn bonus pixel charges. Build streaks to unlock multipliers. Check the Mission Board (⭐) to see your objectives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
