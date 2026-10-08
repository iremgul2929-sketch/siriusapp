import { useState } from 'react';
import { View, FlatList, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { categories, dictionary } from '@/data/dictionary';
import { theme, categoryStyle, defaultCategoryStyle } from '@/constants/theme';
import { useProgress } from '@/store/useAppStore';
import { StarField } from '@/components/StarField';
import { Ornament } from '@/components/Ornament';
import { searchKey } from '@/utils/format';

export default function LearnIndexScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const learned = useProgress().learnedWordIds;

  const [query, setQuery] = useState('');
  const inCategory = category ? dictionary.filter((w) => w.categoryId === category) : dictionary;
  const q = searchKey(query);
  const words = q ? inCategory.filter((w) => searchKey(w.title).includes(q)) : inCategory;
  const title = categories.find((c) => c.id === category)?.title ?? 'Sözlük';
  const headerStyle = category ? (categoryStyle[category] ?? defaultCategoryStyle) : null;

  return (
    <View style={styles.container}>
      <StarField />
      <Stack.Screen options={{ title }} />
      <FlatList
        data={words}
        keyExtractor={(w) => w.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: theme.space.sm }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.subtitle}>
              {headerStyle ? headerStyle.subtitle : 'Bütün işaretler'} · {words.length} işaret
            </Text>
            <Ornament color={headerStyle?.color} />
            <View style={styles.search}>
              <Ionicons name="search" size={18} color={theme.color.fgMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="İşaret ara…"
                placeholderTextColor={theme.color.fgMuted}
                style={styles.searchInput}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={theme.color.fgMuted} />
                </Pressable>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>“{query}” diye bir işaret bulamadım.</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const style = categoryStyle[item.categoryId] ?? defaultCategoryStyle;
          const isLearned = learned.includes(item.id);
          return (
            <Link href={`/learn/${item.id}`} asChild>
              <Pressable style={styles.row}>
                <View style={[styles.seal, { borderColor: style.color }]}>
                  <Text style={[styles.sealText, { color: style.color }]}>
                    {toRoman(index + 1)}
                  </Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.word}>{item.title}</Text>
                  <Text style={styles.wordHint}>
                    {isLearned ? 'Ustalaştın' : 'Henüz öğrenilmedi'}
                  </Text>
                </View>
                {isLearned && <Ionicons name="sparkles" size={18} color={theme.color.accent} />}
                <Ionicons name="chevron-forward" size={18} color={theme.color.fgMuted} />
              </Pressable>
            </Link>
          );
        }}
      />
    </View>
  );
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let out = '';
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.color.bg },
  list: { padding: theme.space.xl, paddingTop: theme.space.sm },
  header: { marginBottom: theme.space.lg, gap: theme.space.md },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.color.panel,
    borderWidth: 2,
    borderColor: theme.color.locked,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.font.body,
    fontSize: 17,
    color: theme.color.fg,
    paddingVertical: 10,
    outlineStyle: 'none',
  } as object,
  empty: { alignItems: 'center', gap: 8, paddingTop: 40 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontFamily: theme.font.italic, color: theme.color.fgDim, fontSize: 17 },
  subtitle: { fontFamily: theme.font.italic, color: theme.color.fgDim, fontSize: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    backgroundColor: theme.color.panel,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: theme.space.md,
  },
  seal: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.bgDeep,
  },
  sealText: { fontFamily: theme.font.display, fontSize: 14 },
  rowBody: { flex: 1 },
  word: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 16 },
  wordHint: { fontFamily: theme.font.italic, color: theme.color.fgMuted, fontSize: 14 },
});
