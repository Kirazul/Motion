// Timing: every cue in the film is a phrase of the VO (src/timeline.json,
// written by tools/vo_timeline.py). Scenes ask for times here and never hold
// raw seconds, so re-timing the VO re-times the whole picture.
import timeline from '../timeline.json';

export type PhraseId =
  | 'p01' | 'p02' | 'p03' | 'p04' | 'p05' | 'p06' | 'p07' | 'p08' | 'p09' | 'p10'
  | 'p11' | 'p12' | 'p13' | 'p14' | 'p15' | 'p16' | 'p17' | 'p18' | 'p19';

type Phrase = {id: string; text: string; start: number; end: number};

const phrases = timeline.phrases as Phrase[];
const byId = new Map(phrases.map((p) => [p.id, p]));

export const DURATION = timeline.duration;
export const VO_FILE = (timeline as {vo: string | null}).vo;

const get = (id: PhraseId) => {
  const p = byId.get(id);
  if (!p) throw new Error(`unknown phrase ${id}`);
  return p;
};

/** Phrase start (s). */
export const s = (id: PhraseId) => get(id).start;
/** Phrase end (s). */
export const e = (id: PhraseId) => get(id).end;
/** A point inside a phrase: 0 = start, 1 = end. */
export const at = (id: PhraseId, f: number) => {
  const p = get(id);
  return p.start + (p.end - p.start) * f;
};

const wordWeights = (text: string) =>
  text.split(/\s+/).filter(Boolean).map((w) => w.replace(/[،,.؟?!/]/g, '').length + 1.5);

/** Estimated start time of word `i` of a phrase (proportional to word length). */
export const w = (id: PhraseId, i: number) => {
  const p = get(id);
  const ws = wordWeights(p.text);
  const total = ws.reduce((a, b) => a + b, 0);
  const before = ws.slice(0, Math.max(0, Math.min(i, ws.length))).reduce((a, b) => a + b, 0);
  return p.start + ((p.end - p.start) * before) / total;
};

/** Start time of the first word containing `needle`. */
export const word = (id: PhraseId, needle: string) => {
  const words = get(id).text.split(/\s+/).filter(Boolean);
  const i = words.findIndex((x) => x.includes(needle));
  return w(id, i < 0 ? 0 : i);
};

export const text = (id: PhraseId) => get(id).text;
