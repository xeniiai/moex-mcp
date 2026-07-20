import { z } from "zod";

/** Accept ISS-style `secid` or cyberash-style `security`. */
export const securityIdFields = {
  security: z
    .string()
    .optional()
    .describe("Ticker / SECID (e.g. 'SBER', 'RU000A10C8F3'). Alias of secid."),
  secid: z
    .string()
    .optional()
    .describe("Alias for security (ISS SECID). Use either security or secid."),
} as const;

export function refineSecurityId(
  data: { security?: string; secid?: string },
  ctx: z.RefinementCtx,
): void {
  if (!(data.security ?? data.secid)?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide security or secid",
      path: ["security"],
    });
  }
}

/** Resolve ticker after schema parse. Throws if both missing (should not happen after refine). */
export function requireSecurityId(params: { security?: string; secid?: string }): string {
  const id = (params.security ?? params.secid)?.trim();
  if (!id) {
    throw new Error("Provide 'security' or 'secid'");
  }
  return id;
}
