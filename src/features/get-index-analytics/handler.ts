import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { getIndexAnalyticsSchema } from "./schema.js";
import { getIndexAnalytics } from "./query.js";

export const getIndexAnalyticsToolName = "get_index_analytics";

export const getIndexAnalyticsToolDescription =
  "Get MOEX index analytics and optionally index composition with weights (e.g. IMOEX, RTSI)";

export const getIndexAnalyticsToolSchema = getIndexAnalyticsSchema;

export function createGetIndexAnalyticsHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getIndexAnalyticsSchema.parse(args);
    const result = await getIndexAnalytics(client, params);

    const parts: string[] = [];
    const title = params.index ? `Index analytics: ${params.index}` : "All indices analytics";
    parts.push(formatTable(result.analytics, title));

    if (result.tickers.length > 0) {
      parts.push(formatTable(result.tickers, `Composition: ${params.index}`));
    }

    return { content: [{ type: "text" as const, text: parts.join("\n\n") }] };
  };
}
