// The room the film happens in: true black, two very soft light fields whose
// colour follows the story (cold -> warm pain -> black silence -> the answer's
// teal-blue), a vignette, and 1.5% grain so dark gradients survive Meta's encoder.
import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {kf, ease, noise} from '../lib/anim';
import {s, e} from '../lib/time';

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;

const field = (t: number, stops: number[], cols: string[], alphas: number[]) => {
  const c = cols.map(hex);
  const r = kf(t, stops, c.map((x) => x[0]), ease.inOut);
  const g = kf(t, stops, c.map((x) => x[1]), ease.inOut);
  const b = kf(t, stops, c.map((x) => x[2]), ease.inOut);
  const a = kf(t, stops, alphas, ease.inOut);
  return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a})`;
};

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const stops = [0, s('p03'), s('p07'), s('p09'), s('p11'), e('p11') + 0.3, s('p13'), s('p14'), s('p18'), e('p19') + 3];
  const A = field(t, stops,
    ['#6E7FA8', '#5A6B8C', '#FF9F0A', '#FF453A', '#3A3A3C', '#000000', '#5EEAD4', '#0A84FF', '#5EEAD4', '#7D7AFF'],
    [0.16, 0.14, 0.17, 0.17, 0.08, 0.0, 0.16, 0.2, 0.2, 0.2]);
  const B = field(t, stops,
    ['#2B3550', '#2B3550', '#FF453A', '#7A1E1A', '#1C1C1E', '#000000', '#0A84FF', '#5EEAD4', '#BF5AF2', '#0A84FF'],
    [0.14, 0.12, 0.12, 0.14, 0.06, 0.0, 0.12, 0.16, 0.16, 0.18]);

  const ax = 30 + noise(t * 0.15, 1) * 10;
  const ay = 22 + noise(t * 0.12, 2) * 8;
  const bx = 70 + noise(t * 0.13, 3) * 10;
  const by = 82 + noise(t * 0.11, 4) * 8;

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 42% at ${ax}% ${ay}%, ${A} 0%, rgba(0,0,0,0) 70%),
                       radial-gradient(64% 46% at ${bx}% ${by}%, ${B} 0%, rgba(0,0,0,0) 72%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Film grain on top of everything: the tile jumps every frame. */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const gx = Math.abs(Math.floor(Math.sin(frame * 12.9898) * 43758.5453)) % 512;
  const gy = Math.abs(Math.floor(Math.sin(frame * 78.233) * 12345.678)) % 512;
  return (
    <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          mixBlendMode: 'overlay',
          opacity: 0.09,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: -512 + gx,
            top: -512 + gy,
            width: width + 1024,
            height: height + 1024,
            backgroundImage: `url(${staticFile('grain.png')})`,
            backgroundRepeat: 'repeat',
          }}
        />
      </div>
  );
};
