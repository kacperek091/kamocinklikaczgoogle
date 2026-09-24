import { TabType } from '../types/game';

interface MobileBottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unclaimedAchievementsCount: number;
}

export function MobileBottomNav({
  currentTab,
  onSelectTab,
  unclaimedAchievementsCount,
}: MobileBottomNavProps) {
  const tabs: { id: TabType; label: string; icon: string; badge?: number }[] = [
    { id: 'main', label: 'Obora', icon: '🐄' },
    { id: 'shop', label: 'Sklep', icon: '🚜' },
    { id: 'breeds', label: 'Rasy', icon: '👑' },
    { id: 'market', label: 'Targ', icon: '🧀' },
    { id: 'minigames', label: 'Gry', icon: '🎮' },
    { id: 'achievements', label: 'Zadania', icon: '🏆', badge: unclaimedAchievementsCount },
  ];

  return (
    <nav className="sticky bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-emerald-100 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] px-2 py-1.5 select-none shrink-0 transition-colors duration-200">
      <div className="w-full flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all relative cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-50 to-green-100/90 dark:from-emerald-950/80 dark:to-emerald-900/80 text-emerald-900 dark:text-emerald-300 font-extrabold shadow-sm ring-1 ring-emerald-300 dark:ring-emerald-600/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              {/* Icon */}
              <span className={`text-xl transition-transform ${isActive ? 'scale-115 -translate-y-0.5' : ''}`}>
                {tab.icon}
              </span>

              {/* Label */}
              <span className="text-[10px] leading-tight font-bold tracking-tight">
                {tab.label}
              </span>

              {/* Notification Badge (for ready achievements) */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-0 right-2 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow animate-bounce">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
