// Render settings for every composition. No machine paths: point Remotion at a
// local Chromium with the REMOTION_BROWSER env var when it cannot download one.
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(96);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(14);
Config.setPixelFormat('yuv420p');
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
