import { z } from "zod";
import { securityIdFields } from "../../shared/security-id.js";

export const getSecurityIndicesSchema = z
  .object({
    ...securityIdFields,
  })
  ;
