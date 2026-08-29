import { createFileRoute } from "@tanstack/react-router";

import { DEMO_HOUSEHOLD_ID, loadUsageSummary } from "@/lib/slabsenseCore";
import { getPublicClient, json } from "@/lib/supabasePublic.server";

/**
 * Frontend-style route name (Giya's mock):  /api/public/usage-summary?householdId=...
 * Same data as /api/public/usage/:householdId
 */
export const Route = createFileRoute("/api/public/usage-summary")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("householdId") ?? DEMO_HOUSEHOLD_ID;
        try {
          const summary = await loadUsageSummary(getPublicClient(), id);
          return json({
            householdId: id,
            unitsSoFar: summary.unitsSoFar,
            avgDailyUnits: summary.avgDailyUnits,
            daysLeft: summary.cycle.daysLeft,
            daily: summary.readings.map((r) => ({ date: r.reading_date, units: r.units_used })),
            appliances: summary.phantom.ranking,
            phantom: {
              units: summary.phantom.phantomUnits,
              percent: summary.phantom.phantomPercent,
              suspects: summary.phantom.suspects,
            },
          });
        } catch (error) {
          return json({ error: (error as Error).message }, 500);
        }
      },
    },
  },
});
