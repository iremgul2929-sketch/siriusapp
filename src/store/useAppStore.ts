import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './useAuthStore';

export const MAX_HEARTS = 5;
export const LESSON_XP = 15;
export const PERFECT_BONUS_XP = 5;
export const CHEST_XP = 20;

export const DAILY_GOALS = [
  { xp: 75, label: 'Rahat', note: 'Günde 5 ders' },
  { xp: 120, label: 'Normal', note: 'Günde 8 ders' },
  { xp: 180, label: 'Ciddi', note: 'Günde 12 ders' },
  { xp: 300, label: 'Efsane', note: 'Günde 20 ders' },
] as const;

/** Eski gunluk hedeflerin ayni seviyedeki guncel karsiligi (surume gore). */
const GOALS_V1: Record<number, number> = { 15: 75, 30: 120, 45: 180, 75: 300 };
const GOALS_V2: Record<number, number> = { 45: 75, 75: 120, 120: 180, 180: 300 };

/** Kullanici basina ilerleme ve tercihler. */
export interface Progress {
  learnedWordIds: string[];
  xp: number;
  hearts: number;
  heartsDay: string | null;
  streak: number;
  bestStreak: number;
  lastActiveDay: string | null;
  xpByDay: Record<string, number>;
  lessonsCompleted: number;
  perfectLessons: number;
  cameraWins: number;
  claimedChests: string[];
  dailyGoal: number;
  house: string | null;
  avatar: string;
  /** Isaretleri gosteren 3B egitmen (bkz. data/tutors). */
  tutorId: string;
  onboarded: boolean;
  haptics: boolean;
  /** Gunluk hatirlatma bildirimleri (bkz. utils/reminders). */
  reminders: boolean;
  /** Kamera sorulmadan acilsin mi? (bkz. components/CameraConsent) */
  cameraAlways: boolean;
}

const EMPTY: Progress = {
  learnedWordIds: [],
  xp: 0,
  hearts: MAX_HEARTS,
  heartsDay: null,
  streak: 0,
  bestStreak: 0,
  lastActiveDay: null,
  xpByDay: {},
  lessonsCompleted: 0,
  perfectLessons: 0,
  cameraWins: 0,
  claimedChests: [],
  dailyGoal: 120,
  house: null,
  avatar: '😊',
  tutorId: 'michelle',
  onboarded: false,
  haptics: true,
  reminders: false,
  cameraAlways: false,
};

export function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

interface AppState {
  byUser: Record<string, Partial<Progress>>;
  markLearned: (id: string) => void;
  completeLesson: (id: string, opts: { perfect: boolean }) => number;
  recordCameraWin: () => void;
  claimChest: (unitId: string) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  updatePrefs: (p: Partial<Pick<Progress, 'dailyGoal' | 'house' | 'avatar' | 'tutorId' | 'onboarded' | 'haptics' | 'reminders' | 'cameraAlways'>>) => void;
}

function currentKey() {
  return useAuthStore.getState().currentEmail ?? 'guest';
}

