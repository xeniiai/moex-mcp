import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { getMarketDataSchema } from "./schema.js";
import { getMarketData } from "./query.js";

export const getMarketDataToolName = "get_market_data";

export const getMarketDataToolDescription =
  "Get current market data for securities: price, volume, bid/ask, change. Defaults to stock/shares market.";

export const getMarketDataToolSchema = getMarketDataSchema;

export function createGetMarketDataHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getMarketDataSchema.parse(args);
    const data = await getMarketData(client, params);

    const title = params.security
      ? `Market data: ${params.security}`
      : `Market data: ${params.engine}/${params.market}`;

    const parts: string[] = [];
    if (data.securities.length > 0) parts.push(formatTable(data.securities, "Securities"));
    if (data.marketdata.length > 0) parts.push(formatTable(data.marketdata, "Market data"));

    return { content: [{ type: "text" as const, text: parts.length > 0 ? parts.join("\n\n") : `No data for ${title}` }] };
  };
}
