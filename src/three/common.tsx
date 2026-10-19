// Shared 3D pieces: the hero orb, a canvas-textured card, a billboard chip,
// and the soft glow sprite.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {Ctx, useCanvasTexture, useRadialTexture, useTexScale, fillRR, text, icon, measure, vgrad} from './ui2d';
import {capCanvas} from '../lib/quality';
import type {V3} from './path';

/** The client: an emissive core, a soft bloom halo, and a real light. */
export const Orb: React.FC<{p: V3; r?: number; intensity?: number; light?: number; color?: string; visible?: boolean}> = ({
  p,
  r = 0.16,
  intensity = 1,
  light = 1,
  color = '#9FFFF0',
  visible = true,
}) => {
  const halo = useRadialTexture('rgba(110,240,225,1)', 'rgba(10,132,255,0)');
  if (!visible || intensity <= 0.001) return null;
  return (
    <group position={p}>
      <mesh>
        <sphereGeometry args={[r, 64, 64]} />
        <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(2.2 * intensity + 0.4)} toneMapped={false} transparent opacity={Math.min(1, intensity * 1.5)} />
      </mesh>
      <sprite scale={[r * 7, r * 7, 1]}>
        <spriteMaterial map={halo} transparent opacity={0.4 * intensity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <pointLight color="#7FF5E6" intensity={14 * light * intensity} distance={7} decay={2} />
    </group>
  );
};

/** A flat plane carrying a canvas-drawn UI, sized in world units. */
export const CanvasPlane: React.FC<{
  w: number;
  h: number;
  px?: number;
  draw: (c: Ctx, W: number, H: number) => void;
  position?: V3;
  rotation?: V3;
  opacity?: number;
  emissive?: number;
  billboard?: boolean;
  renderOrder?: number;
  drawKey?: string;
}> = ({w, h, px = 300, draw, position, rotation, opacity = 1, emissive = 1, billboard, renderOrder, drawKey}) => {
  // `px` is authored for a 1080-wide frame; scale it to the real buffer so
  // the plane is never upscaled on a master render (lib/quality.ts).
  const q = useTexScale();
  const [W, H] = capCanvas(Math.round(w * px * q), Math.round(h * px * q));
  const tex = useCanvasTexture(W, H, (c) => draw(c, W, H), drawKey);
  const camera = useThree((s) => s.camera);
  const quat = billboard ? camera.quaternion.clone() : undefined;
  if (opacity <= 0.001) return null;
  return (
    <mesh position={position} rotation={billboard ? undefined : rotation} quaternion={quat} renderOrder={renderOrder}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={opacity}
        depthWrite={opacity > 0.6}
        alphaTest={0.02}
        toneMapped={false}
        color={new THREE.Color(emissive, emissive, emissive)}
      />
    </mesh>
  );
};

/** Pill chip with optional icon, drawn to canvas, facing the camera. */
export const Chip: React.FC<{
  label: string;
  position: V3;
  opacity?: number;
  scale?: number;
  tone?: 'glass' | 'amber' | 'red' | 'green' | 'teal';
  iconName?: string;
  size?: number;
}> = ({label, position, opacity = 1, scale = 1, tone = 'glass', iconName, size = 0.34}) => {
  // measure once with a scratch canvas
  const width = useMemo(() => {
    const c = document.createElement('canvas').getContext('2d')!;
    return measure(c, label, 46, 600) + (iconName ? 64 : 0) + 76;
  }, [label, iconName]);
  const PX = 160;
  const h = 0.5 * size * 2;
  const w = (width / 100) * h;
  const tones = {
    glass: {a: 'rgba(58,58,63,0.94)', b: 'rgba(28,28,31,0.96)', edge: 'rgba(255,255,255,0.10)', fg: '#F5F5F7', ic: '#A1A1A6'},
    amber: {a: 'rgba(66,44,18,0.95)', b: 'rgba(34,22,8,0.96)', edge: 'rgba(255,159,10,0.45)', fg: '#FFD08A', ic: '#FFB340'},
    red: {a: 'rgba(70,22,20,0.95)', b: 'rgba(36,10,9,0.96)', edge: 'rgba(255,69,58,0.5)', fg: '#FFB4AE', ic: '#FF6961'},
    green: {a: 'rgba(18,58,32,0.95)', b: 'rgba(8,30,16,0.96)', edge: 'rgba(48,209,88,0.5)', fg: '#B6F5C6', ic: '#30D158'},
    teal: {a: 'rgba(16,60,58,0.95)', b: 'rgba(8,30,32,0.96)', edge: 'rgba(94,234,212,0.55)', fg: '#C9FFF6', ic: '#5EEAD4'},
  }[tone];
  if (opacity <= 0.001) return null;
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <CanvasPlane
        w={w}
        h={h}
        px={PX}
        billboard
        opacity={opacity}
        draw={(c, W, H) => {
          fillRR(c, 2, 2, W - 4, H - 4, H / 2, vgrad(c, 0, H, tones.a, tones.b));
          c.lineWidth = 3;
          c.strokeStyle = tones.edge;
          c.stroke();
          const fs = H * 0.42;
          let x = H * 0.42;
          if (iconName) {
            icon(c, iconName, x + fs * 0.55, H / 2, fs * 1.05, tones.ic, 2.6);
            x += fs * 1.35;
          }
          text(c, label, x, H / 2 + 1, {size: fs, weight: 600, color: tones.fg});
        }}
      />
    </group>
  );
};

