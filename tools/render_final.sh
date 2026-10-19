#!/usr/bin/env bash
# Final render, resumable: video in chunks (each chunk is skipped if already
# rendered), sound rendered once, then concatenated losslessly and encoded
# ONCE per output. Chunks are near-lossless (CRF 10) intermediates - the only
# lossy generation that counts is the final encode below.
#
#   tools/render_final.sh Ad-9x16-4K kalmny-the-click-9x16-4k   # 4K master set
#   tools/render_final.sh Ad-4x5-4K  kalmny-the-click-4x5-4k
#   tools/render_final.sh Ad-9x16    kalmny-the-click-9x16       # 1080 set
#
# Outputs (in renders/):
#   <name>.mp4          H.264 High delivery file (platform upload)
#   <name>-master.mp4   HEVC 10-bit master (archival / future re-cuts)
#
# Knobs (env):
#   DELIVERY_HEIGHT=1920  derive the H.264 delivery at this height from the
#                         render (render 4K once, ship a supersampled 1080)
#   DELIVERY_NAME=x       write the H.264 delivery to renders/x.mp4 instead
#                         of renders/<name>.mp4 (pair with DELIVERY_HEIGHT so
#                         one 4K chunk set yields both the 4K and 1080 files)
#   MASTER=0              skip the HEVC master
#   CRF=15 PRESET=veryslow        H.264 delivery encode
#   CRF_MASTER=14 PRESET_MASTER=slow   HEVC master encode
#   SHUTTER=1             synthesise a 180-degree shutter (2-frame temporal
#                         mix) - cinematic motion blur on the continuous take
#   CHUNK=300 CONCURRENCY=2        chunked rendering (fresh browser per chunk,
#                         which also bounds page-memory growth). A 2160-wide
#                         page wants ~2-4 GB RAM: on small machines use
#                         CONCURRENCY=1 and CHUNK=30-60 for the 4K comps.
#   GL=swangle            WebGL renderer. swangle = software GL (any machine,
#                         slow: ~14 s/frame at 4K on 2 CPU cores). On a machine
#                         WITH a GPU use GL=angle (typically 0.3-1 s/frame).
# Set REMOTION_BROWSER to a local Chromium if Remotion cannot download one.
set -euo pipefail
cd "$(dirname "$0")/.."
comp="$1"; name="$2"; chunk="${CHUNK:-300}"
command -v ffmpeg >/dev/null || { echo "error: ffmpeg not on PATH (needed for the final encode)"; exit 1; }
parts="renders/parts/$name"; mkdir -p "$parts"
total=$(python3 -c "import json,math;print(math.ceil(json.load(open('src/timeline.json'))['duration']*60))")
# --media-cache-size: by default @remotion/media reserves 50% of RAM for its
# decode cache (1.5 GB on a 4 GB box) - headroom a 2160-wide WebGL page needs
# far more. The SFX set is a few MB; 256 MB is generous and keeps 4K pages
# alive on small machines.
common=(--gl="${GL:-swangle}" --concurrency="${CONCURRENCY:-2}" --timeout=300000 --media-cache-size-in-bytes=268435456)
i=0
for ((a=0; a<total; a+=chunk)); do
  b=$(( a + chunk - 1 )); (( b >= total )) && b=$(( total - 1 ))
  f=$(printf "%s/part%03d.mp4" "$parts" "$i")
  if [[ ! -s "$f" ]]; then
    echo "[$(date +%T)] $comp frames $a-$b -> $f"
    npx remotion render src/index.ts "$comp" "$f.tmp.mp4" --frames="$a-$b" --muted --codec=h264 --crf="${CRF_INT:-10}" --x264-preset="${PRESET_INT:-slow}" --pixel-format=yuv420p "${common[@]}" >"$f.log" 2>&1
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
ffmpeg -v error -y -f concat -safe 0 -i "$parts/list.txt" -c copy "$parts/video.mp4"

# Loudness: two-pass loudnorm, measured once, applied identically to every
# output (-15 LUFS integrated, true peak -1.5 dBTP; Reels play at about -14).
meas=$(ffmpeg -hide_banner -nostats -i "$parts/audio.wav" -af loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$meas" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'])")
mtp=$(echo "$meas" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_tp'])")
mlra=$(echo "$meas" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_lra'])")
mth=$(echo "$meas" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_thresh'])")
off=$(echo "$meas" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['target_offset'])")
# out_channel_layout: loudnorm can hand back an unspecified channel layout
# that some ffmpeg builds refuse to feed to the AAC encoder; pin it.
afilter="loudnorm=I=-15:TP=-1.5:LRA=11:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:offset=$off:linear=true,aresample=48000:out_channel_layout=stereo"

# Video filter chains. Broadcast-range yuv420p (players and Meta expect TV
# range), BT.709 tagged. Downscaling (DELIVERY_HEIGHT) is Lanczos - the
# sharpest clean kernel for screen content with text.
shutter=""
[[ "${SHUTTER:-0}" == "1" ]] && shutter="tmix=frames=2:weights='1 1',"
if [[ -n "${DELIVERY_HEIGHT:-}" ]]; then
  delivery_vf="${shutter}scale=-2:${DELIVERY_HEIGHT}:flags=lanczos:in_range=full:out_range=tv,format=yuv420p"
else
  delivery_vf="${shutter}scale=in_range=full:out_range=tv:flags=lanczos,format=yuv420p"
fi
master_vf="${shutter}scale=in_range=full:out_range=tv:flags=lanczos,format=yuv420p10le"
meta=(-metadata "title=Kalmny - The Click" -metadata "encoder=Kalmny master pipeline (Remotion + ffmpeg)")

delivery_out="renders/${DELIVERY_NAME:-$name}.mp4"
echo "[$(date +%T)] H.264 delivery -> $delivery_out"
ffmpeg -v error -y -i "$parts/video.mp4" -i "$parts/audio.wav" -map 0:v -map 1:a \
  -vf "$delivery_vf" -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:v libx264 -preset "${PRESET:-veryslow}" -crf "${CRF:-15}" -profile:v high -level:v 6.1 -r 60 \
  -af "$afilter" -c:a aac -b:a 320k "${meta[@]}" -movflags +faststart -shortest "$delivery_out"

if [[ "${MASTER:-1}" != "0" ]]; then
  echo "[$(date +%T)] HEVC 10-bit master -> renders/$name-master.mp4"
  ffmpeg -v error -y -i "$parts/video.mp4" -i "$parts/audio.wav" -map 0:v -map 1:a \
    -vf "$master_vf" -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
    -c:v libx265 -preset "${PRESET_MASTER:-slow}" -crf "${CRF_MASTER:-14}" -tag:v hvc1 \
    -x265-params "colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited" -r 60 \
    -af "$afilter" -c:a aac -b:a 320k "${meta[@]}" -movflags +faststart -shortest "renders/$name-master.mp4"
fi

echo "[$(date +%T)] done"
ls -lh "$delivery_out" "renders/$name-master.mp4" 2>/dev/null || ls -lh "$delivery_out"
if command -v ffprobe >/dev/null; then
  for f in "$delivery_out" "renders/$name-master.mp4"; do
    [[ -s "$f" ]] && ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,color_space -of compact "$f" || true
  done
fi
