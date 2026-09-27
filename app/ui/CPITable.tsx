import { InflationRow } from "@/lib/cpi";

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function percentClass(value: number | null): string {
  if (value === null) return "text-ink/40";
  // Rising inflation reads as "up" (red); cooling inflation reads as "down" (green).
  return value > 0 ? "text-up" : value < 0 ? "text-down" : "text-ink/60";
}

export default function CPITable({
  country,
  sourceLabel,
  rows,
  error,
}: {
  country: string;
  sourceLabel: string;
  rows: InflationRow[];
  error?: string;
}) {
  return (
    <section className="flex-1 min-w-[320px]">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-2xl text-ink">{country}</h2>
        <span className="text-xs text-ink/50">{sourceLabel}</span>
      </div>

      {error ? (
        <p className="text-sm text-up border border-up/30 bg-up/5 rounded px-3 py-2">
          {error}
        </p>
      ) : (
        <div className="overflow-x-auto border border-line rounded">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-ink/[0.03] text-left">
                <th className="px-3 py-2 font-medium text-ink/70">Month</th>
                <th className="px-3 py-2 font-medium text-ink/70 text-right">
                  Index
                </th>
                <th className="px-3 py-2 font-medium text-ink/70 text-right">
                  MoM
                </th>
                <th className="px-3 py-2 font-medium text-ink/70 text-right">
                  YoY
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.year}-${row.month}`}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-3 py-2 text-ink">
                    {row.monthName} {row.year}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-ink/80">
                    {row.value.toFixed(3)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums ${percentClass(
                      row.momPercent
                    )}`}
                  >
                    {formatPercent(row.momPercent)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums ${percentClass(
                      row.yoyPercent
                    )}`}
                  >
                    {formatPercent(row.yoyPercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
