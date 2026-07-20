import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { requireSecurityId } from "../../shared/security-id.js";
import { getOrderbookSchema } from "./schema.js";
import { getOrderbook } from "./query.js";

export const getOrderbookToolName = "get_orderbook";

export const getOrderbookToolDescription = "Get current order book (bid/ask depth) for a security";

export const getOrderbookToolSchema = getOrderbookSchema;

export function createGetOrderbookHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getOrderbookSchema.parse(args);
    const security = requireSecurityId(params);
    const rows = await getOrderbook(client, { ...params, security });
    return { content: [{ type: "text" as const, text: formatTable(rows, `Order book: ${security}`) }] };
  };
}
