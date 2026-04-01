import type { ServiceRates, ScheduleEntry } from "../client/types.js";

export interface DailyCost {
  date: string;
  atc: number;
  sfb: number;
  pgv: number;
  total: number;
}

export interface CostEstimate {
  num_days: number;
  totals: { atc: number; pgv: number; sfb: number; grand_total: number };
  avg_daily_cost: number;
  daily_breakdown?: DailyCost[];
}

/** Full SFB per-unit cost including product price, tax, and passthrough. */
export function sfbUnitCost(rates: ServiceRates, retailPrice?: number): number {
  if (retailPrice == null) {
    return rates.sfb_service_fee;
  }
  const tax = retailPrice * rates.sfb_tax_rate;
  const passthrough = (retailPrice + tax) * rates.sfb_passthrough_rate;
  return rates.sfb_service_fee + retailPrice + tax + passthrough;
}

/**
 * Compute cost estimate from a normalized schedule (array of daily volumes).
 * Each entry uses { date, atc, sfb, pgv } with MCP-facing field names.
 */
export function estimateCost(
  schedule: { date: string; atc: number; sfb: number; pgv: number }[],
  rates: ServiceRates,
  retailPrice?: number,
): CostEstimate {
  const sfbUnit = sfbUnitCost(rates, retailPrice);
  const includeDailyBreakdown = schedule.length <= 14;

  let totalAtc = 0;
  let totalSfb = 0;
  let totalPgv = 0;
  const dailyBreakdown: DailyCost[] = [];

  for (const day of schedule) {
    const dayAtc = day.atc * rates.atc;
    const daySfb = day.sfb * sfbUnit;
    const dayPgv = day.pgv * rates.pgv;
    totalAtc += dayAtc;
    totalSfb += daySfb;
    totalPgv += dayPgv;

    if (includeDailyBreakdown) {
      dailyBreakdown.push({
        date: day.date,
        atc: round2(dayAtc),
        sfb: round2(daySfb),
        pgv: round2(dayPgv),
        total: round2(dayAtc + daySfb + dayPgv),
      });
    }
  }

  const grandTotal = totalAtc + totalSfb + totalPgv;
  const numDays = schedule.length;

  return {
    num_days: numDays,
    totals: {
      atc: round2(totalAtc),
      pgv: round2(totalPgv),
      sfb: round2(totalSfb),
      grand_total: round2(grandTotal),
    },
    avg_daily_cost: round2(numDays > 0 ? grandTotal / numDays : 0),
    ...(includeDailyBreakdown ? { daily_breakdown: dailyBreakdown } : {}),
  };
}

/**
 * Map backend ScheduleEntry (purchase/pageview) to cost-friendly shape (sfb/pgv).
 * Filters out "ongoing" entries since they have no fixed date for totaling.
 */
export function mapScheduleEntries(
  entries: ScheduleEntry[],
): { dated: { date: string; atc: number; sfb: number; pgv: number }[]; hasOngoing: boolean } {
  const dated: { date: string; atc: number; sfb: number; pgv: number }[] = [];
  let hasOngoing = false;

  for (const e of entries) {
    if (e.id === "ongoing" || e.date === "ongoing") {
      hasOngoing = true;
      continue;
    }
    dated.push({
      date: e.date,
      atc: e.atc,
      sfb: e.purchase,
      pgv: e.pageview,
    });
  }

  return { dated, hasOngoing };
}

/**
 * Get daily volumes from an ongoing entry (for per-day cost display).
 */
export function getOngoingVolumes(
  entries: ScheduleEntry[],
): { atc: number; sfb: number; pgv: number } | null {
  const ongoing = entries.find((e) => e.id === "ongoing" || e.date === "ongoing");
  if (!ongoing) return null;
  return { atc: ongoing.atc, sfb: ongoing.purchase, pgv: ongoing.pageview };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
