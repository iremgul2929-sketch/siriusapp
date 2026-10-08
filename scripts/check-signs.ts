/**
 * Isaret tutarlilik kontrolu: her kelimenin isaretini kamerada yapiyormus gibi
 * kare kare uretir ve uygulamanin kendi dogrulayicilarindan gecirir.
 * Calistirma: npx tsx scripts/check-signs.ts
 */
import { dictionary } from '@/data/dictionary';
import recognizable from '@/data/recognizable.json';
import { signFor } from '@/data/signs';
import { SignMatcher } from '@/ml/signMatcher';
import { SignRecognizer } from '@/ml/signRecognizer';
import { perform as performSign, STEP } from './signSim';

const perform = (id: string) => performSign(signFor(id));


// 1) Kamera pratigi: her kelimenin kendi isareti kendi dogrulayicisindan geciyor mu?
const practiceFail: string[] = [];
for (const w of dictionary) {
  const m = new SignMatcher(signFor(w.id));
  let s = m.snapshot();
  for (const f of perform(w.id)) s = m.push(f.lm, f.t, f.lm2);
  if (s.status !== 'success') practiceFail.push(`${w.id}(${s.status}:${s.hint})`);
}
console.log(`PRATIK: ${dictionary.length - practiceFail.length}/${dictionary.length} gecti`);
if (practiceFail.length) console.log('  kalan:', practiceFail.join(' '));

// 2) Ayni poz dizisi iki kelimeye atanmis mi?
const seen = new Map<string, string>();
const dup: string[] = [];
for (const w of dictionary) {
  const k = JSON.stringify(signFor(w.id));
  if (seen.has(k)) dup.push(`${w.id}=${seen.get(k)}`);
  else seen.set(k, w.id);
}
console.log(`AYNI ISARET: ${dup.length}`, dup.join(' '));
console.log(`IKI ELLI: ${dictionary.filter((w) => signFor(w.id).some((p) => p.o)).length}/${dictionary.length}`);

// 3) Canli ceviri: isareti yapinca dogru kelime mi yaziliyor?
const rec = new Set(recognizable as string[]);
const wrong: string[] = [];
const missed: string[] = [];
const falseHits: string[] = [];
let ok = 0;
for (const w of dictionary) {
  const r = new SignRecognizer();
  const out: string[] = [];
  let last = 0;
  for (const f of perform(w.id)) {
    const s = r.push(f.lm, f.t, f.lm2);
    if (s.word) out.push(s.word);
    last = f.t;
  }
  for (let k = 0; k < 40; k++) {
    const s = r.push(null, (last += STEP));
    if (s.word) out.push(s.word);
  }
  if (rec.has(w.id)) {
    if (out.length === 1 && out[0] === w.id) ok++;
    else if (out.length === 0) missed.push(w.id);
    else wrong.push(`${w.id}->${out.join('+')}`);
  } else if (out.length) falseHits.push(`${w.id}->${out.join('+')}`);
}
console.log(`CANLI CEVIRI: taninan ${rec.size} kelimeden ${ok} dogru, ${missed.length} kacti, ${wrong.length} yanlis`);
if (missed.length) console.log('  kacan:', missed.join(' '));
if (wrong.length) console.log('  yanlis:', wrong.join(' '));
console.log(
  `LISTE DISI: ${dictionary.length - rec.size} kelimeden ${falseHits.length} tanesi baska kelime olarak yaziliyor`,
);
if (falseHits.length) console.log(' ', falseHits.join(' '));
const ids = new Set(dictionary.map((w) => w.id));
const stale = (recognizable as string[]).filter((i) => !ids.has(i));
console.log('LISTEDE SOZLUKTE OLMAYAN:', stale.join(' ') || 'yok');
