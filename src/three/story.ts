// The spine of the film. Three things move through one continuous take:
//   the HERO PHONE   - the device the story happens on
//   the CLIENT       - the one contact that survives the opening; a real
//                      object that sits in the UIs, taps the ad, gets lost in
//                      the inbox, walks to the competitor, comes back, and is
//                      finally guided through a clear flow to "confirmed"
//   the CAMERA       - framed so that nothing ever enters the headline band
// Every time below is a VO cue, so the film re-times itself to the voice.
import * as THREE from 'three';
import {s, e, word, at} from '../lib/time';
import {k, ease, noise} from '../lib/anim';
import {smoothPath, V3, v3, Key} from './path';
import {IPHONE, IPHONE_SCREEN} from './devices';

export const PT = {w: 390, h: 844};

// ---------------------------------------------------------------- hook grid
export const GRID = {c: [0, 0.15, 0] as V3, step: 0.94, r: 0.37};

// ---------------------------------------------------------------- build composition (act 8)
export const BUILD = {
  mac: {p: [0, 0.55, -4.2] as V3, r: [0.06, 0, 0] as V3},
  pad: {p: [-1.55, -2.15, 0.2] as V3, r: [0.04, 0.42, 0] as V3, s: 0.78},
  phone: {p: [1.85, -1.75, 1.25] as V3, r: [0.02, -0.32, 0] as V3},
};

// ---------------------------------------------------------------- hero phone
export type Pose = {p: V3; r: V3; s: number; o: number};

const poseKeys = () => {
  const tap = word('p07', 'Ad');
  return {
    p: [
      {t: 0, p: [0, -12, 0], stop: true},
      {t: s('p03') - 0.3, p: [0, -12, 0], stop: true},
      {t: s('p03') + 0.9, p: [0, 0, 0], stop: true},
      {t: e('p06') + 0.1, p: [0, 0, 0], stop: true},
      {t: tap - 0.2, p: [-0.15, 0, 0.3]},
      {t: s('p08') + 0.4, p: [-0.75, 0.05, 0], stop: true},
      {t: s('p09') + 0.3, p: [0, 0, 0], stop: true},
      {t: at('p10', 0.4), p: [0.35, 0, 0], stop: true},
      {t: s('p11') + 0.5, p: [0, 0.35, 0], stop: true},
      {t: e('p11') + 0.3, p: [0, 0.35, -0.6]},
      {t: s('p12') + 0.6, p: [0, 0.2, -6], stop: true},
      {t: s('p14') - 0.2, p: [7, -3, -6], stop: true},
      {t: s('p14') + 1.0, p: BUILD.phone.p, stop: true},
      {t: e('p15'), p: BUILD.phone.p, stop: true},
      {t: s('p16') + 0.7, p: v3.add(BUILD.phone.p, [-0.4, 0.4, 0.6]), stop: true},
      {t: e('p17') + 0.3, p: v3.add(BUILD.phone.p, [-0.4, 0.4, 0.6]), stop: true},
      {t: s('p18') + 0.6, p: v3.add(BUILD.phone.p, [0.3, -0.6, -2.5]), stop: true},
    ] as Key[],
    r: [
      {t: 0, p: [0.3, 0, 0], stop: true},
      {t: s('p03') - 0.3, p: [0.5, 0, 0], stop: true},
      {t: s('p03') + 0.9, p: [0, 0, 0], stop: true},
      {t: e('p04'), p: [0, 0.06, 0]},
      {t: e('p06') + 0.1, p: [0, 0, 0], stop: true},
      {t: tap - 0.2, p: [0.04, -0.12, 0]},
      {t: s('p08') + 0.4, p: [0.02, 0.16, 0], stop: true},
      {t: s('p09') + 0.3, p: [0, 0, 0], stop: true},
      {t: at('p10', 0.4), p: [0, -0.3, 0], stop: true},
      {t: s('p11') + 0.5, p: [0, 0, 0], stop: true},
      {t: s('p12') + 0.6, p: [0, 0.25, 0], stop: true},
      {t: s('p14') - 0.2, p: [0.3, -1.2, 0.2], stop: true},
      {t: s('p14') + 1.0, p: BUILD.phone.r, stop: true},
      {t: e('p15'), p: BUILD.phone.r, stop: true},
      {t: s('p16') + 0.7, p: [0, -0.08, 0], stop: true},
      {t: e('p17') + 0.3, p: [0, -0.08, 0], stop: true},
      {t: s('p18') + 0.6, p: BUILD.phone.r, stop: true},
    ] as Key[],
  };
};

