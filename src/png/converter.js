import { Resvg } from '@resvg/resvg-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Font paths to try (Vercel serverless uses process.cwd(), local uses __dirname)
// See: https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions
const fontPaths = [
  join(process.cwd(), 'src', 'png', 'fonts', 'NotoSans-Regular.ttf'),
];

let fontData = null;

function loadFont() {
  if (!fontData) {
    for (const fontPath of fontPaths) {
      if (existsSync(fontPath)) {
        fontData = readFileSync(fontPath);
        break;
      }
    }
    if (!fontData) {
      console.error('Font file not found in:', fontPaths);
    }
  }
  return fontData;
}

/**
 * Convert SVG string to PNG buffer
 * @param {string} svg - SVG string to convert
 * @param {number} scale - Scale factor for output (default: 2 for higher resolution)
 * @returns {Buffer} PNG image buffer
 */
export function convertSvgToPng(svg, scale = 2) {
  const font = loadFont();

  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: [font],
      defaultFontFamily: 'Noto Sans',
    },
    fitTo: {
      mode: 'zoom',
      value: scale,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
