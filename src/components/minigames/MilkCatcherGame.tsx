import { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../../audio/soundManager';
import { ArrowLeft, Heart, RotateCcw } from 'lucide-react';

interface MilkCatcherGameProps {
  onFinish: (cashReward: number, milkReward: number, won: boolean) => void;
  onClose: () => void;
}

interface FallingItem {
  id: number;
  x: number;
  y: number;
  type: 'milk' | 'golden_cheese' | 'rock';
  speed: number;
}

export function MilkCatcherGame({ onFinish, onClose }: MilkCatcherGameProps) {
  const [basketX, setBasketX] = useState<number>(50);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(25);
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'victory'>('playing');

  const itemsRef = useRef<FallingItem[]>([]);
  const [, setTick] = useState(0);
  const nextItemId = useRef(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnInterval = setInterval(() => {
      const rand = Math.random();
      const type: 'milk' | 'golden_cheese' | 'rock' =
        rand < 0.25 ? 'rock' : rand < 0.85 ? 'milk' : 'golden_cheese';

      itemsRef.current.push({
        id: nextItemId.current++,
        x: Math.floor(Math.random() * 85) + 5,
        y: 0,
        type,
        speed: 1.8 + Math.random() * 1.5,
      });
    }, 600);

    return () => clearInterval(spawnInterval);
  }, [gameState]);

  const handleGameOver = useCallback((isVictory: boolean, finalScore: number) => {
    setGameState(isVictory ? 'victory' : 'gameover');
    const cashReward = finalScore * 18;
    const milkReward = finalScore * 40;
    onFinish(cashReward, milkReward, isVictory && finalScore > 10);
  }, [onFinish]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      itemsRef.current = itemsRef.current
        .map(item => ({ ...item, y: item.y + item.speed }))
        .filter(item => {
          if (item.y >= 80 && item.y <= 92) {
            const distance = Math.abs(item.x - basketX);
            if (distance < 14) {
              if (item.type === 'milk') {
                setScore(s => s + 1);
                soundManager.playCatch();
              } else if (item.type === 'golden_cheese') {
                setScore(s => s + 3);
                soundManager.playCash();
              } else if (item.type === 'rock') {
                soundManager.playRockHit();
                setLives(l => {
                  const nextL = l - 1;
                  if (nextL <= 0) {
                    setTimeout(() => handleGameOver(false, score), 10);
                  }
                  return nextL;
                });
              }
              return false;
            }
          }
          return item.y < 100;
        });

      setTick(t => t + 1);
    }, 40);

    return () => clearInterval(gameLoop);
  }, [gameState, basketX, score, handleGameOver]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameOver(true, score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, score, handleGameOver]);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(8, Math.min(92, relativeX)));
  };

  return (
    <div className="flex flex-col items-center justify-between h-[500px] w-full bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200 border-2 border-emerald-400 rounded-3xl p-3 shadow-2xl relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-white">
        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={13} /> Wróć
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              size={15}
              className={i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}
            />
          ))}
        </div>

        <div className="text-xs font-black text-sky-800 tabular-nums">
          {timeLeft}s
        </div>

        <div className="text-xs font-black text-amber-800 tabular-nums">
          {score} pkt
        </div>
      </div>

      {/* Game Playing Area */}
      <div
        ref={containerRef}
        onMouseMove={(e) => handleMove(e.clientX)}
        onTouchMove={(e) => {
          if (e.touches.length > 0) handleMove(e.touches[0].clientX);
        }}
        className="relative w-full flex-1 my-2 bg-gradient-to-b from-sky-100/90 via-sky-50 to-emerald-100 border border-white/70 rounded-2xl overflow-hidden cursor-ew-resize"
      >
        {/* Cartoon Meadow grass at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-emerald-500 to-emerald-400/80 pointer-events-none border-t-2 border-emerald-300" />

        {/* Falling Items */}
        {itemsRef.current.map(item => (
          <div
            key={item.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-3xl filter drop-shadow-md select-none pointer-events-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
          >
            {item.type === 'milk' && '🥛'}
            {item.type === 'golden_cheese' && '🧀'}
            {item.type === 'rock' && '🪨'}
          </div>
        ))}

        {/* Catcher Basket / Wiaderko */}
        <div
          className="absolute bottom-1 transform -translate-x-1/2 transition-all duration-75 flex flex-col items-center select-none pointer-events-none"
          style={{ left: `${basketX}%` }}
        >
          <span className="text-4xl filter drop-shadow-lg">🪣</span>
        </div>
      </div>

      {/* Mobile Touch Controls */}
      <div className="w-full flex items-center justify-between gap-2 z-10 sm:hidden">
        <button
          onClick={() => setBasketX(x => Math.max(10, x - 15))}
          className="flex-1 py-2 bg-white/90 text-slate-800 text-sm font-black rounded-xl shadow-sm border border-emerald-200 active:scale-95"
        >
          ⬅️ W Lewo
        </button>
        <button
          onClick={() => setBasketX(x => Math.min(90, x + 15))}
          className="flex-1 py-2 bg-white/90 text-slate-800 text-sm font-black rounded-xl shadow-sm border border-emerald-200 active:scale-95"
        >
          W Prawo ➡️
        </button>
      </div>

      {/* End State Dialog Modal */}
      {gameState !== 'playing' && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center">
          <div className="text-5xl mb-2">
            {gameState === 'victory' ? '🏆' : '🪨'}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
            {gameState === 'victory' ? 'Wspaniały Ułów!' : 'Trafiono kamieniem!'}
          </h3>

          <p className="text-xs text-slate-600 mb-3">
            Złapano: <span className="font-bold text-slate-900">{score} szt.</span> wiejskich przysmaków.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mb-3 w-full max-w-xs">
            <div className="text-[10px] uppercase font-bold text-amber-800">Nagroda od Sołtysa:</div>
            <div className="text-base font-black text-amber-950 tabular-nums">
              +{(score * 18).toLocaleString('pl-PL')} zł
            </div>
            <div className="text-xs font-bold text-emerald-800 tabular-nums">
              +{(score * 40).toLocaleString('pl-PL')} L mleka
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setGameState('playing');
                setScore(0);
                setLives(3);
                setTimeLeft(25);
                itemsRef.current = [];
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <RotateCcw size={13} />
              <span>Zagraj znowu</span>
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
