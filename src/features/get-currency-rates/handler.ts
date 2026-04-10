import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { getCurrencyRatesSchema } from "./schema.js";
import { getCurrencyRates } from "./query.js";

export const getCurrencyRatesToolName = "get_currency_rates";

export const getCurrencyRatesToolDescription =
  "Get currency exchange rates: MOEX fixing, Central Bank of Russia (CBRF), or indicative rates for futures";

export const getCurrencyRatesToolSchema = getCurrencyRatesSchema;

export function createGetCurrencyRatesHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getCurrencyRatesSchema.parse(args);
    const rows = await getCurrencyRates(client, params);
    const typeLabel = { fixing: "MOEX Fixing", cbrf: "CBR Rates", indicative: "Indicative Rates" }[params.type];
    return { content: [{ type: "text" as const, text: formatTable(rows, `Currency rates: ${typeLabel}`) }] };
  };
}
