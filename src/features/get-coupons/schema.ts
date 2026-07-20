import { z } from "zod";
import { securityIdFields } from "../../shared/security-id.js";

export const getCouponsSchema = z.object({
  ...securityIdFields,
  format: z
    .enum(["json", "markdown"])
    .optional()
    .default("json")
    .describe("Response format (default json)"),
  limit: z.number().optional().default(100).describe("Max coupon rows to return (default 100)"),
});
