import { z } from "zod";

export const getMarketDataSchema = z.object({
  security: z.string().optional().describe("Security ticker (e.g. 'SBER'). If omitted, returns all securities in the market"),
  engine: z.string().optional().default("stock").describe("Trading engine (default 'stock')"),
  market: z.string().optional().default("shares").describe("Market (default 'shares')"),
  board: z.string().optional().describe("Trading board (e.g. 'TQBR'). If omitted, returns data across all boards"),
});
