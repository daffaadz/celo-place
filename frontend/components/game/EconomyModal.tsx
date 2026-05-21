import { X, Trophy, Coins, Zap } from "lucide-react";

interface EconomyModalProps {
  onClose: () => void;
  isLight: boolean;
}

export default function EconomyModal({ onClose, isLight }: EconomyModalProps) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-auto bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-md p-6 rounded-2xl shadow-2xl ${isLight ? 'bg-white text-black' : 'bg-[#0f0f0f] text-white border border-white/10'}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'}`}
        >
          <X size={24} />
        </button>

        <h1 className="text-2xl font-black mb-6">Cplace hub</h1>

        <div className="flex flex-col gap-4">
          <div className={`p-4 rounded-xl border flex gap-4 ${isLight ? 'bg-gray-50 border-black/10' : 'bg-black/50 border-white/10'}`}>
            <Coins className="w-8 h-8 text-celo-yellow shrink-0" />
            <div>
              <h3 className="font-bold mb-1">Weekly Reward Pool</h3>
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Every pixel painted adds to the Weekly Pool. At the end of the week, the top painters share the pool proportional to the pixels they held!
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex gap-4 ${isLight ? 'bg-gray-50 border-black/10' : 'bg-black/50 border-white/10'}`}>
            <Trophy className="w-8 h-8 text-celo-green shrink-0" />
            <div>
              <h3 className="font-bold mb-1">Daily Missions</h3>
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Check the Missions tab on the right side of your screen. Complete daily tasks to earn CELO rewards directly to your wallet!
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex gap-4 ${isLight ? 'bg-gray-50 border-black/10' : 'bg-black/50 border-white/10'}`}>
            <Zap className="w-8 h-8 text-orange-500 shrink-0" />
            <div>
              <h3 className="font-bold mb-1">Streak & Charges</h3>
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Paint every day to build your streak. Higher streaks give you more free charges per day (up to 8 charges). If you complete all 3 daily missions, you get +2 bonus charges tomorrow!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
