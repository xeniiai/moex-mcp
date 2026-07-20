import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export interface MarketData {
  securities: Record<string, unknown>[];
  marketdata: Record<string, unknown>[];
  marketdata_yields: Record<string, unknown>[];
}

export async function getMarketData(
  client: IssClientPort,
  params: { security: string; engine: string; market: string; board?: string },
): Promise<MarketData> {
  let path: string;

  if (params.board) {
    path = `/engines/${params.engine}/markets/${params.market}/boards/${params.board}/securities`;
  } else {
    path = `/engines/${params.engine}/markets/${params.market}/securities`;
  }

  path += `/${encodeURIComponent(params.security)}`;

  const response = await client.get(path);
  return {
    securities: response.securities ?? [],
    marketdata: response.marketdata ?? [],
    marketdata_yields: response.marketdata_yields ?? [],
  };
}
