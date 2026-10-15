// The whole film: the 3D world (one continuous take) with the headline track
// laid over it on the stage. `mode` exists for the layout audit
// (tools/audit_layout.py): it renders the 3D layer or the type layer alone.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage} from './components/Stage';
import {Headlines} from './scenes/Headlines';
import {Film3D} from './three/Film3D';
import {SoundTrack} from './Sound';

export type FilmProps = {showHeadlines: boolean; mode?: 'full' | 'audit3d' | 'audittext'};

export const Film: React.FC<FilmProps> = ({showHeadlines, mode = 'full'}) => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {mode !== 'audittext' ? <Film3D audit={mode === 'audit3d'} /> : null}
    {mode !== 'audit3d' && showHeadlines ? (
      <Stage>
        <Headlines />
      </Stage>
    ) : null}
    {mode === 'full' ? <SoundTrack /> : null}
  </AbsoluteFill>
);
