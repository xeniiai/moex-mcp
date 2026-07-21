import { z } from "zod";

export const getBondSpreadsSchema = z.object({
  securities: z
    .array(z.string().min(1))
    .min(1)
    .max(30)
    .describe("Bond SECIDs (max 30)"),
  engine: z.string().optional().default("stock"),
  market: z.string().optional().default("bonds"),
  board: z.string().optional().describe("e.g. TQCB"),
  date: z.string().optional().describe("ZCYC date YYYY-MM-DD (default latest)"),
});
