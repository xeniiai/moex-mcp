import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function getBondYieldCurve(
  client: IssClientPort,
  params: { engine: string; date?: string },
): Promise<Record<string, unknown>[]> {
  const queryParams: Record<string, string | number> = {};
  if (params.date) queryParams.date = params.date;

  // ISS path is /engines/{engine}/zcyc (not .../markets/zcyc)
  const response = await client.get(`/engines/${params.engine}/zcyc`, queryParams);
  return response.yearyields ?? response.params ?? [];
}
