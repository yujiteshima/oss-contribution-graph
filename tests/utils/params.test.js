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

  it('handles org with only name (no preset)', () => {
    const result = parseOrgs('unknown-org');
    expect(result).toEqual([
      { name: 'unknown-org', color: '#39d353', label: 'unknown-org' },
    ]);
  });

  it('resolves preset color for known organization', () => {
    const result = parseOrgs('vuejs');
    expect(result).toEqual([
      { name: 'vuejs', color: '#42B883', label: 'Vue.js' },
    ]);
  });

  it('resolves preset color for kubernetes', () => {
    const result = parseOrgs('kubernetes');
    expect(result).toEqual([
      { name: 'kubernetes', color: '#326CE5', label: 'Kubernetes' },
    ]);
  });

  it('resolves alias to preset', () => {
    const result = parseOrgs('k8s');
    expect(result).toEqual([
      { name: 'kubernetes', color: '#326CE5', label: 'Kubernetes' },
    ]);
  });

  it('resolves react alias to facebook org', () => {
    const result = parseOrgs('react');
    expect(result).toEqual([
      { name: 'facebook', color: '#61DAFB', label: 'React' },
    ]);
  });

  it('resolves htmx to bigskysoftware org', () => {
    const result = parseOrgs('htmx');
    expect(result).toEqual([
      { name: 'bigskysoftware', color: '#3366CC', label: 'htmx' },
    ]);
  });

  it('allows explicit color to override preset', () => {
    const result = parseOrgs('vuejs:FF0000:Custom Vue');
    expect(result).toEqual([
      { name: 'vuejs', color: '#FF0000', label: 'Custom Vue' },
    ]);
  });

  it('supports mixed preset and explicit orgs', () => {
    const result = parseOrgs('rails,custom:FFFFFF:Custom Org,kubernetes');
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ name: 'rails', color: '#CC0000', label: 'Rails' });
    expect(result[1]).toEqual({ name: 'custom', color: '#FFFFFF', label: 'Custom Org' });
    expect(result[2]).toEqual({ name: 'kubernetes', color: '#326CE5', label: 'Kubernetes' });
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
