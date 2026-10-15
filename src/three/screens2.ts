// More iPhone screens (390 x 844 pt) and the landing pages Kalmny builds,
// in three form factors (phone, iPad landscape, MacBook) and three trades.
import {Ctx, fillRR, strokeRR, rr, text, icon, vgrad, hgrad, measure} from './ui2d';
import {ease, clamp, lerp} from '../lib/anim';

// ------------------------------------------------------------------ search
export const SEARCHES = ['resto Tunis', 'réserver ce soir', 'meilleur resto La Marsa', 'prix menu', 'dispo samedi', 'brunch Tunis', 'resto avec terrasse', 'table pour 4', 'livraison ce soir', 'resto romantique'];

export const search = (c: Ctx, query: string, typed: number, results: number, hot = true) => {
  text(c, 'Recherche', 20, 100, {size: 32, weight: 800, tracking: -0.8});
  // field
  fillRR(c, 16, 124, 358, 46, 14, '#1C1C1E');
  icon(c, 'search', 40, 147, 19, '#8E8E93', 2.6);
  const shown = query.slice(0, Math.round(query.length * clamp(typed)));
  text(c, shown, 60, 148, {size: 17, weight: 500});
  if (typed < 1) {
    const w = measure(c, shown, 17, 500);
    fillRR(c, 62 + w, 136, 2.5, 24, 1, '#0A84FF');
  }
  const r = ease.out(clamp(results));
  if (r <= 0) return;
  c.save();
  c.globalAlpha = r;
  c.translate(0, (1 - r) * 18);
  text(c, 'Meilleur résultat', 20, 204, {size: 13, weight: 700, color: '#8E8E93', tracking: 0.4});
  // top hit: your business
  fillRR(c, 16, 222, 358, 196, 22, '#1C1C1E');
  if (hot) strokeRR(c, 16, 222, 358, 196, 22, 'rgba(94,234,212,0.55)', 2);
  fillRR(c, 32, 238, 64, 64, 16, hgrad(c, 32, 96, ['#5EEAD4', '#0A84FF']));
  icon(c, 'store', 64, 270, 36, '#00141A', 2.4);
  text(c, 'Votre business', 112, 258, {size: 19, weight: 700});
  text(c, 'Restaurant · Tunis · 1,2 km', 112, 283, {size: 14, weight: 500, color: '#A1A1A6'});
  for (let i = 0; i < 5; i++) icon(c, 'star', 120 + i * 17, 306, 14, '#FF9F0A');
  text(c, '4,9 (312)', 208, 306.5, {size: 13, weight: 600, color: '#A1A1A6'});
  const btns = ['Itinéraire', 'Appeler', 'Site web'];
  btns.forEach((b, i) => {
    fillRR(c, 32 + i * 112, 340, 102, 58, 14, '#2C2C2E');
    icon(c, ['pin', 'phone', 'sparkle'][i], 83 + i * 112, 360, 18, '#0A84FF', 2.4);
    text(c, b, 83 + i * 112, 384, {size: 12.5, weight: 600, color: '#0A84FF', align: 'center'});
  });
  // other results
  [['Le Golfe', 'Restaurant · 2,4 km'], ['Dar El Jeld', 'Restaurant · 3,1 km'], ['Café Saf Saf', 'Café · 4,0 km']].forEach(([n, d], i) => {
    const y = 446 + i * 78;
    fillRR(c, 20, y, 52, 52, 13, '#2C2C2E');
    icon(c, 'fork', 46, y + 26, 24, '#8E8E93', 2.2);
    text(c, n, 86, y + 18, {size: 16, weight: 600, color: '#C7C7CC'});
    text(c, d, 86, y + 40, {size: 13.5, weight: 500, color: '#8E8E93'});
  });
  c.restore();
};

