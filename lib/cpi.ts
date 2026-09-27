// Shared shape both country fetchers normalize into, so the table
// component doesn't need to know anything about BLS or INE specifically.
export interface MonthlyDataPoint {
  year: number;
  month: number; // 1-12
  monthName: string;
  value: number;
}

export interface InflationRow extends MonthlyDataPoint {
  momPercent: number | null;
  yoyPercent: number | null;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}

/**
 * Takes unordered monthly index points and returns them newest-first,
 * each annotated with month-over-month and year-over-year % change.
 * A null percent means there isn't an earlier point far enough back
 * in the series to compare against.
 */
export function calculateInflation(data: MonthlyDataPoint[]): InflationRow[] {
  const ascending = [...data].sort(
    (a, b) => a.year - b.year || a.month - b.month
  );

  const byKey = new Map<string, number>();
  for (const point of ascending) {
    byKey.set(`${point.year}-${point.month}`, point.value);
  }

  const rows: InflationRow[] = ascending.map((point) => {
    const prevMonthKey =
      point.month === 1
        ? `${point.year - 1}-12`
        : `${point.year}-${point.month - 1}`;
    const prevYearKey = `${point.year - 1}-${point.month}`;

    const prevMonthValue = byKey.get(prevMonthKey);
    const prevYearValue = byKey.get(prevYearKey);

    return {
      ...point,
      momPercent:
        prevMonthValue !== undefined
          ? ((point.value / prevMonthValue - 1) * 100)
          : null,
      yoyPercent:
        prevYearValue !== undefined
          ? ((point.value / prevYearValue - 1) * 100)
          : null,
    };
  });

  return rows.reverse(); // newest first for display
}
