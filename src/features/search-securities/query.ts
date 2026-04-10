import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function searchSecurities(
  client: IssClientPort,
  params: { query: string; limit: number; engine?: string; market?: string; is_trading?: boolean },
): Promise<Record<string, unknown>[]> {
  const queryParams: Record<string, string | number> = {
    q: params.query,
    limit: params.limit,
  };

  if (params.engine) queryParams.engine = params.engine;
  if (params.market) queryParams.market = params.market;
  if (params.is_trading !== undefined) queryParams.is_trading = params.is_trading ? 1 : 0;

  const response = await client.get("/securities", queryParams);
  return response.securities ?? [];
}
