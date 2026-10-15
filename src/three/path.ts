// Time-keyed smooth paths (cubic Hermite with Catmull-Rom tangents scaled by
// time). Velocity is continuous through every key, so the camera never jerks;
// a key marked `stop` has zero velocity (a held beat).
export type V3 = [number, number, number];
export type Key = {t: number; p: V3; stop?: boolean};

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];

export const v3 = {add, sub, mul, lerp: (a: V3, b: V3, f: number): V3 => add(a, mul(sub(b, a), f))};

export const smoothPath = (keys: Key[]) => {
  const ks = [...keys].sort((a, b) => a.t - b.t);
  const tan = ks.map((k, i) => {
    if (k.stop || i === 0 || i === ks.length - 1) return [0, 0, 0] as V3;
    const a = ks[i - 1];
    const b = ks[i + 1];
    return mul(sub(b.p, a.p), 1 / (b.t - a.t));
  });
  return (t: number): V3 => {
    if (t <= ks[0].t) return ks[0].p;
    const last = ks[ks.length - 1];
    if (t >= last.t) return last.p;
    let i = 0;
    while (i < ks.length - 2 && t > ks[i + 1].t) i++;
    const a = ks[i];
    const b = ks[i + 1];
    const dt = b.t - a.t;
    const u = (t - a.t) / dt;
    const u2 = u * u;
    const u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1;
    const h10 = u3 - 2 * u2 + u;
    const h01 = -2 * u3 + 3 * u2;
    const h11 = u3 - u2;
    return add(add(mul(a.p, h00), mul(tan[i], h10 * dt)), add(mul(b.p, h01), mul(tan[i + 1], h11 * dt)));
  };
};

/** Scalar version. */
export const smooth1 = (keys: {t: number; v: number; stop?: boolean}[]) => {
  const f = smoothPath(keys.map((k) => ({t: k.t, p: [k.v, 0, 0] as V3, stop: k.stop})));
  return (t: number) => f(t)[0];
};
