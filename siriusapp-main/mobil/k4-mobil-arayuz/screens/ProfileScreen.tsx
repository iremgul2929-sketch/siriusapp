import { ScrollView, Text, View } from 'react-native';

import { useWords } from '@ortak/hooks/useWords';
import { useProgressStore } from '@ortak/store/useProgressStore';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-xl border border-line bg-panel p-4">
      <Text className="text-2xl font-extrabold text-fg">{value}</Text>
      <Text className="mt-1 text-xs text-dim">{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { data: words } = useWords();
  const { learned, attempts, successes } = useProgressStore();
  const rate = attempts ? Math.round((successes / attempts) * 100) : 0;

  return (
    <ScrollView className="flex-1 bg-ink" contentContainerClassName="p-5">
      <View className="mb-6 flex-row gap-3">
        <Stat label="Öğrenilen kelime" value={`${learned.length}/${words?.length ?? 0}`} />
        <Stat label="Deneme" value={String(attempts)} />
        <Stat label="Başarı" value={`%${rate}`} />
      </View>

      <Text className="mb-3 text-xs font-bold tracking-widest text-dim">ÖĞRENİLENLER</Text>
      {learned.length === 0 ? (
        <Text className="text-dim">
          Sözlükten bir kelime seçip "Şimdi sen dene" ile başlayın.
        </Text>
      ) : (
        learned.map((id) => (
          <Text key={id} className="mb-2 text-base text-fg">
            {words?.find((w) => w.id === id)?.title ?? id}
          </Text>
        ))
      )}

      <Text className="mt-8 text-xs leading-5 text-dim">
        İlerleme şimdilik sadece bu oturumda tutuluyor. Hesap ve kalıcı kayıt H9-H11'de eklenecek.
      </Text>
    </ScrollView>
  );
}
