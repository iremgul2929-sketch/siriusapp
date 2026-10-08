import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

export function WordChip({ label, confidence }: { label: string; confidence: number }) {
  return (
    <View style={styles.chip}>
      <View style={styles.icon}>
        <Ionicons name="hand-left" size={18} color={theme.color.accentBright} />
      </View>
      <Text style={styles.word}>{label.toLocaleUpperCase('tr-TR')}</Text>
      <View style={styles.conf}>
        <Text style={styles.confText}>%{Math.round(confidence * 100)} güç</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    backgroundColor: theme.color.overlay,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.color.borderStrong,
    padding: 10,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.color.accent,
    backgroundColor: theme.color.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    flex: 1,
    fontFamily: theme.font.displayBlack,
    color: theme.color.accentBright,
    fontSize: 20,
    letterSpacing: 2,
  },
  conf: {
    backgroundColor: theme.color.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  confText: { fontFamily: theme.font.bodyBold, color: theme.color.accent, fontSize: 13 },
});
