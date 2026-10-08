import type { Landmark, InferenceResult } from './types';

/**
 * assets/models/sirius.tflite modelini yukler ve landmark dizisini
 * kelime tahminine cevirir. Uretimde react-native-fast-tflite
 * (veya onnxruntime-react-native) kullanilir.
 */
let modelLoaded = false;

export async function loadModel(): Promise<void> {
  // TODO: assets/models/sirius.tflite dosyasini yukle.
  modelLoaded = true;
}

export async function runInference(buffer: Landmark[][]): Promise<InferenceResult> {
  if (!modelLoaded) await loadModel();
  // TODO: gercek model cikarimiyla degistir.
  return { word: '', confidence: 0 };
}