// ------------------------------------------------------------------ profile (no clear way in)
export const profile = (c: Ctx, look: number) => {
  text(c, 'votre.business', 195, 92, {size: 17, weight: 700, align: 'center'});
  c.beginPath();
  c.arc(62, 170, 44, 0, Math.PI * 2);
  c.fillStyle = hgrad(c, 18, 106, ['#5EEAD4', '#0A84FF']);
  c.fill();
  icon(c, 'store', 62, 170, 44, '#00141A', 2.2);
  [['218', 'publications'], ['12,4 k', 'abonnés'], ['96', 'suivi(e)s']].forEach(([n, l], i) => {
    text(c, n, 170 + i * 82, 160, {size: 18, weight: 700, align: 'center'});
    text(c, l, 170 + i * 82, 182, {size: 12.5, weight: 500, color: '#A1A1A6', align: 'center'});
  });
  text(c, 'Votre business', 20, 240, {size: 15, weight: 700});
  text(c, 'Cuisine maison · Tunis', 20, 262, {size: 14, weight: 500, color: '#C7C7CC'});
  text(c, 'Réservations ? Écrivez-nous… ou appelez 🙂', 20, 284, {size: 14, weight: 500, color: '#C7C7CC'});
  // the broken "link in bio"
  const pulse = 0.5 + 0.5 * Math.sin(look * Math.PI * 2);
  text(c, 'linktr.ee/votrebusiness', 20, 306, {size: 14, weight: 600, color: '#6AA8FF'});
  c.fillStyle = `rgba(255,69,58,${0.25 + 0.5 * pulse})`;
  c.fillRect(20, 316, measure(c, 'linktr.ee/votrebusiness', 14, 600), 2);
  fillRR(c, 16, 334, 174, 34, 9, '#2C2C2E');
  text(c, 'Suivre', 103, 351, {size: 14, weight: 600, align: 'center'});
  fillRR(c, 198, 334, 176, 34, 9, '#2C2C2E');
  text(c, 'Message', 286, 351, {size: 14, weight: 600, align: 'center'});
  // grid of posts: typographic tiles, as small businesses post
  const tiles = [
    ['#3A1D0B', 'MENU', '#FFB27A'],
    ['#0E2A2A', 'NEW', '#5EEAD4'],
    ['#2A0E1C', '−20%', '#FF7AB6'],
    ['#1C1C1E', 'Ouvert\n7j/7', '#F5F5F7'],
    ['#2B2410', 'Brunch', '#FFD60A'],
    ['#101C2E', 'Soirée', '#64D2FF'],
    ['#1E1410', 'Chef', '#FFB27A'],
    ['#14261A', 'Terrasse', '#30D158'],
    ['#22131F', 'Promo', '#FF7AB6'],
  ];
  tiles.forEach(([bg, label, fg], i) => {
    const x = (i % 3) * 130 + (i % 3);
    const y = 390 + Math.floor(i / 3) * 151;
    c.fillStyle = bg;
    c.fillRect(x, y, 129, 150);
    label.split('\n').forEach((ln, j, arr) => text(c, ln, x + 64.5, y + 75 + (j - (arr.length - 1) / 2) * 24, {size: 20, weight: 800, color: fg, align: 'center', tracking: -0.4}));
  });
};

// ------------------------------------------------------------------ dead ends
export const callFailed = (c: Ctx) => {
  c.fillStyle = vgrad(c, 0, 844, '#1B1B1F', '#0B0B0D');
  c.fillRect(0, 0, 390, 844);
  text(c, 'Votre business', 195, 210, {size: 32, weight: 600, align: 'center', tracking: -0.6});
  text(c, 'Appel sans réponse', 195, 250, {size: 18, weight: 500, color: '#FF6961', align: 'center'});
  text(c, '00:00', 195, 280, {size: 15, weight: 500, color: '#8E8E93', align: 'center'});
  const lbl = ['silence', 'clavier', 'haut-parleur', 'ajouter', 'FaceTime', 'contacts'];
  lbl.forEach((l, i) => {
    const x = 85 + (i % 3) * 110;
    const y = 470 + Math.floor(i / 3) * 120;
    c.beginPath();
    c.arc(x, y, 38, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,255,255,0.12)';
    c.fill();
    text(c, l, x, y + 58, {size: 12.5, weight: 500, color: '#C7C7CC', align: 'center'});
  });
  c.beginPath();
  c.arc(195, 730, 38, 0, Math.PI * 2);
  c.fillStyle = '#FF3B30';
  c.fill();
  c.save();
  c.translate(195, 730);
  c.rotate(Math.PI * 0.75);
  icon(c, 'phone', 0, 0, 34, '#FFFFFF', 2.6);
  c.restore();
};

