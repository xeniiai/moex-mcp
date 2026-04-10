import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatKeyValue, formatTable } from "../../shared/formatter.js";
import { getSecurityInfoSchema } from "./schema.js";
import { getSecurityInfo } from "./query.js";

export const getSecurityInfoToolName = "get_security_info";

export const getSecurityInfoToolDescription =
  "Get full specification of a security: ISIN, face value, issue date, trading boards, etc.";

export const getSecurityInfoToolSchema = getSecurityInfoSchema;

export function createGetSecurityInfoHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const { security } = getSecurityInfoSchema.parse(args);
    const info = await getSecurityInfo(client, security);

    const descMap: Record<string, unknown> = {};
    for (const row of info.description) {
      if (row.name && row.value !== undefined) {
        descMap[String(row.name)] = row.value;
      }
    }

    const desc = formatKeyValue(descMap, `Security: ${security}`);
    const boards = formatTable(info.boards, "Trading boards");

    return { content: [{ type: "text" as const, text: `${desc}\n\n${boards}` }] };
  };
}
