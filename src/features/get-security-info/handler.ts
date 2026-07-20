import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatJson, formatKeyValue, formatTable } from "../../shared/formatter.js";
import { requireSecurityId } from "../../shared/security-id.js";
import { getSecurityInfoSchema } from "./schema.js";
import { getSecurityInfo } from "./query.js";

export const getSecurityInfoToolName = "get_security_info";

export const getSecurityInfoToolDescription =
  "Get full specification of a security: ISIN, face value, coupon, maturity, offer, trading boards. Pass security or secid.";

export const getSecurityInfoToolSchema = getSecurityInfoSchema;

export function createGetSecurityInfoHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const params = getSecurityInfoSchema.parse(args);
    const security = requireSecurityId(params);
    const info = await getSecurityInfo(client, security);

    const description: Record<string, unknown> = {};
    for (const row of info.description) {
      if (row.name && row.value !== undefined) {
        description[String(row.name)] = row.value;
      }
    }

    if (params.format === "markdown") {
      const desc = formatKeyValue(description, `Security: ${security}`);
      const boards = formatTable(info.boards, "Trading boards");
      return { content: [{ type: "text" as const, text: `${desc}\n\n${boards}` }] };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: formatJson({ security, description, boards: info.boards }),
        },
      ],
    };
  };
}
