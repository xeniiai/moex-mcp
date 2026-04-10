import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { searchSecuritiesSchema } from "./schema.js";
import { searchSecurities } from "./query.js";

export const searchSecuritiesToolName = "search_securities";

export const searchSecuritiesToolDescription = "Search for securities on MOEX by ticker, name, or ISIN";

export const searchSecuritiesToolSchema = searchSecuritiesSchema;

export function createSearchSecuritiesHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = searchSecuritiesSchema.parse(args);
    const rows = await searchSecurities(client, params);
    return { content: [{ type: "text" as const, text: formatTable(rows, `Search results for "${params.query}"`) }] };
  };
}
