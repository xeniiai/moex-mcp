import { z } from "zod";

export const getBondYieldCurveSchema = z.object({
  engine: z.string().optional().default("stock").describe("Trading engine (default 'stock')"),
  date: z.string().optional().describe("Date (YYYY-MM-DD). Defaults to latest available"),
  format: z
    .enum(["json", "markdown"])
    .optional()
    .default("json")
    .describe("Response format (default json)"),
});
