import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function getDividends(
  client: IssClientPort,
  security: string,
): Promise<Record<string, unknown>[]> {
  const response = await client.get(`/securities/${encodeURIComponent(security)}/dividends`);
  return response.dividends ?? [];
}
