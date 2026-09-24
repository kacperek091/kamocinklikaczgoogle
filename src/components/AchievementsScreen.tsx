import { Achievement, GameStats } from '../types/game';
import { Trophy, Check, Gift } from 'lucide-react';

interface AchievementsScreenProps {
  achievements: Achievement[];
  stats: GameStats;
  onClaimAchievement: (id: string) => void;
}

export function AchievementsScreen({
  achievements,
  stats,
  onClaimAchievement,
}: AchievementsScreenProps) {
  const completedCount = achievements.filter(a => a.completed).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs} godz. ${mins % 60} min`;
    return `${mins} min ${Math.floor(seconds % 60)} s`;
  };

  return (
    <div className="w-full px-3 py-2 select-none">
      {/* Village Statistics Overview Card */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-100 dark:border-slate-800 rounded-2xl p-3 mb-3 shadow-sm transition-colors duration-200">
        <h2 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
          <span>📊</span> Kronika Gospodarza z Kamocina
        </h2>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50/80 dark:bg-slate-800/80 p-2 rounded-xl border border-blue-100 dark:border-slate-700/60">
            <div className="text-blue-700 dark:text-blue-400 text-[10px] font-bold">Łącznie mleko:</div>
            <div className="text-sm font-black text-blue-950 dark:text-blue-100 tabular-nums">
              {Math.floor(stats.totalMilkProduced).toLocaleString('pl-PL')} L
            </div>
          </div>

          <div className="bg-amber-50/80 dark:bg-slate-800/80 p-2 rounded-xl border border-amber-100 dark:border-slate-700/60">
            <div className="text-amber-700 dark:text-amber-400 text-[10px] font-bold">Zarobiona gotówka:</div>
            <div className="text-sm font-black text-amber-950 dark:text-amber-100 tabular-nums">
              {Math.floor(stats.totalCashEarned).toLocaleString('pl-PL')} zł
            </div>
          </div>

          <div className="bg-emerald-50/80 dark:bg-slate-800/80 p-2 rounded-xl border border-emerald-100 dark:border-slate-700/60">
            <div className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">Dotknięcia krówki:</div>
            <div className="text-sm font-black text-emerald-950 dark:text-emerald-100 tabular-nums">
              {stats.totalClicks.toLocaleString('pl-PL')}
            </div>
          </div>

          <div className="bg-violet-50/80 dark:bg-slate-800/80 p-2 rounded-xl border border-violet-100 dark:border-slate-700/60">
            <div className="text-violet-700 dark:text-violet-400 text-[10px] font-bold">Czas gry na wsi:</div>
            <div className="text-sm font-black text-violet-950 dark:text-violet-100">
              {formatTime(stats.playtimeSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Header and Progress Badge */}
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1">
          <Trophy size={16} className="text-amber-500" />
          <span>Medale Sołtysa & Zadania</span>
        </h3>
        <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
          {completedCount} / {achievements.length} ukończono
        </span>
      </div>

      {/* Achievements List */}
      <div className="flex flex-col gap-2">
        {achievements.map(ach => {
          const progressPct = Math.min(100, Math.floor((ach.progress / ach.target) * 100));

          return (
            <div
              key={ach.id}
              className={`bg-white/95 dark:bg-slate-900/95 border rounded-2xl p-3 shadow-sm flex flex-col justify-between transition-all ${
                ach.claimed
                  ? 'border-slate-200 dark:border-slate-800 opacity-70'
                  : ach.completed
                  ? 'border-amber-400 dark:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 ring-1 ring-amber-300 dark:ring-amber-500/40'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 bg-amber-50 dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-slate-700">
                      {ach.emoji}
                    </span>
                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-tight">
                        {ach.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {ach.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="my-1.5">
                  <div className="flex justify-between text-[10px] mb-0.5 font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Postęp:</span>
                    <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                      {Math.floor(ach.progress).toLocaleString('pl-PL')} / {ach.target.toLocaleString('pl-PL')} ({progressPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Reward & Button */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 mt-1">
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Gift size={13} />
                  <span>+{ach.rewardCash} zł</span>
                  {ach.rewardBells && (
                    <span className="text-amber-600 dark:text-amber-300 font-extrabold">· 🔔 +{ach.rewardBells}</span>
                  )}
                </div>

                {ach.claimed ? (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Check size={13} /> Odebrano
                  </span>
                ) : (
                  <button
                    onClick={() => onClaimAchievement(ach.id)}
                    disabled={!ach.completed}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                      ach.completed
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 text-amber-950 shadow-sm animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <span>Odbierz nagrodę</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
