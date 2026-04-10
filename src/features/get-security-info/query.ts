import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

interface SecurityInfo {
  description: Record<string, unknown>[];
  boards: Record<string, unknown>[];
}

export async function getSecurityInfo(
  client: IssClientPort,
  security: string,
): Promise<SecurityInfo> {
  const response = await client.get(`/securities/${encodeURIComponent(security)}`);
  return {
    description: response.description ?? [],
    boards: response.boards ?? [],
  };
}
