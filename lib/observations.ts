import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { monthName, type MonthlyDataPoint } from "@/lib/cpi";

export interface Observation {
  period: string; // 'YYYY-MM-DD', first day of the period
  value: number;
}

/** Convert the { year, month, value } points your source files return. */
export function monthlyToObservations(points: MonthlyDataPoint[]): Observation[] {
  return points
    // Never store NaN/Infinity; a missing month is simply absent.
    .filter((p) => Number.isFinite(p.value))
    .map((p) => ({
      period: `${p.year}-${String(p.month).padStart(2, "0")}-01`,
      value: p.value,
    }));
}

/** Insert new periods and update revised ones. Uses the service-role client (cron only). */
export async function saveObservations(
  metric: string,
  country: string,
  points: Observation[]
) {
  if (points.length === 0) return;

  const { error } = await createAdminClient()
    .from("observations")
    .upsert(
      points.map((p) => ({ metric, country, period: p.period, value: p.value })),
      { onConflict: "metric,country,period" }
    );

  if (error) {
    throw new Error(`Failed to save ${metric}/${country}: ${error.message}`);
  }
}

/**
 * Newest first. Reads with the anon key, so it relies on the public SELECT policy.
 * Note: Supabase returns at most 1000 rows per request by default, plenty for monthly data.
 */
export async function getObservations(
  metric: string,
  country: string
): Promise<Observation[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("observations")
    .select("period, value")
    .eq("metric", metric)
    .eq("country", country)
    .order("period", { ascending: false });

  if (error) {
    throw new Error(`Failed to read ${metric}/${country}: ${error.message}`);
  }
  return (data ?? []) as Observation[];
}

/**
 * Read stored monthly data back in the shape your existing code expects,
 * so it can go straight into calculateInflation() / buildChartSeries().
 */
export async function getMonthlyPoints(
  metric: string,
  country: string
): Promise<MonthlyDataPoint[]> {
  const rows = await getObservations(metric, country);
  return rows.map((r) => {
    const [year, month] = r.period.split("-").map(Number);
    return { year, month, monthName: monthName(month), value: r.value };
  });
}