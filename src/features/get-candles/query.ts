import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { fetchAllPages } from "../../shared/pagination.js";

export async function getCandles(
  client: IssClientPort,
  params: { security: string; engine: string; market: string; board?: string; interval: number; from?: string; till?: string },
): Promise<Record<string, unknown>[]> {
  let path: string;

  if (params.board) {
    path = `/engines/${params.engine}/markets/${params.market}/boards/${params.board}/securities/${encodeURIComponent(params.security)}/candles`;
  } else {
    path = `/engines/${params.engine}/markets/${params.market}/securities/${encodeURIComponent(params.security)}/candles`;
  }

  const queryParams: Record<string, string | number> = { interval: params.interval };
  if (params.from) queryParams.from = params.from;
  if (params.till) queryParams.till = params.till;

  return fetchAllPages(client, path, queryParams, "candles", 500);
}
