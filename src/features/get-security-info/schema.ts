import { z } from "zod";
import { securityIdFields } from "../../shared/security-id.js";

export const getSecurityInfoSchema = z.object({
  ...securityIdFields,
  format: z
    .enum(["json", "markdown"])
    .optional()
    .default("json")
    .describe("Response format (default json)"),
  boards: z
    .enum(["primary", "traded", "all"])
    .optional()
    .default("primary")
    .describe(
      "Which boards to include: primary (default, is_primary=1), traded (is_traded=1, exclude REPO), or all",
    ),
});
