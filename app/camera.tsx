import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, categoryStyle, defaultCategoryStyle } from '@/constants/theme';
import { dictionary } from '@/data/dictionary';
import { useAppStore, useProgress } from '@/store/useAppStore';
import { SignPractice, type PracticeResult } from '@/components/SignPractice';
import { Button3D } from '@/components/Button3D';
import { feedback } from '@/utils/feedback';
import { searchKey } from '@/utils/format';

/** Kamera pratigi: istedigin isareti ara ya da sec, kamerada yap, Sirius dogrulasin. */
export default function CameraScreen() {
  const [wordId, setWordId] = useState(dictionary[0].id);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const markLearned = useAppStore((s) => s.markLearned);
  const recordCameraWin = useAppStore((s) => s.recordCameraWin);

  const [query, setQuery] = useState('');
  const [wins, setWins] = useState(0);
  const learned = useProgress().learnedWordIds;

  const q = searchKey(query);
  const words = q ? dictionary.filter((w) => searchKey(w.title).includes(q)) : dictionary;
  const word = dictionary.find((w) => w.id === wordId) ?? dictionary[0];
  const color = (categoryStyle[word.categoryId] ?? defaultCategoryStyle).color;

  const select = (id: string) => {
    setWordId(id);
    setResult(null);
    setAttempt((a) => a + 1);
  };

  const onResult = (r: PracticeResult) => {
    setResult(r);
    if (r.status === 'success') {
      feedback.success();
      markLearned(word.id);
      recordCameraWin();
      setWins((n) => n + 1);
    } else {
      feedback.error();
    }
  };

  // Siradaki: arama acikken sonuclar icinde, degilse tum sozlukte ilerler.
  const next = () => {
    const list = words.length ? words : dictionary;
    const at = list.findIndex((w) => w.id === wordId);
    select(list[(at + 1) % list.length].id);
  };

  // Rastgele: once henuz ogrenilmemis isaretlerden secer.
  const shuffle = () => {
    feedback.tap();
    const list = (words.length ? words : dictionary).filter((w) => w.id !== wordId);
    const fresh = list.filter((w) => !learned.includes(w.id));
    const pool = fresh.length ? fresh : list;
    if (pool.length) select(pool[Math.floor(Math.random() * pool.length)].id);
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={theme.color.fgMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => words.length && select(words[0].id)}
            placeholder="İşaret ara…"
            placeholderTextColor={theme.color.fgMuted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              accessibilityLabel="Aramayı temizle"
            >
              <Ionicons name="close-circle" size={18} color={theme.color.fgMuted} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={shuffle}
          style={styles.shuffle}
          accessibilityRole="button"
          accessibilityLabel="Rastgele işaret"
        >
          <Ionicons name="shuffle" size={22} color={theme.color.accentBright} />
        </Pressable>
      </View>

      <View style={styles.chipsWrap}>
        {words.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            keyboardShouldPersistTaps="handled"
          >
            {words.map((w) => {
              const active = w.id === wordId;
              return (
                <Pressable
                  key={w.id}
                  onPress={() => select(w.id)}
                  style={StyleSheet.flatten([styles.chip, active && styles.chipActive])}
                >
                  {learned.includes(w.id) && (
                    <Ionicons name="checkmark-circle" size={15} color={theme.color.success} />
                  )}
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{w.title}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.noResult}>“{query.trim()}” diye bir işaret bulamadım.</Text>
        )}
      </View>

      <View style={styles.body}>
        <SignPractice
          wordId={word.id}
          title={word.title}
          color={color}
          attempt={attempt}
          onResult={onResult}
        />
      </View>

      {result?.status === 'success' ? (
        <View style={[styles.feedback, styles.feedbackRight]}>
          <View style={styles.feedbackHead}>
            <Ionicons name="checkmark-circle" size={28} color={theme.color.success} />
            <Text style={[styles.feedbackTitle, { color: theme.color.success }]}>
              Doğru! Harika yaptın ✨
            </Text>
          </View>
          {wins > 1 && (
            <Text style={styles.winsText}>Bu oturumda {wins} işareti doğru yaptın.</Text>
          )}
          <Button3D title="SIRADAKİ İŞARET" variant="success" onPress={next} />
        </View>
      ) : result?.status === 'fail' ? (
        <View style={[styles.feedback, styles.feedbackWrong]}>
          <View style={styles.feedbackHead}>
            <Ionicons name="close-circle" size={28} color={theme.color.danger} />
            <Text style={[styles.feedbackTitle, { color: theme.color.danger }]}>
              Yanlış hareket
            </Text>
          </View>
          {result.hint && <Text style={styles.feedbackText}>{result.hint}</Text>}
          <Button3D
            title="BAŞTAN DENE"
            variant="danger"
            icon={<Ionicons name="refresh" size={18} color="#FFF" />}
            onPress={() => {
              setResult(null);
              setAttempt((a) => a + 1);
            }}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    paddingHorizontal: theme.space.xl,
    paddingTop: theme.space.sm,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.color.panel,
    borderWidth: 2,
    borderColor: theme.color.locked,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.font.body,
    fontSize: 17,
    color: theme.color.fg,
    paddingVertical: 10,
    outlineStyle: 'none',
  } as object,
  shuffle: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.color.borderStrong,
    backgroundColor: theme.color.accentSoft,
  },
  chipsWrap: { paddingTop: theme.space.md },
  chips: { gap: 8, paddingHorizontal: theme.space.xl, paddingBottom: theme.space.md },
  noResult: {
    fontFamily: theme.font.italic,
    color: theme.color.fgDim,
    fontSize: 15,
    paddingHorizontal: theme.space.xl,
    paddingBottom: theme.space.md,
  },
  winsText: { fontFamily: theme.font.italic, color: theme.color.fgDim, fontSize: 15 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: theme.color.locked,
    backgroundColor: theme.color.panel,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActive: { borderColor: theme.color.accent, backgroundColor: theme.color.accentSoft },
  chipText: { fontFamily: theme.font.bodyBold, color: theme.color.fgDim, fontSize: 15 },
  chipTextActive: { color: theme.color.accentBright },
  body: { flex: 1, paddingHorizontal: theme.space.xl, paddingBottom: theme.space.lg },
  feedback: { padding: theme.space.xl, paddingTop: theme.space.lg, gap: theme.space.sm },
  feedbackRight: { backgroundColor: theme.color.successBg },
  feedbackWrong: { backgroundColor: theme.color.dangerBg },
  feedbackHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedbackTitle: { fontFamily: theme.font.display, fontSize: 18 },
  feedbackText: { fontFamily: theme.font.body, color: theme.color.dangerText, fontSize: 16 },
});
