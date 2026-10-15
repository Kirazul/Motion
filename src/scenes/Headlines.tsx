// The on-screen words. One headline per VO phrase, always in the top band of
// the stage (centred on y 214, never below y 330) - visuals never enter that band - so type and picture
// never collide. Each headline enters on its phrase and hands over to the next
// one inside the pause, which gives muted viewers the full story.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Headline, LineSpec} from '../components/Type';
import {C, GRAD} from '../lib/theme';
import {s, e, word, PhraseId} from '../lib/time';

const SMALL = 46;
const BIG = 96;

type H = {from: PhraseId; to?: PhraseId; out?: number; lines: LineSpec[]; spread?: number; y?: number};

export const Headlines: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const next = (id: PhraseId) => s(id) - 0.06;

  const H: H[] = [
    {
      from: 'p01',
      lines: [
        {
          text: 'قداش من Client خسرتو؟',
          size: BIG,
          marks: {'خسرتو؟': {color: C.red}},
        },
      ],
    },
    {
      from: 'p02',
      lines: [
        {text: 'من غير ما تعرف', size: SMALL, weight: 500, color: C.text2},
        {text: 'علاش؟ وكيفاش؟', size: BIG + 8},
      ],
    },
    {
      from: 'p03',
      to: 'p04',
      lines: [
        {text: 'الـ Service اللي تقدّم فيه', size: BIG - 10, marks: {Service: {roll: {words: ['Service', 'Produit'], at: [word('p03', 'Produit') - 0.1]}}}},
      ],
    },
    {
      from: 'p04',
      lines: [
        {text: 'برشا عباد', size: SMALL, weight: 500, color: C.text2},
        {text: 'يلوجو عليه', size: BIG + 8},
      ],
    },
    {
      from: 'p05',
      lines: [
        {text: 'أما ما فماش', size: SMALL, weight: 500, color: C.text2},
        {text: 'Process واضح', size: BIG + 8, marks: {Process: {strikeAt: word('p05', 'واضح') + 0.1}}},
      ],
    },
    {
      from: 'p06',
      lines: [
        {text: 'ولا شنوا لازمهم يعملو', size: BIG - 18},
        {text: 'باش يوصلولك', size: SMALL, weight: 500, color: C.text2},
      ],
    },
    {
      from: 'p07',
      lines: [
        {text: 'ممكن حتى', size: SMALL, weight: 500, color: C.text2},
        {text: 'تعمل Ad', size: BIG + 8},
      ],
    },
    {
      from: 'p08',
      lines: [
        {text: 'وتصرف عليها', size: SMALL, weight: 500, color: C.text2},
        {text: 'برشا فلوس', size: BIG + 8, marks: {'فلوس': {color: C.amber}}},
      ],
    },
    {
      from: 'p09',
      lines: [
        {text: 'والـ Client يضيع', size: SMALL + 4, weight: 500, color: C.text2},
        {text: 'في الـ Inbox', size: BIG + 8},
      ],
    },
    {
      from: 'p10',
      lines: [{text: 'ولا يختار حد آخر', size: BIG}],
    },
    {
      from: 'p11',
      lines: [
        {text: 'juste خاطر مش عارف', size: SMALL, weight: 500, color: C.text2},
        {text: 'الخطوة اللي بعدها', size: BIG},
      ],
      out: e('p11') + 0.32,
    },
    {
      from: 'p12',
      lines: [
        {text: 'قبل ما تصرف برشا فلوس', size: SMALL, weight: 500, color: C.text2},
        {text: 'على الـ Ads', size: BIG + 8, marks: {Ads: {strikeAt: e('p12') - 0.25, strikeColor: C.text3}}},
      ],
    },
    {
      from: 'p13',
      lines: [
        {text: 'وفّرلو تجربة واضحة', size: BIG, marks: {'واضحة': {grad: GRAD.answer}}},
        {text: 'بعد الـ Click', size: SMALL + 6, weight: 600, color: C.text, marks: {Click: {grad: GRAD.answer, weight: 700}}},
      ],
    },
    {
      from: 'p14',
      lines: [
        {text: 'وخدمتنا', size: SMALL, weight: 500, color: C.text2},
        {text: 'إنّا نبنيو تجربة', size: BIG},
      ],
    },
    {
      from: 'p15',
      lines: [
        {text: 'تتماشى مع الـ Produit', size: BIG - 14, marks: {Produit: {roll: {words: ['Produit', 'Service'], at: [word('p15', 'Service') - 0.05]}}}},
        {text: 'اللي تقدّم فيه', size: SMALL, weight: 500, color: C.text2},
      ],
    },
    {
      from: 'p16',
      lines: [
        {text: 'وتخلّي الـ Client', size: SMALL + 4, weight: 500, color: C.text2},
        {text: 'فاهم شنوا توفّر', size: BIG},
      ],
    },
    {
      from: 'p17',
      lines: [
        {text: 'وشنوا لازم', size: SMALL, weight: 500, color: C.text2},
        {text: 'يعمل', size: BIG + 16, marks: {'يعمل': {grad: GRAD.answer}}},
      ],
      out: s('p18') - 0.1,
    },
    {
      from: 'p18',
      lines: [{text: 'تواصل معانا', size: BIG + 8}],
      out: s('p19') - 0.06,
    },
    {
      from: 'p19',
      lines: [{text: 'وإحنا نفسرولك أكثر', size: BIG - 14, weight: 600}],
      out: 1e9,
    },
  ];

  const order: PhraseId[] = H.map((h) => h.from);

  return (
    <>
      {H.map((h, i) => {
        const nextId = h.to ?? order[i + 1];
        const tOut = h.out ?? (nextId ? next(nextId) + 0.3 : e(h.from) + 1);
        // Enter on the phrase; the outgoing headline finishes leaving before the next lands
        const tIn = s(h.from) - 0.04 + (i > 0 ? 0.26 : 0);
        return (
          <Headline
            key={h.from}
            t={t}
            tIn={tIn}
            tOut={tOut}
            lines={h.lines}
            y={h.y ?? 214}
            spread={h.spread ?? 0.38}
          />
        );
      })}
    </>
  );
};
