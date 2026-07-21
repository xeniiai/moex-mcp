import type { IssClientPort } from "./ports/iss-client.port.js";
import { parseIsoDate } from "./stats.js";

export interface Bondization {
  coupons: Record<string, unknown>[];
  offers: Record<string, unknown>[];
  amortizations: Record<string, unknown>[];
}

export async function getBondization(client: IssClientPort, security: string): Promise<Bondization> {
  const response = await client.get(`/securities/${encodeURIComponent(security)}/bondization`);
  return {
    coupons: response.coupons ?? [],
    offers: response.offers ?? [],
    amortizations: response.amortizations ?? [],
  };
}

export function bondizationEventDates(bondization: Bondization): { offers: Date[]; coupons: Date[] } {
  const offers = bondization.offers
    .map((o) => parseIsoDate(o.offerdate ?? o.OFFERDATE))
    .filter((d): d is Date => d != null);
  const coupons = bondization.coupons
    .map((c) => parseIsoDate(c.coupondate ?? c.COUPONDATE))
    .filter((d): d is Date => d != null);
  return { offers, coupons };
}

/** Linear interpolate ZCYC yearyields by period (years). */
export function interpolateZcyc(
  points: Record<string, unknown>[],
  tenorYears: number,
): { zcyc_yield: number | null; tenor_years: number; bracketing: [number, number] | null } {
  const curve = points
    .map((p) => ({
      period: Number(p.period ?? p.PERIOD),
      value: Number(p.value ?? p.VALUE),
    }))
    .filter((p) => Number.isFinite(p.period) && Number.isFinite(p.value))
    .sort((a, b) => a.period - b.period);

  if (curve.length === 0 || !Number.isFinite(tenorYears) || tenorYears < 0) {
    return { zcyc_yield: null, tenor_years: tenorYears, bracketing: null };
  }

  if (tenorYears <= curve[0].period) {
    return { zcyc_yield: curve[0].value, tenor_years: tenorYears, bracketing: [curve[0].period, curve[0].period] };
  }
  const last = curve[curve.length - 1];
  if (tenorYears >= last.period) {
    return { zcyc_yield: last.value, tenor_years: tenorYears, bracketing: [last.period, last.period] };
  }

  for (let i = 0; i < curve.length - 1; i++) {
    const a = curve[i];
    const b = curve[i + 1];
    if (tenorYears >= a.period && tenorYears <= b.period) {
      const t = (tenorYears - a.period) / (b.period - a.period);
      return {
        zcyc_yield: a.value + t * (b.value - a.value),
        tenor_years: tenorYears,
        bracketing: [a.period, b.period],
      };
    }
  }

  return { zcyc_yield: null, tenor_years: tenorYears, bracketing: null };
}