export const notFound = (c: Ctx) => {
  c.fillStyle = '#0B0B0D';
  c.fillRect(0, 0, 390, 844);
  text(c, '404', 195, 360, {size: 96, weight: 800, align: 'center', color: '#2C2C2E', tracking: -4});
  text(c, 'Page introuvable', 195, 430, {size: 22, weight: 700, align: 'center'});
  text(c, 'Le lien que vous avez suivi', 195, 464, {size: 15, weight: 500, align: 'center', color: '#8E8E93'});
  text(c, 'n’existe plus.', 195, 486, {size: 15, weight: 500, align: 'center', color: '#8E8E93'});
  // Safari bottom bar
  c.fillStyle = 'rgba(28,28,30,0.96)';
  c.fillRect(0, 740, 390, 104);
  fillRR(c, 16, 752, 358, 44, 12, '#2C2C2E');
  icon(c, 'lock', 92, 774, 14, '#8E8E93', 2.6);
  text(c, 'linktr.ee/votrebusiness', 205, 774.5, {size: 15, weight: 500, align: 'center', color: '#C7C7CC'});
};

export const dmSeen = (c: Ctx) => {
  c.fillStyle = 'rgba(28,28,30,0.96)';
  c.fillRect(0, 0, 390, 112);
  icon(c, 'back', 22, 84, 24, '#0A84FF', 2.6);
  text(c, 'votre.business', 195, 84, {size: 16, weight: 600, align: 'center'});
  text(c, 'Lundi 19:02', 195, 330, {size: 12, weight: 600, color: '#8E8E93', align: 'center'});
  fillRR(c, 150, 354, 222, 44, 22, '#0A84FF');
  text(c, 'Bonsoir, vous êtes dispo ?', 261, 376.5, {size: 15, weight: 500, align: 'center'});
  text(c, 'Mardi 12:40', 195, 440, {size: 12, weight: 600, color: '#8E8E93', align: 'center'});
  fillRR(c, 204, 464, 168, 44, 22, '#0A84FF');
  text(c, 'Allô ? Une réponse ?', 288, 486.5, {size: 15, weight: 500, align: 'center'});
  text(c, 'Vu', 366, 528, {size: 12, weight: 600, color: '#8E8E93', align: 'right'});
  fillRR(c, 16, 778, 300, 38, 19, '#1C1C1E');
  text(c, 'Message…', 34, 797, {size: 15, weight: 500, color: '#636366'});
};

/** A landing page with no clear next step: scroll position hunts up and down. */
export const messy = (c: Ctx, scroll: number) => {
  c.save();
  c.translate(0, -scroll);
  text(c, 'Bienvenue chez', 20, 110, {size: 15, weight: 600, color: '#A1A1A6'});
  text(c, 'Votre business', 20, 142, {size: 30, weight: 800, tracking: -0.8});
  const para = (y: number, n: number, w = 350) => {
    for (let i = 0; i < n; i++) fillRR(c, 20, y + i * 20, i === n - 1 ? w * 0.6 : w, 9, 4.5, '#2C2C2E');
  };
  para(176, 6);
  fillRR(c, 20, 310, 350, 170, 16, '#1C1C1E');
  para(504, 5);
  fillRR(c, 20, 616, 168, 120, 14, '#1C1C1E');
  fillRR(c, 202, 616, 168, 120, 14, '#1C1C1E');
  para(760, 7);
  text(c, 'Contactez-nous ?', 20, 920, {size: 16, weight: 600, color: '#8E8E93'});
  para(940, 5);
  c.restore();
};

