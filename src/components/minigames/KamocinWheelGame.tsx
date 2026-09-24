import { useState } from 'react';
import { soundManager } from '../../audio/soundManager';
import { ArrowLeft, Sparkles, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface KamocinWheelGameProps {
  cash: number;
  onReward: (cash: number, milk: number, butter: number, cheese: number, bells: number) => void;
  onClose: () => void;
}

const WHEEL_PRIZES = [
  { label: '+500 zł', emoji: '💰', cash: 500, milk: 0, butter: 0, cheese: 0, bells: 0 },
  { label: '+2,000 L', emoji: '🥛', cash: 0, milk: 2000, butter: 0, cheese: 0, bells: 0 },
  { label: '2x Masło', emoji: '🧈', cash: 0, milk: 0, butter: 2, cheese: 0, bells: 0 },
  { label: 'Złoty Dzwon', emoji: '🔔', cash: 0, milk: 0, butter: 0, cheese: 0, bells: 1 },
  { label: '+1,200 zł', emoji: '💵', cash: 1200, milk: 0, butter: 0, cheese: 0, bells: 0 },
  { label: '1x Ser', emoji: '🧀', cash: 0, milk: 0, butter: 0, cheese: 1, bells: 0 },
  { label: '+5,000 L', emoji: '🌊', cash: 0, milk: 5000, butter: 0, cheese: 0, bells: 0 },
  { label: '🌟 JACKPOT', emoji: '👑', cash: 3000, milk: 6000, butter: 1, cheese: 1, bells: 2 },
];

export function KamocinWheelGame({ cash, onReward, onClose }: KamocinWheelGameProps) {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [lastWonIndex, setLastWonIndex] = useState<number | null>(null);

  const spinCost = 100;

  const handleSpin = () => {
    if (isSpinning || cash < spinCost) return;

    setIsSpinning(true);
    setLastWonIndex(null);

    const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const sliceAngle = 360 / WHEEL_PRIZES.length;
    const extraRotations = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetAngle = extraRotations + (360 - (prizeIndex * sliceAngle) - (sliceAngle / 2));

    setRotation(prev => prev + targetAngle);

    const tickInterval = setInterval(() => {
      soundManager.playCatch();
    }, 180);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setLastWonIndex(prizeIndex);
      const prize = WHEEL_PRIZES[prizeIndex];

      onReward(prize.cash, prize.milk, prize.butter, prize.cheese, prize.bells);

      if (prize.bells > 0 || prize.cash >= 1200) {
        soundManager.playFanfare();
        confetti({ particleCount: 70, spread: 70 });
      } else {
        soundManager.playCash();
      }
    }, 3800);
  };

  return (
    <div className="flex flex-col items-center justify-between h-[500px] w-full bg-gradient-to-b from-purple-100 via-pink-50 to-amber-100 border-2 border-purple-300 rounded-3xl p-3 shadow-2xl relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between z-10 bg-white/95 px-3 py-1.5 rounded-2xl shadow-sm border border-white">
        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={13} /> Wróć
        </button>

        <div className="text-xs font-black text-purple-950">
          🎡 Koło Fortuny Sołtysa
        </div>

        <div className="text-xs font-black text-amber-800 tabular-nums">
          Koszt: {spinCost} zł
        </div>
      </div>

      {/* Center Wheel */}
      <div className="relative flex-1 w-full flex items-center justify-center my-2">
        {/* Pointer */}
        <div className="absolute top-1 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-14 border-t-amber-500 drop-shadow-md" />

        {/* The Wheel */}
        <div
          className="w-60 h-60 sm:w-64 sm:h-64 rounded-full border-4 border-amber-400 relative overflow-hidden shadow-xl transition-transform duration-[3800ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {WHEEL_PRIZES.map((prize, idx) => {
            const angle = (360 / WHEEL_PRIZES.length) * idx;
            const isAlt = idx % 2 === 0;

            return (
              <div
                key={idx}
                className="absolute inset-0 flex items-start justify-center origin-center pt-2"
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: 'polygon(50% 50%, 28% 0%, 72% 0%)',
                  backgroundColor: isAlt ? '#FEF08A' : '#BBF7D0',
                }}
              >
                <div className="flex flex-col items-center mt-1">
                  <span className="text-base">{prize.emoji}</span>
                  <span className="text-[9px] font-black text-slate-800 whitespace-nowrap">
                    {prize.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-12 h-12 bg-amber-400 border-2 border-white rounded-full flex items-center justify-center shadow-md z-10">
            <span className="text-lg">🐄</span>
          </div>
        </div>
      </div>

      {/* Won Prize Badge */}
      {lastWonIndex !== null && (
        <div className="mb-2 bg-white px-3 py-1.5 rounded-xl text-center shadow-sm border border-amber-300 animate-bounce">
          <div className="text-[10px] text-slate-500 font-bold">Wygrałeś:</div>
          <div className="text-xs font-black text-emerald-800 flex items-center justify-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            <span>{WHEEL_PRIZES[lastWonIndex].emoji} {WHEEL_PRIZES[lastWonIndex].label}</span>
          </div>
        </div>
      )}

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || cash < spinCost}
        className={`w-full py-3 rounded-2xl font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
          isSpinning || cash < spinCost
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200'
        }`}
      >
        <RotateCw size={15} className={isSpinning ? 'animate-spin' : ''} />
        <span>{isSpinning ? 'Koło się kręci...' : `Zakręć kołem (${spinCost} zł)`}</span>
      </button>
    </div>
  );
}
