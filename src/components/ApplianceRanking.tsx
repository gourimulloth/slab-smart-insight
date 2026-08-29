import { Ghost } from "lucide-react";

import type { PhantomReport } from "@/lib/phantomLoad";

export function ApplianceRanking({ report, limit }: { report: PhantomReport; limit?: number }) {
  const rows = limit ? report.ranking.slice(0, limit) : report.ranking;

  return (
    <section className="panel p-6">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Where the units go</p>
          <h2 className="mt-1 text-xl font-bold">Appliance ranking</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="num text-foreground">{report.totalUnits}</span> units / month
        </p>
      </div>

      <ul className="mt-5 space-y-3">
        {rows.map((a, i) => (
          <li key={a.id} className="rounded-lg border border-border/70 bg-secondary/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="num w-6 shrink-0 text-sm text-muted-foreground">{i + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.category}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="num text-sm font-semibold">{a.totalUnits} u</p>
                <p className="num text-xs text-muted-foreground">{a.sharePercent}%</p>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${a.sharePercent}%` }} />
            </div>
            {a.isPhantomSuspect && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-warn">
                <Ghost className="mt-0.5 size-3.5 shrink-0" />
                {a.verdict}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
