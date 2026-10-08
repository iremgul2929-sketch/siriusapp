import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Barlow_400Regular,
  Barlow_400Regular_Italic,
  Barlow_700Bold,
  Barlow_800ExtraBold,
  Barlow_600SemiBold,
} from '@expo-google-fonts/barlow';
import { theme } from '@/constants/theme';
import { useAuthStore, useCurrentUser } from '@/store/useAuthStore';
import { useAppStore, useProgress } from '@/store/useAppStore';
import { dictionary } from '@/data/dictionary';
import { syncReminders } from '@/utils/reminders';

SplashScreen.preventAutoHideAsync();

/** Kalici store'lar diskten okunana kadar bekler. */
function useStoresHydrated() {
  const check = () => useAuthStore.persist.hasHydrated() && useAppStore.persist.hasHydrated();
  const [hydrated, setHydrated] = useState(check);
  useEffect(() => {
    const done = () => setHydrated(check());
    const subs = [
      useAuthStore.persist.onFinishHydration(done),
      useAppStore.persist.onFinishHydration(done),
    ];
    done();
    return () => subs.forEach((unsub) => unsub());
  }, []);
  return hydrated;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Barlow_400Regular,
    Barlow_400Regular_Italic,
    Barlow_700Bold,
    Barlow_800ExtraBold,
    Barlow_600SemiBold,
  });
  const hydrated = useStoresHydrated();
  const isLoggedIn = useAuthStore((s) => s.currentEmail !== null);
  const userName = useCurrentUser()?.name;
  const progress = useProgress();
  const onboarded = progress.onboarded;
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Hatirlatma bildirimlerini guncel ilerlemeye gore yeniden kur.
  const remindersOn = isLoggedIn && progress.reminders;
  const doneToday = progress.xpToday > 0;
  const nextWord = dictionary.find((w) => !progress.learnedWordIds.includes(w.id))?.title ?? null;
  useEffect(() => {
    if (!ready) return;
    syncReminders(remindersOn, {
      name: userName ?? 'dostum',
      streak: progress.streak,
      doneToday,
      nextWord,
    });
  }, [ready, remindersOn, userName, progress.streak, doneToday, nextWord]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.color.bg },
          headerTintColor: theme.color.accent,
          headerTitleStyle: { fontFamily: theme.font.display, color: theme.color.fg },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.color.bg },
        }}
      >
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={isLoggedIn && !onboarded}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={isLoggedIn && onboarded}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="camera" options={{ title: 'Kamera Pratiği' }} />
          <Stack.Screen name="translate" options={{ title: 'Çeviri' }} />
          <Stack.Screen name="learn" options={{ headerShown: false }} />
          <Stack.Screen
            name="lesson/[word]"
            options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }}
          />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
