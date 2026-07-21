import { z } from "zod";

export const getLiquidityStatsSchema = z.object({
  securities: z
    .array(z.string().min(1))
    .min(1)
    .max(20)
    .describe("SECIDs to score (max 20)"),
  engine: z.string().optional().default("stock"),
  market: z.string().optional().default("bonds"),
  board: z.string().optional().describe("Prefer primary board e.g. TQCB"),
  from: z.string().describe("Period start YYYY-MM-DD"),
  till: z.string().optional().describe("Period end YYYY-MM-DD (default today)"),
});
