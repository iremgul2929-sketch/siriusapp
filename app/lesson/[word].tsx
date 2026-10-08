import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, categoryStyle, defaultCategoryStyle } from '@/constants/theme';
import { dictionary, type DictionaryWord } from '@/data/dictionary';
import { useAppStore, useProgress } from '@/store/useAppStore';
import { HandDemo } from '@/components/HandDemo';
import { Button3D } from '@/components/Button3D';
import { StarField } from '@/components/StarField';
import { Confetti } from '@/components/Confetti';
import { achievements, unlockedIds } from '@/data/achievements';
import { feedback } from '@/utils/feedback';
import { SignPractice, type PracticeResult } from '@/components/SignPractice';

type Step = 'intro' | 'practice' | 'whichWord' | 'whichSign' | 'done';
const QUIZ_STEPS: Step[] = ['intro', 'practice', 'whichWord', 'whichSign'];

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LessonScreen() {
  const { word: wordId } = useLocalSearchParams<{ word: string }>();
  const router = useRouter();
  const word = dictionary.find((w) => w.id === wordId);
  const progress = useProgress();
  const completeLesson = useAppStore((s) => s.completeLesson);
  const loseHeart = useAppStore((s) => s.loseHeart);
  const refillHearts = useAppStore((s) => s.refillHearts);
  const recordCameraWin = useAppStore((s) => s.recordCameraWin);
  const [gained, setGained] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const badgesBefore = useRef(unlockedIds(progress));

  const [step, setStep] = useState<Step>('intro');
  const [choice, setChoice] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [practice, setPractice] = useState<PracticeResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Celdiriciler: once ayni kategoriden, yetmezse digerlerinden.
  const { wordOptions, signOptions } = useMemo(() => {
    if (!word) return { wordOptions: [], signOptions: [] };
    const others = shuffle(dictionary.filter((w) => w.id !== word.id)).sort(
      (a, b) => Number(b.categoryId === word.categoryId) - Number(a.categoryId === word.categoryId),
    );
    return {
      wordOptions: shuffle([word, ...others.slice(0, 3)]),
      signOptions: shuffle([word, others[0]]),
    };
  }, [word]);

  // Ders bitince yeni kazanilan rozetleri bul.
  useEffect(() => {
    if (step !== 'done') return;
    const now = unlockedIds(progress);
    setNewBadges(now.filter((id) => !badgesBefore.current.includes(id)));
    feedback.success();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, progress.lessonsCompleted]);

  const onPractice = (r: PracticeResult) => {
    setPractice(r);
    if (r.status === 'success') {
      feedback.success();
      recordCameraWin();
    } else {
      feedback.error();
    }
  };

  if (!word) return <Redirect href="/" />;

  const color = (categoryStyle[word.categoryId] ?? defaultCategoryStyle).color;
  const stepIndex = step === 'done' ? QUIZ_STEPS.length : QUIZ_STEPS.indexOf(step);
  const correct = choice === word.id;
  const outOfHearts = progress.hearts <= 0 && step !== 'done';

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const check = () => {
    setChecked(true);
    if (choice !== word.id) {
      feedback.error();
      setMistakes((m) => m + 1);
      loseHeart();
    } else {
      feedback.success();
    }
  };

  const next = () => {
    setChoice(null);
    setChecked(false);
    setPractice(null);
    if (step === 'intro') setStep('practice');
    else if (step === 'practice') setStep('whichWord');
    else if (step === 'whichWord') setStep('whichSign');
    else if (step === 'whichSign') {
      setGained(completeLesson(word.id, { perfect: mistakes === 0 }));
      setStep('done');
    }
  };

  if (outOfHearts) {
    return (
      <LessonFrame>
        <View style={styles.center}>
          <Ionicons name="heart-dislike" size={72} color={theme.color.heart} />
          <Text style={styles.bigTitle}>Kalbin kalmadı!</Text>
          <Text style={styles.lead}>
            Yarın kalplerin yeniden dolacak — ya da şimdi yenileyip hemen devam et.
          </Text>
        </View>
        <View style={styles.footer}>
          <Button3D
            title="KALPLERİ YENİLE (+5)"
            variant="danger"
            icon={<Ionicons name="heart" size={18} color="#FFF" />}
            onPress={refillHearts}
          />
          <Button3D title="YOLA DÖN" variant="ghost" onPress={close} style={{ marginTop: 10 }} />
        </View>
      </LessonFrame>
    );
  }

  if (step === 'done') {
    const perfect = mistakes === 0;
    const badgeList = achievements.filter((a) => newBadges.includes(a.id));
    return (
      <LessonFrame>
        <Confetti />
        <View style={styles.center}>
          <View style={styles.trophy}>
            <Ionicons name={perfect ? 'diamond' : 'trophy'} size={60} color={theme.color.accentBright} />
          </View>
          <Text style={styles.bigTitle}>{perfect ? 'Kusursuz ders!' : 'Ders tamamlandı!'}</Text>
          <Text style={styles.lead}>“{word.title}” işareti artık sözlüğünde.</Text>
          <View style={styles.rewards}>
            <Reward icon="sparkles" color={theme.color.accentBright} label="XP" value={<CountUp to={gained} prefix="+" />} />
            <Reward icon="flame" color={theme.color.amber} label="Seri" value={`${progress.streak}`} />
            <Reward
              icon="ribbon"
              color={theme.color.success}
              label="Doğruluk"
              value={`%${Math.round((2 / (2 + mistakes)) * 100)}`}
            />
          </View>
          {perfect && <Text style={styles.bonus}>Hatasız bitirdiğin için +5 XP bonus!</Text>}
          {badgeList.map((b) => (
            <View key={b.id} style={[styles.newBadge, { borderColor: b.color }]}>
              <View style={[styles.newBadgeIcon, { backgroundColor: b.color + '30' }]}>
                <Ionicons name={b.icon as never} size={24} color={b.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.newBadgeKicker, { color: b.color }]}>YENİ ROZET</Text>
                <Text style={styles.newBadgeTitle}>{b.title}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Button3D title="DEVAM" variant="success" onPress={close} />
        </View>
      </LessonFrame>
    );
  }

  return (
    <LessonFrame>
      {/* Ust: kapat + ilerleme + kalpler */}
      <View style={styles.header}>
        <Pressable onPress={close} hitSlop={10}>
          <Ionicons name="close" size={28} color={theme.color.fgDim} />
        </Pressable>
        <View style={styles.progress}>
          <View
            style={[styles.progressFill, { width: `${(stepIndex / QUIZ_STEPS.length) * 100}%` }]}
          />
        </View>
        <View style={styles.hearts}>
          <Ionicons name="heart" size={22} color={theme.color.heart} />
          <Text style={styles.heartsText}>{progress.hearts}</Text>
        </View>
      </View>

      {step === 'practice' ? (
        <View style={styles.practiceBody}>
          <SignPractice
            wordId={word.id}
            title={word.title}
            color={color}
            attempt={attempt}
            onResult={onPractice}
            onUnavailable={next}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          {step === 'intro' && (
            <>
              <View style={styles.kicker}>
                <Ionicons name="sparkles" size={14} color={theme.color.accentBright} />
                <Text style={styles.kickerText}>YENİ İŞARET</Text>
              </View>
              <Text style={styles.wordTitle}>{word.title}</Text>
              <Text style={styles.prompt}>Hareketi dikkatle izle ve elinle taklit et.</Text>
              <DemoCard wordId={word.id} color={color} />
            </>
          )}

          {step === 'whichWord' && (
            <>
              <Text style={styles.question}>Bu hangi işaret?</Text>
              <DemoCard wordId={word.id} color={color} small />
              <View style={styles.options}>
                {wordOptions.map((o) => (
                  <OptionButton
                    key={o.id}
                    label={o.title}
                    selected={choice === o.id}
                    state={
                      checked
                        ? o.id === word.id
                          ? 'right'
                          : choice === o.id
                            ? 'wrong'
                            : 'idle'
                        : 'idle'
                    }
                    disabled={checked}
                    onPress={() => setChoice(o.id)}
                  />
                ))}
              </View>
            </>
          )}

          {step === 'whichSign' && (
            <>
              <Text style={styles.question}>“{word.title}” işareti hangisi?</Text>
              <View style={styles.signGrid}>
                {signOptions.map((o: DictionaryWord) => {
                  const state = checked
                    ? o.id === word.id
                      ? 'right'
                      : choice === o.id
                        ? 'wrong'
                        : 'idle'
                    : 'idle';
                  return (
                    <Pressable
                      key={o.id}
                      disabled={checked}
                      onPress={() => setChoice(o.id)}
                      style={StyleSheet.flatten([
                        styles.signCard,
                        choice === o.id && styles.optionSelected,
                        state === 'right' && styles.optionRight,
                        state === 'wrong' && styles.optionWrong,
                      ])}
                    >
                      <HandDemo wordId={o.id} color={color} showLabel={false} />
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* Alt: kontrol / geri bildirim */}
      {step === 'practice' ? (
        practice?.status === 'success' ? (
          <View style={[styles.feedback, styles.feedbackRight]}>
            <View style={styles.feedbackHead}>
              <Ionicons name="checkmark-circle" size={30} color={theme.color.success} />
              <Text style={[styles.feedbackTitle, { color: theme.color.success }]}>
                Mükemmel! İşareti doğru yaptın ✨
              </Text>
            </View>
            <Button3D title="DEVAM" variant="success" onPress={next} />
          </View>
        ) : practice?.status === 'fail' ? (
          <View style={[styles.feedback, styles.feedbackWrong]}>
            <View style={styles.feedbackHead}>
              <Ionicons name="close-circle" size={30} color={theme.color.danger} />
              <Text style={[styles.feedbackTitle, { color: theme.color.danger }]}>
                Yanlış hareket
              </Text>
            </View>
            {practice.hint && <Text style={styles.feedbackText}>{practice.hint}</Text>}
            <Button3D
              title="BAŞTAN DENE"
              variant="danger"
              icon={<Ionicons name="refresh" size={18} color="#FFF" />}
              onPress={() => {
                setPractice(null);
                setAttempt((a) => a + 1);
              }}
            />
            <Pressable onPress={next} hitSlop={8} style={styles.skip}>
              <Text style={styles.skipText}>Şimdilik atla</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.footer}>
            <Button3D title="ŞU AN YAPAMIYORUM" variant="ghost" onPress={next} />
          </View>
        )
      ) : step === 'intro' ? (
        <View style={styles.footer}>
          <Button3D title="DEVAM" onPress={next} />
        </View>
      ) : checked ? (
        <View style={[styles.feedback, correct ? styles.feedbackRight : styles.feedbackWrong]}>
          <View style={styles.feedbackHead}>
            <Ionicons
              name={correct ? 'checkmark-circle' : 'close-circle'}
              size={30}
              color={correct ? theme.color.success : theme.color.danger}
            />
            <Text
              style={[
                styles.feedbackTitle,
                { color: correct ? theme.color.success : theme.color.danger },
              ]}
            >
              {correct ? 'Harika! Doğru cevap ✨' : 'Yanlış cevap'}
            </Text>
          </View>
          {!correct && <Text style={styles.feedbackText}>Doğru cevap: {word.title}</Text>}
          <Button3D title="DEVAM" variant={correct ? 'success' : 'danger'} onPress={next} />
        </View>
      ) : (
        <View style={styles.footer}>
          <Button3D title="KONTROL ET" variant="success" disabled={!choice} onPress={check} />
        </View>
      )}
    </LessonFrame>
  );
}

/** Sayiyi 0'dan hedefe dogru sayarak gosterir. */
function CountUp({ to, prefix = '' }: { to: number; prefix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min((Date.now() - start) / 700, 1);
      setN(Math.round(to * t));
      if (t >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [to]);
  return (
    <>
      {prefix}
      {n}
    </>
  );
}

function LessonFrame({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <StarField />
      <SafeAreaView style={styles.safe}>{children}</SafeAreaView>
    </View>
  );
}

function DemoCard({ wordId, color, small }: { wordId: string; color: string; small?: boolean }) {
  return (
    <View style={[styles.demo, small && styles.demoSmall]}>
      <HandDemo wordId={wordId} color={color} />
    </View>
  );
}

function OptionButton({
  label,
  selected,
  state,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  state: 'idle' | 'right' | 'wrong';
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={StyleSheet.flatten([
        styles.option,
        selected && styles.optionSelected,
        state === 'right' && styles.optionRight,
        state === 'wrong' && styles.optionWrong,
      ])}
    >
      <Text
        style={[
          styles.optionText,
          selected && { color: theme.color.accentBright },
          state === 'right' && { color: theme.color.success },
          state === 'wrong' && { color: theme.color.danger },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Reward({
  icon,
  color,
  label,
  value,
}: {
  icon: string;
  color: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View style={[styles.reward, { borderColor: color }]}>
      <Text style={[styles.rewardLabel, { backgroundColor: color }]}>{label}</Text>
      <View style={styles.rewardBody}>
        <Ionicons name={icon as never} size={18} color={color} />
        <Text style={[styles.rewardValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    paddingHorizontal: theme.space.xl,
    paddingVertical: theme.space.md,
  },
  progress: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.color.locked,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 8, backgroundColor: theme.color.success },
  hearts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartsText: { fontFamily: theme.font.display, color: theme.color.heart, fontSize: 17 },
  body: { padding: theme.space.xl, paddingTop: theme.space.lg },
  practiceBody: { flex: 1, paddingHorizontal: theme.space.xl, paddingBottom: theme.space.md },
  skip: { alignSelf: 'center', paddingVertical: 4 },
  skipText: { fontFamily: theme.font.bodyBold, color: theme.color.fgDim, fontSize: 15 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kickerText: {
    fontFamily: theme.font.display,
    color: theme.color.accentBright,
    fontSize: 13,
    letterSpacing: 2,
  },
  wordTitle: {
    fontFamily: theme.font.displayBlack,
    color: theme.color.fg,
    fontSize: 36,
    marginTop: 4,
  },
  prompt: {
    fontFamily: theme.font.italic,
    color: theme.color.fgDim,
    fontSize: 17,
    marginBottom: theme.space.lg,
  },
  question: {
    fontFamily: theme.font.display,
    color: theme.color.fg,
    fontSize: 22,
    marginBottom: theme.space.lg,
  },
  demo: {
    alignSelf: 'center',
    width: '90%',
    maxWidth: 340,
    backgroundColor: theme.color.bgDeep,
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
    borderColor: theme.color.borderStrong,
    overflow: 'hidden',
  },
  demoSmall: { width: '62%', maxWidth: 240, marginBottom: theme.space.xl },
  options: { gap: theme.space.md },
  option: {
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: theme.color.locked,
    backgroundColor: theme.color.panel,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  optionSelected: { borderColor: theme.color.accent, backgroundColor: theme.color.accentSoft },
  optionRight: { borderColor: theme.color.success, backgroundColor: theme.color.successSoft },
  optionWrong: { borderColor: theme.color.danger, backgroundColor: theme.color.dangerSoft },
  optionText: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 17 },
  signGrid: { flexDirection: 'row', gap: theme.space.md },
  signCard: {
    flex: 1,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: theme.color.locked,
    backgroundColor: theme.color.bgDeep,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  footer: {
    padding: theme.space.xl,
    paddingTop: theme.space.md,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
  },
  feedback: { padding: theme.space.xl, paddingTop: theme.space.lg, gap: theme.space.sm },
  feedbackRight: { backgroundColor: theme.color.successBg },
  feedbackWrong: { backgroundColor: theme.color.dangerBg },
  feedbackHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedbackTitle: { fontFamily: theme.font.display, fontSize: 19 },
  feedbackText: { fontFamily: theme.font.body, color: theme.color.dangerText, fontSize: 17 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space.xl,
    gap: theme.space.md,
  },
  trophy: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.color.accentSoft,
    borderWidth: 2,
    borderColor: theme.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.space.sm,
  },
  bigTitle: {
    fontFamily: theme.font.displayBlack,
    color: theme.color.accentBright,
    fontSize: 28,
    textAlign: 'center',
  },
  lead: {
    fontFamily: theme.font.body,
    color: theme.color.fgDim,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  bonus: { fontFamily: theme.font.italic, color: theme.color.accentBright, fontSize: 16 },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    alignSelf: 'stretch',
    borderWidth: 2,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.color.panel,
    padding: theme.space.md,
  },
  newBadgeIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  newBadgeKicker: { fontFamily: theme.font.display, fontSize: 11, letterSpacing: 2 },
  newBadgeTitle: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 17 },
  rewards: { flexDirection: 'row', gap: theme.space.md, marginTop: theme.space.lg },
  reward: { borderWidth: 2, borderRadius: theme.radius.md, overflow: 'hidden', minWidth: 92 },
  rewardLabel: {
    fontFamily: theme.font.display,
    color: theme.color.bgDeep,
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 3,
    letterSpacing: 1,
  },
  rewardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  rewardValue: { fontFamily: theme.font.display, fontSize: 18 },
});
