/** Isaretleri kamerada yapiyormus gibi kare kare ureten ortak benzetim (scripts/ icin). */
import type { Pose } from '@/data/signs';
import { full, lerpPose, poseToHands, type FullPose, type Pt } from '@/ml/handModel';

export const STEP = 33;
export type Frame = { lm: Pt[]; lm2: Pt[] | null; t: number };

/** Takip sayfasi gibi: eller goruntude soldan saga siralanir. */
function frameOf(p: FullPose, t: number): Frame {
  const { dom, other } = poseToHands(p);
  if (!other) return { lm: dom, lm2: null, t };
  return other[0].x <= dom[0].x ? { lm: other, lm2: dom, t } : { lm: dom, lm2: other, t };
}

export function perform(sign: Pose[]): Frame[] {
  const poses = sign.map(full);
  const frames: Frame[] = [];
  let t = 0;
  const hold = (p: FullPose, ms: number) => {
    for (let k = 0; k < ms / STEP; k++) frames.push(frameOf(p, (t += STEP)));
  };
  hold(poses[0], 500);
  for (let i = 1; i < poses.length; i++) {
    for (let k = 1; k <= 18; k++) frames.push(frameOf(lerpPose(poses[i - 1], poses[i], k / 18), (t += STEP)));
    hold(poses[i], 400);
  }
  hold(poses[poses.length - 1], 1200);
  return frames;
}
