// Convert hex color to RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Get cell background color
export function getCellFill(day, organizations) {
  if (!day || day.total === 0) return '#ebedf0';

  const orgs = Object.keys(day.contributions);
  if (orgs.length === 1) {
    const org = organizations.find(o => o.name === orgs[0]);
    return org?.color || '#39d353';
  }

  // For multiple orgs, blend colors
  // (SVG gradients are complex, so we use color mixing)
  const colors = orgs.map(orgName => {
    const org = organizations.find(o => o.name === orgName);
    return org?.color || '#39d353';
  });

  // Average two colors
  if (colors.length >= 2) {
    const rgb1 = hexToRgb(colors[0]);
    const rgb2 = hexToRgb(colors[1]);
    const mixed = {
      r: Math.round((rgb1.r + rgb2.r) / 2),
      g: Math.round((rgb1.g + rgb2.g) / 2),
      b: Math.round((rgb1.b + rgb2.b) / 2)
    };
    return `rgb(${mixed.r},${mixed.g},${mixed.b})`;
  }

  return colors[0];
}

// Generate gradient definitions (for multiple orgs)
export function generateGradients(gridData, organizations) {
  let gradientDefs = '';
  let gradientId = 0;
  const gradientMap = new Map();

  gridData.forEach((week) => {
    week.forEach((day) => {
      if (day && Object.keys(day.contributions).length > 1) {
        const orgs = Object.keys(day.contributions).sort();
        const key = orgs.join('-');
        if (!gradientMap.has(key)) {
          const colors = orgs.map(orgName => {
            const org = organizations.find(o => o.name === orgName);
            return org?.color || '#39d353';
          });
          const id = `grad-${gradientId++}`;
          gradientDefs += `
            <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="50%" style="stop-color:${colors[0]}" />
              <stop offset="50%" style="stop-color:${colors[1] || colors[0]}" />
            </linearGradient>
          `;
          gradientMap.set(key, id);
        }
      }
    });
  });

  return { gradientDefs, gradientMap };
}

// Get cell fill (with gradient support)
export function getCellFillWithGradient(day, organizations, gradientMap) {
  if (!day || day.total === 0) return '#ebedf0';

  const orgs = Object.keys(day.contributions).sort();
  if (orgs.length === 1) {
    const org = organizations.find(o => o.name === orgs[0]);
    return org?.color || '#39d353';
  }

  const key = orgs.join('-');
  if (gradientMap.has(key)) {
    return `url(#${gradientMap.get(key)})`;
  }

  return getCellFill(day, organizations);
}
