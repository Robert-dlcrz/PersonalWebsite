import { describe, expect, it, vi } from 'vitest';

import { coerceDate, formatDateForDisplay } from '@/utils/dateUtils';

describe('coerceDate', () => {
  it('normalizes a Date to YYYY-MM-DD', () => {
    // given
    const value = new Date('2026-04-21T12:00:00.000Z');

    // when
    const result = coerceDate(value);

    // then
    expect(result).toBe('2026-04-21');
  });

  it('returns strings unchanged', () => {
    // given
    const value = '2026-04-21';

    // when
    const result = coerceDate(value);

    // then
    expect(result).toBe('2026-04-21');
  });

  it('throws for non-Date non-string values', () => {
    // given
    const notDateOrString = [123, null] as const;

    // when / then
    for (const value of notDateOrString) {
      expect(() => coerceDate(value)).toThrow('dateUtils.coerceDate');
    }
  });
});

describe('formatDateForDisplay', () => {
  it('returns input when string does not match YYYY-MM-DD', () => {
    // given
    const iso = 'not-iso';

    // when
    const result = formatDateForDisplay(iso);

    // then
    expect(result).toBe('not-iso');
  });

  it('returns input when month or day is out of numeric range', () => {
    // given
    const invalidMonth = '2026-00-15';
    const invalidDay = '2026-01-32';

    // when
    const monthResult = formatDateForDisplay(invalidMonth);
    const dayResult = formatDateForDisplay(invalidDay);

    // then
    expect(monthResult).toBe('2026-00-15');
    expect(dayResult).toBe('2026-01-32');
  });

  it('returns input when date components do not form a calendar day (rollover)', () => {
    // given
    const iso = '2026-02-31';

    // when
    const result = formatDateForDisplay(iso);

    // then
    expect(result).toBe('2026-02-31');
  });

  it('formats a valid ISO calendar date for en-US', () => {
    // given
    const iso = '2026-04-21';
    const expected = new Date(2026, 3, 21).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // when
    const result = formatDateForDisplay(iso);

    // then
    expect(result).toBe(expected);
  });

  it('returns iso when the Date time value is NaN (defensive branch)', () => {
    // given — rare for YYYY-MM-DD parsing, but guarded in production code
    const spy = vi.spyOn(Date.prototype, 'getTime').mockReturnValueOnce(NaN);

    // when
    const result = formatDateForDisplay('2026-04-21');

    // then
    expect(result).toBe('2026-04-21');
    spy.mockRestore();
  });
});
