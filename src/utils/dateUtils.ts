/**
 * The YAML parser may hand us a `Date` for `date` even when the markdown
 * “looks” like plain text (unquoted YAML dates). We normalize to a short
 * ISO date string so blog UI, `BlogPostRecord` typing, and props crossing the
 * server/client boundary always see a single string shape.
 */
export function coerceDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string') {
    return value;
  }
  throw new Error('dateUtils.coerceDate: frontmatter `date` must be a Date or string');
}

/**
 * Turn a `YYYY-MM-DD` string into a readable label like `April 21, 2026` using a
 * local-calendar `Date` and `toLocaleDateString('en-US', …)` (long English month,
 * numeric day and year). Invalid or non-calendar dates (e.g. rolled-over
 * components) return `iso` unchanged.
 */
export function formatDateForDisplay(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return iso;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const monthIndex = month - 1;
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) {
    return iso;
  }
  const date = new Date(year, monthIndex, day);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  if (date.getFullYear() !== year || date.getMonth() !== monthIndex || date.getDate() !== day) {
    return iso;
  }
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
