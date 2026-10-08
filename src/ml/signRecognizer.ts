import { dictionary } from '@/data/dictionary';
import recognizable from '@/data/recognizable.json';
import { signFor, type Pose } from '@/data/signs';
import type { Pt } from './handModel';
import { SignMatcher } from './signMatcher';

/**
 * Canli ceviri: kameradan gelen el noktalarini sozlukteki BUTUN isaretlerle
 * ayni anda karsilastirir ve tamamlanan isareti kelime olarak dondurur.
 *
 * Kural tabanlidir (her kelime icin bir SignMatcher); egitilmis bir model
 * degildir ve sozlukteki temsili pozlari tanir. Gercek TID cevirisi icin
 * `ml/model.ts` icindeki model cikarimi doldurulmalidir.
 */

const SETTLE_MS = 700; // ilk eslesmeden sonra daha belirgin bir isaret icin bekleme
const COOLDOWN_MS = 900; // bir kelimeden sonra kisa ara
const REPEAT_MS = 4000; // ayni kelimenin el hic kaybolmadan tekrar yazilma suresi
const LOST_MS = 600;

/** Bir pozun kac parmagi kisitladigi (checkShape ile ayni kurallar). */
function constraints(p: Pose) {
  const rest = p.f.slice(1);
  const thumbFree =
    (rest.every((v) => v >= 0.8) && p.f[0] >= 0.8) || rest.every((v) => v > 0.2 && v < 0.8);
  return p.f.filter((v, i) => !(i === 0 && thumbFree) && (v >= 0.8 || v <= 0.2)).length;
}

/**
 * Poz dizisi ne kadar ayirt edici? En az kisitli poz belirler (her ele uyan
 * bir poz iceren isaret 0 alir), hareketler ve sekil degisimi puan ekler.
 */
export function specificity(poses: Pose[], movements: number) {
  // Destek eli de sekil kisitlar: iki elli isaretler daha ayirt edicidir.
  const support = poses.find((p) => p.o)?.o;
  const supportScore = support ? 3 + constraints({ f: support }) : 0;
  const perPose = poses.map(constraints);
  const weakest = Math.min(...perPose);
  if (weakest === 0 && supportScore === 0) return 0;
  const shapeChange = poses.some((p) => p.f.some((v, i) => Math.abs(v - poses[0].f[i]) >= 0.2))
    ? 2
    : 0;
  return weakest + shapeChange + 3 * movements + supportScore;
}

export interface RecognizerState {
  /** Karede el var mi? */
  hand: boolean;
  /** Bu karede taninan kelime (yoksa null). */
  word: string | null;
}

export class SignRecognizer {
  private readonly entries;

  /**
   * `ids`: ceviride aranacak kelimeler. Varsayilan liste (recognizable.json)
   * birbirinden kesin ayirt edilebilen isaretlerdir; sozluk ya da pozlar
   * degisince yeniden uretilmelidir.
   */
  constructor(ids: readonly string[] = recognizable) {
    const wanted = new Set(ids);
    this.entries = dictionary
      .filter((w) => wanted.has(w.id))
      .map((w) => {
        const poses = signFor(w.id);
        const matcher = new SignMatcher(poses);
        return { id: w.id, matcher, score: specificity(poses, matcher.movements) };
      })
      // Hicbir parmak kisiti olmayan pozlar her ele uyar; ceviride kullanilamaz.
      .filter((e) => e.score > 0);
  }

  private pending: { id: string; score: number; at: number } | null = null;
  private cooldownUntil = 0;
  private last: { id: string; at: number } | null = null;
  private lastSeen = 0;

  get size() {
    return this.entries.length;
  }

  reset() {
    this.entries.forEach((e) => e.matcher.reset());
    this.pending = null;
    this.cooldownUntil = 0;
    this.last = null;
  }

  push(lm: Pt[] | null, now: number, lm2: Pt[] | null = null): RecognizerState {
    if (!lm && lm2) {
      lm = lm2;
      lm2 = null;
    }
    if (lm) this.lastSeen = now;
    else if (this.last && now - this.lastSeen > LOST_MS) this.last = null; // el indi: ayni kelime yeniden yazilabilir

    if (now < this.cooldownUntil) return { hand: !!lm, word: null };

    for (const e of this.entries) {
      const s = e.matcher.push(lm, now, lm2);
      if (s.status === 'fail') e.matcher.reset();
      else if (s.status === 'success' && (!this.pending || e.score > this.pending.score)) {
        this.pending = { id: e.id, score: e.score, at: this.pending?.at ?? now };
      }
    }

    if (!this.pending || now - this.pending.at < SETTLE_MS) return { hand: !!lm, word: null };

    const { id } = this.pending;
    this.entries.forEach((e) => e.matcher.reset());
    this.pending = null;
    this.cooldownUntil = now + COOLDOWN_MS;
    if (this.last && this.last.id === id && now - this.last.at < REPEAT_MS)
      return { hand: !!lm, word: null };
    this.last = { id, at: now };
    return { hand: !!lm, word: id };
  }
}
