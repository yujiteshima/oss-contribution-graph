// SVG to PNG conversion using resvg-js
import { Resvg } from '@resvg/resvg-js';

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
    fitTo: {
      mode: 'zoom',
      value: scale,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
