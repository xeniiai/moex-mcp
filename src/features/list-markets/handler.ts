import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { listMarketsSchema } from "./schema.js";
import { listMarkets } from "./query.js";

export const listMarketsToolName = "list_markets";

export const listMarketsToolDescription = "List all markets available for a given trading engine";

export const listMarketsToolSchema = listMarketsSchema;

export function createListMarketsHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const { engine } = listMarketsSchema.parse(args);
    const rows = await listMarkets(client, engine);
    return { content: [{ type: "text" as const, text: formatTable(rows, `Markets for engine: ${engine}`) }] };
  };
}
