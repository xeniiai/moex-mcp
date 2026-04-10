import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { getFuturesOpenPositionsSchema } from "./schema.js";
import { getFuturesOpenPositions } from "./query.js";

export const getFuturesOpenPositionsToolName = "get_futures_open_positions";

export const getFuturesOpenPositionsToolDescription = "Get open interest / open positions for futures market";

export const getFuturesOpenPositionsToolSchema = getFuturesOpenPositionsSchema;

export function createGetFuturesOpenPositionsHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getFuturesOpenPositionsSchema.parse(args);
    const rows = await getFuturesOpenPositions(client, params);
    return { content: [{ type: "text" as const, text: formatTable(rows, "Futures open positions") }] };
  };
}
