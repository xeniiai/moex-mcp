import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { fetchAllPages } from "../../shared/pagination.js";

export async function getHistory(
  client: IssClientPort,
  params: { security: string; engine: string; market: string; board?: string; from?: string; till?: string; limit: number },
): Promise<Record<string, unknown>[]> {
  let path: string;

  if (params.board) {
    path = `/history/engines/${params.engine}/markets/${params.market}/boards/${params.board}/securities/${encodeURIComponent(params.security)}`;
  } else {
    path = `/history/engines/${params.engine}/markets/${params.market}/securities/${encodeURIComponent(params.security)}`;
  }

  const queryParams: Record<string, string | number> = {};
  if (params.from) queryParams.from = params.from;
  if (params.till) queryParams.till = params.till;

  return fetchAllPages(client, path, queryParams, "history", params.limit);
}
