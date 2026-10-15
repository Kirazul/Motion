#!/usr/bin/env bash
# Final render, resumable: video in chunks (each chunk is skipped if already
# rendered), sound rendered once, then concatenated losslessly and muxed.
#   tools/render_final.sh Ad-9x16 kalmny-the-click-9x16
#   tools/render_final.sh Ad-4x5  kalmny-the-click-4x5
# Set REMOTION_BROWSER to a local Chromium if Remotion cannot download one.
set -euo pipefail
cd "$(dirname "$0")/.."
comp="$1"; name="$2"; chunk="${CHUNK:-300}"
parts="renders/parts/$name"; mkdir -p "$parts"
total=$(python3 -c "import json,math;print(math.ceil(json.load(open('src/timeline.json'))['duration']*60))")
common=(--gl=swangle --concurrency="${CONCURRENCY:-2}" --timeout=300000)
i=0
for ((a=0; a<total; a+=chunk)); do
  b=$(( a + chunk - 1 )); (( b >= total )) && b=$(( total - 1 ))
  f=$(printf "%s/part%03d.mp4" "$parts" "$i")
  if [[ ! -s "$f" ]]; then
    echo "[$(date +%T)] $comp frames $a-$b -> $f"
    npx remotion render src/index.ts "$comp" "$f.tmp.mp4" --frames="$a-$b" --muted --codec=h264 --crf=16 --x264-preset=slow --pixel-format=yuv420p "${common[@]}" >"$f.log" 2>&1
    mv "$f.tmp.mp4" "$f"
  fi
  i=$((i+1))
done
if [[ ! -s "$parts/audio.wav" ]]; then
  echo "[$(date +%T)] audio"
  npx remotion render src/index.ts "$comp" "$parts/audio.tmp.wav" --codec=wav --props='{"showHeadlines":false,"mode":"audio"}' "${common[@]}" >"$parts/audio.log" 2>&1
  mv "$parts/audio.tmp.wav" "$parts/audio.wav"
fi
ls "$parts"/part*.mp4 | sed "s|^|file '$(pwd)/|; s|$|'|" > "$parts/list.txt"
# delivery: broadcast-range yuv420p (players and Meta expect TV range) and
# loudness-normalised sound (-15 LUFS integrated, true peak -1.5 dBTP; Reels
# play at about -14). Two-pass loudnorm: measure, then apply linearly.
ffmpeg -v error -y -f concat -safe 0 -i "$parts/list.txt" -c copy "$parts/video.mp4"
meas=$(ffmpeg -hide_banner -nostats -i "$parts/audio.wav" -af loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$meas" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'])")
mtp=$(echo "$meas" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_tp'])")
mlra=$(echo "$meas" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_lra'])")
mth=$(echo "$meas" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_thresh'])")
off=$(echo "$meas" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['target_offset'])")
ffmpeg -v error -y -i "$parts/video.mp4" -i "$parts/audio.wav" -map 0:v -map 1:a \
  -vf "scale=in_range=full:out_range=tv,format=yuv420p" -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:v libx264 -preset slow -crf 16 -profile:v high -level 5.1 -r 60 \
  -af "loudnorm=I=-15:TP=-1.5:LRA=11:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:offset=$off:linear=true,aresample=48000" \
  -c:a aac -b:a 320k -movflags +faststart -shortest "renders/$name.mp4"
echo "[$(date +%T)] done -> renders/$name.mp4"
