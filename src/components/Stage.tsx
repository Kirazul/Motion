// The board every scene is authored on (1080x1350), placed in the frame:
// 9:16 -> centred in Meta's safe band; 4:5 -> fills the frame.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {STAGE} from '../lib/theme';

export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {width, height} = useVideoConfig();
  const scale = width / STAGE.w;
  const top = height > STAGE.h * scale ? Math.round((height - STAGE.h * scale) / 2) - 40 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top,
          width: STAGE.w,
          height: STAGE.h,
          transformOrigin: '0 0',
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Camera: scale/translate around a focus point on the stage. */
export const Camera: React.FC<{
  scale?: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  rot?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({scale = 1, x = 0, y = 0, fx = STAGE.w / 2, fy = STAGE.h / 2, rot = 0, children, style}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      transformOrigin: `${fx}px ${fy}px`,
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rot}deg)`,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Absolutely positioned box centred on (x, y). */
export const At: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, w, h, children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      transform: 'translate(-50%, -50%)',
      ...style,
    }}
  >
    {children}
  </div>
);
