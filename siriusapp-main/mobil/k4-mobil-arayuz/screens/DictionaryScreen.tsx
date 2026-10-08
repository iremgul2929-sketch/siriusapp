import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, View } from 'react-native';

import { Card } from '@k4/components/Card';
import { useCategories, useWords } from '@ortak/hooks/useWords';
import { useProgressStore } from '@ortak/store/useProgressStore';
import { colors } from '@ortak/theme';

export default function DictionaryScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const { data: words, isLoading } = useWords();
  const { data: categories } = useCategories();
  const learned = useProgressStore((s) => s.learned);
  const [query, setQuery] = useState('');

  const categoryTitle = categories?.find((c) => c.id === category)?.title;
  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return (words ?? [])
      .filter((w) => !category || w.categoryId === category)
      .filter((w) => !q || w.title.toLocaleLowerCase('tr-TR').includes(q));
  }, [words, category, query]);

  return (
    <View className="flex-1 bg-ink px-4 pt-3">
      <Stack.Screen options={{ title: categoryTitle ?? 'Sözlük' }} />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Kelime ara"
        placeholderTextColor={colors.dim}
        className="mb-3 rounded-xl border border-line bg-panel px-4 py-3 text-fg"
      />
      {isLoading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(w) => w.id}
          ListEmptyComponent={<Text className="mt-6 text-center text-dim">Sonuç yok</Text>}
          renderItem={({ item }) => (
            <Card
              title={item.title}
              subtitle={categories?.find((c) => c.id === item.categoryId)?.title}
              right={learned.includes(item.id) ? <Text className="text-xs text-ok">Öğrenildi</Text> : null}
              onPress={() => router.push({ pathname: '/learn/[word]', params: { word: item.id } })}
            />
          )}
        />
      )}
    </View>
  );
}
