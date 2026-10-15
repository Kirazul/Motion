#!/usr/bin/env python3
"""VO timeline: the single source of timing for every frame of the film.

The film never hard-codes seconds. Every scene reads phrase start/end times from
src/timeline.json, so the picture follows the voice.

  python tools/vo_timeline.py estimate
      Writes src/timeline.json from the estimated phrase lengths in
      script/script.json (the read-speed the Flora direction asks for).

  python tools/vo_timeline.py align path/to/flora.wav [--noise -35] [--min-gap 0.12]
      Measures the real VO: finds the pauses with ffmpeg silencedetect, picks the
      pause that best matches every phrase boundary (dynamic programming on the
      expected phrase lengths), copies the VO to public/vo.wav and writes
      src/timeline.json with "vo": "vo.wav". Re-render and the motion is on the voice.

  python tools/vo_timeline.py markers "0.31,2.05,4.62,..." [--vo path.wav]
      Manual override: one start time per phrase (19 values), plus the end of
      the last phrase as an extra value. Use it when you drop markers by ear.

  python tools/vo_timeline.py show
      Prints the current timeline as a table.
"""
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "script" / "script.json"
OUT = ROOT / "src" / "timeline.json"
PUBLIC = ROOT / "public"


def load_script():
    s = json.loads(SCRIPT.read_text(encoding="utf-8"))
    phrases, sent_of = [], []
    for si, sent in enumerate(s["sentences"]):
        for p in sent["phrases"]:
            phrases.append(p)
            sent_of.append(si)
    return s, phrases, sent_of


def write(s, phrases, starts, ends, vo=None, source="estimate"):
    total = ends[-1] + s["tail"]
    data = {
        "source": source,
        "vo": vo,
        "duration": round(total, 3),
        "phrases": [
            {"id": p["id"], "text": p["text"], "start": round(a, 3), "end": round(b, 3)}
            for p, a, b in zip(phrases, starts, ends)
        ],
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}  ({source}, {total:.2f}s, {len(phrases)} phrases)")


def estimate():
    s, phrases, sent_of = load_script()
    t = s["lead"]
    starts, ends = [], []
    for i, p in enumerate(phrases):
        if i > 0:
            if sent_of[i] != sent_of[i - 1]:
                t += s["gapBetweenSentences"][sent_of[i - 1]]
            else:
                t += s["gapInSentence"]
        starts.append(t)
        t += p["est"]
        ends.append(t)
    write(s, phrases, starts, ends)


def silences(wav, noise, min_gap):
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(wav), "-af",
         f"silencedetect=noise={noise}dB:d={min_gap}", "-f", "null", "-"],
        capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    dur = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr).groups()[2]) + \
        60 * float(re.search(r"Duration: (\d+):(\d+):", r.stderr).group(2)) + \
        3600 * float(re.search(r"Duration: (\d+):", r.stderr).group(1))
    gaps = list(zip(starts, ends + [dur] * (len(starts) - len(ends))))
    return gaps, dur


