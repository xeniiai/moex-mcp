import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { listEnginesSchema } from "./schema.js";
import { listEngines } from "./query.js";

export const listEnginesToolName = "list_engines";

export const listEnginesToolDescription = "List all available trading engines on MOEX (stock, currency, futures, etc.)";

export const listEnginesToolSchema = listEnginesSchema;

export function createListEnginesHandler(client: IssClientPort) {
  return async (_args: Record<string, unknown>) => {
    listEnginesSchema.parse(_args);
    const rows = await listEngines(client);
    return { content: [{ type: "text" as const, text: formatTable(rows, "Trading engines") }] };
  };
}
