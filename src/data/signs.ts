/**
 * Kelime basina TEMSILI el animasyonlari. Bunlar gercek Turk Isaret Dili (TID)
 * hareketleri degildir; gercek gosterim videolari `assets/videos/` altina
 * eklenip `words.json` icindeki `videoUrl` alanina baglanana kadar yer tutucu
 * olarak kullanilir.
 *
 * Isaretler tek ya da iki elli olabilir: `o` verilirse ikinci (destek) el de
 * o parmak sekliyle kaldirilir.
 */
import placeholders from './placeholderSigns.json';

/** Parmak acikligi: [basparmak, isaret, orta, yuzuk, serce] — 1 acik, 0 kapali. */
export type Fingers = [number, number, number, number, number];

export interface Pose {
  f: Fingers;
  /** Bilegin yatay/dikey kaymasi (ekran genisliginin orani). */
  x?: number;
  y?: number;
  /** Derece cinsinden donus. */
  r?: number;
  /** Olcek. */
  s?: number;
  /** Iki elli isaretlerde ikinci (destek) elin parmak sekli. */
  o?: Fingers;
}

const OPEN: Fingers = [1, 1, 1, 1, 1];
const FIST: Fingers = [0, 0, 0, 0, 0];
const POINT: Fingers = [0, 1, 0, 0, 0];
const V: Fingers = [0, 1, 1, 0, 0];
const THREE: Fingers = [1, 1, 1, 0, 0];
const THUMB: Fingers = [1, 0, 0, 0, 0];
const CLAW: Fingers = [0.5, 0.45, 0.45, 0.45, 0.45];
const FOUR: Fingers = [0, 1, 1, 1, 1];
const PINKY: Fingers = [0, 0, 0, 0, 1];
const HORNS: Fingers = [0, 1, 0, 0, 1];
const L: Fingers = [1, 1, 0, 0, 0];
const Y: Fingers = [1, 0, 0, 0, 1];
const W: Fingers = [0, 1, 1, 1, 0];

/** Hareketsiz isaret: sekli kisa bir sure tut. */
const hold = (f: Fingers): Pose[] => [
  { f, s: 1 },
  { f, s: 1.08 },
];

export const signs: Record<string, Pose[]> = {
  merhaba: [
    { f: OPEN, r: -18 },
    { f: OPEN, r: 18 },
  ],
  tesekkur: [
    { f: OPEN, y: -0.04, s: 0.85 },
    { f: OPEN, y: -0.04, s: 1.2 },
  ],
  gunaydin: [
    { f: POINT, y: 0.08 },
    { f: OPEN, y: -0.08 },
  ],
  lutfen: [
    { f: OPEN, x: -0.08, y: 0 },
    { f: OPEN, x: 0, y: -0.06 },
    { f: OPEN, x: 0.08, y: 0 },
    { f: OPEN, x: 0, y: 0.06 },
  ],
  evet: [
    { f: FIST, r: 0 },
    { f: FIST, r: 28 },
  ],
  hayir: [
    { f: POINT, x: -0.07, r: -10 },
    { f: POINT, x: 0.07, r: 10 },
  ],
  anne: [
    { f: THUMB, y: -0.08 },
    { f: THUMB, y: -0.02 },
  ],
  baba: [
    { f: FIST, x: -0.08, y: -0.06 },
    { f: FIST, x: 0.08, y: -0.06 },
  ],
  kardes: [
    { f: V, x: -0.1 },
    { f: V, x: 0.1 },
  ],
  bir: [
    { f: POINT, s: 1 },
    { f: POINT, s: 1.08 },
  ],
  iki: [
    { f: V, s: 1 },
    { f: V, s: 1.08 },
  ],
  uc: [
    { f: THREE, s: 1 },
    { f: THREE, s: 1.08 },
  ],
  dort: hold(FOUR),
  bes: hold(OPEN),
  yardim: [
    { f: FIST, y: 0.1 },
    { f: OPEN, y: -0.1 },
  ],
  doktor: [
    { f: V, r: -35, y: 0.02 },
    { f: V, r: -35, y: -0.04 },
  ],
  polis: [
    { f: FIST, r: -10 },
    { f: V, r: 10, s: 1.05 },
  ],
};

