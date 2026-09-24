export type TabType = 'main' | 'shop' | 'breeds' | 'market' | 'minigames' | 'achievements';

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color?: string;
}

export interface UpgradeItem {
  id: string;
  name: string;
  category: 'feed' | 'tools' | 'buildings' | 'machines' | 'research';
  emoji: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  milkPerSec: number;
  milkPerClick: number;
  desc: string;
  kamocinLore: string;
}

export interface CowBreed {
  id: string;
  name: string;
  nickname: string;
  emoji: string;
  desc: string;
  kamocinStory: string;
  quote: string;
  baseCost: number; // in zl or golden bells
  unlocked: boolean;
  multiplierAll: number;
  clickBonus: number;
  satisfactionDecayReduction: number; // 0 to 0.8
  specialAbility: string;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  category: 'clicks' | 'milk' | 'money' | 'upgrades' | 'minigames' | 'kamocin';
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardCash: number;
  rewardBells?: number;
}

export interface VillageNews {
  id: number;
  text: string;
  time: string;
}

export interface MarketContract {
  id: string;
  title: string;
  client: string;
  litersRequired: number;
  rewardCash: number;
  rewardPrestigePoints: number;
  expiresInSeconds: number;
  icon: string;
}

export interface GameStats {
  totalMilkProduced: number;
  totalCashEarned: number;
  totalClicks: number;
  cowsPetted: number;
  minigamesWon: number;
  derbyWins: number;
  wheelSpins: number;
  goldenBellsEarned: number;
  playtimeSeconds: number;
  prestigeCount: number;
}

export interface GameSaveState {
  milk: number;
  cash: number;
  goldenBells: number; // prestige currency (Złote Dzwonki Kamocina)
  activeCowId: string;
  cowSatisfaction: number; // 0 to 100%
  milkPricePerLiter: number; // dynamically fluctuates around ~2.20 - 4.80 zl
  marketTrend: 'up' | 'down' | 'stable';
  lastSaveTimestamp: number;
  upgrades: Record<string, number>; // id -> level
  unlockedCows: string[];
  claimedAchievements: string[];
  stats: GameStats;
  cheeseCount: number;
  butterCount: number;
  soundEnabled: boolean;
}
