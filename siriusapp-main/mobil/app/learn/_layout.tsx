import { Stack } from 'expo-router';

import { colors } from '@ortak/theme';

export default function LearnLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.fg,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.ink },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Sözlük' }} />
      <Stack.Screen name="[word]" options={{ title: '' }} />
    </Stack>
  );
}
