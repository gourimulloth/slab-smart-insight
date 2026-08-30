/**
 * tariffLogic.ts  — "Backend B" slab bill calculation logic.
 *
 * Plain functions, no database and no server code inside.
 * Anything in this file can be used by the website AND by the API routes.
 */

export type TariffSlab = {
  slab_order: number;
  min_units: number;
  max_units: number | null;
  rate_per_unit: number;
  fixed_charge: number;
  label: string;
};

export type BillBreakdownRow = {
  label: string;
  units: number;
  rate: number;
  amount: number;
};

export type BillResult = {
  units: number;
  energyCharge: number;
  fixedCharge: number;
  dutyCharge: number;
  total: number;
  slabLabel: string;
  breakdown: BillBreakdownRow[];
};

/** Kerala electricity duty, charged on top of the energy charge. */
const DUTY_RATE = 0.1;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Which slab does this month's total consumption fall into? */
export function findSlab(units: number, slabs: TariffSlab[]): TariffSlab {
  const ordered = [...slabs].sort((a, b) => a.slab_order - b.slab_order);
  const match = ordered.find(
    (s) => units >= s.min_units && (s.max_units === null || units <= s.max_units),
  );
  const last = ordered[ordered.length - 1];
  if (!match && !last) {
    throw new Error("No tariff slabs configured");
  }
  return (match ?? last) as TariffSlab;
}

/**
 * Telescopic bill: each slab's units are charged at that slab's rate,
 * and the fixed charge comes from the slab you finally land in.
 */
export function calculateBill(units: number, slabs: TariffSlab[]): BillResult {
  const ordered = [...slabs].sort((a, b) => a.slab_order - b.slab_order);
  const landed = findSlab(units, ordered);

  const breakdown: BillBreakdownRow[] = [];
  let energyCharge = 0;

  for (const slab of ordered) {
    // Units already covered by cheaper slabs below this one.
    const lower = slab.min_units === 0 ? 0 : slab.min_units - 1;
    const upper = slab.max_units ?? Number.POSITIVE_INFINITY;
    const unitsInSlab = Math.max(0, Math.min(units, upper) - lower);
    if (unitsInSlab <= 0) continue;

    const amount = unitsInSlab * slab.rate_per_unit;
    energyCharge += amount;
    breakdown.push({
      label: slab.label,
      units: round2(unitsInSlab),
      rate: slab.rate_per_unit,
      amount: round2(amount),
    });
  }

  const fixedCharge = landed.fixed_charge;
  const dutyCharge = energyCharge * DUTY_RATE;

  return {
    units: round2(units),
    energyCharge: round2(energyCharge),
    fixedCharge: round2(fixedCharge),
    dutyCharge: round2(dutyCharge),
    total: round2(energyCharge + fixedCharge + dutyCharge),
    slabLabel: landed.label,
    breakdown,
  };
}

export type SlabStatus = {
  unitsSoFar: number;
  projectedUnits: number;
  currentSlab: TariffSlab;
  nextSlab: TariffSlab | null;
  unitsToNextSlab: number | null;
  daysToNextSlab: number | null;
  willCrossSlab: boolean;
  extraCostIfCrossed: number;
  percentThroughSlab: number;
};

/**
 * The "Slab Countdown": how many units are left before the household
 * falls into the next, more expensive slab.
 */
export function getSlabStatus(
  unitsSoFar: number,
  avgDailyUnits: number,
  daysLeftInCycle: number,
  slabs: TariffSlab[],
): SlabStatus {
  const ordered = [...slabs].sort((a, b) => a.slab_order - b.slab_order);
  const projectedUnits = round2(unitsSoFar + avgDailyUnits * daysLeftInCycle);

  const currentSlab = findSlab(unitsSoFar, ordered);
  const nextSlab = ordered.find((s) => s.slab_order === currentSlab.slab_order + 1) ?? null;

  const slabCeiling = currentSlab.max_units;
  const unitsToNextSlab = slabCeiling === null ? null : round2(Math.max(0, slabCeiling - unitsSoFar));
  const daysToNextSlab =
    unitsToNextSlab === null || avgDailyUnits <= 0 ? null : Math.floor(unitsToNextSlab / avgDailyUnits);

  const willCrossSlab = slabCeiling !== null && projectedUnits > slabCeiling;

  const billNow = calculateBill(slabCeiling ?? projectedUnits, ordered).total;
  const billProjected = calculateBill(projectedUnits, ordered).total;
  const extraCostIfCrossed = willCrossSlab ? round2(Math.max(0, billProjected - billNow)) : 0;

  const slabFloor = currentSlab.min_units === 0 ? 0 : currentSlab.min_units - 1;
  const span = (slabCeiling ?? unitsSoFar + 1) - slabFloor;
  const percentThroughSlab = Math.min(100, Math.max(0, ((unitsSoFar - slabFloor) / span) * 100));

  return {
    unitsSoFar: round2(unitsSoFar),
    projectedUnits,
    currentSlab,
    nextSlab,
    unitsToNextSlab,
    daysToNextSlab,
    willCrossSlab,
    extraCostIfCrossed,
    percentThroughSlab: round2(percentThroughSlab),
  };
}

/** Days already elapsed / remaining in the current billing month. */
export function cycleInfo(today = new Date()) {
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dayOfCycle = today.getDate();
  return { daysInMonth, dayOfCycle, daysLeft: daysInMonth - dayOfCycle };
}

export function formatRupees(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}
