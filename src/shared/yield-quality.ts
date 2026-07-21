import { daysBetween, mad, median, parseIsoDate } from "./stats.js";

export type YieldQualityMode = "raw" | "clean";

export interface YieldQualityOptions {
  mode: YieldQualityMode;
  /** Null yields within N calendar days of put/call offer (default 7). */
  offer_window_days: number;
  /** Null yields within N calendar days of coupon date (default 3). */
  coupon_window_days: number;
  /** Null yields on days with NUMTRADES=0 or VALUE=0 (default true in clean). */
  drop_zero_volume: boolean;
  /** If set (e.g. 3.5), null yields with |y-median|/(MAD*1.4826) above threshold. */
  mad_z: number | null;
}

export const DEFAULT_YIELD_QUALITY_CLEAN: YieldQualityOptions = {
  mode: "clean",
  offer_window_days: 7,
  coupon_window_days: 3,
  drop_zero_volume: true,
  mad_z: 3.5,
};

export const DEFAULT_YIELD_QUALITY_RAW: YieldQualityOptions = {
  mode: "raw",
  offer_window_days: 7,
  coupon_window_days: 3,
  drop_zero_volume: false,
  mad_z: null,
};

export interface YieldQualitySummary {
  mode: YieldQualityMode;
  rows_in: number;
  rows_out: number;
  nulled_offer: number;
  nulled_coupon: number;
  nulled_zero_volume: number;
  nulled_mad: number;
  yield_median_raw: number | null;
  yield_median_qc: number | null;
}

function nearAny(trade: Date, dates: Date[], windowDays: number): boolean {
  return dates.some((d) => daysBetween(trade, d) <= windowDays);
}

/**
 * Annotate history rows with YIELDCLOSE_QC / qc_flags.
 * Does not drop rows — nulls bad yields so medians stay usable.
 */
export function applyYieldQuality(
  rows: Record<string, unknown>[],
  options: YieldQualityOptions,
  eventDates: { offers: Date[]; coupons: Date[] },
): { rows: Record<string, unknown>[]; qc: YieldQualitySummary } {
  if (options.mode === "raw") {
    const yields = rows
      .map((r) => Number(r.YIELDCLOSE))
      .filter((n) => Number.isFinite(n));
    return {
      rows: rows.map((r) => ({ ...r, YIELDCLOSE_QC: r.YIELDCLOSE ?? null, qc_flags: [] as string[] })),
      qc: {
        mode: "raw",
        rows_in: rows.length,
        rows_out: rows.length,
        nulled_offer: 0,
        nulled_coupon: 0,
        nulled_zero_volume: 0,
        nulled_mad: 0,
        yield_median_raw: median(yields),
        yield_median_qc: median(yields),
      },
    };
  }

  const rawYields = rows
    .map((r) => Number(r.YIELDCLOSE))
    .filter((n) => Number.isFinite(n));
  const med = median(rawYields);
  const m = mad(rawYields);
  const sigma = m != null && m > 0 ? m * 1.4826 : null;

  let nulled_offer = 0;
  let nulled_coupon = 0;
  let nulled_zero_volume = 0;
  let nulled_mad = 0;

  const out = rows.map((row) => {
    const flags: string[] = [];
    const trade = parseIsoDate(row.TRADEDATE);
    let yqc: number | null =
      row.YIELDCLOSE == null || row.YIELDCLOSE === "" ? null : Number(row.YIELDCLOSE);
    if (yqc != null && !Number.isFinite(yqc)) yqc = null;

    const offerFromRow = parseIsoDate(row.OFFERDATE);
    const offers = offerFromRow ? [...eventDates.offers, offerFromRow] : eventDates.offers;

    if (yqc != null && trade && options.offer_window_days > 0 && nearAny(trade, offers, options.offer_window_days)) {
      flags.push("near_offer");
      yqc = null;
      nulled_offer++;
    }

    if (yqc != null && trade && options.coupon_window_days > 0 && nearAny(trade, eventDates.coupons, options.coupon_window_days)) {
      flags.push("near_coupon");
      yqc = null;
      nulled_coupon++;
    }

    if (
      yqc != null &&
      options.drop_zero_volume &&
      (Number(row.NUMTRADES) === 0 || Number(row.VALUE) === 0 || row.VALUE == null)
    ) {
      flags.push("zero_volume");
      yqc = null;
      nulled_zero_volume++;
    }

    if (
      yqc != null &&
      options.mad_z != null &&
      med != null &&
      sigma != null &&
      Math.abs(yqc - med) / sigma > options.mad_z
    ) {
      flags.push("mad_outlier");
      yqc = null;
      nulled_mad++;
    }

    return { ...row, YIELDCLOSE_QC: yqc, qc_flags: flags };
  });

  const qcYields = out
    .map((r) => Number(r.YIELDCLOSE_QC))
    .filter((n) => Number.isFinite(n));

  return {
    rows: out,
    qc: {
      mode: "clean",
      rows_in: rows.length,
      rows_out: out.length,
      nulled_offer,
      nulled_coupon,
      nulled_zero_volume,
      nulled_mad,
      yield_median_raw: median(rawYields),
      yield_median_qc: median(qcYields),
    },
  };
}
