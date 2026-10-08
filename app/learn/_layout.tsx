import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';

export default function LearnLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.color.bg },
        headerTintColor: theme.color.accent,
        headerTitleStyle: { fontFamily: theme.font.display, color: theme.color.fg },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.color.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Sözlük' }} />
      <Stack.Screen name="[word]" options={{ title: '' }} />
    </Stack>
  );
}
