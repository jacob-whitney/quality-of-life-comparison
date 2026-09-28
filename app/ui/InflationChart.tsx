"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartPoint } from "@/lib/cpi";

const US_COLOR = "#36c6d1"; // teal
const ES_COLOR = "#B36A3D"; // clay
const AXIS_TEXT = "#ffffff";

function formatTick(value: number): string {
  return `${value.toFixed(0)}%`;
}

function formatTooltipValue(
  value: number | string | ReadonlyArray<number | string> | undefined
): string {
  const num = Array.isArray(value) ? Number(value[0]) : Number(value);
  if (value === undefined || value === null || Number.isNaN(num)) return "—";
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

function MonthYearPicker({
  label,
  value, // "YYYY-MM"
  onChange,
  minYear,
  maxYear,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minYear?: number;
  maxYear?: number;
}) {
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  // Normalizes month overflow so the arrows roll over years:
  // month 13 -> January of next year, month 0 -> December of previous year.
  const commit = (y: number, m: number) => {
    if (Number.isNaN(y) || Number.isNaN(m)) return;
    const normalizedYear = y + Math.floor((m - 1) / 12);
    const normalizedMonth = ((((m - 1) % 12) + 12) % 12) + 1;
    onChange(
      `${String(normalizedYear).padStart(4, "0")}-${String(normalizedMonth).padStart(2, "0")}`
    );
  };

  const inputClass =
    "border border-line rounded px-1.5 py-0.5 text-black bg-white tabular-nums";

  return (
    <div className="flex items-center gap-1">
      <span>{label}</span>
      <input
        type="number"
        aria-label={`${label} year`}
        value={year}
        min={minYear}
        max={maxYear}
        onChange={(e) => commit(e.target.valueAsNumber, month)}
        className={`${inputClass} w-16`}
      />
      <input
        type="number"
        aria-label={`${label} month`}
        value={month}
        onChange={(e) => commit(year, e.target.valueAsNumber)}
        className={`${inputClass} w-12`}
      />
    </div>
  );
}

export default function InflationChart({
  title,
  data,
}: {
  title: string;
  data: ChartPoint[];
}) {
  // data is pre-sorted ascending by lib/cpi.ts's buildChartSeries, so the
  // first/last entries give us the full available range for the inputs.
  const minKey = data[0]?.key ?? "";
  const maxKey = data[data.length - 1]?.key ?? "";

  const [startDate, setStartDate] = useState("2025-01");
  const [endDate, setEndDate] = useState("2025-12");

  const filtered = useMemo(
    () =>
      data.filter(
        (point) =>
          (!startDate || point.key >= startDate) &&
          (!endDate || point.key <= endDate)
      ),
    [data, startDate, endDate]
  );

  return (
    <div className="flex-1 min-w-[320px]">
      <div className="flex items-baseline justify-between mb-2 gap-4 flex-wrap">
        <h3 className="font-display text-lg text-ink">{title}</h3>

        <div className="flex items-center gap-3 text-xs text-ink/60">
          <MonthYearPicker
            label="From"
            value={startDate}
            onChange={setStartDate}
            minYear={Number(minKey.slice(0, 4))}
            maxYear={Number(maxKey.slice(0, 4))}
          />
          <MonthYearPicker
            label="To"
            value={endDate}
            onChange={setEndDate}
            minYear={Number(minKey.slice(0, 4))}
            maxYear={Number(maxKey.slice(0, 4))}
          />
        </div>
      </div>

      <div className="h-72 border border-line rounded pt-4 pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filtered}
            margin={{ top: 0, right: 8, bottom: 24, left: 16 }}
          >
            <CartesianGrid stroke="#EEEDE8" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: AXIS_TEXT }}
              tickLine={false}
              axisLine={{ stroke: "#DFE0DD" }}
              interval="preserveStartEnd"
              minTickGap={24}
            >
              <Label
                value="Month"
                position="insideBottom"
                offset={-14}
                style={{ fontSize: 12, fill: AXIS_TEXT }}
              />
            </XAxis>
            <YAxis
              tickFormatter={formatTick}
              tick={{ fontSize: 11, fill: AXIS_TEXT }}
              tickLine={false}
              axisLine={false}
              width={48}
            >
              <Label
                value="% change"
                angle={-90}
                position="insideLeft"
                style={{ fontSize: 12, fill: AXIS_TEXT, textAnchor: "middle" }}
              />
            </YAxis>
            <Tooltip
              formatter={(value) => formatTooltipValue(value)}
              labelStyle={{ color: "#1B1F23", fontWeight: 600 }}
              contentStyle={{
                borderRadius: 4,
                borderColor: "#DFE0DD",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="top" height={28} />
            <Line
              type="monotone"
              dataKey="us"
              name="United States"
              stroke={US_COLOR}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="es"
              name="Spain"
              stroke={ES_COLOR}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
