import { useState } from 'react';
import { MilkCatcherGame } from './minigames/MilkCatcherGame';
import { SpeedMilkingGame } from './minigames/SpeedMilkingGame';
import { CowDerbyGame } from './minigames/CowDerbyGame';
import { KamocinWheelGame } from './minigames/KamocinWheelGame';
import { Play } from 'lucide-react';

interface MiniGamesScreenProps {
  cash: number;
  onAwardMinigame: (cashReward: number, milkReward: number, won: boolean, isDerby?: boolean) => void;
  onRewardWheel: (cash: number, milk: number, butter: number, cheese: number, bells: number) => void;
}

type ActiveGame = null | 'catcher' | 'speed_milking' | 'derby' | 'wheel';

export function MiniGamesScreen({
  cash,
  onAwardMinigame,
  onRewardWheel,
}: MiniGamesScreenProps) {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);

  const games = [
    {
      id: 'catcher' as const,
      title: '1. Łapanie Mleka',
      icon: '🪣',
      desc: 'Przesuwaj wiaderko lewo/prawo, aby łapać butelki mleka 🥛 i serki 🧀, unikając kamieni 🪨!',
      reward: 'Gotówka + litry mleka',
      badge: 'Zręczność',
      color: 'from-blue-500 to-sky-400',
    },
    {
      id: 'speed_milking' as const,
      title: '2. Szybkie Dojenie (QTE)',
      icon: '⚡',
      desc: '15-sekundowy turniej dojenia wymion na czas! Klikaj podświetlone przyciski i twórz serie!',
      reward: 'Wysokie premie',
      badge: 'Szybkie tempo',
      color: 'from-amber-500 to-yellow-400',
    },
    {
      id: 'derby' as const,
      title: '3. Derby Kamocina',
      icon: '🏁',
      desc: 'Stukaj szybko w ekran, aby Twoja krówka wyprzedziła Ursusa i inne krowy na wiejskiej drodze!',
      reward: 'Do +1,200 zł za 1. miejsce',
      badge: 'Wyścigi',
      color: 'from-emerald-500 to-teal-400',
    },
    {
      id: 'wheel' as const,
      title: '4. Koło Fortuny Sołtysa',
      icon: '🎡',
      desc: 'Zakręć kołem i zgarnij Złote Dzwonki, sery, masło lub wielki wiejski jackpot gotówkowy!',
      reward: 'Złote dzwonki, sery, kasa',
      badge: 'Losowanie',
      color: 'from-purple-500 to-pink-400',
    },
  ];

  return (
    <div className="w-full px-3 py-2 select-none">
      {/* Header */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-100 dark:border-slate-800 rounded-2xl p-3.5 mb-3 shadow-sm text-center transition-colors duration-200">
        <h2 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-300 flex items-center justify-center gap-1.5">
          <span>🎮</span> Wiejskie Gry i Rozrywki w Kamocinie
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Zdobywaj dodatkowe pieniądze, mleko i wiejskie laury w mini-grach!
        </p>
      </div>

      {/* Grid of Mini-Games */}
      <div className="flex flex-col gap-2.5">
        {games.map(game => (
          <div
            key={game.id}
            className="bg-white/95 dark:bg-slate-900/95 border border-emerald-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl shrink-0">
                {game.icon}
              </span>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-tight">
                    {game.title}
                  </h3>
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full">
                    {game.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {game.desc}
                </p>
                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mt-1">
                  🏆 Nagroda: {game.reward}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveGame(game.id)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              <Play size={13} className="fill-white" />
              <span>Graj</span>
            </button>
          </div>
        ))}
      </div>

      {/* Active Game Modal Dialog */}
      {activeGame !== null && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="w-full max-w-sm">
            {activeGame === 'catcher' && (
              <MilkCatcherGame
                onFinish={(cash, milk, won) => onAwardMinigame(cash, milk, won, false)}
                onClose={() => setActiveGame(null)}
              />
            )}
            {activeGame === 'speed_milking' && (
              <SpeedMilkingGame
                onFinish={(cash, milk, won) => onAwardMinigame(cash, milk, won, false)}
                onClose={() => setActiveGame(null)}
              />
            )}
            {activeGame === 'derby' && (
              <CowDerbyGame
                onFinish={(cash, milk, won, isDerby) => onAwardMinigame(cash, milk, won, isDerby)}
                onClose={() => setActiveGame(null)}
              />
            )}
            {activeGame === 'wheel' && (
              <KamocinWheelGame
                cash={cash}
                onReward={(c, m, b, ch, bells) => onRewardWheel(c, m, b, ch, bells)}
                onClose={() => setActiveGame(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
