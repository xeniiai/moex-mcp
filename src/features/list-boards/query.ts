import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function listBoards(
  client: IssClientPort,
  engine: string,
  market: string,
): Promise<Record<string, unknown>[]> {
  const response = await client.get(`/engines/${engine}/markets/${market}/boards`);
  return response.boards ?? [];
}
