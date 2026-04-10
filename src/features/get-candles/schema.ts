import { z } from "zod";

export const getCandlesSchema = z.object({
  security: z.string().describe("Security ticker (e.g. 'SBER')"),
  engine: z.string().optional().default("stock").describe("Trading engine (default 'stock')"),
  market: z.string().optional().default("shares").describe("Market (default 'shares')"),
  board: z.string().optional().describe("Trading board (e.g. 'TQBR')"),
  interval: z.number().describe("Candle interval in minutes: 1, 10, 60, or 24 (daily). Use 24 for day candles"),
  from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
  till: z.string().optional().describe("End date (YYYY-MM-DD)"),
});
