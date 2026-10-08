import type { Pose } from '@/data/signs';
import type { Pt } from './handModel';

/**
 * Kameradan gelen el noktalarini (MediaPipe, 21 nokta) bir isaretin poz
 * dizisiyle karsilastirir.
 *
 * - Parmak sekli: her parmagin acik/kapali olmasi hedef pozla uyusmali.
 * - Hareket: ardisik iki poz arasindaki en belirgin degisim (yatay/dikey
 *   kayma, donus ya da yaklasma) kullanici tarafindan da yapilmali.
 * - Hareketsiz isaretler (bir/iki/uc gibi) icin poz kisa bir sure tutulmali.
 * - Iki elli isaretlerde ikinci (destek) el de kadrajda olmali ve sekli tutmali;
 *   tek elli isaretlerde kadrajda tek el olmali. Boylece ayni sekli kullanan
 *   tek ve iki elli isaretler birbirine karismaz.
 *
 * On kamera goruntusu aynalandigi icin yatay kayma ve donus yonden bagimsiz
 * (sadece buyukluk) kontrol edilir; dikey kayma ve olcek yonuyle kontrol edilir.
 */

export interface HandFeatures {
  fingers: number[]; // 0 kapali .. 1 acik, [basparmak, isaret, orta, yuzuk, serce]
  x: number;
  y: number;
  roll: number; // derece, 0 = yukari
  scale: number; // bilek -> orta parmak kokü uzakligi
}

export type MatchStatus = 'searching' | 'tracking' | 'success' | 'fail';

export interface MatchState {
  status: MatchStatus;
  step: number;
  total: number;
  hint: string | null;
}

const FINGER_NAMES = ['Başparmağını', 'İşaret parmağını', 'Orta parmağını', 'Yüzük parmağını', 'Serçe parmağını'];

const TIMEOUT_MS = 8000; // el goruldukten sonra hareketi tamamlama suresi
const WRONG_MS = 2200; // bu kadar sure ust uste yanlis sekil -> yanlis
const HOLD_MS = 900; // hareketsiz isaretlerde pozu tutma suresi
const LOST_MS = 1500; // el bu kadar kaybolursa deneme sifirlanir

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function extractFeatures(lm: Pt[]): HandFeatures {
  const wrist = lm[0];
  const fingers = [
    // Basparmak: ucu serce parmak kokünden ne kadar uzak?
    clamp01((dist(lm[4], lm[17]) / dist(lm[2], lm[17]) - 0.85) / 0.4),
    ...[
      [8, 6],
      [12, 10],
      [16, 14],
      [20, 18],
    ].map(([tip, pip]) => clamp01((dist(wrist, lm[tip]) / dist(wrist, lm[pip]) - 0.95) / 0.35)),
  ];
  const mid = lm[9];
  return {
    fingers,
    x: wrist.x,
    y: wrist.y,
    roll: (Math.atan2(mid.x - wrist.x, -(mid.y - wrist.y)) * 180) / Math.PI,
    scale: dist(wrist, mid),
  };
}

/** Parmak sekli hedefe uyuyor mu? Uymuyorsa duzeltme ipucu dondurur. */
export function checkShape(f: HandFeatures, target: Pose['f']): string | null {
  const rest = target.slice(1);
  const allOpen = rest.every((v) => v >= 0.8);
  const isClaw = rest.every((v) => v > 0.2 && v < 0.8);
  const tips: string[] = [];

  target.forEach((t, i) => {
    const v = f.fingers[i];
    // Acik elde/pencede basparmak serbest; ama hedef basparmagi acikca kapatiyorsa
    // (dort: dort parmak acik, basparmak icerde) kontrol edilir, yoksa bes ile karisir.
    if (i === 0 && ((allOpen && t >= 0.8) || isClaw)) return;
    if (t >= 0.8 && v < 0.5) tips.push(`${FINGER_NAMES[i]} aç`);
    // Kapali basparmak icin daha toleransli ol: yumrukta parmaklarin ustunde durabilir.
    else if (t <= 0.2 && v > (i === 0 ? 0.7 : 0.5)) tips.push(`${FINGER_NAMES[i]} kapat`);
  });

  return tips.length ? tips.join(', ') : null;
}

type Requirement =
  | { kind: 'x' | 'roll'; min: number }
  | { kind: 'y'; min: number; dir: 1 | -1 }
  | { kind: 'scale'; min: number; dir: 1 | -1 }
  | null;

