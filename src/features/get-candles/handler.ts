import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable, truncateRows } from "../../shared/formatter.js";
import { requireSecurityId } from "../../shared/security-id.js";
import { getCandlesSchema } from "./schema.js";
import { getCandles } from "./query.js";

export const getCandlesToolName = "get_candles";

export const getCandlesToolDescription =
  "Get OHLCV candlestick data for a security. Use interval=24 for daily candles, 60 for hourly, 10 or 1 for minutes.";

export const getCandlesToolSchema = getCandlesSchema;

export function createGetCandlesHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getCandlesSchema.parse(args);
    const security = requireSecurityId(params);
    const rows = await getCandles(client, { ...params, security });
    const { rows: displayRows, truncated, total } = truncateRows(rows, 100);

    let text = formatTable(displayRows, `Candles: ${security} (interval=${params.interval}min)`);
    if (truncated) text += `\n\n*Showing 100 of ${total} candles.*`;

    return { content: [{ type: "text" as const, text }] };
  };
}
