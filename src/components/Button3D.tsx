import { useState, type ReactNode } from 'react';
import { Pressable, Text, View, StyleSheet, type ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';
import { feedback } from '@/utils/feedback';

type Variant = 'gold' | 'success' | 'danger' | 'ghost';

const COLORS: Record<Variant, { face: string; edge: string; text: string; border?: string }> = {
  gold: { face: theme.color.accent, edge: theme.color.accentDeep, text: theme.color.onAccent },
  success: { face: theme.color.success, edge: theme.color.successDark, text: theme.color.onAccent },
  danger: { face: theme.color.danger, edge: theme.color.dangerDark, text: '#FFFFFF' },
  ghost: {
    face: theme.color.panel,
    edge: theme.color.bgDeep,
    text: theme.color.fg,
    border: theme.color.border,
  },
};

const EDGE = 5;

/** Duolingo tarzi "tombul" buton: alt kenarda koyu bir golge, basinca iner. */
export function Button3D({
  title,
  onPress,
  variant = 'gold',
  disabled,
  icon,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
}) {
  const [pressed, setPressed] = useState(false);
  const c = disabled
    ? { face: theme.color.locked, edge: theme.color.lockedDark, text: theme.color.fgMuted }
    : COLORS[variant];
  const down = pressed && !disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        setPressed(true);
        feedback.tap();
      }}
      onPressOut={() => setPressed(false)}
      style={[styles.shell, { backgroundColor: c.edge }, style]}
    >
      <View
        style={[
          styles.face,
          { backgroundColor: c.face, transform: [{ translateY: down ? 0 : -EDGE }] },
          'border' in c && c.border ? { borderWidth: 1.5, borderColor: c.border } : null,
        ]}
      >
        {icon}
        <Text style={[styles.text, { color: c.text }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: { borderRadius: theme.radius.lg, marginTop: EDGE },
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: theme.radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  text: { fontFamily: theme.font.display, fontSize: 16, letterSpacing: 1.5 },
});
