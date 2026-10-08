import type { CameraView } from 'expo-camera';
import { type RefObject, useEffect, useRef } from 'react';

import { FRAME_INTERVAL_MS } from '@ortak/config';

/**
 * Faz 1 yöntemi: kameradan düşük kaliteli fotoğraf alıp base64 olarak verir.
 * Saniyede ~2-4 kare; prototip için yeterli. Faz 3'te (H17+) bunun yerine
 * react-native-vision-camera frame processor'ları kullanılacak.
 */
export function useFrameCapture(
  cameraRef: RefObject<CameraView | null>,
  active: boolean,
  canSend: () => boolean,
  onFrame: (base64: string) => void,
) {
  // Son fonksiyonları ref'te tut; döngü her render'da yeniden başlamasın.
  const canSendRef = useRef(canSend);
  const onFrameRef = useRef(onFrame);
  canSendRef.current = canSend;
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!active) return;
    let stopped = false;

    const loop = async () => {
      while (!stopped) {
        const started = Date.now();
        const camera = cameraRef.current;
        if (camera && canSendRef.current()) {
          try {
            const pic = await camera.takePictureAsync({
              quality: 0.3,
              base64: true,
              skipProcessing: true,
              shutterSound: false,
            });
            if (!stopped && pic?.base64) onFrameRef.current(pic.base64);
          } catch {
            // Kamera henüz hazır değil ya da meşgul; bir sonraki turda tekrar denenir.
          }
        }
        const wait = Math.max(30, FRAME_INTERVAL_MS - (Date.now() - started));
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
    };

    loop();
    return () => {
      stopped = true;
    };
  }, [active, cameraRef]);
}
