import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function getFuturesOpenPositions(
  client: IssClientPort,
  params: { market: string; asset?: string; date?: string },
): Promise<Record<string, unknown>[]> {
  let path = `/statistics/engines/futures/markets/${params.market}/openpositions`;
  if (params.asset) {
    path += `/${encodeURIComponent(params.asset)}`;
  }

  const queryParams: Record<string, string | number> = {};
  if (params.date) queryParams.date = params.date;

  const response = await client.get(path, queryParams);
  return response.open_positions ?? [];
}
