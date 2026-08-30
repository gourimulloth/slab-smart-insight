import { createFileRoute } from "@tanstack/react-router";
import { Ghost, Loader2, Plug, PlugZap } from "lucide-react";
import { useMemo, useState } from "react";

import { ApplianceRanking } from "@/components/ApplianceRanking";
import { useSlabSense } from "@/hooks/useSlabSense";
import { analysePhantomLoad } from "@/lib/phantomLoad";
import { calculateBill, formatRupees } from "@/lib/tariffLogic";

export const Route = createFileRoute("/appliances")({
  head: () => ({
    meta: [
      { title: "Appliance Ranking & Phantom Load — SlabSense" },
      {
        name: "description",
        content:
          "See which appliances eat the most units and how much electricity your always-plugged-in devices waste in standby every month.",
      },
      { property: "og:title", content: "Appliance Ranking & Phantom Load — SlabSense" },
      {
        property: "og:description",
        content: "Rank every appliance by monthly units and unplug the phantom-load culprits.",
      },
    ],
  }),
  component: AppliancesPage,
});

function AppliancesPage() {
  const { data, isLoading } = useSlabSense();
  const [unplugged, setUnplugged] = useState<string[]>([]);

  const scenario = useMemo(() => {
    if (!data) return null;
    const kept = data.appliances.map((a) =>
      unplugged.includes(a.id) ? { ...a, standby_watts: 0 } : a,
    );
    const report = analysePhantomLoad(kept);
    const bill = calculateBill(report.totalUnits, data.slabs);
    return { report, bill };
  }, [data, unplugged]);

  if (isLoading || !data || !scenario) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Checking every socket…
      </div>
    );
  }

  const baseline = calculateBill(data.phantom.totalUnits, data.slabs);
  const saving = Math.max(0, baseline.total - scenario.bill.total);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-accent">Interactive feature 1</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Appliances & phantom load</h1>
        <p className="mt-3 text-muted-foreground">
          Every appliance is ranked by the units it uses each month. Flip the switch on a device to
          "unplug" it and watch the wasted standby units — and your bill — drop.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="panel p-6 lg:col-span-2">
          <h2 className="text-xl font-bold">Unplug simulator</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Devices flagged with a ghost keep drawing power while switched off.
          </p>

          <ul className="mt-5 divide-y divide-border">
            {data.appliances.map((a) => {
              const off = unplugged.includes(a.id);
              const row = data.phantom.ranking.find((r) => r.id === a.id);
              return (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-sm font-medium">
                      {a.name}
                      {row?.isPhantomSuspect && <Ghost className="size-3.5 shrink-0 text-warn" />}
                    </p>
                    <p className="num text-xs text-muted-foreground">
                      {a.watts} W · {a.hours_per_day} h/day · standby {a.standby_watts} W
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={off}
                    onClick={() =>
                      setUnplugged((prev) =>
                        prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id],
                      )
                    }
                    disabled={a.standby_watts === 0}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-40 ${
                      off
                        ? "border-safe/40 bg-safe/15 text-safe"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {off ? <PlugZap className="size-3.5" /> : <Plug className="size-3.5" />}
                    {off ? "Unplugged" : "Plugged in"}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 grid gap-4 rounded-xl border border-border bg-secondary/30 p-4 sm:grid-cols-3">
            <Metric label="Standby units left" value={`${scenario.report.phantomUnits} u`} />
            <Metric label="Monthly units" value={`${scenario.report.totalUnits} u`} />
            <Metric
              label="You save"
              value={formatRupees(saving)}
              tone={saving > 0 ? "text-safe" : undefined}
            />
          </div>
        </section>

        <ApplianceRanking report={scenario.report} />
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string | undefined }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`num mt-1 text-xl font-bold ${tone ?? ""}`}>{value}</p>
    </div>
  );
}
