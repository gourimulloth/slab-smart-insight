import { createFileRoute } from "@tanstack/react-router";

import { DEMO_HOUSEHOLD_ID, loadUsageSummary } from "@/lib/slabsenseCore";
import { getPublicClient, json } from "@/lib/supabasePublic.server";

/** Frontend-style route name: /api/public/slab-status?householdId=... */
export const Route = createFileRoute("/api/public/slab-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("householdId") ?? DEMO_HOUSEHOLD_ID;
        try {
          const s = await loadUsageSummary(getPublicClient(), id);
          return json({
            householdId: id,
            unitsSoFar: s.slabStatus.unitsSoFar,
            projectedUnits: s.slabStatus.projectedUnits,
            currentSlab: s.slabStatus.currentSlab.label,
            nextSlab: s.slabStatus.nextSlab?.label ?? null,
            unitsToNextSlab: s.slabStatus.unitsToNextSlab,
            daysToNextSlab: s.slabStatus.daysToNextSlab,
            willCrossSlab: s.slabStatus.willCrossSlab,
            extraCostIfCrossed: s.slabStatus.extraCostIfCrossed,
            projectedBill: s.projectedBill.total,
          });
        } catch (error) {
          return json({ error: (error as Error).message }, 500);
        }
      },
    },
  },
});
