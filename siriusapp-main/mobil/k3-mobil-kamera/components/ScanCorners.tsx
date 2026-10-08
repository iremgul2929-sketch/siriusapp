import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '@ortak/theme';

/** Kamera üstündeki tarama çerçevesi. El görülünce turkuaz, görülmezse soluk yanıp söner. */
export function ScanCorners({ active }: { active: boolean }) {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const color = active ? colors.accent : colors.dim;

  return (
    <Animated.View pointerEvents="none" style={[styles.frame, { opacity: active ? 1 : pulse }]}>
      <View style={[styles.corner, styles.tl, { borderColor: color }]} />
      <View style={[styles.corner, styles.tr, { borderColor: color }]} />
      <View style={[styles.corner, styles.bl, { borderColor: color }]} />
      <View style={[styles.corner, styles.br, { borderColor: color }]} />
    </Animated.View>
  );
}

const SIZE = 28;
const W = 3;
const styles = StyleSheet.create({
  frame: { position: 'absolute', top: '16%', left: '8%', right: '8%', bottom: '30%' },
  corner: { position: 'absolute', width: SIZE, height: SIZE },
  tl: { top: 0, left: 0, borderTopWidth: W, borderLeftWidth: W, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderTopWidth: W, borderRightWidth: W, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderBottomWidth: W, borderLeftWidth: W, borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0, borderBottomWidth: W, borderRightWidth: W, borderBottomRightRadius: 10 },
});
