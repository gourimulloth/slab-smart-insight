import { createFileRoute } from "@tanstack/react-router";

import { loadUsageSummary } from "@/lib/slabsenseCore";
import { getPublicClient, json } from "@/lib/supabasePublic.server";

/** Backend-style route name: /api/public/bill-projection/:id */
export const Route = createFileRoute("/api/public/bill-projection/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const s = await loadUsageSummary(getPublicClient(), params.id);
          return json({
            household: s.household,
            billSoFar: s.billSoFar,
            projectedBill: s.projectedBill,
            slabStatus: {
              currentSlab: s.slabStatus.currentSlab.label,
              nextSlab: s.slabStatus.nextSlab?.label ?? null,
              unitsToNextSlab: s.slabStatus.unitsToNextSlab,
              daysToNextSlab: s.slabStatus.daysToNextSlab,
              willCrossSlab: s.slabStatus.willCrossSlab,
              extraCostIfCrossed: s.slabStatus.extraCostIfCrossed,
            },
          });
        } catch (error) {
          return json({ error: (error as Error).message }, 500);
        }
      },
    },
  },
});
