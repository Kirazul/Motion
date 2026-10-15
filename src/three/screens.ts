// iPhone screens for Act 3, drawn in iPhone points (390 x 844) on a canvas
// that is mapped onto the 3D phone's glass. Dark appearance, SF-like metrics.
import {Ctx, fillRR, rr, text, icon, vgrad, hgrad} from './ui2d';
import {k, ease, clamp} from '../lib/anim';

export const SW = 390;
export const SH = 844;

const statusBar = (c: Ctx, alpha = 1) => {
  c.save();
  c.globalAlpha = alpha;
  text(c, '9:41', 52, 31, {size: 17, weight: 600, align: 'center'});
  // signal, wifi-less minimal set, battery
  for (let i = 0; i < 4; i++) fillRR(c, 300 + i * 6, 34 - (5 + i * 3), 4, 5 + i * 3, 1, '#F5F5F7');
  fillRR(c, 332, 24, 27, 13, 4, 'rgba(255,255,255,0.35)');
  fillRR(c, 334, 26, 21, 9, 2.5, '#F5F5F7');
  fillRR(c, 360, 28, 2, 5, 1, 'rgba(255,255,255,0.35)');
  // dynamic island
  fillRR(c, SW / 2 - 62, 11, 124, 36, 18, '#000');
  c.restore();
};

export const screenFrame = (c: Ctx, W: number, H: number, draw: (c: Ctx) => void, brightness = 1) => {
  c.save();
  rr(c, 0, 0, W, H, W * 0.135);
  c.clip();
  c.fillStyle = '#000';
  c.fillRect(0, 0, W, H);
  c.scale(W / SW, H / SH);
  draw(c);
  statusBar(c);
  c.restore();
  if (brightness < 1) {
    c.save();
    rr(c, 0, 0, W, H, W * 0.135);
    c.fillStyle = `rgba(0,0,0,${1 - brightness})`;
    c.fill();
    c.restore();
  }
};

// ------------------------------------------------------------------ feed + ad
export const feed = (c: Ctx, scroll: number, press: number, ripple: number) => {
  text(c, 'Découvrir', 20, 86, {size: 30, weight: 700, tracking: -0.6});
  icon(c, 'heart', 318, 86, 26, '#F5F5F7', 2.2);
  icon(c, 'bubble', 360, 86, 26, '#F5F5F7', 2.2);
  c.save();
  c.translate(0, scroll);
  // post header
  c.beginPath();
  c.arc(38, 152, 18, 0, Math.PI * 2);
  c.fillStyle = hgrad(c, 20, 56, ['#5EEAD4', '#0A84FF']);
  c.fill();
  icon(c, 'store', 38, 152, 22, '#00141A', 2.4);
  text(c, 'Votre business', 66, 145, {size: 15, weight: 600});
  text(c, 'Sponsorisé', 66, 163, {size: 12.5, weight: 500, color: '#A1A1A6'});
  text(c, '•••', 368, 150, {size: 16, weight: 700, color: '#A1A1A6', align: 'right'});
  // media: a typographic brand poster (how real small businesses advertise)
  const g = c.createLinearGradient(0, 181, 390, 571);
  g.addColorStop(0, '#1A0B05');
  g.addColorStop(0.6, '#5A1F0A');
  g.addColorStop(1, '#C2410C');
  c.fillStyle = g;
  c.fillRect(0, 181, 390, 390);
  const glow = c.createRadialGradient(300, 230, 10, 300, 230, 260);
  glow.addColorStop(0, 'rgba(255,190,120,0.45)');
  glow.addColorStop(1, 'rgba(255,190,120,0)');
  c.fillStyle = glow;
  c.fillRect(0, 181, 390, 390);
  text(c, 'VOTRE BUSINESS', 22, 214, {size: 12, weight: 700, color: 'rgba(255,230,210,0.75)', tracking: 2.5});
  text(c, 'Ce soir,', 22, 300, {size: 46, weight: 800, tracking: -1.6});
  text(c, 'on vous', 22, 350, {size: 46, weight: 800, tracking: -1.6});
  text(c, 'garde une', 22, 400, {size: 46, weight: 800, tracking: -1.6});
  text(c, 'table.', 22, 450, {size: 46, weight: 800, tracking: -1.6, color: '#FFB27A'});
  fillRR(c, 22, 512, 150, 30, 15, 'rgba(255,255,255,0.14)');
  text(c, '−20% cette semaine', 97, 527.5, {size: 13, weight: 600, align: 'center'});
  // CTA bar (the click)
  c.fillStyle = press > 0 ? `rgba(${28 + 40 * press},${28 + 50 * press},${30 + 50 * press},1)` : '#1C1C1E';
  c.fillRect(0, 571, 390, 48);
  text(c, 'En savoir plus', 18, 595, {size: 16, weight: 600, color: press > 0.3 ? '#5EEAD4' : '#F5F5F7'});
  icon(c, 'chevron', 366, 595, 18, '#A1A1A6', 2.6);
  if (ripple > 0 && ripple < 1) {
    c.beginPath();
    c.arc(195, 595, 20 + 180 * ease.out(ripple), 0, Math.PI * 2);
    c.fillStyle = `rgba(94,234,212,${0.28 * (1 - ripple)})`;
    c.fill();
  }
  // actions
  icon(c, 'heart', 30, 652, 26, '#F5F5F7', 2.2);
  icon(c, 'bubble', 72, 652, 26, '#F5F5F7', 2.2);
  text(c, '2 431 J’aime', 18, 690, {size: 14, weight: 600});
  text(c, 'Votre business  La meilleure table de la ville…', 18, 714, {size: 14, weight: 500, color: '#C7C7CC'});
  // next post peeking
  c.beginPath();
  c.arc(38, 770, 18, 0, Math.PI * 2);
  c.fillStyle = '#2C2C2E';
  c.fill();
  fillRR(c, 66, 762, 120, 10, 5, '#2C2C2E');
  c.restore();
};

