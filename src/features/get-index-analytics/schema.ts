import { z } from "zod";

export const getIndexAnalyticsSchema = z.object({
  index: z.string().optional().describe("Index ID (e.g. 'IMOEX', 'RTSI'). If omitted, returns all indices"),
  date: z.string().optional().describe("Date (YYYY-MM-DD). Defaults to latest available"),
  tickers: z.boolean().optional().default(false).describe("If true, also return index composition with weights"),
});
