import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { dictionary } from '@/data/dictionary';
import { signFor } from '@/data/signs';
import { full, type FullPose } from '@/ml/handModel';
import { SignRecognizer } from '@/ml/signRecognizer';
import { textToSigns } from '@/ml/textToSigns';
import { Button3D } from '@/components/Button3D';
import { POSE_MS, PoseDemo } from '@/components/HandDemo';
import { CameraConsent, useCameraConsent } from '@/components/CameraConsent';
import { HandTracker } from '@/components/HandTracker';
import type { TrackerMessage } from '@/components/HandTracker.types';
import { StarField } from '@/components/StarField';
import { useKeyboardOverlap } from '@/hooks/useKeyboardOverlap';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { feedback } from '@/utils/feedback';

type Mode = 'live' | 'avatar';

const titleOf = (id: string) => dictionary.find((w) => w.id === id)?.title ?? id;

/** Ceviri: isaretten yaziya (kamera) ve yazidan isarete (avatar). */
export default function TranslateScreen() {
  const [mode, setMode] = useState<Mode>('live');

  return (
    <View style={styles.root}>
      <StarField />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.modes}>
          <ModeTab
            icon="videocam"
            label="İŞARET → YAZI"
            color={theme.color.neon}
            active={mode === 'live'}
            onPress={() => setMode('live')}
          />
          <ModeTab
            icon="person"
            label="YAZI → İŞARET"
            color={theme.color.purple}
            active={mode === 'avatar'}
            onPress={() => setMode('avatar')}
          />
        </View>
        {mode === 'live' ? <LivePanel /> : <AvatarPanel />}
      </SafeAreaView>
    </View>
  );
}

function ModeTab({
  icon,
  label,
  color,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={StyleSheet.flatten([
        styles.mode,
        active && { borderColor: color, backgroundColor: color + '22' },
      ])}
    >
      <Ionicons name={icon as never} size={16} color={active ? color : theme.color.fgMuted} />
      <Text style={[styles.modeText, active && { color }]}>{label}</Text>
    </Pressable>
  );
}

