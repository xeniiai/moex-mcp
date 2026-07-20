import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable, truncateRows } from "../../shared/formatter.js";
import { requireSecurityId } from "../../shared/security-id.js";
import { getHistorySchema } from "./schema.js";
import { getHistory } from "./query.js";

export const getHistoryToolName = "get_history";

export const getHistoryToolDescription =
  "Get historical end-of-day trading data for a security over a date range. Defaults to stock/shares.";

export const getHistoryToolSchema = getHistorySchema;

export function createGetHistoryHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getHistorySchema.parse(args);
    const security = requireSecurityId(params);
    const rows = await getHistory(client, { ...params, security });
    const { rows: displayRows, truncated, total } = truncateRows(rows, 100);

    let text = formatTable(displayRows, `History: ${security}`);
    if (truncated) text += `\n\n*Showing 100 of ${total} rows.*`;

    return { content: [{ type: "text" as const, text }] };
  };
}
