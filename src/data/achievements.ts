import type { Progress } from '@/store/useAppStore';
import { dictionary, categories } from './dictionary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  /** 0..1 arasi ilerleme; 1 = kazanildi. */
  progress: (p: Progress) => number;
}

const ratio = (v: number, target: number) => Math.min(v / target, 1);

export const achievements: Achievement[] = [
  {
    id: 'first-spell',
    title: 'İlk İşaret',
    description: 'İlk dersini tamamla',
    icon: 'sparkles',
    color: '#E0A422',
    // Eski hesaplarda ders sayaci yoktu; ogrenilen isaret de ilk dersi kanitlar.
    progress: (p) => ratio(Math.max(p.lessonsCompleted, p.learnedWordIds.length), 1),
  },
  {
    id: 'wand-master',
    title: 'Kamera Ustası',
    description: 'Kamerada 5 işareti doğru yap',
    icon: 'videocam',
    color: '#1FA8B5',
    progress: (p) => ratio(p.cameraWins, 5),
  },
  {
    id: 'flawless',
    title: 'Kusursuz',
    description: '3 dersi hiç hata yapmadan bitir',
    icon: 'diamond',
    color: '#8B5CF6',
    progress: (p) => ratio(p.perfectLessons, 3),
  },
  {
    id: 'on-fire',
    title: 'Alev Alev',
    description: '3 günlük seriye ulaş',
    icon: 'flame',
    color: '#E8A33D',
    progress: (p) => ratio(p.bestStreak, 3),
  },
  {
    id: 'week-streak',
    title: 'Seri Ustası',
    description: '7 günlük seriye ulaş',
    icon: 'bonfire',
    color: '#E85D5D',
    progress: (p) => ratio(p.bestStreak, 7),
  },
  {
    id: 'scholar',
    title: 'Bilgin',
    description: '100 XP topla',
    icon: 'school',
    color: '#3DAE6B',
    progress: (p) => ratio(p.xp, 100),
  },
  {
    id: 'first-unit',
    title: 'Bölüm Fatihi',
    description: 'Bir bölümün tüm işaretlerini öğren',
    icon: 'ribbon',
    color: '#4A7BD0',
    progress: (p) =>
      Math.max(
        ...categories.map((c) => {
          const words = dictionary.filter((w) => w.categoryId === c.id);
          return words.filter((w) => p.learnedWordIds.includes(w.id)).length / words.length;
        }),
      ),
  },
  {
    id: 'archmage',
    title: 'Sözlük Tamam',
    description: 'Tüm işaretleri öğren',
    icon: 'trophy',
    color: '#C9972B',
    progress: (p) => ratio(p.learnedWordIds.length, dictionary.length),
  },
];

export function unlockedIds(p: Progress) {
  return achievements.filter((a) => a.progress(p) >= 1).map((a) => a.id);
}
