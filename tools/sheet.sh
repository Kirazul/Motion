#!/usr/bin/env bash
# Contact sheet of rendered stills (png or jpeg), tiles labelled 0..n-1 in order:
#   tools/sheet.sh <dir> <out.png> [cols] [tile_width]
set -euo pipefail
dir="$1"; out="$2"; cols="${3:-4}"; tw="${4:-360}"
n=$(ls "$dir" | grep -Ec '\.(png|jpe?g)$')
rows=$(( (n + cols - 1) / cols ))
ffmpeg -v error -y -pattern_type glob -i "$dir/*.$(ls "$dir" | grep -Eo "(png|jpe?g)$" | head -1)" \
  -vf "scale=${tw}:-1,drawtext=text='%{n}':x=10:y=10:fontsize=26:fontcolor=yellow,tile=${cols}x${rows}:padding=4:color=0x333333" \
  -frames:v 1 "$out"
