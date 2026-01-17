import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load font file once at module initialization
const fontPath = join(__dirname, 'fonts', 'NotoSans-Regular.ttf');
let fontData = null;

function loadFont() {
  if (!fontData) {
    fontData = readFileSync(fontPath);
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
