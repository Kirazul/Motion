// Everything that appears in the film, act by act. Positions and times come
// from story.ts; screens from screens.ts / screens2.ts.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {s, e, word, at} from '../lib/time';
import {k, ease, noise, rnd, sp, clamp, kf} from '../lib/anim';
import {
  GRID, heroPose, clientAt, onScreen, inboxN, COMP, STEPPER, stepNode, BUILD, CLICK_AT, CTA_PILL, LOGO, flowSteps, VOID, setLogoDotX,
} from './story';
import {IPhone, IPad, MacBook} from './devices';
import {Slab, CanvasPlane, slabGeometry} from './common';
import {Ctx, fillRR, strokeRR, text, icon, vgrad, hgrad, measure, useRadialTexture} from './ui2d';
import {screenFrame, feed, chat, inbox, competitor} from './screens';
import {search, SEARCHES, profile, callFailed, notFound, dmSeen, messy, landingPhone, flowPhone, landingTablet, landingDesktop, THEMES} from './screens2';
import {v3, V3} from './path';

const INITIALS = ['SA', 'MB', 'YK', 'AM', 'RH', 'NJ', 'OT', 'LB', 'KD', 'IM', 'HZ', 'FB', '', 'WS', 'AJ', 'RM', 'ZT', 'EG', 'BN', 'SK', 'MH', 'DC', 'TL', 'YB', 'NA'];

/** Cross-fade two screen states inside one canvas (iOS-like: the new one rises 14pt). */
const xfade = (c: Ctx, f: number, a: (c: Ctx) => void, b: (c: Ctx) => void) => {
  if (f <= 0.001) return a(c);
  if (f >= 0.999) return b(c);
  c.save();
  c.globalAlpha = 1 - f;
  a(c);
  c.restore();
  c.save();
  c.globalAlpha = f;
  c.translate(0, (1 - ease.out(f)) * 14);
  c.fillStyle = `rgba(0,0,0,${f})`;
  c.fillRect(0, -20, 390, 900);
  b(c);
  c.restore();
};

// ============================================================ 1 - contacts
const Contact: React.FC<{i: number; t: number; lossAt: number}> = ({i, t, lossAt}) => {
  const col = i % 5;
  const row = Math.floor(i / 5);
  const ph = i * 0.77;
  const x0 = GRID.c[0] + (col - 2) * GRID.step;
  const y0 = GRID.c[1] + (2 - row) * GRID.step;
  const flash = k(t, lossAt, lossAt + 0.1, 0, 1, ease.out) * k(t, lossAt + 0.12, lossAt + 0.7, 1, 0.35, ease.inOut);
  const turn = k(t, lossAt + 0.1, lossAt + 0.9, 0, 1, ease.inOut);
  const go = k(t, lossAt + 0.25, lossAt + 1.35, 0, 1, ease.in);
  if (go >= 0.999) return null;
  const x = x0 + noise(t * 0.6, ph) * 0.02 + go * (rnd(i) - 0.5) * 0.7;
  const y = y0 + noise(t * 0.55, ph + 9) * 0.025 - go * go * 3.6;
  const z = noise(t * 0.4, ph + 3) * 0.05 - go * 3.2;
  const dir = rnd(i + 7) < 0.5 ? -1 : 1;
  const D = GRID.r * 2;
  const red = Math.round(flash * 20) / 20;
  return (
    <Slab
      w={D}
      h={D}
      d={0.16}
      r={GRID.r}
      position={[x, y, z]}
      rotation={[noise(t * 0.45, ph + 2) * 0.05 + go * 0.8, dir * turn * Math.PI * 0.62 + noise(t * 0.5, ph + 1) * 0.05, 0]}
      opacity={1 - clamp(go * 1.2)}
      color="#2A2A2E"
      metal={0.4}
      rough={0.24}
      facePx={380}
      faceInset={0.03}
      faceGlow={0.92 + flash * 0.25}
      faceKey={`c${i}:${red}`}
      face={(c, W) => {
        const r = W / 2;
        c.beginPath();
        c.arc(r, r, r, 0, Math.PI * 2);
        c.fillStyle = vgrad(c, 0, W, '#7C7C82', '#4A4A4F');
        c.fill();
        if (red > 0) {
          c.fillStyle = `rgba(255,59,48,${0.88 * red})`;
          c.fill();
        }
        const ini = INITIALS[i];
        text(c, ini, r, r + W * 0.02, {size: W * 0.38, weight: 600, color: '#FFFFFF', align: 'center', tracking: -1});
      }}
    />
  );
};

/** When each contact goes out: slowly, then all at once (shared with the sound). */
export const lossSchedule = () => {
  const order = Array.from({length: 25}, (_, i) => i).filter((i) => i !== 12).sort((a, b) => rnd(a + 3) - rnd(b + 3));
  const tA = word('p01', 'خسرتو') - 0.02;
  const tB = e('p02') - 1.0;
  const lossAt = new Map<number, number>();
  order.forEach((id, n) => lossAt.set(id, tA + (tB - tA) * Math.pow((n + 1) / order.length, 0.62)));
  return {order, lossAt, tA, tB};
};

