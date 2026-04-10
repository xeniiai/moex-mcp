import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function listMarkets(
  client: IssClientPort,
  engine: string,
): Promise<Record<string, unknown>[]> {
  const response = await client.get(`/engines/${engine}/markets`);
  return response.markets ?? [];
}