/** Kameradaki isaretleri taniyip yaziya doker. */
function LivePanel() {
  const [permission, requestPermission] = useCameraPermissions();
  const [tracker, setTracker] = useState<'loading' | 'ready' | { error: string }>('loading');
  const [hand, setHand] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [recognizer] = useState(() => new SignRecognizer());
  const consent = useCameraConsent();

  // Kullanici kamerayi acmayi kabul edince telefonda sistem iznini kendiliginden iste.
  useEffect(() => {
    if (
      consent.allowed &&
      Platform.OS !== 'web' &&
      permission &&
      !permission.granted &&
      permission.canAskAgain
    ) {
      requestPermission();
    }
  }, [consent.allowed, permission, requestPermission]);

  const onMessage = useCallback(
    (m: TrackerMessage) => {
      if (m.type === 'ready') setTracker('ready');
      else if (m.type === 'error')
        setTracker({
          error:
            m.code === 'camera'
              ? 'Kameraya erişilemedi. İzin verdiğinden emin ol.'
              : 'El takip modeli yüklenemedi. İnternet bağlantını kontrol et.',
        });
      else {
        const lm = m.lm ? m.lm.map(([x, y]) => ({ x, y })) : null;
        const lm2 = m.lm2 ? m.lm2.map(([x, y]) => ({ x, y })) : null;
        const result = recognizer.push(lm, m.t, lm2);
        setHand(result.hand);
        if (result.word) {
          const word = result.word;
          feedback.success();
          setWords((prev) => [...prev, word].slice(-14));
        }
      }
    },
    [recognizer],
  );

  const clear = () => {
    recognizer.reset();
    setWords([]);
  };

  const needsPermission = Platform.OS !== 'web' && permission && !permission.granted;
  const status = !consent.allowed
    ? 'Kamera kapalı'
    : typeof tracker === 'object'
      ? null
      : tracker === 'loading'
        ? 'Kamera hazırlanıyor…'
        : hand
          ? 'İşaret algılanıyor…'
          : 'Elini kameraya göster';

  return (
    <View style={styles.body}>
      <View style={[styles.panel, { borderColor: theme.color.borderStrong }]}>
        <Text style={[styles.panelTitle, { color: theme.color.neon }]}>CANLI ÇEVİRİ</Text>
        <View style={styles.camera}>
          {!consent.allowed ? (
            <CameraConsent consent={consent} />
          ) : needsPermission ? (
            <View style={styles.center}>
              <Ionicons name="camera-outline" size={40} color={theme.color.neon} />
              <Text style={styles.centerText}>
                İşaretleri görebilmem için kamera izni gerekiyor.
              </Text>
              {permission.canAskAgain ? (
                <Button3D title="KAMERAYA İZİN VER" onPress={requestPermission} />
              ) : (
                <Text style={styles.hint}>Ayarlar’dan Expo Go için kamera iznini aç.</Text>
              )}
            </View>
          ) : permission || Platform.OS === 'web' ? (
            <>
              <HandTracker color={theme.color.neon} onMessage={onMessage} />
              {typeof tracker === 'object' && (
                <View style={[StyleSheet.absoluteFill, styles.center, styles.cameraError]}>
                  <Ionicons name="warning-outline" size={36} color={theme.color.danger} />
                  <Text style={styles.centerText}>{tracker.error}</Text>
                </View>
              )}
            </>
          ) : null}
        </View>

        <View style={styles.readout}>
          <View style={styles.readoutBar} />
          <View style={{ flex: 1 }}>
            <View style={styles.statusRow}>
              {consent.allowed && tracker === 'loading' && (
                <ActivityIndicator size="small" color={theme.color.neon} />
              )}
              <Text style={styles.status}>
                {(status ?? 'Kamera kullanılamıyor').toLocaleUpperCase('tr-TR')}
              </Text>
            </View>
            <Text style={[styles.transcript, !words.length && styles.transcriptEmpty]}>
              {words.length
                ? `“${words.map(titleOf).join(' ')}”`
                : 'Tanınan işaretler burada yazıya dökülür.'}
            </Text>
          </View>
          {words.length > 0 && (
            <Pressable onPress={clear} hitSlop={10}>
              <Ionicons name="trash-outline" size={20} color={theme.color.fgDim} />
            </Pressable>
          )}
        </View>
      </View>
      <Text style={styles.note}>
        {recognizer.size} işaret tanınır. Tanıma, sözlükteki temsili hareketlere göre çalışır;
        gerçek TİD çevirisi değildir.
      </Text>
    </View>
  );
}

// Tek dokunusla denenebilen ornek cumleler.
const EXAMPLES = [
  'Merhaba, nasılsın?',
  'Teşekkür ederim',
  'Anne ben okula gidiyorum',
  'Su içmek istiyorum',
  'Seni seviyorum',
];

// Kelimeler arasinda elin indigi dinlenme pozu.
const REST: FullPose = { f: [0.4, 0.4, 0.4, 0.4, 0.4], x: 0, y: 0.13, r: 0, s: 0.85, o: null, ow: 0 };

