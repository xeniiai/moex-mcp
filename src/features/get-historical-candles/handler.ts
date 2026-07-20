import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable, truncateRows } from "../../shared/formatter.js";
import { requireSecurityId } from "../../shared/security-id.js";
import { getHistoricalCandlesSchema } from "./schema.js";
import { getHistoricalCandles } from "./query.js";

export const getHistoricalCandlesToolName = "get_historical_candles";

export const getHistoricalCandlesToolDescription =
  "Get historical OHLCV candles over a date range from the history endpoint";

export const getHistoricalCandlesToolSchema = getHistoricalCandlesSchema;

export function createGetHistoricalCandlesHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getHistoricalCandlesSchema.parse(args);
    const security = requireSecurityId(params);
    const rows = await getHistoricalCandles(client, { ...params, security });
    const { rows: displayRows, truncated, total } = truncateRows(rows, 100);

    let text = formatTable(displayRows, `Historical candles: ${security} (interval=${params.interval}min)`);
    if (truncated) text += `\n\n*Showing 100 of ${total} candles.*`;

    return { content: [{ type: "text" as const, text }] };
  };
}
