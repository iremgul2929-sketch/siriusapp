import { useRef, useState, useCallback } from 'react';
import type { CameraView } from 'expo-camera';
import type { Landmark } from '@/ml/types';
import { extractHandLandmarks } from '@/ml/landmarks';
import { runInference } from '@/ml/model';

const WINDOW_SIZE = 30;
const CONFIDENCE_THRESHOLD = 0.85;

/**
 * Kamera akisindan el landmark'larini toplar, WINDOW_SIZE kareyi bir
 * tamponda biriktirir ve TFLite modeliyle siniflandirir.
 *
 * NOT: expo-camera su an kare-kare native frame islemeyi (frame processor)
 * sunmuyor. Gercek zamanli performans icin bu hook'un
 * `react-native-vision-camera` frame processor'larina tasinmasi onerilir;
 * burasi mimarinin yer tutucusudur (bkz. README "Sonraki adimlar").
 */
export function useSignRecognizer() {
  const cameraRef = useRef<CameraView>(null);
  const buffer = useRef<Landmark[][]>([]);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [word, setWord] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);

  const processFrame = useCallback(async (frame: unknown) => {
    const points = await extractHandLandmarks(frame);
    setLandmarks(points);
    buffer.current.push(points);

    if (buffer.current.length >= WINDOW_SIZE) {
      const result = await runInference(buffer.current);
      if (result.confidence > CONFIDENCE_THRESHOLD) {
        setWord(result.word);
        setConfidence(result.confidence);
      }
      buffer.current.shift();
    }
  }, []);

  const onFrame = useCallback(() => {
    // TODO: gercek frame stream'ine bagla (vision-camera frame processor).
  }, []);

  return { cameraRef, landmarks, word, confidence, onFrame, processFrame };
}
