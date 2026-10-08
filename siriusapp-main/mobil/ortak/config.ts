const raw = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

/** Backend REST adresi, örn. http://192.168.1.50:8000 */
export const API_URL = raw.replace(/\/+$/, '');

/** Aynı adresin WebSocket hâli, örn. ws://192.168.1.50:8000 */
export const WS_URL = API_URL.replace(/^http/, 'ws');

/** Kamera kareleri arası hedef süre (ms). 250 ms ≈ saniyede 4 kare. */
export const FRAME_INTERVAL_MS = 250;
