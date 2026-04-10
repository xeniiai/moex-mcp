import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function getHistoryDateRange(
  client: IssClientPort,
  params: { security: string; engine: string; market: string; board?: string },
): Promise<Record<string, unknown>[]> {
  let path: string;

  if (params.board) {
    path = `/history/engines/${params.engine}/markets/${params.market}/boards/${params.board}/securities/${encodeURIComponent(params.security)}/dates`;
  } else {
    path = `/history/engines/${params.engine}/markets/${params.market}/securities/${encodeURIComponent(params.security)}/dates`;
  }

  const response = await client.get(path);
  return response.dates ?? [];
}
