export interface Word {
  id: string;
  title: string;
  categoryId: string;
  videoUrl: string | null;
}

export interface Category {
  id: string;
  title: string;
  wordCount: number;
}

// --- /ws/infer mesajları (docs/mimari.md) ---

export type ServerMessage =
  | { type: 'ready'; mock: boolean; window: number; labels: string[]; handDetection: boolean }
  | { type: 'frame_ack'; hand: boolean | null; filled: number }
  | { type: 'prediction'; word: string; confidence: number; mock: boolean }
  | { type: 'error'; message: string };

export type Prediction = Extract<ServerMessage, { type: 'prediction' }> & { at: number };
