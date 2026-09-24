import { useState } from 'react';
import { UpgradeItem } from '../types/game';
import { Zap, Clock } from 'lucide-react';

interface BarnUpgradesScreenProps {
  upgrades: UpgradeItem[];
  cash: number;
  onBuyUpgrade: (upgradeId: string, quantity: number) => boolean;
}

export function BarnUpgradesScreen({
  upgrades,
  cash,
  onBuyUpgrade,
}: BarnUpgradesScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [buyMultiplier, setBuyMultiplier] = useState<number>(1);

  const categories = [
    { id: 'all', label: 'Wszystkie', icon: '🌾' },
    { id: 'feed', label: 'Pasza i Łąki', icon: '🌱' },
    { id: 'tools', label: 'Dojarki', icon: '🪣' },
    { id: 'machines', label: 'Maszyny & Ursus', icon: '🚜' },
    { id: 'buildings', label: 'Obora', icon: '🏠' },
    { id: 'research', label: 'Innowacje', icon: '🔬' },
  ];

  const filteredUpgrades = upgrades.filter(
    u => selectedCategory === 'all' || u.category === selectedCategory
  );

  const calculateCost = (upgrade: UpgradeItem, qty: number) => {
    let total = 0;
    for (let i = 0; i < qty; i++) {
      total += Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level + i));
    }
    return total;
  };

  return (
    <div className="w-full px-3 py-2 select-none">
      {/* Header and Controls */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-100 dark:border-slate-800 rounded-2xl p-3 mb-3 shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
              <span>🚜</span> Sklep Gospodarza
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Rozwijaj wieś Kamocin i zwiększaj udój mleka!
            </p>
          </div>

          {/* Bulk buy multiplier pills: 1x, 5x, 10x */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {[1, 5, 10].map(qty => (
              <button
                key={qty}
                onClick={() => setBuyMultiplier(qty)}
                className={`px-2 py-0.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  buyMultiplier === qty
                    ? 'bg-amber-400 text-amber-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                x{qty}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50/80 dark:bg-slate-800/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-200/60 dark:border-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upgrades List */}
      <div className="flex flex-col gap-2.5">
        {filteredUpgrades.map(upgrade => {
          const cost = calculateCost(upgrade, buyMultiplier);
          const canAfford = cash >= cost;
          const totalMilkPerSec = (upgrade.milkPerSec * upgrade.level).toFixed(1);
          const totalMilkPerClick = upgrade.milkPerClick * upgrade.level;

          return (
            <div
              key={upgrade.id}
              className={`bg-white/95 dark:bg-slate-900/95 border rounded-2xl p-3 shadow-sm flex flex-col justify-between transition-all ${
                canAfford
                  ? 'border-emerald-200 dark:border-slate-700/80'
                  : 'border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              <div>
                {/* Top Row: Emoji, Name, Level */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-1.5 bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-amber-700/40 rounded-xl shadow-inner">
                      {upgrade.emoji}
                    </span>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 leading-tight">
                        {upgrade.name}
                      </h3>
                      <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        Poziom {upgrade.level}
                      </div>
                    </div>
                  </div>

                  {/* Production badges */}
                  <div className="text-right">
                    {upgrade.milkPerSec > 0 && (
                      <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1 tabular-nums">
                        <Clock size={11} />
                        +{upgrade.milkPerSec * buyMultiplier} L/s
                      </div>
                    )}
                    {upgrade.milkPerClick > 0 && (
                      <div className="text-[11px] font-black text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1 tabular-nums">
                        <Zap size={11} />
                        +{upgrade.milkPerClick * buyMultiplier} L/klik
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-1.5">
                  {upgrade.desc}
                </p>

                {/* Kamocin Lore */}
                <div className="bg-emerald-50/70 dark:bg-slate-800/70 border-l-2 border-emerald-500 px-2 py-1 rounded-r-lg mb-2">
                  <p className="text-[10px] text-emerald-900 dark:text-emerald-300 italic leading-snug">
                    "{upgrade.kamocinLore}"
                  </p>
                </div>
              </div>

              {/* Bottom: Current Status & Buy Button */}
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {upgrade.milkPerSec > 0 && `Łącznie: +${totalMilkPerSec} L/s`}
                  {upgrade.milkPerClick > 0 && `Łącznie: +${totalMilkPerClick} L/klik`}
                </div>

                <button
                  onClick={() => onBuyUpgrade(upgrade.id, buyMultiplier)}
                  disabled={!canAfford}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-xs shadow-sm transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 shadow-amber-200 dark:shadow-none'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span>Kup (x{buyMultiplier})</span>
                  <span className="tabular-nums">· {cost.toLocaleString('pl-PL')} zł</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
