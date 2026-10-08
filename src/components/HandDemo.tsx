import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { theme } from '@/constants/theme';
import { signFor } from '@/data/signs';
import { tutorById, type Tutor } from '@/data/tutors';
import { useProgress } from '@/store/useAppStore';
import { full, lerpPose, poseToLandmarks, type FullPose, type Pt } from '@/ml/handModel';
import { Avatar3D } from './Avatar3D';

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const STEP_MS = 650;
const HOLD_MS = 250;
/** Bir pozun ekranda kapladigi sure (gecis + bekleme). */
export const POSE_MS = STEP_MS + HOLD_MS;

const INK = '#2B2350';

// Avatarin sahnesi (viewBox 0..1): karakter solda, isaret yapan el sagda.
const SHOULDER: Pt = { x: 0.5, y: 0.76 };
const HAND_REST: Pt = { x: 0.76, y: 0.74 };
const HAND_SCALE = 0.68;
const REACH = 1.3; // pozdaki kaymayi avatar sahnesinde biraz buyut
const ARM = 0.18; // ust kol ve on kol uzunlugu

const FINGER_CHAINS = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
];
const TIPS = [4, 8, 12, 16, 20];

/** Rengi koyulastirir (sapka ve kol golgesi icin). */
function shade(hex: string, amount = 0.25) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * (1 - amount));
  return `#${((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, '0')}`;
}

/** Omuz ve bilek arasinda dirsegi asagi bukulecek sekilde yerlestirir. */
function elbowFor(wrist: Pt): Pt {
  const dx = wrist.x - SHOULDER.x;
  const dy = wrist.y - SHOULDER.y;
  const len = Math.hypot(dx, dy) || 0.001;
  const d = Math.min(len, 2 * ARM - 0.001);
  const h = Math.sqrt(ARM * ARM - (d / 2) * (d / 2));
  return {
    x: SHOULDER.x + (dx / len) * (d / 2) + (-dy / len) * h,
    y: SHOULDER.y + (dy / len) * (d / 2) + (dx / len) * h,
  };
}

/** Pozu avatarin eline cevirir: bilek konumu + 21 el noktasi. */
function placeHand(pose: FullPose) {
  const raw = poseToLandmarks({ ...pose, x: 0, y: 0 });
  const wrist = { x: HAND_REST.x + pose.x * REACH, y: HAND_REST.y + pose.y * REACH };
  const hand = raw.map((p) => ({
    x: wrist.x + (p.x - raw[0].x) * HAND_SCALE,
    y: wrist.y + (p.y - raw[0].y) * HAND_SCALE,
  }));
  return { wrist, hand };
}

// Destek eli: karakterin diger omzu, elin inik ve kalkik konumu.
const SHOULDER2: Pt = { x: 0.18, y: 0.76 };
const SUPPORT_DOWN: Pt = { x: 0.1, y: 0.98 };
const SUPPORT_UP: Pt = { x: 0.1, y: 0.74 };

/** Destek elini (aynalanmis) yerlestirir; `ow` 0 inik .. 1 kalkik. */
function placeSupport(o: FullPose['f'], ow: number) {
  const raw = poseToLandmarks({ f: o, x: 0, y: 0, r: 0, s: 1 });
  const wrist = {
    x: SUPPORT_DOWN.x + (SUPPORT_UP.x - SUPPORT_DOWN.x) * ow,
    y: SUPPORT_DOWN.y + (SUPPORT_UP.y - SUPPORT_DOWN.y) * ow,
  };
  const hand = raw.map((p) => ({
    x: wrist.x - (p.x - raw[0].x) * HAND_SCALE,
    y: wrist.y + (p.y - raw[0].y) * HAND_SCALE,
  }));
  // Dirsek, isaret kolunun aynasi olacak sekilde disa bukulur.
  const dx = wrist.x - SHOULDER2.x;
  const dy = wrist.y - SHOULDER2.y;
  const len = Math.hypot(dx, dy) || 0.001;
  const d = Math.min(len, 2 * ARM - 0.001);
  const h = Math.sqrt(ARM * ARM - (d / 2) * (d / 2));
  const elbow = {
    x: SHOULDER2.x + (dx / len) * (d / 2) - (-dy / len) * h,
    y: SHOULDER2.y + (dy / len) * (d / 2) - (dx / len) * h,
  };
  return { wrist, hand, elbow };
}

