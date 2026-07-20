import { z } from "zod";

export const getMarketDataBatchSchema = z.object({
  securities: z
    .array(z.string().min(1))
    .min(1)
    .max(30)
    .describe("List of tickers / SECIDs (1–30), e.g. ['RU000A10C8F3','RU000A10F6Y5']"),
  engine: z.string().optional().default("stock").describe("Trading engine (default 'stock')"),
  market: z
    .string()
    .optional()
    .default("bonds")
    .describe("Market (default 'bonds' — peer bond comparison; use 'shares' for equities)"),
  board: z.string().optional().describe("Optional board filter (e.g. 'TQCB', 'TQBR')"),
});
