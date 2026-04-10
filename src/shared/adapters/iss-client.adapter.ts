import { BASE_URL, DEFAULT_PARAMS, DEFAULT_TIMEOUT_MS } from "../constants.js";
import type { IssClientPort, IssResponse } from "../ports/iss-client.port.js";

export class IssClient implements IssClientPort {
  async get(path: string, params: Record<string, string | number> = {}): Promise<IssResponse> {
    const url = new URL(`${BASE_URL}${path}.json`);

    for (const [key, value] of Object.entries({ ...DEFAULT_PARAMS, ...params })) {
      url.searchParams.set(key, String(value));
    }

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`MOEX API error: ${response.status} ${response.statusText} for ${url.pathname}`);
    }

    const json = await response.json() as [{ charsetinfo: unknown }, ...IssResponse[]];
    const data = json[1];

    if (!data || typeof data !== "object") {
      throw new Error(`Unexpected response structure from ${url.pathname}`);
    }

    return data as unknown as IssResponse;
  }
}
