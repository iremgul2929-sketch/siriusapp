import { View, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export function ScanCorners() {
  return (
    <View style={styles.frame} pointerEvents="none">
      <View style={[styles.corner, styles.tl]} />
      <View style={[styles.corner, styles.tr]} />
      <View style={[styles.corner, styles.bl]} />
      <View style={[styles.corner, styles.br]} />
    </View>
  );
}

const SIZE = 22;
const styles = StyleSheet.create({
  frame: { position: 'absolute', top: '20%', left: '10%', right: '10%', bottom: '30%' },
  corner: { position: 'absolute', width: SIZE, height: SIZE, borderColor: theme.color.accent },
  tl: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
});
