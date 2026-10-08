import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

/** Basliklarin altina giden altin cizgi + yildiz susu. */
export function Ornament({ color = theme.color.accent }: { color?: string }) {
  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: color }]} />
      <View style={[styles.gem, { backgroundColor: color }]} />
      <Ionicons name="star" size={12} color={color} />
      <View style={[styles.gem, { backgroundColor: color }]} />
      <View style={[styles.line, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flex: 1, height: 1, opacity: 0.5 },
  gem: { width: 5, height: 5, opacity: 0.8, transform: [{ rotate: '45deg' }] },
});
