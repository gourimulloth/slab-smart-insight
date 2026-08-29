/**
 * slabsenseCore.ts — pulls rows out of the database and runs them through
 * tariffLogic + phantomLoad. This is the "glue" layer.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { analysePhantomLoad, type Appliance, type PhantomReport } from "./phantomLoad";
import {
  calculateBill,
  cycleInfo,
  getSlabStatus,
  type BillResult,
  type SlabStatus,
  type TariffSlab,
} from "./tariffLogic";

export const DEMO_HOUSEHOLD_ID = "11111111-1111-1111-1111-111111111111";

export type Reading = { reading_date: string; units_used: number; night_units: number };

export type HouseholdRow = {
  id: string;
  name: string;
  consumer_number: string;
  city: string;
  connection_type: string;
};

export type UsageSummary = {
  household: HouseholdRow;
  slabs: TariffSlab[];
  readings: Reading[];
  cycleReadings: Reading[];
  appliances: Appliance[];
  cycle: { daysInMonth: number; dayOfCycle: number; daysLeft: number };
  unitsSoFar: number;
  avgDailyUnits: number;
  slabStatus: SlabStatus;
  billSoFar: BillResult;
  projectedBill: BillResult;
  phantom: PhantomReport;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>;

export async function loadUsageSummary(
  client: AnyClient,
  householdId: string = DEMO_HOUSEHOLD_ID,
): Promise<UsageSummary> {
  const [householdRes, slabRes, readingRes, applianceRes] = await Promise.all([
    client.from("households").select("id,name,consumer_number,city,connection_type").eq("id", householdId).single(),
    client.from("tariff_slabs").select("slab_order,min_units,max_units,rate_per_unit,fixed_charge,label").order("slab_order"),
    client
      .from("meter_readings")
      .select("reading_date,units_used,night_units")
      .eq("household_id", householdId)
      .order("reading_date"),
    client
      .from("appliances")
      .select("id,name,category,watts,hours_per_day,standby_watts,always_on")
      .eq("household_id", householdId),
  ]);

  const firstError = householdRes.error ?? slabRes.error ?? readingRes.error ?? applianceRes.error;
  if (firstError) throw new Error(firstError.message);

  const household = householdRes.data as HouseholdRow;
  const slabs = (slabRes.data ?? []).map((s: TariffSlab) => ({
    ...s,
    rate_per_unit: Number(s.rate_per_unit),
    fixed_charge: Number(s.fixed_charge),
  })) as TariffSlab[];
  const readings = (readingRes.data ?? []).map((r: Reading) => ({
    reading_date: r.reading_date,
    units_used: Number(r.units_used),
    night_units: Number(r.night_units),
  })) as Reading[];
  const appliances = (applianceRes.data ?? []).map((a: Appliance) => ({
    ...a,
    watts: Number(a.watts),
    hours_per_day: Number(a.hours_per_day),
    standby_watts: Number(a.standby_watts),
  })) as Appliance[];

  const today = new Date();
  const cycle = cycleInfo(today);
  const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const cycleReadings = readings.filter((r) => r.reading_date.startsWith(monthPrefix));

  const unitsSoFar = cycleReadings.reduce((s, r) => s + r.units_used, 0);
  const recent = readings.slice(-14);
  const avgDailyUnits = recent.length ? recent.reduce((s, r) => s + r.units_used, 0) / recent.length : 0;

  const slabStatus = getSlabStatus(unitsSoFar, avgDailyUnits, cycle.daysLeft, slabs);

  return {
    household,
    slabs,
    readings,
    cycleReadings,
    appliances,
    cycle,
    unitsSoFar: Math.round(unitsSoFar * 100) / 100,
    avgDailyUnits: Math.round(avgDailyUnits * 100) / 100,
    slabStatus,
    billSoFar: calculateBill(unitsSoFar, slabs),
    projectedBill: calculateBill(slabStatus.projectedUnits, slabs),
    phantom: analysePhantomLoad(appliances),
  };
}