// ------------------------------------------------------------------ Kalmny-built landing pages
export type Theme = {
  name: string;
  trade: string;
  a: string;
  b: string;
  ink: string;
  head: string[];
  cta: string;
  offers: [string, string][];
  steps: string[];
  icon: string;
};

export const THEMES: Theme[] = [
  {
    name: 'Dar Yasmine',
    trade: 'Restaurant',
    a: '#FF9F0A',
    b: '#C2410C',
    ink: '#1A0B05',
    head: ['Une table,', 'en 3 étapes.'],
    cta: 'Réserver une table',
    offers: [['Menu du jour', 'à partir de 28 DT'], ['Terrasse', 'vue sur la mer'], ['Événements', 'jusqu’à 40 pers.']],
    steps: ['Date', 'Heure', 'Confirmer'],
    icon: 'fork',
  },
  {
    name: 'Clinique Amal',
    trade: 'Clinique',
    a: '#64D2FF',
    b: '#0A84FF',
    ink: '#03111F',
    head: ['Votre rendez-vous,', 'sans attendre.'],
    cta: 'Prendre rendez-vous',
    offers: [['Consultations', '7j/7'], ['Spécialistes', '12 médecins'], ['Résultats', 'en ligne']],
    steps: ['Spécialité', 'Créneau', 'Confirmer'],
    icon: 'cross',
  },
  {
    name: 'Maison Lina',
    trade: 'Boutique',
    a: '#FF7AB6',
    b: '#BF5AF2',
    ink: '#1C0717',
    head: ['Votre style,', 'livré demain.'],
    cta: 'Commander',
    offers: [['Nouvelle collection', 'automne'], ['Livraison', 'partout en Tunisie'], ['Retours', 'gratuits']],
    steps: ['Article', 'Taille', 'Payer'],
    icon: 'bag',
  },
];

/** Blend between two themes by f (0..1) - colour only, layout stays put. */
const mixHex = (x: string, y: string, f: number) => {
  const a = parseInt(x.slice(1), 16);
  const b = parseInt(y.slice(1), 16);
  const ch = (v: number, s: number) => (v >> s) & 255;
  const m = (s: number) => Math.round(lerp(ch(a, s), ch(b, s), f));
  return `rgb(${m(16)},${m(8)},${m(0)})`;
};

export const themeAt = (k: number) => {
  // k in [0, THEMES.length-1], fractional = cross-fade
  const i = Math.max(0, Math.min(THEMES.length - 1, Math.floor(k)));
  const j = Math.min(THEMES.length - 1, i + 1);
  const f = clamp(k - i);
  const A = THEMES[i];
  const B = THEMES[j];
  return {A, B, f, a: mixHex(A.a, B.a, f), b: mixHex(A.b, B.b, f)};
};

const swap = (c: Ctx, f: number, drawA: () => void, drawB: () => void) => {
  if (f <= 0.001) return drawA();
  if (f >= 0.999) return drawB();
  c.save();
  c.globalAlpha = 1 - f;
  drawA();
  c.restore();
  c.save();
  c.globalAlpha = f;
  drawB();
  c.restore();
};

