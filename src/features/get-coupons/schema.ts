import { z } from "zod";

export const getCouponsSchema = z.object({
  security: z.string().describe("Bond ticker (e.g. 'SU26238RMFS4', 'RU000A1062M5')"),
});
