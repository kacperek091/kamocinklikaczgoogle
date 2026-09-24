import { useState, useEffect, useCallback } from 'react';
import { soundManager } from '../../audio/soundManager';
import { ArrowLeft, Zap, RotateCcw } from 'lucide-react';

interface SpeedMilkingGameProps {
  onFinish: (cashReward: number, milkReward: number, won: boolean) => void;
  onClose: () => void;
}

export function SpeedMilkingGame({ onFinish, onClose }: SpeedMilkingGameProps) {
  const [activeUdder, setActiveUdder] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [squirtBurst, setSquirtBurst] = useState<boolean>(false);

  const udders = [
    { id: 0, label: 'Lewy Przód' },
    { id: 1, label: 'Prawy Przód' },
    { id: 2, label: 'Lewy Tył' },
    { id: 3, label: 'Prawy Tył' },
  ];

  const handleFinish = useCallback((finalScore: number) => {
    setIsGameOver(true);
    const cashReward = finalScore * 25;
    const milkReward = finalScore * 80;
    onFinish(cashReward, milkReward, finalScore >= 20);
  }, [onFinish]);

  const nextTarget = () => {
    setActiveUdder(prev => {
      let next = Math.floor(Math.random() * 4);
      while (next === prev) {
        next = Math.floor(Math.random() * 4);
      }
      return next;
    });
  };

  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleFinish(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, score, handleFinish]);

  const handleTapUdder = (index: number) => {
    if (isGameOver) return;

    if (index === activeUdder) {
      soundManager.playSquirt();
      setScore(s => s + (1 * combo));
      setCombo(c => Math.min(5, c + 1));
      setSquirtBurst(true);
      setTimeout(() => setSquirtBurst(false), 150);
      nextTarget();
    } else {
      soundManager.playRockHit();
      setCombo(1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-[500px] w-full bg-gradient-to-b from-amber-100 via-yellow-50 to-emerald-100 border-2 border-amber-300 rounded-3xl p-3 shadow-2xl relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between z-10 bg-white/95 px-3 py-1.5 rounded-2xl shadow-sm border border-white">
        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={13} /> Wróć
        </button>

        <div className="flex items-center gap-1 text-xs font-black text-amber-700">
          <Zap size={13} />
          <span>Combo x{combo}</span>
        </div>

        <div className="text-xs font-black text-sky-800 tabular-nums">
          {timeLeft}s
        </div>

        <div className="text-xs font-black text-emerald-800 tabular-nums">
          {score} L
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center my-2 relative">
        <div className="text-center mb-3">
          <span className="text-6xl block animate-bounce">🐄</span>
          <div className="text-xs font-black text-emerald-950 mt-1">
            Klikaj podświetlone na żółto wymię!
          </div>
        </div>

        {/* 4 Udder / QTE Buttons */}
        <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs">
          {udders.map((ud) => {
            const isTarget = ud.id === activeUdder;

            return (
              <button
                key={ud.id}
                onClick={() => handleTapUdder(ud.id)}
                className={`py-4 px-3 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-90 cursor-pointer shadow-md ${
                  isTarget
                    ? 'bg-gradient-to-b from-amber-400 to-yellow-500 text-amber-950 ring-4 ring-yellow-300 scale-105 shadow-amber-200'
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl">{isTarget ? '⚡🥛' : '🥛'}</span>
                <span>{ud.label}</span>
              </button>
            );
          })}
        </div>

        {squirtBurst && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-amber-600 pointer-events-none drop-shadow-md">
            💦 +{combo} L!
          </div>
        )}
      </div>

      {/* End Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center">
          <div className="text-5xl mb-2">
            {score >= 20 ? '🏆' : '🥛'}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
            Koniec Czasu!
          </h3>

          <p className="text-xs text-slate-600 mb-3">
            Wydojono aż <span className="font-bold text-slate-900">{score} L mleka</span> w 15 sekund!
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mb-3 w-full max-w-xs">
            <div className="text-[10px] uppercase font-bold text-amber-800">Wynagrodzenie:</div>
            <div className="text-base font-black text-amber-950 tabular-nums">
              +{(score * 25).toLocaleString('pl-PL')} zł
            </div>
            <div className="text-xs font-bold text-emerald-800 tabular-nums">
              +{(score * 80).toLocaleString('pl-PL')} L mleka
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsGameOver(false);
                setScore(0);
                setCombo(1);
                setTimeLeft(15);
                setActiveUdder(0);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs rounded-xl shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <RotateCcw size={13} />
              <span>Doj ponownie</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
