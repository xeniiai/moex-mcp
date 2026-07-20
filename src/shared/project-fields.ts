/** Compact quote fields useful for peer comparison (shares + bonds). */
export const MARKET_QUOTE_FIELDS = [
  "SECID",
  "BOARDID",
  "LAST",
  "BID",
  "OFFER",
  "WAPRICE",
  "LASTTOPREVPRICE",
  "LASTCHANGEPRCNT",
  "VOLTODAY",
  "VALTODAY",
  "NUMTRADES",
  "UPDATETIME",
  "TRADINGSTATUS",
  "YIELD",
  "YIELDATWAPRICE",
  "CLOSEYIELD",
  "DURATION",
  "ZSPREAD",
  "ZSPREADATWAPRICE",
  "YIELDTOOFFER",
  "MARKETPRICE",
  "LCURRENTPRICE",
] as const;

/** Bond analytics from ISS `marketdata_yields` block. */
export const MARKET_YIELD_FIELDS = [
  "SECID",
  "BOARDID",
  "PRICE",
  "WAPRICE",
  "EFFECTIVEYIELD",
  "EFFECTIVEYIELDWAPRICE",
  "DURATION",
  "DURATIONWAPRICE",
  "ZSPREADBP",
  "GSPREADBP",
  "YIELDDATE",
  "YIELDDATETYPE",
  "ZCYCMOMENT",
  "TRADEMOMENT",
] as const;

export function pickFields(
  row: Record<string, unknown>,
  fields: readonly string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of fields) {
    if (row[key] !== undefined) out[key] = row[key];
  }
  return out;
}

export function projectRows(
  rows: Record<string, unknown>[],
  fields: readonly string[],
): Record<string, unknown>[] {
  return rows.map((row) => pickFields(row, fields));
}
