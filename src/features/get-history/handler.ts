import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatJson, formatTable } from "../../shared/formatter.js";
import { projectRows } from "../../shared/project-fields.js";
import { requireSecurityId } from "../../shared/security-id.js";
import { getHistorySchema } from "./schema.js";
import { getHistory } from "./query.js";

export const getHistoryToolName = "get_history";

export const getHistoryToolDescription =
  "Get historical end-of-day quotes for a security (JSON by default). Auto-pages ISS up to limit (default 1000, max 2000). Use start/next_start for further pages — no need to slice by dates. Includes YIELD/DURATION/ZSPREAD/OFFERDATE for bonds.";

export const getHistoryToolSchema = getHistorySchema;

/** Compact EOD fields useful for long-series bond/equity analysis. */
const HISTORY_FIELDS = [
  "SECID",
  "BOARDID",
  "TRADEDATE",
  "SHORTNAME",
  "NUMTRADES",
  "VOLUME",
  "VALUE",
  "OPEN",
  "LOW",
  "HIGH",
  "CLOSE",
  "LEGALCLOSEPRICE",
  "WAPRICE",
  "YIELDCLOSE",
  "YIELDATWAP",
  "YIELDTOOFFER",
  "DURATION",
  "ACCINT",
  "COUPONPERCENT",
  "COUPONVALUE",
  "FACEVALUE",
  "MATDATE",
  "OFFERDATE",
  "BUYBACKDATE",
  "ZSPREAD",
  "ZSPREADATWAPRICE",
  "CURRENCYID",
] as const;

export function createGetHistoryHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getHistorySchema.parse(args);
    const security = requireSecurityId(params);
    const page = await getHistory(client, { ...params, security });
    const rows = projectRows(page.rows, HISTORY_FIELDS);

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
            rows,
          }),
        },
      ],
    };
  };
}
