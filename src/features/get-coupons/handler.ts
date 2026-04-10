import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable, truncateRows } from "../../shared/formatter.js";
import { getCouponsSchema } from "./schema.js";
import { getCoupons } from "./query.js";

export const getCouponsToolName = "get_coupons";

export const getCouponsToolDescription = "Get coupon payment schedule for a bond";

export const getCouponsToolSchema = getCouponsSchema;

export function createGetCouponsHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const { security } = getCouponsSchema.parse(args);
    const rows = await getCoupons(client, security);
    const { rows: displayRows, truncated, total } = truncateRows(rows, 100);

    let text = formatTable(displayRows, `Coupons: ${security}`);
    if (truncated) text += `\n\n*Showing 100 of ${total} coupons.*`;

    return { content: [{ type: "text" as const, text }] };
  };
}