export const ActContacts: React.FC<{t: number}> = ({t}) => {
  const {order, lossAt, tA} = useMemo(() => lossSchedule(), []);
  if (t > s('p03') + 0.6) return null;
  const lost = order.filter((id) => t >= (lossAt.get(id) ?? 1e9)).length;
  const pillIn = sp(t, tA + 0.2, 140, 24);
  const pillOut = k(t, e('p02') - 0.6, e('p02') - 0.1, 1, 0, ease.in);
  return (
    <group>
      {order.map((i) => (
        <Contact key={i} i={i} t={t} lossAt={lossAt.get(i) ?? 1e9} />
      ))}
      <CanvasPlane
        w={1.9}
        h={0.5}
        px={300}
        position={[0, GRID.c[1] - 2 * GRID.step - 0.92 + (1 - pillIn) * -0.15, 0.2]}
        opacity={pillIn * pillOut}
        drawKey={`pill${lost}`}
        draw={(c, W, H) => {
          fillRR(c, 3, 3, W - 6, H - 6, (H - 6) / 2, vgrad(c, 0, H, 'rgba(72,22,20,0.96)', 'rgba(34,10,9,0.98)'));
          c.lineWidth = 4;
          c.strokeStyle = 'rgba(255,69,58,0.55)';
          c.stroke();
          text(c, `−${lost}`, W * 0.47, H / 2 + 2, {size: H * 0.52, weight: 700, color: '#FF453A', align: 'right', tracking: -1});
          text(c, 'Clients', W * 0.52, H / 2 + 2, {size: H * 0.34, weight: 600, color: '#FFB4AE'});
        }}
      />
    </group>
  );
};

// ============================================================ the client
export const ClientToken: React.FC<{t: number}> = ({t}) => {
  const c = clientAt(t);
  const halo = useRadialTexture('rgba(94,234,212,1)', 'rgba(10,132,255,0)', 128);
  const D = GRID.r * 2;
  const sq = 1 - c.press * 0.18;
  const flipKey = Math.round(c.glow * 10);
  return (
    <group position={c.p} rotation={c.r} scale={[c.scale, c.scale, c.scale]}>
      <group rotation={[0, c.flip * Math.PI, 0]} scale={[1, 1, sq]}>
        <Slab
          w={D}
          h={D}
          d={0.16}
          r={GRID.r}
          color="#26343A"
          metal={0.5}
          rough={0.2}
          facePx={380}
          faceInset={0.03}
          faceGlow={0.95}
          faceKey={`front${flipKey}`}
          face={(cx, W) => {
            const r = W / 2;
            cx.beginPath();
            cx.arc(r, r, r, 0, Math.PI * 2);
            cx.fillStyle = vgrad(cx, 0, W, '#5E8784', '#2B4543');
            cx.fill();
            cx.lineWidth = W * 0.045;
            cx.strokeStyle = `rgba(94,234,212,${0.45 + 0.5 * Math.min(1, c.glow)})`;
            cx.beginPath();
            cx.arc(r, r, r - cx.lineWidth / 2, 0, Math.PI * 2);
            cx.stroke();
            icon(cx, 'person', r, r + W * 0.02, W * 0.6, '#FFFFFF');
          }}
        />
        {/* the other side: clarity */}
        <group rotation={[0, Math.PI, 0]}>
          <CanvasPlane
            w={D - 0.06}
            h={D - 0.06}
            px={380}
            position={[0, 0, 0.081]}
            drawKey="back"
            emissive={0.98}
            draw={(cx, W) => {
              const r = W / 2;
              cx.beginPath();
              cx.arc(r, r, r, 0, Math.PI * 2);
              cx.fillStyle = hgrad(cx, 0, W, ['#5EEAD4', '#64D2FF', '#0A84FF']);
              cx.fill();
              icon(cx, 'check', r, r, W * 0.56, '#FFFFFF', 3.4);
            }}
          />
        </group>
      </group>
      <sprite scale={[D * 3.2, D * 3.2, 1]}>
        <spriteMaterial map={halo} transparent opacity={0.16 * c.glow} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      {c.glow > 0.9 ? <pointLight color="#7FF5E6" intensity={2.5 * (c.glow - 0.9)} distance={4} decay={2} /> : null}
    </group>
  );
};