/** Tek bir elin cizimi: once dis cizgi, sonra ten rengi, acik parmak uclarinda isilti. */
function HandShape({
  hand,
  f,
  width,
  skin,
  line,
}: {
  hand: Pt[];
  f: FullPose['f'];
  width: number;
  skin: string;
  line: string;
}) {
  const palm = [0, 1, 5, 9, 13, 17].map((i) => `${hand[i].x},${hand[i].y}`).join(' ');
  return (
    <G>
      {FINGER_CHAINS.map((chain, c) =>
        chain.slice(1).map((b, j) => (
          <Line
            key={`o${c}-${j}`}
            x1={hand[chain[j]].x}
            y1={hand[chain[j]].y}
            x2={hand[b].x}
            y2={hand[b].y}
            stroke={line}
            strokeWidth={width + 0.012}
            strokeLinecap="round"
          />
        )),
      )}
      <Polygon points={palm} fill={skin} stroke={line} strokeWidth={0.012} strokeLinejoin="round" />
      {FINGER_CHAINS.map((chain, c) =>
        chain.slice(1).map((b, j) => (
          <Line
            key={`s${c}-${j}`}
            x1={hand[chain[j]].x}
            y1={hand[chain[j]].y}
            x2={hand[b].x}
            y2={hand[b].y}
            stroke={skin}
            strokeWidth={width}
            strokeLinecap="round"
          />
        )),
      )}
      {TIPS.map((i, c) => (
        <Circle
          key={`t${i}`}
          cx={hand[i].x}
          cy={hand[i].y}
          r={0.026}
          fill={theme.color.gold}
          opacity={0.35 * Math.max(0, (f[c] - 0.5) * 2)}
        />
      ))}
    </G>
  );
}

const SLOW_MS = 2500;

/**
 * Bir kelimenin temsili hareketini 3B avatarin eliyle dongu halinde oynatir.
 * 3B sahne gecikirse ya da hic acilamazsa (internet yok, WebGL yok) ayni
 * hareket 2B cizimle oynatilir; animasyon hicbir durumda bos kalmaz.
 */
export function HandDemo({
  wordId,
  color = theme.color.accent,
  style,
  showLabel = true,
}: {
  wordId: string;
  color?: string;
  style?: ViewStyle;
  showLabel?: boolean;
}) {
  const poses = useMemo(() => signFor(wordId).map(full), [wordId]);
  return <PoseDemo poses={poses} color={color} style={style} showLabel={showLabel} />;
}