/** Iki poz arasindaki en belirgin hareketi gereksinime cevirir. */
function requirementBetween(a: Pose, b: Pose): Requirement {
  const dx = (b.x ?? 0) - (a.x ?? 0);
  const dy = (b.y ?? 0) - (a.y ?? 0);
  const dr = (b.r ?? 0) - (a.r ?? 0);
  const ds = Math.log((b.s ?? 1) / (a.s ?? 1));

  const candidates = [
    { score: Math.abs(dx) >= 0.05 ? Math.abs(dx) / 0.1 : 0, req: { kind: 'x', min: Math.max(0.04, 0.45 * Math.abs(dx)) } },
    {
      score: Math.abs(dy) >= 0.05 ? Math.abs(dy) / 0.1 : 0,
      req: { kind: 'y', min: Math.max(0.04, 0.45 * Math.abs(dy)), dir: dy > 0 ? 1 : -1 },
    },
    { score: Math.abs(dr) >= 15 ? Math.abs(dr) / 20 : 0, req: { kind: 'roll', min: Math.max(8, 0.45 * Math.abs(dr)) } },
    {
      score: Math.abs(ds) >= 0.12 ? Math.abs(ds) / 0.15 : 0,
      req: { kind: 'scale', min: Math.max(0.06, 0.45 * Math.abs(ds)), dir: ds > 0 ? 1 : -1 },
    },
  ] as { score: number; req: Requirement }[];

  const best = candidates.reduce((m, c) => (c.score > m.score ? c : m));
  return best.score > 0 ? best.req : null;
}

const sameShape = (a: Pose, b: Pose) => a.f.every((v, i) => Math.abs(v - b.f[i]) < 0.2);

const NEED_TWO = 'İki elini de kameraya göster';
const NEED_ONE = 'Bu işaret tek elle yapılır, diğer elini indir';

export class SignMatcher {
  private readonly poses: Pose[];
  private readonly reqs: Requirement[];
  private readonly isStatic: boolean;
  /** Destek elinin sekli; tek elli isaretlerde null. */
  private readonly support: Pose['f'] | null;

  private step = 0;
  /** Iki el gorunurken isaret elinin sirasi (0: goruntude soldaki, 1: sagdaki). */
  private dom: 0 | 1 = 1;
  private handCount = 0;
  private status: MatchStatus = 'searching';
  private hint: string | null = null;
  private window: HandFeatures[] = [];
  private attemptStart: number | null = null;
  private lastSeen: number | null = null;
  private wrongSince: number | null = null;
  private holdSince: number | null = null;

  constructor(poses: Pose[]) {
    this.poses = poses;
    this.reqs = poses.map((p, i) => (i === 0 ? null : requirementBetween(poses[i - 1], p)));
    this.isStatic = this.reqs.every((r, i) => i === 0 || (r === null && sameShape(poses[i - 1], poses[i])));
    this.support = poses.find((p) => p.o)?.o ?? null;
  }

  /** Bu isaret iki elle mi yapiliyor? */
  get twoHanded() {
    return this.support !== null;
  }

  get total() {
    return this.isStatic ? 1 : this.poses.length;
  }

  /** Pozlar arasinda dogrulanan hareket sayisi. */
  get movements() {
    return this.reqs.filter((r) => r !== null).length;
  }

  reset() {
    this.step = 0;
    this.status = 'searching';
    this.hint = null;
    this.window = [];
    this.attemptStart = null;
    this.lastSeen = null;
    this.wrongSince = null;
    this.holdSince = null;
    this.dom = 1;
    this.handCount = 0;
  }

  /**
   * Karedeki ellerden isaret elini secer ve el sayisi / destek eli sekli
   * uymuyorsa ipucu dondurur. `count` ipucu el sayisiyla ilgiliyse true.
   */
  private pick(lm: Pt[], lm2: Pt[] | null, target: Pose): { f: HandFeatures; hint: string | null; count: boolean } {
    const count = lm2 ? 2 : 1;
    if (count !== this.handCount) {
      // El sayisi degisti: onceki karelerle kiyas anlamsiz.
      this.handCount = count;
      this.window = [];
      this.holdSince = null;
    }
    const a = extractFeatures(lm);
    if (!this.support) return { f: a, hint: lm2 ? NEED_ONE : null, count: true };
    if (!lm2) return { f: a, hint: NEED_TWO, count: true };

    const hands = [a, extractFeatures(lm2)];
    const support = this.support;
    const fits = (d: 0 | 1) =>
      checkShape(hands[d], target.f) === null && checkShape(hands[1 - d], support) === null;
    // Eller yer degistirmis olabilir: mevcut atama uymuyor, tersi uyuyorsa degistir.
    if (!fits(this.dom) && fits(this.dom === 1 ? 0 : 1)) {
      this.dom = this.dom === 1 ? 0 : 1;
      this.window = [];
      this.holdSince = null;
    }
    const otherHint = checkShape(hands[1 - this.dom], support);
    return { f: hands[this.dom], hint: otherHint ? `Diğer elinde: ${otherHint}` : null, count: false };
  }

  /** Mevcut durum (yan etkisiz). */
  snapshot(): MatchState {
    return this.state();
  }

  private state(): MatchState {
    return { status: this.status, step: this.step, total: this.total, hint: this.hint };
  }

  private fail(hint: string) {
    this.status = 'fail';
    this.hint = hint;
  }

