import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { theme } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Bulunamadı' }} />
      <View style={styles.container}>
        <Text style={styles.text}>Bu sayfa bulunamadı.</Text>
        <Link href="/">Ana sayfaya dön</Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: { color: theme.color.fg },
});
