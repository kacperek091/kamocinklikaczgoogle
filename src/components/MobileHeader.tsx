import { Volume2, VolumeX, Smartphone, Bell, Moon, Sun } from 'lucide-react';

interface MobileHeaderProps {
  milk: number;
  cash: number;
  goldenBells: number;
  milkPerSecond: number;
  soundEnabled: boolean;
  isDarkMode: boolean;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onOpenPrestige: () => void;
  onOpenAndroidCode: () => void;
}

export function MobileHeader({
  milk,
  cash,
  goldenBells,
  milkPerSecond,
  soundEnabled,
  isDarkMode,
  onToggleSound,
  onToggleTheme,
  onOpenPrestige,
  onOpenAndroidCode,
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm select-none transition-colors duration-200">
      {/* Phone Simulated Status Bar (Signal, Clock, Battery) */}
      <div className="flex items-center justify-between px-4 pt-1.5 pb-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
        <span className="font-extrabold text-emerald-800 dark:text-emerald-400">12:30</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">📶</span>
          <span className="text-[11px]">🔋 100%</span>
        </div>
      </div>

      {/* Main Resource Display Bar */}
      <div className="px-3 pb-2 pt-1 flex items-center justify-between gap-1.5">
        {/* Milk Pill */}
        <div className="flex-1 bg-gradient-to-r from-blue-50 to-sky-100/90 dark:from-slate-800 dark:to-sky-950/80 border border-sky-200/90 dark:border-sky-700/50 rounded-2xl px-2 py-1.5 shadow-sm flex items-center gap-1.5">
          <span className="text-lg sm:text-xl filter drop-shadow-sm shrink-0">🥛</span>
          <div className="leading-tight min-w-0 flex-1">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-sky-800 dark:text-sky-300 font-extrabold flex items-center gap-1">
              <span>Mleko</span>
              <span className="bg-sky-500 dark:bg-sky-600 text-white text-[8px] sm:text-[9px] px-1 rounded-full shrink-0">+{milkPerSecond.toFixed(1)}/s</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-sky-950 dark:text-sky-100 tabular-nums truncate">
              {Math.floor(milk).toLocaleString('pl-PL')} <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300">L</span>
            </div>
          </div>
        </div>

        {/* Cash Pill */}
        <div className="flex-1 bg-gradient-to-r from-amber-50 to-yellow-100/90 dark:from-slate-800 dark:to-amber-950/80 border border-amber-200/90 dark:border-amber-700/50 rounded-2xl px-2 py-1.5 shadow-sm flex items-center gap-1.5">
          <span className="text-lg sm:text-xl filter drop-shadow-sm shrink-0">💰</span>
          <div className="leading-tight min-w-0 flex-1">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-300 font-extrabold">
              Gotówka
            </div>
            <div className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-100 tabular-nums truncate">
              {Math.floor(cash).toLocaleString('pl-PL')} <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">zł</span>
            </div>
          </div>
        </div>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1 shrink-0">
          {goldenBells > 0 && (
            <button
              onClick={onOpenPrestige}
              className="p-1.5 sm:p-2 bg-gradient-to-b from-yellow-300 to-amber-400 text-amber-950 rounded-xl shadow-sm border border-amber-300 font-black text-xs flex items-center gap-0.5 active:scale-90 transition cursor-pointer"
              title="Złote Dzwonki (Prestiż)"
            >
              <Bell size={13} className="fill-amber-950" />
              <span className="text-[10px] sm:text-[11px] font-bold">{goldenBells}</span>
            </button>
          )}

          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 sm:p-2 rounded-xl border transition shadow-sm active:scale-90 cursor-pointer ${
              isDarkMode
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
            }`}
            title={isDarkMode ? 'Przełącz na jasny motyw (Dzień)' : 'Przełącz na ciemny motyw (Noc)'}
          >
            {isDarkMode ? (
              <Sun size={15} className="text-amber-300 animate-spin-slow" />
            ) : (
              <Moon size={15} className="text-indigo-600" />
            )}
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 sm:p-2 rounded-xl border transition shadow-sm active:scale-90 cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-700/50 text-rose-500 dark:text-rose-400'
            }`}
            title={soundEnabled ? 'Dźwięk włączony' : 'Dźwięk wyłączony'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Android Kotlin Code Button */}
          <button
            onClick={onOpenAndroidCode}
            className="p-1.5 sm:p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-700/50 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 shadow-sm transition active:scale-90 cursor-pointer"
            title="Kod Kotlin MainActivity.kt"
          >
            <Smartphone size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
