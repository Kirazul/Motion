// Shared UI pieces: glass surfaces, the hero light point, cursor, ripple,
// SF-Symbols-like glyphs, and device frames (iPhone, browser window).
import React from 'react';
import {C, FONT} from '../lib/theme';

export const Glass: React.FC<{
  w: number;
  h: number;
  r?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  tint?: string;
  glow?: string;
  strong?: boolean;
}> = ({w, h, r = 32, children, style, tint, glow, strong}) => (
  <div
    style={{
      position: 'relative',
      width: w,
      height: h,
      borderRadius: r,
      background: tint ??
        (strong
          ? 'linear-gradient(180deg, rgba(58,58,62,0.92) 0%, rgba(30,30,33,0.94) 100%)'
          : 'linear-gradient(180deg, rgba(44,44,48,0.78) 0%, rgba(22,22,25,0.86) 100%)'),
      boxShadow: [
        'inset 0 1px 0 rgba(255,255,255,0.14)',
        'inset 0 0 0 1px rgba(255,255,255,0.07)',
        '0 30px 80px rgba(0,0,0,0.55)',
        glow ? `0 0 60px ${glow}` : '',
      ]
        .filter(Boolean)
        .join(', '),
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

/** The client: a point of light. Core, bloom, and an optional halo ring. */
export const LightDot: React.FC<{
  x: number;
  y: number;
  r?: number;
  color?: string;
  glow?: number;
  opacity?: number;
  halo?: number;
}> = ({x, y, r = 12, color = '#E9FFFB', glow = 1, opacity = 1, halo = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, opacity}}>
    <div
      style={{
        position: 'absolute',
        left: -r * 7,
        top: -r * 7,
        width: r * 14,
        height: r * 14,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(94,234,212,${0.32 * glow}) 0%, rgba(10,132,255,${0.12 * glow}) 35%, rgba(0,0,0,0) 70%)`,
      }}
    />
    {halo > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: -r * 2.4,
          top: -r * 2.4,
          width: r * 4.8,
          height: r * 4.8,
          borderRadius: '50%',
          border: `2px solid rgba(94,234,212,${0.5 * halo})`,
        }}
      />
    ) : null}
    <div
      style={{
        position: 'absolute',
        left: -r,
        top: -r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle at 40% 35%, #FFFFFF 0%, ${color} 55%, #5EEAD4 100%)`,
        boxShadow: `0 0 ${r * 1.5}px rgba(94,234,212,${0.9 * glow}), 0 0 ${r * 4}px rgba(100,210,255,${0.5 * glow})`,
      }}
    />
  </div>
);

/** Expanding rings from a tap / click. p in 0..1. */
export const Ripple: React.FC<{x: number; y: number; p: number; size?: number; color?: string}> = ({
  x,
  y,
  p,
  size = 220,
  color = '94,234,212',
}) => {
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      {[0, 0.18, 0.36].map((d, i) => {
        const q = Math.max(0, Math.min(1, (p - d) / (1 - d)));
        if (q <= 0) return null;
        const sz = size * (0.15 + 0.85 * (1 - Math.pow(1 - q, 3)));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: -sz / 2,
              top: -sz / 2,
              width: sz,
              height: sz,
              borderRadius: '50%',
              border: `${3 - i}px solid rgba(${color},${(1 - q) * 0.8})`,
              boxShadow: `0 0 30px rgba(${color},${(1 - q) * 0.5})`,
            }}
          />
        );
      })}
    </div>
  );
};

/** macOS arrow pointer. (x, y) is the tip. */
export const Cursor: React.FC<{x: number; y: number; scale?: number; opacity?: number; press?: number}> = ({
  x,
  y,
  scale = 1.7,
  opacity = 1,
  press = 0,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      opacity,
      transformOrigin: '0 0',
      transform: `scale(${scale * (1 - press * 0.12)})`,
      filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.55))',
    }}
  >
    <svg width="28" height="40" viewBox="0 0 28 40" style={{position: 'absolute', left: -3, top: -2}}>
      <path
        d="M3 2 L3 30 L10 23.5 L14.6 35 L19.2 33.1 L14.6 21.8 L24 21.8 Z"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

