import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { FullPose } from '@/ml/handModel';
import type { Tutor } from '@/data/tutors';
import { avatarHtml } from '@/ml/avatarHtml';

/**
 * Telefonda (Expo Go dahil) 3B avatar: three.js sahnesi bir WebView icinde
 * calisir. Web surumu: Avatar3D.web.tsx
 */
export function Avatar3D({
  poses,
  color,
  tutor,
  onStatus,
}: {
  poses: FullPose[];
  color: string;
  tutor: Tutor;
  onStatus: (ok: boolean) => void;
}) {
  const html = useMemo(() => avatarHtml(poses, color, tutor), [poses, color, tutor]);

  return (
    <WebView
      source={{ html, baseUrl: 'https://localhost' }}
      originWhitelist={['*']}
      javaScriptEnabled
      scrollEnabled={false}
      overScrollMode="never"
      onMessage={(e) => {
        try {
          onStatus(JSON.parse(e.nativeEvent.data).type === 'ready');
        } catch {
          // bozuk mesaji yok say
        }
      }}
      onError={() => onStatus(false)}
      style={styles.web}
    />
  );
}

const styles = StyleSheet.create({
  // opacity: Android'de WebView'in bazi cihazlarda bos/siyah cizilmesini onler.
  web: { flex: 1, backgroundColor: 'transparent', opacity: 0.99 },
});