/** Gun icinde kazanilan XP'yi kaydeder ve seriyi gunceller. */
function addXp(p: Progress, xp: number): Partial<Progress> {
  const today = dayKey();
  const streak =
    p.lastActiveDay === today ? p.streak : p.lastActiveDay === dayKey(-1) ? p.streak + 1 : 1;
  return {
    xp: p.xp + xp,
    xpByDay: { ...p.xpByDay, [today]: (p.xpByDay[today] ?? 0) + xp },
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    lastActiveDay: today,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const read = (): Progress => ({ ...EMPTY, ...get().byUser[currentKey()] });
      const update = (fn: (p: Progress) => Partial<Progress>) =>
        set((s) => {
          const key = currentKey();
          const prev = { ...EMPTY, ...s.byUser[key] };
          return { byUser: { ...s.byUser, [key]: { ...prev, ...fn(prev) } } };
        });
      const learn = (p: Progress, id: string) =>
        p.learnedWordIds.includes(id) ? p.learnedWordIds : [...p.learnedWordIds, id];

      return {
        byUser: {},

        markLearned: (id) => update((p) => ({ learnedWordIds: learn(p, id) })),

        completeLesson: (id, { perfect }) => {
          const gained = LESSON_XP + (perfect ? PERFECT_BONUS_XP : 0);
          update((p) => ({
            ...addXp(p, gained),
            learnedWordIds: learn(p, id),
            lessonsCompleted: p.lessonsCompleted + 1,
            perfectLessons: p.perfectLessons + (perfect ? 1 : 0),
          }));
          return gained;
        },

        recordCameraWin: () => update((p) => ({ cameraWins: p.cameraWins + 1 })),

        claimChest: (unitId) => {
          if (read().claimedChests.includes(unitId)) return;
          update((p) => ({ ...addXp(p, CHEST_XP), claimedChests: [...p.claimedChests, unitId] }));
        },

        loseHeart: () =>
          update((p) => {
            const hearts = p.heartsDay === dayKey() ? p.hearts : MAX_HEARTS;
            return { hearts: Math.max(0, hearts - 1), heartsDay: dayKey() };
          }),

        refillHearts: () => update(() => ({ hearts: MAX_HEARTS, heartsDay: dayKey() })),

        updatePrefs: (prefs) => update(() => prefs),
      };
    },
    {
      name: 'sirius-progress',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      // v0: gunluk XP tek alanda (xpToday/xpDay) tutuluyordu -> xpByDay'e tasi.
      // v1, v2: gunluk hedefler dusuktu -> ayni seviyenin guncel degerine tasi.
      migrate: (state, version) => {
        const s = state as { byUser?: Record<string, Partial<Progress> & { xpToday?: number; xpDay?: string }> };
        if (version < 1 && s.byUser) {
          for (const p of Object.values(s.byUser)) {
            if (p.xpDay && p.xpToday) p.xpByDay = { ...p.xpByDay, [p.xpDay]: p.xpToday };
            p.bestStreak = Math.max(p.bestStreak ?? 0, p.streak ?? 0);
            p.lessonsCompleted ??= p.learnedWordIds?.length ?? 0;
            delete p.xpToday;
            delete p.xpDay;
          }
        }
        if (version < 3 && s.byUser) {
          const map = version < 2 ? GOALS_V1 : GOALS_V2;
          for (const p of Object.values(s.byUser)) {
            if (p.dailyGoal !== undefined) p.dailyGoal = map[p.dailyGoal] ?? p.dailyGoal;
          }
        }
        return s as AppState;
      },
    },
  ),
);

export interface ProgressView extends Progress {
  xpToday: number;
}

/** Giris yapmis kullanicinin ilerlemesi; gun degistiyse kalp/seri duzeltilmis halde. */
export function useProgress(): ProgressView {
  const email = useAuthStore((s) => s.currentEmail) ?? 'guest';
  const raw = useAppStore((s) => s.byUser[email]);
  return useMemo(() => {
    const p = { ...EMPTY, ...raw };
    const today = dayKey();
    return {
      ...p,
      hearts: p.heartsDay === today ? p.hearts : MAX_HEARTS,
      streak: p.lastActiveDay === today || p.lastActiveDay === dayKey(-1) ? p.streak : 0,
      xpToday: p.xpByDay[today] ?? 0,
    };
  }, [raw]);
}

/** Son 7 gunun XP'si (en eskiden bugune). */
export function lastWeek(p: Progress) {
  const names = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return Array.from({ length: 7 }, (_, i) => {
    const offset = i - 6;
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return { label: offset === 0 ? 'Bugün' : names[d.getDay()], xp: p.xpByDay[dayKey(offset)] ?? 0, today: offset === 0 };
  });
}

/** XP'ye gore seviye: her seviye bir oncekinden biraz daha fazla XP ister. */
export function levelInfo(xp: number) {
  let level = 1;
  let need = 40;
  let floor = 0;
  while (xp >= floor + need) {
    floor += need;
    level += 1;
    need = Math.round(need * 1.25);
  }
  return { level, into: xp - floor, need, pct: (xp - floor) / need };
}

export function rankFor(level: number) {
  if (level >= 10) return 'Usta';
  if (level >= 7) return 'Uzman';
  if (level >= 5) return 'Deneyimli';
  if (level >= 3) return 'Gelişen';
  return 'Yeni Başlayan';
}
