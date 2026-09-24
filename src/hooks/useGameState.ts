import { useState, useEffect, useRef, useCallback } from 'react';
import { GameSaveState, UpgradeItem, CowBreed, Achievement, FloatingText, MarketContract } from '../types/game';
import { INITIAL_UPGRADES, COW_BREEDS, INITIAL_ACHIEVEMENTS, INITIAL_CONTRACTS, KAMOCIN_VILLAGE_EVENTS } from '../data/initialData';
import { soundManager } from '../audio/soundManager';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'kamocin_clicker_save_v1';

export function useGameState() {
  // Game Resources
  const [milk, setMilk] = useState<number>(0);
  const [cash, setCash] = useState<number>(50); // Start with 50 zł pocket money from Sołtys!
  const [goldenBells, setGoldenBells] = useState<number>(0);
  const [activeCowId, setActiveCowId] = useState<string>('mucka_classic');
  const [cowSatisfaction, setCowSatisfaction] = useState<number>(100);
  const [milkPrice, setMilkPrice] = useState<number>(2.40);
  const [marketTrend, setMarketTrend] = useState<'up' | 'down' | 'stable'>('stable');

  // Upgrades & Collection
  const [upgrades, setUpgrades] = useState<UpgradeItem[]>(INITIAL_UPGRADES);
  const [cowBreeds, setCowBreeds] = useState<CowBreed[]>(COW_BREEDS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [contracts, setContracts] = useState<MarketContract[]>(INITIAL_CONTRACTS);

  // Dairy Processing
  const [cheeseCount, setCheeseCount] = useState<number>(0);
  const [butterCount, setButterCount] = useState<number>(0);

  // Visual & Atmosphere
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [villageNews, setVillageNews] = useState<string>(KAMOCIN_VILLAGE_EVENTS[0]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastOfflineLiters, setLastOfflineLiters] = useState<number | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalMilkProduced: 0,
    totalCashEarned: 0,
    totalClicks: 0,
    cowsPetted: 0,
    minigamesWon: 0,
    derbyWins: 0,
    wheelSpins: 0,
    goldenBellsEarned: 0,
    playtimeSeconds: 0,
    prestigeCount: 0,
  });

  const nextTextId = useRef(1);

  // Active cow helper
  const activeCow = cowBreeds.find(c => c.id === activeCowId) || cowBreeds[0];

  // Calculation helpers
  const getPrestigeMultiplier = useCallback(() => {
    return 1 + (goldenBells * 0.15); // +15% per Golden Bell
  }, [goldenBells]);

  const calculateMilkPerSecond = useCallback(() => {
    const rawPerSec = upgrades.reduce((acc, u) => acc + (u.milkPerSec * u.level), 0);
    const cowMult = activeCow.multiplierAll;
    const bellMult = getPrestigeMultiplier();

    // Satisfaction penalty: <30% drops production by 50%
    let satisfactionFactor = 1.0;
    if (cowSatisfaction < 30) {
      satisfactionFactor = 0.5;
    } else if (cowSatisfaction >= 85) {
      satisfactionFactor = 1.2; // Kamocin cow happy bonus!
    }

    return (rawPerSec * cowMult * bellMult * satisfactionFactor);
  }, [upgrades, activeCow, getPrestigeMultiplier, cowSatisfaction]);

  const calculateMilkPerClick = useCallback(() => {
    const rawFromUpgrades = upgrades.reduce((acc, u) => acc + (u.milkPerClick * u.level), 0);
    const baseClick = 1 + rawFromUpgrades;
    const cowClickMult = activeCow.clickBonus * activeCow.multiplierAll;
    const bellMult = getPrestigeMultiplier();

    let satisfactionFactor = 1.0;
    if (cowSatisfaction < 30) {
      satisfactionFactor = 0.5;
    } else if (cowSatisfaction >= 85) {
      satisfactionFactor = 1.2;
    }

    return Math.max(1, Math.round(baseClick * cowClickMult * bellMult * satisfactionFactor));
  }, [upgrades, activeCow, getPrestigeMultiplier, cowSatisfaction]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: GameSaveState = JSON.parse(saved);
        setMilk(parsed.milk || 0);
        setCash(parsed.cash ?? 50);
        setGoldenBells(parsed.goldenBells || 0);
        if (parsed.activeCowId) setActiveCowId(parsed.activeCowId);
        setCowSatisfaction(parsed.cowSatisfaction ?? 100);
        setMilkPrice(parsed.milkPricePerLiter || 2.40);
        setCheeseCount(parsed.cheeseCount || 0);
        setButterCount(parsed.butterCount || 0);
        setSoundEnabled(parsed.soundEnabled ?? true);
        soundManager.enabled = parsed.soundEnabled ?? true;

        if (parsed.stats) {
          setStats(parsed.stats);
        }

        // Restore upgrade levels
        if (parsed.upgrades) {
          setUpgrades(prev => prev.map(u => ({
            ...u,
            level: parsed.upgrades[u.id] || 0,
          })));
        }

        // Restore cow unlocks
        if (parsed.unlockedCows) {
          setCowBreeds(prev => prev.map(c => ({
            ...c,
            unlocked: parsed.unlockedCows.includes(c.id) || c.id === 'mucka_classic',
          })));
        }

        // Restore achievements claimed
        if (parsed.claimedAchievements) {
          setAchievements(prev => prev.map(a => ({
            ...a,
            claimed: parsed.claimedAchievements.includes(a.id),
          })));
        }

        // Calculate offline progress
        if (parsed.lastSaveTimestamp) {
          const secondsAway = Math.min(86400, Math.max(0, Math.floor((Date.now() - parsed.lastSaveTimestamp) / 1000)));
          if (secondsAway > 5) {
            // Rough offline rate
            const approxRate = parsed.upgrades ?
              INITIAL_UPGRADES.reduce((acc, u) => acc + (u.milkPerSec * (parsed.upgrades[u.id] || 0)), 0) : 0;
            const offlineMilk = Math.floor(approxRate * secondsAway * 0.7); // 70% offline efficiency
            if (offlineMilk > 0) {
              setMilk(m => m + offlineMilk);
              setLastOfflineLiters(offlineMilk);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load save:', err);
    }
  }, []);

  // Save to LocalStorage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const stateToSave: GameSaveState = {
          milk,
          cash,
          goldenBells,
          activeCowId,
          cowSatisfaction,
          milkPricePerLiter: milkPrice,
          marketTrend,
          lastSaveTimestamp: Date.now(),
          upgrades: upgrades.reduce((acc, u) => ({ ...acc, [u.id]: u.level }), {}),
          unlockedCows: cowBreeds.filter(c => c.unlocked).map(c => c.id),
          claimedAchievements: achievements.filter(a => a.claimed).map(a => a.id),
          stats,
          cheeseCount,
          butterCount,
          soundEnabled,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        console.error('Save failed:', err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [milk, cash, goldenBells, activeCowId, cowSatisfaction, milkPrice, marketTrend, upgrades, cowBreeds, achievements, stats, cheeseCount, butterCount, soundEnabled]);

  // Main Game Loop (100ms ticks for ultra-smooth numbers)
  useEffect(() => {
    const tickMs = 100;
    const interval = setInterval(() => {
      const milkPerSec = calculateMilkPerSecond();
      const milkPerTick = milkPerSec * (tickMs / 1000);

      if (milkPerTick > 0) {
        setMilk(m => m + milkPerTick);
        setStats(s => ({
          ...s,
          totalMilkProduced: s.totalMilkProduced + milkPerTick,
        }));
      }

      setStats(s => ({
        ...s,
        playtimeSeconds: s.playtimeSeconds + (tickMs / 1000),
      }));
    }, tickMs);

    return () => clearInterval(interval);
  }, [calculateMilkPerSecond]);

  // Cow satisfaction decay: drops by 1% every 2s in background (adjusted by active cow and barn upgrades)
  useEffect(() => {
    const interval = setInterval(() => {
      const musicUpgrade = upgrades.find(u => u.id === 'music_barn')?.level || 0;
      const brushUpgrade = upgrades.find(u => u.id === 'massage_brush')?.level || 0;
      const decayReduction = Math.min(0.8, activeCow.satisfactionDecayReduction + (musicUpgrade * 0.05) + (brushUpgrade * 0.08));
      const decayChance = 1 - decayReduction;

      if (Math.random() < decayChance) {
        setCowSatisfaction(prev => Math.max(0, prev - 1));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeCow, upgrades]);

  // Dynamic Milk Market Price Fluctuation (Kamocin Market Ticker)
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() * 0.6 - 0.28); // -0.28 to +0.32
      setMilkPrice(prev => {
        const nextPrice = Math.max(1.80, Math.min(5.50, parseFloat((prev + change).toFixed(2))));
        if (nextPrice > prev) setMarketTrend('up');
        else if (nextPrice < prev) setMarketTrend('down');
        else setMarketTrend('stable');
        return nextPrice;
      });

      // Random Kamocin village news event
      if (Math.random() < 0.35) {
        const randomEvent = KAMOCIN_VILLAGE_EVENTS[Math.floor(Math.random() * KAMOCIN_VILLAGE_EVENTS.length)];
        setVillageNews(randomEvent);
      }
    }, 14000);

    return () => clearInterval(interval);
  }, []);

  // Check achievements progress
  useEffect(() => {
    setAchievements(prev => prev.map(ach => {
      if (ach.completed) return ach;
      let currentVal = 0;
      if (ach.category === 'milk') currentVal = stats.totalMilkProduced;
      else if (ach.category === 'money') currentVal = stats.totalCashEarned;
      else if (ach.category === 'clicks') currentVal = stats.totalClicks;
      else if (ach.id === 'buy_ursus') currentVal = (upgrades.find(u => u.id === 'ursus_tractor')?.level || 0);
      else if (ach.id === 'all_cows_unlocked') currentVal = cowBreeds.filter(c => c.unlocked).length;
      else if (ach.id === 'minigame_winner') currentVal = stats.minigamesWon;
      else if (ach.id === 'derby_champion') currentVal = stats.derbyWins;
      else if (ach.id === 'pet_cow_50') currentVal = stats.cowsPetted;

      const isCompleted = currentVal >= ach.target;
      if (isCompleted && !ach.completed) {
        soundManager.playFanfare();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      }

      return {
        ...ach,
        progress: Math.min(ach.target, currentVal),
        completed: isCompleted,
      };
    }));
  }, [stats, upgrades, cowBreeds]);

  // Click active cow handler
  const clickCow = useCallback((clientX?: number, clientY?: number) => {
    const milkAmount = calculateMilkPerClick();
    setMilk(m => m + milkAmount);
    setCowSatisfaction(prev => {
      const next = Math.min(100, prev + 3);
      if (next === 100 && prev < 100) {
        setStats(s => ({ ...s, cowsPetted: s.cowsPetted + 1 }));
      }
      return next;
    });

    setStats(s => ({
      ...s,
      totalClicks: s.totalClicks + 1,
      totalMilkProduced: s.totalMilkProduced + milkAmount,
    }));

    // Audio effect
    soundManager.playSquirt();
    if (Math.random() < 0.12) {
      soundManager.playMoo();
    }

    // Add floating text
    const textId = nextTextId.current++;
    const x = clientX !== undefined ? clientX : (window.innerWidth / 2 + (Math.random() * 80 - 40));
    const y = clientY !== undefined ? clientY : (window.innerHeight * 0.45 + (Math.random() * 60 - 30));

    setFloatingTexts(prev => [
      ...prev.slice(-15),
      {
        id: textId,
        text: `+${milkAmount} L`,
        x,
        y,
        color: milkAmount > 20 ? '#FBBF24' : '#FFF8E7',
      },
    ]);

    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== textId));
    }, 900);
  }, [calculateMilkPerClick]);

  // Pet cow for pure satisfaction & affection
  const petCow = useCallback(() => {
    setCowSatisfaction(prev => Math.min(100, prev + 15));
    setStats(s => ({ ...s, cowsPetted: s.cowsPetted + 1 }));
    soundManager.playMoo();
  }, []);

  // Sell milk to cash
  const sellMilk = useCallback((amount?: number) => {
    const milkToSell = amount !== undefined ? Math.min(milk, amount) : milk;
    if (milkToSell <= 0) return 0;

    // Sołtys cow price bonus
    const cowSellBonus = activeCow.id === 'soltys_queen' ? 1.5 : 1.0;
    const earnedCash = Math.floor(milkToSell * milkPrice * cowSellBonus);

    setMilk(prev => Math.max(0, prev - milkToSell));
    setCash(prev => prev + earnedCash);
    setStats(s => ({
      ...s,
      totalCashEarned: s.totalCashEarned + earnedCash,
    }));

    soundManager.playCash();
    return earnedCash;
  }, [milk, milkPrice, activeCow]);

  // Buy upgrade with cost scaling
  const buyUpgrade = useCallback((upgradeId: string, quantity: number = 1) => {
    const up = upgrades.find(u => u.id === upgradeId);
    if (!up) return false;

    let totalCost = 0;
    for (let i = 0; i < quantity; i++) {
      totalCost += Math.round(up.baseCost * Math.pow(up.costMultiplier, up.level + i));
    }

    if (cash < totalCost) return false;

    setCash(prev => prev - totalCost);
    setUpgrades(prev => prev.map(u => {
      if (u.id === upgradeId) {
        return { ...u, level: u.level + quantity };
      }
      return u;
    }));

    if (upgradeId === 'ursus_tractor') {
      soundManager.playTractor();
    } else {
      soundManager.playCash();
    }

    return true;
  }, [cash, upgrades]);

  // Unlock / Select Cow Breed
  const selectCow = useCallback((cowId: string) => {
    const breed = cowBreeds.find(c => c.id === cowId);
    if (!breed) return;

    if (!breed.unlocked) {
      if (cash < breed.baseCost) return;
      setCash(prev => prev - breed.baseCost);
      setCowBreeds(prev => prev.map(c => c.id === cowId ? { ...c, unlocked: true } : c));
      soundManager.playFanfare();
      confetti({ particleCount: 70, spread: 80 });
    }

    setActiveCowId(cowId);
    soundManager.playMoo();
  }, [cash, cowBreeds]);

  // Claim achievement reward
  const claimAchievement = useCallback((achievementId: string) => {
    const ach = achievements.find(a => a.id === achievementId);
    if (!ach || !ach.completed || ach.claimed) return;

    setCash(prev => prev + ach.rewardCash);
    if (ach.rewardBells) {
      setGoldenBells(prev => prev + ach.rewardBells!);
      setStats(s => ({ ...s, goldenBellsEarned: s.goldenBellsEarned + ach.rewardBells! }));
    }

    setAchievements(prev => prev.map(a => a.id === achievementId ? { ...a, claimed: true } : a));
    soundManager.playCash();
  }, [achievements]);

  // Fulfill village market contract
  const fulfillContract = useCallback((contractId: string) => {
    const c = contracts.find(item => item.id === contractId);
    if (!c || milk < c.litersRequired) return false;

    setMilk(prev => prev - c.litersRequired);
    setCash(prev => prev + c.rewardCash);
    setStats(s => ({
      ...s,
      totalCashEarned: s.totalCashEarned + c.rewardCash,
      minigamesWon: s.minigamesWon + 1,
    }));

    // Replace contract with new one
    setContracts(prev => prev.filter(item => item.id !== contractId));
    soundManager.playFanfare();
    confetti({ particleCount: 40 });
    return true;
  }, [contracts, milk]);

  // Process milk into butter (costs 50 L milk, gives 1 butter worth 250 zł)
  const churnButter = useCallback(() => {
    if (milk < 50) return false;
    setMilk(m => m - 50);
    setButterCount(b => b + 1);
    soundManager.playSquirt();
    return true;
  }, [milk]);

  // Process milk into cheese (costs 200 L milk, gives 1 Kamociński Cheese worth 1,200 zł)
  const makeCheese = useCallback(() => {
    if (milk < 200) return false;
    setMilk(m => m - 200);
    setCheeseCount(c => c + 1);
    soundManager.playSquirt();
    return true;
  }, [milk]);

  // Sell artisanal products (Butter & Cheese)
  const sellArtisanalProducts = useCallback(() => {
    const butterValue = butterCount * 260;
    const cheeseValue = cheeseCount * 1350;
    const total = butterValue + cheeseValue;
    if (total <= 0) return 0;

    setCash(prev => prev + total);
    setButterCount(0);
    setCheeseCount(0);
    setStats(s => ({ ...s, totalCashEarned: s.totalCashEarned + total }));
    soundManager.playCash();
    return total;
  }, [butterCount, cheeseCount]);

  // Mini-game reward handler
  const awardMinigame = useCallback((cashReward: number, milkReward: number, won: boolean, isDerby: boolean = false) => {
    if (cashReward > 0) setCash(c => c + cashReward);
    if (milkReward > 0) setMilk(m => m + milkReward);

    if (won) {
      setStats(s => ({
        ...s,
        minigamesWon: s.minigamesWon + 1,
        derbyWins: isDerby ? s.derbyWins + 1 : s.derbyWins,
        totalCashEarned: s.totalCashEarned + cashReward,
        totalMilkProduced: s.totalMilkProduced + milkReward,
      }));
      soundManager.playFanfare();
      confetti({ particleCount: 60, spread: 70 });
    }
  }, []);

  // Prestige Reset: Order Złotego Dzwonka Kamocina
  const canPrestige = stats.totalCashEarned >= 25000 || milk >= 20000;
  const calculatePrestigeBells = () => {
    const fromCash = Math.floor(Math.sqrt(stats.totalCashEarned / 2000));
    return Math.max(1, fromCash);
  };

  const executePrestige = useCallback(() => {
    const earnedBells = calculatePrestigeBells();
    setGoldenBells(b => b + earnedBells);
    setStats(s => ({
      ...s,
      goldenBellsEarned: s.goldenBellsEarned + earnedBells,
      prestigeCount: s.prestigeCount + 1,
    }));

    // Reset game resources to fresh state, but keep golden bells & unlocked breeds
    setMilk(0);
    setCash(100);
    setCowSatisfaction(100);
    setCheeseCount(0);
    setButterCount(0);
    setUpgrades(INITIAL_UPGRADES);

    soundManager.playBell();
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
  }, [stats.totalCashEarned]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  return {
    milk,
    cash,
    goldenBells,
    activeCow,
    activeCowId,
    cowSatisfaction,
    milkPrice,
    marketTrend,
    upgrades,
    cowBreeds,
    achievements,
    contracts,
    cheeseCount,
    butterCount,
    floatingTexts,
    villageNews,
    soundEnabled,
    stats,
    lastOfflineLiters,
    dismissOfflineModal: () => setLastOfflineLiters(null),
    milkPerSecond: calculateMilkPerSecond(),
    milkPerClick: calculateMilkPerClick(),
    clickCow,
    petCow,
    sellMilk,
    buyUpgrade,
    selectCow,
    claimAchievement,
    fulfillContract,
    churnButter,
    makeCheese,
    sellArtisanalProducts,
    awardMinigame,
    canPrestige,
    earnedPrestigeBells: calculatePrestigeBells(),
    executePrestige,
    toggleSound,
  };
}
