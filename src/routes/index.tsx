import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Ghost, IndianRupee, Loader2 } from "lucide-react";

import { ApplianceRanking } from "@/components/ApplianceRanking";
import { SlabCountdown } from "@/components/SlabCountdown";
import { UsageChart } from "@/components/UsageChart";
import { useSlabSense } from "@/hooks/useSlabSense";
import { formatRupees } from "@/lib/tariffLogic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SlabSense — Slab-Aware Electricity Dashboard for KSEB Homes" },
      {
        name: "description",
        content:
          "SlabSense shows Kerala households how many units are left before the next KSEB tariff slab, the projected bill, daily usage and which appliances waste power.",
      },
      { property: "og:title", content: "SlabSense — Slab-Aware Electricity Dashboard" },
      {
        property: "og:description",
        content:
          "Slab countdown, projected bill, usage graph and phantom-load detection for KSEB households.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, error } = useSlabSense();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Reading the meter…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center text-destructive">
        Could not load meter data. {(error as Error | null)?.message}
      </div>
    );
  }

  const { household, slabStatus, billSoFar, projectedBill, phantom, cycle, avgDailyUnits } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-accent">
          {household.city} · {household.connection_type} · Consumer {household.consumer_number}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{household.name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Day <span className="num">{cycle.dayOfCycle}</span> of{" "}
          <span className="num">{cycle.daysInMonth}</span> in this billing cycle. Averaging{" "}
          <span className="num text-foreground">{avgDailyUnits}</span> units a day.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SlabCountdown status={slabStatus} />
        </div>

        <section className="panel flex flex-col justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Projected bill</p>
            <p className="num mt-2 flex items-baseline gap-1 text-4xl font-bold text-primary">
              <IndianRupee className="size-6" />
              {projectedBill.total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              at cycle end · {formatRupees(billSoFar.total)} so far
            </p>
          </div>
          <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <Row label="Energy charge" value={formatRupees(projectedBill.energyCharge)} />
            <Row label="Fixed charge" value={formatRupees(projectedBill.fixedCharge)} />
            <Row label="Electricity duty" value={formatRupees(projectedBill.dutyCharge)} />
          </dl>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UsageChart readings={data.readings} avgDaily={avgDailyUnits} />
        </div>
        <ApplianceRanking report={phantom} limit={5} />
      </div>

      <section className="panel mt-5 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warn/15 text-warn">
            <Ghost className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold">
              Phantom load: <span className="num text-warn">{phantom.phantomUnits} units</span> a month
            </h2>
            <p className="text-sm text-muted-foreground">
              That is {phantom.phantomPercent}% of your consumption, burnt by {phantom.suspects.length}{" "}
              appliances that are switched off but still plugged in.
            </p>
          </div>
        </div>
        <Link
          to="/appliances"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          See the culprits <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="num font-medium">{value}</dd>
    </div>
  );
}
