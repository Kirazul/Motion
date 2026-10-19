// The whole film: the 3D world (one continuous take) with the headline track
// laid over it on the stage. `mode` exists for the layout audit
// (tools/audit_layout.py): it renders the 3D layer or the type layer alone;
// 'audio' is the sound-only pass of tools/render_final.sh. `quality` forces
// the render tier (lib/quality.ts); when absent it is automatic - preview in
// Studio, master on any real render.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage} from './components/Stage';
import {Headlines} from './scenes/Headlines';
import {Film3D} from './three/Film3D';
import {SoundTrack} from './Sound';
import type {QualityTier} from './lib/quality';

export type FilmProps = {showHeadlines: boolean; mode?: 'full' | 'audit3d' | 'audittext' | 'audio'; quality?: QualityTier};

export const Film: React.FC<FilmProps> = ({showHeadlines, mode = 'full', quality}) =>
  mode === 'audio' ? (
    // sound only: the audio pass of the final render skips every visual
    <SoundTrack />
  ) : (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {mode !== 'audittext' ? <Film3D audit={mode === 'audit3d'} quality={quality} /> : null}
    {mode !== 'audit3d' && showHeadlines ? (
      <Stage>
        <Headlines />
      </Stage>
    ) : null}
    {mode === 'full' ? <SoundTrack /> : null}
  </AbsoluteFill>
  );
