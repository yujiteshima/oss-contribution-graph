import { describe, it, expect } from 'vitest';
import {
  ORGANIZATION_PRESETS,
  ORGANIZATION_ALIASES,
  AUTO_DETECT_PALETTE,
  getOrganizationPreset,
  getOrganizationName,
  getAutoDetectColor,
} from '../../src/presets/organizations.js';

describe('ORGANIZATION_PRESETS', () => {
  it('contains expected major organizations', () => {
    expect(ORGANIZATION_PRESETS.vercel).toBeDefined();
    expect(ORGANIZATION_PRESETS.vuejs).toBeDefined();
    expect(ORGANIZATION_PRESETS.kubernetes).toBeDefined();
    expect(ORGANIZATION_PRESETS.rails).toBeDefined();
  });

  it('has valid color format for all presets', () => {
    for (const [name, preset] of Object.entries(ORGANIZATION_PRESETS)) {
      expect(preset.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(preset.label).toBeTruthy();
    }
  });
});

describe('getOrganizationPreset', () => {
  it('returns preset for known organization', () => {
    const preset = getOrganizationPreset('vuejs');
    expect(preset).toEqual({ color: '#42B883', label: 'Vue.js' });
  });

  it('returns preset for organization with org mapping', () => {
    const preset = getOrganizationPreset('react');
    expect(preset).toEqual({ color: '#61DAFB', label: 'React', org: 'facebook' });
  });

  it('returns null for unknown organization', () => {
    const preset = getOrganizationPreset('unknown-org');
    expect(preset).toBeNull();
  });

  it('resolves alias to preset', () => {
    const preset = getOrganizationPreset('k8s');
    expect(preset).toEqual({ color: '#326CE5', label: 'Kubernetes' });
  });

  it('handles case insensitivity', () => {
    expect(getOrganizationPreset('VueJS')).toEqual({ color: '#42B883', label: 'Vue.js' });
    expect(getOrganizationPreset('KUBERNETES')).toEqual({ color: '#326CE5', label: 'Kubernetes' });
  });
});

describe('getOrganizationName', () => {
  it('returns same name for organization without mapping', () => {
    expect(getOrganizationName('vuejs')).toBe('vuejs');
    expect(getOrganizationName('kubernetes')).toBe('kubernetes');
  });

  it('returns mapped org name for presets with org property', () => {
    expect(getOrganizationName('react')).toBe('facebook');
    expect(getOrganizationName('terraform')).toBe('hashicorp');
    expect(getOrganizationName('htmx')).toBe('bigskysoftware');
  });

  it('resolves alias to canonical name', () => {
    expect(getOrganizationName('k8s')).toBe('kubernetes');
    expect(getOrganizationName('vue')).toBe('vuejs');
    expect(getOrganizationName('go')).toBe('golang');
  });

  it('returns input for unknown organization', () => {
    expect(getOrganizationName('unknown-org')).toBe('unknown-org');
  });

  it('handles case insensitivity', () => {
    expect(getOrganizationName('K8S')).toBe('kubernetes');
    expect(getOrganizationName('React')).toBe('facebook');
  });
});

describe('ORGANIZATION_ALIASES', () => {
  it('contains common aliases', () => {
    expect(ORGANIZATION_ALIASES.k8s).toBe('kubernetes');
    expect(ORGANIZATION_ALIASES.vue).toBe('vuejs');
    expect(ORGANIZATION_ALIASES.go).toBe('golang');
    expect(ORGANIZATION_ALIASES.rust).toBe('rust-lang');
  });
});

describe('AUTO_DETECT_PALETTE', () => {
  it('has at least 10 distinct colors', () => {
    expect(AUTO_DETECT_PALETTE.length).toBeGreaterThanOrEqual(10);
    const unique = new Set(AUTO_DETECT_PALETTE);
    expect(unique.size).toBe(AUTO_DETECT_PALETTE.length);
  });

  it('all colors are valid hex format', () => {
    for (const color of AUTO_DETECT_PALETTE) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('getAutoDetectColor', () => {
  it('returns preset color for known org', () => {
    const result = getAutoDetectColor('vuejs', 0);
    expect(result.color).toBe('#42B883');
    expect(result.label).toBe('Vue.js');
  });

  it('returns palette color for unknown org', () => {
    const result = getAutoDetectColor('unknown-org', 0);
    expect(result.color).toBe(AUTO_DETECT_PALETTE[0]);
    expect(result.label).toBe('unknown-org');
  });

  it('cycles palette for high index', () => {
    const result = getAutoDetectColor('unknown', AUTO_DETECT_PALETTE.length);
    expect(result.color).toBe(AUTO_DETECT_PALETTE[0]);
  });

  it('returns different palette colors for different indices', () => {
    const color0 = getAutoDetectColor('org-a', 0);
    const color1 = getAutoDetectColor('org-b', 1);
    expect(color0.color).not.toBe(color1.color);
  });
});
