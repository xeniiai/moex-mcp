import { z } from "zod";

export const getSecurityInfoSchema = z.object({
  security: z.string().describe("Security ticker (e.g. 'SBER', 'GAZP', 'SU26238RMFS4')"),
});