// ------------------------------------------------------------------ chat
export const chat = (c: Ctx, t: number, tBubble: number, tSeen: number) => {
  c.fillStyle = 'rgba(28,28,30,0.96)';
  c.fillRect(0, 0, 390, 112);
  icon(c, 'back', 22, 84, 24, '#0A84FF', 2.6);
  c.beginPath();
  c.arc(66, 84, 18, 0, Math.PI * 2);
  c.fillStyle = hgrad(c, 48, 84, ['#5EEAD4', '#0A84FF']);
  c.fill();
  icon(c, 'store', 66, 84, 20, '#00141A', 2.4);
  text(c, 'Votre business', 94, 77, {size: 16, weight: 600});
  text(c, 'Répond généralement en 1 jour', 94, 96, {size: 12, weight: 500, color: '#A1A1A6'});
  c.fillStyle = 'rgba(255,255,255,0.08)';
  c.fillRect(0, 112, 390, 1);
  // Messenger-style context: the client came from the ad
  text(c, 'Vous avez répondu à une publicité', 195, 150, {size: 12.5, weight: 600, color: '#8E8E93', align: 'center'});
  fillRR(c, 95, 168, 200, 236, 18, '#1C1C1E');
  c.save();
  rr(c, 95, 168, 200, 150, 18);
  c.clip();
  const g = c.createLinearGradient(95, 168, 295, 318);
  g.addColorStop(0, '#1A0B05');
  g.addColorStop(0.6, '#5A1F0A');
  g.addColorStop(1, '#C2410C');
  c.fillStyle = g;
  c.fillRect(95, 168, 200, 150);
  text(c, 'Ce soir, on vous', 111, 262, {size: 17, weight: 800, tracking: -0.5});
  text(c, 'garde une table.', 111, 286, {size: 17, weight: 800, tracking: -0.5, color: '#FFB27A'});
  c.restore();
  text(c, 'Votre business', 111, 342, {size: 14, weight: 700});
  text(c, 'Sponsorisé · En savoir plus', 111, 362, {size: 12, weight: 500, color: '#8E8E93'});
  fillRR(c, 111, 376, 168, 18, 9, 'rgba(255,255,255,0.06)');
  text(c, "Aujourd'hui 21:14", 195, 440, {size: 12, weight: 600, color: '#8E8E93', align: 'center'});
  // the client's question
  const a = clamp((t - tBubble) / 0.35);
  if (a > 0) {
    const e2 = ease.out(a);
    c.save();
    c.globalAlpha = e2;
    c.translate(0, (1 - e2) * 16);
    fillRR(c, 124, 486, 248, 44, 22, '#0A84FF');
    text(c, 'Bonjour 👋 c’est combien ?', 248, 508.5, {size: 15.5, weight: 500, align: 'center'});
    c.restore();
  }
  const sa = clamp((t - tSeen) / 0.3);
  if (sa > 0) text(c, 'Vu', 366, 548, {size: 12, weight: 600, color: '#8E8E93', align: 'right', alpha: sa});
  // composer
  fillRR(c, 16, 778, 300, 38, 19, '#1C1C1E');
  text(c, 'Message…', 34, 797, {size: 15, weight: 500, color: '#636366'});
};

// ------------------------------------------------------------------ inbox
const PEOPLE = [
  ['Sarra B.', 'Bonsoir, c’est dispo samedi ?', '21:16'],
  ['Mehdi K.', 'Prix pour 4 personnes ?', '21:16'],
  ['Amira T.', 'Comment je réserve ?', '21:15'],
  ['Yassine', 'Vous livrez à La Marsa ?', '21:15'],
  ['Nour', 'Allô ?? quelqu’un ?', '21:15'],
  ['Karim J.', 'C’est ouvert demain ?', '21:14'],
  ['Ines', 'Le lien ne marche pas', '21:14'],
  ['Hedi', 'Je peux payer sur place ?', '21:14'],
];
const AV = ['#636366', '#7C7C82', '#57575C', '#6E6E73'];

