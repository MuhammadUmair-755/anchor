/**
 * Calendar date helpers. Everything works on local dates as "YYYY-MM-DD" / "YYYY-MM"
 * strings — never toISOString(), which shifts the day for users east/west of UTC.
 */

const pad = (n: number) => String(n).padStart(2, "0");

export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayKey = () => toDateKey(new Date());

export const currentMonthKey = () => todayKey().slice(0, 7);

export const isMonthKey = (v: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(v);

/** "2026-10" + 1 → "2026-11" */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Monday-first grid covering the whole month, padded to full weeks. */
export function monthGrid(month: string): { dateKey: string; dayNumber: number; inMonth: boolean }[] {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const lead = (first.getDay() + 6) % 7; // days before the 1st since Monday
  const daysInMonth = new Date(y, m, 0).getDate();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;
  return Array.from({ length: total }, (_, i) => {
    const d = new Date(y, m - 1, 1 - lead + i);
    return { dateKey: toDateKey(d), dayNumber: d.getDate(), inMonth: d.getMonth() === m - 1 };
  });
}

/** "2026-10" → "October 2026" */
export const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/** "2026-10-06" → "Tuesday, October 6, 2026" */
export const longDateLabel = (dateKey: string) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};
