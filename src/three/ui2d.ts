// Canvas 2D UI kit. Device screens, chips and labels are drawn here every
// frame and shown as textures inside the 3D world, so they receive the same
// light, depth of field and bloom as everything else.
import * as THREE from 'three';
import {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {ICONS, FILLED} from './icons';
import {texScaleFor} from '../lib/quality';

/**
 * How much denser than the authored (1080-wide) baseline canvas textures must
 * be for the current drawing buffer, so screens stay native-sharp at any
 * output size (see lib/quality.ts). Lives here because every texture in the
 * film is born in this file's hooks.
 */
export const useTexScale = (): number => {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  return texScaleFor(size.width * gl.getPixelRatio());
};

export const F = {
  ui: '"InterX", "PlexArabic", sans-serif',
  ar: '"PlexArabic", "InterX", sans-serif',
};

export type Ctx = CanvasRenderingContext2D;

export const rr = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => {
  const q = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + q, y);
  c.lineTo(x + w - q, y);
  c.quadraticCurveTo(x + w, y, x + w, y + q);
  c.lineTo(x + w, y + h - q);
  c.quadraticCurveTo(x + w, y + h, x + w - q, y + h);
  c.lineTo(x + q, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - q);
  c.lineTo(x, y + q);
  c.quadraticCurveTo(x, y, x + q, y);
  c.closePath();
};

export const fillRR = (c: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) => {
  rr(c, x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
};

export const strokeRR = (c: Ctx, x: number, y: number, w: number, h: number, r: number, stroke: string, lw = 2) => {
  rr(c, x, y, w, h, r);
  c.strokeStyle = stroke;
  c.lineWidth = lw;
  c.stroke();
};

export const vgrad = (c: Ctx, y0: number, y1: number, a: string, b: string) => {
  const g = c.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
};

export const hgrad = (c: Ctx, x0: number, x1: number, stops: string[]) => {
  const g = c.createLinearGradient(x0, 0, x1, 0);
  stops.forEach((s, i) => g.addColorStop(i / Math.max(1, stops.length - 1), s));
  return g;
};

export type TextOpts = {
  size: number;
  weight?: number;
  color?: string | CanvasGradient;
  align?: CanvasTextAlign;
  ar?: boolean;
  tracking?: number;
  alpha?: number;
  baseline?: CanvasTextBaseline;
};

export const text = (c: Ctx, s: string, x: number, y: number, o: TextOpts) => {
  c.save();
  c.globalAlpha *= o.alpha ?? 1;
  c.font = `${o.weight ?? 600} ${o.size}px ${o.ar ? F.ar : F.ui}`;
  c.fillStyle = o.color ?? '#F5F5F7';
  c.textAlign = o.align ?? 'left';
  c.textBaseline = o.baseline ?? 'middle';
  c.direction = o.ar ? 'rtl' : 'ltr';
  if (o.tracking !== undefined) {
    (c as unknown as {letterSpacing: string}).letterSpacing = `${o.tracking}px`;
  }
  c.fillText(s, x, y);
  c.restore();
};

export const measure = (c: Ctx, s: string, size: number, weight = 600, ar = false) => {
  c.save();
  c.font = `${weight} ${size}px ${ar ? F.ar : F.ui}`;
  const w = c.measureText(s).width;
  c.restore();
  return w;
};

const pathCache = new Map<string, Path2D[]>();
export const icon = (c: Ctx, name: string, cx: number, cy: number, size: number, color: string, stroke = 2.2, draw = 1) => {
  let ps = pathCache.get(name);
  if (!ps) {
    ps = (ICONS[name] ?? []).map((d) => new Path2D(d));
    pathCache.set(name, ps);
  }
  c.save();
  c.translate(cx - size / 2, cy - size / 2);
  c.scale(size / 32, size / 32);
  if (FILLED.has(name)) {
    c.fillStyle = color;
    ps.forEach((p) => c.fill(p));
  } else {
    c.strokeStyle = color;
    c.lineWidth = stroke;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    if (draw < 1) {
      c.setLineDash([100 * draw, 100]);
    }
    ps.forEach((p) => c.stroke(p));
  }
  c.restore();
};

/** A canvas + texture. Redrawn only when `key` changes (pass a string that
 *  encodes the visible state); without a key it is redrawn every frame. */
export const useCanvasTexture = (w: number, h: number, draw: (c: Ctx) => void, key?: string) => {
  // Screens are viewed at grazing angles more often than head-on: give every
  // texture the renderer's full anisotropic filtering so UI type stays
  // legible when a phone turns away from camera.
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const {canvas, tex} = useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(16, maxAniso);
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    return {canvas: cv, tex: t, last: {key: '\u0000'}};
  }, [w, h, maxAniso]);
  const memo = (tex.userData.lastKey as string | undefined) ?? '\u0000';
  if (key === undefined || key !== memo) {
    const c = canvas.getContext('2d')!;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, w, h);
    draw(c);
    tex.needsUpdate = true;
    tex.userData.lastKey = key;
  }
  return tex;
};

/** Soft radial sprite texture (for glows, bokeh, light fields). 512 px keeps
 *  the falloff free of visible steps when a halo covers half a 4K frame. */
export const useRadialTexture = (inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 512) =>
  useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = size;
    cv.height = size;
    const c = cv.getContext('2d')!;
    const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, inner);
    g.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.35)'));
    g.addColorStop(1, outer);
    c.fillStyle = g;
    c.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [inner, outer, size]);