type IconName =
  | 'person' | 'store' | 'check' | 'x' | 'search' | 'bubble' | 'envelope' | 'calendar'
  | 'bag' | 'heart' | 'fork' | 'cross' | 'phone' | 'chevron' | 'sparkle' | 'lock' | 'bell';

export const Icon: React.FC<{name: IconName; size?: number; color?: string; stroke?: number; draw?: number}> = ({
  name,
  size = 32,
  color = C.text,
  stroke = 2.2,
  draw = 1,
}) => {
  const sw = stroke;
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const p = (d: string, len = 100) => (
    <path d={d} {...common} pathLength={len} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
  );
  const body: Record<IconName, React.ReactNode> = {
    person: (
      <>
        <circle cx="16" cy="11" r="5.2" fill={color} />
        <path d="M6 27c0-5.5 4.5-9 10-9s10 3.5 10 9z" fill={color} />
      </>
    ),
    store: (
      <>
        {p('M5 13 L7 6 H25 L27 13')}
        {p('M5 13 c0 2.4 2 3.6 3.7 3.6 S12.4 15.4 12.4 13 c0 2.4 2 3.6 3.6 3.6 S19.6 15.4 19.6 13 c0 2.4 2 3.6 3.7 3.6 S27 15.4 27 13')}
        {p('M7 16.6 V26 H25 V16.6')}
        {p('M13.5 26 V20.5 H18.5 V26')}
      </>
    ),
    check: p('M7 16.5 L13.2 22.5 L25 9.5'),
    x: (
      <>
        {p('M9 9 L23 23')}
        {p('M23 9 L9 23')}
      </>
    ),
    search: (
      <>
        <circle cx="14" cy="14" r="7.5" {...common} />
        {p('M19.6 19.6 L26 26')}
      </>
    ),
    bubble: p('M16 6 C9 6 4.5 10.3 4.5 15.4 c0 2.9 1.4 5.4 3.7 7.1 L7.4 27 l5-2.6 c1.1.3 2.3.4 3.6.4 c7 0 11.5-4.3 11.5-9.4 S23 6 16 6 Z'),
    envelope: (
      <>
        <rect x="4.5" y="8" width="23" height="16.5" rx="3.2" {...common} />
        {p('M5.5 9.5 L16 17.5 L26.5 9.5')}
      </>
    ),
    calendar: (
      <>
        <rect x="5" y="7.5" width="22" height="19" rx="3.5" {...common} />
        {p('M5 13 H27')}
        {p('M11 5 V9.5')}
        {p('M21 5 V9.5')}
      </>
    ),
    bag: (
      <>
        {p('M7 11 H25 L23.5 27 H8.5 Z')}
        {p('M11.5 11 V9.5 a4.5 4.5 0 0 1 9 0 V11')}
      </>
    ),
    heart: p('M16 26 C6 19.5 4.5 14.8 4.5 12 a5.6 5.6 0 0 1 11.5-2.4 a5.6 5.6 0 0 1 11.5 2.4 c0 2.8-1.5 7.5-11.5 14 Z'),
    fork: (
      <>
        {p('M10 5 V12 a3 3 0 0 0 6 0 V5')}
        {p('M13 12.5 V27')}
        {p('M22 27 V5 c-2.6 1.3-4 4.4-4 8.2 V16 h4')}
      </>
    ),
    cross: (
      <>
        {p('M16 7 V25')}
        {p('M7 16 H25')}
      </>
    ),
    phone: p('M10.5 5.5 L13.5 5.5 L15.5 11 L12.8 12.8 a14 14 0 0 0 6.4 6.4 L21 16.5 L26.5 18.5 V21.5 a3 3 0 0 1 -3.2 3 C13.4 23.9 8.1 18.6 7.5 8.7 a3 3 0 0 1 3-3.2 Z'),
    chevron: p('M12 7 L21 16 L12 25'),
    sparkle: p('M16 4 C16.8 11 21 15.2 28 16 C21 16.8 16.8 21 16 28 C15.2 21 11 16.8 4 16 C11 15.2 15.2 11 16 4 Z'),
    lock: (
      <>
        <rect x="7" y="14" width="18" height="13" rx="3" {...common} />
        {p('M11 14 V10.5 a5 5 0 0 1 10 0 V14')}
      </>
    ),
    bell: (
      <>
        {p('M8 22 H24 L22.5 19.5 V14 a6.5 6.5 0 0 0 -13 0 V19.5 Z')}
        {p('M13.5 25 a2.6 2.6 0 0 0 5 0')}
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{display: 'block', overflow: 'visible'}}>
      {body[name]}
    </svg>
  );
};