// ============================================================ the hero phone and its screens
export const HeroPhone: React.FC<{t: number}> = ({t}) => {
  const pose = heroPose(t);
  const tap = word('p07', 'Ad');
  const steps = flowSteps();
  // which screen, and how far into it
  type St = {key: string; draw: (c: Ctx) => void};
  const st = (): St => {
    if (t < s('p05')) {
      const typed = k(t, s('p03') + 0.4, s('p03') + 1.5, 0, 1, ease.linear);
      const res = k(t, s('p03') + 1.6, s('p03') + 2.0, 0, 1);
      return {key: `s${Math.round(typed * 40)}:${Math.round(res * 20)}`, draw: (c) => search(c, 'resto Tunis', typed, res)};
    }
    if (t < s('p06')) {
      const f = k(t, s('p05'), s('p05') + 0.35, 0, 1);
      const look = (t - s('p05')) * 1.2;
      return {key: `p${Math.round(f * 20)}:${Math.round(look * 12)}`, draw: (c) => xfade(c, f, (cc) => search(cc, 'resto Tunis', 1, 1), (cc) => profile(cc, look))};
    }
    if (t < s('p07') - 0.2) {
      const f = k(t, s('p06'), s('p06') + 0.35, 0, 1);
      return {key: `d${Math.round(f * 20)}`, draw: (c) => xfade(c, f, (cc) => profile(cc, 0), dmSeen)};
    }
    if (t < s('p08')) {
      const f = k(t, s('p07') - 0.2, s('p07') + 0.15, 0, 1);
      const scroll = k(t, s('p07') - 0.2, s('p07') + 0.7, 260, 0, ease.out);
      const press = k(t, tap - 0.05, tap, 0, 1) * (1 - k(t, tap + 0.15, tap + 0.4, 0, 1));
      const rip = k(t, tap, tap + 0.6, 0, 1, ease.linear);
      return {key: `f${Math.round(f * 20)}:${Math.round(scroll)}:${Math.round(press * 10)}:${Math.round(rip * 30)}`, draw: (c) => xfade(c, f, dmSeen, (cc) => feed(cc, scroll, press, rip))};
    }
    if (t < s('p09')) {
      const f = k(t, s('p08') - 0.05, s('p08') + 0.3, 0, 1);
      return {key: `c${Math.round(f * 20)}:${Math.round(t * 20)}`, draw: (c) => xfade(c, f, (cc) => feed(cc, 0, 0, 0), (cc) => chat(cc, t, s('p08') + 0.35, s('p08') + 1.05))};
    }
    if (t < s('p11')) {
      const f = k(t, s('p09') - 0.05, s('p09') + 0.3, 0, 1);
      const n = inboxN(t);
      return {key: `i${Math.round(f * 20)}:${Math.round(n * 40)}`, draw: (c) => xfade(c, f, (cc) => chat(cc, 99, 0, 0), (cc) => inbox(cc, n))};
    }
    if (t < s('p14')) {
      const f = k(t, s('p11') + 0.3, s('p11') + 0.7, 0, 1);
      const scroll = 180 + Math.sin((t - s('p11')) * 2.4) * 150;
      return {key: `m${Math.round(f * 20)}:${Math.round(scroll)}`, draw: (c) => xfade(c, f, (cc) => inbox(cc, 6.4), (cc) => messy(cc, scroll))};
    }
    if (t < steps[0] - 0.15) {
      const build = k(t, s('p14') + 0.6, s('p14') + 1.9, 0, 1, ease.inOut);
      const focus = k(t, s('p16') + 0.6, e('p16'), 0, 1, ease.inOut);
      return {key: `l${Math.round(build * 60)}:${Math.round(focus * 30)}`, draw: (c) => landingPhone(c, 0, build, focus)};
    }
    const p = kf(t, [steps[0], steps[1], steps[2]], [1, 2, 3], ease.out);
    const confirm = k(t, steps[3], steps[3] + 0.7, 0, 1, ease.out);
    const fIn = k(t, steps[0] - 0.15, steps[0] + 0.1, 0, 1);
    const pp = t < steps[0] ? 0 : p;
    return {key: `w${Math.round(fIn * 20)}:${Math.round(pp * 30)}:${Math.round(confirm * 40)}`, draw: (c) => xfade(c, fIn, (cc) => landingPhone(cc, 0, 1, 1), (cc) => flowPhone(cc, 0, pp, confirm))};
  };
  const state = st();
  const wake = k(t, s('p03') - 0.05, s('p03') + 0.4, 0, 1);
  const dimEnd = 1 - 0.55 * k(t, s('p18') - 0.1, s('p18') + 0.6, 0, 1);
  return (
    <IPhone
      position={pose.p}
      rotation={pose.r}
      opacity={pose.o}
      brightness={0.92 * wake * dimEnd}
      drawKey={state.key}
      draw={(c, W, H) => screenFrame(c, W, H, state.draw)}
    />
  );
};

// ============================================================ 2 - everyone is searching
const FIELD: {p: V3; ry: number}[] = [
  {p: [-4.0, -1.9, -3.2], ry: 0.32},
  {p: [4.1, -1.6, -2.8], ry: -0.32},
  {p: [-2.3, -4.6, 2.2], ry: 0.18},
  {p: [2.5, -4.9, 2.0], ry: -0.18},
  {p: [-6.6, -0.6, -9.5], ry: 0.38},
  {p: [6.8, -0.4, -10], ry: -0.38},
  {p: [-1.9, 0.2, -11], ry: 0.12},
  {p: [2.3, 0.0, -12], ry: -0.12},
  {p: [-7.2, -5.6, -4.5], ry: 0.42},
  {p: [7.3, -5.8, -5], ry: -0.42},
];

