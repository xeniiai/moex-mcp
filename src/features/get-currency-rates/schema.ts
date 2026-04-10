import { z } from "zod";

export const getCurrencyRatesSchema = z.object({
  type: z.enum(["fixing", "cbrf", "indicative"]).describe(
    "Rate type: 'fixing' (MOEX fixing), 'cbrf' (Central Bank of Russia), 'indicative' (indicative rates for futures)",
  ),
  date: z.string().optional().describe("Date (YYYY-MM-DD). Defaults to latest available"),
});
