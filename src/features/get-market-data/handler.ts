import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatJson, formatTable } from "../../shared/formatter.js";
import {
  MARKET_QUOTE_FIELDS,
  MARKET_YIELD_FIELDS,
  projectRows,
} from "../../shared/project-fields.js";
import { requireSecurityId } from "../../shared/security-id.js";
import { getMarketDataSchema } from "./schema.js";
import { getMarketData } from "./query.js";

export const getMarketDataToolName = "get_market_data";

export const getMarketDataToolDescription =
  "Get current quotes for ONE security (required: security or secid). Includes LAST, YIELD, DURATION, ZSPREAD / ZSPREADBP for bonds. Defaults to stock/shares; use market=bonds for bonds. Default response is compact JSON.";

export const getMarketDataToolSchema = getMarketDataSchema;

export function createGetMarketDataHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getMarketDataSchema.parse(args);
    const security = requireSecurityId(params);
    const data = await getMarketData(client, { ...params, security });

    const quotes = projectRows(data.marketdata, MARKET_QUOTE_FIELDS);
    const yields = projectRows(data.marketdata_yields, MARKET_YIELD_FIELDS);

    if (params.format === "markdown") {
      const parts: string[] = [];
      if (quotes.length > 0) parts.push(formatTable(quotes, `Quotes: ${security}`));
      if (yields.length > 0) parts.push(formatTable(yields, `Yields: ${security}`));
      return {
        content: [
          {
            type: "text" as const,
            text: parts.length > 0 ? parts.join("\n\n") : `No data for ${security}`,
          },
        ],
      };
    }

    const payload = {
      security,
      engine: params.engine,
      market: params.market,
      board: params.board ?? null,
      quotes,
      yields,
    };

    return { content: [{ type: "text" as const, text: formatJson(payload) }] };
  };
}