export const ActSearching: React.FC<{t: number}> = ({t}) => {
  if (t < s('p04') - 0.4 || t > s('p05') + 1.4) return null;
  const out = k(t, s('p05') - 0.05, s('p05') + 0.9, 0, 1, ease.in);
  return (
    <group>
      {FIELD.map((f, i) => {
        const t0 = s('p04') - 0.25 + i * 0.07;
        const a = sp(t, t0, 90, 20);
        const typed = k(t, t0 + 0.15, t0 + 0.9, 0, 1, ease.linear);
        const res = k(t, t0 + 0.95, t0 + 1.3, 0, 1);
        const q = SEARCHES[i % SEARCHES.length];
        return (
          <IPhone
            key={i}
            position={v3.add(f.p, [0, (1 - a) * -1.2 - out * 1.5 + noise(t * 0.4, i) * 0.06, -out * 2])}
            rotation={[0.02 + noise(t * 0.3, i + 3) * 0.02, f.ry + noise(t * 0.25, i + 7) * 0.03, 0]}
            opacity={a * (1 - out)}
            brightness={0.85 * a * (1 - out)}
            px={120}
            drawKey={`f${i}:${Math.round(typed * 20)}:${Math.round(res * 10)}`}
            draw={(c, W, H) => screenFrame(c, W, H, (cc) => search(cc, q, typed, res))}
          />
        );
      })}
    </group>
  );
};

// ============================================================ 3 - the dead ends
export const ActDeadEnds: React.FC<{t: number}> = ({t}) => {
  if (t < s('p06') - 0.1 || t > s('p07') + 0.6) return null;
  const open = k(t, s('p06') + 0.05, s('p06') + 0.75, 0, 1, ease.out) * (1 - k(t, s('p07') - 0.3, s('p07') + 0.35, 0, 1, ease.inOut));
  const sides: {x: number; ry: number; draw: (c: Ctx) => void; key: string; label: string; ic: string}[] = [
    {x: -2.5, ry: 0.45, draw: callFailed, key: 'call', label: 'Sans réponse', ic: 'phone'},
    {x: 2.5, ry: -0.45, draw: notFound, key: '404', label: 'Page introuvable', ic: 'x'},
  ];
  const tagA = sp(t, s('p06') + 0.55, 120, 22) * (1 - k(t, s('p07') - 0.4, s('p07'), 0, 1));
  return (
    <group>
      {sides.map((sd, i) => (
        <group key={sd.key}>
          <IPhone
            position={[sd.x * open, 0, -1.9 * open - 0.2]}
            rotation={[0, sd.ry * open, 0]}
            opacity={Math.min(1, open * 3)}
            brightness={0.9}
            drawKey={sd.key}
            draw={(c, W, H) => screenFrame(c, W, H, sd.draw)}
          />
          <CanvasPlane
            w={1.9}
            h={0.42}
            px={260}
            position={[sd.x * 1.02, -3.55, -1.6]}
            opacity={tagA}
            billboard
            drawKey={`tag${i}`}
            draw={(c, W, H) => {
              fillRR(c, 2, 2, W - 4, H - 4, (H - 4) / 2, vgrad(c, 0, H, 'rgba(70,22,20,0.95)', 'rgba(36,10,9,0.97)'));
              c.lineWidth = 3;
              c.strokeStyle = 'rgba(255,69,58,0.5)';
              c.stroke();
              icon(c, sd.ic, H * 0.55, H / 2, H * 0.5, '#FF6961', 2.6);
              text(c, sd.label, H * 0.95, H / 2 + 1, {size: H * 0.4, weight: 600, color: '#FFB4AE'});
            }}
          />
        </group>
      ))}
      <CanvasPlane
        w={1.4}
        h={0.42}
        px={260}
        position={[0, -3.55, 0.4]}
        opacity={tagA}
        billboard
        drawKey="tagVu"
        draw={(c, W, H) => {
          fillRR(c, 2, 2, W - 4, H - 4, (H - 4) / 2, vgrad(c, 0, H, 'rgba(70,22,20,0.95)', 'rgba(36,10,9,0.97)'));
          c.lineWidth = 3;
          c.strokeStyle = 'rgba(255,69,58,0.5)';
          c.stroke();
          icon(c, 'bubble', H * 0.55, H / 2, H * 0.5, '#FF6961', 2.6);
          text(c, 'Vu', H * 0.95, H / 2 + 1, {size: H * 0.4, weight: 600, color: '#FFB4AE'});
        }}
      />
    </group>
  );
};

