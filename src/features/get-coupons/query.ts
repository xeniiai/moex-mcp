import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { fetchAllPages } from "../../shared/pagination.js";

export async function getCoupons(
  client: IssClientPort,
  security: string,
): Promise<Record<string, unknown>[]> {
  return fetchAllPages(
    client,
    `/securities/${encodeURIComponent(security)}/bondization`,
    {},
    "coupons",
    200,
  );
}
