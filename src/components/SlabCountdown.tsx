import { AlertTriangle, ShieldCheck } from "lucide-react";

import { formatRupees, type SlabStatus } from "@/lib/tariffLogic";

export function SlabCountdown({ status }: { status: SlabStatus }) {
  const danger = status.willCrossSlab;

  return (
    <section className="panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Slab Countdown</p>
          <h2 className="mt-1 text-2xl font-bold">
            {status.unitsToNextSlab === null ? (
              "Top slab reached"
            ) : (
              <>
                <span className="num text-primary">{status.unitsToNextSlab}</span> units left
              </>
            )}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            in the <span className="text-foreground">{status.currentSlab.label}</span> band
            {status.nextSlab ? <> before you jump to {status.nextSlab.label}</> : null}
          </p>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            danger ? "bg-destructive/15 text-destructive" : "bg-safe/15 text-safe"
          }`}
        >
          {danger ? <AlertTriangle className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
          {danger ? "Will cross" : "On track"}
        </span>
      </div>

      <div className="mt-6">
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div className="meter-bar h-full rounded-full transition-all" style={{ width: `${status.percentThroughSlab}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span className="num">{status.unitsSoFar} units used</span>
          <span className="num">
            {status.currentSlab.max_units ?? "∞"} unit ceiling
          </span>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Projected units" value={<span className="num">{status.projectedUnits}</span>} />
        <Stat
          label="Days to next slab"
          value={<span className="num">{status.daysToNextSlab ?? "—"}</span>}
        />
        <Stat
          label="Extra cost if crossed"
          value={
            <span className={`num ${danger ? "text-destructive" : "text-safe"}`}>
              {formatRupees(status.extraCostIfCrossed)}
            </span>
          }
        />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-semibold">{value}</dd>
    </div>
  );
}
