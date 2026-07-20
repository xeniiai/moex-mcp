import { z } from "zod";
import { securityIdFields } from "../../shared/security-id.js";

export const getHistorySchema = z
  .object({
    ...securityIdFields,
    engine: z.string().optional().default("stock").describe("Trading engine (default 'stock')"),
    market: z.string().optional().default("shares").describe("Market (default 'shares')"),
    board: z.string().optional().describe("Trading board (e.g. 'TQBR')"),
    from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    till: z.string().optional().describe("End date (YYYY-MM-DD)"),
    limit: z.number().optional().default(100).describe("Maximum number of rows (default 100)"),
  })
  ;
