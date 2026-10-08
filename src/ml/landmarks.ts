import type { Landmark } from './types';

/**
 * Ham kare verisinden el landmark noktalarini cikarir.
 * Uretimde MediaPipe Tasks Vision (Hand Landmarker) native modulune
 * ya da bir TFLite landmark modeline baglanir.
 */
export async function extractHandLandmarks(_frame: unknown): Promise<Landmark[]> {
  // TODO: MediaPipe / native landmark modulune bagla.
  return [];
}

/** Koordinatlari bilek referans noktasina gore olcekler. */
export function normalizeLandmarks(points: Landmark[]): Landmark[] {
  if (points.length === 0) return points;
  const wrist = points[0];
  return points.map((p) => ({
    x: p.x - wrist.x,
    y: p.y - wrist.y,
    z: p.z - wrist.z,
  }));
}
