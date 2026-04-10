import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function getRecentTrades(
  client: IssClientPort,
  params: { security: string; engine: string; market: string; board?: string; limit: number },
): Promise<Record<string, unknown>[]> {
  let path: string;

  if (params.board) {
    path = `/engines/${params.engine}/markets/${params.market}/boards/${params.board}/securities/${encodeURIComponent(params.security)}/trades`;
  } else {
    path = `/engines/${params.engine}/markets/${params.market}/securities/${encodeURIComponent(params.security)}/trades`;
  }

  const response = await client.get(path, { limit: params.limit });
  return response.trades ?? [];
}