def align(wav, noise=-35.0, min_gap=0.12):
    s, phrases, sent_of = load_script()
    gaps, dur = silences(wav, noise, min_gap)
    # speech span = from end of the leading silence to start of the trailing one
    speech_start = gaps[0][1] if gaps and gaps[0][0] <= 0.05 else 0.0
    speech_end = gaps[-1][0] if gaps and gaps[-1][1] >= dur - 0.05 else dur
    inner = [g for g in gaps if g[0] > speech_start + 0.05 and g[1] < speech_end - 0.05]
    n = len(phrases)
    est = [p["est"] for p in phrases]
    # expected boundary times, scaled to the measured speech span
    span = speech_end - speech_start
    exp_total = sum(est) + s["gapInSentence"] * (n - 1)
    k = span / exp_total
    # candidates: real pauses (center), plus a synthetic fallback per boundary
    cands = [((a + b) / 2, a, b, b - a, True) for a, b in inner]
    t, exp_b = speech_start, []
    for i in range(n - 1):
        t += (est[i] + s["gapInSentence"]) * k
        exp_b.append(t)
    # DP: choose boundary j for phrase gap i, strictly increasing in time
    INF = float("inf")
    m = len(cands)

    def cost(i, c):
        center, _, _, glen, real = c
        dev = (center - exp_b[i]) / max(0.35, est[i] * k)
        bonus = 0.6 * math.log(1 + glen / 0.1) if real else 0
        sent_boundary = sent_of[i] != sent_of[i + 1]
        if sent_boundary and real:
            bonus += 0.4 * math.log(1 + glen / 0.2)
        return dev * dev - bonus + (0 if real else 2.5)

    # synthetic candidates at the expected positions (used only if no pause fits)
    synth = [(e, e, e, 0.0, False) for e in exp_b]
    allc = sorted(cands + synth, key=lambda c: c[0])
    m = len(allc)
    dp = [[INF] * m for _ in range(n - 1)]
    back = [[-1] * m for _ in range(n - 1)]
    for j in range(m):
        dp[0][j] = cost(0, allc[j])
    for i in range(1, n - 1):
        best, bj = INF, -1
        for j in range(m):
            if j > 0 and dp[i - 1][j - 1] < best:
                best, bj = dp[i - 1][j - 1], j - 1
            if best < INF:
                dp[i][j] = best + cost(i, allc[j])
                back[i][j] = bj
    j = min(range(m), key=lambda x: dp[n - 2][x])
    chosen = []
    for i in range(n - 2, -1, -1):
        chosen.append(allc[j])
        j = back[i][j]
    chosen.reverse()
    starts = [speech_start] + [c[2] for c in chosen]
    ends = [c[1] for c in chosen] + [speech_end]
    PUBLIC.mkdir(exist_ok=True)
    shutil.copyfile(wav, PUBLIC / "vo.wav")
    write(s, phrases, starts, ends, vo="vo.wav", source=f"align:{Path(wav).name}")
    synthetic = sum(1 for c in chosen if not c[4])
    if synthetic:
        print(f"note: {synthetic} boundaries had no pause and were placed by length; "
              "check them with `show` and fix with `markers` if needed")


def markers(values, vo=None):
    s, phrases, _ = load_script()
    v = [float(x) for x in values.replace(";", ",").split(",") if x.strip()]
    n = len(phrases)
    if len(v) not in (n, n + 1):
        sys.exit(f"need {n} starts (+ optional final end), got {len(v)}")
    starts = v[:n]
    end_last = v[n] if len(v) > n else starts[-1] + phrases[-1]["est"]
    ends = [b - 0.12 for b in starts[1:]] + [end_last]
    vo_name = None
    if vo:
        PUBLIC.mkdir(exist_ok=True)
        shutil.copyfile(vo, PUBLIC / "vo.wav")
        vo_name = "vo.wav"
    write(s, phrases, starts, ends, vo=vo_name, source="markers")


def show():
    d = json.loads(OUT.read_text(encoding="utf-8"))
    print(f"source={d['source']} vo={d['vo']} duration={d['duration']}s")
    for p in d["phrases"]:
        print(f"{p['id']}  {p['start']:6.2f} - {p['end']:6.2f}  ({p['end'] - p['start']:.2f}s)  {p['text']}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a or a[0] in ("-h", "--help"):
        print(__doc__)
    elif a[0] == "estimate":
        estimate()
    elif a[0] == "align":
        kw = {}
        if "--noise" in a:
            kw["noise"] = float(a[a.index("--noise") + 1])
        if "--min-gap" in a:
            kw["min_gap"] = float(a[a.index("--min-gap") + 1])
        align(a[1], **kw)
    elif a[0] == "markers":
        markers(a[1], a[a.index("--vo") + 1] if "--vo" in a else None)
    elif a[0] == "show":
        show()
    else:
        sys.exit(__doc__)
