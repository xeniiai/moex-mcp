import { z } from "zod";

export const getRecentTradesSchema = z.object({
  security: z.string().describe("Security ticker (e.g. 'SBER')"),
  engine: z.string().optional().default("stock").describe("Trading engine (default 'stock')"),
  market: z.string().optional().default("shares").describe("Market (default 'shares')"),
  board: z.string().optional().describe("Trading board (e.g. 'TQBR')"),
  limit: z.number().optional().default(50).describe("Maximum number of trades to return (default 50)"),
});
