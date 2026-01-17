import { describe, it, expect } from 'vitest';
import { parseOrgs, parseFormat } from '../../src/utils/params.js';

describe('parseFormat', () => {
  it('returns svg as default when param is undefined', () => {
    expect(parseFormat(undefined)).toBe('svg');
  });

  it('returns svg as default when param is empty string', () => {
    expect(parseFormat('')).toBe('svg');
  });

  it('returns svg when param is svg', () => {
    expect(parseFormat('svg')).toBe('svg');
  });

  it('returns png when param is png', () => {
    expect(parseFormat('png')).toBe('png');
  });

  it('handles uppercase PNG', () => {
    expect(parseFormat('PNG')).toBe('png');
  });

  it('handles mixed case Svg', () => {
    expect(parseFormat('Svg')).toBe('svg');
  });

  it('returns svg for unknown formats', () => {
    expect(parseFormat('jpg')).toBe('svg');
    expect(parseFormat('gif')).toBe('svg');
  });
});

describe('parseOrgs', () => {
  it('returns default orgs when param is undefined', () => {
    const result = parseOrgs(undefined);
    expect(result).toEqual([
      { name: 'rails', color: '#CC0000', label: 'Rails' },
      { name: 'hotwired', color: '#1a1a1a', label: 'Hotwire' },
    ]);
  });

  it('returns default orgs when param is empty string', () => {
    const result = parseOrgs('');
    expect(result).toEqual([
      { name: 'rails', color: '#CC0000', label: 'Rails' },
      { name: 'hotwired', color: '#1a1a1a', label: 'Hotwire' },
    ]);
  });

  it('parses single org correctly', () => {
    const result = parseOrgs('vuejs:42b883:Vue');
    expect(result).toEqual([
      { name: 'vuejs', color: '#42b883', label: 'Vue' },
    ]);
  });

  it('parses multiple orgs correctly', () => {
    const result = parseOrgs('rails:CC0000:Rails,hotwired:1a1a1a:Hotwire');
    expect(result).toEqual([
      { name: 'rails', color: '#CC0000', label: 'Rails' },
      { name: 'hotwired', color: '#1a1a1a', label: 'Hotwire' },
    ]);
  });

  it('handles missing color (uses default green)', () => {
    const result = parseOrgs('myorg::MyOrg');
    expect(result).toEqual([
      { name: 'myorg', color: '#39d353', label: 'MyOrg' },
    ]);
  });

  it('handles missing label (uses name as label)', () => {
    const result = parseOrgs('vuejs:42b883');
    expect(result).toEqual([
      { name: 'vuejs', color: '#42b883', label: 'vuejs' },
    ]);
  });

  it('handles org with only name', () => {
    const result = parseOrgs('vuejs');
    expect(result).toEqual([
      { name: 'vuejs', color: '#39d353', label: 'vuejs' },
    ]);
  });

  it('trims whitespace from values', () => {
    const result = parseOrgs(' vuejs : 42b883 : Vue ');
    expect(result).toEqual([
      { name: 'vuejs', color: '#42b883', label: 'Vue' },
    ]);
  });

  it('parses three orgs correctly', () => {
    const result = parseOrgs('rails:CC0000:Rails,hotwired:1a1a1a:Hotwire,honojs:E36002:Hono');
    expect(result).toHaveLength(3);
    expect(result[2]).toEqual({ name: 'honojs', color: '#E36002', label: 'Hono' });
  });
});
