import type { ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { StarField } from './StarField';
import { Ornament } from './Ornament';

/** Giris ve kayit ekranlarinin ortak cercevesi: isiltili arka plan + logo + baslik. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.color.bgTop, theme.color.bg, theme.color.bgDeep]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <StarField />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.crest}>
              <Ionicons name="hand-left" size={56} color={theme.color.neon} />
            </View>
            <Text style={styles.brand}>SİRİUS</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.ornament}>
              <Ornament />
            </View>
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  safe: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: theme.space.xl, paddingBottom: 40 },
  crest: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.color.dark,
    borderWidth: 4,
    borderColor: theme.color.neon,
    marginBottom: theme.space.sm,
  },
  brand: {
    alignSelf: 'center',
    fontFamily: theme.font.displayBlack,
    color: theme.color.accentBright,
    fontSize: 34,
    letterSpacing: 6,
    textShadowColor: 'rgba(255,220,133,0.6)',
    textShadowRadius: 18,
  },
  title: {
    alignSelf: 'center',
    fontFamily: theme.font.display,
    color: theme.color.fg,
    fontSize: 18,
    marginTop: theme.space.md,
  },
  subtitle: {
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: theme.font.italic,
    color: theme.color.fgDim,
    fontSize: 16,
    marginTop: 2,
  },
  ornament: { width: '60%', alignSelf: 'center', marginVertical: theme.space.xl },
});
