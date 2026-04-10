import { z } from "zod";

export const getSecurityIndicesSchema = z.object({
  security: z.string().describe("Security ticker (e.g. 'SBER', 'GAZP')"),
});
