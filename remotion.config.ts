// Render settings for every composition. No machine paths: point Remotion at a
// local Chromium with the REMOTION_BROWSER env var when it cannot download one.
//
// Frames travel from the browser to the encoder as PNG: lossless, full chroma.
// JPEG screenshots are 4:2:0, which smears exactly this film's hardest content
// (red type on black, hairline UI rules, dark gradients) before the encoder
// ever sees it - at 4K that intermediate loss, not the codec, becomes the
// quality ceiling. For throwaway previews where speed beats fidelity:
//   REMOTION_IMAGE_FORMAT=jpeg npm run studio
import {Config} from '@remotion/cli/config';

if (process.env.REMOTION_IMAGE_FORMAT === 'jpeg') {
  Config.setVideoImageFormat('jpeg');
  Config.setJpegQuality(97);
} else {
  Config.setVideoImageFormat('png');
}
Config.setStillImageFormat('png');
Config.setOverwriteOutput(true);
// Deliverables are BT.709 (tools/render_final.sh also tags the final files).
Config.setColorSpace('bt709');
// codec / CRF are passed per render (tools/render_final.sh) so that audio-only
// passes (wav) are not handed video-only options.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
