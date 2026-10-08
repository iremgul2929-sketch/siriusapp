export type TrackerMessage =
  | { type: 'ready' }
  | { type: 'error'; code: 'camera' | 'model'; message: string }
  /** `lm` ve `lm2`: karedeki eller, goruntude soldan saga (yoksa null). */
  | { type: 'frame'; t: number; lm: [number, number][] | null; lm2?: [number, number][] | null };
