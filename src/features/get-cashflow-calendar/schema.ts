import { z } from "zod";

export const getCashflowCalendarSchema = z.object({
  holdings: z
    .array(
      z.object({
        security: z.string().min(1).describe("SECID / ISIN"),
        quantity: z
          .number()
          .positive()
          .optional()
          .default(1)
          .describe("Number of bonds (face units), default 1"),
      }),
    )
    .min(1)
    .max(50)
    .describe("Portfolio holdings"),
  horizon_months: z
    .number()
    .int()
    .min(1)
    .max(36)
    .optional()
    .default(12)
    .describe("Cashflow horizon in months (default 12, typical 12–24)"),
  from: z.string().optional().describe("Horizon start YYYY-MM-DD (default today UTC)"),
});
