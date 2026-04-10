import type { IssClientPort } from "../../shared/ports/iss-client.port.js";

const RATE_PATHS: Record<string, { path: string; block: string }> = {
  fixing: { path: "/statistics/engines/currency/markets/fixing", block: "fixing" },
  cbrf: { path: "/statistics/engines/currency/markets/selt/rates", block: "cbrf" },
  indicative: { path: "/statistics/engines/futures/markets/indicativerates/securities", block: "securities" },
};

export async function getCurrencyRates(
  client: IssClientPort,
  params: { type: string; date?: string },
): Promise<Record<string, unknown>[]> {
  const config = RATE_PATHS[params.type];
  if (!config) throw new Error(`Unknown rate type: ${params.type}`);

  const queryParams: Record<string, string | number> = {};
  if (params.date) queryParams.date = params.date;

  const response = await client.get(config.path, queryParams);
  return response[config.block] ?? [];
}
