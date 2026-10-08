import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { Button } from '@k4/components/Button';
import { ScanCorners } from '@k3/components/ScanCorners';
import { StatusPill } from '@k3/components/StatusPill';
import { WordChip } from '@k4/components/WordChip';
import { API_URL } from '@ortak/config';
import { useFrameCapture } from '@k3/hooks/useFrameCapture';
import { useInferenceSocket } from '@k3/hooks/useInferenceSocket';
import { useWordTitle } from '@ortak/hooks/useWords';
import { useProgressStore } from '@ortak/store/useProgressStore';

const RESULT_VISIBLE_MS = 2500;

export default function CameraScreen() {
  const { target } = useLocalSearchParams<{ target?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [cameraReady, setCameraReady] = useState(false);
  const [speak, setSpeak] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  const titleOf = useWordTitle();
  const recordAttempt = useProgressStore((s) => s.recordAttempt);

  const granted = permission?.granted ?? false;
  const socket = useInferenceSocket(granted);
  useFrameCapture(cameraRef, granted && cameraReady, socket.canSend, socket.sendFrame);

  // Son tahmini birkaç saniye göster, sonra gizle.
  const [visible, setVisible] = useState(false);
  const { prediction } = socket;
  const success = !!target && prediction?.word === target;

  useEffect(() => {
    if (!prediction) return;
    setVisible(true);
    if (speak) Speech.speak(titleOf(prediction.word), { language: 'tr-TR' });
    if (target) recordAttempt(target, prediction.word === target);
    const t = setTimeout(() => setVisible(false), RESULT_VISIBLE_MS);
    return () => clearTimeout(t);
    // Sadece yeni tahmin geldiğinde çalışsın:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prediction?.at]);

  if (!permission) return <View className="flex-1 bg-ink" />;

  if (!granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-ink p-7">
        <Text className="text-center text-[15px] leading-6 text-fg">
          Sirius'un işaretleri görebilmesi için kamera izni gerekiyor.
        </Text>
        <Button title="Kameraya izin ver" onPress={requestPermission} />
      </View>
    );
  }

  const connectionPill =
    socket.status === 'open'
      ? socket.mock
        ? { label: 'Demo modu · model yok', tone: 'amber' as const }
        : { label: 'Bağlı', tone: 'ok' as const }
      : socket.status === 'connecting'
        ? { label: 'Sunucuya bağlanıyor', tone: 'dim' as const }
        : { label: 'Sunucuya ulaşılamıyor', tone: 'bad' as const };

  const handPill =
    socket.hand === null
      ? null
      : socket.hand
        ? { label: `El görüldü · ${socket.filled}/${socket.windowSize}`, tone: 'accent' as const }
        : { label: 'El görünmüyor', tone: 'dim' as const };

  return (
    <View className="flex-1 bg-ink">
      <Stack.Screen options={{ title: target ? `Dene: ${titleOf(target)}` : 'Canlı Tanıma' }} />
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        animateShutter={false}
        onCameraReady={() => setCameraReady(true)}
      />

      {/* Kameranın üstündeki katman */}
      <View pointerEvents="box-none" className="absolute inset-0">
        <ScanCorners active={socket.hand === true} />

        <View className="absolute left-4 right-4 top-4 gap-2">
          <StatusPill label={connectionPill.label} tone={connectionPill.tone} />
          {handPill ? <StatusPill label={handPill.label} tone={handPill.tone} /> : null}
          {socket.status === 'closed' ? (
            <Text className="text-xs text-dim">
              Backend çalışıyor mu? Adres: {API_URL} (mobil/.env içindeki EXPO_PUBLIC_API_URL)
            </Text>
          ) : null}
        </View>

        <View className="absolute bottom-10 left-5 right-5 gap-3">
          {visible && prediction ? (
            <WordChip
              title={titleOf(prediction.word)}
              confidence={prediction.confidence}
              tone={success ? 'ok' : 'accent'}
            />
          ) : null}
          {visible && target && prediction && !success ? (
            <Text className="text-center text-sm text-amber">
              Bu {titleOf(target)} değildi, tekrar deneyin.
            </Text>
          ) : null}

          <View className="flex-row justify-between">
            <Pressable
              onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
              className="rounded-full bg-ink/70 px-4 py-2"
            >
              <Text className="text-xs font-semibold text-fg">Kamerayı çevir</Text>
            </Pressable>
            {Platform.OS !== 'web' ? (
              <Pressable onPress={() => setSpeak((s) => !s)} className="rounded-full bg-ink/70 px-4 py-2">
                <Text className="text-xs font-semibold text-fg">Ses: {speak ? 'açık' : 'kapalı'}</Text>
              </Pressable>
            ) : null}
            {success ? (
              <Pressable onPress={() => router.back()} className="rounded-full bg-ok px-4 py-2">
                <Text className="text-xs font-bold text-ink">Doğru! Geri dön</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
