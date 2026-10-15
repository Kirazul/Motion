// The 3D film: one canvas, one camera flight. Light comes from a real studio
// HDRI (Poly Haven, CC0) plus two soft boxes for crisp product highlights.
// Depth of field follows the client wherever it is.
import React from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Environment, Lightformer} from '@react-three/drei';
import {EffectComposer, Bloom, DepthOfField, Vignette, Noise} from '@react-three/postprocessing';
import {BlendFunction} from 'postprocessing';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {camAt, clientAt} from './story';
import {
  ActContacts, ClientToken, HeroPhone, ActSearching, ActDeadEnds, ActBudget, ActFlood, ActCompetitor, ActStepper, ActClick, ActBuild,
  ActNotifications, ActFinale,
} from './acts';

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
  <Environment files={staticFile('hdri/studio_small_03_1k.hdr')} environmentIntensity={0.55} environmentRotation={[0, 0.6, 0]}>
    <Lightformer form="rect" intensity={1.1} position={[5, 4, 6]} rotation={[0, -0.7, 0]} scale={[3, 9, 1]} />
    <Lightformer form="rect" intensity={0.6} position={[-6, 1, 3]} rotation={[0, 1.1, 0]} scale={[2, 9, 1]} color="#CFEFFF" />
  </Environment>
);

const Scene: React.FC<{t: number; audit: boolean}> = ({t, audit}) => {
  // a fresh array every frame: R3F only re-applies a prop whose value changed,
  // so a mutated Vector3 would freeze the focus at the first rendered frame
  const focus = clientAt(t).p;
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
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <DepthOfField target={[focus[0], focus[1], focus[2]]} focalLength={0.03} bokehScale={3.2} height={480} />
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={1.0} luminanceSmoothing={0.15} radius={0.7} />
          <Vignette darkness={0.5} offset={0.3} />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.28} />
        </EffectComposer>
      )}
    </>
  );
};

export const Film3D: React.FC<{audit?: boolean}> = ({audit = false}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{fov: 34, position: [0, 0, 20]}}
      gl={{antialias: audit, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0}}
      dpr={1}
    >
      <Scene t={t} audit={audit} />
    </ThreeCanvas>
  );
};
