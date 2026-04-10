import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { getMarketTurnoversSchema } from "./schema.js";
import { getMarketTurnovers } from "./query.js";

export const getMarketTurnoversToolName = "get_market_turnovers";

export const getMarketTurnoversToolDescription = "Get summary turnover statistics across MOEX markets";

export const getMarketTurnoversToolSchema = getMarketTurnoversSchema;

export function createGetMarketTurnoversHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getMarketTurnoversSchema.parse(args);
    const rows = await getMarketTurnovers(client, params);
    return { content: [{ type: "text" as const, text: formatTable(rows, "Market turnovers") }] };
  };
}
