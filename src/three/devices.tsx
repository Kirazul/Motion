// Devices, modelled from real proportions (mm -> world units):
//   iPhone 16 Pro   71.5 x 149.6 x 8.25   black titanium band, glass front
//   iPad Pro 11     249.7 x 177.5 x 5.3   (landscape)
//   MacBook Pro 14  312.6 x 221.2         space black aluminium, notch
// Each screen is a canvas texture under a glass layer that only adds the
// studio's reflections, so the UI sits *behind* real glass. Canvas density
// (`px`, authored for a 1080-wide frame) is scaled to the actual drawing
// buffer - on a 4K master every screen carries at least as many real pixels
// as it covers on screen (lib/quality.ts).
import React from 'react';
import * as THREE from 'three';
import {Ctx, useCanvasTexture, useTexScale, fillRR} from './ui2d';
import {slabGeometry} from './common';
import {capCanvas} from '../lib/quality';
import type {V3} from './path';

const TITANIUM = {color: '#2F2F33', metalness: 1, roughness: 0.3};
const ALU = {color: '#2C2D30', metalness: 1, roughness: 0.38};

/** Glass that contributes reflections only (additive over the screen). */
const GlassSheen: React.FC<{w: number; h: number; r: number; z: number; strength?: number}> = ({w, h, r, z, strength = 1}) => (
  <mesh position={[0, 0, z]} geometry={slabGeometry(w, h, 0.004, r)}>
    <meshPhysicalMaterial
      color="#000000"
      metalness={0}
      roughness={0.09}
      clearcoat={0.4}
      clearcoatRoughness={0.06}
      reflectivity={0.1 * strength}
      envMapIntensity={0.35 * strength}
      transparent
      blending={THREE.AdditiveBlending}
      depthWrite={false}
    />
  </mesh>
);

const Screen: React.FC<{
  w: number;
  h: number;
  px: number;
  z: number;
  draw: (c: Ctx, W: number, H: number) => void;
  drawKey?: string;
  brightness?: number;
  r: number;
}> = ({w, h, px, z, draw, drawKey, brightness = 1, r}) => {
  const q = useTexScale();
  const [W, H] = capCanvas(Math.round(w * px * q), Math.round(h * px * q));
  const tex = useCanvasTexture(W, H, (c) => draw(c, W, H), drawKey);
  const geo = React.useMemo(() => {
    // rounded-rect screen shape with proper UVs
    const g = new THREE.ShapeGeometry(roundedShape(w, h, r), 48);
    const pos = g.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = pos.getX(i) / w + 0.5;
      uv[i * 2 + 1] = pos.getY(i) / h + 0.5;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return g;
  }, [w, h, r]);
  return (
    <mesh position={[0, 0, z]} geometry={geo}>
      <meshBasicMaterial map={tex} toneMapped={false} color={new THREE.Color(brightness, brightness, brightness)} />
    </mesh>
  );
};

export const roundedShape = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const R = Math.min(r, w / 2, h / 2);
  s.moveTo(-w / 2 + R, -h / 2);
  s.lineTo(w / 2 - R, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + R);
  s.lineTo(w / 2, h / 2 - R);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - R, h / 2);
  s.lineTo(-w / 2 + R, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - R);
  s.lineTo(-w / 2, -h / 2 + R);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + R, -h / 2);
  return s;
};

type DeviceProps = {
  position?: V3;
  rotation?: V3;
  scale?: number;
  draw: (c: Ctx, W: number, H: number) => void;
  drawKey?: string;
  brightness?: number;
  px?: number;
  opacity?: number;
  sheen?: number;
  children?: React.ReactNode;
};

// ---------------------------------------------------------------- iPhone
const MM = 2.9 / 71.5;
export const IPHONE = {w: 71.5 * MM, h: 149.6 * MM, d: 8.25 * MM, r: 11.6 * MM, bezel: 1.55 * MM};
export const IPHONE_SCREEN = {w: IPHONE.w - IPHONE.bezel * 2, h: IPHONE.h - IPHONE.bezel * 2, r: 10.2 * MM};