// ============================================================ 4 - the budget
export const ActBudget: React.FC<{t: number}> = ({t}) => {
  if (t < s('p08') - 0.3 || t > s('p09') + 0.6) return null;
  const a = sp(t, s('p08') - 0.1, 110, 22) * (1 - k(t, s('p09') - 0.05, s('p09') + 0.45, 0, 1, ease.in));
  const spent = Math.round(kf(t, [s('p08') + 0.1, e('p08') + 0.1], [0, 2450], ease.out) / 10) * 10;
  const pose = heroPose(t);
  const p: V3 = v3.add(pose.p, [2.25, -1.35, 1.15]);
  return (
    <Slab
      w={1.95}
      h={1.95}
      d={0.08}
      r={0.38}
      position={v3.add(p, [0, (1 - a) * -0.5, 0])}
      rotation={[0.04, -0.22, 0]}
      scale={0.92 + 0.08 * a}
      opacity={a}
      color="#1D1D20"
      metal={0.2}
      rough={0.35}
      facePx={300}
      faceInset={0.02}
      faceGlow={0.94}
      faceKey={`b${spent}`}
      face={(c, W, H) => {
        fillRR(c, 0, 0, W, H, W * 0.19, vgrad(c, 0, H, '#2A2A2E', '#141416'));
        const u = W / 160;
        icon(c, 'money', 22 * u, 24 * u, 16 * u, '#FF9F0A', 2.4);
        text(c, 'Budget pub', 36 * u, 24.5 * u, {size: 11.5 * u, weight: 700, color: '#FF9F0A'});
        text(c, `${spent.toLocaleString('fr-FR')} DT`, 14 * u, 62 * u, {size: 27 * u, weight: 800, tracking: -1.2 * u});
        text(c, 'dépensés ce mois', 14 * u, 84 * u, {size: 10.5 * u, weight: 500, color: '#A1A1A6'});
        // daily spend bars
        for (let i = 0; i < 9; i++) {
          const hh = (8 + i * 3.2 + (i % 3) * 3) * u * Math.min(1, spent / 2450 + 0.15);
          fillRR(c, (14 + i * 15) * u, 128 * u - hh, 9 * u, hh, 2 * u, i === 8 ? '#FF9F0A' : 'rgba(255,159,10,0.4)');
        }
        text(c, 'Réservations : 0', 14 * u, 144 * u, {size: 10.5 * u, weight: 700, color: '#FF6961'});
      }}
    />
  );
};

// ============================================================ 5 - the flood
const MSGS = ['Prix ?', 'C’est dispo ?', 'Comment réserver ?', 'Vous livrez ?', 'Allô ?', 'Une table pour 4 ?', 'Répondez svp', 'Ouvert demain ?'];

export const ActFlood: React.FC<{t: number}> = ({t}) => {
  if (t < s('p09') || t > e('p10') + 0.6) return null;
  const pose = heroPose(t);
  return (
    <group>
      {MSGS.map((m, i) => {
        const t0 = s('p09') + 0.3 + i * 0.16;
        const u = k(t, t0, t0 + 1.1, 0, 1, ease.in);
        if (u <= 0 || u >= 1) return null;
        const side = i % 2 ? 1 : -1;
        const fade = 1 - k(t, t0 + 0.7, t0 + 1.1, 0, 1);
        const lane = Math.floor(i / 2) % 4;
        const origin = onScreen(pose, side > 0 ? 1.02 : -0.02, 0.36 + lane * 0.12, 0.35);
        const p = v3.add(origin, [side * (1.2 + 3.2 * u), (0.15 - lane * 0.3) * u, 0.3 + 2.0 * u]);
        return (
          <Slab
            key={i}
            w={2.3}
            h={0.62}
            d={0.05}
            r={0.18}
            position={p}
            rotation={[0, side * -0.25 * u, side * (rnd(i + 9) - 0.5) * 0.3 * u]}
            opacity={fade * Math.min(1, u * 4)}
            color="#1E1E21"
            metal={0.1}
            rough={0.4}
            facePx={240}
            faceInset={0.015}
            faceGlow={0.92}
            faceKey={`m${i}`}
            face={(c, W, H) => {
              fillRR(c, 0, 0, W, H, H * 0.3, vgrad(c, 0, H, '#2C2C2F', '#1A1A1C'));
              c.beginPath();
              c.arc(H * 0.5, H / 2, H * 0.3, 0, Math.PI * 2);
              c.fillStyle = '#636366';
              c.fill();
              text(c, ['SB', 'MK', 'AT', 'YB', 'NR', 'KJ'][i % 6], H * 0.5, H / 2 + 1, {size: H * 0.24, weight: 700, align: 'center'});
              text(c, m, H * 0.95, H / 2 + 1, {size: H * 0.3, weight: 600});
              c.beginPath();
              c.arc(W - H * 0.32, H / 2, H * 0.08, 0, Math.PI * 2);
              c.fillStyle = '#0A84FF';
              c.fill();
            }}
          />
        );
      })}
    </group>
  );
};

