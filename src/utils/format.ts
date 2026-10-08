export function formatConfidence(value: number): string {
  return `%${Math.round(value * 100)}`;
}

const PLAIN: Record<string, string> = {
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

/** Arama icin sadelestirir: kucuk harf, Turkce harfler duz ("Öğretmen" -> "ogretmen"). */
export function searchKey(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşüâîû]/g, (c) => PLAIN[c]);
}
