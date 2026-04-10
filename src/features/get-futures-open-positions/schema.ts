import { z } from "zod";

export const getFuturesOpenPositionsSchema = z.object({
  market: z.string().optional().default("forts").describe("Futures market (default 'forts')"),
  asset: z.string().optional().describe("Base asset code. If omitted, returns all assets"),
  date: z.string().optional().describe("Date (YYYY-MM-DD). Defaults to latest available"),
});
