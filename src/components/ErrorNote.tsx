import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

export function ErrorNote({ text }: { text: string }) {
  return (
    <View style={styles.error}>
      <Ionicons name="alert-circle" size={18} color={theme.color.danger} />
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.color.dangerSoft,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
  },
  errorText: { flex: 1, fontFamily: theme.font.body, color: theme.color.dangerText, fontSize: 15 },
});
