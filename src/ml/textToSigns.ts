import { dictionary, type DictionaryWord } from '@/data/dictionary';

/** Yazidan isarete ceviri: metni sozlukteki kelimelere boler. */

export interface TextToken {
  /** Kullanicinin yazdigi hali. */
  text: string;
  /** Sozlukteki karsiligi; yoksa null (isareti gosterilemez). */
  word: DictionaryWord | null;
}

const MAP: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  â: 'a',
  î: 'i',
  û: 'u',
};

/** Sozluk kimlikleriyle ayni kural: kucuk harf, Turkce harfler sade, bosluksuz. */
const key = (s: string) =>
  s
    .replace(/[İI]/g, 'i')
    .toLowerCase()
    .replace(/[çğıöşüâîû]/g, (c) => MAP[c])
    .replace(/[^a-z0-9]/g, '');

const byId = new Map(dictionary.map((w) => [w.id, w]));
const MAX_WORDS = 3; // "Ne zaman", "İyi geceler" gibi cok kelimeli basliklar

export function textToSigns(text: string): TextToken[] {
  const parts = text.split(/[\s.,!?;:()"“”]+/).filter(Boolean);
  const tokens: TextToken[] = [];
  for (let i = 0; i < parts.length;) {
    let matched = false;
    for (let n = Math.min(MAX_WORDS, parts.length - i); n >= 1 && !matched; n--) {
      const slice = parts.slice(i, i + n);
      const word = byId.get(key(slice.join('')));
      if (word) {
        tokens.push({ text: slice.join(' '), word });
        i += n;
        matched = true;
      }
    }
    if (!matched) {
      tokens.push({ text: parts[i], word: stemToWord(key(parts[i])) });
      i += 1;
    }
  }
  return tokens;
}

// --- Cekimli kelimeler: "okula" -> Okul, "gidiyorum" -> Gitmek ---
// Anahtarlar sade harfli oldugu icin unlu uyumu i/u ve a/e ciftlerine iner.

/** Eki atilinca yanlis kelimeye donecek baglac ve edatlar ("için" -> İçmek gibi). */
const SKIP = new Set([
  'icin',
  'ile',
  'bile',
  'ama',
  'gibi',
  'kadar',
  'daha',
  'diye',
  'ise',
  'hem',
  'veya',
  'cunku',
  'degil',
  'kara',
  'kari',
  'ati',
  'ata',
]);

/** Kurala uymayan zamir cekimleri. */
const IRREGULAR: Record<string, string> = {
  bana: 'ben',
  sana: 'sen',
  ona: 'o',
  onu: 'o',
  onun: 'o',
  onda: 'o',
  ondan: 'o',
  bunu: 'bu',
  buna: 'bu',
  bunun: 'bu',
  bunda: 'bu',
  bundan: 'bu',
  bize: 'biz',
  size: 'siz',
};

// Uzun ekler once denenir; tek harfliler en sonda.
const SUFFIXES = [
  'sunuz',
  'siniz',
  'acak',
  'ecek',
  'acag',
  'eceg',
  'iyor',
  'uyor',
  'imiz',
  'umuz',
  'iniz',
  'unuz',
  'mali',
  'meli',
  'yor',
  'lar',
  'ler',
  'dan',
  'den',
  'tan',
  'ten',
  'nin',
  'nun',
  'yla',
  'yle',
  'mis',
  'mus',
  'dir',
  'dur',
  'tir',
  'tur',
  'sun',
  'sin',
  'miz',
  'muz',
  'yim',
  'yum',
  'da',
  'de',
  'ta',
  'te',
  'di',
  'du',
  'ti',
  'tu',
  'in',
  'un',
  'im',
  'um',
  'iz',
  'uz',
  'la',
  'le',
  'ya',
  'ye',
  'yi',
  'yu',
  'si',
  'su',
  'ir',
  'ur',
  'ar',
  'er',
  'a',
  'e',
  'i',
  'u',
];
// Yalnizca unluden sonra gelen tek harfli kisi / iyelik ekleri: "annem", "geldik".
const AFTER_VOWEL = ['m', 'n', 'k'];
const VOWEL = /[aeiou]$/;
// Ek alinca yumusayan son harf: kitab(i) -> kitap, gid(iyor) -> git, ayag(i) -> ayak.
const HARDEN: Record<string, string> = { b: 'p', d: 't', g: 'k' };
const MIN_STEM = 2;
const MAX_DEPTH = 4;

const harden = (s: string) => {
  const last = HARDEN[s[s.length - 1]];
  return last ? s.slice(0, -1) + last : s;
};

function strip(s: string): string[] {
  const out: string[] = [];
  for (const suffix of SUFFIXES) {
    if (s.length - suffix.length >= MIN_STEM && s.endsWith(suffix))
      out.push(s.slice(0, -suffix.length));
  }
  for (const suffix of AFTER_VOWEL) {
    if (s.length - 1 >= MIN_STEM && s.endsWith(suffix) && VOWEL.test(s.slice(0, -1)))
      out.push(s.slice(0, -1));
  }
  return out;
}

/** Govdenin isim / sifat olarak sozlukteki karsiligi. */
function asNoun(stem: string) {
  const direct = byId.get(stem) ?? byId.get(harden(stem));
  if (direct) return direct;
  // Dusen unlu: burn(u) -> burun, agz(i) -> agiz.
  if (stem.length >= 3 && !VOWEL.test(stem)) {
    for (const v of ['i', 'u']) {
      const word = byId.get(stem.slice(0, -1) + v + stem.slice(-1));
      if (word) return word;
    }
  }
  return undefined;
}

/** Govdenin fiil olarak sozlukteki karsiligi (mastar haliyle aranir). */
function asVerb(stem: string) {
  // "-iyor" onundeki daralan unlu geri gelir: ist(iyor) -> istemek, oyn(uyor) -> oynamak.
  for (const s of [stem, harden(stem), stem + 'a', stem + 'e']) {
    const word = byId.get(s + 'mak') ?? byId.get(s + 'mek');
    if (word) return word;
  }
  return undefined;
}

/** Ekleri adim adim atarak sozlukte karsilik arar; bulamazsa null. */
function stemToWord(k: string): DictionaryWord | null {
  if (SKIP.has(k)) return null;
  const irregular = byId.get(IRREGULAR[k] ?? '');
  if (irregular) return irregular;

  let level = [k];
  const seen = new Set(level);
  for (let depth = 0; depth <= MAX_DEPTH && level.length; depth++) {
    // Ayni adimda once uzun govdeler, once isim sonra fiil: "okula" -> Okul (Okumak degil).
    level.sort((a, b) => b.length - a.length);
    for (const stem of level) {
      const word = asNoun(stem);
      if (word) return word;
    }
    for (const stem of level) {
      const word = asVerb(stem);
      if (word) return word;
    }
    const next: string[] = [];
    for (const stem of level) {
      for (const shorter of strip(stem)) {
        if (!seen.has(shorter)) {
          seen.add(shorter);
          next.push(shorter);
        }
      }
    }
    level = next;
  }
  return null;
}
