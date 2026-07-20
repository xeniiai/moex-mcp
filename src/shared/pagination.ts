import type { IssClientPort } from "./ports/iss-client.port.js";
import { MAX_AUTO_PAGES } from "./constants.js";

interface CursorRow {
  INDEX: number;
  TOTAL: number;
  PAGESIZE: number;
}

export interface PageResult {
  rows: Record<string, unknown>[];
  /** ISS cursor TOTAL when available (full series size for the query). */
  total: number | null;
  /** Offset used for the first request. */
  start: number;
  /** Next ISS `start` for another page, or null if exhausted / unknown. */
  next_start: number | null;
  has_more: boolean;
}

export async function fetchAllPages(
  client: IssClientPort,
  path: string,
  params: Record<string, string | number>,
  dataBlock: string,
  maxRows?: number,
  startOffset = 0,
): Promise<Record<string, unknown>[]> {
  const result = await fetchPages(client, path, params, dataBlock, maxRows, startOffset);
  return result.rows;
}

export async function fetchPages(
  client: IssClientPort,
  path: string,
  params: Record<string, string | number>,
  dataBlock: string,
  maxRows?: number,
  startOffset = 0,
): Promise<PageResult> {
  const allRows: Record<string, unknown>[] = [];
  let start = Math.max(0, startOffset);
  let total: number | null = null;
  let pageSize: number | null = null;

  for (let page = 0; page < MAX_AUTO_PAGES; page++) {
    const response = await client.get(path, { ...params, start });
    const rows = response[dataBlock];

    if (!rows || rows.length === 0) {
      return {
        rows: maxRows ? allRows.slice(0, maxRows) : allRows,
        total,
        start: startOffset,
        next_start: null,
        has_more: false,
      };
    }

    allRows.push(...rows);

    const cursorBlock = response[`${dataBlock}.cursor`] ?? response["history.cursor"];
    if (cursorBlock && cursorBlock.length > 0) {
      const cursor = cursorBlock[0] as unknown as CursorRow;
      total = cursor.TOTAL;
      pageSize = cursor.PAGESIZE;
      const nextStart = cursor.INDEX + cursor.PAGESIZE;

      if (maxRows && allRows.length >= maxRows) {
        const sliced = allRows.slice(0, maxRows);
        const consumed = startOffset + sliced.length;
        const hasMore = total !== null ? consumed < total : rows.length >= (pageSize ?? 100);
        return {
          rows: sliced,
          total,
          start: startOffset,
          next_start: hasMore ? consumed : null,
          has_more: hasMore,
        };
      }

      if (nextStart >= cursor.TOTAL) {
        return {
          rows: maxRows ? allRows.slice(0, maxRows) : allRows,
          total,
          start: startOffset,
          next_start: null,
          has_more: false,
        };
      }

      start = nextStart;
      continue;
    }

    // No cursor — single page / unknown total
    break;
  }

  const sliced = maxRows ? allRows.slice(0, maxRows) : allRows;
  const consumed = startOffset + sliced.length;
  const hasMore = total !== null ? consumed < total : false;

  return {
    rows: sliced,
    total,
    start: startOffset,
    next_start: hasMore ? consumed : null,
    has_more: hasMore,
  };
}
