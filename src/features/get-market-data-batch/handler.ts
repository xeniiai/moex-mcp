import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatJson } from "../../shared/formatter.js";
import {
  MARKET_QUOTE_FIELDS,
  MARKET_YIELD_FIELDS,
  projectRows,
} from "../../shared/project-fields.js";
import { getMarketData } from "../get-market-data/query.js";
import { getMarketDataBatchSchema } from "./schema.js";

export const getMarketDataBatchToolName = "get_market_data_batch";

export const getMarketDataBatchToolDescription =
  "Get compact quotes+yields for multiple securities in one call (max 30). Ideal for peer bond comparison. Default market=bonds.";

export const getMarketDataBatchToolSchema = getMarketDataBatchSchema;

const CONCURRENCY = 6;

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export function createGetMarketDataBatchHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getMarketDataBatchSchema.parse(args);

    const items = await mapPool(params.securities, CONCURRENCY, async (security) => {
      try {
        const data = await getMarketData(client, {
          security,
          engine: params.engine,
          market: params.market,
          board: params.board,
        });
        return {
          security,
          ok: true as const,
          quotes: projectRows(data.marketdata, MARKET_QUOTE_FIELDS),
          yields: projectRows(data.marketdata_yields, MARKET_YIELD_FIELDS),
        };
      } catch (err) {
        return {
          security,
          ok: false as const,
          error: err instanceof Error ? err.message : String(err),
          quotes: [] as Record<string, unknown>[],
          yields: [] as Record<string, unknown>[],
        };
      }
    });

    return {
      content: [
        {
          type: "text" as const,
          text: formatJson({
            engine: params.engine,
            market: params.market,
            board: params.board ?? null,
            count: items.length,
            items,
          }),
        },
      ],
    };
  };
}
