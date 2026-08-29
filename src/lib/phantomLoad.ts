/**
 * phantomLoad.ts — phantom / standby load detection.
 *
 * "Phantom load" = electricity an appliance eats while switched off but
 * still plugged in (set-top boxes, TVs, chargers, routers...).
 *
 * Pure functions only — no database, no server code.
 */

export type Appliance = {
  id: string;
  name: string;
  category: string;
  watts: number;
  hours_per_day: number;
  standby_watts: number;
  always_on: boolean;
};

export type ApplianceUsage = {
  id: string;
  name: string;
  category: string;
  /** kWh used per month while actually in use */
  activeUnits: number;
  /** kWh per month wasted in standby */
  phantomUnits: number;
  totalUnits: number;
  /** share of the household's monthly units, 0-100 */
  sharePercent: number;
  isPhantomSuspect: boolean;
  /** plain-language reason shown in the UI */
  verdict: string;
};

export type PhantomReport = {
  ranking: ApplianceUsage[];
  totalUnits: number;
  phantomUnits: number;
  phantomPercent: number;
  suspects: ApplianceUsage[];
};

const DAYS = 30;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * A device is a phantom-load suspect when its standby drain is a
 * meaningful slice of what it uses when it is actually doing something.
 */
export function isPhantomSuspect(a: Appliance) {
  if (a.standby_watts <= 0) return false;
  const activeWh = a.watts * a.hours_per_day;
  const standbyWh = a.standby_watts * Math.max(0, 24 - a.hours_per_day);
  return standbyWh >= 30 || standbyWh / Math.max(activeWh, 1) >= 0.15;
}

export function analysePhantomLoad(appliances: Appliance[]): PhantomReport {
  const rows = appliances.map((a) => {
    const activeUnits = (a.watts * a.hours_per_day * DAYS) / 1000;
    const idleHours = a.always_on ? 0 : Math.max(0, 24 - a.hours_per_day);
    const phantomUnits = (a.standby_watts * idleHours * DAYS) / 1000;
    const suspect = isPhantomSuspect(a);

    return {
      id: a.id,
      name: a.name,
      category: a.category,
      activeUnits: round2(activeUnits),
      phantomUnits: round2(phantomUnits),
      totalUnits: round2(activeUnits + phantomUnits),
      sharePercent: 0,
      isPhantomSuspect: suspect,
      verdict: suspect
        ? `Wastes about ${round2(phantomUnits)} units a month doing nothing — unplug it or use a switched socket.`
        : a.always_on
          ? "Runs continuously by design — normal for this appliance."
          : "No meaningful standby drain detected.",
    } satisfies ApplianceUsage;
  });

  const totalUnits = rows.reduce((s, r) => s + r.totalUnits, 0);
  const phantomUnits = rows.reduce((s, r) => s + r.phantomUnits, 0);

  const ranking = rows
    .map((r) => ({
      ...r,
      sharePercent: totalUnits > 0 ? round2((r.totalUnits / totalUnits) * 100) : 0,
    }))
    .sort((a, b) => b.totalUnits - a.totalUnits);

  return {
    ranking,
    totalUnits: round2(totalUnits),
    phantomUnits: round2(phantomUnits),
    phantomPercent: totalUnits > 0 ? round2((phantomUnits / totalUnits) * 100) : 0,
    suspects: ranking.filter((r) => r.isPhantomSuspect).sort((a, b) => b.phantomUnits - a.phantomUnits),
  };
}