const row = (c: Ctx, y: number, name: string, msg: string, time: string, tint: string, unread: boolean, client = false) => {
  // avatar
  c.beginPath();
  c.arc(46, y + 38, 26, 0, Math.PI * 2);
  if (client) {
    c.fillStyle = '#04201E';
    c.fill();
    c.lineWidth = 2;
    c.strokeStyle = 'rgba(94,234,212,0.75)';
    c.stroke();
  } else {
    c.fillStyle = vgrad(c, y + 12, y + 64, tint, '#3A3A3C');
    c.fill();
    text(c, name.split(' ').map((x) => x[0]).join('').slice(0, 2), 46, y + 39, {size: 17, weight: 600, align: 'center'});
  }
  text(c, name, 84, y + 27, {size: 16.5, weight: 600, color: client ? '#C9FFF6' : '#F5F5F7'});
  text(c, msg, 84, y + 50, {size: 14.5, weight: 500, color: unread ? '#C7C7CC' : '#8E8E93'});
  text(c, time, 370, y + 27, {size: 13, weight: 500, color: '#8E8E93', align: 'right'});
  if (unread) {
    c.beginPath();
    c.arc(366, y + 50, 5.5, 0, Math.PI * 2);
    c.fillStyle = '#0A84FF';
    c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,0.07)';
  c.fillRect(84, y + 76, 306, 1);
};

export const inbox = (c: Ctx, n: number) => {
  text(c, 'Messages', 20, 104, {size: 32, weight: 800, tracking: -0.8});
  const count = Math.min(99, Math.round(3 + n * 15));
  const label = count >= 99 ? '99+' : `${count}`;
  fillRR(c, 184, 90, label.length * 11 + 18, 26, 13, '#FF453A');
  text(c, label, 184 + (label.length * 11 + 18) / 2, 103.5, {size: 15, weight: 700, align: 'center'});
  fillRR(c, 16, 130, 358, 38, 11, '#1C1C1E');
  icon(c, 'search', 36, 149, 17, '#8E8E93', 2.6);
  text(c, 'Rechercher', 52, 149.5, {size: 16, weight: 500, color: '#8E8E93'});
  c.save();
  c.beginPath();
  c.rect(0, 180, 390, 664);
  c.clip();
  // rows that landed on top: each new one slides down from above
  const whole = Math.floor(n);
  const frac = n - whole;
  for (let i = 0; i <= whole; i++) {
    const p = PEOPLE[(whole - i) % PEOPLE.length];
    const y = 185 + (i - 1 + frac) * 76;
    if (i === 0 && frac <= 0) continue;
    row(c, y, p[0], p[1], p[2], AV[(whole - i) % 4], true);
  }
  row(c, 185 + n * 76, 'Client', 'Bonjour 👋 c’est combien ?', '21:14', '#000', true, true);
  // older, read conversations below
  for (let j = 1; j < 6; j++) {
    const p = PEOPLE[(j + 3) % PEOPLE.length];
    row(c, 185 + (n + j) * 76, p[0], p[1], 'Hier', AV[j % 4], false);
  }
  c.restore();
};

// ------------------------------------------------------------------ competitor
export const competitor = (c: Ctx, done: number) => {
  text(c, 'Réservation', 20, 104, {size: 30, weight: 800, tracking: -0.6});
  text(c, 'Choisissez un créneau', 20, 140, {size: 15, weight: 500, color: '#A1A1A6'});
  const days = ['Ven', 'Sam', 'Dim', 'Lun'];
  days.forEach((d, i) => {
    const sel = i === 1;
    fillRR(c, 20 + i * 88, 166, 78, 78, 16, sel ? '#30D158' : '#1C1C1E');
    text(c, d, 59 + i * 88, 193, {size: 14, weight: 600, align: 'center', color: sel ? '#002910' : '#A1A1A6'});
    text(c, `${12 + i}`, 59 + i * 88, 222, {size: 22, weight: 700, align: 'center', color: sel ? '#002910' : '#F5F5F7'});
  });
  ['19:00', '20:30', '21:00'].forEach((h, i) => {
    const sel = i === 1;
    fillRR(c, 20 + i * 118, 270, 106, 46, 23, sel ? 'rgba(48,209,88,0.18)' : '#1C1C1E');
    text(c, h, 73 + i * 118, 293, {size: 16, weight: 600, align: 'center', color: sel ? '#30D158' : '#F5F5F7'});
  });
  // confirmation
  const a = ease.out(clamp(done));
  fillRR(c, 20, 700, 350, 58, 29, a > 0.5 ? '#30D158' : '#2C2C2E');
  text(c, a > 0.5 ? 'Réservé' : 'Confirmer', 195, 729, {size: 18, weight: 700, align: 'center', color: a > 0.5 ? '#002910' : '#F5F5F7'});
  if (a > 0) {
    c.save();
    c.globalAlpha = a;
    c.beginPath();
    c.arc(195, 500, 66 * (0.8 + 0.2 * a), 0, Math.PI * 2);
    c.fillStyle = 'rgba(48,209,88,0.16)';
    c.fill();
    c.lineWidth = 5;
    c.strokeStyle = '#30D158';
    c.stroke();
    icon(c, 'check', 195, 500, 70, '#30D158', 3, a);
    c.restore();
  }
};

export const phase = (t: number, a: number, b: number) => k(t, a, b, 0, 1, ease.inOut);
