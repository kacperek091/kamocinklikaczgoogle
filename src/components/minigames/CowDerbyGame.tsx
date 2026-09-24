import { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../../audio/soundManager';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface CowDerbyGameProps {
  onFinish: (cashReward: number, milkReward: number, won: boolean, isDerby: boolean) => void;
  onClose: () => void;
}

interface Racer {
  id: string;
  name: string;
  emoji: string;
  progress: number;
  baseSpeed: number;
}

export function CowDerbyGame({ onFinish, onClose }: CowDerbyGameProps) {
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [raceState, setRaceState] = useState<'countdown' | 'racing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState<number>(3);
  const [playerRank, setPlayerRank] = useState<number>(1);

  const rivalsRef = useRef<Racer[]>([
    { id: 'ursus', name: 'Ursus C-330', emoji: '🚜', progress: 0, baseSpeed: 0.65 },
    { id: 'lightning', name: 'Błyskawica', emoji: '⚡🐄', progress: 0, baseSpeed: 0.72 },
    { id: 'baska', name: 'Baśka z Łąki', emoji: '🐄', progress: 0, baseSpeed: 0.55 },
  ]);
  const [, setRivalTick] = useState<number>(0);

  const handleFinishRace = useCallback((finalPlayerProg: number) => {
    setRaceState('finished');
    const rivalProgs = rivalsRef.current.map(r => r.progress);
    const beatenCount = rivalProgs.filter(p => finalPlayerProg > p).length;
    const rank = 4 - beatenCount;
    setPlayerRank(rank);

    let cashReward = 0;
    let milkReward = 0;
    if (rank === 1) {
      cashReward = 1200;
      milkReward = 3500;
      soundManager.playFanfare();
    } else if (rank === 2) {
      cashReward = 500;
      milkReward = 1200;
      soundManager.playCash();
    } else {
      cashReward = 150;
      milkReward = 400;
    }

    onFinish(cashReward, milkReward, rank === 1, true);
  }, [onFinish]);

  useEffect(() => {
    if (raceState !== 'countdown') return;

    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          setRaceState('racing');
          soundManager.playTractor();
          return 0;
        }
        return c - 1;
      });
    }, 900);

    return () => clearInterval(timer);
  }, [raceState]);

  useEffect(() => {
    if (raceState !== 'racing') return;

    const loop = setInterval(() => {
      let anyFinished = false;

      rivalsRef.current = rivalsRef.current.map(r => {
        const jitter = (Math.random() * 0.4 - 0.15);
        const newProgress = Math.min(100, r.progress + r.baseSpeed + jitter);
        if (newProgress >= 100) anyFinished = true;
        return { ...r, progress: newProgress };
      });

      setRivalTick(t => t + 1);

      if (anyFinished) {
        clearInterval(loop);
        handleFinishRace(playerProgress);
      }
    }, 100);

    return () => clearInterval(loop);
  }, [raceState, playerProgress, handleFinishRace]);

  const handleTap = () => {
    if (raceState !== 'racing') return;

    setPlayerProgress(prev => {
      const next = prev + 3.8;
      if (next >= 100) {
        handleFinishRace(100);
        return 100;
      }
      return next;
    });

    if (Math.random() < 0.25) {
      soundManager.playMoo();
    } else {
      soundManager.playCatch();
    }
  };

  const restartRace = () => {
    setPlayerProgress(0);
    rivalsRef.current = rivalsRef.current.map(r => ({ ...r, progress: 0 }));
    setCountdown(3);
    setRaceState('countdown');
  };

  return (
    <div className="flex flex-col items-center justify-between h-[500px] w-full bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 border-2 border-emerald-300 rounded-3xl p-3 shadow-2xl relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between z-10 bg-white/95 px-3 py-1.5 rounded-2xl shadow-sm border border-white">
        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={13} /> Wróć
        </button>

        <div className="text-xs font-black text-emerald-950">
          🏁 Derby Kamocina
        </div>

        <div className="text-xs font-black text-amber-800 tabular-nums">
          Dystans: {Math.floor(playerProgress)}%
        </div>
      </div>

      {/* Race Track */}
      <div className="w-full flex-1 my-2 bg-white/90 border border-emerald-200 rounded-2xl p-2.5 flex flex-col justify-between relative overflow-hidden">
        {/* Finish Line */}
        <div className="absolute right-5 top-0 bottom-0 w-2.5 border-r-2 border-dashed border-amber-500 flex items-center justify-center pointer-events-none">
          <span className="text-[9px] font-black text-amber-600 rotate-90 whitespace-nowrap">
            META
          </span>
        </div>

        {/* Player Lane */}
        <div className="relative bg-emerald-50 border-2 border-emerald-400 rounded-xl p-1.5 my-1">
          <div className="text-[10px] font-black text-emerald-900 flex items-center justify-between mb-0.5">
            <span>⭐ TWOJA KRASULA</span>
            <span>{Math.floor(playerProgress)}%</span>
          </div>
          <div className="h-6 w-full bg-white rounded-lg relative overflow-hidden flex items-center border border-emerald-100">
            <div
              className="absolute transition-all duration-75 text-2xl flex items-center"
              style={{ left: `calc(${playerProgress}% - 26px)` }}
            >
              🐄💨
            </div>
          </div>
        </div>

        {/* Rival Lanes */}
        {rivalsRef.current.map((rival) => (
          <div key={rival.id} className="relative bg-slate-50 border border-slate-200 rounded-xl p-1 my-0.5">
            <div className="text-[9px] font-bold text-slate-500 flex items-center justify-between mb-0.5">
              <span>{rival.name}</span>
              <span>{Math.floor(rival.progress)}%</span>
            </div>
            <div className="h-5 w-full bg-slate-100 rounded-lg relative overflow-hidden flex items-center">
              <div
                className="absolute transition-all duration-100 text-lg flex items-center"
                style={{ left: `calc(${rival.progress}% - 20px)` }}
              >
                {rival.emoji}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tap Sprint Button */}
      <div className="w-full">
        {raceState === 'countdown' ? (
          <div className="w-full py-4 bg-white/90 border border-slate-200 text-center rounded-2xl">
            <span className="text-3xl font-black text-amber-500 animate-ping">
              {countdown > 0 ? countdown : 'START!'}
            </span>
          </div>
        ) : (
          <button
            onClick={handleTap}
            className="w-full py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 active:scale-95 text-amber-950 font-black text-sm sm:text-base rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🏃‍♀️ STUKAJ SZYBKO! BIEC KRÓWKO! 💨</span>
          </button>
        )}
      </div>

      {/* Finished Modal */}
      {raceState === 'finished' && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center">
          <div className="text-5xl mb-2">
            {playerRank === 1 ? '🥇' : playerRank === 2 ? '🥈' : '🥉'}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
            {playerRank === 1 ? 'Mistrz Derby Kamocina!' : `Miejsce ${playerRank}`}
          </h3>

          <p className="text-xs text-slate-600 mb-3">
            {playerRank === 1
              ? 'Twoja krówka zostawiła Ursusa daleko w tyle!'
              : 'Dzielny bieg po wiejskiej szosie! Następnym razem wygrasz!'}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mb-3 w-full max-w-xs">
            <div className="text-[10px] uppercase font-bold text-amber-800">Nagroda:</div>
            <div className="text-base font-black text-amber-950 tabular-nums">
              +{playerRank === 1 ? '1,200' : playerRank === 2 ? '500' : '150'} zł
            </div>
            <div className="text-xs font-bold text-emerald-800 tabular-nums">
              +{playerRank === 1 ? '3,500' : playerRank === 2 ? '1,200' : '400'} L mleka
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={restartRace}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs rounded-xl shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <RotateCcw size={13} />
              <span>Biegnij znowu</span>
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