export const defaultSign: Pose[] = [
  { f: OPEN, s: 1 },
  { f: FIST, s: 1 },
];

/**
 * Elle yazilmis pozu olmayan kelimeler icin yer tutucu havuzu: her el sekli x
 * hareket ve her sekil cifti arasi gecis. Dongu halinde oynatildiginda
 * birbirinden ayirt edilebilen ve SignMatcher'in dogrulayabildigi pozlardir.
 */
export const SHAPES: Fingers[] = [OPEN, FIST, POINT, V, THREE, THUMB, CLAW, FOUR, PINKY, HORNS, L, Y, W];

/** Destek eli icin kullanilan sekiller (pence her ele uydugu icin ayirt edici degil). */
export const SUPPORT_SHAPES: Fingers[] = SHAPES.filter((f) => f !== CLAW);

const MOVES: ((f: Fingers) => Pose[])[] = [
  hold,
  (f) => [{ f, r: -35 }, { f, r: -35, s: 1.08 }],
  (f) => [{ f, r: 35 }, { f, r: 35, s: 1.08 }],
  (f) => [{ f, x: -0.09 }, { f, x: 0.09 }],
  (f) => [{ f, x: -0.09, y: -0.12 }, { f, x: 0.09, y: -0.12 }],
  (f) => [{ f, y: 0.08 }, { f, y: -0.08 }],
  (f) => [{ f, r: -20 }, { f, r: 20 }],
  (f) => [{ f, s: 0.85 }, { f, s: 1.2 }],
  (f) => [{ f, x: -0.08 }, { f, y: -0.06 }, { f, x: 0.08 }, { f, y: 0.06 }],
];

const TRANSITIONS: ((a: Fingers, b: Fingers) => Pose[])[] = [
  (a, b) => [{ f: a }, { f: b }],
  (a, b) => [{ f: a, y: 0.08 }, { f: b, y: -0.08 }],
  (a, b) => [{ f: a, y: -0.08 }, { f: b, y: 0.08 }],
  (a, b) => [{ f: a, s: 0.85 }, { f: b, s: 1.2 }],
  (a, b) => [{ f: a, s: 1.2 }, { f: b, s: 0.85 }],
];

/**
 * Gecis sirasinda parmaklar ya sadece aciliyor ya sadece kapaniyor mu? Biri
 * acilirken digeri kapanan gecislerde ara sekil iki poza da uymaz ve
 * eslestirici denemeyi sifirlar; o ciftler havuza alinmaz.
 */
function smooth(a: Fingers, b: Fingers) {
  if (a === CLAW || b === CLAW) return true;
  return a.every((v, i) => v <= b[i]) || a.every((v, i) => v >= b[i]);
}

export function placeholderPool(): Pose[][] {
  const pool: Pose[][] = [];
  for (const move of MOVES) for (const f of SHAPES) pool.push(move(f));
  for (const transition of TRANSITIONS) {
    for (let i = 0; i < SHAPES.length; i++) {
      for (let j = i + 1; j < SHAPES.length; j++) {
        if (smooth(SHAPES[i], SHAPES[j])) pool.push(transition(SHAPES[i], SHAPES[j]));
      }
    }
  }
  return pool;
}

/**
 * Elle yazilmis pozu olmayan kelimelerin yer tutucu isaretleri. Havuzdan,
 * hicbiri bir digeriyle karismayacak sekilde secilir (tek el yetmeyince iki
 * elli); `scripts/generate-signs.ts` uretir, sozluk degisince yeniden calistirilir.
 */
const generated = placeholders as unknown as Record<string, Pose[]>;

/** Kelimenin temsili poz dizisi: elle yazilmis, yoksa uretilmis yer tutucu. */
export function signFor(wordId: string): Pose[] {
  return signs[wordId] ?? generated[wordId] ?? defaultSign;
}