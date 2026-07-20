import { z } from "zod";
import { securityIdFields } from "../../shared/security-id.js";

export const getHistorySchema = z.object({
  ...securityIdFields,
  engine: z.string().optional().default("stock").describe("Trading engine (default 'stock')"),
  market: z
    .string()
    .optional()
    .default("shares")
    .describe("Market (default 'shares'; use 'bonds' for bonds)"),
  board: z.string().optional().describe("Trading board (e.g. 'TQBR', 'TQCB')"),
  from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
  till: z.string().optional().describe("End date (YYYY-MM-DD)"),
  start: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0)
    .describe("ISS row offset for pagination (default 0). Use next_start from previous response."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(2000)
    .optional()
    .default(1000)
    .describe("Max rows to return after auto-paging ISS (default 1000, max 2000)"),
  format: z
    .enum(["json", "markdown"])
    .optional()
    .default("json")
    .describe("Response format (default json)"),
});
