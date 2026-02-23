// Parse URL parameters

import { getOrganizationPreset, getOrganizationName, getAutoDetectColor } from '../presets/organizations.js';

// Default color for organizations without a preset
const DEFAULT_COLOR = '#39d353';

/**
 * Parse and validate format parameter
 * @param {string} formatParam - Format parameter from URL (svg or png)
 * @returns {string} Validated format ('svg' or 'png')
 */
export function parseFormat(formatParam) {
  const format = (formatParam || 'svg').toLowerCase();
  return format === 'png' ? 'png' : 'svg';
}

/**
 * Parse organizations parameter
 * Supports three formats:
 * 1. Preset only: "rails,vuejs,kubernetes"
 * 2. Full specification: "rails:CC0000:Rails,custom:FFFFFF:Custom Org"
 * 3. Mixed: "rails,custom:FFFFFF:Custom Org"
 *
 * @param {string} orgsParam - Organizations parameter from URL
 * @returns {Array<{name: string, color: string, label: string}>}
 */
export function parseOrgs(orgsParam) {
  if (!orgsParam) {
    // Default values for demo purposes
    // Users can override by specifying their own orgs parameter
    return [
      { name: 'rails', color: '#CC0000', label: 'Rails' },
      { name: 'hotwired', color: '#1a1a1a', label: 'Hotwire' },
    ];
  }

  return orgsParam.split(',').map(org => {
    const parts = org.split(':');
    const inputName = parts[0].trim();

    // Check if explicit format is used (has colons)
    // Format: name:color:label or name::label or name:color
    if (parts.length >= 2) {
      const colorPart = parts[1]?.trim();
      const labelPart = parts[2]?.trim();

      // Determine color: use explicit if provided, else try preset, else default
      let color = DEFAULT_COLOR;
      if (colorPart) {
        color = `#${colorPart}`;
      } else {
        const preset = getOrganizationPreset(inputName);
        color = preset?.color || DEFAULT_COLOR;
      }

      // Determine label: use explicit if provided, else use name
      const label = labelPart || inputName;

      return { name: inputName, color, label };
    }

    // Preset only (no colons): try to resolve from presets
    const preset = getOrganizationPreset(inputName);
    const actualOrgName = getOrganizationName(inputName);

    if (preset) {
      return {
        name: actualOrgName,
        color: preset.color,
        label: preset.label
      };
    }

    // No preset found, use defaults
    return {
      name: inputName,
      color: DEFAULT_COLOR,
      label: inputName
    };
  });
}

/**
 * Parse the auto parameter
 * @param {string} autoParam - 'true' or undefined
 * @returns {boolean}
 */
export function parseAuto(autoParam) {
  return autoParam === 'true';
}

/**
 * Parse the exclude parameter (comma-separated org names to exclude)
 * @param {string} excludeParam - e.g., 'my-company,another-org'
 * @returns {string[]}
 */
export function parseExclude(excludeParam) {
  if (!excludeParam) return [];
  return excludeParam.split(',').map(name => name.trim().toLowerCase()).filter(Boolean);
}

/**
 * Build the final organizations array by merging auto-detected and manual orgs.
 * Manual orgs take precedence over detected orgs with the same name.
 *
 * @param {Array<{login: string, id: string, totalContributions: number}>} detectedOrgs
 * @param {Array<{name: string, color: string, label: string}>} manualOrgs
 * @param {string[]} excludeList
 * @returns {Array<{name: string, color: string, label: string, id?: string}>}
 */
export function buildOrganizations(detectedOrgs, manualOrgs, excludeList) {
  const result = [];
  const seen = new Set();

  // Manual orgs first (take precedence)
  for (const org of manualOrgs) {
    seen.add(org.name.toLowerCase());
    result.push(org);
  }

  // Auto-detected orgs (skip duplicates and excluded)
  let paletteIndex = 0;
  for (const detected of detectedOrgs) {
    const login = detected.login.toLowerCase();

    if (seen.has(login)) continue;
    if (excludeList.includes(login)) continue;

    const { color, label } = getAutoDetectColor(detected.login, paletteIndex);
    if (!getOrganizationPreset(detected.login)) paletteIndex++;

    seen.add(login);
    result.push({
      name: detected.login,
      color,
      label,
      id: detected.id,
    });
  }

  return result;
}
