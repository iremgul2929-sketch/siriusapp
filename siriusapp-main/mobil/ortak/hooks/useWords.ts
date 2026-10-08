import { useQuery } from '@tanstack/react-query';

import { fetchCategories, fetchWords } from '@ortak/services/api';
import type { Word } from '@ortak/types';

export function useWords() {
  return useQuery({ queryKey: ['words'], queryFn: fetchWords, staleTime: 5 * 60_000 });
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 5 * 60_000 });
}

/** Kelime id'sini ekranda gösterilecek başlığa çevirir ("tesekkur" → "Teşekkür"). */
export function useWordTitle() {
  const { data } = useWords();
  return (id: string) => data?.find((w: Word) => w.id === id)?.title ?? id;
}
