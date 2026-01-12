import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDateRange, getCellSize } from '../../src/utils/date.js';

describe('getDateRange', () => {
  beforeEach(() => {
    // Mock current date to 2024-06-15
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns correct range for 6 months', () => {
    const { from, to } = getDateRange(6);
    expect(to.toISOString().split('T')[0]).toBe('2024-06-15');
    expect(from.toISOString().split('T')[0]).toBe('2023-12-15');
  });

  it('returns correct range for 1 month', () => {
    const { from, to } = getDateRange(1);
    expect(to.toISOString().split('T')[0]).toBe('2024-06-15');
    expect(from.toISOString().split('T')[0]).toBe('2024-05-15');
  });

  it('returns correct range for 12 months', () => {
    const { from, to } = getDateRange(12);
    expect(to.toISOString().split('T')[0]).toBe('2024-06-15');
    expect(from.toISOString().split('T')[0]).toBe('2023-06-15');
  });

  it('returns correct range for 3 months', () => {
    const { from, to } = getDateRange(3);
    expect(to.toISOString().split('T')[0]).toBe('2024-06-15');
    expect(from.toISOString().split('T')[0]).toBe('2024-03-15');
  });
});

describe('getCellSize', () => {
  it('returns 12 for 1 month', () => {
    expect(getCellSize(1)).toBe(12);
  });

  it('returns 12 for 3 months', () => {
    expect(getCellSize(3)).toBe(12);
  });

  it('returns 10 for 4 months', () => {
    expect(getCellSize(4)).toBe(10);
  });

  it('returns 10 for 6 months', () => {
    expect(getCellSize(6)).toBe(10);
  });

  it('returns 7 for 7 months', () => {
    expect(getCellSize(7)).toBe(7);
  });

  it('returns 7 for 12 months', () => {
    expect(getCellSize(12)).toBe(7);
  });
});
