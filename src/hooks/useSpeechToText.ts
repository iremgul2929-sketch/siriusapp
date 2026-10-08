import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import type { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

type SpeechModule = typeof ExpoSpeechRecognitionModule;

// Expo Go'da yerel konusma tanima modulu yoktur; paketi ancak modul varsa yukle.
function loadModule(): SpeechModule | null {
  try {
    if (Platform.OS !== 'web' && !requireOptionalNativeModule('ExpoSpeechRecognition')) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod: SpeechModule = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
    return mod.isRecognitionAvailable() ? mod : null;
  } catch {
    return null;
  }
}

const ERRORS: Record<string, string> = {
  'not-allowed': 'Mikrofon izni verilmedi.',
  'service-not-allowed': 'Bu cihazda konuşma tanıma kapalı.',
  'language-not-supported': 'Türkçe konuşma tanıma bu cihazda yok.',
  'no-speech': 'Ses duyulmadı. Tekrar dene.',
  'speech-timeout': 'Ses duyulmadı. Tekrar dene.',
  nomatch: 'Söylediğin anlaşılamadı. Tekrar dene.',
  network: 'İnternet bağlantını kontrol et.',
  'audio-capture': 'Mikrofona erişilemedi.',
};

/**
 * Mikrofondan Turkce konusmayi yaziya cevirir. `onText` konusma surerken ara
 * sonuclarla, bitince `final: true` ile cagrilir.
 */
export function useSpeechToText(onText: (text: string, final: boolean) => void) {
  const [mod] = useState(loadModule);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handler = useRef(onText);
  useEffect(() => {
    handler.current = onText;
  }, [onText]);

  useEffect(() => {
    if (!mod) return;
    const subs = [
      mod.addListener('start', () => setListening(true)),
      mod.addListener('end', () => setListening(false)),
      mod.addListener('result', (e) => {
        const text = e.results[0]?.transcript ?? '';
        if (text) handler.current(text, e.isFinal);
      }),
      mod.addListener('nomatch', () => setError(ERRORS.nomatch)),
      mod.addListener('error', (e) => {
        setListening(false);
        // Kullanici kendi durdurduysa hata gosterme.
        if (e.error !== 'aborted')
          setError(ERRORS[e.error] ?? 'Ses yazıya çevrilemedi. Tekrar dene.');
      }),
    ];
    return () => {
      subs.forEach((s) => s.remove());
      mod.abort();
    };
  }, [mod]);

  const start = useCallback(async () => {
    if (!mod) return;
    setError(null);
    try {
      const permission = await mod.requestPermissionsAsync();
      if (!permission.granted) {
        setError(ERRORS['not-allowed']);
        return;
      }
      mod.start({ lang: 'tr-TR', interimResults: true, continuous: false });
    } catch {
      setError('Ses yazıya çevrilemedi. Tekrar dene.');
    }
  }, [mod]);

  const stop = useCallback(() => mod?.stop(), [mod]);

  return { supported: !!mod, listening, error, start, stop };
}
