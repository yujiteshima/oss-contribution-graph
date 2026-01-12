import { getDateRange } from '../utils/date.js';

// Generate grid data
export function generateGridData(contributionData, organizations, months) {
  const { from, to } = getDateRange(months);
  const weeks = [];
  let currentWeek = [];
  const current = new Date(from);

  // Adjust week start to Sunday
  const startDay = current.getDay();
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }

  while (current <= to) {
    const dateStr = current.toISOString().split('T')[0];
    const contributions = {};

    organizations.forEach(org => {
      const count = contributionData[org.name]?.[dateStr] || 0;
      if (count > 0) {
        contributions[org.name] = count;
      }
    });

    currentWeek.push({
      date: dateStr,
      contributions,
      total: Object.values(contributions).reduce((a, b) => a + b, 0)
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    current.setDate(current.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}
