import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatJson, formatKeyValue, formatTable } from "../../shared/formatter.js";
import { requireSecurityId } from "../../shared/security-id.js";
import { getSecurityInfoSchema } from "./schema.js";
import { getSecurityInfo } from "./query.js";

export const getSecurityInfoToolName = "get_security_info";

export const getSecurityInfoToolDescription =
  "Get specification of a security: ISIN, face value, coupon, maturity, offer. By default returns only the primary board (skips long REPO board lists). Pass security or secid.";

export const getSecurityInfoToolSchema = getSecurityInfoSchema;

const BOARD_FIELDS = [
  "secid",
  "boardid",
  "title",
  "is_primary",
  "is_traded",
  "currencyid",
  "market",
  "engine",
  "history_from",
  "history_till",
] as const;

function isRepoBoard(board: Record<string, unknown>): boolean {
  const id = String(board.boardid ?? "").toUpperCase();
  const title = String(board.title ?? "").toLowerCase();
  return id.includes("RP") || title.includes("репо") || title.includes("repo");
}

function filterBoards(
  boards: Record<string, unknown>[],
  mode: "primary" | "traded" | "all",
): Record<string, unknown>[] {
  if (mode === "all") return boards;
  if (mode === "primary") {
    const primary = boards.filter((b) => Number(b.is_primary) === 1);
    return primary.length > 0 ? primary : boards.slice(0, 1);
  }
  return boards.filter((b) => Number(b.is_traded) === 1 && !isRepoBoard(b));
}

function projectBoard(board: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of BOARD_FIELDS) {
    if (board[key] !== undefined) out[key] = board[key];
  }
  return out;
}

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

    const boards = filterBoards(info.boards, params.boards).map(projectBoard);
    const primaryBoard =
      info.boards.find((b) => Number(b.is_primary) === 1) ?? info.boards[0] ?? null;

    if (params.format === "markdown") {
      const desc = formatKeyValue(description, `Security: ${security}`);
      const boardsTable = formatTable(boards, "Trading boards");
      return { content: [{ type: "text" as const, text: `${desc}\n\n${boardsTable}` }] };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: formatJson({
            security,
            description,
            primary_boardid: primaryBoard ? String(primaryBoard.boardid ?? "") : null,
            boards,
            boards_mode: params.boards,
            boards_total: info.boards.length,
          }),
        },
      ],
    };
  };
}
