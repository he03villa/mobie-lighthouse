import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const XP_KEY = 'lh_xp';
const STREAK_KEY = 'lh_streak';
const BEST_STREAK_KEY = 'lh_best_streak';
const LAST_ACTIVE_KEY = 'lh_last_active';
const BADGES_KEY = 'lh_badges';
const DAILY_COUNT_KEY = 'lh_daily_count';
const DAILY_DATE_KEY = 'lh_daily_date';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StreakInfo {
  current: number;
  best: number;
}

export interface LevelInfo {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
}

const BADGE_DEFS: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_evidence', name: 'Primera Evidencia', description: 'Enviaste tu primera evidencia', icon: '🎯' },
  { id: 'streak_7', name: 'Primer Fuego', description: '7 dias seguidos activo', icon: '🔥' },
  { id: 'streak_30', name: 'Llama Eterna', description: '30 dias seguidos activo', icon: '🏆' },
  { id: 'journal_10', name: 'Escritor', description: '10 entradas en el diario', icon: '✏️' },
  { id: 'xp_50', name: 'Estudiante Dedicado', description: 'Acumula 50 XP', icon: '⭐' },
  { id: 'xp_200', name: 'Maestro del Saber', description: 'Acumula 200 XP', icon: '👑' },
  { id: 'module_done', name: 'Modulo Completado', description: 'Completa un modulo entero', icon: '🎓' },
  { id: 'quiz_perfect', name: 'Quiz Perfecto', description: 'Puntaje perfecto en un quiz', icon: '💎' },
  { id: 'reflection_5', name: 'Pensador', description: '5 reflexiones enviadas', icon: '🧠' },
  { id: 'daily_goal', name: 'Meta Diaria', description: 'Completa tu meta diaria', icon: '🏅' },
];

@Injectable({ providedIn: 'root' })
export class GamificationService {
  private xp = 0;
  private streak = 0;
  private bestStreak = 0;
  private badges: Badge[] = [];
  private dailyCount = 0;
  private dailyDate = '';
  private ready = false;

  async init(): Promise<void> {
    if (this.ready) return;
    const [xpR, streakR, bestR, badgesR, countR, dateR] = await Promise.all([
      Preferences.get({ key: XP_KEY }),
      Preferences.get({ key: STREAK_KEY }),
      Preferences.get({ key: BEST_STREAK_KEY }),
      Preferences.get({ key: BADGES_KEY }),
      Preferences.get({ key: DAILY_COUNT_KEY }),
      Preferences.get({ key: DAILY_DATE_KEY }),
    ]);
    this.xp = parseInt(xpR.value ?? '0', 10);
    this.streak = parseInt(streakR.value ?? '0', 10);
    this.bestStreak = parseInt(bestR.value ?? '0', 10);
    this.dailyCount = parseInt(countR.value ?? '0', 10);
    this.dailyDate = dateR.value ?? '';
    this.badges = badgesR.value
      ? JSON.parse(badgesR.value)
      : BADGE_DEFS.map(b => ({ ...b, unlocked: false }));
    await this.reconcileStreak();
    this.ready = true;
  }

  async awardXP(amount: number, reason: string): Promise<{ xp: number; leveledUp: boolean; newLevel: number }> {
    await this.init();
    const oldLevel = this.currentLevel();
    this.xp += amount;
    await Preferences.set({ key: XP_KEY, value: String(this.xp) });
    const newLevel = this.currentLevel();
    const leveledUp = newLevel > oldLevel;
    if (reason === 'evidence') await this.unlock('first_evidence');
    if (reason === 'reflection') await this.tickCount('reflection_5', 5);
    if (this.xp >= 50) await this.unlock('xp_50');
    if (this.xp >= 200) await this.unlock('xp_200');
    return { xp: this.xp, leveledUp, newLevel };
  }

  async checkStreak(): Promise<void> {
    await this.init();
    const today = this.todayStr();
    if (this.dailyDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    this.streak = this.dailyDate === yesterday ? this.streak + 1 : 1;
    if (this.streak > this.bestStreak) {
      this.bestStreak = this.streak;
      await Preferences.set({ key: BEST_STREAK_KEY, value: String(this.bestStreak) });
    }
    await Preferences.set({ key: STREAK_KEY, value: String(this.streak) });
    await Preferences.set({ key: LAST_ACTIVE_KEY, value: today });
    if (this.streak >= 7) await this.unlock('streak_7');
    if (this.streak >= 30) await this.unlock('streak_30');
  }

  async recordActivity(): Promise<void> {
    await this.init();
    const today = this.todayStr();
    if (this.dailyDate !== today) {
      this.dailyDate = today;
      this.dailyCount = 0;
    }
    this.dailyCount += 1;
    await Preferences.set({ key: DAILY_COUNT_KEY, value: String(this.dailyCount) });
    await Preferences.set({ key: DAILY_DATE_KEY, value: this.dailyDate });
    if (this.dailyCount >= 1) await this.unlock('daily_goal');
  }

  getXP(): number { return this.xp; }
  getStreak(): StreakInfo { return { current: this.streak, best: this.bestStreak }; }
  getDailyCount(): number { return this.dailyCount; }
  getBadges(): Badge[] { return this.badges; }

  currentLevel(): number { return Math.floor(Math.sqrt(this.xp / 100)); }

  getLevelInfo(): LevelInfo {
    const level = this.currentLevel();
    const nextXP = Math.pow(level + 1, 2) * 100;
    const curXP = Math.pow(level, 2) * 100;
    const progress = nextXP > curXP ? (this.xp - curXP) / (nextXP - curXP) : 1;
    return { level, currentXP: this.xp, nextLevelXP: nextXP, progress: Math.min(progress, 1) };
  }

  private todayStr(): string { return new Date().toISOString().slice(0, 10); }

  private async reconcileStreak(): Promise<void> {
    const today = this.todayStr();
    if (this.dailyDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (this.dailyDate && this.dailyDate !== yesterday) {
      this.streak = 0;
      await Preferences.set({ key: STREAK_KEY, value: '0' });
    }
  }

  private async unlock(id: string): Promise<void> {
    const b = this.badges.find(x => x.id === id);
    if (!b || b.unlocked) return;
    b.unlocked = true;
    b.unlockedAt = new Date().toISOString();
    await Preferences.set({ key: BADGES_KEY, value: JSON.stringify(this.badges) });
  }

  private async tickCount(id: string, threshold: number): Promise<void> {
    const key = `lh_tick_${id}`;
    const res = await Preferences.get({ key });
    const count = parseInt(res.value ?? '0', 10) + 1;
    await Preferences.set({ key, value: String(count) });
    if (count >= threshold) await this.unlock(id);
  }
}
