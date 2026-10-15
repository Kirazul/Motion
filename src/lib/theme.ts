// Design tokens: a near-black Apple keynote stage. Grey ramp follows Apple's
// dark system greys; colour is rationed - red/amber only for pain, the
// teal-to-blue light only for the answer (the clear path and the brand).
export const C = {
  bg: '#000000',
  bgLift: '#0A0A0C',
  text: '#F5F5F7',
  text2: '#A1A1A6',
  text3: '#6E6E73',
  hair: 'rgba(255,255,255,0.10)',
  hair2: 'rgba(255,255,255,0.16)',
  surface: '#111113',
  surface2: '#1C1C1E',
  surface3: '#2C2C2E',
  red: '#FF453A',
  amber: '#FF9F0A',
  green: '#30D158',
  teal: '#5EEAD4',
  cyan: '#64D2FF',
  blue: '#0A84FF',
  violet: '#BF5AF2',
};

export const GRAD = {
  answer: 'linear-gradient(100deg, #5EEAD4 0%, #64D2FF 45%, #0A84FF 100%)',
  pain: 'linear-gradient(100deg, #FF9F0A 0%, #FF453A 100%)',
  brand: 'linear-gradient(100deg, #5EEAD4 0%, #64D2FF 40%, #7D7AFF 75%, #BF5AF2 100%)',
};

export const FONT = {
  // Inter (opsz) gives SF-like Display cuts at large sizes; Plex Arabic carries the Derja.
  ui: '"InterX", "PlexArabic", system-ui, sans-serif',
  ar: '"PlexArabic", "InterX", system-ui, sans-serif',
};

// Stage: all layout is authored on a 1080x1350 board. In 9:16 it sits inside
// Meta's safe band; in 4:5 it fills the frame.
export const STAGE = {w: 1080, h: 1350};
