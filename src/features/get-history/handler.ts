import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { bondizationEventDates, getBondization } from "../../shared/bond-analytics.js";
import { formatJson, formatTable } from "../../shared/formatter.js";
import { HISTORY_FIELDS } from "../../shared/history-fields.js";
import { projectRows } from "../../shared/project-fields.js";
import { requireSecurityId } from "../../shared/security-id.js";
import {
  applyYieldQuality,
  DEFAULT_YIELD_QUALITY_CLEAN,
  DEFAULT_YIELD_QUALITY_RAW,
} from "../../shared/yield-quality.js";
import { getHistorySchema } from "./schema.js";
import { getHistory } from "./query.js";

export const getHistoryToolName = "get_history";

export const getHistoryToolDescription =
  "Historical EOD quotes (JSON). Auto-pages ISS (limit default 1000). yield_quality=clean nulls YIELDCLOSE_QC near offer/coupon and MAD outliers — use for medians. Includes YIELD/DURATION/ZSPREAD/OFFERDATE.";

export const getHistoryToolSchema = getHistorySchema;

export function createGetHistoryHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getHistorySchema.parse(args);
    const security = requireSecurityId(params);
    const page = await getHistory(client, { ...params, security });

    let eventDates = { offers: [] as Date[], coupons: [] as Date[] };
    if (params.yield_quality === "clean" && params.market === "bonds") {
      try {
        eventDates = bondizationEventDates(await getBondization(client, security));
      } catch {
        // keep empty — still apply row OFFERDATE / volume / MAD
      }
    }

    const qcOpts =
      params.yield_quality === "clean"
        ? {
            ...DEFAULT_YIELD_QUALITY_CLEAN,
            offer_window_days: params.offer_window_days,
            coupon_window_days: params.coupon_window_days,
          }
        : DEFAULT_YIELD_QUALITY_RAW;

    const { rows: annotated, qc } = applyYieldQuality(page.rows, qcOpts, eventDates);
    const rows = projectRows(annotated, HISTORY_FIELDS);

    if (params.format === "markdown") {
      let text = formatTable(rows, `History: ${security}`);
      if (page.has_more) {
        text += `\n\n*Showing ${rows.length} rows (start=${page.start}). next_start=${page.next_start}, total=${page.total ?? "?"}.*`;
      }
      return { content: [{ type: "text" as const, text }] };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: formatJson({
            security,
            engine: params.engine,
            market: params.market,
            board: params.board ?? null,
            from: params.from ?? null,
            till: params.till ?? null,
            start: page.start,
            limit: params.limit,
            count: rows.length,
            total: page.total,
            next_start: page.next_start,
            has_more: page.has_more,
            yield_quality: params.yield_quality,
            qc,
            rows,
          }),
        },
      ],
    };
  };
}
