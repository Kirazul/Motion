// Local fonts (OFL): Inter variable with optical size, IBM Plex Sans Arabic.
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

const plex = [300, 400, 500, 600, 700].map((wt) =>
  loadFont({
    family: 'PlexArabic',
    url: staticFile(`fonts/ibm-plex-sans-arabic-arabic-${wt}-normal.woff2`),
    weight: String(wt),
  }),
);

export const fontsReady = Promise.all([
  loadFont({family: 'InterX', url: staticFile('fonts/inter-latin-opsz-normal.woff2'), weight: '100 900'}),
  loadFont({family: 'InterX', url: staticFile('fonts/inter-latin-ext-opsz-normal.woff2'), weight: '100 900'}),
  ...plex,
]);
