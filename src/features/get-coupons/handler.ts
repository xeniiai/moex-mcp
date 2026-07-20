import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatJson, formatTable, truncateRows } from "../../shared/formatter.js";
import { requireSecurityId } from "../../shared/security-id.js";
import { getCouponsSchema } from "./schema.js";
import { getCoupons } from "./query.js";

export const getCouponsToolName = "get_coupons";

export const getCouponsToolDescription =
  "Get coupon payment schedule for a bond. Pass security or secid. Default response is JSON.";

export const getCouponsToolSchema = getCouponsSchema;

export function createGetCouponsHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getCouponsSchema.parse(args);
    const security = requireSecurityId(params);
    const rows = await getCoupons(client, security);
    const { rows: displayRows, truncated, total } = truncateRows(rows, params.limit);

    if (params.format === "markdown") {
      let text = formatTable(displayRows, `Coupons: ${security}`);
      if (truncated) text += `\n\n*Showing ${params.limit} of ${total} coupons.*`;
      return { content: [{ type: "text" as const, text }] };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: formatJson({
            security,
            count: displayRows.length,
            total,
            truncated,
            coupons: displayRows,
          }),
        },
      ],
    };
  };
}
