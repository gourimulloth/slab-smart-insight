import { createFileRoute } from "@tanstack/react-router";

import { loadUsageSummary } from "@/lib/slabsenseCore";
import { getPublicClient, json } from "@/lib/supabasePublic.server";

/** Backend-style route name: /api/public/usage/:householdId */
export const Route = createFileRoute("/api/public/usage/$householdId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const s = await loadUsageSummary(getPublicClient(), params.householdId);
          return json({
            household: s.household,
            unitsSoFar: s.unitsSoFar,
            avgDailyUnits: s.avgDailyUnits,
            daysLeft: s.cycle.daysLeft,
            daily: s.readings.map((r) => ({ date: r.reading_date, units: r.units_used })),
            appliances: s.phantom.ranking,
            phantom: {
              units: s.phantom.phantomUnits,
              percent: s.phantom.phantomPercent,
              suspects: s.phantom.suspects,
            },
          });
        } catch (error) {
          return json({ error: (error as Error).message }, 500);
        }
      },
    },
  },
});
