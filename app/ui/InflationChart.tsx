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

const US_COLOR = "#0F5257"; // teal
const ES_COLOR = "#B36A3D"; // clay
const AXIS_TEXT = "#1B1F2399";

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

  const [startDate, setStartDate] = useState(minKey);
  const [endDate, setEndDate] = useState(maxKey);

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
          <label className="flex items-center gap-1">
            From
            <input
              type="month"
              value={startDate}
              min={minKey}
              max={endDate || maxKey}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-line rounded px-1.5 py-0.5 text-ink/80 bg-white"
            />
          </label>
          <label className="flex items-center gap-1">
            To
            <input
              type="month"
              value={endDate}
              min={startDate || minKey}
              max={maxKey}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-line rounded px-1.5 py-0.5 text-ink/80 bg-white"
            />
          </label>
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
