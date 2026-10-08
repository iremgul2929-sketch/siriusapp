import { useEffect, useMemo, useRef } from 'react';
import { View, type ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';
import { trackerHtml } from '@/ml/trackerHtml';
import type { TrackerMessage } from './HandTracker.types';

/** Tarayicida el takibi: ayni takip sayfasi bir iframe icinde calisir. */
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
  const frame = useRef<HTMLIFrameElement>(null);
  const handler = useRef(onMessage);
  useEffect(() => {
    handler.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data?.__sirius) return;
      try {
        handler.current(JSON.parse(e.data.data));
      } catch {
        // bozuk mesaji yok say
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);

  return (
    <View style={[{ flex: 1, backgroundColor: theme.color.bgDeep }, style]}>
      <iframe
        ref={frame}
        srcDoc={html}
        allow="camera"
        style={{ border: 0, width: '100%', height: '100%' }}
        title="El takibi"
      />
    </View>
  );
}