const geoCache = new Map<string, THREE.BufferGeometry>();
/** Rounded-rectangle slab with soft bevelled edges (large corner radius, thin depth). */
export const slabGeometry = (w: number, h: number, d: number, r: number) => {
  const key = [w, h, d, r].map((x) => x.toFixed(3)).join('|');
  const hit = geoCache.get(key);
  if (hit) return hit;
  const bevel = Math.min(d * 0.35, 0.04);
  const W = w - bevel * 2;
  const H = h - bevel * 2;
  const R = Math.max(0.001, Math.min(r - bevel, W / 2, H / 2));
  const sh = new THREE.Shape();
  sh.moveTo(-W / 2 + R, -H / 2);
  sh.lineTo(W / 2 - R, -H / 2);
  sh.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + R);
  sh.lineTo(W / 2, H / 2 - R);
  sh.quadraticCurveTo(W / 2, H / 2, W / 2 - R, H / 2);
  sh.lineTo(-W / 2 + R, H / 2);
  sh.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - R);
  sh.lineTo(-W / 2, -H / 2 + R);
  sh.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + R, -H / 2);
  const g = new THREE.ExtrudeGeometry(sh, {
    depth: Math.max(0.001, d - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    // The client token fills a fifth of the frame height in the void shot:
    // at 4K that is ~800 px across, where 24-segment corners facet. 48/8
    // keeps every silhouette and bevel highlight perfectly smooth.
    bevelSegments: 8,
    curveSegments: 48,
  });
  g.translate(0, 0, -(d - bevel * 2) / 2);
  g.computeVertexNormals();
  geoCache.set(key, g);
  return g;
};

/** Dark glossy slab (a device body or a card) with a canvas face. */
export const Slab: React.FC<{
  w: number;
  h: number;
  d?: number;
  r?: number;
  position?: V3;
  rotation?: V3;
  scale?: number;
  color?: string;
  metal?: number;
  rough?: number;
  opacity?: number;
  face?: (c: Ctx, W: number, H: number) => void;
  facePx?: number;
  faceInset?: number;
  faceGlow?: number;
  faceKey?: string;
  children?: React.ReactNode;
}> = ({w, h, d = 0.12, r = 0.18, position, rotation, scale = 1, color = '#1C1C1F', metal = 0.6, rough = 0.28, opacity = 1, face, facePx = 260, faceInset = 0.05, faceGlow = 1, faceKey, children}) => {
  if (opacity <= 0.001) return null;
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <mesh geometry={slabGeometry(w, h, d, r)}>
        <meshPhysicalMaterial color={color} metalness={metal} roughness={rough} clearcoat={1} clearcoatRoughness={0.12} transparent={opacity < 1} opacity={opacity} />
      </mesh>
      {face ? (
        <CanvasPlane
          w={w - faceInset * 2}
          h={h - faceInset * 2}
          px={facePx}
          position={[0, 0, d / 2 + 0.002]}
          draw={face}
          drawKey={faceKey}
          opacity={opacity}
          emissive={faceGlow}
        />
      ) : null}
      {children}
    </group>
  );
};
