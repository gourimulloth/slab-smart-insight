import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { DEMO_HOUSEHOLD_ID, loadUsageSummary, type UsageSummary } from "@/lib/slabsenseCore";

export function useSlabSense(householdId: string = DEMO_HOUSEHOLD_ID) {
  return useQuery<UsageSummary>({
    queryKey: ["slabsense", householdId],
    queryFn: () => loadUsageSummary(supabase, householdId),
    staleTime: 60_000,
  });
}
