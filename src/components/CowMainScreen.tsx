import React, { useState } from 'react';
import { CowBreed, FloatingText } from '../types/game';
import { Heart, Sparkles, AlertTriangle, ArrowRight, Sun, Moon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import pastureBg from '../assets/images/kamocin_pasture_bg_1790263491929.jpg';
import nightPastureBg from '../assets/images/kamocin_night_meadow_bg_1790264454446.jpg';

interface CowMainScreenProps {
  activeCow: CowBreed;
  cowSatisfaction: number;
  milk: number;
  cash: number;
  milkPrice: number;
  marketTrend: 'up' | 'down' | 'stable';
  milkPerClick: number;
  milkPerSecond: number;
  floatingTexts: FloatingText[];
  villageNews: string;
  isDarkMode?: boolean;
  onClickCow: (clientX?: number, clientY?: number) => void;
  onPetCow: () => void;
  onSellMilk: (amount?: number) => void;
  onNavigateToTab: (tab: 'shop' | 'minigames' | 'market') => void;
}

export function CowMainScreen({
  activeCow,
  cowSatisfaction,
  milk,
  milkPrice,
  marketTrend,
  milkPerClick,
  milkPerSecond,
  floatingTexts,
  villageNews,
  isDarkMode = false,
  onClickCow,
  onPetCow,
  onSellMilk,
  onNavigateToTab,
}: CowMainScreenProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [petAnimation, setPetAnimation] = useState(false);

  const handleTouchCow = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsPressing(true);
    let clientX: number | undefined;
    let clientY: number | undefined;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    onClickCow(clientX, clientY);
    setTimeout(() => setIsPressing(false), 120);
  };

  const handlePet = () => {
    setPetAnimation(true);
    onPetCow();
    setTimeout(() => setPetAnimation(false), 800);
  };

  const currentMilkValue = Math.floor(milk * milkPrice * (activeCow.id === 'soltys_queen' ? 1.5 : 1.0));

  return (
    <div className="flex flex-col items-center justify-between min-h-full px-3 py-2 select-none transition-colors duration-200">
      {/* Top Ticker Card: Sunny / Starry Weather & Village News */}
      <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-emerald-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-sm text-center relative overflow-hidden mb-2">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 mb-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400">
            {isDarkMode ? (
              <>
                <Moon size={15} className="text-amber-300" />
                <span>Kamocin · Gwieździsta Noc</span>
              </>
            ) : (
              <>
                <Sun size={15} className="text-amber-500 animate-spin-slow" />
                <span>Kamocin · Słoneczna Polana</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 font-extrabold text-[11px]">
            <span>Cena mleka:</span>
            <span className="tabular-nums">{milkPrice.toFixed(2)} zł/L</span>
            {marketTrend === 'up' && <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-400" />}
            {marketTrend === 'down' && <TrendingDown size={13} className="text-rose-600 dark:text-rose-400" />}
            {marketTrend === 'stable' && <Minus size={13} className="text-amber-600 dark:text-amber-400" />}
          </div>
        </div>

        {/* Cheerful village news banner */}
        <p className="text-[11px] sm:text-xs text-emerald-900 dark:text-emerald-200 font-semibold bg-emerald-50/80 dark:bg-emerald-950/60 rounded-xl py-1 px-2 border border-emerald-100 dark:border-emerald-800/50">
          🌾 {villageNews}
        </p>
      </div>

      {/* Floating Click Numbers Layer */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {floatingTexts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: item.y - 20, x: item.x - 20, scale: 0.9 }}
              animate={{ opacity: 0, y: item.y - 110, scale: 1.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute text-xl sm:text-2xl font-black text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] select-none"
            >
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Center Meadow Pasture Scene with Illustrated Background */}
      <div className="w-full flex-1 relative rounded-3xl overflow-hidden shadow-md border-2 border-emerald-200/80 dark:border-slate-800 my-1 min-h-[340px] flex flex-col items-center justify-between p-3">
        {/* Cartoon Pasture Image Background (switches day / night) */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${isDarkMode ? nightPastureBg : pastureBg})` }}
        />
        {/* Soft atmospheric gradient overlay */}
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
          isDarkMode
            ? 'bg-gradient-to-b from-indigo-950/40 via-transparent to-slate-950/60'
            : 'bg-gradient-to-b from-white/25 via-transparent to-emerald-900/20'
        }`} />

        {/* Top Speech Bubble */}
        <div className="relative z-10 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 text-xs font-bold px-3.5 py-1.5 rounded-2xl shadow-md border border-amber-200 dark:border-amber-700/50 max-w-xs text-center animate-bounce">
          "{activeCow.quote}"
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white dark:border-t-slate-900" />
        </div>

        {/* Interactive Cow on Cartoon Grassy Circle */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          {/* Sunny/Starry halo glow */}
          <div className={`absolute -inset-4 rounded-full blur-xl animate-pulse pointer-events-none ${
            isDarkMode ? 'bg-cyan-400/25' : 'bg-yellow-200/40'
          }`} />

          {/* Grassy circular pedestal */}
          <div
            onClick={handleTouchCow}
            onTouchStart={handleTouchCow}
            className={`relative group cursor-pointer transition-transform duration-100 flex items-center justify-center p-5 sm:p-7 rounded-full select-none active:scale-90 ${
              isPressing ? 'scale-90 rotate-2' : 'hover:scale-105'
            }`}
            style={{
              background: isDarkMode
                ? 'radial-gradient(circle, rgba(30,41,59,0.85) 0%, rgba(16,185,129,0.4) 60%, rgba(6,78,59,0) 80%)'
                : 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(134,239,172,0.65) 60%, rgba(34,197,94,0) 80%)',
            }}
          >
            {/* Cow Emoji */}
            <span className="text-8xl sm:text-9xl filter drop-shadow-xl transform transition-transform">
              {activeCow.emoji}
            </span>

            {/* Floating pet heart on affection click */}
            {petAnimation && (
              <motion.div
                initial={{ scale: 0.5, y: 0, opacity: 1 }}
                animate={{ scale: 2.2, y: -80, opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute text-5xl pointer-events-none"
              >
                💖
              </motion.div>
            )}

            {/* Quick Pet Button overlay */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePet();
              }}
              className="absolute -bottom-1 right-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white p-2 px-3 rounded-full font-extrabold text-[11px] shadow-md flex items-center gap-1 transition cursor-pointer active:scale-90"
              title="Pogłaszcz krówkę (+15% zadowolenia)"
            >
              <Heart size={13} className="fill-white" />
              <span>Pogłaszcz</span>
            </button>
          </div>

          {/* Cow Breed Name Badge */}
          <div className="mt-1 text-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3.5 py-1 rounded-full shadow-sm border border-emerald-200 dark:border-slate-700">
            <span className="text-sm font-black text-emerald-950 dark:text-emerald-300">
              {activeCow.name}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold ml-1.5">
              · {activeCow.nickname}
            </span>
          </div>
        </div>

        {/* Bottom Pasture HUD: Satisfaction & Quick stats */}
        <div className="relative z-10 w-full max-w-sm bg-white/92 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-white/80 dark:border-slate-800">
          {/* Satisfaction Row */}
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>{cowSatisfaction >= 85 ? '😍' : cowSatisfaction < 30 ? '🥺' : '😊'}</span>
              <span>Zadowolenie Krówki:</span>
            </span>
            <span className={`tabular-nums font-extrabold ${cowSatisfaction < 30 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {cowSatisfaction}%
            </span>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                cowSatisfaction < 30
                  ? 'bg-rose-500'
                  : cowSatisfaction >= 85
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-400'
              }`}
              style={{ width: `${cowSatisfaction}%` }}
            />
          </div>

          {cowSatisfaction < 30 && (
            <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950/60 py-0.5 rounded border border-rose-200 dark:border-rose-800/60">
              <AlertTriangle size={12} />
              <span>Krówka smutna! Mniej mleka o 50%! Pogłaszcz ją!</span>
            </div>
          )}

          {cowSatisfaction >= 85 && (
            <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
              <Sparkles size={11} className="text-amber-500" />
              <span>Krówka jest zachwycona kamocińską łąką (+20% bonus)!</span>
            </div>
          )}

          {/* Quick Rates */}
          <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold">
            <div className="text-slate-600 dark:text-slate-400">
              Dotyk: <span className="text-emerald-700 dark:text-emerald-400 font-black">+{milkPerClick} L</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Automat: <span className="text-sky-700 dark:text-sky-400 font-black">+{milkPerSecond.toFixed(1)} L/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sell & Quick Shortcuts Container */}
      <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-md border border-emerald-100 dark:border-slate-800 mt-2">
        <div className="flex items-center justify-between gap-3">
          {/* Summary */}
          <div className="leading-tight">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Mleko do skupu:</div>
            <div className="text-base font-black text-slate-800 dark:text-slate-100 tabular-nums">
              {Math.floor(milk).toLocaleString('pl-PL')} <span className="text-xs font-normal">L</span>
            </div>
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 tabular-nums">
              Wartość: ~{currentMilkValue.toLocaleString('pl-PL')} zł
            </div>
          </div>

          {/* Sell Button */}
          <button
            onClick={() => onSellMilk()}
            disabled={milk < 1}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              milk >= 1
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 shadow-amber-200 dark:shadow-none'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>Sprzedaj mleko 💰</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Mini quick jump buttons */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onNavigateToTab('shop')}
            className="py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-[11px] font-extrabold border border-emerald-200 dark:border-emerald-800/50 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>🚜 Ulepsz Oborę</span>
          </button>
          <button
            onClick={() => onNavigateToTab('minigames')}
            className="py-1.5 px-2 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-800 dark:text-violet-300 rounded-xl text-[11px] font-extrabold border border-violet-200 dark:border-violet-800/50 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>🎮 Mini-gry Wiejskie</span>
          </button>
        </div>
      </div>
    </div>
  );
}
