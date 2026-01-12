import { getDateRange } from '../utils/date.js';

// Generate demo data
export function generateDemoData(organizations, months) {
  const { from, to } = getDateRange(months);
  const data = {};

  organizations.forEach(org => {
    data[org.name] = {};
    const current = new Date(from);
    while (current <= to) {
      const dateStr = current.toISOString().split('T')[0];
      // Random contributions (15% probability)
      data[org.name][dateStr] = Math.random() > 0.85 ? Math.floor(Math.random() * 5) + 1 : 0;
      current.setDate(current.getDate() + 1);
    }
  });

  return data;
}
