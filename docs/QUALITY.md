# Kalmny "The Click" — 4K master spec

The film is finished like a product film, not a social post: one 2160-wide
master pipeline from the first WebGL pixel to the delivered file, with every
1080 deliverable derived from it. Creatively nothing changed — same timing,
same framing, same curves (`CREATIVE.md`) — every dial under the picture was
raised to its ceiling instead.

## 1. The one law

> **On a final render, the WebGL drawing buffer is never smaller than
> 2160 px wide, and every canvas texture scales with that buffer.**
> (`src/lib/quality.ts`)

| Composition | Output | Internal 3D buffer | How |
|---|---|---|---|
| `Ad-9x16-4K` | 2160 × 3840 | 2160 × 3840 | native (dpr 1) |
| `Ad-4x5-4K` | 2160 × 2700 | 2160 × 2700 | native (dpr 1) |
| `Ad-9x16` | 1080 × 1920 | 2160 × 3840 | dpr 2 supersample, browser downsamples |
| `Ad-4x5` | 1080 × 1350 | 2160 × 2700 | dpr 2 supersample |

Texture densities (`px` props, authored against a 1080-wide frame) are
multiplied by `bufferWidth / 1080` inside `Screen` / `CanvasPlane`
(`useTexScale`), capped at 4096 px per side. At its closest, the hero phone's
screen covers ~1270 device px of a 2160 buffer; its canvas is ~1700 px wide —
the UI is never upscaled, on any composition. Headlines are vector type laid
out on a 1080 board and scaled by transform, so the browser rasterises them
at exact output resolution (with optical-size Inter masters).

In Remotion Studio the film automatically drops to a preview tier (dpr 1,
lighter post) so scrubbing stays interactive. Force a tier with the
`quality` input prop (`"master"` / `"preview"`); the 4K compositions default
to master even in Studio. The layout-audit compositions always render flat
preview frames (fast, and layout is fraction-based — a 1080 audit proves the
4K master collision-free too).

## 2. Image pipeline (`src/three/Film3D.tsx`)

- **HDR throughout**: the effect composer renders into HalfFloat buffers.
  Bloom's threshold is 1.0, so only true HDR highlights (the click ring, the
  client token, studio reflections) bloom; ACES filmic tone mapping receives
  an unclipped image and rolls off like film instead of clipping to white.
- **Anti-aliasing, twice**: MSAA (8× below 2160-wide buffers, 4× at 4K where
  pixel density does the work) resolves geometry; a final SMAA pass cleans
  the specular and post-process edges MSAA can't reach.
- **Bokeh at buffer scale**: depth-of-field renders at half the drawing
  height (up to 1280 px) instead of a fixed 480 — background phones melt
  into smooth discs with no stepping at 4K.
- **Studio light, baked sharp**: the environment (Poly Haven HDRI + four
  soft-box Lightformers, incl. the long overhead strip that draws the bright
  rail along the titanium band) is baked once at 1024 px per cube face —
  16× the default. Reflections read as soft-boxes, not smudges.
  *Drop-in upgrade:* replace `public/hdri/studio_small_03_1k.hdr` with
  Poly Haven's 4K version of the same HDRI for still finer reflections;
  nothing else changes.
- **Geometry**: 48-segment rounded-rect curves and 8-segment bevels on every
  slab (the client token is ~800 px across in the void shot); 96-segment
  camera barrels with coated inner elements, flash + LiDAR; front cameras
  in the Dynamic Island / iPad bezel / MacBook notch; a drawn MacBook
  keyboard (function row, spacebar, speaker grilles); matte back glass.
- **Texture filtering**: every canvas texture uses the renderer's maximum
  anisotropic filtering (≤16×), so screens stay legible at grazing angles.
- **Grain**: the post grain is per-pixel, so at 4K it becomes a fine film
  grain that also dithers the dark gradients platforms love to band.

## 3. Frame path (`remotion.config.ts`)

Frames travel browser → encoder as **PNG** (lossless, full chroma). JPEG
screenshots are 4:2:0: on red-on-black type and hairline UI rules the
*intermediate* — not the codec — was the quality ceiling. `REMOTION_IMAGE_FORMAT=jpeg`
restores fast throwaway previews. Output colour space is pinned to BT.709.

