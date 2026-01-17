// Preset colors for major OSS organizations
// Colors sourced from official brand guidelines and logos

export const ORGANIZATION_PRESETS = {
  // JavaScript / Frontend
  vercel: { color: '#000000', label: 'Vercel' },
  facebook: { color: '#0081FB', label: 'Facebook' },
  react: { color: '#61DAFB', label: 'React', org: 'facebook' },
  vuejs: { color: '#42B883', label: 'Vue.js' },
  angular: { color: '#DD0031', label: 'Angular' },
  sveltejs: { color: '#FF3E00', label: 'Svelte' },
  nodejs: { color: '#339933', label: 'Node.js' },
  denoland: { color: '#000000', label: 'Deno' },
  htmx: { color: '#3366CC', label: 'htmx' },
  'bigskysoftware': { color: '#3366CC', label: 'htmx' },

  // Backend / Infrastructure
  rails: { color: '#CC0000', label: 'Rails' },
  django: { color: '#092E20', label: 'Django' },
  laravel: { color: '#FF2D20', label: 'Laravel' },
  spring: { color: '#6DB33F', label: 'Spring' },
  'spring-projects': { color: '#6DB33F', label: 'Spring' },
  fastapi: { color: '#009688', label: 'FastAPI' },
  tiangolo: { color: '#009688', label: 'FastAPI' },

  // Cloud / DevOps
  kubernetes: { color: '#326CE5', label: 'Kubernetes' },
  docker: { color: '#2496ED', label: 'Docker' },
  hashicorp: { color: '#000000', label: 'HashiCorp' },
  terraform: { color: '#7B42BC', label: 'Terraform', org: 'hashicorp' },

  // Languages
  'rust-lang': { color: '#DEA584', label: 'Rust' },
  golang: { color: '#00ADD8', label: 'Go' },
  python: { color: '#3776AB', label: 'Python' },
  ruby: { color: '#CC342D', label: 'Ruby' },
  'ruby-lang': { color: '#CC342D', label: 'Ruby' },
  elixir: { color: '#4B275F', label: 'Elixir' },
  'elixir-lang': { color: '#4B275F', label: 'Elixir' },

  // Big Tech
  microsoft: { color: '#00A4EF', label: 'Microsoft' },
  google: { color: '#4285F4', label: 'Google' },
  aws: { color: '#FF9900', label: 'AWS' },
  apple: { color: '#000000', label: 'Apple' },

  // AI / ML
  tensorflow: { color: '#FF6F00', label: 'TensorFlow' },
  pytorch: { color: '#EE4C2C', label: 'PyTorch' },
  huggingface: { color: '#FFD21E', label: 'Hugging Face' },
  openai: { color: '#412991', label: 'OpenAI' },

  // Scientific Computing / Computer Vision
  cupy: { color: '#46C0B6', label: 'CuPy' },
  opencv: { color: '#5C3EE8', label: 'OpenCV' },
  numpy: { color: '#013243', label: 'NumPy' },
  scipy: { color: '#8CAAE6', label: 'SciPy' },

  // Database
  postgresql: { color: '#4169E1', label: 'PostgreSQL' },
  mongodb: { color: '#47A248', label: 'MongoDB' },
  redis: { color: '#DC382D', label: 'Redis' },

  // Tools
  github: { color: '#181717', label: 'GitHub' },
  gitlab: { color: '#FC6D26', label: 'GitLab' },
  jetbrains: { color: '#000000', label: 'JetBrains' },

  // Hotwire ecosystem
  hotwired: { color: '#1a1a1a', label: 'Hotwire' },
};

// Alias mappings (alternative names pointing to the same preset)
export const ORGANIZATION_ALIASES = {
  fb: 'facebook',
  reactjs: 'react',
  vue: 'vuejs',
  node: 'nodejs',
  deno: 'denoland',
  rust: 'rust-lang',
  go: 'golang',
  py: 'python',
  rb: 'ruby',
  k8s: 'kubernetes',
  tf: 'terraform',
  hf: 'huggingface',
  pg: 'postgresql',
  mongo: 'mongodb',
  cv: 'opencv',
  'opencv-python': 'opencv',
};

/**
 * Get preset configuration for an organization
 * @param {string} name - Organization name or alias
 * @returns {{ color: string, label: string, org?: string } | null}
 */
export function getOrganizationPreset(name) {
  const normalizedName = name.toLowerCase();

  // Check aliases first
  const aliasTarget = ORGANIZATION_ALIASES[normalizedName];
  if (aliasTarget) {
    return ORGANIZATION_PRESETS[aliasTarget] || null;
  }

  return ORGANIZATION_PRESETS[normalizedName] || null;
}

/**
 * Get the actual GitHub organization name for a preset
 * Some presets (like 'react') map to a different org ('facebook')
 * @param {string} name - Preset name
 * @returns {string} GitHub organization name
 */
export function getOrganizationName(name) {
  const preset = getOrganizationPreset(name);
  if (preset?.org) {
    return preset.org;
  }

  // Resolve alias to canonical name
  const normalizedName = name.toLowerCase();
  const aliasTarget = ORGANIZATION_ALIASES[normalizedName];

  return aliasTarget || normalizedName;
}
