import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { getRecentTradesSchema } from "./schema.js";
import { getRecentTrades } from "./query.js";

export const getRecentTradesToolName = "get_recent_trades";

export const getRecentTradesToolDescription = "Get most recent trades for a security";

export const getRecentTradesToolSchema = getRecentTradesSchema;

export function createGetRecentTradesHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getRecentTradesSchema.parse(args);
    const rows = await getRecentTrades(client, params);
    return { content: [{ type: "text" as const, text: formatTable(rows, `Recent trades: ${params.security}`) }] };
  };
}
