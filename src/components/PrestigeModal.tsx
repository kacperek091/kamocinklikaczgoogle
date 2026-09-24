import { X, Sparkles } from 'lucide-react';

interface PrestigeModalProps {
  goldenBells: number;
  canPrestige: boolean;
  earnedBells: number;
  onPrestige: () => void;
  onClose: () => void;
}

export function PrestigeModal({
  goldenBells,
  canPrestige,
  earnedBells,
  onPrestige,
  onClose,
}: PrestigeModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 select-none">
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-600/70 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative transition-colors duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-3">
          <span className="text-5xl inline-block animate-bounce mb-1">🔔</span>
          <h3 className="text-lg font-black text-amber-950 dark:text-amber-300">
            Order Złotego Dzwonka Kamocina
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            Złóż hołd Sołtysowi, zresetuj zwykłą oborę i odbierz Złote Dzwonki dające stałe +15% do całej produkcji!
          </p>
        </div>

        {/* Current & Bonus Stats */}
        <div className="bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-3 mb-3 text-xs">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-slate-600 dark:text-slate-300 font-bold">Posiadane Złote Dzwonki:</span>
            <span className="text-xs font-black text-amber-900 dark:text-amber-300 tabular-nums">🔔 {goldenBells}</span>
          </div>

          <div className="flex justify-between items-center mb-1.5">
            <span className="text-slate-600 dark:text-slate-300 font-bold">Stały bonus do produkcji:</span>
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
              +{(goldenBells * 15)}% na zawsze
            </span>
          </div>

          <div className="h-px bg-amber-200 dark:bg-slate-700 my-1.5" />

          <div className="flex justify-between items-center">
            <span className="text-amber-900 dark:text-amber-300 font-black">Otrzymasz za ten reset:</span>
            <span className="text-sm font-black text-amber-900 dark:text-amber-200 tabular-nums">
              +🔔 {earnedBells} {earnedBells === 1 ? 'Dzwonek' : 'Dzwonków'}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 mb-4 text-[10px] text-slate-600 dark:text-slate-300 leading-snug">
          <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Zachowasz po resecie:</strong>
          Odblokowane rasy krówek, osiągnięcia, rekordy i Złote Dzwonki!
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onPrestige();
              onClose();
            }}
            disabled={!canPrestige}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              canPrestige
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 text-amber-950 shadow-amber-200 dark:shadow-none'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <Sparkles size={14} />
            <span>{canPrestige ? 'Odbierz Order i Złote Dzwonki' : 'Wymaga 25,000 zł'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