export const IPhone: React.FC<DeviceProps> = ({position, rotation, scale = 1, draw, drawKey, brightness = 1, px = 300, opacity = 1, sheen = 1, children}) => {
  const {w, h, d, r} = IPHONE;
  if (opacity <= 0.001) return null;
  const btn = (y: number, len: number, side: -1 | 1, key: string) => (
    <mesh key={key} position={[side * (w / 2 + 0.006), y, 0]} geometry={slabGeometry(0.03, len, 0.07, 0.014)} rotation={[0, Math.PI / 2, 0]}>
      <meshStandardMaterial {...TITANIUM} />
    </mesh>
  );
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* titanium band */}
      <mesh geometry={slabGeometry(w, h, d, r)}>
        <meshStandardMaterial {...TITANIUM} transparent={opacity < 1} opacity={opacity} />
      </mesh>
      {/* front glass (black border visible around the screen) */}
      <mesh position={[0, 0, d / 2 - 0.004]} geometry={slabGeometry(w - 0.05, h - 0.05, 0.012, r - 0.025)}>
        <meshPhysicalMaterial color="#020203" roughness={0.05} metalness={0} clearcoat={1} clearcoatRoughness={0.03} />
      </mesh>
      <Screen w={IPHONE_SCREEN.w} h={IPHONE_SCREEN.h} r={IPHONE_SCREEN.r} px={px} z={d / 2 + 0.004} draw={draw} drawKey={drawKey} brightness={brightness * opacity} />
      {/* front camera inside the Dynamic Island the screen canvas draws
          (island centre 29pt from the top, lens right of centre) */}
      <mesh position={[IPHONE_SCREEN.w * (233 / 390 - 0.5), IPHONE_SCREEN.h / 2 - IPHONE_SCREEN.h * (29 / 844), d / 2 + 0.006]}>
        <circleGeometry args={[0.052, 64]} />
        <meshPhysicalMaterial color="#05080D" roughness={0.05} clearcoat={1} clearcoatRoughness={0.04} />
      </mesh>
      <mesh position={[IPHONE_SCREEN.w * (233 / 390 - 0.5), IPHONE_SCREEN.h / 2 - IPHONE_SCREEN.h * (29 / 844), d / 2 + 0.007]}>
        <circleGeometry args={[0.022, 48]} />
        <meshPhysicalMaterial color="#0E2233" roughness={0.02} clearcoat={1} />
      </mesh>
      {sheen > 0 ? <GlassSheen w={w - 0.05} h={h - 0.05} r={r - 0.025} z={d / 2 + 0.008} strength={sheen} /> : null}
      {/* matte back glass, a step rougher than the polished band */}
      <mesh position={[0, 0, -d / 2 + 0.004]} geometry={slabGeometry(w - 0.06, h - 0.06, 0.01, r - 0.03)}>
        <meshPhysicalMaterial color="#17171A" roughness={0.32} metalness={0.1} clearcoat={0.6} clearcoatRoughness={0.25} transparent={opacity < 1} opacity={opacity} />
      </mesh>
      {/* buttons: action + volume (left), side + camera control (right) */}
      {btn(h * 0.27, 0.22, -1, 'a')}
      {btn(h * 0.17, 0.42, -1, 'v1')}
      {btn(h * 0.06, 0.42, -1, 'v2')}
      {btn(h * 0.15, 0.62, 1, 'p')}
      {btn(-h * 0.12, 0.38, 1, 'c')}
      {/* camera plateau on the back */}
      <group position={[-w * 0.2, h * 0.36, -d / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
        <mesh geometry={slabGeometry(1.45, 1.45, 0.06, 0.42)}>
          <meshPhysicalMaterial color="#1A1A1D" roughness={0.18} metalness={0.3} clearcoat={1} />
        </mesh>
        {[
          [-0.36, 0.36],
          [-0.36, -0.36],
          [0.36, 0],
        ].map(([x, y], i) => (
          <group key={i} position={[x, y, 0.06]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.27, 0.29, 0.08, 96]} />
              <meshStandardMaterial {...TITANIUM} />
            </mesh>
            {/* barrel, then the coated element deep inside it */}
            <mesh position={[0, 0, 0.045]}>
              <circleGeometry args={[0.2, 96]} />
              <meshPhysicalMaterial color="#05070A" roughness={0.02} clearcoat={1} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.047]}>
              <circleGeometry args={[0.125, 72]} />
              <meshPhysicalMaterial color="#02040A" roughness={0.05} clearcoat={1} />
            </mesh>
            <mesh position={[0, 0, 0.048]}>
              <circleGeometry args={[0.072, 64]} />
              <meshPhysicalMaterial color="#0B1E30" roughness={0.01} clearcoat={1} clearcoatRoughness={0.02} metalness={0.1} />
            </mesh>
          </group>
        ))}
        {/* flash, LiDAR, mic */}
        <mesh position={[0.38, 0.38, 0.045]}>
          <circleGeometry args={[0.09, 64]} />
          <meshPhysicalMaterial color="#F5EBC8" roughness={0.35} clearcoat={1} emissive="#40381F" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0.38, -0.38, 0.045]}>
          <circleGeometry args={[0.07, 64]} />
          <meshPhysicalMaterial color="#0A0A0C" roughness={0.08} clearcoat={1} />
        </mesh>
        <mesh position={[0.38, -0.18, 0.045]}>
          <circleGeometry args={[0.02, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>
      {children}
    </group>
  );
};

