import { API_URL } from '@ortak/config';
import localData from '@ortak/data/words.json'; // kaynak: <repo>/ortak/veri/words.json (elle düzenlemeyin)
import type { Category, Word } from '@ortak/types';

async function get<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${API_URL}${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

const local = localData as { categories: Omit<Category, 'wordCount'>[]; words: Word[] };

/** Backend'e ulaşılamazsa uygulama içindeki kopyayı kullanır (çevrimdışı da çalışsın). */
export async function fetchWords(): Promise<Word[]> {
  try {
    return await get<Word[]>('/words');
  } catch {
    return local.words;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    return await get<Category[]>('/categories');
  } catch {
    return local.categories.map((c) => ({
      ...c,
      wordCount: local.words.filter((w) => w.categoryId === c.id).length,
    }));
  }
}
