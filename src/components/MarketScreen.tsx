import { useState } from 'react';
import { MarketContract } from '../types/game';
import { TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface MarketScreenProps {
  milk: number;
  milkPrice: number;
  marketTrend: 'up' | 'down' | 'stable';
  cheeseCount: number;
  butterCount: number;
  contracts: MarketContract[];
  onSellMilk: (amount?: number) => void;
  onChurnButter: () => boolean;
  onMakeCheese: () => boolean;
  onSellArtisanalProducts: () => number;
  onFulfillContract: (contractId: string) => boolean;
}

export function MarketScreen({
  milk,
  milkPrice,
  marketTrend,
  cheeseCount,
  butterCount,
  contracts,
  onSellMilk,
  onChurnButter,
  onMakeCheese,
  onSellArtisanalProducts,
  onFulfillContract,
}: MarketScreenProps) {
  const [sellPercent, setSellPercent] = useState<number>(100);

  const milkToSell = Math.floor(milk * (sellPercent / 100));
  const estimatedCash = Math.floor(milkToSell * milkPrice);
  const totalArtisValue = (butterCount * 260) + (cheeseCount * 1350);

  return (
    <div className="w-full px-3 py-2 select-none">
      {/* Market Header */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-100 dark:border-slate-800 rounded-2xl p-3.5 mb-3 shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
              <span>🏛️</span> Giełda Mleczna & Manufaktura
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sprzedawaj świeże mleko lub twórz z niego sery i masło!
            </p>
          </div>

          {/* Current Ticker Indicator */}
          <div className="bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 rounded-2xl px-3 py-1.5 flex items-center gap-2">
            <div>
              <div className="text-[9px] font-bold text-amber-800 dark:text-amber-400 uppercase">Cena skupu:</div>
              <div className="text-base font-black text-amber-950 dark:text-amber-200 tabular-nums leading-none">
                {milkPrice.toFixed(2)} <span className="text-[10px] font-bold">zł/L</span>
              </div>
            </div>
            <div>
              {marketTrend === 'up' && <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />}
              {marketTrend === 'down' && <TrendingDown size={18} className="text-rose-600 dark:text-rose-400" />}
              {marketTrend === 'stable' && <span className="text-base">⚖️</span>}
            </div>
          </div>
        </div>

        {/* Sell Percentage Selector */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
            <span>Ilość partii do sprzedaży:</span>
            <div className="flex gap-1">
              {[25, 50, 75, 100].map(pct => (
                <button
                  key={pct}
                  onClick={() => setSellPercent(pct)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                    sellPercent === pct
                      ? 'bg-amber-400 text-amber-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/70 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="leading-tight">
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 tabular-nums">
                {milkToSell.toLocaleString('pl-PL')} L
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold ml-1.5 tabular-nums">
                (Wypłata: ~{estimatedCash.toLocaleString('pl-PL')} zł)
              </span>
            </div>

            <button
              onClick={() => onSellMilk(milkToSell)}
              disabled={milkToSell < 1}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs shadow-sm transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                milkToSell >= 1
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 text-amber-950'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>Sprzedaj partię</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Artisanal Processing Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
        {/* Butter Churn */}
        <div className="bg-white/95 dark:bg-slate-900/95 border border-amber-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-3xl p-1.5 bg-yellow-50 dark:bg-slate-800 rounded-xl border border-yellow-200 dark:border-yellow-700/40">🧈</span>
              <div>
                <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-tight">
                  Wiejskie Masło z Kamocina
                </h3>
                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400">
                  Koszt: 50 L mleka · Wartość: 260 zł
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 mb-2">
              Tradycyjne wiejskie masło, ubijane w kierzance z mleka od zadowolonych krówek.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
              Masz: {butterCount} szt.
            </div>
            <button
              onClick={onChurnButter}
              disabled={milk < 50}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 ${
                milk >= 50
                  ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>Ubij Masło (-50L)</span>
            </button>
          </div>
        </div>

        {/* Aged Cheese Wheel */}
        <div className="bg-white/95 dark:bg-slate-900/95 border border-amber-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-3xl p-1.5 bg-yellow-50 dark:bg-slate-800 rounded-xl border border-yellow-200 dark:border-yellow-700/40">🧀</span>
              <div>
                <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-tight">
                  Krążek Sera Kamocińskiego
                </h3>
                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400">
                  Koszt: 200 L mleka · Wartość: 1,350 zł
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 mb-2">
              Dojrzewający ser z dziurami o złocistej skórce. Rarytas poszukiwany w miastach!
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
              Masz: {cheeseCount} krążków
            </div>
            <button
              onClick={onMakeCheese}
              disabled={milk < 200}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 ${
                milk >= 200
                  ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>Uwarz Ser (-200L)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Artisanal Bulk Sell Alert */}
      {(butterCount > 0 || cheeseCount > 0) && (
        <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 dark:from-slate-800 dark:via-amber-950/40 dark:to-slate-800 border-2 border-amber-400 dark:border-amber-600/60 rounded-2xl p-3 mb-3 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-black text-amber-950 dark:text-amber-200 leading-tight">
                Kupcy czekają na Twoje wyroby!
              </div>
              <div className="text-[10px] text-amber-800 dark:text-amber-400 font-bold tabular-nums">
                Łączna wartość: {totalArtisValue.toLocaleString('pl-PL')} zł
              </div>
            </div>
          </div>

          <button
            onClick={onSellArtisanalProducts}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer active:scale-95"
          >
            Sprzedaj wyroby
          </button>
        </div>
      )}

      {/* Village Contracts */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-emerald-100 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
        <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
          <span>📜</span> Kontrakty Handlowe ze Wsią Kamocin
        </h3>

        {contracts.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">
            Wszystkie wiejskie zamówienia zostały zrealizowane!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {contracts.map(contract => {
              const canFulfill = milk >= contract.litersRequired;

              return (
                <div
                  key={contract.id}
                  className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{contract.icon}</span>
                    <div>
                      <h4 className="font-black text-xs text-slate-900 dark:text-slate-100 leading-tight">
                        {contract.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Dla: {contract.client}
                      </p>
                      <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
                        Wymóg: {contract.litersRequired} L · Nagroda: +{contract.rewardCash} zł
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onFulfillContract(contract.id)}
                    disabled={!canFulfill}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                      canFulfill
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <ShieldCheck size={13} />
                    <span>Dostarcz</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
