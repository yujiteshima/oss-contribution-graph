import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateGridData } from '../../src/svg/grid.js';

describe('generateGridData', () => {
  beforeEach(() => {
    // Mock current date to 2024-06-15 (Saturday)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const organizations = [
    { name: 'rails', color: '#CC0000', label: 'Rails' },
    { name: 'hotwired', color: '#1a1a1a', label: 'Hotwire' },
  ];

  it('returns array of weeks', () => {
    const contributionData = { rails: {}, hotwired: {} };
    const result = generateGridData(contributionData, organizations, 1);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('each week has 7 days', () => {
    const contributionData = { rails: {}, hotwired: {} };
    const result = generateGridData(contributionData, organizations, 1);
    result.forEach(week => {
      expect(week).toHaveLength(7);
    });
  });

  it('includes contribution data for matching dates', () => {
    const contributionData = {
      rails: { '2024-06-10': 5 },
      hotwired: {},
    };
    const result = generateGridData(contributionData, organizations, 1);

    // Find the day with contributions
    let foundDay = null;
    result.forEach(week => {
      week.forEach(day => {
        if (day && day.date === '2024-06-10') {
          foundDay = day;
        }
      });
    });

    expect(foundDay).not.toBeNull();
    expect(foundDay.contributions.rails).toBe(5);
    expect(foundDay.total).toBe(5);
  });

  it('calculates total from multiple orgs', () => {
    const contributionData = {
      rails: { '2024-06-10': 3 },
      hotwired: { '2024-06-10': 2 },
    };
    const result = generateGridData(contributionData, organizations, 1);

    let foundDay = null;
    result.forEach(week => {
      week.forEach(day => {
        if (day && day.date === '2024-06-10') {
          foundDay = day;
        }
      });
    });

    expect(foundDay.contributions.rails).toBe(3);
    expect(foundDay.contributions.hotwired).toBe(2);
    expect(foundDay.total).toBe(5);
  });

  it('does not include zero contributions in day.contributions', () => {
    const contributionData = {
      rails: { '2024-06-10': 0 },
      hotwired: { '2024-06-10': 3 },
    };
    const result = generateGridData(contributionData, organizations, 1);

    let foundDay = null;
    result.forEach(week => {
      week.forEach(day => {
        if (day && day.date === '2024-06-10') {
          foundDay = day;
        }
      });
    });

    expect(foundDay.contributions.rails).toBeUndefined();
    expect(foundDay.contributions.hotwired).toBe(3);
  });

  it('returns more weeks for longer periods', () => {
    const contributionData = { rails: {}, hotwired: {} };
    const result1Month = generateGridData(contributionData, organizations, 1);
    const result6Months = generateGridData(contributionData, organizations, 6);
    const result12Months = generateGridData(contributionData, organizations, 12);

    expect(result6Months.length).toBeGreaterThan(result1Month.length);
    expect(result12Months.length).toBeGreaterThan(result6Months.length);
  });

  it('pads incomplete weeks with null', () => {
    const contributionData = { rails: {}, hotwired: {} };
    const result = generateGridData(contributionData, organizations, 1);

    // First or last week might have null padding
    const hasNullPadding = result.some(week =>
      week.some(day => day === null)
    );
    expect(hasNullPadding).toBe(true);
  });
});
