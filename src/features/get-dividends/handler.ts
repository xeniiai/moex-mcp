import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { getDividendsSchema } from "./schema.js";
import { getDividends } from "./query.js";

export const getDividendsToolName = "get_dividends";

export const getDividendsToolDescription = "Get dividend payment history for a security";

export const getDividendsToolSchema = getDividendsSchema;

export function createGetDividendsHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const { security } = getDividendsSchema.parse(args);
    const rows = await getDividends(client, security);
    return { content: [{ type: "text" as const, text: formatTable(rows, `Dividends: ${security}`) }] };
  };
}
