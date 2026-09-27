import { MonthlyDataPoint, monthName } from "@/lib/cpi";

const TABLE_ID = "24077";
const INE_URL = `https://servicios.ine.es/wstempus/js/EN/DATOS_TABLA/${TABLE_ID}`;

// INE's Tempus API returns an array of "series" for the table (a table can
// bundle several breakdowns together, e.g. by category or by base year).
// Each series has a Data[] array of monthly observations.
interface IneDataPoint {
  Fecha: number; // epoch ms
  FK_TipoDato: number;
  FK_Periodo: number; // 1-12 = months, 13 = annual average, in INE's scheme
  Anyo: number;
  NombrePeriodo?: string; // not always present depending on query params
  Valor: number;
  Secreto: boolean;
}

interface IneSeries {
  COD?: string;
  Nombre?: string;
  Data: IneDataPoint[];
}

export async function getSpainCpi(): Promise<MonthlyDataPoint[]> {
  const res = await fetch(INE_URL, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 12 },
  });

  if (!res.ok) {
    throw new Error(`INE request failed: ${res.status} ${res.statusText}`);
  }

  const json: IneSeries[] | IneSeries = await res.json();
  const series: IneSeries[] = Array.isArray(json) ? json : [json];

  if (series.length === 0) {
    throw new Error("INE response contained no series");
  }

  // Table 24077 is expected to be the national general CPI index by month.
  // If the table actually bundles multiple breakdowns, prefer whichever
  // series looks like the headline national/general index; otherwise fall
  // back to the first series that has data.
  const preferred =
    series.find((s) => /general/i.test(s.Nombre ?? "")) ??
    series.find((s) => Array.isArray(s.Data) && s.Data.length > 0) ??
    series[0];

  if (!preferred?.Data?.length) {
    throw new Error(
      "Could not find a usable data series in the INE response — inspect the raw JSON shape and adjust lib/fetchers/es.ts"
    );
  }

  return preferred.Data
    .filter((d) => !d.Secreto && d.FK_Periodo >= 1 && d.FK_Periodo <= 12)
    .map((d) => ({
      year: d.Anyo,
      month: d.FK_Periodo,
      monthName: d.NombrePeriodo || monthName(d.FK_Periodo),
      value: d.Valor,
    }));
}
