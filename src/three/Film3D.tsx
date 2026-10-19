// The 3D film: one canvas, one camera flight. Light comes from a real studio
// HDRI (Poly Haven, CC0) plus soft boxes for crisp product highlights.
// Depth of field follows the client wherever it is.
//
// Master pipeline (docs/QUALITY.md): the composer works in HalfFloat HDR, so
// bloom only ever grows out of real highlights and ACES gets an unclipped
// image to roll off; MSAA resolves geometry, SMAA finishes what specular
// edges and the effect pass leave behind; bokeh resolution scales with the
// buffer. On final renders the buffer is always 2160 px wide (lib/quality.ts):
// 4K compositions natively, 1080 compositions by supersampling at dpr 2.
import React from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Environment, Lightformer} from '@react-three/drei';
import {EffectComposer, Bloom, DepthOfField, Vignette, Noise, SMAA} from '@react-three/postprocessing';
import {BlendFunction} from 'postprocessing';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {camAt, clientAt} from './story';
import {
  ActContacts, ClientToken, HeroPhone, ActSearching, ActDeadEnds, ActBudget, ActFlood, ActCompetitor, ActStepper, ActClick, ActBuild,
  ActNotifications, ActFinale,
} from './acts';
import {autoTier, dprFor, QualityTier} from '../lib/quality';
import {clamp} from '../lib/anim';

/** The top of the frame belongs to the headlines: shift the optical centre down. */
export const VIEW_SHIFT = 0.095;

const Rig: React.FC<{t: number}> = ({t}) => {
  const {camera, size} = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const c = camAt(t);
  cam.position.set(...c.pos);
  cam.lookAt(...c.target);
  cam.fov = c.fov;
  cam.near = 0.1;
  cam.far = 200;
  cam.setViewOffset(size.width, size.height, 0, -size.height * VIEW_SHIFT, size.width, size.height);
  cam.updateProjectionMatrix();
  return null;
};

const Studio: React.FC = () => (
  // resolution: the environment is baked once (frames 1) at 1024 px per cube
  // face - 16x the pixels of the 256 default, which is what turns the
  // titanium band's reflections from a smudge into studio soft-boxes.
  <Environment files={staticFile('hdri/studio_small_03_1k.hdr')} environmentIntensity={0.55} environmentRotation={[0, 0.6, 0]} resolution={1024} frames={1}>
    <Lightformer form="rect" intensity={1.1} position={[5, 4, 6]} rotation={[0, -0.7, 0]} scale={[3, 9, 1]} />
    <Lightformer form="rect" intensity={0.6} position={[-6, 1, 3]} rotation={[0, 1.1, 0]} scale={[2, 9, 1]} color="#CFEFFF" />
    {/* the long overhead strip that draws the bright edge along a product's
        top rail, and a whisper of floor bounce to separate device from dark */}
    <Lightformer form="rect" intensity={0.85} position={[0, 6, 2.5]} rotation={[Math.PI / 2.4, 0, 0]} scale={[11, 1.1, 1]} />
    <Lightformer form="rect" intensity={0.22} position={[0, -5.5, 4]} rotation={[-Math.PI / 2.6, 0, 0]} scale={[9, 1, 1]} color="#BFD9FF" />
  </Environment>
);

const Scene: React.FC<{t: number; audit: boolean; tier: QualityTier; bufferHeight: number}> = ({t, audit, tier, bufferHeight}) => {
  // a fresh array every frame: R3F only re-applies a prop whose value changed,
  // so a mutated Vector3 would freeze the focus at the first rendered frame
  const focus = clientAt(t).p;
  const master = tier === 'master';
  // Bokeh buffer: half the drawing height on masters (up from a fixed 480),
  // capped where more pixels stop buying smoother discs.
  const dofHeight = master ? Math.round(clamp(bufferHeight * 0.5, 720, 1280)) : 480;
  // At 2160 wide, 4x MSAA + SMAA is indistinguishable from 8x; below that
  // (a forced preview buffer rendered as master) take the full 8 samples.
  const multisampling = master ? (bufferHeight >= 2400 ? 4 : 8) : 4;
  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 18, 44]} />
      <Studio />
      <Rig t={t} />
      <ActContacts t={t} />
      <HeroPhone t={t} />
      <ActSearching t={t} />
      <ActDeadEnds t={t} />
      <ActBudget t={t} />
      <ActFlood t={t} />
      <ActCompetitor t={t} />
      <ActStepper t={t} />
      <ActClick t={t} />
      <ActBuild t={t} />
      <ActNotifications t={t} />
      <ActFinale t={t} />
      <ClientToken t={t} />
      {audit ? null : (
        <EffectComposer multisampling={multisampling} frameBufferType={THREE.HalfFloatType} enableNormalPass={false}>
          <DepthOfField target={[focus[0], focus[1], focus[2]]} focalLength={0.03} bokehScale={3.2} height={dofHeight} />
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={1.0} luminanceSmoothing={0.15} radius={0.75} />
          <Vignette darkness={0.5} offset={0.3} />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.28} />
          <SMAA />
        </EffectComposer>
      )}
    </>
  );
};

export const Film3D: React.FC<{audit?: boolean; quality?: QualityTier}> = ({audit = false, quality}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  // The layout audit needs flat, fast frames - never master post.
  const tier: QualityTier = audit ? 'preview' : (quality ?? autoTier());
  const dpr = audit ? 1 : dprFor(width, tier);
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{fov: 34, position: [0, 0, 20]}}
      gl={{antialias: audit, alpha: false, stencil: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0}}
      dpr={dpr}
    >
      <Scene t={t} audit={audit} tier={tier} bufferHeight={height * dpr} />
    </ThreeCanvas>
  );
};