let poseCache: {p: (t: number) => V3; r: (t: number) => V3} | null = null;
export const heroPose = (t: number): Pose => {
  if (!poseCache) {
    const kk = poseKeys();
    poseCache = {p: smoothPath(kk.p), r: smoothPath(kk.r)};
  }
  const appear = k(t, s('p03') - 0.3, s('p03') + 0.2, 0, 1);
  const away = k(t, s('p12') - 0.1, s('p12') + 0.7, 0, 1);
  const back = k(t, s('p14') - 0.3, s('p14') + 0.5, 0, 1);
  const fin = k(t, s('p18') - 0.2, s('p18') + 0.3, 0, 1, ease.in);
  const o = Math.min(appear, 1 - away + back, 1 - fin);
  const float: V3 = [noise(t * 0.3, 21) * 0.03, noise(t * 0.35, 23) * 0.04, 0];
  const fr: V3 = [noise(t * 0.25, 31) * 0.012, noise(t * 0.22, 37) * 0.018, 0];
  return {p: v3.add(poseCache.p(t), float), r: v3.add(poseCache.r(t), fr), s: 1, o: Math.max(0, Math.min(1, o))};
};

const m4 = new THREE.Matrix4();
const qt = new THREE.Quaternion();
const eul = new THREE.Euler();
const tmp = new THREE.Vector3();

/** A point on a device screen given its pose: u,v in 0..1 from top-left, z above the glass. */
export const onScreen = (pose: {p: V3; r: V3; s?: number}, u: number, v: number, z: number, scr = IPHONE_SCREEN, depth = IPHONE.d): V3 => {
  eul.set(pose.r[0], pose.r[1], pose.r[2]);
  qt.setFromEuler(eul);
  const sc = pose.s ?? 1;
  m4.compose(new THREE.Vector3(...pose.p), qt, new THREE.Vector3(sc, sc, sc));
  tmp.set((u - 0.5) * scr.w, (0.5 - v) * scr.h, depth / 2 + z);
  tmp.applyMatrix4(m4);
  return [tmp.x, tmp.y, tmp.z];
};
export const onHero = (t: number, u: number, v: number, z = 0.07) => onScreen(heroPose(t), u, v, z);

// ---------------------------------------------------------------- UI anchors (iPhone points)
export const AVATAR = {u: 352 / PT.w, v: 98 / PT.h};
export const AD_CTA = {u: 195 / PT.w, v: 595 / PT.h};
export const BUBBLE_SIDE = {u: 0.245, v: 508 / PT.h};
export const inboxN = (t: number) => k(t, s('p09') + 0.3, e('p09') + 0.05, 0, 6.4, ease.inOut);
export const clientRowV = (t: number) => (185 + 38 + inboxN(t) * 76) / PT.h;
export const LANDING_SLOT = {u: 360 / PT.w, v: 80 / PT.h};
export const STICKY_CTA = {u: 0.5, v: 774 / PT.h};

// ---------------------------------------------------------------- the competitor
export const COMP = {p: [-3.3, -0.9, -4.2] as V3, r: [0, 0.34, 0] as V3, s: 0.92};
export const COMP_CONFIRM = {u: 0.5, v: 729 / PT.h};

// ---------------------------------------------------------------- stepper card (act 6)
export const STEPPER = {p: [0, -1.85, 1.9] as V3, w: 3.3, h: 1.05};
export const stepNode = (i: number): V3 => v3.add(STEPPER.p, [-1.05 + i * 1.05, 0.06, 0.09]);

// ---------------------------------------------------------------- the click (act 7)
export const VOID: V3 = [0, 0.35, 2.6];
export const CLICK_AT = () => word('p13', 'Click') + 0.02;

// ---------------------------------------------------------------- finale
export const CTA_PILL = {p: [0, -0.4, 1.0] as V3};
export const LOGO = {p: [0, -0.2, 0.6] as V3};
/** Where the client finally rests: the dot of the wordmark. */
export const logoDot = (): V3 => v3.add(LOGO.p, [LOGO_DOT_X, -0.16, 0.05]);
/** x of the wordmark's full stop (measured from the rendered type, see ActFinale). */
export let LOGO_DOT_X = 1.18;
export const setLogoDotX = (x: number) => {
  LOGO_DOT_X = x;
};

