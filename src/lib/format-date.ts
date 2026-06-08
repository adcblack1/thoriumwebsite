/**
 * Format a newsletter edition's date for display.
 *
 * ALWAYS pass the edition's intended `date` field (the "YYYY-MM-DD" string the
 * editor set) — NOT `published_at`. `published_at` is the moment the edition was
 * pushed live, which is normally the EVENING BEFORE the dated day, so formatting
 * it in a western timezone (PT/CT/ET) renders the wrong, previous calendar day.
 * That mismatch is exactly the "edition dated June 8 shows as June 7" bug.
 *
 * Timezone safety: a bare "YYYY-MM-DD" parsed via `new Date()` is treated as UTC
 * midnight, and `toLocaleDateString` in a timezone behind UTC would roll it back
 * a day. We pin both the parse and the format to UTC so the calendar day printed
 * is exactly the day that was written, on every server and every browser.
 */
export function formatEditionDate(
  date: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }
): string {
  if (!date) return '';
  // Normalize a bare calendar date to an explicit UTC instant so the day is kept.
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
}
