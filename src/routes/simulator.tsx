import { createFileRoute } from "@tanstack/react-router";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { useSlabSense } from "@/hooks/useSlabSense";
import { calculateBill, formatRupees, getSlabStatus } from "@/lib/tariffLogic";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Bill Simulator — What-if Slab Calculator | SlabSense" },
      {
        name: "description",
        content:
          "Drag the daily-usage slider to see how a small change in consumption moves your KSEB slab and your projected monthly bill.",
      },
      { property: "og:title", content: "Bill Simulator — What-if Slab Calculator | SlabSense" },
      {
        property: "og:description",
        content: "See instantly how cutting one unit a day changes your KSEB slab and bill.",
      },
    ],
  }),
  component: SimulatorPage,
});

function SimulatorPage() {
  const { data, isLoading } = useSlabSense();
  const [delta, setDelta] = useState(0);

  const result = useMemo(() => {
    if (!data) return null;
    const newAvg = Math.max(0, data.avgDailyUnits + delta);
    const status = getSlabStatus(data.unitsSoFar, newAvg, data.cycle.daysLeft, data.slabs);
    const bill = calculateBill(status.projectedUnits, data.slabs);
    return { newAvg, status, bill };
  }, [data, delta]);

  if (isLoading || !data || !result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Loading tariff table…
      </div>
    );
  }

  const diff = result.bill.total - data.projectedBill.total;
  const cheaper = diff < 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-accent">Interactive feature 2</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">What-if bill simulator</h1>
        <p className="mt-3 text-muted-foreground">
          KSEB tariffs are telescopic: crossing a slab boundary costs far more than the extra units
          themselves. Move the slider to change your daily usage for the rest of the cycle.
        </p>
      </header>

      <section className="panel p-6">
        <label htmlFor="delta" className="text-sm font-medium">
          Change daily usage by{" "}
          <span className="num text-primary">
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}
          </span>{" "}
          units/day
        </label>
        <input
          id="delta"
          type="range"
          min={-5}
          max={5}
          step={0.1}
          value={delta}
          onChange={(e) => setDelta(Number(e.target.value))}
          className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>−5 u/day (save hard)</span>
          <span>current</span>
          <span>+5 u/day</span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card label="New daily average" value={`${result.newAvg.toFixed(2)} u`} />
          <Card label="Projected units" value={`${result.status.projectedUnits} u`} />
          <Card label="Ends in slab" value={result.status.currentSlab.label} small />
          <Card
            label="Projected bill"
            value={formatRupees(result.bill.total)}
            tone={cheaper ? "text-safe" : diff > 0 ? "text-destructive" : undefined}
          />
        </div>

        <p className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-4 text-sm">
          {cheaper ? (
            <TrendingDown className="size-4 shrink-0 text-safe" />
          ) : (
            <TrendingUp className="size-4 shrink-0 text-warn" />
          )}
          <span>
            Compared to your current trend, that is{" "}
            <span className={`num font-semibold ${cheaper ? "text-safe" : "text-warn"}`}>
              {formatRupees(Math.abs(diff))}
            </span>{" "}
            {cheaper ? "saved" : "extra"} this month.
          </span>
        </p>
      </section>

      <section className="panel mt-5 overflow-x-auto p-6">
        <h2 className="text-xl font-bold">Bill breakdown at this usage</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">Slab</th>
              <th className="pb-2 pr-4 text-right font-medium">Units</th>
              <th className="pb-2 pr-4 text-right font-medium">Rate</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {result.bill.breakdown.map((row) => (
              <tr key={row.label}>
                <td className="py-2 pr-4">{row.label}</td>
                <td className="num py-2 pr-4 text-right">{row.units}</td>
                <td className="num py-2 pr-4 text-right">₹{row.rate.toFixed(2)}</td>
                <td className="num py-2 text-right font-medium">{formatRupees(row.amount)}</td>
              </tr>
            ))}
            <tr>
              <td className="py-2 pr-4 text-muted-foreground" colSpan={3}>
                Fixed charge + 10% electricity duty
              </td>
              <td className="num py-2 text-right">
                {formatRupees(result.bill.fixedCharge + result.bill.dutyCharge)}
              </td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-3 pr-4 font-semibold" colSpan={3}>
                Total
              </td>
              <td className="num py-3 text-right text-lg font-bold text-primary">
                {formatRupees(result.bill.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Card({
  label,
  value,
  tone,
  small,
}: {
  label: string;
  value: string;
  tone?: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`num mt-1 font-bold ${small ? "text-base" : "text-2xl"} ${tone ?? ""}`}>{value}</p>
    </div>
  );
}
