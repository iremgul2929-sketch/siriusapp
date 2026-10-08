import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@k4/components/Button';
import { useWords } from '@ortak/hooks/useWords';
import { useProgressStore } from '@ortak/store/useProgressStore';

export default function WordScreen() {
  const { word: wordId } = useLocalSearchParams<{ word: string }>();
  const { data: words } = useWords();
  const learned = useProgressStore((s) => s.learned.includes(wordId));
  const word = words?.find((w) => w.id === wordId);

  if (!word) {
    return (
      <View className="flex-1 items-center justify-center bg-ink">
        <Text className="text-dim">Kelime bulunamadı</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ink p-5">
      <Stack.Screen options={{ title: word.title }} />
      <Text className="mb-1 text-3xl font-extrabold text-fg">{word.title}</Text>
      <Text className={`mb-5 text-xs ${learned ? 'text-ok' : 'text-dim'}`}>
        {learned ? 'Öğrenildi' : 'Henüz denenmedi'}
      </Text>

      {/* H6 (K4): expo-video ile word.videoUrl oynatılacak. Video gelene kadar yer tutucu. */}
      <View className="mb-6 aspect-video items-center justify-center rounded-2xl border border-dashed border-line bg-panel">
        <Text className="text-center text-[13px] leading-5 text-dim">
          {word.videoUrl ? 'Video oynatıcı (H6)' : 'Beden dili videosu\nhenüz eklenmedi'}
        </Text>
      </View>

      <Button
        title="Şimdi sen dene"
        onPress={() => router.push({ pathname: '/camera', params: { target: word.id } })}
      />
    </View>
  );
}
