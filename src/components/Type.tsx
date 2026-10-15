// Kinetic type. Words rise out of a soft focus (blur + 0.3em lift), staggered
// in reading order (RTL for Derja), and leave together by drifting up into
// focus-out. Marked words can carry the answer gradient, the pain colour, a
// strike-through drawn at a cue, or a vertical "roll" between two words.
import React from 'react';
import {C, FONT, GRAD} from '../lib/theme';
import {k, ease, clamp} from '../lib/anim';

export type Mark = {
  color?: string;
  grad?: string;
  strikeAt?: number;
  strikeColor?: string;
  roll?: {words: string[]; at: number[]};
  latin?: boolean;
  weight?: number;
};

export type LineSpec = {
  text: string;
  size: number;
  weight?: number;
  color?: string;
  marks?: Record<string, Mark>;
  /** extra delay (s) before this line starts */
  delay?: number;
  tracking?: number;
};

const isLatin = (s: string) => /^[A-Za-z0-9 /'’.,?!:+\-€$%]+$/.test(s.replace(/[؟،]/g, ''));

const Word: React.FC<{
  w: string;
  t: number;
  tIn: number;
  size: number;
  weight: number;
  color: string;
  mark?: Mark;
  tracking?: number;
}> = ({w, t, tIn, size, weight, color, mark, tracking}) => {
  const f = clamp((t - tIn) / 0.62);
  const e = ease.out(f);
  const latin = mark?.latin ?? isLatin(w);
  const fill: React.CSSProperties = mark?.grad
    ? {
        backgroundImage: mark.grad,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }
    : {color: mark?.color ?? color};

  const strike = mark?.strikeAt !== undefined ? k(t, mark.strikeAt, mark.strikeAt + 0.45, 0, 1, ease.out) : 0;

  let content: React.ReactNode = w;
  if (mark?.roll) {
    const {words, at} = mark.roll;
    // index as a continuous value so the slot rolls
    const idx = at.reduce((acc, a) => acc + k(t, a, a + 0.55, 0, 1, ease.out), 0);
    const longest = words.reduce((a, b) => (a.length > b.length ? a : b));
    content = (
      <span style={{position: 'relative', display: 'inline-block'}}>
        <span style={{visibility: 'hidden'}}>{longest}</span>
        {words.map((x, i) => {
          const d = i - idx;
          return (
            <span
              key={x}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                textAlign: 'center',
                transform: `translateY(${d * 0.9}em) scale(${1 - Math.min(Math.abs(d), 1) * 0.12})`,
                opacity: 1 - Math.min(Math.abs(d), 1),
                filter: `blur(${Math.min(Math.abs(d), 1) * 10}px)`,
              }}
            >
              {x}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        opacity: e,
        filter: `blur(${(1 - e) * 16}px)`,
        transform: `translateY(${(1 - e) * 0.32}em) scale(${0.97 + 0.03 * e})`,
        fontFamily: latin ? FONT.ui : FONT.ar,
        fontWeight: mark?.weight ?? weight,
        letterSpacing: latin ? `${tracking ?? -0.03}em` : 0,
        fontSize: latin ? size * 0.94 : size,
        padding: '0 0.04em',
        ...fill,
      }}
    >
      {content}
      {strike > 0 ? (
        <span
          style={{
            position: 'absolute',
            left: '-4%',
            right: '-4%',
            top: '54%',
            height: Math.max(4, size * 0.07),
            borderRadius: 99,
            background: mark?.strikeColor ?? C.red,
            transformOrigin: 'right center',
            transform: `scaleX(${strike})`,
            boxShadow: `0 0 24px ${mark?.strikeColor ?? C.red}`,
          }}
        />
      ) : null}
    </span>
  );
};

/**
 * A headline block: lines appear word by word from tIn, all leave at tOut.
 * `spread` is how long (s) the reveal of one line takes from first to last word.
 */
export const Headline: React.FC<{
  t: number;
  tIn: number;
  tOut: number;
  lines: LineSpec[];
  y: number;
  spread?: number;
  align?: 'center';
  width?: number;
  gap?: number;
}> = ({t, tIn, tOut, lines, y, spread = 0.42, width = 960, gap = 10}) => {
  if (t < tIn - 0.05 || t > tOut + 0.05) return null;
  const out = k(t, tOut - 0.42, tOut, 0, 1, ease.in);
  let lineDelay = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: (1080 - width) / 2,
        width,
        top: y,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap,
        opacity: 1 - out,
        filter: `blur(${out * 12}px)`,
        transform: `translateY(calc(-50% + ${-out * 26}px))`,
      }}
    >
      {lines.map((ln, li) => {
        const words = ln.text.split(/\s+/).filter(Boolean);
        lineDelay += ln.delay ?? (li === 0 ? 0 : 0.12);
        const base = tIn + lineDelay;
        const step = words.length > 1 ? spread / (words.length - 1) : 0;
        const node = (
          <div
            key={li}
            style={{
              direction: 'rtl',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'baseline',
              columnGap: ln.size * 0.24,
              rowGap: 0,
              lineHeight: 1.18,
              fontSize: ln.size,
              color: ln.color ?? C.text,
              textAlign: 'center',
            }}
          >
            {words.map((wd, wi) => (
              <Word
                key={wi}
                w={wd}
                t={t}
                tIn={base + wi * step}
                size={ln.size}
                weight={ln.weight ?? 700}
                color={ln.color ?? C.text}
                mark={ln.marks?.[wd]}
                tracking={ln.tracking}
              />
            ))}
          </div>
        );
        lineDelay += spread * 0.6;
        return node;
      })}
    </div>
  );
};

/** Small Latin label (eyebrow / UI caption). */
export const Label: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
  ar?: boolean;
}> = ({children, size = 24, color = C.text2, weight = 600, style, ar}) => (
  <div
    style={{
      fontFamily: ar ? FONT.ar : FONT.ui,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing: ar ? 0 : '-0.01em',
      whiteSpace: 'nowrap',
      direction: ar ? 'rtl' : 'ltr',
      ...style,
    }}
  >
    {children}
  </div>
);

export {GRAD};
