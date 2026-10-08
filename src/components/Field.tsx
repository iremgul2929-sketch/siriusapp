import { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

/** Etiketli, ikonlu metin kutusu. `secure` verilirse goster/gizle dugmesi eklenir. */
export function Field({
  label,
  icon,
  secure,
  ...props
}: TextInputProps & { label: string; icon: string; secure?: boolean }) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, focused && styles.boxFocused]}>
        <Ionicons
          name={icon as never}
          size={18}
          color={focused ? theme.color.accent : theme.color.fgMuted}
        />
        <TextInput
          {...props}
          secureTextEntry={secure && hidden}
          placeholderTextColor={theme.color.fgMuted}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={styles.input}
        />
        {secure && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={theme.color.fgMuted}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontFamily: theme.font.display, color: theme.color.fgDim, fontSize: 12, letterSpacing: 1 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.color.panel,
    borderWidth: 2,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
  },
  boxFocused: { borderColor: theme.color.accent },
  input: {
    flex: 1,
    fontFamily: theme.font.body,
    fontSize: 17,
    color: theme.color.fg,
    paddingVertical: 13,
    outlineStyle: 'none',
  } as object,
});
