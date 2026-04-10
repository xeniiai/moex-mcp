import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function getBondYieldCurve(
  client: IssClientPort,
  params: { engine: string; date?: string },
): Promise<Record<string, unknown>[]> {
  const queryParams: Record<string, string | number> = {};
  if (params.date) queryParams.date = params.date;

  const response = await client.get(`/engines/${params.engine}/markets/zcyc`, queryParams);
  return response.yearyields ?? response.params ?? [];
}