// ============================================================ 6 - the competitor
export const ActCompetitor: React.FC<{t: number}> = ({t}) => {
  if (t < s('p10') - 0.5 || t > s('p12') + 0.2) return null;
  const a = sp(t, s('p10') - 0.35, 90, 20) * (1 - k(t, s('p11') + 0.2, s('p11') + 0.9, 0, 1, ease.in));
  const done = k(t, e('p10') - 0.05, e('p10') + 0.35, 0, 1);
  // the rewind takes the booking back
  const undone = k(t, s('p11') - 0.05, s('p11') + 0.3, 0, 1);
  const d = done * (1 - undone);
  return (
    <group>
      <IPhone
        position={v3.add(COMP.p, [0, (1 - a) * -0.8, 0])}
        rotation={COMP.r}
        scale={COMP.s}
        sheen={0.25}
        opacity={a}
        brightness={0.9 * a}
        drawKey={`comp${Math.round(d * 30)}`}
        draw={(c, W, H) => screenFrame(c, W, H, (cc) => competitor(cc, d))}
      />
      <CanvasPlane
        w={1.5}
        h={0.42}
        px={260}
        position={v3.add(COMP.p, [0.15, -3.35, 0.6])}
        opacity={a * sp(t, s('p10') + 0.1, 120, 22)}
        billboard
        drawKey="other"
        draw={(c, W, H) => {
          fillRR(c, 2, 2, W - 4, H - 4, (H - 4) / 2, vgrad(c, 0, H, 'rgba(18,58,32,0.95)', 'rgba(8,30,16,0.97)'));
          c.lineWidth = 3;
          c.strokeStyle = 'rgba(48,209,88,0.5)';
          c.stroke();
          text(c, 'حد آخر', W / 2, H / 2 + 2, {size: H * 0.46, weight: 700, color: '#B6F5C6', align: 'center', ar: true});
        }}
      />
    </group>
  );
};

// ============================================================ 6b - the next step
export const ActStepper: React.FC<{t: number}> = ({t}) => {
  if (t < s('p11') + 0.3 || t > s('p12') + 0.8) return null;
  const a = sp(t, s('p11') + 0.45, 110, 22) * (1 - k(t, s('p12') - 0.2, s('p12') + 0.5, 0, 1, ease.in));
  const blink = 0.5 + 0.5 * Math.sin((t - s('p11')) * 9);
  const bk = Math.round(blink * 6);
  return (
    <Slab
      w={STEPPER.w}
      h={STEPPER.h}
      d={0.07}
      r={0.3}
      position={v3.add(STEPPER.p, [0, (1 - a) * -0.4, 0])}
      opacity={a}
      color="#1C1C1F"
      metal={0.2}
      rough={0.35}
      facePx={300}
      faceInset={0.02}
      faceGlow={0.94}
      faceKey={`st${bk}`}
      face={(c, W, H) => {
        fillRR(c, 0, 0, W, H, H * 0.28, vgrad(c, 0, H, '#2A2A2E', '#161618'));
        const cx = (i: number) => W / 2 + (-1.05 + i * 1.05) * (W / STEPPER.w);
        const cy = H * 0.42;
        const R = H * 0.2;
        // track
        c.fillStyle = '#5EEAD4';
        c.fillRect(cx(0), cy - 2, (cx(1) - cx(0)) * 0.42, 4);
        c.setLineDash([8, 10]);
        c.strokeStyle = 'rgba(255,255,255,0.25)';
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(cx(0) + (cx(1) - cx(0)) * 0.5, cy);
        c.lineTo(cx(2), cy);
        c.stroke();
        c.setLineDash([]);
        // nodes
        c.beginPath();
        c.arc(cx(0), cy, R, 0, Math.PI * 2);
        c.fillStyle = 'rgba(94,234,212,0.18)';
        c.fill();
        c.beginPath();
        c.arc(cx(1), cy, R, 0, Math.PI * 2);
        c.fillStyle = '#141416';
        c.fill();
        c.setLineDash([7, 7]);
        c.strokeStyle = `rgba(255,159,10,${0.4 + 0.6 * (bk / 6)})`;
        c.lineWidth = 4;
        c.stroke();
        c.setLineDash([]);
        text(c, '?', cx(1), cy + 2, {size: R * 1.1, weight: 800, color: '#FF9F0A', align: 'center'});
        c.beginPath();
        c.arc(cx(2), cy, R, 0, Math.PI * 2);
        c.strokeStyle = 'rgba(255,255,255,0.12)';
        c.stroke();
        text(c, 'Click', cx(0), H * 0.82, {size: H * 0.15, weight: 700, color: '#5EEAD4', align: 'center'});
        text(c, 'Étape suivante ?', cx(1), H * 0.82, {size: H * 0.15, weight: 700, color: '#FF9F0A', align: 'center'});
        text(c, '…', cx(2), H * 0.82, {size: H * 0.15, weight: 700, color: '#636366', align: 'center'});
      }}
    />
  );
};

