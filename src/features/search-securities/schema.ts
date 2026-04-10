import { z } from "zod";

export const searchSecuritiesSchema = z.object({
  query: z.string().describe("Search query: ticker, name, or ISIN (e.g. 'SBER', 'Сбербанк', 'RU0009029540')"),
  limit: z.number().optional().default(20).describe("Maximum number of results (default 20)"),
  engine: z.string().optional().describe("Filter by trading engine (e.g. 'stock', 'currency', 'futures')"),
  market: z.string().optional().describe("Filter by market (e.g. 'shares', 'bonds', 'index')"),
  is_trading: z.boolean().optional().describe("Only return actively traded securities"),
});
