import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

/**
 * Cihaz-ici (yerel) hesap sistemi. Sunucu yok: kullanicilar AsyncStorage'da
 * tutulur, sifreler tuzlanip SHA-256 ile ozetlenir. Gercek bir backend
 * eklendiginde register/login govdeleri API cagrilariyla degistirilmeli.
 */

interface StoredUser {
  name: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: string;
}

export interface User {
  name: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  users: Record<string, StoredUser>;
  currentEmail: string | null;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  updateName: (name: string) => string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hashPassword(salt: string, password: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: {},
      currentEmail: null,

      register: async (name, email, password) => {
        const key = email.trim().toLowerCase();
        if (name.trim().length < 2) return 'Adın en az 2 harf olmalı.';
        if (!EMAIL_RE.test(key)) return 'Geçerli bir e-posta adresi gir.';
        if (password.length < 6) return 'Şifre en az 6 karakter olmalı.';
        if (get().users[key]) return 'Bu e-posta ile zaten bir hesap var.';

        const salt = toHex(Crypto.getRandomBytes(16));
        const hash = await hashPassword(salt, password);
        set((s) => ({
          users: {
            ...s.users,
            [key]: { name: name.trim(), email: key, salt, hash, createdAt: new Date().toISOString() },
          },
          currentEmail: key,
        }));
        return null;
      },

      login: async (email, password) => {
        const key = email.trim().toLowerCase();
        const user = get().users[key];
        if (!user) return 'E-posta veya şifre hatalı.';
        const hash = await hashPassword(user.salt, password);
        if (hash !== user.hash) return 'E-posta veya şifre hatalı.';
        set({ currentEmail: key });
        return null;
      },

      logout: () => set({ currentEmail: null }),

      updateName: (name) => {
        const key = get().currentEmail;
        if (!key) return 'Giriş yapılmamış.';
        if (name.trim().length < 2) return 'Adın en az 2 harf olmalı.';
        set((s) => ({ users: { ...s.users, [key]: { ...s.users[key], name: name.trim() } } }));
        return null;
      },
    }),
    {
      name: 'sirius-auth',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useCurrentUser(): User | null {
  // Store'daki nesnenin kendisini sec (sabit referans); yeni nesne uretmek
  // zustand v5'te sonsuz yeniden cizime yol acar.
  const stored = useAuthStore((s) => (s.currentEmail ? s.users[s.currentEmail] : undefined));
  return useMemo(
    () => (stored ? { name: stored.name, email: stored.email, createdAt: stored.createdAt } : null),
    [stored],
  );
}
