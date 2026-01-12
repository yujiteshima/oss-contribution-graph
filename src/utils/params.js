// Parse URL parameters
// Format: rails:CC0000:Rails,hotwired:1a1a1a:Hotwire
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
    const [name, color, label] = org.split(':');
    return {
      name: name.trim(),
      color: color ? `#${color.trim()}` : '#39d353',
      label: label?.trim() || name.trim()
    };
  });
}
