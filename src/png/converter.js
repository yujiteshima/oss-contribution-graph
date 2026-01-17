import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fontPath = join(__dirname, 'fonts', 'NotoSans-Regular.ttf');

/**
 * Convert SVG string to PNG buffer
 * @param {string} svg - SVG string to convert
 * @param {number} scale - Scale factor for output (default: 2 for higher resolution)
 * @returns {Buffer} PNG image buffer
 */
export function convertSvgToPng(svg, scale = 2) {
  const resvg = new Resvg(svg, {
    font: {
      fontFiles: [fontPath],
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