/** Phone landing page. `build` 0..1 assembles the blocks; `focus` 0..1 lights the offers. */
export const landingPhone = (c: Ctx, k: number, build: number, focus: number, ctaPress = 0) => {
  const T = themeAt(k);
  const B = (i: number) => ease.out(clamp(build * 6 - i));
  c.fillStyle = '#060607';
  c.fillRect(0, 0, 390, 844);
  // nav
  c.save();
  c.globalAlpha = B(0);
  fillRR(c, 20, 64, 30, 30, 9, hgrad(c, 20, 50, [T.a, T.b]));
  swap(c, T.f, () => text(c, T.A.name, 60, 79.5, {size: 16, weight: 700}), () => text(c, T.B.name, 60, 79.5, {size: 16, weight: 700}));
  c.restore();
  // hero
  c.save();
  c.globalAlpha = B(1);
  c.translate(0, (1 - B(1)) * 20);
  const hg = c.createLinearGradient(0, 112, 390, 392);
  hg.addColorStop(0, T.b);
  hg.addColorStop(1, T.a);
  fillRR(c, 16, 112, 358, 280, 26, hg);
  const shine = c.createRadialGradient(300, 150, 4, 300, 150, 240);
  shine.addColorStop(0, 'rgba(255,255,255,0.35)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  fillRR(c, 16, 112, 358, 280, 26, shine);
  swap(
    c,
    T.f,
    () => {
      text(c, T.A.trade.toUpperCase(), 38, 150, {size: 12, weight: 700, color: 'rgba(255,255,255,0.8)', tracking: 2});
      T.A.head.forEach((h, i) => text(c, h, 36, 214 + i * 44, {size: 38, weight: 800, tracking: -1.4}));
      icon(c, T.A.icon, 330, 154, 34, 'rgba(255,255,255,0.9)', 2.2);
    },
    () => {
      text(c, T.B.trade.toUpperCase(), 38, 150, {size: 12, weight: 700, color: 'rgba(255,255,255,0.8)', tracking: 2});
      T.B.head.forEach((h, i) => text(c, h, 36, 214 + i * 44, {size: 38, weight: 800, tracking: -1.4}));
      icon(c, T.B.icon, 330, 154, 34, 'rgba(255,255,255,0.9)', 2.2);
    },
  );
  fillRR(c, 36, 318, 230 - ctaPress * 6, 52, 26, ctaPress > 0 ? '#E5E5EA' : '#FFFFFF');
  swap(c, T.f, () => text(c, T.A.cta, 151, 344.5, {size: 16, weight: 700, color: T.A.ink, align: 'center'}), () => text(c, T.B.cta, 151, 344.5, {size: 16, weight: 700, color: T.B.ink, align: 'center'}));
  c.restore();
  // offers
  text(c, 'Ce que nous offrons', 20, 432, {size: 20, weight: 700, alpha: B(2), tracking: -0.4});
  for (let i = 0; i < 3; i++) {
    const y = 456 + i * 84;
    const lit = clamp(focus * 3 - i);
    c.save();
    c.globalAlpha = B(3 + i * 0.4);
    c.translate((1 - B(3 + i * 0.4)) * 24, 0);
    fillRR(c, 16, y, 358, 72, 18, '#141416');
    if (lit > 0) strokeRR(c, 16, y, 358, 72, 18, `rgba(94,234,212,${0.7 * lit})`, 2);
    c.beginPath();
    c.arc(52, y + 36, 18, 0, Math.PI * 2);
    c.fillStyle = lit > 0.5 ? '#5EEAD4' : '#2C2C2E';
    c.fill();
    icon(c, 'check', 52, y + 36, 20, lit > 0.5 ? '#00201C' : '#8E8E93', 3);
    swap(
      c,
      T.f,
      () => {
        text(c, T.A.offers[i][0], 84, y + 27, {size: 16, weight: 700});
        text(c, T.A.offers[i][1], 84, y + 49, {size: 13.5, weight: 500, color: '#A1A1A6'});
      },
      () => {
        text(c, T.B.offers[i][0], 84, y + 27, {size: 16, weight: 700});
        text(c, T.B.offers[i][1], 84, y + 49, {size: 13.5, weight: 500, color: '#A1A1A6'});
      },
    );
    c.restore();
  }
  // sticky CTA
  c.save();
  c.globalAlpha = B(5);
  fillRR(c, 16, 744, 358, 60, 30, hgrad(c, 16, 374, [T.b, T.a]));
  swap(c, T.f, () => text(c, T.A.cta, 195, 774.5, {size: 17, weight: 700, align: 'center'}), () => text(c, T.B.cta, 195, 774.5, {size: 17, weight: 700, align: 'center'}));
  c.restore();
};

/** The guided flow on the phone: three clear steps, then confirmed. p in 0..3 (+ confirm). */
export const flowPhone = (c: Ctx, k: number, p: number, confirm: number) => {
  const T = themeAt(k);
  const th = T.f > 0.5 ? T.B : T.A;
  c.fillStyle = '#060607';
  c.fillRect(0, 0, 390, 844);
  text(c, th.name, 195, 82, {size: 16, weight: 700, align: 'center'});
  // progress
  for (let i = 0; i < 3; i++) {
    const on = clamp(p - i);
    fillRR(c, 24 + i * 118, 112, 106, 6, 3, '#2C2C2E');
    if (on > 0) fillRR(c, 24 + i * 118, 112, 106 * on, 6, 3, hgrad(c, 24, 374, [T.b, T.a]));
    text(c, `${i + 1}. ${th.steps[i]}`, 24 + i * 118, 138, {size: 13, weight: 600, color: on > 0.5 ? '#F5F5F7' : '#8E8E93'});
  }
  const step = Math.min(2, Math.floor(p));
  const local = ease.out(clamp(p - step));
  c.save();
  c.globalAlpha = confirm > 0 ? 1 - clamp(confirm * 2) : 1;
  text(c, ['Choisissez', 'Choisissez', 'Vérifiez'][step], 24, 196, {size: 15, weight: 600, color: '#8E8E93'});
  text(c, [th.steps[0], th.steps[1], 'et confirmez'][step], 24, 230, {size: 30, weight: 800, tracking: -0.8});
  // options grid
  for (let i = 0; i < 6; i++) {
    const x = 24 + (i % 2) * 176;
    const y = 270 + Math.floor(i / 2) * 92;
    const sel = i === (step === 0 ? 1 : step === 1 ? 2 : 0) && local > 0.35;
    fillRR(c, x, y, 166, 80, 18, sel ? 'rgba(94,234,212,0.16)' : '#141416');
    if (sel) strokeRR(c, x, y, 166, 80, 18, '#5EEAD4', 2);
    const lbl = step === 0 ? ['Ven 12', 'Sam 13', 'Dim 14', 'Lun 15', 'Mar 16', 'Mer 17'][i] : step === 1 ? ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30'][i] : ['2 pers.', '4 pers.', '6 pers.', 'Terrasse', 'Intérieur', 'Note'][i];
    text(c, lbl, x + 83, y + 41, {size: 18, weight: 700, align: 'center', color: sel ? '#C9FFF6' : '#F5F5F7'});
  }
  c.restore();
  // primary button
  fillRR(c, 16, 744, 358, 60, 30, hgrad(c, 16, 374, [T.b, T.a]));
  text(c, step < 2 ? 'Continuer' : 'Confirmer', 195, 774.5, {size: 17, weight: 700, align: 'center'});
  // confirmation
  const cf = ease.out(clamp(confirm));
  if (cf > 0) {
    c.save();
    c.globalAlpha = cf;
    c.fillStyle = '#060607';
    c.fillRect(0, 160, 390, 570);
    c.beginPath();
    c.arc(195, 380, 74 * (0.85 + 0.15 * cf), 0, Math.PI * 2);
    c.fillStyle = 'rgba(48,209,88,0.14)';
    c.fill();
    c.lineWidth = 6;
    c.strokeStyle = '#30D158';
    c.stroke();
    icon(c, 'check', 195, 380, 84, '#30D158', 3.2, clamp(confirm * 1.6));
    text(c, 'C’est confirmé.', 195, 500, {size: 28, weight: 800, align: 'center', tracking: -0.8});
    text(c, 'Sam 13 · 20:30 · 4 pers.', 195, 536, {size: 16, weight: 500, align: 'center', color: '#A1A1A6'});
    c.restore();
  }
};

/** iPad (landscape) landing: two columns. W,H are canvas pixels. */
export const landingTablet = (c: Ctx, W: number, H: number, k: number, build: number) => {
  const T = themeAt(k);
  const s = W / 1180;
  c.save();
  c.scale(s, s);
  const h = H / s;
  const B = (i: number) => ease.out(clamp(build * 5 - i));
  c.fillStyle = '#060607';
  c.fillRect(0, 0, 1180, h);
  c.globalAlpha = B(0);
  fillRR(c, 48, 40, 40, 40, 12, hgrad(c, 48, 88, [T.a, T.b]));
  swap(c, T.f, () => text(c, T.A.name, 102, 60, {size: 22, weight: 700}), () => text(c, T.B.name, 102, 60, {size: 22, weight: 700}));
  ['Accueil', 'Offres', 'Avis', 'Contact'].forEach((x, i) => text(c, x, 700 + i * 110, 60, {size: 18, weight: 600, color: '#A1A1A6'}));
  c.globalAlpha = B(1);
  swap(
    c,
    T.f,
    () => T.A.head.forEach((x, i) => text(c, x, 48, 190 + i * 72, {size: 64, weight: 800, tracking: -2.4})),
    () => T.B.head.forEach((x, i) => text(c, x, 48, 190 + i * 72, {size: 64, weight: 800, tracking: -2.4})),
  );
  fillRR(c, 48, 330, 300, 68, 34, hgrad(c, 48, 348, [T.b, T.a]));
  swap(c, T.f, () => text(c, T.A.cta, 198, 365, {size: 21, weight: 700, align: 'center'}), () => text(c, T.B.cta, 198, 365, {size: 21, weight: 700, align: 'center'}));
  c.globalAlpha = B(2);
  const g = c.createLinearGradient(640, 120, 1132, 560);
  g.addColorStop(0, T.b);
  g.addColorStop(1, T.a);
  fillRR(c, 640, 120, 492, 440, 36, g);
  const sh = c.createRadialGradient(1000, 180, 10, 1000, 180, 420);
  sh.addColorStop(0, 'rgba(255,255,255,0.35)');
  sh.addColorStop(1, 'rgba(255,255,255,0)');
  fillRR(c, 640, 120, 492, 440, 36, sh);
  icon(c, T.f > 0.5 ? T.B.icon : T.A.icon, 886, 340, 150, 'rgba(255,255,255,0.92)', 1.8);
  c.globalAlpha = B(3);
  for (let i = 0; i < 3; i++) {
    fillRR(c, 48 + i * 360, 610, 340, 120, 24, '#141416');
    swap(
      c,
      T.f,
      () => {
        text(c, T.A.offers[i][0], 80 + i * 360, 655, {size: 22, weight: 700});
        text(c, T.A.offers[i][1], 80 + i * 360, 690, {size: 17, weight: 500, color: '#A1A1A6'});
      },
      () => {
        text(c, T.B.offers[i][0], 80 + i * 360, 655, {size: 22, weight: 700});
        text(c, T.B.offers[i][1], 80 + i * 360, 690, {size: 17, weight: 500, color: '#A1A1A6'});
      },
    );
  }
  c.restore();
};

/** MacBook landing: wide hero, admin-light dashboard strip (the "web solution"). */
export const landingDesktop = (c: Ctx, W: number, H: number, k: number, build: number) => {
  const T = themeAt(k);
  const s = W / 1512;
  c.save();
  c.scale(s, s);
  const h = H / s;
  const B = (i: number) => ease.out(clamp(build * 5 - i));
  c.fillStyle = '#060607';
  c.fillRect(0, 0, 1512, h);
  // menu bar
  c.fillStyle = 'rgba(30,30,32,0.95)';
  c.fillRect(0, 0, 1512, 34);
  ['Safari', 'Fichier', 'Édition', 'Présentation'].forEach((x, i) => text(c, x, 56 + i * 96, 18, {size: 14, weight: i === 0 ? 700 : 500, color: '#E5E5EA'}));
  // window
  fillRR(c, 40, 56, 1432, h - 96, 18, '#0D0D0F');
  c.fillStyle = '#1C1C1E';
  c.fillRect(40, 56, 1432, 52);
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((cc, i) => {
    c.beginPath();
    c.arc(68 + i * 22, 82, 7, 0, Math.PI * 2);
    c.fillStyle = cc;
    c.fill();
  });
  fillRR(c, 556, 66, 400, 32, 9, '#2C2C2E');
  swap(
    c,
    T.f,
    () => text(c, `${T.A.name.toLowerCase().replace(/ /g, '')}.tn`, 756, 82.5, {size: 14, weight: 500, align: 'center', color: '#C7C7CC'}),
    () => text(c, `${T.B.name.toLowerCase().replace(/ /g, '')}.tn`, 756, 82.5, {size: 14, weight: 500, align: 'center', color: '#C7C7CC'}),
  );
  c.globalAlpha = B(0);
  fillRR(c, 92, 140, 40, 40, 12, hgrad(c, 92, 132, [T.a, T.b]));
  swap(c, T.f, () => text(c, T.A.name, 146, 160, {size: 22, weight: 700}), () => text(c, T.B.name, 146, 160, {size: 22, weight: 700}));
  fillRR(c, 1240, 136, 180, 48, 24, hgrad(c, 1240, 1420, [T.b, T.a]));
  text(c, 'Réserver', 1330, 160.5, {size: 17, weight: 700, align: 'center'});
  c.globalAlpha = B(1);
  swap(
    c,
    T.f,
    () => T.A.head.forEach((x, i) => text(c, x, 92, 300 + i * 92, {size: 84, weight: 800, tracking: -3.4})),
    () => T.B.head.forEach((x, i) => text(c, x, 92, 300 + i * 92, {size: 84, weight: 800, tracking: -3.4})),
  );
  fillRR(c, 92, 450, 320, 72, 36, '#FFFFFF');
  swap(c, T.f, () => text(c, T.A.cta, 252, 486.5, {size: 21, weight: 700, color: T.A.ink, align: 'center'}), () => text(c, T.B.cta, 252, 486.5, {size: 21, weight: 700, color: T.B.ink, align: 'center'}));
  c.globalAlpha = B(2);
  const g = c.createLinearGradient(820, 220, 1420, 620);
  g.addColorStop(0, T.b);
  g.addColorStop(1, T.a);
  fillRR(c, 820, 220, 600, 400, 36, g);
  // booking panel on the hero image: the web solution behind the page
  fillRR(c, 860, 260, 520, 320, 24, 'rgba(10,10,12,0.78)');
  text(c, 'Réservations du jour', 892, 300, {size: 20, weight: 700});
  for (let i = 0; i < 4; i++) {
    fillRR(c, 892, 330 + i * 60, 456, 48, 12, 'rgba(255,255,255,0.06)');
    text(c, ['19:00 · Amira T. · 2 pers.', '20:00 · Mehdi K. · 4 pers.', '20:30 · Sarra B. · 6 pers.', '21:00 · Karim J. · 2 pers.'][i], 912, 354 + i * 60, {size: 16, weight: 600, color: '#E5E5EA'});
    c.beginPath();
    c.arc(1326, 354 + i * 60, 7, 0, Math.PI * 2);
    c.fillStyle = '#30D158';
    c.fill();
  }
  c.globalAlpha = B(3);
  for (let i = 0; i < 3; i++) {
    fillRR(c, 92 + i * 452, 680, 430, 130, 24, '#141416');
    swap(
      c,
      T.f,
      () => {
        text(c, T.A.offers[i][0], 124 + i * 452, 728, {size: 24, weight: 700});
        text(c, T.A.offers[i][1], 124 + i * 452, 764, {size: 18, weight: 500, color: '#A1A1A6'});
      },
      () => {
        text(c, T.B.offers[i][0], 124 + i * 452, 728, {size: 24, weight: 700});
        text(c, T.B.offers[i][1], 124 + i * 452, 764, {size: 18, weight: 500, color: '#A1A1A6'});
      },
    );
  }
  c.restore();
};

export {rr};