// ---------------------------------------------------------------- the client
export type Client = {p: V3; r: V3; scale: number; flip: number; press: number; o: number; glow: number};

const lerpR = (a: V3, b: V3, f: number): V3 => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];

export const clientAt = (t: number): Client => {
  const base = {r: [0, 0, 0] as V3, flip: 0, press: 0, o: 1, glow: 0};
  const avatarScale = 0.42;
  // 1 - the survivor in the grid
  if (t < s('p03') - 0.2) {
    return {...base, p: GRID.c, scale: 1, glow: k(t, s('p02') + 0.3, e('p02'), 0, 1)};
  }
  // 2 - it lands in the phone as the user's avatar
  const land = s('p03') + 0.95;
  if (t < land) {
    const f = smoothPath([
      {t: s('p03') - 0.2, p: GRID.c, stop: true},
      {t: s('p03') + 0.4, p: v3.add(onHero(land, AVATAR.u, AVATAR.v, 0.06), [0.5, -0.2, 1.4])},
      {t: land, p: onHero(land, AVATAR.u, AVATAR.v, 0.06), stop: true},
    ]);
    return {...base, p: f(t), scale: k(t, s('p03') - 0.2, land, 1, avatarScale, ease.inOut), glow: k(t, s('p03'), land, 1, 0.4)};
  }
  const tap = word('p07', 'Ad');
  // 3 - on the phone through demand and dead ends
  if (t < tap - 0.45) return {...base, p: onHero(t, AVATAR.u, AVATAR.v, 0.06), r: heroPose(t).r, scale: avatarScale, glow: 0.4};
  // 4 - it taps the ad, then asks the price
  if (t < s('p09') + 0.25) {
    const f = smoothPath([
      {t: tap - 0.45, p: onHero(tap - 0.45, AVATAR.u, AVATAR.v, 0.06), stop: true},
      {t: tap - 0.12, p: onHero(tap - 0.12, AD_CTA.u, AD_CTA.v, 0.55)},
      {t: tap, p: onHero(tap, AD_CTA.u, AD_CTA.v, 0.05), stop: true},
      {t: tap + 0.28, p: onHero(tap + 0.28, AD_CTA.u, AD_CTA.v, 0.3)},
      {t: s('p08') + 0.35, p: onHero(s('p08') + 0.35, BUBBLE_SIDE.u, BUBBLE_SIDE.v, 0.06), stop: true},
      {t: e('p08') + 0.05, p: onHero(e('p08') + 0.05, BUBBLE_SIDE.u, BUBBLE_SIDE.v, 0.06), stop: true},
      {t: s('p09') + 0.25, p: onHero(s('p09') + 0.25, 46 / PT.w, clientRowV(s('p09') + 0.25), 0.06), stop: true},
    ]);
    const press = k(t, tap - 0.06, tap, 0, 1) * (1 - k(t, tap, tap + 0.22, 0, 1));
    return {...base, p: f(t), r: heroPose(t).r, scale: avatarScale, press, glow: 0.4 + press};
  }
  // 5 - pushed down the inbox by the flood
  if (t < s('p10')) return {...base, p: onHero(t, 46 / PT.w, clientRowV(t), 0.06), r: heroPose(t).r, scale: avatarScale, glow: 0.35};
  // 6 - it walks to the competitor
  const compHit = onScreen(COMP, COMP_CONFIRM.u, COMP_CONFIRM.v, 0.06);
  if (t < s('p11')) {
    const f = smoothPath([
      {t: s('p10'), p: onHero(s('p10'), 46 / PT.w, clientRowV(s('p10')), 0.06), stop: true},
      {t: at('p10', 0.45), p: v3.add(compHit, [1.6, 0.9, 2.2])},
      {t: e('p10') - 0.05, p: compHit, stop: true},
    ]);
    const rf = k(t, s('p10'), e('p10') - 0.05, 0, 1, ease.inOut);
    return {...base, p: f(t), r: lerpR(heroPose(s('p10')).r, COMP.r, rf), scale: avatarScale * (1 - (1 - COMP.s) * rf), glow: 0.35};
  }
  // 7 - rewind: back, and the next step it can't find
  if (t < s('p12') - 0.15) {
    const n0 = stepNode(0);
    const tw = word('p11', 'الخطوة');
    const f = smoothPath([
      {t: s('p11'), p: compHit, stop: true},
      {t: s('p11') + 0.4, p: v3.add(compHit, [1.4, 0.6, 1.8])},
      {t: s('p11') + 0.85, p: n0, stop: true},
      {t: tw, p: n0, stop: true},
      {t: tw + 0.3, p: v3.add(n0, [0.42, 0, 0])},
      {t: tw + 0.62, p: n0, stop: true},
      {t: e('p11') - 0.2, p: v3.add(n0, [0.36, 0, 0])},
      {t: e('p11') + 0.15, p: n0, stop: true},
    ]);
    const rf = k(t, s('p11'), s('p11') + 0.85, 0, 1, ease.inOut);
    return {...base, p: f(t), r: lerpR(COMP.r, [0, 0, 0], rf), scale: k(t, s('p11'), s('p11') + 0.85, avatarScale * COMP.s, 0.36), glow: 0.4};
  }
  // 8 - alone in the dark; pressed on "Click"; it turns over: clarity
  const click = CLICK_AT();
  const toVoid = smoothPath([
    {t: s('p12') - 0.15, p: stepNode(0), stop: true},
    {t: s('p12') + 0.9, p: VOID, stop: true},
  ]);
  if (t < s('p14') + 0.15) {
    const hover: V3 = [noise(t * 0.5, 3) * 0.03, noise(t * 0.45, 7) * 0.04, 0];
    const p = t < s('p12') + 0.9 ? toVoid(t) : v3.add(VOID, hover);
    const press = k(t, click - 0.08, click, 0, 1) * (1 - k(t, click + 0.05, click + 0.35, 0, 1));
    const flip = k(t, click + 0.05, click + 0.75, 0, 1, ease.inOut);
    const sc = k(t, s('p12') - 0.15, s('p12') + 0.9, 0.36, 1.0, ease.inOut);
    const wob = k(t, s('p12') - 0.15, s('p12') + 0.7, 0, 1, ease.inOut) * (1 - k(t, s('p14') - 0.45, s('p14') + 0.15, 0, 1, ease.inOut));
    const spin = (1 - flip) * noise(t * 0.4, 5) * 0.25 * wob;
    return {...base, p, r: [noise(t * 0.3, 9) * 0.08 * wob, spin, 0], scale: sc, press, flip, glow: 0.3 + press * 1.5 + flip * 0.6};
  }
  // 9 - into the new experience: it rides the phone Kalmny built
  const steps = flowSteps();
  const toFlow = steps[0] - 0.85;
  if (t < toFlow) {
    const arrive = s('p14') + 1.2;
    const f = smoothPath([
      {t: s('p14') + 0.15, p: VOID, stop: true},
      {t: arrive, p: onHero(arrive, LANDING_SLOT.u, LANDING_SLOT.v, 0.06), stop: true},
    ]);
    const p = t < arrive ? f(t) : onHero(t, LANDING_SLOT.u, LANDING_SLOT.v, 0.06);
    const rf = k(t, s('p14') + 0.15, arrive, 0, 1, ease.inOut);
    return {...base, p, r: lerpR([0, 0, 0], heroPose(t).r, rf), flip: 1, scale: k(t, s('p14') + 0.15, arrive, 1.0, 0.4, ease.inOut), glow: 0.5};
  }
  // 10 - three clear taps, then confirmed
  if (t < s('p18') - 0.1) {
    const cta = (tt: number, z: number) => onHero(tt, STICKY_CTA.u, STICKY_CTA.v, z);
    const keys: Key[] = [{t: toFlow, p: onHero(toFlow, LANDING_SLOT.u, LANDING_SLOT.v, 0.06), stop: true}];
    steps.forEach((ts, i) => {
      keys.push({t: ts - 0.1, p: cta(ts - 0.1, 0.35)});
      keys.push({t: ts, p: cta(ts, 0.05), stop: true});
      if (i < steps.length - 1) keys.push({t: ts + 0.12, p: cta(ts + 0.12, 0.3)});
    });
    keys.push({t: s('p18') - 0.1, p: cta(s('p18') - 0.1, 0.4), stop: true});
    const f = smoothPath(keys);
    let press = 0;
    steps.forEach((ts) => {
      press = Math.max(press, k(t, ts - 0.05, ts, 0, 1) * (1 - k(t, ts, ts + 0.15, 0, 1)));
    });
    return {...base, p: f(t), r: heroPose(t).r, flip: 1, scale: 0.4, press, glow: 0.5 + press};
  }
  // 11 - "contact us": it presses the call to action, then becomes the mark
  const ctaPress = word('p18', 'معانا') + 0.05;
  const f = smoothPath([
    {t: s('p18') - 0.1, p: onHero(s('p18') - 0.1, STICKY_CTA.u, STICKY_CTA.v, 0.4), stop: true},
    {t: ctaPress - 0.15, p: v3.add(CTA_PILL.p, [1.21, 0, 0.5])},
    {t: ctaPress, p: v3.add(CTA_PILL.p, [1.21, 0, 0.12]), stop: true},
    {t: ctaPress + 0.3, p: v3.add(CTA_PILL.p, [1.21, 0.1, 0.4])},
    {t: s('p19') + 0.5, p: logoDot(), stop: true},
  ]);
  const press = k(t, ctaPress - 0.06, ctaPress, 0, 1) * (1 - k(t, ctaPress, ctaPress + 0.2, 0, 1));
  const rf = k(t, s('p18') - 0.1, ctaPress - 0.1, 0, 1, ease.inOut);
  return {...base, p: f(t), r: lerpR(heroPose(s('p18') - 0.1).r, [0, 0, 0], rf), flip: 1, scale: k(t, s('p18'), s('p18') + 0.4, 0.4, 0.5) * (1 - 0.2 * k(t, s('p19'), s('p19') + 0.5, 0, 1)), press, glow: 0.6 + press};
};