/** Yazilan ya da soylenen metni avatarin isaretleriyle sirayla oynatir. */
function AvatarPanel() {
  const [draft, setDraft] = useState('Merhaba, nasılsın?');
  const [text, setText] = useState('Merhaba, nasılsın?');
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(0);

  const tokens = useMemo(() => textToSigns(text), [text]);
  // Her bilinen kelimenin pozlari + araya dinlenme pozu; `starts` kelimenin ilk poz sirasi.
  const { poses, starts } = useMemo(() => {
    const all: FullPose[] = [];
    const first: number[] = [];
    for (const t of tokens) {
      if (!t.word) continue;
      first.push(all.length);
      all.push(...signFor(t.word.id).map(full), REST);
    }
    return { poses: all, starts: first };
  }, [tokens]);

  // Oynayan pozun hangi kelimeye ait oldugunu saatle takip et.
  useEffect(() => {
    if (!playing || !poses.length) return;
    const start = Date.now();
    const id = setInterval(() => {
      const index = Math.floor(((Date.now() - start) % (POSE_MS * poses.length)) / POSE_MS);
      let word = 0;
      starts.forEach((s, k) => {
        if (index >= s) word = k;
      });
      setActive(word);
    }, 120);
    return () => clearInterval(id);
  }, [playing, poses, starts]);

  const translate = (value = draft) => {
    feedback.tap();
    setPlaying(false);
    setActive(0);
    setText(value);
  };

  // Sesle giris: konusurken metin kutusu dolar, cumle bitince ceviri baslar.
  const [unsupported, setUnsupported] = useState(false);
  const speech = useSpeechToText((spoken, final) => {
    setDraft(spoken);
    if (final) translate(spoken);
  });
  const toggleMic = () => {
    feedback.tap();
    if (!speech.supported) setUnsupported(true);
    else if (speech.listening) speech.stop();
    else speech.start();
  };
  const micNote = unsupported
    ? 'Sesle yazma bu cihazda kullanılamıyor. Metni klavyeyle yazabilirsin.'
    : speech.listening
      ? 'Dinliyorum… Şimdi konuş.'
      : speech.error;

  // Klavye acilinca metin kutusu altinda kalmasin: kapanan alan kadar bosluk birak ve sona kaydir.
  const frame = useRef<View>(null);
  const scroll = useRef<ScrollView>(null);
  const overlap = useKeyboardOverlap(frame);
  useEffect(() => {
    if (!overlap) return;
    const id = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(id);
  }, [overlap]);

  const known = tokens.filter((t) => t.word);
  const current = known[active]?.word;

  return (
    <View ref={frame} style={styles.safe}>
      <ScrollView
        ref={scroll}
        contentContainerStyle={[
          styles.body,
          overlap > 0 && { paddingBottom: overlap + theme.space.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.panel, { borderColor: theme.color.purple }]}>
          <Text style={[styles.panelTitle, { color: theme.color.purple }]}>AVATAR İŞARETİ</Text>
          <View style={styles.nowPlaying}>
            <Text style={styles.nowPlayingText}>
              {current ? current.title.toLocaleUpperCase('tr-TR') : 'SÖZLÜKTE KARŞILIĞI YOK'}
            </Text>
          </View>
          <View style={styles.stage}>
            {poses.length > 0 ? (
              <PoseDemo
                key={text}
                poses={poses}
                color={theme.color.purple}
                showLabel={false}
                onPlaying={() => setPlaying(true)}
              />
            ) : (
              <View style={[styles.center, styles.stageEmpty]}>
                <Ionicons name="help-circle-outline" size={40} color={theme.color.fgMuted} />
                <Text style={styles.centerText}>Bu metindeki kelimeler sözlükte yok.</Text>
              </View>
            )}
          </View>

          <View style={styles.chips}>
            {tokens.map((t, i) => {
              const isActive =
                !!t.word && tokens.slice(0, i).filter((p) => p.word).length === active;
              return (
                <View
                  key={i}
                  style={[
                    styles.chip,
                    isActive && styles.chipActive,
                    !t.word && styles.chipUnknown,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isActive && styles.chipTextActive,
                      !t.word && styles.chipTextUnknown,
                    ]}
                  >
                    {t.text}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.panel, styles.inputPanel]}>
          <Text style={[styles.panelTitle, { color: theme.color.purple }]}>YAZ YA DA SÖYLE</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => translate()}
              placeholder="Örn. Merhaba, teşekkür ederim"
              placeholderTextColor={theme.color.fgMuted}
              style={[styles.input, styles.inputFlex]}
              returnKeyType="go"
            />
            <Pressable
              onPress={toggleMic}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={speech.listening ? 'Dinlemeyi durdur' : 'Sesle yaz'}
              style={[
                styles.mic,
                speech.listening && styles.micOn,
                !speech.supported && styles.micOff,
              ]}
            >
              <Ionicons
                name={speech.listening ? 'stop' : 'mic'}
                size={24}
                color={
                  speech.listening
                    ? theme.color.fg
                    : !speech.supported
                      ? theme.color.fgMuted
                      : theme.color.accentBright
                }
              />
            </Pressable>
          </View>
          {micNote && (
            <Text style={[styles.micNote, speech.listening && { color: theme.color.accentBright }]}>
              {micNote}
            </Text>
          )}
          <Button3D
            title="İŞARETE ÇEVİR"
            icon={<Ionicons name="play" size={18} color={theme.color.onAccent} />}
            onPress={() => translate()}
          />
          <Text style={styles.examplesTitle}>Hazır cümleler</Text>
          <View style={styles.chips}>
            {EXAMPLES.map((example) => (
              <Pressable
                key={example}
                onPress={() => {
                  setDraft(example);
                  translate(example);
                }}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{example}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={styles.note}>
          Üstü çizili kelimeler sözlükte olmadığı için atlanır. İşaretler temsilidir; gerçek TİD
          işaretleri değildir.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  safe: { flex: 1 },
  modes: { flexDirection: 'row', gap: theme.space.sm, padding: theme.space.lg, paddingBottom: 0 },
  mode: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    backgroundColor: theme.color.panel,
  },
  modeText: {
    fontFamily: theme.font.display,
    color: theme.color.fgMuted,
    fontSize: 13,
    letterSpacing: 1,
  },
  body: { flexGrow: 1, padding: theme.space.lg, gap: theme.space.md },
  panel: {
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    backgroundColor: theme.color.panel,
    padding: theme.space.md,
    gap: theme.space.md,
  },
  inputPanel: { borderColor: theme.color.border },
  panelTitle: {
    fontFamily: theme.font.display,
    fontSize: 13,
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  camera: {
    height: 320,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.color.borderStrong,
    backgroundColor: theme.color.bgDeep,
    overflow: 'hidden',
  },
  cameraError: { backgroundColor: theme.color.overlay },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.md,
    padding: theme.space.xl,
  },
  centerText: {
    fontFamily: theme.font.body,
    color: theme.color.fg,
    fontSize: 16,
    textAlign: 'center',
  },
  hint: {
    fontFamily: theme.font.italic,
    color: theme.color.fgDim,
    fontSize: 14,
    textAlign: 'center',
  },
  readout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.bgDeep,
    padding: theme.space.md,
  },
  readoutBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: theme.color.neon,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  status: {
    fontFamily: theme.font.bodyBold,
    color: theme.color.neon,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  transcript: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 20, marginTop: 4 },
  transcriptEmpty: { fontFamily: theme.font.italic, color: theme.color.fgMuted, fontSize: 15 },
  note: {
    fontFamily: theme.font.italic,
    color: theme.color.fgMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  nowPlaying: {
    alignSelf: 'center',
    minWidth: '70%',
    borderRadius: theme.radius.sm,
    borderWidth: 1.5,
    borderColor: theme.color.purple,
    backgroundColor: theme.color.purpleSoft,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  nowPlayingText: {
    fontFamily: theme.font.displayBlack,
    color: theme.color.fg,
    fontSize: 20,
    letterSpacing: 2,
    textAlign: 'center',
  },
  stage: {
    alignSelf: 'center',
    width: '86%',
    maxWidth: 320,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.bgDeep,
    overflow: 'hidden',
  },
  stageEmpty: { aspectRatio: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  chip: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipActive: { borderColor: theme.color.purple, backgroundColor: theme.color.purpleSoft },
  chipUnknown: { borderStyle: 'dashed' },
  chipText: { fontFamily: theme.font.bodyBold, color: theme.color.fgDim, fontSize: 14 },
  chipTextActive: { color: theme.color.fg },
  chipTextUnknown: { color: theme.color.fgMuted, textDecorationLine: 'line-through' },
  input: {
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    backgroundColor: theme.color.bgDeep,
    color: theme.color.fg,
    fontFamily: theme.font.body,
    fontSize: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  examplesTitle: {
    fontFamily: theme.font.bodyBold,
    color: theme.color.fgDim,
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: theme.space.sm },
  inputFlex: { flex: 1 },
  mic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.color.borderStrong,
    backgroundColor: theme.color.accentSoft,
  },
  micOn: { borderColor: theme.color.danger, backgroundColor: theme.color.danger },
  micOff: { borderColor: theme.color.border, backgroundColor: theme.color.bgDeep },
  micNote: {
    fontFamily: theme.font.italic,
    color: theme.color.fgDim,
    fontSize: 14,
    textAlign: 'center',
  },
});
