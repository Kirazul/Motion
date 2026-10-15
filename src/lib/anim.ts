// Motion language. One family of curves for the whole film:
//   out    - every entrance and landing (fast start, long soft settle)
//   inOut  - camera moves and repositions that stay on screen
//   in     - exits (only ever short)
// Springs are critically damped (no bounce): premium, never toy-like.
import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  soft: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  cam: Easing.bezier(0.45, 0, 0.15, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  linear: (x: number) => x,
};

type Ease = (x: number) => number;

/** Tween a value between two times (seconds), clamped on both ends. */
export const k = (t: number, t0: number, t1: number, a: number, b: number, fn: Ease = ease.out) =>
  t1 <= t0 ? (t < t0 ? a : b) : interpolate(t, [t0, t1], [a, b], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: fn,
  });

/** Multi-keyframe tween: times[] and values[] of the same length, one ease per segment. */
export const kf = (t: number, times: number[], values: number[], fn: Ease | Ease[] = ease.inOut) => {
  if (t <= times[0]) return values[0];
  for (let i = 0; i < times.length - 1; i++) {
    if (t <= times[i + 1]) {
      const f = Array.isArray(fn) ? fn[i] ?? ease.inOut : fn;
      return k(t, times[i], times[i + 1], values[i], values[i + 1], f);
    }
  }
  return values[values.length - 1];
};

/** 0..1 progress between two times. */
export const p01 = (t: number, t0: number, t1: number, fn: Ease = ease.out) => k(t, t0, t1, 0, 1, fn);

/** Critically damped spring that starts at t0 (seconds). Returns 0..1. */
export const sp = (t: number, t0: number, stiffness = 120, damping = 22, mass = 1) =>
  t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {stiffness, damping, mass}});

/** Window: fades in over [a, a+fi] and out over [b-fo, b]. */
export const win = (t: number, a: number, b: number, fi = 0.4, fo = 0.4) =>
  Math.min(k(t, a, a + fi, 0, 1, ease.out), k(t, b - fo, b, 1, 0, ease.in));

export const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Smooth value noise in [-1,1] (sum of incommensurate sines, deterministic). */
export const noise = (t: number, seed: number) =>
  (Math.sin(t * 1.13 + seed * 3.1) * 0.5 + Math.sin(t * 2.71 + seed * 7.7) * 0.3 + Math.sin(t * 0.47 + seed * 1.9) * 0.2);

/** Mix two hex colours (sRGB) - used for small palette shifts only. */
export const mix = (c1: string, c2: string, f: number) => {
  const a = parseInt(c1.slice(1), 16);
  const b = parseInt(c2.slice(1), 16);
  const ch = (v: number, sh: number) => (v >> sh) & 255;
  const m = (sh: number) => Math.round(lerp(ch(a, sh), ch(b, sh), clamp(f)));
  return `rgb(${m(16)}, ${m(8)}, ${m(0)})`;
};
