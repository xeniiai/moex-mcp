import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { bondizationEventDates, getBondization } from "../../shared/bond-analytics.js";
import { formatJson } from "../../shared/formatter.js";
import { HISTORY_FIELDS } from "../../shared/history-fields.js";
import { mapPool } from "../../shared/map-pool.js";
import { projectRows } from "../../shared/project-fields.js";
import {
  applyYieldQuality,
  DEFAULT_YIELD_QUALITY_CLEAN,
  DEFAULT_YIELD_QUALITY_RAW,
} from "../../shared/yield-quality.js";
import { getHistory } from "../get-history/query.js";
import { getHistoryBatchSchema } from "./schema.js";

export const getHistoryBatchToolName = "get_history_batch";

export const getHistoryBatchToolDescription =
  "Historical EOD for multiple SECIDs in one call (max 20). Default market=bonds, yield_quality=clean. Returns per-security rows + qc summary for peer/portfolio medians.";

export const getHistoryBatchToolSchema = getHistoryBatchSchema;

export function createGetHistoryBatchHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getHistoryBatchSchema.parse(args);
    const qcBase =
      params.yield_quality === "clean"
        ? {
            ...DEFAULT_YIELD_QUALITY_CLEAN,
            offer_window_days: params.offer_window_days,
            coupon_window_days: params.coupon_window_days,
          }
        : DEFAULT_YIELD_QUALITY_RAW;

    const items = await mapPool(params.securities, 4, async (security) => {
      try {
        const page = await getHistory(client, {
          security,
          engine: params.engine,
          market: params.market,
          board: params.board,
          from: params.from,
          till: params.till,
          limit: params.limit,
          start: 0,
        });

        let eventDates = { offers: [] as Date[], coupons: [] as Date[] };
        if (params.yield_quality === "clean" && params.market === "bonds") {
          try {
            eventDates = bondizationEventDates(await getBondization(client, security));
          } catch {
            /* ignore */
          }
        }

        const { rows: annotated, qc } = applyYieldQuality(page.rows, qcBase, eventDates);
        return {
          security,
          ok: true as const,
          count: annotated.length,
          total: page.total,
          has_more: page.has_more,
          next_start: page.next_start,
          qc,
          rows: projectRows(annotated, HISTORY_FIELDS),
        };
      } catch (err) {
        return {
          security,
          ok: false as const,
          error: err instanceof Error ? err.message : String(err),
          count: 0,
          total: null,
          has_more: false,
          next_start: null,
          qc: null,
          rows: [] as Record<string, unknown>[],
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
            from: params.from ?? null,
            till: params.till ?? null,
            yield_quality: params.yield_quality,
            count: items.length,
            items,
          }),
        },
      ],
    };
  };
}
