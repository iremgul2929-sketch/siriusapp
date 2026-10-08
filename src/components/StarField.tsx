import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { theme } from '@/constants/theme';

// Sabit tohumla uretilir: her acilista ayni duzen.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seeded(7);
const GLOW = theme.color.glow;
const SPARKLE = theme.color.sparkle;

// Dort koseli yildiz: uclari ince, ortasi dolgun.
const STAR = 'M50 0 C53 36 64 47 100 50 C64 53 53 64 50 100 C47 64 36 53 0 50 C36 47 47 36 50 0 Z';

const BLOBS = Array.from({ length: 4 }, (_, i) => ({
  x: 8 + rand() * 84,
  y: 4 + rand() * 92,
  size: 200 + rand() * 160,
  color: GLOW[i % GLOW.length],
  dx: (rand() - 0.5) * 70,
  dy: (rand() - 0.5) * 90,
  duration: 6000 + rand() * 5000,
}));

const SPARKS = Array.from({ length: 22 }, (_, i) => ({
  x: rand() * 100,
  y: rand() * 100,
  // Cogu kucuk, arada birkac iri yildiz.
  size: i % 6 === 0 ? 16 + rand() * 8 : 7 + rand() * 7,
  color: SPARKLE[i % SPARKLE.length],
  delay: rand() * 3000,
  duration: 1100 + rand() * 1800,
  spin: (rand() - 0.5) * 50,
}));

const MOTES = Array.from({ length: 9 }, () => ({
  x: rand() * 100,
  y: 30 + rand() * 70,
  size: 3 + rand() * 3,
  rise: 90 + rand() * 120,
  sway: (rand() - 0.5) * 40,
  delay: rand() * 5000,
  duration: 5000 + rand() * 4000,
}));

function useLoop(duration: number, delay = 0) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(t, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(t, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [t, duration, delay]);
  return t;
}

/** Yavasca suzulen isik lekesi. */
function Blob({ blob, index }: { blob: (typeof BLOBS)[number]; index: number }) {
  const t = useLoop(blob.duration);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${blob.x}%`,
        top: `${blob.y}%`,
        width: blob.size,
        height: blob.size,
        marginLeft: -blob.size / 2,
        marginTop: -blob.size / 2,
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, blob.dx] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, blob.dy] }) },
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) },
        ],
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={`blob${index}`} cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={blob.color} stopOpacity="0.26" />
            <Stop offset="1" stopColor={blob.color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={50} cy={50} r={50} fill={`url(#blob${index})`} />
      </Svg>
    </Animated.View>
  );
}

/** Yanip sonen dort koseli yildiz. */
function Spark({ spark }: { spark: (typeof SPARKS)[number] }) {
  const t = useLoop(spark.duration, spark.delay);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${spark.x}%`,
        top: `${spark.y}%`,
        width: spark.size,
        height: spark.size,
        opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.9] }),
        transform: [
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spark.spin}deg`] }) },
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1.2] }) },
        ],
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Path d={STAR} fill={spark.color} />
      </Svg>
    </Animated.View>
  );
}

/** Asagidan yukari suzulup sonen altin isik zerresi. */
function Mote({ mote }: { mote: (typeof MOTES)[number] }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(mote.delay),
      Animated.loop(
        Animated.timing(t, { toValue: 1, duration: mote.duration, easing: Easing.linear, useNativeDriver: true }),
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [t, mote.delay, mote.duration]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${mote.x}%`,
        top: `${mote.y}%`,
        width: mote.size,
        height: mote.size,
        borderRadius: mote.size / 2,
        backgroundColor: theme.color.accentBright,
        opacity: t.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.7, 0.5, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -mote.rise] }) },
          { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, mote.sway, 0] }) },
        ],
      }}
    />
  );
}

/** Ekranin arkasina yerlesen hareketli arka plan: isik lekeleri, yildizlar ve isik zerreleri. */
export function StarField() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.root]}>
      {BLOBS.map((b, i) => (
        <Blob key={`b${i}`} blob={b} index={i} />
      ))}
      {MOTES.map((m, i) => (
        <Mote key={`m${i}`} mote={m} />
      ))}
      {SPARKS.map((s, i) => (
        <Spark key={`s${i}`} spark={s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden', pointerEvents: 'none' },
});
