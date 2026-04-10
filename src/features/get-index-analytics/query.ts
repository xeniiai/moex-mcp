import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

interface IndexAnalyticsResult {
  analytics: Record<string, unknown>[];
  tickers: Record<string, unknown>[];
}

export async function getIndexAnalytics(
  client: IssClientPort,
  params: { index?: string; date?: string; tickers: boolean },
): Promise<IndexAnalyticsResult> {
  const basePath = "/statistics/engines/stock/markets/index/analytics";
  const path = params.index ? `${basePath}/${encodeURIComponent(params.index)}` : basePath;

  const queryParams: Record<string, string | number> = {};
  if (params.date) queryParams.date = params.date;

  const response = await client.get(path, queryParams);
  const analytics = response.analytics ?? response.indices ?? [];

  let tickers: Record<string, unknown>[] = [];
  if (params.tickers && params.index) {
    const tickersResponse = await client.get(`${basePath}/${encodeURIComponent(params.index)}/tickers`, queryParams);
    tickers = tickersResponse.tickers ?? [];
  }

  return { analytics, tickers };
}
