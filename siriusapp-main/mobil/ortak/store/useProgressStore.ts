import { create } from 'zustand';

/**
 * Kullanıcı ilerlemesi. Şimdilik sadece bellekte (uygulama kapanınca sıfırlanır).
 * H11'de backend ilerleme API'sine, sonra cihaza kalıcı kayda bağlanacak.
 */
interface ProgressState {
  learned: string[];
  attempts: number;
  successes: number;
  recordAttempt: (wordId: string, success: boolean) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  learned: [],
  attempts: 0,
  successes: 0,
  recordAttempt: (wordId, success) =>
    set((s) => ({
      attempts: s.attempts + 1,
      successes: s.successes + (success ? 1 : 0),
      learned: success && !s.learned.includes(wordId) ? [...s.learned, wordId] : s.learned,
    })),
}));
