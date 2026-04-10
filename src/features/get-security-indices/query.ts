import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function getSecurityIndices(
  client: IssClientPort,
  security: string,
): Promise<Record<string, unknown>[]> {
  const response = await client.get(`/securities/${encodeURIComponent(security)}/indices`);
  return response.indices ?? [];
}
