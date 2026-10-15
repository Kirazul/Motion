// Sound-design cue sheet. Files are synthesized by tools/make_sfx.py into
// public/sfx/. Every cue sits on a VO word or a picture event, so the sound
// re-times with the voice. Gains are linear; with a VO present everything
// drops so the voice always leads (SFX ~10-14 dB under the VO).
import {s, e, word, VO_FILE} from './lib/time';
import {CLICK_AT, flowSteps, ctaPressAt} from './three/story';
import {lossSchedule} from './three/acts';

export type Cue = {t: number; file: string; gain: number};

export const SFX = (): Cue[] => {
  const g = VO_FILE ? 0.62 : 1;
  const tap = word('p07', 'Ad');
  const steps = flowSteps();
  const click = CLICK_AT();
  const {order, lossAt} = lossSchedule();
  const losses = order.map((id) => lossAt.get(id) ?? 0).sort((a, b) => a - b);
  const cues: Cue[] = [
    {t: 0, file: 'bed.wav', gain: VO_FILE ? 0.1 : 0.2},
    {t: s('p01') - 0.04, file: 'tick.wav', gain: 0.5},
    // the first losses are heard one by one, the rest become a texture
    ...losses.slice(0, 4).map((t, i) => ({t, file: 'loss.wav', gain: 0.42 - i * 0.04})),
    {t: losses[4], file: 'flood.wav', gain: 0.22},
    {t: s('p03') - 0.3, file: 'whoosh_low.wav', gain: 0.5},
    {t: s('p03') + 0.4, file: 'typing.wav', gain: 0.35},
    {t: s('p03') + 0.93, file: 'tap1.wav', gain: 0.45},
    {t: s('p03') + 1.6, file: 'pop.wav', gain: 0.35},
    {t: s('p04') - 0.35, file: 'whoosh_long.wav', gain: 0.45},
    {t: s('p04') + 0.1, file: 'ping1.wav', gain: 0.22},
    {t: s('p04') + 0.45, file: 'ping2.wav', gain: 0.2},
    {t: s('p04') + 0.8, file: 'ping3.wav', gain: 0.18},
    {t: s('p05') - 0.1, file: 'whoosh_air.wav', gain: 0.35},
    {t: word('p05', 'واضح') + 0.1, file: 'error.wav', gain: 0.38},
    {t: s('p06') + 0.08, file: 'whoosh_air.wav', gain: 0.3},
    {t: s('p06') + 0.6, file: 'error.wav', gain: 0.26},
    {t: s('p07') - 0.3, file: 'whoosh_air.wav', gain: 0.32},
    {t: tap - 0.01, file: 'tap3.wav', gain: 0.6},
    {t: s('p08') + 0.08, file: 'roll.wav', gain: 0.5},
    {t: s('p08') + 0.35, file: 'pop.wav', gain: 0.3},
    {t: s('p09') + 0.15, file: 'buzz.wav', gain: 0.4},
    {t: s('p09') + 0.3, file: 'flood.wav', gain: 0.42},
    {t: s('p10') + 0.05, file: 'whoosh_air.wav', gain: 0.34},
    {t: e('p10') - 0.05, file: 'pop.wav', gain: 0.42},
    {t: s('p11') - 0.02, file: 'rewind.wav', gain: 0.5},
    {t: word('p11', 'الخطوة') + 0.28, file: 'error.wav', gain: 0.28},
    {t: s('p12') - 0.55, file: 'suck.wav', gain: 0.45},
    {t: click - 0.02, file: 'click.wav', gain: 0.85},
    {t: click + 0.02, file: 'sub_hit.wav', gain: 0.5},
    {t: s('p14') - 0.1, file: 'whoosh_long.wav', gain: 0.45},
    {t: s('p14') + 0.85, file: 'clunk.wav', gain: 0.5},
    {t: s('p14') + 1.15, file: 'clunk.wav', gain: 0.38},
    {t: word('p15', 'Produit') - 0.08, file: 'tap1.wav', gain: 0.35},
    {t: word('p15', 'Service') - 0.08, file: 'tap2.wav', gain: 0.35},
    ...[0, 1, 2].map((i) => ({t: s('p16') + 0.6 + i * 0.47, file: `ping${i + 1}.wav`, gain: 0.22})),
    ...steps.slice(0, 3).map((t, i) => ({t: t - 0.01, file: `tap${i + 1}.wav`, gain: 0.45})),
    {t: steps[3], file: 'confirm.wav', gain: 0.6},
    ...[0, 1, 2].map((i) => ({t: steps[3] + 0.25 + i * 0.16, file: 'pop.wav', gain: 0.24})),
    {t: s('p18') - 0.05, file: 'whoosh_air.wav', gain: 0.3},
    {t: ctaPressAt() - 0.01, file: 'tap3.wav', gain: 0.5},
    {t: s('p19') + 0.2, file: 'logo.wav', gain: 0.62},
  ];
  return cues.map((c) => ({...c, gain: c.file === 'bed.wav' ? c.gain : c.gain * g}));
};
