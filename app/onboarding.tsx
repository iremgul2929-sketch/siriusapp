import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { houses, avatars } from '@/data/houses';
import { useAppStore, DAILY_GOALS } from '@/store/useAppStore';
import { useCurrentUser } from '@/store/useAuthStore';
import { Button3D } from '@/components/Button3D';
import { StarField } from '@/components/StarField';
import { feedback } from '@/utils/feedback';

const STEPS = ['house', 'avatar', 'goal'] as const;

/** Kayittan sonra: bina, avatar ve gunluk hedef secimi. */
export default function OnboardingScreen() {
  const user = useCurrentUser();
  const updatePrefs = useAppStore((s) => s.updatePrefs);
  const [step, setStep] = useState(0);
  const [house, setHouse] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(avatars[0]);
  const [goal, setGoal] = useState(120);

  const current = STEPS[step];
  const canContinue = current !== 'house' || house !== null;

  const next = () => {
    feedback.tap();
    if (step < STEPS.length - 1) setStep(step + 1);
    else updatePrefs({ house, avatar, dailyGoal: goal, onboarded: true });
  };

  return (
    <View style={styles.root}>
      <StarField />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          {step > 0 ? (
            <Pressable onPress={() => setStep(step - 1)} hitSlop={10}>
              <Ionicons name="arrow-back" size={26} color={theme.color.fgDim} />
            </Pressable>
          ) : (
            <View style={{ width: 26 }} />
          )}
          <View style={styles.progress}>
            <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.owl}>
            <Text style={styles.owlEmoji}>🦉</Text>
            <View style={styles.speech}>
              <Text style={styles.speechText}>
                {current === 'house' && `Hoş geldin ${user?.name ?? ''}! Önce bir takım seç.`}
                {current === 'avatar' && 'Harika seçim! Şimdi seni temsil edecek bir simge seç.'}
                {current === 'goal' && 'Son olarak: her gün ne kadar çalışmak istersin?'}
              </Text>
            </View>
          </View>

          {current === 'house' && (
            <View style={styles.list}>
              {houses.map((h) => {
                const active = house === h.id;
                return (
                  <Pressable
                    key={h.id}
                    onPress={() => {
                      feedback.select();
                      setHouse(h.id);
                    }}
                    style={StyleSheet.flatten([styles.option, active && { borderColor: h.color, backgroundColor: h.color + '22' }])}
                  >
                    <View style={[styles.houseIcon, { backgroundColor: h.color }]}>
                      <Ionicons name={h.icon as never} size={24} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>{h.name}</Text>
                      <Text style={styles.optionNote}>{h.trait}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={24} color={h.color} />}
                  </Pressable>
                );
              })}
            </View>
          )}

          {current === 'avatar' && (
            <View style={styles.avatarGrid}>
              {avatars.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => {
                    feedback.select();
                    setAvatar(a);
                  }}
                  style={StyleSheet.flatten([styles.avatar, avatar === a && styles.avatarActive])}
                >
                  <Text style={styles.avatarEmoji}>{a}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {current === 'goal' && (
            <View style={styles.list}>
              {DAILY_GOALS.map((g) => {
                const active = goal === g.xp;
                return (
                  <Pressable
                    key={g.xp}
                    onPress={() => {
                      feedback.select();
                      setGoal(g.xp);
                    }}
                    style={StyleSheet.flatten([styles.option, active && styles.optionActive])}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>{g.label}</Text>
                      <Text style={styles.optionNote}>{g.note}</Text>
                    </View>
                    <Text style={[styles.goalXp, active && { color: theme.color.accentBright }]}>{g.xp} XP</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button3D
            title={step === STEPS.length - 1 ? 'MACERAYA BAŞLA' : 'DEVAM'}
            variant={step === STEPS.length - 1 ? 'success' : 'gold'}
            disabled={!canContinue}
            onPress={next}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.space.lg, padding: theme.space.xl, paddingBottom: 0 },
  progress: { flex: 1, height: 14, borderRadius: 7, backgroundColor: theme.color.locked, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7, backgroundColor: theme.color.accent },
  body: { padding: theme.space.xl },
  owl: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.space.md, marginBottom: theme.space.xl },
  owlEmoji: { fontSize: 64 },
  speech: {
    flex: 1,
    backgroundColor: theme.color.panelRaised,
    borderWidth: 2,
    borderColor: theme.color.border,
    borderRadius: theme.radius.lg,
    borderBottomLeftRadius: 4,
    padding: theme.space.lg,
  },
  speechText: { fontFamily: theme.font.body, color: theme.color.fg, fontSize: 18, lineHeight: 24 },
  list: { gap: theme.space.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: theme.color.locked,
    backgroundColor: theme.color.panel,
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
  },
  optionActive: { borderColor: theme.color.accent, backgroundColor: theme.color.accentSoft },
  houseIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 17 },
  optionNote: { fontFamily: theme.font.italic, color: theme.color.fgDim, fontSize: 15 },
  goalXp: { fontFamily: theme.font.display, color: theme.color.fgDim, fontSize: 16 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.md, justifyContent: 'center' },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: theme.color.locked,
    backgroundColor: theme.color.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActive: { borderColor: theme.color.accent, backgroundColor: theme.color.accentSoft },
  avatarEmoji: { fontSize: 36 },
  footer: { padding: theme.space.xl, borderTopWidth: 1, borderTopColor: theme.color.border },
});
