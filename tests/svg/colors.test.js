import { describe, it, expect } from 'vitest';
import { hexToRgb, getCellFill, generateGradients, getCellFillWithGradient } from '../../src/svg/colors.js';

describe('hexToRgb', () => {
  it('converts #FF0000 to red', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('converts #00FF00 to green', () => {
    expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('converts #0000FF to blue', () => {
    expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('converts without # prefix', () => {
    expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('handles lowercase', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('handles mixed case', () => {
    expect(hexToRgb('#Ff00fF')).toEqual({ r: 255, g: 0, b: 255 });
  });

  it('returns black for invalid input', () => {
    expect(hexToRgb('invalid')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('returns black for empty string', () => {
    expect(hexToRgb('')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('converts #CC0000 correctly', () => {
    expect(hexToRgb('#CC0000')).toEqual({ r: 204, g: 0, b: 0 });
  });
});

describe('getCellFill', () => {
  const organizations = [
    { name: 'rails', color: '#CC0000', label: 'Rails' },
    { name: 'hotwired', color: '#1a1a1a', label: 'Hotwire' },
  ];

  it('returns gray for null day', () => {
    expect(getCellFill(null, organizations)).toBe('#ebedf0');
  });

  it('returns gray for day with zero total', () => {
    const day = { contributions: {}, total: 0 };
    expect(getCellFill(day, organizations)).toBe('#ebedf0');
  });

  it('returns org color for single org contribution', () => {
    const day = { contributions: { rails: 3 }, total: 3 };
    expect(getCellFill(day, organizations)).toBe('#CC0000');
  });

  it('returns blended color for multiple org contributions', () => {
    const day = { contributions: { rails: 2, hotwired: 1 }, total: 3 };
    const result = getCellFill(day, organizations);
    // Blended color should be an rgb string
    expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/);
  });

  it('returns default green for unknown org', () => {
    const day = { contributions: { unknown: 1 }, total: 1 };
    expect(getCellFill(day, organizations)).toBe('#39d353');
  });
});

describe('generateGradients', () => {
  const organizations = [
    { name: 'rails', color: '#CC0000', label: 'Rails' },
    { name: 'hotwired', color: '#1a1a1a', label: 'Hotwire' },
  ];

  it('returns empty gradient for single org days', () => {
    const gridData = [
      [{ contributions: { rails: 1 }, total: 1 }],
    ];
    const { gradientDefs, gradientMap } = generateGradients(gridData, organizations);
    expect(gradientDefs).toBe('');
    expect(gradientMap.size).toBe(0);
  });

  it('generates gradient for multi-org days', () => {
    const gridData = [
      [{ contributions: { rails: 1, hotwired: 1 }, total: 2 }],
    ];
    const { gradientDefs, gradientMap } = generateGradients(gridData, organizations);
    expect(gradientDefs).toContain('linearGradient');
    expect(gradientMap.size).toBe(1);
  });

  it('reuses gradient for same org combination', () => {
    const gridData = [
      [
        { contributions: { rails: 1, hotwired: 1 }, total: 2 },
        { contributions: { rails: 2, hotwired: 2 }, total: 4 },
      ],
    ];
    const { gradientMap } = generateGradients(gridData, organizations);
    expect(gradientMap.size).toBe(1);
  });
});

describe('getCellFillWithGradient', () => {
  const organizations = [
    { name: 'rails', color: '#CC0000', label: 'Rails' },
    { name: 'hotwired', color: '#1a1a1a', label: 'Hotwire' },
  ];

  it('returns gray for null day', () => {
    const gradientMap = new Map();
    expect(getCellFillWithGradient(null, organizations, gradientMap)).toBe('#ebedf0');
  });

  it('returns org color for single org', () => {
    const gradientMap = new Map();
    const day = { contributions: { rails: 1 }, total: 1 };
    expect(getCellFillWithGradient(day, organizations, gradientMap)).toBe('#CC0000');
  });

  it('returns gradient url for multi-org day when gradient exists', () => {
    const gradientMap = new Map([['hotwired-rails', 'grad-0']]);
    const day = { contributions: { rails: 1, hotwired: 1 }, total: 2 };
    expect(getCellFillWithGradient(day, organizations, gradientMap)).toBe('url(#grad-0)');
  });
});
