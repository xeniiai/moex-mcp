import { z } from "zod";

export const getHistoryBatchSchema = z.object({
  securities: z
    .array(z.string().min(1))
    .min(1)
    .max(20)
    .describe("List of SECIDs / ISINs (1–20) for peers or portfolio history"),
  engine: z.string().optional().default("stock"),
  market: z.string().optional().default("bonds").describe("Default 'bonds'"),
  board: z.string().optional(),
  from: z.string().optional().describe("Start date YYYY-MM-DD"),
  till: z.string().optional().describe("End date YYYY-MM-DD"),
  limit: z.number().int().min(1).max(2000).optional().default(1000),
  yield_quality: z
    .enum(["raw", "clean"])
    .optional()
    .default("clean")
    .describe("Default clean — safer medians across peers"),
  offer_window_days: z.number().int().min(0).max(30).optional().default(7),
  coupon_window_days: z.number().int().min(0).max(30).optional().default(3),
});
