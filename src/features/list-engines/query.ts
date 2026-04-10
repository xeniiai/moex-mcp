import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function listEngines(client: IssClientPort): Promise<Record<string, unknown>[]> {
  const response = await client.get("/engines");
  return response.engines ?? [];
}
