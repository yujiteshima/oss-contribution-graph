// SVG to PNG conversion using resvg-js
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load font once at module initialization
const fontPath = join(__dirname, 'fonts', 'NotoSans-Regular.ttf');
const fontBuffer = readFileSync(fontPath);

/**
 * Convert SVG string to PNG buffer
 * @param {string} svgString - The SVG content to convert
 * @param {Object} options - Conversion options
 * @param {number} [options.scale=2] - Scale factor for higher resolution
 * @returns {Buffer} PNG image as Buffer
 */
export function convertSvgToPng(svgString, options = {}) {
  const { scale = 2 } = options;

  const resvg = new Resvg(svgString, {
    font: {
      fontBuffers: [fontBuffer],
      loadSystemFonts: false,
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