## 4. Encode (`tools/render_final.sh`)

Resumable chunked render → lossless concat → **one** encode generation per
output (chunks are CRF 10 near-lossless intermediates):

| File | Codec | Settings |
|---|---|---|
| `renders/<name>.mp4` | H.264 High @ L6.1, yuv420p TV-range BT.709 | CRF 15, veryslow, AAC 320 kbps, faststart |
| `renders/<name>-master.mp4` | HEVC Main10 (`hvc1`), yuv420p10le BT.709 | CRF 14, slow, AAC 320 kbps, faststart |

Audio: two-pass loudnorm to −15 LUFS / −1.5 dBTP, 48 kHz, measured once and
applied identically to both files.

Recommended release workflow — render each format **once** at 4K, derive the
upload cut from the same chunk set (chunks are keyed by output name, so the
second call below skips straight to the final encode):

```bash
npm run render:4k
#   -> renders/kalmny-the-click-9x16-4k.mp4         (H.264, 2160×3840)
#   -> renders/kalmny-the-click-9x16-4k-master.mp4  (HEVC 10-bit archival)
DELIVERY_HEIGHT=1920 DELIVERY_NAME=kalmny-the-click-9x16 MASTER=0 \
  tools/render_final.sh Ad-9x16-4K kalmny-the-click-9x16-4k
#   -> renders/kalmny-the-click-9x16.mp4            (H.264, 1080×1920 upload)
```

`DELIVERY_HEIGHT` downscales with Lanczos (the sharpest clean kernel for
text/screen content). Rendering the `Ad-9x16` composition directly is the
other valid path — its 3D is already supersampled internally; the 4K-comp
path above additionally supersamples the headline layer.

`SHUTTER=1` synthesises a 180° shutter (2-frame temporal mix) for a more
filmic motion cadence on the continuous take. Off by default: at 60 fps the
film's crisp UI taps read better unblurred.

## 5. QC checklist (all green on the current build)

```bash
npm run typecheck                                  # tsc --noEmit
python tools/audit_layout.py --step 0.1            # 9:16 type/picture separation
python tools/audit_layout.py --format 4x5 --step 0.25
```

Spot-check stills at master size before a full render — the frames that
stress every system (UI text, bokeh, bloom, macro token, device trio, logo):

```bash
npx remotion still src/index.ts Ad-9x16-4K /tmp/f876.png  --frame=876  --gl=swangle   # the ad
npx remotion still src/index.ts Ad-9x16-4K /tmp/f1674.png --frame=1674 --gl=swangle   # the click
npx remotion still src/index.ts Ad-9x16-4K /tmp/f1920.png --frame=1920 --gl=swangle   # the build
npx remotion still src/index.ts Ad-9x16-4K /tmp/f2430.png --frame=2430 --gl=swangle   # the mark
```

Verify at 100% zoom: small grey UI subtext legible, no texture upscale, no
banding in the black (grain dithers it), bokeh discs smooth. Confirm delivery
files after encode with `ffprobe` (2160×3840 / yuv420p10le on the master,
BT.709 tags, 60 fps) — `render_final.sh` prints this automatically.

Render-time expectation, measured on the current build:

| Machine | Per frame (2160×3840) | Full 43 s film |
|---|---|---|
| 2 CPU cores, software GL (`GL=swangle`) | ~14 s | ~10 h (overnight; chunked + resumable) |
| Any discrete/Apple-silicon GPU (`GL=angle`) | ~0.3–1 s | ~15–45 min |

Software GL rasterises 8.3 MP × the HDR composer on CPU — that is the whole
story; the same code on a GPU is a different world. Production renders
belong on a GPU machine (or Remotion Lambda with the same compositions).
A 2160-wide page wants ~2–4 GB RAM: keep `CONCURRENCY` at 1–2 for 4K on
small machines (higher values fail with out-of-memory screenshots, by
design of the safety limits, not silently). The 1080 compositions cost the
same as 4K internally — the price of never rendering below master quality.
