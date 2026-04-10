import { z } from "zod";

export const listMarketsSchema = z.object({
  engine: z.string().optional().default("stock").describe("Trading engine (default 'stock')"),
});
