import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { interpolateZcyc } from "../../shared/bond-analytics.js";
import { formatJson } from "../../shared/formatter.js";
import { mapPool } from "../../shared/map-pool.js";
import { getBondYieldCurve } from "../get-bond-yield-curve/query.js";
import { getMarketData } from "../get-market-data/query.js";
import { getBondSpreadsSchema } from "./schema.js";

export const getBondSpreadsToolName = "get_bond_spreads";

export const getBondSpreadsToolDescription =
  "Bond YTM / Z-spread / G-spread with ZCYC point at bond tenor in one response — no manual join. Uses ISS marketdata_yields + interpolated /engines/stock/zcyc.";

export const getBondSpreadsToolSchema = getBondSpreadsSchema;

function pickPrimary<T extends Record<string, unknown>>(rows: T[], board?: string): T | null {
  if (rows.length === 0) return null;
  if (board) {
    const hit = rows.find((r) => String(r.BOARDID) === board);
    if (hit) return hit;
  }
  const tqcb = rows.find((r) => String(r.BOARDID) === "TQCB");
  return tqcb ?? rows[0];
}

export function createGetBondSpreadsHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getBondSpreadsSchema.parse(args);
    const zcycPoints = await getBondYieldCurve(client, { engine: params.engine, date: params.date });
    const zcycMeta = {
      date: params.date ?? (zcycPoints[0]?.tradedate != null ? String(zcycPoints[0].tradedate) : null),
      time: zcycPoints[0]?.tradetime != null ? String(zcycPoints[0].tradetime) : null,
      points: zcycPoints.length,
    };

    const items = await mapPool(params.securities, 6, async (security) => {
      try {
        const data = await getMarketData(client, {
          security,
          engine: params.engine,
          market: params.market,
          board: params.board,
        });
        const quote = pickPrimary(data.marketdata, params.board);
        const yld = pickPrimary(data.marketdata_yields, params.board);

        const ytm =
          yld?.EFFECTIVEYIELD != null
            ? Number(yld.EFFECTIVEYIELD)
            : quote?.YIELD != null
              ? Number(quote.YIELD)
              : null;
        const durationDays =
          yld?.DURATION != null
            ? Number(yld.DURATION)
            : quote?.DURATION != null
              ? Number(quote.DURATION)
              : null;
        const tenor_years = durationDays != null && Number.isFinite(durationDays) ? durationDays / 365 : null;

        const z_spread_bp =
          yld?.ZSPREADBP != null
            ? Number(yld.ZSPREADBP)
            : quote?.ZSPREAD != null
              ? Number(quote.ZSPREAD)
              : null;
        const g_spread_bp = yld?.GSPREADBP != null ? Number(yld.GSPREADBP) : null;

        const curve =
          tenor_years != null ? interpolateZcyc(zcycPoints, tenor_years) : { zcyc_yield: null, tenor_years: null, bracketing: null };

        const g_spread_bp_calc =
          ytm != null && curve.zcyc_yield != null ? (ytm - curve.zcyc_yield) * 100 : null;

        return {
          security,
          ok: true as const,
          board: quote?.BOARDID ?? yld?.BOARDID ?? params.board ?? null,
          last: quote?.LAST ?? null,
          ytm,
          duration_days: durationDays,
          tenor_years,
          z_spread_bp,
          g_spread_bp,
          g_spread_bp_calc,
          zcyc_yield: curve.zcyc_yield,
          zcyc_bracketing: curve.bracketing,
          yield_date: yld?.YIELDDATE ?? null,
          yield_date_type: yld?.YIELDDATETYPE ?? null,
          zcyc_moment: yld?.ZCYCMOMENT ?? null,
        };
      } catch (err) {
        return {
          security,
          ok: false as const,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    return {
      content: [
        {
          type: "text" as const,
          text: formatJson({
            engine: params.engine,
            market: params.market,
            board: params.board ?? null,
            zcyc: zcycMeta,
            zcyc_curve: zcycPoints,
            count: items.length,
            items,
          }),
        },
      ],
    };
  };
}