/** Steps of the guided flow (act 9) - shared with the screen. */
export const flowSteps = () => {
  const t17 = s('p17');
  return [t17 - 0.25, t17 + 0.05, t17 + 0.35, t17 + 0.65];
};

// ---------------------------------------------------------------- camera
type Cam = {pos: V3; target: V3; fov: number};

// Framing solver. With the optical centre shifted down (VIEW_SHIFT), a point
// at height dy above the target, at distance d, lands at frame fraction
// 0.595 - dy / Hv(d) (from the top). The headline band ends at 29% of the
// frame; content may start at CONTENT_TOP. `shot` aims the camera so the
// highest element of the shot (topY, at depth z) sits exactly there.
const TAN = Math.tan((34 / 2) * (Math.PI / 180));
export const CONTENT_TOP = 0.33;
const Hv = (d: number) => 2 * d * TAN;
const shot = (x: number, topY: number, zTop: number, d: number, opts: {dx?: number; dy?: number; zt?: number} = {}) => {
  const zt = opts.zt ?? zTop;
  const camZ = zt + d;
  const distTop = camZ - zTop;
  const ty = topY - (0.595 - CONTENT_TOP) * Hv(distTop);
  return {pos: [x + (opts.dx ?? 0), ty + (opts.dy ?? 0.25), camZ] as V3, target: [x, ty, zt] as V3};
};
/** Centre a block [bottomY, topY] in the content zone. */
const centred = (x: number, topY: number, bottomY: number, z: number, d: number, dx = 0) => {
  const mid = (topY + bottomY) / 2;
  const f = (CONTENT_TOP + 0.97) / 2;
  const ty = mid + (f - 0.595) * Hv(d);
  return {pos: [x + dx, ty + 0.2, z + d] as V3, target: [x, ty, z] as V3};
};

