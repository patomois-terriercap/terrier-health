/** Calendar-day helpers. All dates are local-time `YYYY-MM-DD` strings. */

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return toISODate(new Date(y, m - 1, d + n));
}

export function today() {
  return toISODate(new Date());
}

/** The last `n` calendar days ending today, oldest first. */
export function lastNDays(n: number) {
  const end = today();
  return Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));
}

export function civilDate(date?: { year?: number; month?: number; day?: number }) {
  if (!date?.year || !date.month || !date.day) return null;
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}