// ---------------------------------------------------------------- iPad Pro (landscape)
const MMI = 4.6 / 249.7;
export const IPAD = {w: 249.7 * MMI, h: 177.5 * MMI, d: 5.3 * MMI, r: 18 * MMI, bezel: 6.3 * MMI};
export const IPAD_SCREEN = {w: IPAD.w - IPAD.bezel * 2, h: IPAD.h - IPAD.bezel * 2, r: 12 * MMI};

export const IPad: React.FC<DeviceProps> = ({position, rotation, scale = 1, draw, drawKey, brightness = 1, px = 280, opacity = 1, children}) => {
  const {w, h, d, r} = IPAD;
  if (opacity <= 0.001) return null;
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <mesh geometry={slabGeometry(w, h, d, r)}>
        <meshStandardMaterial {...ALU} />
      </mesh>
      <mesh position={[0, 0, d / 2 - 0.004]} geometry={slabGeometry(w - 0.04, h - 0.04, 0.012, r - 0.02)}>
        <meshPhysicalMaterial color="#020203" roughness={0.05} clearcoat={1} clearcoatRoughness={0.03} />
      </mesh>
      <Screen w={IPAD_SCREEN.w} h={IPAD_SCREEN.h} r={IPAD_SCREEN.r} px={px} z={d / 2 + 0.004} draw={draw} drawKey={drawKey} brightness={brightness} />
      {/* landscape front camera, centred on the long edge's bezel */}
      <mesh position={[0, h / 2 - IPAD.bezel * 0.5, d / 2 + 0.006]}>
        <circleGeometry args={[0.035, 64]} />
        <meshPhysicalMaterial color="#05080D" roughness={0.05} clearcoat={1} />
      </mesh>
      <GlassSheen w={w - 0.04} h={h - 0.04} r={r - 0.02} z={d / 2 + 0.008} />
      {children}
    </group>
  );
};

// ---------------------------------------------------------------- MacBook Pro 14
const MMB = 6.2 / 312.6;
export const MAC = {w: 312.6 * MMB, lidH: 215 * MMB, baseD: 221.2 * MMB, lidT: 5 * MMB, baseT: 10.5 * MMB, r: 10 * MMB, bezel: 6 * MMB};
export const MAC_SCREEN = {w: MAC.w - MAC.bezel * 2, h: MAC.lidH - MAC.bezel * 2 - 0.05, r: 0.07};

/** The keyboard deck, drawn once to a texture: function row, four key rows
 *  and a spacebar row between two speaker grilles. Flat black read as a
 *  mock-up at 1080p; at 4K the deck has to be a real keyboard. */
