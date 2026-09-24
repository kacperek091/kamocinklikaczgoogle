import { TabType } from '../types/game';
import { Volume2, VolumeX, Sparkles, Award } from 'lucide-react';

interface TopNavProps {
  milk: number;
  cash: number;
  goldenBells: number;
  milkPerSecond: number;
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPrestige: () => void;
  onOpenAndroidCode: () => void;
}

export function TopNav({
  milk,
  cash,
  goldenBells,
  milkPerSecond,
  currentTab,
  onSelectTab,
  soundEnabled,
  onToggleSound,
  onOpenPrestige,
  onOpenAndroidCode,
}: TopNavProps) {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'main', label: 'Gospodarstwo', icon: '🐄' },
    { id: 'shop', label: 'Sklep Obory', icon: '🚜' },
    { id: 'breeds', label: 'Rasy Krów', icon: '👑' },
    { id: 'market', label: 'Targ & Sery', icon: '🧀' },
    { id: 'minigames', label: 'Mini-gry', icon: '🎮' },
    { id: 'achievements', label: 'Osiągnięcia', icon: '🏆' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#18120C]/95 backdrop-blur border-b border-[#3D2C1D] text-[#FFF8E7] px-3 sm:px-6 py-2.5 shadow-md">
      {/* Top Bar Status Row */}
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="Cow">🐄</span>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#E5A93C] font-serif leading-tight">
              Kamocin Clicker
            </h1>
            <p className="text-[11px] text-[#A68A68] hidden sm:block">
              Wiejska Przygoda · Kamocińskie Łąki
            </p>
          </div>
        </div>

        {/* Resources HUD */}
        <div className="flex items-center gap-2 sm:gap-6 bg-[#221A12] border border-[#3D2C1D] rounded-xl px-3 py-1.5 shadow-inner">
          {/* Milk Meter */}
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🥛</span>
            <div className="text-left">
              <div className="text-xs sm:text-sm font-extrabold text-[#FFF8E7] tabular-nums">
                {Math.floor(milk).toLocaleString('pl-PL')} <span className="text-[10px] text-[#A68A68] font-normal">L</span>
              </div>
              <div className="text-[10px] text-[#86EFAC] font-semibold tabular-nums leading-none">
                +{milkPerSecond.toFixed(1)} L/s
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-[#3D2C1D]" />

          {/* Cash Meter */}
          <div className="flex items-center gap-1.5">
            <span className="text-lg">💰</span>
            <div className="text-left">
              <div className="text-xs sm:text-sm font-extrabold text-[#E5A93C] tabular-nums">
                {Math.floor(cash).toLocaleString('pl-PL')} <span className="text-[10px] text-[#A68A68] font-normal">zł</span>
              </div>
              <div className="text-[10px] text-[#A68A68] leading-none">
                Gotówka
              </div>
            </div>
          </div>

          {/* Prestige Golden Bells (if unlocked or available) */}
          {goldenBells > 0 && (
            <>
              <div className="h-6 w-px bg-[#3D2C1D]" />
              <button
                onClick={onOpenPrestige}
                className="flex items-center gap-1 hover:opacity-80 transition cursor-pointer"
                title="Złote Dzwonki Kamocina (Prestiż)"
              >
                <span className="text-base">🔔</span>
                <span className="text-xs font-bold text-[#FDE047] tabular-nums">{goldenBells}</span>
              </button>
            </>
          )}
        </div>

        {/* Action Buttons: Sound, Prestige, Android Kotlin Export */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Wycisz dźwięki' : 'Włącz dźwięki'}
            className="p-2 rounded-lg bg-[#2A1F16] border border-[#443021] text-[#E5A93C] hover:bg-[#38291D] transition"
            title={soundEnabled ? 'Dźwięk włączony' : 'Dźwięk wyciszony'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-red-400" />}
          </button>

          <button
            onClick={onOpenPrestige}
            className="px-2.5 py-1.5 text-xs font-bold bg-[#3E2912] hover:bg-[#523719] border border-[#855B25] text-[#FDE047] rounded-lg transition flex items-center gap-1 shadow-sm whitespace-nowrap"
            title="Order Sołtysa / Prestiż"
          >
            <Sparkles size={14} />
            <span className="hidden md:inline">Prestiż</span>
          </button>

          <button
            onClick={onOpenAndroidCode}
            className="px-2.5 py-1.5 text-xs font-bold bg-[#1E2820] hover:bg-[#2A382D] border border-[#3E5242] text-[#86EFAC] rounded-lg transition flex items-center gap-1 shadow-sm whitespace-nowrap"
            title="Zobacz i skopiuj plik MainActivity.kt (Android Jetpack Compose)"
          >
            <Award size={14} />
            <span className="hidden md:inline">Kod Android</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="max-w-6xl mx-auto mt-2 flex items-center justify-between sm:justify-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#E5A93C] text-[#18120C] shadow-md shadow-amber-900/40 font-bold'
                  : 'bg-[#221A12]/80 text-[#D4C3A3] hover:bg-[#2E2218] hover:text-[#FFF8E7] border border-[#3D2C1D]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
