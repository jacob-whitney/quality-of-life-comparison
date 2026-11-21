import { ChartPoint } from "@/lib/cpi";

type Country = "us" | "es";

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function format(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// Pulls out only real numbers so null/undefined gaps don't skew the stats.
function valuesFor(data: ChartPoint[], key: Country): number[] {
  return data
    .map((p) => p[key])
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
}

export default function StatsSummary({
  data,
  usColor,
  esColor,
}: {
  data: ChartPoint[];
  usColor: string;
  esColor: string;
}) {
  const rows: { label: string; key: Country; color: string }[] = [
    { label: "United States", key: "us", color: usColor },
    { label: "Spain", key: "es", color: esColor },
  ];

  return (
    <div className="mt-3 overflow-x-auto border border-line rounded">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-line bg-ink/[0.03] text-left">
            <th className="px-3 py-2 font-medium text-ink/70">Country</th>
            <th className="px-3 py-2 font-medium text-ink/70 text-right">Mean</th>
            <th className="px-3 py-2 font-medium text-ink/70 text-right">Median</th>
            <th className="px-3 py-2 font-medium text-ink/70 text-right">Months</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, key, color }) => {
            const values = valuesFor(data, key);
            return (
              <tr key={key} className="border-b border-line last:border-0">
                <td className="px-3 py-2 text-ink">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-ink/80">
                  {format(mean(values))}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-ink/80">
                  {format(median(values))}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-ink/60">
                  {values.length}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}