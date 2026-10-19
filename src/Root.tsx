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
    {/* 4K masters (2160 wide, 60 fps): the archival source every delivery is
        derived from. Framing, timing and layout are fraction-based, so they
        are pixel-identical to the 1080 cuts at 2x - see docs/QUALITY.md. */}
    <Composition id="Ad-9x16-4K" component={Film} durationInFrames={frames} fps={FPS} width={2160} height={3840} defaultProps={{showHeadlines: true, quality: 'master' as const}} />
    <Composition id="Ad-4x5-4K" component={Film} durationInFrames={frames} fps={FPS} width={2160} height={2700} defaultProps={{showHeadlines: true, quality: 'master' as const}} />
    {/* 1080 delivery cuts (Meta/TikTok upload size). On a real render the 3D
        world still draws at 2160 wide internally (dpr 2 supersampling), so
        these are downsamples, not native-1080 renders. Prefer deriving them
        from the 4K master (tools/render_final.sh DELIVERY_HEIGHT) when a 4K
        render already exists. */}
    {/* Meta Reels / Stories */}
    <Composition id="Ad-9x16" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1920} defaultProps={{showHeadlines: true}} />
    {/* Meta / Instagram feed */}
    <Composition id="Ad-4x5" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1350} defaultProps={{showHeadlines: true}} />
    {/* layout audit layers (tools/audit_layout.py). Layout is authored in
        frame fractions, so auditing the 1080 compositions proves the 4K
        masters collision-free as well. */}
    <Composition id="Audit-3D" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1920} defaultProps={{showHeadlines: true, mode: 'audit3d' as const}} />
    <Composition id="Audit-Text" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1920} defaultProps={{showHeadlines: true, mode: 'audittext' as const}} />
    <Composition id="Audit-3D-4x5" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1350} defaultProps={{showHeadlines: true, mode: 'audit3d' as const}} />
    <Composition id="Audit-Text-4x5" component={Film} durationInFrames={frames} fps={FPS} width={1080} height={1350} defaultProps={{showHeadlines: true, mode: 'audittext' as const}} />
  </>
);
