#!/usr/bin/env python3
"""Layout audit: proves that type and picture never collide.

Renders the headline layer and the 3D layer separately (compositions
Audit-Text / Audit-3D), then for every sampled frame measures the pixels where
visible 3D content falls inside the headline's footprint (grown by a safety
margin). Any overlap is reported with its time; exit code 1 if any.

    python tools/audit_layout.py                 # 9:16, every 0.1 s
    python tools/audit_layout.py --step 0.05     # denser
    python tools/audit_layout.py --format 4x5
    python tools/audit_layout.py --reuse         # re-check already rendered layers

Needs: numpy, pillow (pip install numpy pillow), and REMOTION_BROWSER pointing at
a local Chromium if Remotion cannot download one.
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out" / "audit"


def render(comp: str, frames: list[int], dest: Path, scale: float):
    dest.mkdir(parents=True, exist_ok=True)
    cmd = [
        "npx", "remotion", "render", "src/index.ts", comp, str(dest),
        f"--frames={','.join(map(str, frames))}", "--image-format=png", "--sequence",
        "--gl=swangle", "--concurrency=3", "--timeout=300000", f"--scale={scale}",
    ]
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(r.stdout[-3000:] + r.stderr[-3000:])


def load(dest: Path, f: int, n_digits: int) -> np.ndarray:
    p = dest / f"element-{str(f).zfill(n_digits)}.png"
    im = Image.open(p).convert("L")
    return np.asarray(im, dtype=np.uint8)


def dilate(mask: np.ndarray, r: int) -> np.ndarray:
    """Square dilation by r pixels (separable max filter)."""
    if r <= 0:
        return mask
    m = mask.copy()
    for _ in range(r):
        m[1:, :] |= m[:-1, :]
        m[:-1, :] |= m[1:, :]
        m[:, 1:] |= m[:, :-1]
        m[:, :-1] |= m[:, 1:]
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--step", type=float, default=0.1, help="seconds between samples")
    ap.add_argument("--format", default="9x16", choices=["9x16", "4x5"])
    ap.add_argument("--scale", type=float, default=0.5, help="render scale for the audit")
    ap.add_argument("--margin", type=int, default=28, help="safety margin around type, in full-res px")
    ap.add_argument("--luma", type=int, default=34, help="3D pixels brighter than this count as content")
    ap.add_argument("--reuse", action="store_true")
    ap.add_argument("--start", type=float, default=0.0, help="first second to audit")
    ap.add_argument("--end", type=float, default=None, help="last second to audit")
    ap.add_argument("--out", default=None, help="sub-folder for this run's layers")
    a = ap.parse_args()

    tl = json.loads((ROOT / "src" / "timeline.json").read_text(encoding="utf-8"))
    fps = 60
    total = int(tl["duration"] * fps)
    last = total if a.end is None else min(total, int(a.end * fps))
    frames = list(range(int(a.start * fps), last, max(1, int(round(a.step * fps)))))
    suffix = "" if a.format == "9x16" else "-4x5"
    base = OUT / a.out if a.out else OUT
    d3 = base / f"3d{suffix}"
    dt = base / f"text{suffix}"
    if not a.reuse:
        print(f"rendering {len(frames)} frames x 2 layers ...", flush=True)
        render(f"Audit-Text{suffix}", frames, dt, a.scale)
        render(f"Audit-3D{suffix}", frames, d3, a.scale)
    nd = len(str(total))
    margin = max(1, int(a.margin * a.scale))
    bad = []
    for f in frames:
        try:
            tx = load(dt, f, nd)
            g = load(d3, f, nd)
        except FileNotFoundError:
            nd2 = len(str(max(frames)))
            tx = load(dt, f, nd2)
            g = load(d3, f, nd2)
        text_mask = tx > 60
        if not text_mask.any():
            continue
        zone = dilate(text_mask, margin)
        hit = zone & (g > a.luma)
        n = int(hit.sum())
        if n > 12:
            ys, xs = np.nonzero(hit)
            bad.append((f / fps, n, int(xs.min() / a.scale), int(ys.min() / a.scale), int(xs.max() / a.scale), int(ys.max() / a.scale)))
    if bad:
        print(f"OVERLAP in {len(bad)} of {len(frames)} sampled frames:")
        for t, n, x0, y0, x1, y1 in bad:
            print(f"  t={t:6.2f}s  {n:6d} px  box=({x0},{y0})-({x1},{y1})")
        sys.exit(1)
    print(f"OK - no type/picture overlap in {len(frames)} sampled frames ({a.format}, margin {a.margin}px)")


if __name__ == "__main__":
    main()
