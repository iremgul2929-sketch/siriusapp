// Ortak dosya (K3 + K4): gezinme ve veri sağlayıcı. Yeni ekran eklerken buraya bir satır eklenir.
import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { colors } from '@ortak/theme';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.ink },
          headerTintColor: colors.fg,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.ink },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Sirius' }} />
        <Stack.Screen name="camera" options={{ title: 'Canlı Tanıma' }} />
        <Stack.Screen name="profile" options={{ title: 'İlerleme' }} />
        <Stack.Screen name="learn" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
