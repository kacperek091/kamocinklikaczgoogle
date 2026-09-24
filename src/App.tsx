import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { TabType } from './types/game';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CowMainScreen } from './components/CowMainScreen';
import { BarnUpgradesScreen } from './components/BarnUpgradesScreen';
import { CowBreedsScreen } from './components/CowBreedsScreen';
import { MarketScreen } from './components/MarketScreen';
import { MiniGamesScreen } from './components/MiniGamesScreen';
import { AchievementsScreen } from './components/AchievementsScreen';
import { PrestigeModal } from './components/PrestigeModal';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import bgMeadow from './assets/images/kamocin_pasture_bg_1790263491929.jpg';
import bgNightMeadow from './assets/images/kamocin_night_meadow_bg_1790264454446.jpg';
import { Maximize2, Minimize2, FileCode, Sparkles, Moon, Sun } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('main');
  const [showPrestigeModal, setShowPrestigeModal] = useState<boolean>(false);
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kamocin_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('kamocin_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('kamocin_theme', 'light');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const gameState = useGameState();

  const unclaimedAchievementsCount = gameState.achievements.filter(
    (a) => a.completed && !a.claimed
  ).length;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'dark bg-[#080D1A] text-slate-100' : 'bg-[#61C2E6] text-slate-800'
      } flex flex-col items-center justify-center relative font-sans selection:bg-amber-300 selection:text-emerald-950 overflow-x-hidden transition-colors duration-300`}
      style={{
        backgroundImage: isDarkMode
          ? `radial-gradient(circle at 50% 25%, rgba(30, 58, 138, 0.35) 0%, rgba(8, 13, 26, 0.95) 100%)`
          : `radial-gradient(circle at 50% 30%, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.05) 100%)`,
      }}
    >
      {/* Background Meadow Wallpaper for Desktop view (switches day / night) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 bg-cover bg-center filter blur-sm scale-105 transition-all duration-700"
        style={{ backgroundImage: `url(${isDarkMode ? bgNightMeadow : bgMeadow})` }}
      />

      {/* Desktop Helper Toolbar (Only shown on medium/large screens) */}
      <div className="hidden lg:flex fixed top-3 right-4 z-50 items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-emerald-200 dark:border-slate-700 text-xs font-bold transition-colors duration-200">
        <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300">
          <Sparkles size={14} className="text-amber-500 animate-spin" />
          <span>Kamocin Clicker Mobile</span>
        </span>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Desktop Theme Switcher */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition cursor-pointer active:scale-95 ${
            isDarkMode
              ? 'bg-amber-950/50 text-amber-300 hover:bg-amber-900/60 border border-amber-600/40'
              : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
          }`}
          title={isDarkMode ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
        >
          {isDarkMode ? (
            <>
              <Sun size={13} className="text-amber-400" />
              <span>Dzień</span>
            </>
          ) : (
            <>
              <Moon size={13} className="text-indigo-600" />
              <span>Noc</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-900 dark:text-emerald-300 transition cursor-pointer"
        >
          {isPhoneFrame ? (
            <>
              <Maximize2 size={13} />
              <span>Pełny ekran</span>
            </>
          ) : (
            <>
              <Minimize2 size={13} />
              <span>Ramka telefonu</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowAndroidModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 transition cursor-pointer"
        >
          <FileCode size={13} />
          <span>MainActivity.kt</span>
        </button>
      </div>

      {/* Main Mobile App Chassis Container */}
      <div
        className={`w-full transition-all duration-300 flex flex-col relative z-10 ${
          isPhoneFrame
            ? 'max-w-[440px] h-screen sm:h-[880px] sm:max-h-[96vh] sm:rounded-[46px] sm:border-[10px] sm:border-slate-850 dark:sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] sm:ring-1 sm:ring-black/10 my-auto'
            : 'max-w-3xl min-h-screen'
        } bg-white dark:bg-slate-950 overflow-hidden`}
        style={{
          boxShadow: isPhoneFrame
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0,0,0,0.1)'
            : 'none',
        }}
      >
        {/* Dynamic Island / Camera Notch (visible in phone frame mode) */}
        {isPhoneFrame && (
          <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-900 rounded-full z-50 items-center justify-between px-3 pointer-events-none shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1E293B] ring-1 ring-slate-700 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-500/80"></div>
            </div>
            <div className="w-10 h-1 rounded-full bg-slate-800"></div>
          </div>
        )}

        {/* Mobile Sticky Header */}
        <MobileHeader
          milk={gameState.milk}
          cash={gameState.cash}
          goldenBells={gameState.goldenBells}
          milkPerSecond={gameState.milkPerSecond}
          soundEnabled={gameState.soundEnabled}
          isDarkMode={isDarkMode}
          onToggleSound={gameState.toggleSound}
          onToggleTheme={toggleTheme}
          onOpenPrestige={() => setShowPrestigeModal(true)}
          onOpenAndroidCode={() => setShowAndroidModal(true)}
        />

        {/* Main Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
          {currentTab === 'main' && (
            <CowMainScreen
              activeCow={gameState.activeCow}
              cowSatisfaction={gameState.cowSatisfaction}
              milk={gameState.milk}
              cash={gameState.cash}
              milkPrice={gameState.milkPrice}
              marketTrend={gameState.marketTrend}
              milkPerClick={gameState.milkPerClick}
              milkPerSecond={gameState.milkPerSecond}
              floatingTexts={gameState.floatingTexts}
              villageNews={gameState.villageNews}
              isDarkMode={isDarkMode}
              onClickCow={gameState.clickCow}
              onPetCow={gameState.petCow}
              onSellMilk={gameState.sellMilk}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'shop' && (
            <BarnUpgradesScreen
              upgrades={gameState.upgrades}
              cash={gameState.cash}
              onBuyUpgrade={gameState.buyUpgrade}
            />
          )}

          {currentTab === 'breeds' && (
            <CowBreedsScreen
              breeds={gameState.cowBreeds}
              activeCowId={gameState.activeCowId}
              cash={gameState.cash}
              onSelectCow={gameState.selectCow}
            />
          )}

          {currentTab === 'market' && (
            <MarketScreen
              milk={gameState.milk}
              milkPrice={gameState.milkPrice}
              marketTrend={gameState.marketTrend}
              cheeseCount={gameState.cheeseCount}
              butterCount={gameState.butterCount}
              contracts={gameState.contracts}
              onSellMilk={gameState.sellMilk}
              onChurnButter={gameState.churnButter}
              onMakeCheese={gameState.makeCheese}
              onSellArtisanalProducts={gameState.sellArtisanalProducts}
              onFulfillContract={gameState.fulfillContract}
            />
          )}

          {currentTab === 'minigames' && (
            <MiniGamesScreen
              cash={gameState.cash}
              onAwardMinigame={gameState.awardMinigame}
              onRewardWheel={(cash, milk, butter, cheese, bells) => {
                if (cash > 0) gameState.awardMinigame(cash, 0, true);
                if (milk > 0) gameState.awardMinigame(0, milk, true);
                if (butter > 0) {
                  for (let i = 0; i < butter; i++) gameState.churnButter();
                }
                if (cheese > 0) {
                  for (let i = 0; i < cheese; i++) gameState.makeCheese();
                }
                if (bells > 0) {
                  gameState.awardMinigame(0, 0, true);
                }
              }}
            />
          )}

          {currentTab === 'achievements' && (
            <AchievementsScreen
              achievements={gameState.achievements}
              stats={gameState.stats}
              onClaimAchievement={gameState.claimAchievement}
            />
          )}
        </main>

        {/* Offline Earnings Toast (Inside phone chassis) */}
        {gameState.lastOfflineLiters !== null && (
          <div className="absolute bottom-20 inset-x-3 bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-500 rounded-2xl p-3.5 shadow-2xl z-50 animate-bounce">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">🥛</span>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                    Witaj z powrotem w Kamocinie!
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Podczas Twojej nieobecności krówki wyprodukowały:
                  </p>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{gameState.lastOfflineLiters.toLocaleString('pl-PL')} L mleka!
                  </p>
                </div>
              </div>
              <button
                onClick={gameState.dismissOfflineModal}
                className="px-3 py-1.5 bg-amber-400 text-slate-900 rounded-xl text-xs font-black hover:bg-amber-300 shadow cursor-pointer active:scale-95"
              >
                Super!
              </button>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          unclaimedAchievementsCount={unclaimedAchievementsCount}
        />

        {/* Phone Gesture Home Bar */}
        {isPhoneFrame && (
          <div className="bg-white/95 dark:bg-slate-900/95 pb-1 pt-0.5 flex items-center justify-center shrink-0">
            <div className="w-28 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
        )}
      </div>

      {/* Prestige Modal */}
      {showPrestigeModal && (
        <PrestigeModal
          goldenBells={gameState.goldenBells}
          canPrestige={gameState.canPrestige}
          earnedBells={gameState.earnedPrestigeBells}
          onPrestige={gameState.executePrestige}
          onClose={() => setShowPrestigeModal(false)}
        />
      )}

      {/* Android Kotlin Code Modal */}
      {showAndroidModal && (
        <AndroidCodeModal onClose={() => setShowAndroidModal(false)} />
      )}
    </div>
  );
}
