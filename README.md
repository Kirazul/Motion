# Kalmny - "The Click"

A 43-second paid-social film for Kalmny's digital product services (landing
pages, web solutions, mobile apps), built entirely in code: React + Remotion
for the timeline, Three.js for a single continuous 3D take, real device models
lit by a studio HDRI, iOS-grade interfaces drawn live onto their screens,
Tunisian Derja kinetic type, and synthesized sound design.

- Creative direction, script analysis, act-by-act plan: [docs/CREATIVE.md](docs/CREATIVE.md)
- Flora voice-over direction and timing: [docs/VO_FLORA.md](docs/VO_FLORA.md)
- 4K master pipeline and delivery spec: [docs/QUALITY.md](docs/QUALITY.md)
- Renders: [`renders/`](renders/)
  - `kalmny-the-click-9x16.mp4` - 1080x1920, 60 fps, 42.9 s, H.264 High
    (broadcast range, BT.709), AAC 320 kbps, -15 LUFS / -1.4 dBFS peak, 25.7 MB.
    Sound design + music bed, no voice yet (see "Timing follows the voice").
  - `kalmny-the-click-4x5.mp4` - feed cut, 1080x1350, same spec, 17.1 MB.
  - The committed files above are the previous delivery; re-render with
    `npm run render:4k` for the 2160x3840 master set (H.264 + HEVC 10-bit
    `-master.mp4`) from the current pipeline.

## Formats

Every final render draws the 3D world at 2160 px wide or more — the 4K
compositions natively, the 1080 cuts by internal supersampling — and every
screen texture scales with the drawing buffer ([docs/QUALITY.md](docs/QUALITY.md)).

| Composition | Size | Use |
|---|---|---|
| `Ad-9x16-4K` | 2160 x 3840, 60 fps | Reels / Stories **master** |
| `Ad-4x5-4K` | 2160 x 2700, 60 fps | Feed **master** |
| `Ad-9x16` | 1080 x 1920, 60 fps | Reels / Stories (upload) |
| `Ad-4x5` | 1080 x 1350, 60 fps | Feed (upload) |

## Run it

```bash
npm install
npm run studio                                    # interactive preview (fast preview tier)
npm run render:4k                                 # 2160x3840 master set: H.264 + HEVC 10-bit
npm run render:4k:feed                            # 2160x2700 master set
# derive the 1080 upload from the same 4K chunks (no re-render):
DELIVERY_HEIGHT=1920 DELIVERY_NAME=kalmny-the-click-9x16 MASTER=0 \
  tools/render_final.sh Ad-9x16-4K kalmny-the-click-9x16-4k
```

`REMOTION_BROWSER` is only needed when Remotion cannot download its own Chromium.

## Timing follows the voice

Every frame is keyed to the 19 VO phrases in `src/timeline.json`.

```bash
python tools/vo_timeline.py estimate               # timeline from the script (current)
python tools/vo_timeline.py align flora.wav        # re-time everything to a real recording
python tools/vo_timeline.py show
```

`align` was validated on a test read 12% slower than the estimate with its own
pauses: every phrase boundary landed within 4 ms.

## Quality gates

```bash
npx tsc --noEmit                                   # types
python tools/audit_layout.py --step 0.1            # type never overlaps picture (9:16)
python tools/audit_layout.py --format 4x5 --step 0.25
python tools/make_sfx.py                           # regenerate the sound design
tools/sheet.sh out/frames out/sheet.png 6          # contact sheet for visual review
```

`audit_layout.py` renders the headline layer and the 3D layer separately and
fails if any visible 3D pixel enters the headline footprint (+28 px margin) on
any sampled frame.

## Layout of the code

| Path | What |
|---|---|
| `script/script.json` | The VO script, phrase by phrase, with read-speed estimates |
| `src/timeline.json` | Phrase start/end times (written by `tools/vo_timeline.py`) |
| `src/lib/quality.ts` | Master-quality law: 2160-wide buffers, texture scaling, tiers |
| `src/lib/time.ts` | Cue helpers: phrase start/end, word times |
| `src/lib/anim.ts` | Motion language: curves, springs, noise |
| `src/scenes/Headlines.tsx` | On-screen Derja copy, one headline per phrase |
| `src/components/Type.tsx` | Kinetic type (RTL word reveals, rolls, strikes) |
| `src/three/story.ts` | The spine: hero phone pose, the client's path, camera framing solver |
| `src/three/acts.tsx` | Every act of the film |
| `src/three/devices.tsx` | iPhone 16 Pro, iPad Pro, MacBook Pro 14 models |
| `src/three/screens*.ts` | The interfaces on the screens (canvas, iPhone points) |
| `src/three/Film3D.tsx` | Canvas, studio light, depth of field, bloom, grain |
| `src/sfx.ts`, `tools/make_sfx.py` | Sound cue sheet and synthesizer |
| `.claude/skills/` | Motion-design skills used for this project (Remotion official + iart-ai, MIT) |

## Credits

- HDRI "Studio Small 03" - Poly Haven, CC0 (`public/hdri/CREDITS.md`)
- Fonts: Inter (OFL), IBM Plex Sans Arabic (OFL)
- Remotion is free for individuals and companies of up to 3 people; larger
  companies need a Remotion company licence.
