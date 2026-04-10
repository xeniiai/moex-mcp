import { z } from "zod";

export const listBoardsSchema = z.object({
  engine: z.string().optional().default("stock").describe("Trading engine (default 'stock')"),
  market: z.string().optional().default("shares").describe("Market (default 'shares')"),
});