/** Verilen poz dizisini avatarla oynatir (tek kelime ya da bir cumlenin tamami). */
export function PoseDemo({
  poses,
  color = theme.color.accent,
  style,
  showLabel = true,
  onPlaying,
}: {
  poses: FullPose[];
  color?: string;
  style?: ViewStyle;
  showLabel?: boolean;
  /** Animasyon ekranda oynamaya basladiginda bir kez cagrilir. */
  onPlaying?: () => void;
}) {
  const tutor = tutorById(useProgress().tutorId);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const onStatus = useCallback((ok: boolean) => setStatus(ok ? 'ready' : 'failed'), []);

  // 3B sahne gecikirse beklerken 2B animasyon gosterilir; sahne hazir olunca ona gecilir.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (status !== 'loading') return;
    const id = setTimeout(() => setSlow(true), SLOW_MS);
    return () => clearTimeout(id);
  }, [status]);
  const flat = status === 'failed' || (status === 'loading' && slow);

  const playing = status === 'ready' || flat;
  useEffect(() => {
    if (playing) onPlaying?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  return (
    <View style={[styles.box, style]}>
      {status !== 'failed' && (
        // Dokunuslar karta gecsin diye sahne dokunmayi yutmaz.
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none', opacity: status === 'ready' ? 1 : 0 }]}>
          <Avatar3D poses={poses} color={color} tutor={tutor} onStatus={onStatus} />
        </View>
      )}
      {flat && (
        <View style={StyleSheet.absoluteFill}>
          <FlatDemo frames={poses} color={color} tutor={tutor} />
        </View>
      )}
      {status === 'loading' && !slow && (
        <View style={[StyleSheet.absoluteFill, styles.loading]}>
          <ActivityIndicator color={color} />
        </View>
      )}
      {showLabel && <Text style={styles.label}>Temsili gösterim</Text>}
    </View>
  );
}

/** 3B sahne acilamadiginda kullanilan 2B cizim. */
function FlatDemo({ frames, color, tutor }: { frames: FullPose[]; color: string; tutor: Tutor }) {
  const SKIN = tutor.skin;
  const SKIN_LINE = shade(tutor.skin, 0.2);
  const HAIR = tutor.hair;
  const [pose, setPose] = useState<FullPose>(frames[0]);

  useEffect(() => {
    let raf = 0;
    const start = Date.now();
    const segment = STEP_MS + HOLD_MS;
    const tick = () => {
      const elapsed = (Date.now() - start) % (segment * frames.length);
      const i = Math.floor(elapsed / segment);
      const local = Math.min((elapsed - i * segment) / STEP_MS, 1);
      const from = frames[i];
      const to = frames[(i + 1) % frames.length];
      setPose(lerpPose(from, to, ease(local)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frames]);

  const { wrist, hand } = placeHand(pose);
  const elbow = elbowFor(wrist);
  const dark = shade(color);
  const finger = 0.034 * pose.s;
  const support = pose.o && pose.ow > 0.02 ? placeSupport(pose.o, pose.ow) : null;
  // Gozler ele dogru bakar.
  const look = { x: 0.006 + (wrist.x - HAND_REST.x) * 0.05, y: (wrist.y - HAND_REST.y) * 0.05 };

  return (
    <>
      <Svg width="100%" height="100%" viewBox="0 0 1 1">
        <Defs>
          <RadialGradient id="glow" cx="0.5" cy="0.55" r="0.5">
            <Stop offset="0" stopColor={color} stopOpacity="0.14" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={0.5} cy={0.55} r={0.48} fill="url(#glow)" />

        {/* Cubbe */}
        <Path d="M0.07 1 C0.07 0.78 0.15 0.67 0.29 0.65 L0.39 0.65 C0.53 0.67 0.61 0.78 0.61 1 Z" fill={color} />
        <Path d="M0.27 0.655 L0.34 0.74 L0.41 0.655" stroke="#FFFFFF" strokeOpacity={0.75} strokeWidth={0.014} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={0.34} cy={0.8} r={0.014} fill={theme.color.gold} />
        <Circle cx={0.34} cy={0.88} r={0.014} fill={theme.color.gold} />

        {/* Kol */}
        <Line x1={SHOULDER.x} y1={SHOULDER.y} x2={elbow.x} y2={elbow.y} stroke={dark} strokeWidth={0.09} strokeLinecap="round" />
        <Line x1={elbow.x} y1={elbow.y} x2={wrist.x} y2={wrist.y} stroke={dark} strokeWidth={0.08} strokeLinecap="round" />
        <Circle cx={wrist.x} cy={wrist.y} r={0.046} fill={color} />

        {/* Bas */}
        <Path d="M0.31 0.56 L0.37 0.56 L0.375 0.67 L0.305 0.67 Z" fill={SKIN_LINE} />
        <Circle cx={0.2} cy={0.42} r={0.045} fill={HAIR} />
        <Circle cx={0.48} cy={0.42} r={0.045} fill={HAIR} />
        <Circle cx={0.34} cy={0.43} r={0.15} fill={SKIN} />
        <Circle cx={0.255} cy={0.485} r={0.024} fill="#FF8FA3" opacity={0.45} />
        <Circle cx={0.425} cy={0.485} r={0.024} fill="#FF8FA3" opacity={0.45} />
        <G>
          <Circle cx={0.288 + look.x} cy={0.44 + look.y} r={0.017} fill={INK} />
          <Circle cx={0.392 + look.x} cy={0.44 + look.y} r={0.017} fill={INK} />
        </G>
        <Path d="M0.30 0.495 Q0.34 0.535 0.38 0.495" stroke="#B5553F" strokeWidth={0.013} fill="none" strokeLinecap="round" />

        {/* Sac */}
        <Path d="M0.185 0.43 C0.17 0.22 0.51 0.22 0.495 0.43 C0.44 0.33 0.24 0.33 0.185 0.43 Z" fill={HAIR} />
        <Circle cx={0.34} cy={0.25} r={0.06} fill={HAIR} />

        {/* Destek eli: yalnizca iki elli pozlarda gorunur */}
        {support && (
          <G opacity={Math.min(1, pose.ow * 1.5)}>
            <Line x1={SHOULDER2.x} y1={SHOULDER2.y} x2={support.elbow.x} y2={support.elbow.y} stroke={dark} strokeWidth={0.09} strokeLinecap="round" />
            <Line x1={support.elbow.x} y1={support.elbow.y} x2={support.wrist.x} y2={support.wrist.y} stroke={dark} strokeWidth={0.08} strokeLinecap="round" />
            <Circle cx={support.wrist.x} cy={support.wrist.y} r={0.046} fill={color} />
            <HandShape hand={support.hand} f={pose.o!} width={0.034} skin={SKIN} line={SKIN_LINE} />
          </G>
        )}

        <HandShape hand={hand} f={pose.f} width={finger} skin={SKIN} line={SKIN_LINE} />
      </Svg>
    </>
  );
}

const styles = StyleSheet.create({
  box: { aspectRatio: 1, width: '100%' },
  loading: { alignItems: 'center', justifyContent: 'center' },
  label: {
    position: 'absolute',
    top: 8,
    right: 12,
    fontFamily: theme.font.italic,
    fontSize: 12,
    color: theme.color.fgMuted,
  },
});
