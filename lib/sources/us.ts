import { MonthlyDataPoint, monthName } from "@/lib/cpi";

// CUSR0000SA0 = US City Average, All Items, CPI-U, seasonally adjusted.
const SERIES_ID = "CUSR0000SA0";

interface BlsDataPoint {
  year: string;
  period: string; // "M01".."M12", or "M13" for annual average
  periodName: string;
  value: string;
  latest?: string;
  footnotes: unknown[];
}

interface BlsResponse {
  status: string;
  message: string[];
  Results?: {
    series: {
      seriesID: string;
      data: BlsDataPoint[];
    }[];
  };
}

export async function getUsCpi(): Promise<MonthlyDataPoint[]> {
  const endYear = new Date().getFullYear();
  const startYear = endYear - 10; // BLS caps unauthenticated requests at 10 years

  const params = new URLSearchParams({
    startyear: String(startYear),
    endyear: String(endYear),
  });

  // Optional: a free BLS registration key raises the range/request limits.
  // https://data.bls.gov/registrationEngine/
  const apiKey = process.env.BLS_API_KEY;
  if (apiKey) params.set("registrationkey", apiKey);

  const url = `https://api.bls.gov/publicAPI/v2/timeseries/data/${SERIES_ID}?${params.toString()}`;

  const res = await fetch(url, {
    // CPI updates roughly once a month; no need to hit BLS on every request.
    next: { revalidate: 60 * 60 * 12 },
  });

  if (!res.ok) {
    throw new Error(`BLS request failed: ${res.status} ${res.statusText}`);
  }

  const json: BlsResponse = await res.json();

  if (json.status !== "REQUEST_SUCCEEDED") {
    throw new Error(`BLS API error: ${json.message?.join("; ") || json.status}`);
  }

  const series = json.Results?.series?.[0];
  if (!series) throw new Error("BLS response had no series data");

  return series.data
    .filter((d) => /^M(0[1-9]|1[0-2])$/.test(d.period)) // drop M13 annual averages
    .map((d) => {
      const month = Number(d.period.slice(1));
      return {
        year: Number(d.year),
        month,
        monthName: d.periodName || monthName(month),
        value: Number(d.value),
      };
    });
}