/** iPhone-class frame. Children render inside the screen (w-20 x h-20). */
export const Phone: React.FC<{
  w?: number;
  h?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  screenStyle?: React.CSSProperties;
  time?: string;
}> = ({w = 440, h = 900, children, style, screenStyle, time = '9:41'}) => {
  const bez = 11;
  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        borderRadius: w * 0.165,
        background: 'linear-gradient(140deg, #5A5A60 0%, #2A2A2E 18%, #1A1A1D 50%, #3A3A3F 82%, #6A6A70 100%)',
        boxShadow:
          '0 60px 140px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1.5px rgba(255,255,255,0.18)',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: bez,
          top: bez,
          right: bez,
          bottom: bez,
          borderRadius: w * 0.14,
          background: '#000',
          overflow: 'hidden',
          ...screenStyle,
        }}
      >
        {children}
        {/* status bar */}
        <div
          style={{
            position: 'absolute',
            top: 22,
            left: 40,
            right: 34,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: FONT.ui,
            fontSize: 19,
            fontWeight: 600,
            color: C.text,
            zIndex: 20,
          }}
        >
          <span>{time}</span>
          <span style={{display: 'flex', gap: 6, alignItems: 'center'}}>
            <span style={{display: 'flex', gap: 2, alignItems: 'flex-end'}}>
              {[6, 9, 12, 15].map((hh) => (
                <span key={hh} style={{width: 4, height: hh, borderRadius: 1, background: C.text}} />
              ))}
            </span>
            <span
              style={{
                width: 30,
                height: 14,
                borderRadius: 4,
                border: '1.5px solid rgba(255,255,255,0.5)',
                padding: 1.5,
                display: 'inline-block',
              }}
            >
              <span style={{display: 'block', width: '78%', height: '100%', borderRadius: 2, background: C.text}} />
            </span>
          </span>
        </div>
        {/* dynamic island */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            width: w * 0.28,
            height: 34,
            marginLeft: -(w * 0.28) / 2,
            borderRadius: 20,
            background: '#000',
            zIndex: 30,
          }}
        />
        {/* glass reflection */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(125deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 30%)',
            pointerEvents: 'none',
            zIndex: 40,
          }}
        />
      </div>
    </div>
  );
};

/** Safari-like window. */
export const Browser: React.FC<{
  w: number;
  h: number;
  url?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({w, h, url = 'kalmny.tn', children, style}) => (
  <div
    style={{
      position: 'relative',
      width: w,
      height: h,
      borderRadius: 22,
      background: '#0D0D0F',
      boxShadow: '0 50px 120px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.12)',
      overflow: 'hidden',
      ...style,
    }}
  >
    <div
      style={{
        height: 46,
        background: 'linear-gradient(180deg, #2A2A2E, #1E1E21)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px',
        gap: 9,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <span key={c} style={{width: 13, height: 13, borderRadius: '50%', background: c}} />
      ))}
      <div
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          width: w * 0.46,
          height: 28,
          borderRadius: 9,
          background: 'rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontFamily: FONT.ui,
          fontSize: 15,
          color: C.text2,
          fontWeight: 500,
        }}
      >
        <Icon name="lock" size={13} color={C.text2} stroke={2.6} />
        {url}
      </div>
      <span style={{width: 13 * 3 + 18}} />
    </div>
    <div style={{position: 'absolute', top: 46, left: 0, right: 0, bottom: 0}}>{children}</div>
  </div>
);

/** A rounded placeholder bar ("skeleton" line). */
export const Bar: React.FC<{w: number | string; h?: number; c?: string; r?: number; style?: React.CSSProperties}> = ({
  w,
  h = 12,
  c = 'rgba(255,255,255,0.12)',
  r = 99,
  style,
}) => <div style={{width: w, height: h, borderRadius: r, background: c, ...style}} />;
