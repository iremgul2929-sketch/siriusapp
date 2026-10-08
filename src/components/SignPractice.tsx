import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { signFor } from '@/data/signs';
import { SignMatcher, type MatchState } from '@/ml/signMatcher';
import { HandDemo } from './HandDemo';
import { HandTracker } from './HandTracker';
import type { TrackerMessage } from './HandTracker.types';
import { Button3D } from './Button3D';
import { CameraConsent, useCameraConsent } from './CameraConsent';

export type PracticeResult = { status: 'success' } | { status: 'fail'; hint: string | null };

/**
 * Kamerali pratik: ustte hareketin animasyonu, altta on kamera. Kullanici
 * hareketi yapinca SignMatcher dogrular; sonuc `onResult` ile bildirilir.
 * `attempt` degisince eslestirici sifirlanir (Bastan dene).
 */
export function SignPractice({
  wordId,
  title,
  color,
  attempt,
  onResult,
  onUnavailable,
}: {
  wordId: string;
  title: string;
  color: string;
  attempt: number;
  onResult: (r: PracticeResult) => void;
  onUnavailable?: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const consent = useCameraConsent();
  const [tracker, setTracker] = useState<'loading' | 'ready' | { error: string }>('loading');
  const [match, setMatch] = useState<MatchState | null>(null);

  const matcher = useMemo(() => new SignMatcher(signFor(wordId)), [wordId]);
  const resultRef = useRef(onResult);
  useEffect(() => {
    resultRef.current = onResult;
  }, [onResult]);

  // Kelime ya da deneme degisince eski sonucu render sirasinda temizle.
  const [seen, setSeen] = useState({ matcher, attempt });
  if (seen.matcher !== matcher || seen.attempt !== attempt) {
    setSeen({ matcher, attempt });
    setMatch(null);
  }

  // Kullanici kamerayi acmayi kabul edince telefonda sistem iznini kendiliginden iste.
  useEffect(() => {
    if (consent.allowed && Platform.OS !== 'web' && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [consent.allowed, permission, requestPermission]);

  useEffect(() => {
    matcher.reset();
  }, [matcher, attempt]);

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
        const before = matcher.snapshot();
        const lm = m.lm ? m.lm.map(([x, y]) => ({ x, y })) : null;
        const lm2 = m.lm2 ? m.lm2.map(([x, y]) => ({ x, y })) : null;
        const next = matcher.push(lm, m.t, lm2);
        setMatch((prev) =>
          prev && prev.status === next.status && prev.step === next.step && prev.hint === next.hint ? prev : next,
        );
        if (before.status !== next.status) {
          if (next.status === 'success') resultRef.current({ status: 'success' });
          if (next.status === 'fail') resultRef.current({ status: 'fail', hint: next.hint });
        }
      }
    },
    [matcher],
  );

  const needsPermission = Platform.OS !== 'web' && permission && !permission.granted;

  return (
    <View style={styles.root}>
      <View style={styles.demoRow}>
        <View style={[styles.demo, { borderColor: color }]}>
          <HandDemo wordId={wordId} color={color} showLabel={false} />
        </View>
        <View style={styles.demoText}>
          <Text style={styles.kicker}>ŞİMDİ SEN YAP</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>
            {matcher.twoHanded
              ? 'Bu işaret iki elle yapılır. İki elini de kameraya göster.'
              : 'Animasyondaki hareketi tek elinle kameraya doğru tekrarla.'}
          </Text>
        </View>
      </View>

      <View style={styles.camera}>
        {!consent.allowed ? (
          <CameraConsent consent={consent} onSkip={onUnavailable} />
        ) : needsPermission ? (
          <View style={styles.center}>
            <Ionicons name="camera-outline" size={40} color={theme.color.accent} />
            <Text style={styles.centerText}>Hareketini görebilmem için kamera izni gerekiyor.</Text>
            {permission.canAskAgain ? (
              <Button3D title="KAMERAYA İZİN VER" onPress={requestPermission} />
            ) : (
              <Text style={styles.centerSub}>Ayarlar’dan Expo Go için kamera iznini aç.</Text>
            )}
          </View>
        ) : permission || Platform.OS === 'web' ? (
          <>
            <HandTracker color={color} onMessage={onMessage} />
            <StatusPill tracker={tracker} match={match} color={color} />
            {typeof tracker === 'object' && (
              <View style={[StyleSheet.absoluteFill, styles.center, styles.errorBox]}>
                <Ionicons name="warning-outline" size={36} color={theme.color.danger} />
                <Text style={styles.centerText}>{tracker.error}</Text>
                {onUnavailable && <Button3D title="BU ADIMI ATLA" variant="ghost" onPress={onUnavailable} />}
              </View>
            )}
          </>
        ) : null}
      </View>
    </View>
  );
}

function StatusPill({
  tracker,
  match,
  color,
}: {
  tracker: 'loading' | 'ready' | { error: string };
  match: MatchState | null;
  color: string;
}) {
  if (typeof tracker === 'object') return null;

  if (tracker === 'loading') {
    return (
      <View style={styles.pill}>
        <ActivityIndicator size="small" color={theme.color.accent} />
        <Text style={styles.pillText}>Kamera hazırlanıyor…</Text>
      </View>
    );
  }

  const status = match?.status ?? 'searching';
  if (status === 'success' || status === 'fail') {
    const ok = status === 'success';
    return (
      <View style={[styles.pill, { borderColor: ok ? theme.color.success : theme.color.danger }]}>
        <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={18} color={ok ? theme.color.success : theme.color.danger} />
        <Text style={styles.pillText}>{ok ? 'Doğru!' : 'Yanlış'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.pill}>
      {status === 'searching' ? (
        <Ionicons name="hand-left-outline" size={18} color={theme.color.accent} />
      ) : (
        <View style={styles.dots}>
          {Array.from({ length: match!.total }, (_, i) => (
            <View key={i} style={[styles.dot, i < match!.step && { backgroundColor: color }]} />
          ))}
        </View>
      )}
      <Text style={styles.pillText}>
        {status === 'searching' ? 'Elini kameraya göster' : (match?.hint ?? 'Hareketi yap')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: theme.space.md },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: theme.space.md },
  demo: {
    width: 104,
    height: 104,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    backgroundColor: theme.color.bgDeep,
    overflow: 'hidden',
  },
  demoText: { flex: 1 },
  kicker: { fontFamily: theme.font.display, color: theme.color.accentBright, fontSize: 12, letterSpacing: 2 },
  title: { fontFamily: theme.font.displayBlack, color: theme.color.fg, fontSize: 26 },
  sub: { fontFamily: theme.font.italic, color: theme.color.fgDim, fontSize: 15 },
  camera: {
    flex: 1,
    minHeight: 280,
    borderRadius: theme.radius.xl,
    borderWidth: 2,
    borderColor: theme.color.borderStrong,
    backgroundColor: theme.color.bgDeep,
    overflow: 'hidden',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.space.md, padding: theme.space.xl },
  centerText: { fontFamily: theme.font.body, color: theme.color.fg, fontSize: 17, textAlign: 'center' },
  centerSub: { fontFamily: theme.font.italic, color: theme.color.fgDim, fontSize: 15, textAlign: 'center' },
  errorBox: { backgroundColor: theme.color.overlay },
  pill: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '92%',
    backgroundColor: theme.color.overlay,
    borderWidth: 1.5,
    borderColor: theme.color.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: { fontFamily: theme.font.bodyBold, color: theme.color.fg, fontSize: 15, flexShrink: 1 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.color.locked },
});
