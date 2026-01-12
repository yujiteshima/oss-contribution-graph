// Calculate date range
export function getDateRange(months) {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  return { from, to };
}

// Calculate cell size based on display period
export function getCellSize(months) {
  if (months <= 3) return 12;
  if (months <= 6) return 10;
  return 7;
}
