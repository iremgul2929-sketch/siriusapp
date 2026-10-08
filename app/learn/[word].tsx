import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { categories, dictionary } from '@/data/dictionary';
import { theme, categoryStyle, defaultCategoryStyle } from '@/constants/theme';
import { useAppStore, useProgress } from '@/store/useAppStore';
import { HandDemo } from '@/components/HandDemo';
import { StarField } from '@/components/StarField';
import { Ornament } from '@/components/Ornament';

export default function WordDetailScreen() {
  const { word: wordId } = useLocalSearchParams<{ word: string }>();
  const router = useRouter();
  const word = dictionary.find((w) => w.id === wordId);
  const progress = useProgress();
  const isLearned = word ? progress.learnedWordIds.includes(word.id) : false;
  const markLearned = useAppStore((s) => s.markLearned);

  if (!word) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="help-circle-outline" size={40} color={theme.color.fgMuted} />
        <Text style={styles.placeholder}>Bu işaret sözlükte bulunamadı</Text>
      </View>
    );
  }

  const style = categoryStyle[word.categoryId] ?? defaultCategoryStyle;
  const categoryTitle = categories.find((c) => c.id === word.categoryId)?.title;

  return (
    <View style={styles.container}>
      <StarField />
      <ScrollView contentContainerStyle={styles.content}>
        {categoryTitle && (
          <View style={[styles.tag, { borderColor: style.color }]}>
            <Ionicons name={style.icon as never} size={13} color={style.color} />
            <Text style={[styles.tagText, { color: style.color }]}>{categoryTitle}</Text>
          </View>
        )}
        <Text style={styles.title}>{word.title}</Text>
        <View style={styles.ornament}>
          <Ornament color={style.color} />
        </View>

        <View style={styles.videoBox}>
          {word.videoUrl ? (
            <WordVideo uri={word.videoUrl} />
          ) : (
            <HandDemo wordId={word.id} color={style.color} style={styles.demo} />
          )}
        </View>

        <View style={styles.scroll}>
          <View style={styles.scrollHeader}>
            <Ionicons name="bulb" size={18} color={theme.color.amber} />
            <Text style={styles.scrollTitle}>İpucu</Text>
          </View>
          <Text style={styles.scrollText}>
            Gösterimi dikkatle izle ve elinle taklit et. Ardından derse başlayıp bu işareti
            tanıyıp tanımadığını sına. (Bu animasyon temsilidir; gerçek TİD videosu değildir.)
          </Text>
        </View>

        <Pressable style={styles.primaryShell} onPress={() => router.push(`/lesson/${word.id}`)}>
          <LinearGradient
            colors={[theme.color.accentBright, theme.color.accent, theme.color.accentDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Ionicons name="play" size={20} color={theme.color.onAccent} />
            <Text style={styles.primaryBtnText}>Derse Başla</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={[styles.secondaryBtn, isLearned && styles.secondaryBtnDone]}
          onPress={() => markLearned(word.id)}
          disabled={isLearned}
        >
          <Ionicons
            name={isLearned ? 'sparkles' : 'sparkles-outline'}
            size={18}
            color={isLearned ? theme.color.accentBright : theme.color.fg}
          />
          <Text style={[styles.secondaryBtnText, isLearned && { color: theme.color.accentBright }]}>
            {isLearned ? 'Bu işareti öğrendin' : 'Öğrendim'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function WordVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.color.bg },
  content: { padding: theme.space.xl, paddingTop: theme.space.sm, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.space.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: theme.space.sm,
  },
  tagText: { fontFamily: theme.font.display, fontSize: 11, letterSpacing: 1 },
  title: {
    fontFamily: theme.font.displayBlack,
    color: theme.color.accentBright,
    fontSize: 38,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(255,220,133,0.6)',
    textShadowRadius: 16,
  },
  ornament: { width: '60%', alignSelf: 'center', marginTop: theme.space.sm, marginBottom: theme.space.xl },
  videoBox: {
    aspectRatio: 1,
    alignSelf: 'center',
    width: '85%',
    maxWidth: 360,
    backgroundColor: theme.color.bgDeep,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.borderStrong,
    overflow: 'hidden',
    marginBottom: theme.space.lg,
  },
  demo: { width: '100%' },
  placeholder: {
    fontFamily: theme.font.italic,
    color: theme.color.fgDim,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: theme.space.lg,
  },
  scroll: {
    backgroundColor: theme.color.panelRaised,
    borderWidth: 1,
    borderColor: 'rgba(255,180,84,0.4)',
    borderRadius: theme.radius.md,
    padding: theme.space.lg,
    marginBottom: theme.space.xl,
  },
  scrollHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  scrollTitle: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 14 },
  scrollText: { fontFamily: theme.font.body, color: theme.color.fg, fontSize: 16, lineHeight: 22 },
  primaryShell: {
    borderRadius: theme.radius.lg,
    marginBottom: theme.space.md,
    shadowColor: theme.color.accent,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.sm,
    borderRadius: theme.radius.lg,
    padding: 18,
  },
  primaryBtnText: { fontFamily: theme.font.display, color: theme.color.onAccent, fontSize: 17 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: 16,
  },
  secondaryBtnDone: { borderColor: theme.color.borderStrong, backgroundColor: theme.color.accentSoft },
  secondaryBtnText: { fontFamily: theme.font.bodyBold, color: theme.color.fg, fontSize: 16 },
});
