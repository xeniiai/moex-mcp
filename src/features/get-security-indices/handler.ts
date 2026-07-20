import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { requireSecurityId } from "../../shared/security-id.js";
import { getSecurityIndicesSchema } from "./schema.js";
import { getSecurityIndices } from "./query.js";

export const getSecurityIndicesToolName = "get_security_indices";

export const getSecurityIndicesToolDescription = "Get all indices that contain a given security";

export const getSecurityIndicesToolSchema = getSecurityIndicesSchema;

export function createGetSecurityIndicesHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const security = requireSecurityId(getSecurityIndicesSchema.parse(args));
    const rows = await getSecurityIndices(client, security);
    return { content: [{ type: "text" as const, text: formatTable(rows, `Indices containing ${security}`) }] };
  };
}
