import { useMemo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '@/constants/theme';
import { trackerHtml } from '@/ml/trackerHtml';
import type { TrackerMessage } from './HandTracker.types';

/**
 * Telefonda (Expo Go dahil) el takibi: kamera ve MediaPipe bir WebView icinde
 * calisir, el noktalari mesajla gelir. Web surumu: HandTracker.web.tsx
 */
export function HandTracker({
  color,
  onMessage,
  style,
}: {
  color: string;
  onMessage: (m: TrackerMessage) => void;
  style?: ViewStyle;
}) {
  const html = useMemo(() => trackerHtml(color), [color]);

  return (
    <WebView
      source={{ html, baseUrl: 'https://localhost' }}
      originWhitelist={['*']}
      javaScriptEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      mediaCapturePermissionGrantType="grant"
      onMessage={(e) => {
        try {
          onMessage(JSON.parse(e.nativeEvent.data));
        } catch {
          // bozuk mesaji yok say
        }
      }}
      style={[styles.web, style]}
    />
  );
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: theme.color.bgDeep },
});
