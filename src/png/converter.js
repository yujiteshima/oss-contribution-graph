import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load and encode font as Base64 at module initialization
const fontPath = join(__dirname, 'fonts', 'NotoSans-Regular.ttf');
const fontBuffer = readFileSync(fontPath);
const fontBase64 = fontBuffer.toString('base64');

/**
 * Embed font directly into SVG using @font-face with Base64 data URL
 * This ensures the font travels with the SVG and works in any environment
 * @param {string} svg - SVG string
 * @returns {string} SVG with embedded font
 */
function embedFontInSvg(svg) {
  const fontFaceCss = `
    @font-face {
      font-family: 'Noto Sans';
      src: url(data:font/truetype;base64,${fontBase64}) format('truetype');
    }
    text { font-family: 'Noto Sans', sans-serif; }
  `;
  return svg.replace('<style>', `<style>${fontFaceCss}`);
}

/**
 * Convert SVG string to PNG buffer
 * @param {string} svg - SVG string to convert
 * @param {number} scale - Scale factor for output (default: 2 for higher resolution)
 * @returns {Buffer} PNG image buffer
 */
export function convertSvgToPng(svg, scale = 2) {
  const svgWithFont = embedFontInSvg(svg);

  const resvg = new Resvg(svgWithFont, {
    font: {
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
