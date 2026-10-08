import { useCallback, useEffect, useRef, useState } from 'react';

import { WS_URL } from '@ortak/config';
import type { Prediction, ServerMessage } from '@ortak/types';

export type SocketStatus = 'connecting' | 'open' | 'closed';

/**
 * Backend'deki /ws/infer'e bağlanır, kopunca artan aralıklarla yeniden dener.
 * Sunucu bir kareyi onaylamadan (frame_ack) yenisini göndermez; böylece
 * yavaş ağda kareler birikip gecikme büyümez.
 */
export function useInferenceSocket(enabled: boolean) {
  const [status, setStatus] = useState<SocketStatus>('connecting');
  const [mock, setMock] = useState(false);
  const [hand, setHand] = useState<boolean | null>(null);
  const [filled, setFilled] = useState(0);
  const [windowSize, setWindowSize] = useState(30);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const awaitingAck = useRef(false);
  const retries = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      setStatus('connecting');
      const ws = new WebSocket(`${WS_URL}/ws/infer`);
      wsRef.current = ws;
      awaitingAck.current = false;

      ws.onopen = () => {
        retries.current = 0;
        setError(null);
        setStatus('open');
      };
      ws.onmessage = (event) => {
        let msg: ServerMessage;
        try {
          msg = JSON.parse(String(event.data)) as ServerMessage;
        } catch {
          return;
        }
        switch (msg.type) {
          case 'ready':
            setMock(msg.mock);
            setWindowSize(msg.window);
            break;
          case 'frame_ack':
            awaitingAck.current = false;
            setHand(msg.hand);
            setFilled(msg.filled);
            break;
          case 'prediction':
            setPrediction({ ...msg, at: Date.now() });
            break;
          case 'error':
            awaitingAck.current = false;
            setError(msg.message);
            break;
        }
      };
      ws.onerror = () => ws.close();
      ws.onclose = () => {
        wsRef.current = null;
        if (cancelled) return;
        setStatus('closed');
        const delay = Math.min(1000 * 2 ** retries.current, 8000);
        retries.current += 1;
        timer = setTimeout(connect, delay);
      };
    };

    connect();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled]);

  const canSend = useCallback(
    () => wsRef.current?.readyState === WebSocket.OPEN && !awaitingAck.current,
    [],
  );

  const sendFrame = useCallback((base64: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || awaitingAck.current) return false;
    awaitingAck.current = true;
    ws.send(JSON.stringify({ type: 'frame', image: base64, ts: Date.now() }));
    return true;
  }, []);

  const reset = useCallback(() => {
    setPrediction(null);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'reset' }));
    }
  }, []);

  return { status, mock, hand, filled, windowSize, prediction, error, canSend, sendFrame, reset };
}