  /**
   * Bir kamera karesi isle. `lm` ve `lm2` karedeki eller (goruntude soldan
   * saga); ikisi de null ise karede el yok.
   */
  push(lm: Pt[] | null, now: number, lm2: Pt[] | null = null): MatchState {
    if (this.status === 'success' || this.status === 'fail') return this.state();

    if (!lm && lm2) {
      lm = lm2;
      lm2 = null;
    }
    if (!lm) {
      if (this.lastSeen !== null && now - this.lastSeen > LOST_MS) {
        this.reset();
      }
      return this.state();
    }

    this.lastSeen = now;
    this.attemptStart ??= now;
    if (this.status === 'searching') this.status = 'tracking';

    const target = this.poses[this.isStatic ? 0 : this.step];
    const picked = this.pick(lm, lm2, target);
    const f = picked.f;
    const shapeHint = picked.hint ?? checkShape(f, target.f);
    // Pozlar arasinda gecis yaparken onceki sekil de kabul edilir.
    const prevOk = !picked.hint && this.step > 0 && checkShape(f, this.poses[this.step - 1].f) === null;

    if (shapeHint && !prevOk) {
      this.hint = shapeHint;
      this.wrongSince ??= now;
      this.holdSince = null;
      if (now - this.wrongSince > WRONG_MS) {
        this.fail(picked.hint && picked.count ? `${shapeHint}.` : `El şekli yanlış: ${shapeHint}.`);
        return this.state();
      }
    } else {
      this.wrongSince = null;
    }

    if (this.isStatic) {
      const tiltHint = shapeHint ? null : checkTilt(f, target);
      if (!shapeHint && !tiltHint) {
        this.hint = 'Harika, pozu biraz tut…';
        if (this.holdSince === null) this.window = [];
        this.holdSince ??= now;
        this.window.push(f);
        if (isMoving(this.window)) {
          // Hareketsiz isarette el sabit durmali.
          this.hint = 'Elini sabit tut';
          this.holdSince = now;
          this.window = [f];
        } else if (now - this.holdSince >= HOLD_MS) {
          this.step = 1;
          this.status = 'success';
          this.hint = null;
        }
      } else if (tiltHint) {
        this.hint = tiltHint;
        this.holdSince = null;
      }
    } else if (!shapeHint) {
      if (this.step === 0) {
        this.step = 1;
        this.window = [f];
        this.hint = 'Şimdi hareketi yap';
      } else {
        this.window.push(f);
        const req = this.reqs[this.step];
        if (!req || this.movementDone(req, f)) {
          this.step += 1;
          this.window = [f];
          if (this.step >= this.poses.length) {
            this.status = 'success';
            this.hint = null;
            return this.state();
          }
        } else {
          this.hint = movementHint(req);
        }
      }
    } else if (prevOk) {
      // Hala onceki pozdayiz: hareket penceresini besle.
      this.window.push(f);
    } else if (this.step > 0) {
      // Sekil bozuldu: hareketi bastan bekle.
      this.step = 0;
      this.window = [];
    }

    if (now - this.attemptStart > TIMEOUT_MS) {
      this.fail(this.hint ? `Hareket tamamlanamadı. ${this.hint}.` : 'Hareket tamamlanamadı.');
    }
    return this.state();
  }

  private movementDone(req: NonNullable<Requirement>, f: HandFeatures): boolean {
    const w = this.window;
    if (req.kind === 'x' || req.kind === 'roll') {
      const vals = w.map((h) => h[req.kind]);
      return Math.max(...vals) - Math.min(...vals) >= req.min;
    }
    if (req.kind === 'y') {
      const ys = w.map((h) => h.y);
      return req.dir > 0 ? f.y - Math.min(...ys) >= req.min : Math.max(...ys) - f.y >= req.min;
    }
    if (req.kind === 'scale') {
      const ls = w.map((h) => Math.log(h.scale));
      const cur = Math.log(f.scale);
      return req.dir > 0 ? cur - Math.min(...ls) >= req.min : Math.max(...ls) - cur >= req.min;
    }
    return false;
  }
}

/** Hareketsiz pozda elin egimi hedefe yakin mi? (aynalama yuzunden yon degil buyukluk) */
function checkTilt(f: HandFeatures, target: Pose): string | null {
  const want = Math.abs(target.r ?? 0);
  const got = Math.abs(f.roll);
  if (got - want > 25) return 'Elini daha dik tut';
  if (want - got > 25) return 'Elini biraz yana eğ';
  return null;
}

function isMoving(w: HandFeatures[]): boolean {
  const range = (k: 'x' | 'y' | 'roll') => Math.max(...w.map((h) => h[k])) - Math.min(...w.map((h) => h[k]));
  return range('x') > 0.035 || range('y') > 0.035 || range('roll') > 10;
}

function movementHint(req: NonNullable<Requirement>): string {
  switch (req.kind) {
    case 'x':
      return 'Elini yana doğru hareket ettir';
    case 'y':
      return req.dir > 0 ? 'Elini aşağı indir' : 'Elini yukarı kaldır';
    case 'roll':
      return 'Elini bileğinden çevir';
    case 'scale':
      return req.dir > 0 ? 'Elini kameraya yaklaştır' : 'Elini kameradan uzaklaştır';
  }
}
