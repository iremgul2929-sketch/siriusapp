import words from './words.json';

export interface DictionaryWord {
  id: string;
  title: string;
  categoryId: string;
  videoUrl: string;
}

export interface Category {
  id: string;
  title: string;
  wordCount: number;
}

const CATEGORY_TITLES: Record<string, string> = {
  gunluk: 'Günlük Hayat',
  aile: 'Aile',
  sayilar: 'Sayılar',
  acil: 'Acil Durum',
  renkler: 'Renkler',
  zaman: 'Zaman',
  duygular: 'Duygular',
  yiyecek: 'Yiyecek ve İçecek',
  okul: 'Okul',
  ev: 'Ev',
  hayvanlar: 'Hayvanlar',
  meslekler: 'Meslekler',
  fiiller: 'Fiiller',
  sorular: 'Sorular ve Zamirler',
  yerler: 'Yerler',
  doga: 'Doğa ve Hava',
  beden: 'Beden',
  ulasim: 'Ulaşım',
  sifatlar: 'Sıfatlar',
};

export const dictionary: DictionaryWord[] = words;

const counts = new Map<string, number>();
for (const w of dictionary) {
  counts.set(w.categoryId, (counts.get(w.categoryId) ?? 0) + 1);
}

export const categories: Category[] = Array.from(counts.entries()).map(([id, wordCount]) => ({
  id,
  title: CATEGORY_TITLES[id] ?? id,
  wordCount,
}));
