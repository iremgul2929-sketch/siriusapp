import type { Fingers, Pose } from '@/data/signs';

/**
 * Basit 2B el modeli: bir pozu (parmak acikliklari + donus/kayma/olcek)
 * MediaPipe sirasindaki 21 el noktasina cevirir. Hem animasyon (HandDemo)
 * hem de esleştirici testleri bunu kullanir.
 */

export type Pt = { x: number; y: number };

/**
 * Butun alanlari dolu poz. `o` ikinci (destek) elin parmak sekli; tek elli
 * pozlarda null. `ow` ikinci elin ne kadar kalkik oldugu (0 inik .. 1 kalkik);
 * tek elli ve iki elli pozlar arasindaki geciste yumusak inip kalkmasini saglar.
 */
export type FullPose = { f: Fingers; x: number; y: number; r: number; s: number; o: Fingers | null; ow: number };

/** Iki elli isaretlerde ellerin ekran ortasindan yatay uzakligi. */
export const HAND_SPREAD = 0.17;

// Bilege gore parmak koklerinin konumu (birim: avuc birimi), kok acisi ve bogum uzunluklari.
const FINGERS = [
  { base: [-0.9, -0.55], angle: -135, segs: [0.95, 0.85, 0.7] }, // basparmak
  { base: [-0.75, -2.0], angle: -98, segs: [1.1, 0.75, 0.6] }, // isaret
  { base: [-0.25, -2.15], angle: -90, segs: [1.2, 0.8, 0.6] }, // orta
  { base: [0.25, -2.05], angle: -84, segs: [1.1, 0.75, 0.55] }, // yuzuk
  { base: [0.7, -1.8], angle: -76, segs: [0.85, 0.6, 0.5] }, // serce
] as const;

export const BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [9, 10], [10, 11], [11, 12],
  [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

const DEG = Math.PI / 180;

/** Poz -> 21 el noktasi (MediaPipe sirasi, 0..1 koordinatlar). */
export function poseToLandmarks(p: Pick<FullPose, 'f' | 'x' | 'y' | 'r' | 's'>): Pt[] {
  const unit = 0.1 * p.s;
  const pts: Pt[] = [{ x: 0, y: 0 }];

  FINGERS.forEach((finger, i) => {
    const open = p.f[i];
    let x = finger.base[0];
    let y = finger.base[1];
    pts.push({ x, y });

    if (i === 0) {
      // Basparmak avuca dogru yanlamasina kivrilir.
      let a = finger.angle * DEG;
      finger.segs.forEach((len) => {
        a += (1 - open) * 0.75;
        const l = len * (1 - (1 - open) * 0.25);
        x += Math.cos(a) * l;
        y += Math.sin(a) * l;
        pts.push({ x, y });
      });
    } else {
      // Diger parmaklar kameraya dogru kivrilir: izdusumde boy kisalir, sonra geri doner.
      const a = finger.angle * DEG;
      let bend = 0;
      finger.segs.forEach((len) => {
        bend += (1 - open) * 1.45;
        const l = len * Math.cos(bend);
        x += Math.cos(a) * l;
        y += Math.sin(a) * l;
        pts.push({ x, y });
      });
    }
  });

  const cos = Math.cos(p.r * DEG);
  const sin = Math.sin(p.r * DEG);
  const wx = 0.5 + p.x;
  const wy = 0.84 + p.y;
  return pts.map(({ x, y }) => ({
    x: wx + (x * cos - y * sin) * unit,
    y: wy + (x * sin + y * cos) * unit,
  }));
}

export function full(p: Pose): FullPose {
  return { f: p.f, x: p.x ?? 0, y: p.y ?? 0, r: p.r ?? 0, s: p.s ?? 1, o: p.o ?? null, ow: p.o ? 1 : 0 };
}

export function lerpPose(a: FullPose, b: FullPose, t: number): FullPose {
  const m = (u: number, v: number) => u + (v - u) * t;
  const shape = (u: Fingers, v: Fingers) => u.map((x, i) => m(x, v[i])) as Fingers;
  return {
    f: shape(a.f, b.f),
    x: m(a.x, b.x),
    y: m(a.y, b.y),
    r: m(a.r, b.r),
    s: m(a.s, b.s),
    // Biri tek elliyse ikinci el seklini korur, sadece inip kalkar.
    o: a.o && b.o ? shape(a.o, b.o) : (b.o ?? a.o),
    ow: m(a.ow, b.ow),
  };
}

/**
 * Pozu kameranin gorecegi el noktalarina cevirir: iki elli pozda isaret eli
 * saga, aynalanmis destek eli sola yerlesir. Tek elli pozda `other` null.
 */
export function poseToHands(p: FullPose): { dom: Pt[]; other: Pt[] | null } {
  if (!p.o) return { dom: poseToLandmarks(p), other: null };
  const dom = poseToLandmarks({ ...p, x: p.x + HAND_SPREAD });
  const other = poseToLandmarks({ f: p.o, x: HAND_SPREAD, y: 0, r: 0, s: 1 }).map((pt) => ({ x: 1 - pt.x, y: pt.y }));
  return { dom, other };
}

