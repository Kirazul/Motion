// Master-quality system. One law governs every dial in the film:
//
//   The WebGL drawing buffer is never smaller than 2160 px wide on a final
//   render, and every canvas texture scales with that buffer.
//
// In practice:
//   - 1080-wide delivery compositions render the 3D world at dpr 2
//     (a 2160-wide buffer the browser downsamples: free supersampling).
//   - 2160-wide 4K compositions render at dpr 1: they already are the master.
//   - Screen/UI textures multiply their authored pixel density by
//     bufferWidth / 1080, so a phone screen is as many real pixels on a 4K
//     master as it occupies on screen - never an upscale.
//   - In Remotion Studio everything drops to the preview tier (dpr 1,
//     lighter post) so scrubbing stays interactive; the tier is automatic
//     and can be forced per render with the `quality` input prop.
//
// See docs/QUALITY.md for the full delivery spec.
import {getRemotionEnvironment} from 'remotion';
import {clamp} from './anim';

export type QualityTier = 'master' | 'preview';

/** Studio = preview (fast iteration); any real render = master. */
export const autoTier = (): QualityTier => (getRemotionEnvironment().isStudio ? 'preview' : 'master');

/** The master width every final render is normalised to, in device px. */
export const MASTER_WIDTH = 2160;

/** Drawing-buffer pixel ratio for a composition width under a tier. */
export const dprFor = (compWidth: number, tier: QualityTier): number =>
  tier === 'preview' ? 1 : clamp(MASTER_WIDTH / compWidth, 1, 2);

/** Texture-density multiplier for a WebGL buffer of the given device width. */
export const texScaleFor = (bufferWidth: number): number => clamp(bufferWidth / 1080, 1, 2.5);

/** Largest canvas side we ever allocate (WebGL textures are fine up to 8k+,
 *  4096 keeps a safety margin on every GPU and in software GL). */
export const MAX_CANVAS = 4096;

/** Clamp a canvas size to MAX_CANVAS per side, preserving aspect. */
export const capCanvas = (w: number, h: number): [number, number] => {
  const m = Math.max(w, h);
  if (m <= MAX_CANVAS) return [w, h];
  const f = MAX_CANVAS / m;
  return [Math.max(2, Math.round(w * f)), Math.max(2, Math.round(h * f))];
};
