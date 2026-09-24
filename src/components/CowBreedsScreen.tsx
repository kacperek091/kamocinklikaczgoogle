import { CowBreed } from '../types/game';
import { Check, Sparkles, Lock, Star } from 'lucide-react';

interface CowBreedsScreenProps {
  breeds: CowBreed[];
  activeCowId: string;
  cash: number;
  onSelectCow: (cowId: string) => void;
}

export function CowBreedsScreen({
  breeds,
  activeCowId,
  cash,
  onSelectCow,
}: CowBreedsScreenProps) {
  return (
    <div className="w-full px-3 py-2 select-none">
      {/* Intro Banner */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-100 dark:border-slate-800 rounded-2xl p-3 mb-3 shadow-sm text-center transition-colors duration-200">
        <h2 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-300 flex items-center justify-center gap-1.5">
          <span>👑</span> Święta Zagroda Rasy Krówek
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Odkryj niezwykłe krowy z Kamocina o potężnych wiejskich mocach!
        </p>
      </div>

      {/* Grid of Breeds */}
      <div className="flex flex-col gap-3">
        {breeds.map(breed => {
          const isActive = breed.id === activeCowId;
          const canUnlock = cash >= breed.baseCost;

          return (
            <div
              key={breed.id}
              className={`relative bg-white/95 dark:bg-slate-900/95 border-2 rounded-2xl p-3.5 shadow-sm flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-amber-400 dark:border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-300/60 dark:ring-amber-500/30'
                  : breed.unlocked
                  ? 'border-emerald-200 dark:border-slate-700/80 hover:border-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 opacity-90'
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Star size={11} className="fill-amber-950" />
                  <span>AKTYWNA KRÓWKA</span>
                </div>
              )}

              <div>
                {/* Header: Emoji and Titles */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-50 to-green-50 dark:from-slate-800 dark:to-slate-750 border border-emerald-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {breed.emoji}
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-tight">
                      {breed.name}
                    </h3>
                    <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      "{breed.nickname}"
                    </p>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                      "{breed.quote}"
                    </div>
                  </div>
                </div>

                {/* Backstory */}
                <div className="bg-slate-50 dark:bg-slate-800/70 p-2 rounded-xl border border-slate-100 dark:border-slate-700/60 mb-2">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {breed.kamocinStory}
                  </p>
                </div>

                {/* Multipliers */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-2 font-medium">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50 text-center">
                    <span className="text-emerald-700 dark:text-emerald-400 block text-[9px] font-bold uppercase">Produkcja:</span>
                    <span className="font-black text-emerald-900 dark:text-emerald-200 text-xs tabular-nums">
                      x{breed.multiplierAll.toFixed(1)}
                    </span>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-100 dark:border-amber-800/50 text-center">
                    <span className="text-amber-700 dark:text-amber-400 block text-[9px] font-bold uppercase">Moc kliku:</span>
                    <span className="font-black text-amber-900 dark:text-amber-200 text-xs tabular-nums">
                      x{breed.clickBonus.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Special Ability */}
                <div className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100/70 dark:bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5 mb-2.5">
                  <Sparkles size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{breed.specialAbility}</span>
                </div>
              </div>

              {/* Action Button: Select or Unlock */}
              <div>
                {breed.unlocked ? (
                  <button
                    onClick={() => onSelectCow(breed.id)}
                    disabled={isActive}
                    className={`w-full py-2 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 cursor-default'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check size={14} />
                        <span>Pasie się na łące</span>
                      </>
                    ) : (
                      <span>Wybierz tę krówkę 🐄</span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectCow(breed.id)}
                    disabled={!canUnlock}
                    className={`w-full py-2 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                      canUnlock
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Lock size={13} />
                    <span>Kup krówkę · {breed.baseCost.toLocaleString('pl-PL')} zł</span>
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
