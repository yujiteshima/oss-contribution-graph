import { describe, it, expect } from 'vitest';
import { convertSvgToPng } from '../../src/png/converter.js';

describe('convertSvgToPng', () => {
  it('returns a buffer with PNG magic bytes', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="red" width="100" height="100"/></svg>';
    const png = convertSvgToPng(svg);

    expect(Buffer.isBuffer(png)).toBe(true);
    expect(png[0]).toBe(0x89);
    expect(png[1]).toBe(0x50); // P
    expect(png[2]).toBe(0x4e); // N
    expect(png[3]).toBe(0x47); // G
  });

  it('renders text correctly with loaded font', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50">
      <text x="10" y="30" font-size="20" fill="black">Hello World</text>
    </svg>`;
    const png = convertSvgToPng(svg);

    expect(Buffer.isBuffer(png)).toBe(true);
    expect(png.length).toBeGreaterThan(100);
  });

  it('applies scale factor without error', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="blue" width="100" height="100"/></svg>';
    const png1x = convertSvgToPng(svg, 1);
    const png2x = convertSvgToPng(svg, 2);

    expect(Buffer.isBuffer(png1x)).toBe(true);
    expect(Buffer.isBuffer(png2x)).toBe(true);
  });

  it('handles complex SVG with gradients', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect fill="url(#grad1)" width="100" height="100"/>
    </svg>`;
    const png = convertSvgToPng(svg);

    expect(Buffer.isBuffer(png)).toBe(true);
  });
});
