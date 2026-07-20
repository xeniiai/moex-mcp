import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatJson, formatTable } from "../../shared/formatter.js";
import { pickFields, projectRows } from "../../shared/project-fields.js";
import { searchSecuritiesSchema } from "./schema.js";
import { searchSecurities } from "./query.js";

export const searchSecuritiesToolName = "search_securities";

export const searchSecuritiesToolDescription =
  "Search for securities on MOEX by ticker, name, or ISIN. Default response is compact JSON.";

export const searchSecuritiesToolSchema = searchSecuritiesSchema;

const SEARCH_FIELDS = [
  "secid",
  "shortname",
  "name",
  "isin",
  "is_traded",
  "type",
  "group",
  "primary_boardid",
  "marketprice_boardid",
  "emitent_title",
  "emitent_inn",
] as const;

export function createSearchSecuritiesHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = searchSecuritiesSchema.parse(args);
    const rows = await searchSecurities(client, params);
    const results = projectRows(rows, SEARCH_FIELDS);

    if (params.format === "markdown") {
      return {
        content: [
          {
            type: "text" as const,
            text: formatTable(results, `Search results for "${params.query}"`),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: formatJson({
            query: params.query,
            count: results.length,
            results: results.map((r) => pickFields(r, SEARCH_FIELDS)),
          }),
        },
      ],
    };
  };
}
