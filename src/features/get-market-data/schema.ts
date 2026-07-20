import { z } from "zod";
import { securityIdFields } from "../../shared/security-id.js";

export const getMarketDataSchema = z
  .object({
    ...securityIdFields,
    engine: z.string().optional().default("stock").describe("Trading engine (default 'stock')"),
    market: z
      .string()
      .optional()
      .default("shares")
      .describe("Market (default 'shares'; use 'bonds' for corporate/gov bonds)"),
    board: z.string().optional().describe("Trading board (e.g. 'TQBR', 'TQCB'). If omitted, all boards for this SECID"),
    format: z
      .enum(["json", "markdown"])
      .optional()
      .default("json")
      .describe("Response format (default json — compact quotes + yields)"),
  })
  ;
