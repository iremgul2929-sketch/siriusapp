import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Button } from '@k4/components/Button';
import { Card } from '@k4/components/Card';
import { useCategories } from '@ortak/hooks/useWords';
import { useProgressStore } from '@ortak/store/useProgressStore';
import { colors } from '@ortak/theme';

export default function HomeScreen() {
  const { data: categories, isLoading } = useCategories();
  const learned = useProgressStore((s) => s.learned.length);
  const total = categories?.reduce((sum, c) => sum + c.wordCount, 0) ?? 0;

  return (
    <ScrollView className="flex-1 bg-ink" contentContainerClassName="p-5 pb-10">
      <Text className="mb-2 text-xs font-bold tracking-[2px] text-accent">SIRIUS</Text>
      <Text className="mb-1.5 text-3xl font-extrabold leading-9 text-fg">
        İşaret dilini{'\n'}anında anlayın.
      </Text>
      <Text className="mb-6 text-[13px] text-dim">
        {total} kelime · {learned} tanesini öğrendiniz
      </Text>

      <Button title="Canlı Tanımayı Başlat" onPress={() => router.push('/camera')} />
      <View className="mt-3 flex-row gap-3">
        <Button
          title="Sözlük"
          variant="secondary"
          className="flex-1"
          onPress={() => router.push('/learn')}
        />
        <Button
          title="İlerleme"
          variant="secondary"
          className="flex-1"
          onPress={() => router.push('/profile')}
        />
      </View>

      <Text className="mb-3 mt-8 text-xs font-bold tracking-widest text-dim">KATEGORİLER</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        categories?.map((c) => (
          <Card
            key={c.id}
            title={c.title}
            subtitle={`${c.wordCount} kelime`}
            onPress={() => router.push({ pathname: '/learn', params: { category: c.id } })}
          />
        ))
      )}
    </ScrollView>
  );
}
