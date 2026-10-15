# Kalmny - "The Click" - creative direction

Paid-social film (Meta Reels/Stories 9:16, Feed 4:5) for Kalmny's digital
product services: landing pages, web solutions, mobile apps.

## 1. The script, read closely

| Beat | Lines | What the viewer must feel | Job in the funnel |
|---|---|---|---|
| Hook | p01-p02 "قداش من Client خسرتو… علاش وكيفاش؟" | A loss they did not know they had. | Stop the thumb: a number, a question, a loss. |
| Problem | p03-p06 demand exists, but no clear process to reach you | "That's me." Recognition, not blame. | Validate demand, name the gap. |
| Agitation | p07-p11 ads + money, inbox, competitor, "the next step" | The cost of the gap: money out, clients out. | Make the status quo expensive. |
| Turn | p12-p13 "before spending on Ads, give a clear experience after the Click" | Relief: the fix is upstream of the ad. | The insight that justifies the offer. |
| Offer | p14-p17 we build an experience that fits your product/service | Competence, tailoring, clarity. | Show the product (landing, web, app). |
| CTA | p18-p19 "تواصل معانا…" | Low-risk next step. | Contact. The film itself ends on a clear next step - it practises what it sells. |

Key insight the picture carries: **the click is not the end of the ad; it is the
start of the experience.** The whole film is the journey of one client after
one click.

Language: Tunisian Derja with the French business words owners actually use.
On-screen copy mirrors the VO phrase for phrase, so it works muted (most Meta
views are muted) and doubles as captions.

## 2. Visual idea

One continuous take in a dark studio. Real devices (iPhone 16 Pro, iPad Pro,
MacBook Pro 14) modelled to scale, lit by a real studio HDRI, with real iOS-grade
interfaces on their screens. No abstract shapes: every object is something the
viewer recognises from their own phone.

**The client is a real object.** One contact survives the opening grid of 25.
That avatar is the thread of the film: it lands in a phone as the user, taps the
ad, asks the price, gets buried in the inbox, walks to a competitor, rewinds,
stalls at "the next step", is pressed on the word *Click* and turns over to
reveal a check (clarity), rides the phone Kalmny built through three clear taps
to "confirmed", presses "تواصل معانا", and finally becomes the dot of the
Kalmny wordmark.

| Act | VO | Picture |
|---|---|---|
| 1 Contacts | p01-p02 | 25 Contacts monograms; they flash red and turn away into the dark, slowly then all at once; a counter keeps score. |
| 2 Search | p03-p04 | A phone rises; "resto Tunis" is typed; your business is the top result. Pull back: ten phones, ten people, ten searches - all finding you. |
| 3 Dead ends | p05-p06 | Your profile: no booking, a dead link. The phone fans into three dead ends: unanswered call, 404, "Vu". |
| 4 Ad | p07-p08 | Sponsored post; the client taps "En savoir plus"; asks "c'est combien ?"; the budget widget climbs to 2 450 DT - "Réservations : 0". |
| 5 Inbox | p09-p10 | Business inbox floods to 99+; messages burst out of the screen; the client is pushed down, then walks to the competitor, whose booking turns green. |
| 6 Next step | p11 | Rewind. A stepper: "Click ✓ - Étape suivante ?" The client tries, and bounces back. |
| 7 The click | p12-p13 | Everything falls away. The client alone. Pressed on "Click": a ring of light; it turns over - a check. |
| 8 Build | p14-p15 | MacBook, iPad and iPhone assemble around it; landing pages build; each device becomes a different trade on "Produit" / "Service". |
| 9 Clarity | p16-p17 | The phone: what you offer, lit one by one; three clear steps; "C'est confirmé"; orderly notifications - the opposite of the inbox flood. |
| 10 CTA | p18-p19 | "تواصل معانا" pressed; the client becomes the dot of **kalmny**. URL. |

## 3. Motion language

- Tone: calm-sharp (premium tech). Critically damped springs, no bounce.
- Curves: `out (0.16, 1, 0.3, 1)` for every entrance, `inOut (0.65, 0, 0.35, 1)`
  for moves, `in` only for short exits.
- Camera: one Hermite path through every key, velocity-continuous; holds only
  where the story needs stillness (the void before the click).
- Type: words rise out of soft focus, staggered in RTL reading order; one
  headline per phrase, handed over inside the VO pauses.
- Colour is rationed: red/amber only for loss and pain, teal-to-blue only for
  the answer (the client's check, the CTA, the brand).
- Restraint: one hero per frame. The click is the only "wow".

## 4. Layout rules (enforced, not hoped)

- The top band of the frame belongs to the headline. A framing solver places
  every shot's highest element under 33 % of the frame height.
- `tools/audit_layout.py` renders the type and the 3D layers separately and
  fails if any visible 3D pixel enters the type footprint (+28 px margin) at
  any sampled frame.
- 9:16 content stays inside Meta's safe zone; the 4:5 cut uses the same stage.

## 5. Sound

Synthesized by `tools/make_sfx.py` (no samples, no licences): ticks, glass taps,
losses, typing, pops, flood texture, money roll, rewind, the click (press +
bloom + sub), clunks, confirmation chime, logo resolve, and a warm pad bed.
Every cue is on a VO cue (`src/sfx.ts`), so the sound re-times with the voice.

## 6. Open items for the client

- Final URL for the end card (currently `kalmny.vercel.app`) and the logo file
  if Kalmny has a mark beyond the wordmark.
- Flora's recording (see `VO_FLORA.md`).
- Real client case-study screens can replace the three demo trades
  (`src/three/screens2.ts`, `THEMES`).
