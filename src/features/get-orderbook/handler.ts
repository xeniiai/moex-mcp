import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { getOrderbookSchema } from "./schema.js";
import { getOrderbook } from "./query.js";

export const getOrderbookToolName = "get_orderbook";

export const getOrderbookToolDescription = "Get current order book (bid/ask depth) for a security";

export const getOrderbookToolSchema = getOrderbookSchema;

export function createGetOrderbookHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getOrderbookSchema.parse(args);
    const rows = await getOrderbook(client, params);
    return { content: [{ type: "text" as const, text: formatTable(rows, `Order book: ${params.security}`) }] };
  };
}