// ============================================================ 7 - the click
export const ActClick: React.FC<{t: number}> = ({t}) => {
  const click = CLICK_AT();
  const ring = useRadialTexture('rgba(150,255,240,1)', 'rgba(10,132,255,0)', 256);
  if (t < click - 0.05 || t > click + 1.4) return null;
  const u = k(t, click, click + 1.2, 0, 1, ease.out);
  return (
    <group position={VOID}>
      {[0, 0.12, 0.24].map((d, i) => {
        const q = clamp((u - d) / (1 - d));
        if (q <= 0) return null;
        const r = 0.42 + q * (0.42 + i * 0.05);
        return (
          <mesh key={i} rotation={[0, 0, 0]}>
            <ringGeometry args={[r, r + 0.03 + 0.04 * (1 - q), 128]} />
            <meshBasicMaterial color={new THREE.Color(1.6, 2.6, 2.4)} transparent opacity={(1 - q) * 0.75} toneMapped={false} depthWrite={false} />
          </mesh>
        );
      })}
      <sprite scale={[2.0 * (0.5 + u), 2.0 * (0.5 + u), 1]}>
        <spriteMaterial map={ring} transparent opacity={(1 - u) * 0.6} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
};

// ============================================================ 8 - what Kalmny builds
export const ActBuild: React.FC<{t: number}> = ({t}) => {
  if (t < s('p14') - 0.3 || t > e('p19') + 4) return null;
  const inMac = sp(t, s('p14') + 0.5, 70, 18);
  const inPad = sp(t, s('p14') + 0.65, 70, 18);
  const build = k(t, s('p14') + 0.7, s('p14') + 2.0, 0, 1, ease.inOut);
  // each device becomes a different trade on its cue
  const macK = k(t, word('p15', 'Produit') - 0.1, word('p15', 'Produit') + 0.45, 0, 1, ease.inOut);
  const padK = k(t, word('p15', 'Service') - 0.1, word('p15', 'Service') + 0.45, 0, 2, ease.inOut);
  const recede = k(t, s('p16') - 0.1, s('p16') + 0.8, 0, 1, ease.inOut);
  // one hero per frame: when the camera goes to the phone, the others leave
  const gone = k(t, s('p16') - 0.05, s('p16') + 0.55, 0, 1, ease.in);
  const macP = v3.add(BUILD.mac.p, [0, (1 - inMac) * -3.2 - gone * 1.5, (1 - inMac) * -6 - recede * 1.5]);
  const padP = v3.add(BUILD.pad.p, [(1 - inPad) * -5, (1 - inPad) * -1.5 - gone * 1.5, -recede * 1.0]);
  const dim = (1 - recede * 0.45) * (1 - gone);
  return (
    <group>
      <MacBook
        position={macP}
        rotation={[BUILD.mac.r[0], BUILD.mac.r[1] + (1 - inMac) * 0.6, 0]}
        opacity={Math.min(1, inMac * 2) * (1 - gone)}
        open={0.15 + 0.85 * k(t, s('p14') + 0.25, s('p14') + 1.2, 0, 1, ease.inOut)}
        brightness={0.9 * dim}
        drawKey={`mac${Math.round(build * 50)}:${Math.round(macK * 30)}`}
        draw={(c, W, H) => landingDesktop(c, W, H, macK, build)}
      />
      <IPad
        position={padP}
        rotation={[BUILD.pad.r[0], BUILD.pad.r[1] + (1 - inPad) * 0.9, 0]}
        scale={BUILD.pad.s}
        opacity={Math.min(1, inPad * 2) * (1 - gone)}
        brightness={0.9 * dim}
        drawKey={`pad${Math.round(build * 50)}:${Math.round(padK * 30)}`}
        draw={(c, W, H) => {
          c.save();
          c.beginPath();
          c.rect(0, 0, W, H);
          c.clip();
          landingTablet(c, W, H, padK, build);
          c.restore();
        }}
      />
    </group>
  );
};

// ============================================================ 9 - confirmed, in order
export const ActNotifications: React.FC<{t: number}> = ({t}) => {
  const steps = flowSteps();
  const t0 = steps[3] + 0.18;
  if (t < t0 || t > e('p19') + 4) return null;
  const pose = heroPose(t);
  const gone = k(t, s('p18') - 0.32, s('p18') + 0.02, 0, 1, ease.in);
  const items = [
    ['Nouvelle réservation', 'Sam 13 · 20:30 · 4 pers.'],
    ['Nouvelle réservation', 'Sam 13 · 21:00 · 2 pers.'],
    ['Nouvelle réservation', 'Dim 14 · 13:00 · 6 pers.'],
  ];
  return (
    <group>
      {items.map((it, i) => {
        const a = sp(t, t0 + i * 0.16, 130, 22) * (1 - gone);
        const p = v3.add(pose.p, [0, -0.85 - i * 0.84 + (1 - a) * -0.4, 1.3 + i * 0.06]);
        return (
          <Slab
            key={i}
            w={2.7}
            h={0.72}
            d={0.05}
            r={0.22}
            position={p}
            rotation={pose.r}
            opacity={a}
            color="#1F1F22"
            metal={0.1}
            rough={0.4}
            facePx={240}
            faceInset={0.015}
            faceGlow={0.93}
            faceKey={`n${i}`}
            face={(c, W, H) => {
              fillRR(c, 0, 0, W, H, H * 0.3, vgrad(c, 0, H, '#2E2E31', '#1B1B1D'));
              fillRR(c, H * 0.18, H * 0.2, H * 0.6, H * 0.6, H * 0.15, hgrad(c, 0, H, ['#30D158', '#25A244']));
              icon(c, 'calendar', H * 0.48, H * 0.5, H * 0.36, '#FFFFFF', 2.6);
              text(c, it[0], H * 0.95, H * 0.36, {size: H * 0.22, weight: 700});
              text(c, it[1], H * 0.95, H * 0.66, {size: H * 0.2, weight: 500, color: '#C7C7CC'});
            }}
          />
        );
      })}
    </group>
  );
};

// ============================================================ 10 - contact, and the mark
export const ActFinale: React.FC<{t: number}> = ({t}) => {
  if (t < s('p18') - 0.2) return null;
  const pillA = sp(t, s('p18') + 0.08, 110, 22) * (1 - k(t, s('p19') + 0.1, s('p19') + 0.6, 0, 1, ease.in));
  const press = word('p18', 'معانا') + 0.05;
  const pr = k(t, press - 0.06, press, 0, 1) * (1 - k(t, press, press + 0.2, 0, 1));
  const logoA = sp(t, s('p19') + 0.25, 80, 20);
  const tagA = sp(t, s('p19') + 0.75, 90, 20);
  const urlA = sp(t, s('p19') + 1.1, 90, 20);
  const sweep = k(t, s('p19') + 0.6, s('p19') + 2.0, -0.3, 1.3, ease.inOut);
  return (
    <group>
      <Slab
        w={3.6}
        h={0.95}
        d={0.12}
        r={0.47}
        position={v3.add(CTA_PILL.p, [0, (1 - pillA) * -0.4, -pr * 0.05])}
        scale={(0.92 + 0.08 * pillA) * (1 - pr * 0.04)}
        opacity={pillA}
        color="#123B38"
        metal={0.3}
        rough={0.25}
        facePx={300}
        faceInset={0.02}
        faceGlow={0.97}
        faceKey={`cta${Math.round(pr * 5)}`}
        face={(c, W, H) => {
          fillRR(c, 0, 0, W, H, H / 2, hgrad(c, 0, W, ['#0A84FF', '#64D2FF', '#5EEAD4']));
          icon(c, 'envelope', W - H * 0.62, H / 2, H * 0.46, '#00141A', 2.6);
          text(c, 'تواصل معانا', W / 2 - H * 0.25, H / 2 + 2, {size: H * 0.4, weight: 700, color: '#00141A', align: 'center', ar: true});
        }}
      />
      {/* the wordmark: the client lands as its dot */}
      <CanvasPlane
        w={3.6}
        h={1.1}
        px={420}
        position={v3.add(LOGO.p, [0, (1 - logoA) * -0.25, 0])}
        opacity={logoA}
        drawKey={`logo${Math.round(sweep * 40)}`}
        draw={(c, W, H) => {
          const size = H * 0.66;
          const tw = measure(c, 'kalmny', size, 800) - 6 * H * 0.03;
          const x0 = W * 0.47 - tw / 2;
          text(c, 'kalmny', x0, H * 0.5, {size, weight: 800, tracking: -H * 0.03});
          setLogoDotX(((x0 + tw + size * 0.2) / W - 0.5) * 3.6);
          if (sweep > -0.3 && sweep < 1.3) {
            c.save();
            c.globalCompositeOperation = 'source-atop';
            const g = c.createLinearGradient(W * (sweep - 0.2), 0, W * (sweep + 0.2), 0);
            g.addColorStop(0, 'rgba(94,234,212,0)');
            g.addColorStop(0.5, 'rgba(160,255,240,0.85)');
            g.addColorStop(1, 'rgba(94,234,212,0)');
            c.fillStyle = g;
            c.fillRect(0, 0, W, H);
            c.restore();
          }
        }}
      />
      <CanvasPlane
        w={4.2}
        h={0.36}
        px={300}
        position={v3.add(LOGO.p, [0, -0.95 + (1 - tagA) * -0.15, 0])}
        opacity={tagA}
        drawKey="tag"
        draw={(c, W, H) => {
          text(c, 'Landing pages · Web apps · Mobile apps', W / 2, H / 2, {size: H * 0.5, weight: 600, color: '#A1A1A6', align: 'center'});
        }}
      />
      <CanvasPlane
        w={2.6}
        h={0.5}
        px={300}
        position={v3.add(LOGO.p, [0, -1.6 + (1 - urlA) * -0.15, 0])}
        opacity={urlA}
        drawKey="url"
        draw={(c, W, H) => {
          fillRR(c, 2, 2, W - 4, H - 4, (H - 4) / 2, 'rgba(255,255,255,0.06)');
          strokeRR(c, 2, 2, W - 4, H - 4, (H - 4) / 2, 'rgba(255,255,255,0.14)', 2);
          text(c, 'kalmny.vercel.app', W / 2, H / 2 + 1, {size: H * 0.4, weight: 600, align: 'center'});
        }}
      />
    </group>
  );
};

export {slabGeometry, IPhone, at, THEMES};
