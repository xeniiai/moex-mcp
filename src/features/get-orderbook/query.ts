import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function getOrderbook(
  client: IssClientPort,
  params: { security: string; engine: string; market: string; board?: string },
): Promise<Record<string, unknown>[]> {
  let path: string;

  if (params.board) {
    path = `/engines/${params.engine}/markets/${params.market}/boards/${params.board}/securities/${encodeURIComponent(params.security)}/orderbook`;
  } else {
    path = `/engines/${params.engine}/markets/${params.market}/securities/${encodeURIComponent(params.security)}/orderbook`;
  }

  const response = await client.get(path);
  return response.orderbook ?? [];
}
