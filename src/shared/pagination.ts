import type { IssClientPort, IssResponse } from "./ports/iss-client.port.js";
import { MAX_AUTO_PAGES } from "./constants.js";

interface CursorRow {
  INDEX: number;
  TOTAL: number;
  PAGESIZE: number;
}

export async function fetchAllPages(
  client: IssClientPort,
  path: string,
  params: Record<string, string | number>,
  dataBlock: string,
  maxRows?: number,
): Promise<Record<string, unknown>[]> {
  const allRows: Record<string, unknown>[] = [];
  let start = 0;

  for (let page = 0; page < MAX_AUTO_PAGES; page++) {
    const response = await client.get(path, { ...params, start });
    const rows = response[dataBlock];

    if (!rows || rows.length === 0) break;

    allRows.push(...rows);

    if (maxRows && allRows.length >= maxRows) {
      return allRows.slice(0, maxRows);
    }

    const cursorBlock = response[`${dataBlock}.cursor`] ?? response["history.cursor"];
    if (!cursorBlock || cursorBlock.length === 0) break;

    const cursor = cursorBlock[0] as unknown as CursorRow;
    const nextStart = cursor.INDEX + cursor.PAGESIZE;

    if (nextStart >= cursor.TOTAL) break;

    start = nextStart;
  }

  return maxRows ? allRows.slice(0, maxRows) : allRows;
}
