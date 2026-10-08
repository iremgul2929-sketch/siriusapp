import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { theme } from '@/constants/theme';

const COLORS = [theme.color.accentBright, theme.color.accent, '#FFF6DC', '#B89AF0', '#D2566E', '#5FC596'];
const COUNT = 36;

/** Ders sonu kutlamasi: yukaridan dusen altin ve renkli kagit parcalari. */
export function Confetti() {
  const { width, height } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));

  // Rastgele degerler bir kez uretilir; x ekran genisligine oran olarak tutulur.
  const [pieces] = useState(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      x: Math.random(),
      drift: (Math.random() - 0.5) * 120,
      delay: Math.random() * 0.35,
      spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
      size: 6 + Math.random() * 7,
      round: i % 3 === 0,
      color: COLORS[i % COLORS.length],
    })),
  );

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => {
        const t = progress.interpolate({
          inputRange: [0, p.delay, 1],
          outputRange: [0, 0, 1],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x * width,
              top: -20,
              width: p.size,
              height: p.round ? p.size : p.size * 1.8,
              borderRadius: p.round ? p.size / 2 : 2,
              backgroundColor: p.color,
              opacity: t.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
              transform: [
                { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.9] }) },
                { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
                { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
              ],
            }}
          />
        );
      })}
    </View>
  );
}
