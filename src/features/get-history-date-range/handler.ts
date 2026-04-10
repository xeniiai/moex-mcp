import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { getHistoryDateRangeSchema } from "./schema.js";
import { getHistoryDateRange } from "./query.js";

export const getHistoryDateRangeToolName = "get_history_date_range";

export const getHistoryDateRangeToolDescription =
  "Get the available date range for historical data of a security";

export const getHistoryDateRangeToolSchema = getHistoryDateRangeSchema;

export function createGetHistoryDateRangeHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const { security, ...rest } = getHistoryDateRangeSchema.parse(args);
    const rows = await getHistoryDateRange(client, { security, ...rest });
    return { content: [{ type: "text" as const, text: formatTable(rows, `Available date range: ${security}`) }] };
  };
}
