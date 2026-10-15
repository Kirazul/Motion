// Sound: the VO (when tools/vo_timeline.py has aligned one) and the sound
// design, every cue placed on the same VO phrases as the picture.
import React from 'react';
import {Sequence, staticFile, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {VO_FILE} from './lib/time';
import {SFX} from './sfx';

export const SoundTrack: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <>
      {VO_FILE ? <Audio src={staticFile(VO_FILE)} /> : null}
      {SFX().map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.t * fps))} layout="none">
          <Audio src={staticFile(`sfx/${c.file}`)} volume={c.gain} />
        </Sequence>
      ))}
    </>
  );
};
