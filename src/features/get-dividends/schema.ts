import { z } from "zod";

export const getDividendsSchema = z.object({
  security: z.string().describe("Security ticker (e.g. 'SBER', 'GAZP')"),
});
