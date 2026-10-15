#!/usr/bin/env python3
"""Synthesize the film's sound design into public/sfx/ (48 kHz, 16-bit WAV).

Quiet-room UI sounds for a dark Apple-style interface: short, dry, rounded;
reverb only on chimes and hero cues; nothing with a long tail over speech.
Plus a minimal music bed (warm pads, no melody) that ducks under the VO.

    python tools/make_sfx.py          # needs numpy
"""
import wave
from pathlib import Path

import numpy as np

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "sfx"
rng = np.random.default_rng(12340)


def t_(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.002, d=0.1, curve=4.0):
    """Attack then exponential-ish decay envelope of n samples."""
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    dec = np.exp(-np.maximum(t - a, 0) * curve / max(d, 1e-4))
    return att * dec


def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def lp(x, fc, order=2):
    for _ in range(order):
        x = onepole_lp(x, fc)
    return x


def hp(x, fc):
    return x - lp(x, fc, 1)


def bp(x, lo, hi):
    return lp(hp(x, lo), hi, 2)


def sweep_lp(x, f0, f1):
    """Low-pass whose cutoff glides from f0 to f1 (log)."""
    n = len(x)
    fc = np.exp(np.linspace(np.log(f0), np.log(f1), n))
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x)
    acc = 0.0
    acc2 = 0.0
    for i in range(n):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        acc2 = (1 - a[i]) * acc + a[i] * acc2
        y[i] = acc2
    return y


def plate(x, size=1.0, mix=0.25, decay=0.9):
    """Small synthetic plate: convolve with decaying, filtered noise."""
    n = int(SR * 1.1 * size)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.0 / (decay * size))
    ir = lp(ir, 6500, 1)
    ir /= np.sqrt((ir ** 2).sum())
    wet = np.convolve(x, ir)
    dry = np.concatenate([x, np.zeros(len(wet) - len(x))])
    return dry * (1 - mix) + wet * mix * 0.9


def bell(f, d, partials=((1, 1), (2.0, 0.35), (3.01, 0.12), (4.2, 0.06))):
    t = t_(d)
    y = np.zeros_like(t)
    for m, g in partials:
        y += g * np.sin(2 * np.pi * f * m * t) * np.exp(-t * (3.5 + m * 1.8) / d)
    return y * env(len(t), 0.003, d, 1.0)


def norm(x, peak_db=-1.0):
    p = np.abs(x).max() or 1
    return x / p * (10 ** (peak_db / 20))


def fade(x, ms=4):
    n = int(SR * ms / 1000)
    x = x.copy()
    x[:n] *= np.linspace(0, 1, n)
    x[-n:] *= np.linspace(1, 0, n)
    return x


