/**
 * Canli ceviride kullanilacak kelime listesini (src/data/recognizable.json) uretir:
 * isareti yapildiginda taniyicinin yalnizca o kelimeyi yazdigi kelimeler.
 * Listeden biri cikinca digerlerinin sonucu degisebildigi icin kararli hale
 * gelene kadar tekrarlanir.
 *
 * Calistirma: npx tsx scripts/build-recognizable.ts   (generate-signs.ts'ten sonra)
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dictionary } from '@/data/dictionary';
import { signFor } from '@/data/signs';
import { SignRecognizer } from '@/ml/signRecognizer';
import { perform, STEP, type Frame } from './signSim';

const frames = new Map<string, Frame[]>(dictionary.map((w) => [w.id, perform(signFor(w.id))]));

function written(id: string, ids: string[]): string[] {
  const r = new SignRecognizer(ids);
  const out: string[] = [];
  let last = 0;
  for (const f of frames.get(id)!) {
    const s = r.push(f.lm, f.t, f.lm2);
    if (s.word) out.push(s.word);
    last = f.t;
  }
  for (let k = 0; k < 40; k++) {
    const s = r.push(null, (last += STEP));
    if (s.word) out.push(s.word);
  }
  return out;
}

let ids = dictionary.map((w) => w.id);
for (;;) {
  // Dogru kelimenin yanina fazladan yazilan kelime varsa suclu odur (isareti
  // baskasinin icinde de gorunuyor); dogru kelime hic yazilmiyorsa kelimenin kendisi cikar.
  const drop = new Set<string>();
  const notes: string[] = [];
  for (const id of ids) {
    const out = written(id, ids);
    if (out.length === 1 && out[0] === id) continue;
    notes.push(`${id}->${out.join('+') || '-'}`);
    if (out.includes(id)) out.filter((o) => o !== id).forEach((o) => drop.add(o));
    else drop.add(id);
  }
  if (!drop.size) break;
  console.log('Sorunlu:', notes.join(' '), '| cikarilan:', [...drop].join(' '));
  ids = ids.filter((id) => !drop.has(id));
}
writeFileSync(join(__dirname, '..', 'src', 'data', 'recognizable.json'), JSON.stringify(ids) + '\n');
console.log(`Canli ceviride taninan: ${ids.length}/${dictionary.length}`);