const KeyboardDeck: React.FC<{w: number; h: number}> = ({w, h}) => {
  const q = useTexScale();
  const [W, H] = capCanvas(Math.round(1500 * q), Math.round(520 * q));
  const tex = useCanvasTexture(
    W,
    H,
    (c) => {
      c.fillStyle = '#0B0B0D';
      c.fillRect(0, 0, W, H);
      const grille = W * 0.055;
      // speaker grilles: two fine dot fields flanking the keys
      c.fillStyle = 'rgba(255,255,255,0.10)';
      const step = W * 0.011;
      for (let x = step; x < grille; x += step) {
        for (let y = step; y < H - step; y += step) {
          c.beginPath();
          c.arc(x, y, step * 0.16, 0, Math.PI * 2);
          c.arc(W - x, y, step * 0.16, 0, Math.PI * 2);
          c.fill();
        }
      }
      const x0 = grille + W * 0.012;
      const kw = (W - x0 * 2) / 14;
      const gap = kw * 0.14;
      const key = (x: number, y: number, wk: number, hk: number) => {
        fillRR(c, x, y, wk, hk, hk * 0.16, '#1B1B1F');
        c.fillStyle = 'rgba(255,255,255,0.07)';
        c.fillRect(x + 2, y + 1, wk - 4, 1.5);
      };
      // function row (half height, against the hinge)
      const fh = H * 0.075;
      for (let i = 0; i < 14; i++) key(x0 + i * kw + gap / 2, H * 0.035, kw - gap, fh);
      // four full rows
      const rh = H * 0.165;
      for (let rI = 0; rI < 4; rI++) {
        const y = H * 0.035 + fh + H * 0.03 + rI * (rh + H * 0.022);
        for (let i = 0; i < 14; i++) key(x0 + i * kw + gap / 2, y, kw - gap, rh);
      }
      // bottom row with the spacebar
      const yb = H * 0.035 + fh + H * 0.03 + 4 * (rh + H * 0.022);
      [1.6, 1.2, 1.4].reduce((x, wk) => (key(x + gap / 2, yb, kw * wk - gap, rh), x + kw * wk), x0);
      key(x0 + kw * 4.2 + gap / 2, yb, kw * 5.6 - gap, rh);
      [1.4, 1.2, 1.6].reduce((x, wk) => (key(x + gap / 2, yb, kw * wk - gap, rh), x + kw * wk), x0 + kw * 9.8);
    },
    'kb',
  );
  return (
    <mesh>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} roughness={0.55} metalness={0.15} />
    </mesh>
  );
};

export const MacBook: React.FC<DeviceProps & {open?: number}> = ({position, rotation, scale = 1, draw, drawKey, brightness = 1, px = 260, opacity = 1, open = 1, children}) => {
  const {w, lidH, baseD, lidT, baseT, r} = MAC;
  if (opacity <= 0.001) return null;
  const lidAngle = -Math.PI / 2 + (1 - open) * (Math.PI / 2) - 0.18 * open; // ~100 deg open
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* base */}
      <group position={[0, 0, baseD / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={slabGeometry(w, baseD, baseT, r)}>
          <meshStandardMaterial {...ALU} />
        </mesh>
        {/* keyboard deck + trackpad */}
        <group position={[0, baseD * 0.14, baseT / 2 + 0.002]}>
          <KeyboardDeck w={w * 0.96} h={baseD * 0.42} />
        </group>
        <mesh position={[0, -baseD * 0.27, baseT / 2 + 0.002]} geometry={slabGeometry(w * 0.38, baseD * 0.3, 0.002, 0.08)}>
          <meshStandardMaterial color="#26272A" roughness={0.25} metalness={0.6} />
        </mesh>
      </group>
      {/* hinge barrel along the back edge */}
      <mesh position={[0, baseT / 2, 0.01]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[baseT * 0.52, baseT * 0.52, w * 0.78, 48]} />
        <meshStandardMaterial color="#17181A" metalness={0.9} roughness={0.35} />
      </mesh>
      {/* lid, hinged at the back edge */}
      <group position={[0, baseT / 2, 0]} rotation={[lidAngle + Math.PI / 2, 0, 0]}>
        <group position={[0, lidH / 2, 0]}>
          <mesh geometry={slabGeometry(w, lidH, lidT, r)}>
            <meshStandardMaterial {...ALU} />
          </mesh>
          <mesh position={[0, 0, lidT / 2 + 0.001]} geometry={slabGeometry(w - 0.03, lidH - 0.03, 0.006, r - 0.015)}>
            <meshPhysicalMaterial color="#030304" roughness={0.08} clearcoat={1} />
          </mesh>
          <group position={[0, -0.025, 0]}>
            <Screen w={MAC_SCREEN.w} h={MAC_SCREEN.h} r={MAC_SCREEN.r} px={px} z={lidT / 2 + 0.006} draw={draw} drawKey={drawKey} brightness={brightness} />
          </group>
          {/* notch, with its camera */}
          <mesh position={[0, lidH / 2 - MAC.bezel - 0.07, lidT / 2 + 0.008]} geometry={slabGeometry(0.62, 0.17, 0.002, 0.05)}>
            <meshBasicMaterial color="#030304" />
          </mesh>
          <mesh position={[0, lidH / 2 - MAC.bezel - 0.075, lidT / 2 + 0.0095]}>
            <circleGeometry args={[0.026, 48]} />
            <meshPhysicalMaterial color="#0A1420" roughness={0.05} clearcoat={1} />
          </mesh>
          <GlassSheen w={w - 0.03} h={lidH - 0.03} r={r - 0.015} z={lidT / 2 + 0.01} strength={0.8} />
        </group>
      </group>
      {children}
    </group>
  );
};