def save(name, x, peak_db=-1.0, stereo_width=0.0):
    OUT.mkdir(parents=True, exist_ok=True)
    x = fade(norm(x, peak_db))
    if stereo_width > 0:
        d = int(SR * 0.009)
        r = np.concatenate([np.zeros(d), x])[: len(x)]
        L = x * (1 - stereo_width * 0.3) + r * stereo_width * 0.3
        R = x * (1 - stereo_width * 0.3) - r * stereo_width * 0.15 + np.concatenate([x[d // 2:], np.zeros(d // 2)]) * stereo_width * 0.15
        st = np.stack([L, R], 1)
    else:
        st = np.stack([x, x], 1)
    pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"  {name:22s} {len(x) / SR:5.2f}s")


def main():
    print("synthesizing sound design ->", OUT.relative_to(ROOT))
    # tick: dry band-passed click with a faint 90 Hz thump
    n = int(SR * 0.08)
    click = bp(rng.standard_normal(n), 1800, 3400) * env(n, 0.0005, 0.012, 6)
    thump = np.sin(2 * np.pi * 90 * t_(0.08)) * env(n, 0.001, 0.05, 5) * 0.5
    save("tick.wav", click + thump, -6)

    # glass tap (three pitches)
    for i, semi in enumerate([0, 2, 4]):
        f = 1600 * 2 ** (semi / 12)
        y = bell(f, 0.16, ((1, 1), (2.7, 0.25))) + bp(rng.standard_normal(int(SR * 0.16)), 2000, 6000) * env(int(SR * 0.16), 0.0005, 0.01, 6) * 0.3
        save(f"tap{i + 1}.wav", y, -8)

    # loss: soft low body drop + a dull red "tock" (contact going out)
    d = 0.42
    tt = t_(d)
    body = np.sin(2 * np.pi * (220 * np.exp(-tt * 3)) * tt) * env(len(tt), 0.002, 0.25, 3)
    tock = bp(rng.standard_normal(len(tt)), 500, 1400) * env(len(tt), 0.001, 0.03, 6) * 0.6
    save("loss.wav", lp(body + tock, 2500), -9)

    # whoosh (low, restrained) and air whoosh (rising)
    for name, d, f0, f1, g in [("whoosh_low.wav", 1.4, 250, 1800, -6), ("whoosh_air.wav", 0.9, 600, 7000, -8), ("whoosh_long.wav", 2.2, 200, 5000, -5)]:
        n = int(SR * d)
        x = rng.standard_normal(n)
        shape = np.sin(np.linspace(0, np.pi, n)) ** 1.6
        y = sweep_lp(x, f0, f1) * shape
        if "low" in name or "long" in name:
            y += np.sin(2 * np.pi * 55 * t_(d)) * shape * 0.35
        save(name, y, g, stereo_width=0.8)

    # sub hit (hero arrival)
    d = 1.6
    tt = t_(d)
    sub = np.sin(2 * np.pi * (48 + 30 * np.exp(-tt * 18)) * tt) * env(len(tt), 0.004, 0.7, 2.5)
    save("sub_hit.wav", plate(sub, 1.2, 0.18), -3)

    # chime: two-note glass G5 -> D6, short plate (hero cue: confirmation)
    a = bell(783.99, 1.2)
    b = np.concatenate([np.zeros(int(SR * 0.09)), bell(1174.66, 1.3)])
    a = np.concatenate([a, np.zeros(len(b) - len(a))])
    save("chime.wav", plate(a * 0.8 + b, 1.0, 0.3), -4, stereo_width=0.5)

    # notification pop (iOS-like, rounded)
    d = 0.22
    tt = t_(d)
    y = np.sin(2 * np.pi * (880 + 700 * np.exp(-tt * 40)) * tt) * env(len(tt), 0.001, 0.09, 4)
    save("pop.wav", plate(y, 0.5, 0.15), -7)

    # message ping (muted marimba)
    for i, f in enumerate([987.77, 1108.73, 880.0]):
        y = bell(f, 0.32, ((1, 1), (3.9, 0.18), (9.2, 0.04)))
        save(f"ping{i + 1}.wav", y, -9)

    # flood texture: accelerating ticks rising an octave (never 50 separate pings)
    d = 1.9
    n = int(SR * d)
    y = np.zeros(n)
    pos = 0.0
    k = 0
    while pos < d - 0.05:
        rate = 7 + 32 * (pos / d) ** 1.4
        f = 900 * 2 ** (pos / d)
        g = 0.4 + 0.6 * (pos / d)
        s = int(pos * SR)
        b = bell(f * (1 + 0.04 * rng.standard_normal()), 0.08, ((1, 1),)) * g
        y[s : s + len(b)] += b[: n - s]
        pos += 1 / rate
        k += 1
    save("flood.wav", lp(y, 6000), -9, stereo_width=0.7)

    # vibration buzz (two pulses)
    d = 0.42
    tt = t_(d)
    gate = ((tt < 0.15) | ((tt > 0.22) & (tt < 0.37))).astype(float)
    y = (np.sin(2 * np.pi * 150 * tt) + 0.4 * np.sin(2 * np.pi * 300 * tt)) * gate
    save("buzz.wav", lp(y, 900) * env(len(tt), 0.005, 0.4, 0.5), -10)

    # typing: soft key taps
    d = 1.1
    n = int(SR * d)
    y = np.zeros(n)
    tpos = 0.02
    while tpos < d - 0.08:
        s = int(tpos * SR)
        m = int(SR * 0.03)
        y[s : s + m] += bp(rng.standard_normal(m), 1500, 5000) * env(m, 0.0005, 0.008, 6) * (0.6 + 0.4 * rng.random())
        tpos += 0.07 + 0.05 * rng.random()
    save("typing.wav", y, -12)

    # number roll: very soft ticks rising
    d = 1.4
    n = int(SR * d)
    y = np.zeros(n)
    for i in range(22):
        p = (i / 22) ** 0.7 * (d - 0.05)
        s = int(p * SR)
        b = bell(1300 * 2 ** (i / 40), 0.05, ((1, 1),))
        y[s : s + len(b)] += b[: n - s] * 0.6
    save("roll.wav", y, -14)

    # error: soft low double blip
    d = 0.4
    tt = t_(d)
    y = np.sin(2 * np.pi * 440 * tt) * ((tt < 0.12)) * env(len(tt), 0.002, 0.1, 3) + np.sin(2 * np.pi * 349.23 * tt) * ((tt > 0.15) & (tt < 0.3)) * np.exp(-np.maximum(tt - 0.15, 0) * 12)
    save("error.wav", lp(y, 1800), -10)

    # rewind: reverse swell with pitch falling
    d = 0.9
    n = int(SR * d)
    x = sweep_lp(rng.standard_normal(n), 6000, 300)[::-1] * np.linspace(0, 1, n) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 300, n)) / SR) * np.linspace(0, 1, n) ** 3 * 0.3
    save("rewind.wav", x + tone, -7, stereo_width=0.6)

    # suck-out (silence before the turn)
    d = 0.6
    n = int(SR * d)
    y = plate(bell(523.25, 0.5) * 0.4, 1.0, 0.9)[: n][::-1] * np.linspace(0, 1, n) ** 2
    save("suck.wav", y, -12)

    # the click: a satisfying press + bright bloom (hero cue)
    d = 1.4
    tt = t_(d)
    press = bp(rng.standard_normal(len(tt)), 800, 4000) * env(len(tt), 0.0005, 0.01, 6)
    bloom = bell(1046.5, 1.4) * 0.6 + bell(1567.98, 1.4) * 0.4
    sub = np.sin(2 * np.pi * 60 * tt) * env(len(tt), 0.002, 0.25, 3) * 0.7
    save("click.wav", plate(press * 0.8 + bloom + sub, 1.2, 0.3), -2, stereo_width=0.6)

    # assemble: magnetic clunk for devices landing
    d = 0.5
    tt = t_(d)
    y = np.sin(2 * np.pi * 80 * tt) * env(len(tt), 0.002, 0.12, 3) + bp(rng.standard_normal(len(tt)), 300, 2000) * env(len(tt), 0.001, 0.02, 6) * 0.5
    save("clunk.wav", y, -8)

    # confirm: rising triad (success)
    seq = [523.25, 659.25, 783.99, 1046.5]
    y = np.zeros(int(SR * 1.4))
    for i, f in enumerate(seq):
        b = bell(f, 0.9) * (0.7 + 0.1 * i)
        s = int(SR * i * 0.07)
        y[s : s + len(b)] += b[: len(y) - s]
    save("confirm.wav", plate(y, 1.0, 0.28), -4, stereo_width=0.5)

    # logo resolve: warm low swell into a soft chord
    d = 3.2
    tt = t_(d)
    sw = np.sin(2 * np.pi * 70 * tt) * np.minimum(1, tt / 0.8) * np.exp(-np.maximum(tt - 0.8, 0) * 1.2)
    chord = sum(np.sin(2 * np.pi * f * tt) * 0.25 for f in (174.61, 261.63, 329.63, 440.0, 523.25))
    chord *= np.minimum(1, tt / 0.6) * np.exp(-np.maximum(tt - 0.6, 0) * 1.0)
    save("logo.wav", plate(lp(sw * 0.8 + chord, 3000), 1.4, 0.3), -3, stereo_width=0.7)

    # music bed: warm pad progression, no melody, slow attacks (ducked in the mix)
    total = 46.0
    tt = t_(total)
    chords = [(0.0, (87.31, 174.61, 261.63, 329.63, 392.0)),   # Fmaj9-ish
              (10.0, (73.42, 146.83, 220.0, 261.63, 349.23)),  # Dm9
              (20.0, (58.27, 116.54, 233.08, 293.66, 349.23)), # Bbmaj7
              (26.5, (65.41, 130.81, 196.0, 261.63, 329.63)),  # C (the turn)
              (30.0, (87.31, 174.61, 261.63, 329.63, 440.0)),  # Fmaj7 (the answer)
              (38.0, (87.31, 130.81, 220.0, 261.63, 392.0))]   # F add9 (resolve)
    bed = np.zeros(len(tt))
    for i, (t0, freqs) in enumerate(chords):
        t1 = chords[i + 1][0] if i + 1 < len(chords) else total
        seg = (tt >= t0 - 1.5) & (tt < t1 + 2.0)
        local = tt[seg] - (t0 - 1.5)
        dur = (t1 + 2.0) - (t0 - 1.5)
        shape = np.minimum(1, local / 1.8) * np.minimum(1, (dur - local) / 2.0)
        x = np.zeros(seg.sum())
        for j, f in enumerate(freqs):
            det = 1 + 0.0015 * (j - 2)
            x += (np.sin(2 * np.pi * f * det * local) + 0.3 * np.sin(2 * np.pi * f * 2 * local + j)) / (1 + j * 0.35)
        bed[seg] += x * shape
    trem = 1 + 0.05 * np.sin(2 * np.pi * 0.17 * tt)
    bed = lp(bed * trem, 1600, 2)
    save("bed.wav", plate(bed, 1.4, 0.35), -6, stereo_width=0.9)


if __name__ == "__main__":
    main()
