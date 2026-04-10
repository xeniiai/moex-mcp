import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

interface MarketData {
  securities: Record<string, unknown>[];
  marketdata: Record<string, unknown>[];
}

export async function getMarketData(
  client: IssClientPort,
  params: { security?: string; engine: string; market: string; board?: string },
): Promise<MarketData> {
  let path: string;

  if (params.board) {
    path = `/engines/${params.engine}/markets/${params.market}/boards/${params.board}/securities`;
  } else {
    path = `/engines/${params.engine}/markets/${params.market}/securities`;
  }

  if (params.security) {
    path += `/${encodeURIComponent(params.security)}`;
  }

  const response = await client.get(path);
  return {
    securities: response.securities ?? [],
    marketdata: response.marketdata ?? [],
  };
}
