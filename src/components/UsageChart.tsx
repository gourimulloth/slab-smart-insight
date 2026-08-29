import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Reading } from "@/lib/slabsenseCore";

const ranges = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "60", label: "60 days" },
] as const;

export function UsageChart({ readings, avgDaily }: { readings: Reading[]; avgDaily: number }) {
  const [range, setRange] = useState<(typeof ranges)[number]["key"]>("30");

  const data = readings.slice(-Number(range)).map((r) => ({
    date: new Date(r.reading_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    units: r.units_used,
    night: r.night_units,
  }));

  return (
    <section className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Daily consumption</p>
          <h2 className="mt-1 text-xl font-bold">Usage graph</h2>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {ranges.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="fillUnits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillNight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={44}
              unit=" u"
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                color: "var(--color-popover-foreground)",
                fontSize: 12,
              }}
            />
            <ReferenceLine
              y={avgDaily}
              stroke="var(--color-accent)"
              strokeDasharray="4 4"
              label={{ value: "avg", fill: "var(--color-accent)", fontSize: 11, position: "right" }}
            />
            <Area
              type="monotone"
              dataKey="units"
              name="Total units"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fill="url(#fillUnits)"
            />
            <Area
              type="monotone"
              dataKey="night"
              name="Night / standby units"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              fill="url(#fillNight)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
