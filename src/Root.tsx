import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {DURATION} from './lib/time';
import {FPS} from './lib/anim';
import {fontsReady} from './lib/fonts';

fontsReady.catch(() => undefined);

const frames = Math.ceil(DURATION * FPS);

export const Root: React.FC = () => (
  <>
    {/* Meta Reels / Stories */}
    <Composition id="Ad-9x16" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1920} defaultProps={{showHeadlines: true}} />
    {/* Meta / Instagram feed */}
    <Composition id="Ad-4x5" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1350} defaultProps={{showHeadlines: true}} />
    {/* layout audit layers (tools/audit_layout.py) */}
    <Composition id="Audit-3D" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1920} defaultProps={{showHeadlines: true, mode: 'audit3d' as const}} />
    <Composition id="Audit-Text" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1920} defaultProps={{showHeadlines: true, mode: 'audittext' as const}} />
    <Composition id="Audit-3D-4x5" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1350} defaultProps={{showHeadlines: true, mode: 'audit3d' as const}} />
    <Composition id="Audit-Text-4x5" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1350} defaultProps={{showHeadlines: true, mode: 'audittext' as const}} />
  </>
);
