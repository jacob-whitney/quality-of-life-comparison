import CPITable from "@/app/ui/CPITable";
import InflationChart from "@/app/ui/InflationChart";
import { buildChartSeries, calculateInflation, InflationRow } from "@/lib/cpi";
import { getUsCpi } from "@/lib/sources/us";
import { getSpainCpi } from "@/lib/sources/es";

// Revalidate at most every 12 hours — CPI is a monthly release, no need
// to hit either upstream API on every single page view.
export const revalidate = 43200;

async function loadRows(
  fetcher: () => Promise<Parameters<typeof calculateInflation>[0]>
): Promise<{ rows: InflationRow[]; error?: string }> {
  try {
    const data = await fetcher();
    return { rows: calculateInflation(data) };
  } catch (err) {
    return {
      rows: [],
      error: err instanceof Error ? err.message : "Failed to load data",
    };
  }
}

export default async function Home() {
  const [us, es] = await Promise.all([
    loadRows(getUsCpi),
    loadRows(getSpainCpi),
  ]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl text-ink mb-2">
          Consumer Price Index
        </h1>
        <p className="text-ink/60 text-sm max-w-xl">
          Monthly index level alongside month-over-month and year-over-year
          inflation, sourced live from the BLS and INE APIs.
        </p>
      </header>

      {us.error || es.error ? null : (
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <InflationChart
            title="Month-over-month inflation"
            data={buildChartSeries(us.rows, es.rows, "momPercent")}
          />
          <InflationChart
            title="Year-over-year inflation"
            data={buildChartSeries(us.rows, es.rows, "yoyPercent")}
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-10">
        <CPITable
          country="United States"
          sourceLabel="BLS · CUSR0000SA0"
          rows={us.rows}
          error={us.error}
        />
        <CPITable
          country="Spain"
          sourceLabel="INE · Table 24077"
          rows={es.rows}
          error={es.error}
        />
      </div>
    </main>
  );
}
