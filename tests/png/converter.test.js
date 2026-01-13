import { describe, it, expect } from 'vitest';
import { convertSvgToPng } from '../../src/png/converter.js';

describe('convertSvgToPng', () => {
  const simpleSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100" height="100" fill="#ff0000"/>
    </svg>
  `;

  it('converts simple SVG to PNG buffer', () => {
    const result = convertSvgToPng(simpleSvg);
    expect(result).toBeInstanceOf(Buffer);
    // PNG magic bytes: 89 50 4E 47 (hex for .PNG)
    expect(result[0]).toBe(0x89);
    expect(result[1]).toBe(0x50);
    expect(result[2]).toBe(0x4e);
    expect(result[3]).toBe(0x47);
  });

  it('respects scale option', () => {
    const result1x = convertSvgToPng(simpleSvg, { scale: 1 });
    const result2x = convertSvgToPng(simpleSvg, { scale: 2 });
    // Both should be valid PNGs
    expect(result1x[0]).toBe(0x89);
    expect(result2x[0]).toBe(0x89);
    // Scale 2 should produce different (typically larger or equal) output
    expect(result2x.length).toBeGreaterThanOrEqual(result1x.length);
  });

  it('handles SVG with text elements', () => {
    const svgWithText = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="50">
        <text x="10" y="30" font-size="14">Hello World</text>
      </svg>
    `;
    const result = convertSvgToPng(svgWithText);
    expect(result).toBeInstanceOf(Buffer);
    expect(result[0]).toBe(0x89);
  });

  it('handles SVG with gradients', () => {
    const svgWithGradient = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff0000"/>
            <stop offset="100%" style="stop-color:#0000ff"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grad1)"/>
      </svg>
    `;
    const result = convertSvgToPng(svgWithGradient);
    expect(result).toBeInstanceOf(Buffer);
    expect(result[0]).toBe(0x89);
  });

  it('uses default scale of 2', () => {
    const result = convertSvgToPng(simpleSvg);
    const result2x = convertSvgToPng(simpleSvg, { scale: 2 });
    // Default should be same as explicit scale: 2
    expect(result.length).toBe(result2x.length);
  });
});
