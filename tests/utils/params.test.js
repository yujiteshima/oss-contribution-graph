import { describe, it, expect } from 'vitest';
import { parseOrgs, parseFormat, parseAuto, parseExclude, buildOrganizations } from '../../src/utils/params.js';

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

describe('parseAuto', () => {
  it('returns true when param is "true"', () => {
    expect(parseAuto('true')).toBe(true);
  });

  it('returns false when param is undefined', () => {
    expect(parseAuto(undefined)).toBe(false);
  });

  it('returns false for other values', () => {
    expect(parseAuto('false')).toBe(false);
    expect(parseAuto('1')).toBe(false);
    expect(parseAuto('')).toBe(false);
  });
});

describe('parseExclude', () => {
  it('returns empty array when param is undefined', () => {
    expect(parseExclude(undefined)).toEqual([]);
  });

  it('parses single exclude', () => {
    expect(parseExclude('my-company')).toEqual(['my-company']);
  });

  it('parses multiple excludes', () => {
    expect(parseExclude('my-company,another-org')).toEqual(['my-company', 'another-org']);
  });

  it('trims whitespace and lowercases', () => {
    expect(parseExclude(' MyCompany , AnotherOrg ')).toEqual(['mycompany', 'anotherorg']);
  });

  it('filters empty strings', () => {
    expect(parseExclude('a,,b')).toEqual(['a', 'b']);
  });
});

describe('buildOrganizations', () => {
  it('adds manual orgs first, then detected orgs', () => {
    const detected = [
      { login: 'vuejs', id: 'O_1', totalContributions: 20 },
      { login: 'rails', id: 'O_2', totalContributions: 10 },
    ];
    const manual = [{ name: 'kubernetes', color: '#326CE5', label: 'Kubernetes' }];
    const result = buildOrganizations(detected, manual, []);

    expect(result[0].name).toBe('kubernetes');
    expect(result[0].id).toBeUndefined();
    expect(result[1].name).toBe('vuejs');
    expect(result[1].id).toBe('O_1');
    expect(result[2].name).toBe('rails');
    expect(result[2].id).toBe('O_2');
  });

  it('manual orgs take precedence over detected orgs with same name', () => {
    const detected = [{ login: 'vuejs', id: 'O_1', totalContributions: 20 }];
    const manual = [{ name: 'vuejs', color: '#FF0000', label: 'Custom Vue' }];
    const result = buildOrganizations(detected, manual, []);

    expect(result).toHaveLength(1);
    expect(result[0].color).toBe('#FF0000');
    expect(result[0].label).toBe('Custom Vue');
  });

  it('excludes specified organizations', () => {
    const detected = [
      { login: 'vuejs', id: 'O_1', totalContributions: 20 },
      { login: 'my-company', id: 'O_2', totalContributions: 100 },
    ];
    const result = buildOrganizations(detected, [], ['my-company']);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('vuejs');
  });

  it('assigns preset color to detected orgs with presets', () => {
    const detected = [{ login: 'vuejs', id: 'O_1', totalContributions: 10 }];
    const result = buildOrganizations(detected, [], []);

    expect(result[0].color).toBe('#42B883');
    expect(result[0].label).toBe('Vue.js');
  });

  it('assigns palette color to detected orgs without presets', () => {
    const detected = [{ login: 'unknown-org', id: 'O_1', totalContributions: 10 }];
    const result = buildOrganizations(detected, [], []);

    expect(result[0].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(result[0].label).toBe('unknown-org');
  });

  it('returns empty array when no orgs', () => {
    expect(buildOrganizations([], [], [])).toEqual([]);
  });

  it('exclude is case insensitive', () => {
    const detected = [{ login: 'MyCompany', id: 'O_1', totalContributions: 50 }];
    const result = buildOrganizations(detected, [], ['mycompany']);

    expect(result).toHaveLength(0);
  });
});
