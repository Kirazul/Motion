# Flora - voice-over direction

The film is cut to a phrase timeline (`src/timeline.json`). Record Flora to the
read below and the picture will already be on her words. If the read differs,
one command re-times the whole film to the real recording (see "Drop in the VO").

## Who Flora is

A Tunisian woman in her early thirties who builds products for a living and
talks to business owners every day. Warm, direct, a half-smile in the voice;
never salesy, never shouting. She speaks Derja with the French words every
Tunisian business owner uses (Client, Service, Produit, Process, Ad, Inbox,
Click) said naturally, not "announced". Think of a friend who happens to be the
expert, telling you something you need to hear.

- Pitch: mid-low, relaxed. Pace: about 3 words a second, unhurried.
- Energy curve: concern (hook) -> empathy (problem) -> quiet frustration
  (agitation) -> calm certainty (turn) -> confidence and warmth (solution) ->
  open invitation (CTA).
- Mic: close, dry room, no music under the recording. 48 kHz / 24-bit WAV.

## The read (target timing, seconds)

| # | Start | End | Line | Direction |
|---|---|---|---|---|
| p01 | 0.30 | 2.00 | قداش من Client خسرتو | A real question. Lean on **خسرتو**. |
| p02 | 2.18 | 4.18 | من غير ما تعرف علاش وكيفاش؟ | Slower; let **علاش** and **كيفاش** land separately. |
| p03 | 4.68 | 7.28 | ممكن الـ Service ولا الـ Produit اللي تقدّم فيه | Lighter, conversational. |
| p04 | 7.46 | 8.96 | برشا عباد يلوجو عليه، | Warm, a little proud: *people want it*. |
| p05 | 9.14 | 10.84 | أما ما فماش Process واضح | The turn of the sentence: **أما** with weight. |
| p06 | 11.02 | 13.32 | ولا شنوا لازمهم يعملو باش يوصلولك. | Empathy, falling at the end. |
| p07 | 13.82 | 15.02 | ممكن حتى تعمل Ad | Picks up pace. |
| p08 | 15.20 | 16.80 | وتصرف عليها برشا فلوس | A knowing smile on **برشا فلوس**. |
| p09 | 16.98 | 18.78 | والـ Client يضيع في الـ Inbox | Quiet frustration. |
| p10 | 18.96 | 20.16 | ولا يختار حد آخر، | Short, it stings. |
| p11 | 20.34 | 22.74 | juste خاطر مش عارف الخطوة اللي بعدها. | Slow down; **الخطوة اللي بعدها** is the insight. |
| (pause) | 22.74 | 23.49 | - | 0.75 s of silence. Do not fill it. |
| p12 | 23.49 | 25.69 | قبل ما تصرف برشا فلوس على الـ Ads، | Calm, certain, a step closer to the mic. |
| p13 | 25.87 | 28.17 | وفّرلو تجربة واضحة بعد الـ Click. | The thesis. Land **Click** cleanly - the picture clicks on it. |
| p14 | 28.77 | 30.47 | وخدمتنا إنّا نبنيو تجربة | Confident, warm. |
| p15 | 30.65 | 33.25 | تتماشى مع الـ Produit / Service اللي تقدّم فيه، | Light emphasis on **Produit** and **Service** (devices change on them). |
| p16 | 33.43 | 35.43 | وتخلّي الـ Client فاهم شنوا توفّر | Clear, even. |
| p17 | 35.61 | 36.81 | وشنوا لازم يعمل. | Crisp - three taps happen here. |
| p18 | 37.31 | 38.31 | تواصل معانا، | Invitation, smile. |
| p19 | 38.49 | 39.99 | وإحنا نفسرولك أكثر. | Warm close, no upward "ad" inflection. |

Total speech about 40 s; the film runs 42.9 s with the brand hold.

## Drop in the VO

```bash
python tools/vo_timeline.py align path/to/flora.wav   # measures pauses, re-times every phrase
python tools/vo_timeline.py show                      # check the 19 phrase boundaries
python tools/vo_timeline.py markers "0.31,2.2,..." --vo flora.wav   # manual override if needed
npx remotion render src/index.ts Ad-9x16 out/kalmny-9x16.mp4
```

`align` copies the file to `public/vo.wav`, rewrites `src/timeline.json` and
the film (picture, headlines and sound design) follows the new times. With a
VO present the sound design and music bed drop automatically so Flora leads.

## TTS fallback

If Flora is generated with TTS, use a Tunisian Arabic female neural voice
(e.g. Azure `ar-TN-ReemNeural`) at rate -5%, and insert breaks that match
the pauses above (0.18 s inside sentences; 0.5 / 0.5 / 0.75 / 0.6 / 0.5 s
between them). Then run `align` - the timing will snap to whatever came out.
