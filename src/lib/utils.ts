/** Joins class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Formats an ISO `YYYY-MM-DD` date as e.g. "Jan 2026" (UTC, locale-stable). */
export function formatMonthYear(isoDate: string, locale = "en-US"): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
