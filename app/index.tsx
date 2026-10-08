import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, categoryStyle, defaultCategoryStyle } from '@/constants/theme';
import { categories, dictionary } from '@/data/dictionary';
import { useAppStore, useProgress, CHEST_XP } from '@/store/useAppStore';
import { houseById } from '@/data/houses';
import { feedback } from '@/utils/feedback';
import { useCurrentUser } from '@/store/useAuthStore';
import { StarField } from '@/components/StarField';

// Yol uzerindeki dugumlerin yatay kaymasi: yilan gibi kivrilan Duolingo yolu.
const ZIGZAG = [0, 52, 78, 52, 0, -52, -78, -52];

export default function HomeScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const progress = useProgress();
  const learned = new Set(progress.learnedWordIds);
  const currentId = dictionary.find((w) => !learned.has(w.id))?.id ?? null;
  const goal = progress.dailyGoal;
  const goalPct = Math.min(progress.xpToday / goal, 1);
  const house = houseById(progress.house);
  const claimChest = useAppStore((s) => s.claimChest);
  const [chestOpened, setChestOpened] = useState<string | null>(null);
  const learnedWords = dictionary.filter((w) => learned.has(w.id));
  const streakAtRisk = progress.streak > 0 && progress.xpToday === 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 6 ? 'İyi geceler' : hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  const openChest = (unitId: string) => {
    feedback.success();
    claimChest(unitId);
    setChestOpened(unitId);
  };

  const review = () => {
    const pick = learnedWords[Math.floor(Math.random() * learnedWords.length)];
    if (pick) router.push(`/lesson/${pick.id}`);
  };

  // Gunun isareti: her gun sozlukten sirayla bir kelime.
  const now = new Date();
  const dayNumber = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
  const daily = dictionary[dayNumber % dictionary.length];
  const dailyStyle = categoryStyle[daily.categoryId] ?? defaultCategoryStyle;

  let pathIndex = 0;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.color.bgTop, theme.color.bg, theme.color.bgDeep]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <StarField />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Ust durum cubugu */}
        <View style={styles.topBar}>
          <Pressable
            style={[styles.avatar, house && { borderColor: house.color }]}
            onPress={() => router.push('/profile')}
            hitSlop={6}
          >
            <Text style={styles.avatarText}>{progress.avatar}</Text>
          </Pressable>
          <View style={styles.counters}>
            <Counter icon="flame" color={theme.color.amber} value={progress.streak} />
            <Counter icon="sparkles" color={theme.color.accentBright} value={progress.xp} />
            <Counter icon="heart" color={theme.color.heart} value={progress.hearts} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.greeting}>
            {greeting}, <Text style={styles.greetingName}>{user?.name ?? 'dostum'}</Text>
          </Text>

          {streakAtRisk && (
            <View style={styles.alert}>
              <Ionicons name="flame" size={22} color={theme.color.amber} />
              <Text style={styles.alertText}>
                {progress.streak} günlük serin sönmek üzere! Bugün bir ders yap ve ateşi canlı tut.
              </Text>
            </View>
          )}

          {/* Gunluk hedef */}
          <View style={styles.goal}>
            <View style={styles.goalHead}>
              <Text style={styles.goalTitle}>Günlük hedef</Text>
              <Text style={styles.goalValue}>
                {progress.xpToday}/{goal} XP
              </Text>
            </View>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${goalPct * 100}%` }]} />
            </View>
            <Text style={styles.goalHint}>
              {goalPct >= 1
                ? 'Bugünkü hedefini tamamladın, harikasın!'
                : `Hedefine ${goal - progress.xpToday} XP kaldı — yaklaşık ${Math.ceil((goal - progress.xpToday) / 15)} ders.`}
            </Text>
          </View>

          <Pressable
            style={[styles.review, styles.daily]}
            onPress={() => router.push(`/learn/${daily.id}`)}
          >
            <View style={[styles.reviewIcon, { backgroundColor: dailyStyle.color }]}>
              <Ionicons name={dailyStyle.icon as never} size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dailyKicker}>GÜNÜN İŞARETİ</Text>
              <Text style={styles.reviewTitle}>{daily.title}</Text>
              <Text style={styles.reviewText}>
                {learned.has(daily.id)
                  ? 'Bunu biliyorsun, bir daha göz at'
                  : 'Bugün bu işareti öğren'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.color.fgDim} />
          </Pressable>

          {learnedWords.length >= 2 && (
            <Pressable style={styles.review} onPress={review}>
              <View style={styles.reviewIcon}>
                <Ionicons name="refresh" size={22} color={theme.color.onAccent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewTitle}>Hızlı tekrar</Text>
                <Text style={styles.reviewText}>
                  Öğrendiğin işaretlerden birini rastgele tekrar et
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.color.fgDim} />
            </Pressable>
          )}

          {categories.map((cat, unitIndex) => {
            const style = categoryStyle[cat.id] ?? defaultCategoryStyle;
            const words = dictionary.filter((w) => w.categoryId === cat.id);
            const done = words.filter((w) => learned.has(w.id)).length;

            return (
              <View key={cat.id} style={styles.unit}>
                <Pressable
                  style={StyleSheet.flatten([styles.unitBanner, { borderLeftColor: style.color }])}
                  onPress={() => router.push({ pathname: '/learn', params: { category: cat.id } })}
                >
                  <View style={styles.unitBody}>
                    <Text style={[styles.unitKicker, { color: style.color }]}>
                      BÖLÜM {unitIndex + 1} · {done}/{words.length}
                    </Text>
                    <Text style={styles.unitTitle}>{cat.title}</Text>
                    <Text style={styles.unitSubtitle}>{style.subtitle}</Text>
                  </View>
                  <View style={styles.unitBook}>
                    <Ionicons name={style.icon as never} size={22} color={style.color} />
                  </View>
                </Pressable>

                <View style={styles.path}>
                  {words.map((w) => {
                    const offset = ZIGZAG[pathIndex++ % ZIGZAG.length];
                    const state = learned.has(w.id)
                      ? 'done'
                      : w.id === currentId
                        ? 'current'
                        : 'locked';
                    return (
                      <PathNode
                        key={w.id}
                        title={w.title}
                        state={state}
                        color={style.color}
                        offset={offset}
                        index={pathIndex}
                        onPress={() => router.push(`/lesson/${w.id}`)}
                      />
                    );
                  })}
                  <Chest
                    offset={ZIGZAG[pathIndex++ % ZIGZAG.length]}
                    state={
                      progress.claimedChests.includes(cat.id)
                        ? 'claimed'
                        : done === words.length
                          ? 'ready'
                          : 'locked'
                    }
                    justOpened={chestOpened === cat.id}
                    onOpen={() => openChest(cat.id)}
                  />
                </View>
              </View>
            );
          })}

          <View style={styles.finale}>
            <Ionicons name="trophy" size={44} color={theme.color.gold} />
            <Text style={styles.finaleText}>Tüm bölümleri bitir, işaret dili ustası ol!</Text>
          </View>
        </ScrollView>

        {/* Alt gezinme */}
        <View style={styles.tabBar}>
          <Tab icon="home" label="Yol" active />
          <Tab icon="book" label="Sözlük" onPress={() => router.push('/learn')} />
          <Tab icon="language" label="Çeviri" onPress={() => router.push('/translate')} />
          <Tab icon="videocam" label="Pratik" onPress={() => router.push('/camera')} />
          <Tab icon="person" label="Profil" onPress={() => router.push('/profile')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function Chest({
  offset,
  state,
  justOpened,
  onOpen,
}: {
  offset: number;
  state: 'locked' | 'ready' | 'claimed';
  justOpened: boolean;
  onOpen: () => void;
}) {
  const [wiggle] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (state !== 'ready') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -1, duration: 120, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.delay(1400),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [state, wiggle]);

  const rotate = wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-10deg', '10deg'] });

  return (
    <View style={[styles.nodeWrap, { transform: [{ translateX: offset }] }]}>
      <Pressable onPress={onOpen} disabled={state !== 'ready'}>
        <Animated.View
          style={[
            styles.chest,
            state === 'ready' && styles.chestReady,
            state === 'claimed' && styles.chestClaimed,
            { transform: [{ rotate }] },
          ]}
        >
          <Ionicons
            name={state === 'claimed' ? 'gift-outline' : 'gift'}
            size={34}
            color={
              state === 'locked'
                ? theme.color.fgMuted
                : state === 'ready'
                  ? '#FFFFFF'
                  : theme.color.accent
            }
          />
        </Animated.View>
      </Pressable>
      <Text style={[styles.nodeLabel, state === 'locked' && { color: theme.color.fgMuted }]}>
        {justOpened
          ? `+${CHEST_XP} XP!`
          : state === 'ready'
            ? 'Sandığı aç!'
            : state === 'claimed'
              ? 'Açıldı'
              : 'Ödül sandığı'}
      </Text>
    </View>
  );
}

function Counter({ icon, color, value }: { icon: string; color: string; value: number }) {
  return (
    <View style={styles.counter}>
      <Ionicons name={icon as never} size={20} color={color} />
      <Text style={[styles.counterText, { color }]}>{value}</Text>
    </View>
  );
}

function PathNode({
  title,
  state,
  color,
  offset,
  index,
  onPress,
}: {
  title: string;
  state: 'done' | 'current' | 'locked';
  color: string;
  offset: number;
  index: number;
  onPress: () => void;
}) {
  const [float] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  // Her baloncuk yavasca suzulur; komsular ayni anda hareket etmesin diye gecikmeli baslar.
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay((index % 5) * 260),
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(float, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [float, index]);

  // Siradaki dersin etrafinda disa dogru yayilan halka.
  useEffect(() => {
    if (state !== 'current') return;
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  const locked = state === 'locked';
  const face = locked ? theme.color.locked : color;
  const edge = shade(face, locked ? 0.12 : 0.22);
  const icon = state === 'done' ? 'checkmark' : state === 'current' ? 'play' : 'lock-closed';

  return (
    <Animated.View
      style={[
        styles.nodeWrap,
        {
          transform: [
            { translateX: offset },
            { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
            {
              scale:
                state === 'current'
                  ? float.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] })
                  : 1,
            },
          ],
        },
      ]}
    >
      {state === 'current' && (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>BAŞLA</Text>
          <View style={styles.bubbleTail} />
        </View>
      )}
      {state === 'current' && (
        <Animated.View
          style={[
            styles.ring,
            {
              borderColor: color,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
              transform: [
                { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.45] }) },
              ],
            },
          ]}
        />
      )}
      <Pressable
        onPress={onPress}
        disabled={locked}
        style={StyleSheet.flatten([styles.nodeEdge, { backgroundColor: edge }])}
      >
        <View style={[styles.node, { backgroundColor: face }]}>
          <Ionicons
            name={icon as never}
            size={30}
            color={locked ? theme.color.fgMuted : '#FFFFFF'}
          />
        </View>
      </Pressable>
      <Text style={[styles.nodeLabel, locked && { color: theme.color.fgDim }]}>{title}</Text>
    </Animated.View>
  );
}

function Tab({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Ionicons
        name={(active ? icon : `${icon}-outline`) as never}
        size={22}
        color={active ? theme.color.neon : theme.color.onDark}
      />
      <Text style={[styles.tabLabel, active && { color: theme.color.neon }]}>{label}</Text>
    </Pressable>
  );
}

/** Rengi koyulastirir (3B dugum kenari icin). */
function shade(hex: string, amount = 0.3) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * (1 - amount));
  const r = f(n >> 16);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const NODE = 76;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.xl,
    paddingVertical: theme.space.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.color.accent,
    borderWidth: 2,
    borderColor: theme.color.accentBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22 },
  counters: { flexDirection: 'row', gap: theme.space.lg },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  counterText: { fontFamily: theme.font.display, fontSize: 17 },
  container: { padding: theme.space.xl, paddingBottom: 60 },
  greeting: {
    fontFamily: theme.font.italic,
    color: theme.color.fgDim,
    fontSize: 18,
    marginBottom: theme.space.md,
  },
  greetingName: { fontFamily: theme.font.display, color: theme.color.fg, fontStyle: 'normal' },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    backgroundColor: 'rgba(255,159,74,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,159,74,0.45)',
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    marginBottom: theme.space.md,
  },
  alertText: {
    flex: 1,
    fontFamily: theme.font.body,
    color: theme.color.fg,
    fontSize: 15,
    lineHeight: 20,
  },
  review: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    backgroundColor: theme.color.panel,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: theme.color.locked,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    marginTop: -theme.space.md,
    marginBottom: theme.space.xl,
  },
  reviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daily: { marginTop: -theme.space.md, borderColor: theme.color.border },
  dailyKicker: {
    fontFamily: theme.font.display,
    color: theme.color.accentBright,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  reviewTitle: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 16 },
  reviewText: { fontFamily: theme.font.body, color: theme.color.fgDim, fontSize: 14 },
  chest: {
    width: 70,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.color.locked,
    borderBottomWidth: 5,
    borderBottomColor: theme.color.lockedDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestReady: { backgroundColor: theme.color.gold, borderBottomColor: theme.color.goldDeep },
  chestClaimed: {
    backgroundColor: theme.color.panel,
    borderBottomColor: theme.color.bgDeep,
    opacity: 0.7,
  },
  goal: {
    backgroundColor: theme.color.panel,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: theme.space.lg,
    marginBottom: theme.space.xl,
  },
  goalHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.space.sm },
  goalTitle: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 15 },
  goalValue: { fontFamily: theme.font.bodyBold, color: theme.color.accent, fontSize: 15 },
  bar: { height: 14, borderRadius: 7, backgroundColor: theme.color.locked, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 7, backgroundColor: theme.color.neon },
  goalHint: {
    fontFamily: theme.font.italic,
    color: theme.color.fgDim,
    fontSize: 15,
    marginTop: theme.space.sm,
  },
  unit: { marginBottom: theme.space.xl },
  unitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    marginBottom: theme.space.xl,
    backgroundColor: theme.color.panel,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderLeftWidth: 5,
  },
  unitBody: { flex: 1 },
  unitKicker: { fontFamily: theme.font.display, fontSize: 11, letterSpacing: 1.5 },
  unitTitle: {
    fontFamily: theme.font.displayBlack,
    color: theme.color.fg,
    fontSize: 20,
    marginTop: 2,
  },
  unitSubtitle: { fontFamily: theme.font.italic, color: theme.color.fgDim, fontSize: 15 },
  unitBook: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: theme.color.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  path: { alignItems: 'center', gap: 36, paddingTop: 34 },
  nodeWrap: { alignItems: 'center' },
  ring: {
    position: 'absolute',
    top: -7,
    width: NODE + 14,
    height: NODE + 14,
    borderRadius: (NODE + 14) / 2,
    borderWidth: 4,
  },
  nodeEdge: { width: NODE, height: NODE + 6, borderRadius: NODE / 2 },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLabel: { fontFamily: theme.font.bodyBold, color: theme.color.fg, fontSize: 14, marginTop: 6 },
  bubble: {
    position: 'absolute',
    top: -50,
    backgroundColor: theme.color.dark,
    borderWidth: 2,
    borderColor: theme.color.neon,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    zIndex: 2,
    alignItems: 'center',
  },
  bubbleText: {
    fontFamily: theme.font.display,
    color: theme.color.neon,
    fontSize: 14,
    letterSpacing: 1,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    width: 12,
    height: 12,
    backgroundColor: theme.color.dark,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: theme.color.neon,
    transform: [{ rotate: '45deg' }],
  },
  finale: { alignItems: 'center', gap: theme.space.sm, marginTop: theme.space.lg },
  finaleText: { fontFamily: theme.font.italic, color: theme.color.fgMuted, fontSize: 16 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.color.darkSoft,
    backgroundColor: theme.color.dark,
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: 14,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 6, borderRadius: 12 },
  tabActive: {
    backgroundColor: theme.color.accentSoft,
    borderWidth: 1.5,
    borderColor: theme.color.borderStrong,
  },
  tabLabel: { fontFamily: theme.font.bodyBold, color: theme.color.onDark, fontSize: 12 },
});
