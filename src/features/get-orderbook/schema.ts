import { z } from "zod";
import { securityIdFields } from "../../shared/security-id.js";

export const getOrderbookSchema = z
  .object({
    ...securityIdFields,
    engine: z.string().optional().default("stock").describe("Trading engine (default 'stock')"),
    market: z.string().optional().default("shares").describe("Market (default 'shares')"),
    board: z.string().optional().describe("Trading board (e.g. 'TQBR')"),
  })
  ;
