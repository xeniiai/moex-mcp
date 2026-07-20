import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatJson, formatTable } from "../../shared/formatter.js";
import { getBondYieldCurveSchema } from "./schema.js";
import { getBondYieldCurve } from "./query.js";

export const getBondYieldCurveToolName = "get_bond_yield_curve";

export const getBondYieldCurveToolDescription =
  "Get zero-coupon yield curve (ZCYC) points from ISS /engines/{engine}/zcyc. Default response is JSON.";

export const getBondYieldCurveToolSchema = getBondYieldCurveSchema;

export function createGetBondYieldCurveHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getBondYieldCurveSchema.parse(args);
    const rows = await getBondYieldCurve(client, params);

    if (params.format === "markdown") {
      return {
        content: [{ type: "text" as const, text: formatTable(rows, "Zero-coupon yield curve") }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: formatJson({ engine: params.engine, date: params.date ?? null, points: rows }),
        },
      ],
    };
  };
}
