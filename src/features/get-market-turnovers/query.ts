import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

export async function getMarketTurnovers(
  client: IssClientPort,
  params: { engine?: string; market?: string; date?: string },
): Promise<Record<string, unknown>[]> {
  let path: string;

  if (params.engine && params.market) {
    path = `/engines/${params.engine}/markets/${params.market}/turnovers`;
  } else if (params.engine) {
    path = `/engines/${params.engine}/turnovers`;
  } else {
    path = "/turnovers";
  }

  const queryParams: Record<string, string | number> = {};
  if (params.date) queryParams.date = params.date;

  const response = await client.get(path, queryParams);
  return response.turnovers ?? [];
}