const PH = 3.035; // half iPhone height

const camKeys = () => {
  const tap = word('p07', 'Ad');
  const click = CLICK_AT();
  const hp = (tt: number) => heroPose(tt).p;
  const gridTop = GRID.c[1] + 2 * GRID.step + GRID.r;
  const shots: {t: number; c: {pos: V3; target: V3}; stop?: boolean}[] = [
    {t: 0, c: shot(0, gridTop, 0, 17.2)},
    {t: e('p02'), c: shot(0, gridTop, 0, 15.8)},
    {t: s('p03') + 0.9, c: shot(0, PH, 0, 15.6, {dx: 0.3})},
    {t: e('p03'), c: shot(0, PH, 0, 15.2, {dx: 0.6})},
    {t: e('p04') + 0.1, c: shot(0, PH, 0, 27, {dx: -1.4, zt: -2})},
    {t: s('p05') + 0.9, c: shot(0, PH, 0, 15.6, {dx: -0.4})},
    {t: at('p06', 0.35), c: shot(0, PH, 0, 21.5, {zt: -0.5})},
    {t: e('p06') + 0.1, c: shot(0, PH, 0, 21, {dx: 0.4, zt: -0.5})},
    {t: tap - 0.1, c: shot(hp(tap - 0.1)[0] + 0.2, PH + 0.05, 0.3, 14.4, {dx: 0.8})},
    {t: e('p08'), c: shot(hp(e('p08'))[0] + 1.0, PH + 0.1, 0, 15.2, {dx: 0.4})},
    {t: e('p09'), c: shot(0, PH, 0, 15.6)},
    {t: e('p10') + 0.05, c: shot(-1.25, PH, 0, 19.2, {dx: -0.6, zt: -1.5})},
    {t: s('p11') + 0.8, c: shot(0, PH + 0.35, 0, 16.8, {zt: 0.4})},
    {t: e('p11') + 0.2, c: shot(0, PH + 0.35, 0, 16.4, {zt: 0.4})},
    {t: s('p12') + 0.9, c: centred(VOID[0], VOID[1] + 0.4, VOID[1] - 0.4, VOID[2], 6.6)},
    {t: click - 0.05, c: centred(VOID[0], VOID[1] + 0.4, VOID[1] - 0.4, VOID[2], 5.9), stop: true},
    {t: s('p14') + 0.1, c: centred(VOID[0], VOID[1] + 1.2, VOID[1] - 1.2, VOID[2] - 1, 10, 0.4)},
    {t: s('p14') + 1.55, c: shot(0, BUILD.mac.p[1] + 4.25, BUILD.mac.p[2] - 0.6, 25.0, {dx: 0.6, zt: -1})},
    {t: e('p15'), c: shot(0, BUILD.mac.p[1] + 4.25, BUILD.mac.p[2] - 0.6, 24.6, {dx: -0.8, zt: -1})},
    {t: s('p16') + 0.8, c: shot(BUILD.phone.p[0] - 0.4, BUILD.phone.p[1] + 0.4 + PH, BUILD.phone.p[2] + 0.6, 14.6, {dx: -0.6})},
    {t: e('p17') + 0.2, c: shot(BUILD.phone.p[0] - 0.4, BUILD.phone.p[1] + 0.4 + PH, BUILD.phone.p[2] + 0.6, 14.2, {dx: -0.8})},
    {t: s('p18') + 0.6, c: centred(0, CTA_PILL.p[1] + 0.5, CTA_PILL.p[1] - 0.5, CTA_PILL.p[2], 11.5)},
    {t: s('p19') + 0.6, c: centred(0, LOGO.p[1] + 0.55, LOGO.p[1] - 2.05, LOGO.p[2], 11.4)},
    {t: e('p19') + 3.5, c: centred(0, LOGO.p[1] + 0.55, LOGO.p[1] - 2.05, LOGO.p[2], 10.8)},
  ];
  return {
    pos: shots.map((x) => ({t: x.t, p: x.c.pos, stop: x.stop})) as Key[],
    target: shots.map((x) => ({t: x.t, p: x.c.target, stop: x.stop})) as Key[],
    fov: [
      {t: 0, v: 34},
      {t: click - 0.05, v: 34, stop: true},
      {t: click + 0.4, v: 37},
      {t: s('p14') + 1.2, v: 34},
    ],
  };
};

let camCache: {pos: (t: number) => V3; target: (t: number) => V3; fov: (t: number) => number} | null = null;
export const camAt = (t: number): Cam => {
  if (!camCache) {
    const a = camKeys();
    const fp = smoothPath(a.fov.map((x) => ({t: x.t, p: [x.v, 0, 0] as V3, stop: (x as {stop?: boolean}).stop})));
    camCache = {pos: smoothPath(a.pos), target: smoothPath(a.target), fov: (tt) => fp(tt)[0]};
  }
  const pos = camCache.pos(t);
  // a breath of handheld life: tiny, slow, never noticed - only felt
  const breathe: V3 = [noise(t * 0.35, 11) * 0.04, noise(t * 0.3, 17) * 0.03, 0];
  return {pos: v3.add(pos, breathe), target: camCache.target(t), fov: camCache.fov(t)};
};
