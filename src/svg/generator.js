import { getDateRange, getCellSize } from '../utils/date.js';
import { generateGradients, getCellFillWithGradient } from './colors.js';

// Generate SVG
export function generateSVG(gridData, organizations, months, username) {
  const cellSize = getCellSize(months);
  const gap = 2;
  const weeks = gridData.length;
  const padding = 40;
  const legendHeight = 30;
  const titleHeight = 25;
  const monthLabelHeight = 20;

  const width = padding + weeks * (cellSize + gap) + padding;
  const height = titleHeight + monthLabelHeight + 7 * (cellSize + gap) + legendHeight + 10;

  // Calculate month labels
  const monthLabels = [];
  const { from } = getDateRange(months);
  let lastMonth = -1;

  gridData.forEach((week, weekIdx) => {
    const firstDay = week.find(d => d !== null);
    if (firstDay) {
      const date = new Date(firstDay.date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          x: padding + weekIdx * (cellSize + gap)
        });
        lastMonth = month;
      }
    }
  });

  // Generate gradient definitions (for multiple orgs)
  const { gradientDefs, gradientMap } = generateGradients(gridData, organizations);

  // Generate cells
  const gridTop = titleHeight + monthLabelHeight;
  let cells = '';
  gridData.forEach((week, weekIdx) => {
    week.forEach((day, dayIdx) => {
      const x = padding + weekIdx * (cellSize + gap);
      const y = gridTop + dayIdx * (cellSize + gap);
      const fill = day ? getCellFillWithGradient(day, organizations, gradientMap) : '#ebedf0';
      const opacity = day ? 1 : 0.3;

      cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${fill}" opacity="${opacity}">`;
      if (day && day.total > 0) {
        const tooltip = Object.entries(day.contributions)
          .map(([org, count]) => `${organizations.find(o => o.name === org)?.label || org}: ${count}`)
          .join(', ');
        cells += `<title>${day.date}: ${tooltip}</title>`;
      }
      cells += `</rect>`;
    });
  });

  // Generate legend
  let legend = '';
  let legendX = padding;
  const legendY = gridTop + 7 * (cellSize + gap) + 10;
  organizations.forEach((org) => {
    legend += `
      <rect x="${legendX}" y="${legendY}" width="12" height="12" rx="2" fill="${org.color}" />
      <text x="${legendX + 16}" y="${legendY + 10}" font-size="10" fill="#666">${org.label || org.name}</text>
    `;
    legendX += (org.label || org.name).length * 7 + 30;
  });

  // Generate month labels
  let monthLabelsStr = '';
  monthLabels.forEach(label => {
    monthLabelsStr += `<text x="${label.x}" y="${titleHeight + monthLabelHeight - 5}" font-size="10" fill="#666">${label.name}</text>`;
  });

  // Day labels
  const dayLabels = `
    <text x="${padding - 5}" y="${gridTop + 1 * (cellSize + gap) + cellSize/2 + 3}" font-size="9" fill="#666" text-anchor="end">Mon</text>
    <text x="${padding - 5}" y="${gridTop + 3 * (cellSize + gap) + cellSize/2 + 3}" font-size="9" fill="#666" text-anchor="end">Wed</text>
    <text x="${padding - 5}" y="${gridTop + 5 * (cellSize + gap) + cellSize/2 + 3}" font-size="9" fill="#666" text-anchor="end">Fri</text>
  `;

  // Title
  const title = `<text x="${padding}" y="18" font-size="14" font-weight="bold" fill="#333">🌈 OSS Contributions - ${username}</text>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    rect { transition: opacity 0.1s; }
    rect:hover { opacity: 0.8 !important; }
  </style>
  <defs>
    ${gradientDefs}
  </defs>
  <rect width="100%" height="100%" fill="#ffffff" rx="6" />
  ${title}
  ${monthLabelsStr}
  ${dayLabels}
  ${cells}
  ${legend}
</svg>
  `.trim();
}
