import { z } from "zod";
import { securityIdFields } from "../../shared/security-id.js";

export const getDividendsSchema = z
  .object({
    ...securityIdFields,
  })
  ;
