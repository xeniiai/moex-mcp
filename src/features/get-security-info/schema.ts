import { z } from "zod";
import { securityIdFields } from "../../shared/security-id.js";

export const getSecurityInfoSchema = z
  .object({
    ...securityIdFields,
    format: z
      .enum(["json", "markdown"])
      .optional()
      .default("json")
      .describe("Response format (default json)"),
  })
  ;
