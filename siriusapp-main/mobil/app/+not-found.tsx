import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-ink">
      <Stack.Screen options={{ title: 'Bulunamadı' }} />
      <Text className="text-fg">Bu sayfa bulunamadı.</Text>
      <Link href="/" className="text-accent">
        Ana sayfaya dön
      </Link>
    </View>
  );
}
