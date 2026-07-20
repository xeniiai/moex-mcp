import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { requireSecurityId } from "../../shared/security-id.js";
import { getHistoryDateRangeSchema } from "./schema.js";
import { getHistoryDateRange } from "./query.js";

export const getHistoryDateRangeToolName = "get_history_date_range";

export const getHistoryDateRangeToolDescription =
  "Get the available date range for historical data of a security";

export const getHistoryDateRangeToolSchema = getHistoryDateRangeSchema;

export function createGetHistoryDateRangeHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getHistoryDateRangeSchema.parse(args);
    const security = requireSecurityId(params);
    const rows = await getHistoryDateRange(client, { ...params, security });
    return { content: [{ type: "text" as const, text: formatTable(rows, `Available date range: ${security}`) }] };
  };
}
