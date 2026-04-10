import { z } from "zod";

export const getMarketTurnoversSchema = z.object({
  engine: z.string().optional().describe("Trading engine (e.g. 'stock'). If omitted, returns all engines"),
  market: z.string().optional().describe("Market (e.g. 'shares'). Requires engine to be set"),
  date: z.string().optional().describe("Date (YYYY-MM-DD). Defaults to current session"),
});
