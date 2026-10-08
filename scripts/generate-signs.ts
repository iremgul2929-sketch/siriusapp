/**
 * Elle yazilmis isareti olmayan kelimelere yer tutucu isaret atar ve
 * src/data/placeholderSigns.json dosyasini yazar (ardindan build-recognizable.ts calistirilir).
 *
 * Kural: hicbir isaret bir baskasinin dogrulayicisindan gecmemeli. Once tek
 * elli havuz denenir; yer kalmayinca ayni hareketler bir destek eliyle iki
 * elli hale getirilir.
 *
 * Calistirma: npx tsx scripts/generate-signs.ts   (sozluk ya da pozlar degisince)
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dictionary } from '@/data/dictionary';
import { placeholderPool, signs, SUPPORT_SHAPES, type Pose } from '@/data/signs';
import { SignMatcher } from '@/ml/signMatcher';
import { specificity } from '@/ml/signRecognizer';
import { perform, type Frame } from './signSim';

interface Entry {
  id: string;
  sign: Pose[];
  frames: Frame[];
  two: boolean;
}

const entry = (id: string, sign: Pose[]): Entry => ({
  id,
  sign,
  frames: perform(sign),
  two: sign.some((p) => p.o),
});

/** `sign`in dogrulayicisi bu kareleri kabul ediyor mu? */
function accepts(sign: Pose[], frames: Frame[]) {
  const m = new SignMatcher(sign);
  for (const f of frames) if (m.push(f.lm, f.t, f.lm2).status === 'success') return true;
  return false;
}

// Tek elli ve iki elli isaretler el sayisiyla zaten ayrilir.
const clash = (a: Entry, b: Entry) =>
  a.two === b.two && (accepts(a.sign, b.frames) || accepts(b.sign, a.frames));

function hash(id: string) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return h;
}

const accepted: Entry[] = [];

// Elle yazilmis isaretler sabittir; kendi aralarindaki cakismalar raporlanir.
for (const w of dictionary) {
  if (!signs[w.id]) continue;
  const e = entry(w.id, signs[w.id]);
  const hit = accepted.find((a) => clash(a, e));
  if (hit) console.log(`UYARI elle yazilmis cakisma: ${w.id} <-> ${hit.id}`);
  accepted.push(e);
}

const single = placeholderPool();
const double = SUPPORT_SHAPES.flatMap((o) => single.map((sign) => sign.map((p) => ({ ...p, o }))));
const cache = new Map<Pose[], Entry>();
const usedSign = new Set<Pose[]>();

function pickFrom(pool: Pose[][], id: string): Entry | null {
  const start = hash(id) % pool.length;
  for (let k = 0; k < pool.length; k++) {
    const sign = pool[(start + k) % pool.length];
    if (usedSign.has(sign)) continue;
    let c = cache.get(sign);
    if (!c) {
      c = entry('', sign);
      // Kendi dogrulayicisindan gecmeyen ya da her ele uyan (ayirt edici olmayan) aday kullanilamaz.
      if (!accepts(sign, c.frames) || specificity(sign, new SignMatcher(sign).movements) === 0) {
        usedSign.add(sign);
        continue;
      }
      cache.set(sign, c);
    }
    const candidate = c;
    if (!accepted.some((a) => clash(a, candidate))) {
      usedSign.add(sign);
      return { ...candidate, id };
    }
  }
  return null;
}

const out: Record<string, Pose[]> = {};
let twoHanded = 0;
const unassigned: string[] = [];
for (const w of dictionary) {
  if (signs[w.id]) continue;
  const e = pickFrom(single, w.id) ?? pickFrom(double, w.id);
  if (!e) {
    unassigned.push(w.id);
    continue;
  }
  accepted.push(e);
  out[w.id] = e.sign;
  if (e.two) twoHanded++;
}

const dataDir = join(__dirname, '..', 'src', 'data');
const body = Object.entries(out)
  .map(([id, sign]) => `  ${JSON.stringify(id)}: ${JSON.stringify(sign)}`)
  .join(',\n');
writeFileSync(join(dataDir, 'placeholderSigns.json'), `{\n${body}\n}\n`);

console.log(`Atanan: ${Object.keys(out).length} (iki elli: ${twoHanded}), atanamayan: ${unassigned.length}`);
if (unassigned.length) console.log('  ', unassigned.join(' '));
