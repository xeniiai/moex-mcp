import type { IssClientPort } from "../../shared/ports/iss-client.port.js";
import { formatTable } from "../../shared/formatter.js";
import { listBoardsSchema } from "./schema.js";
import { listBoards } from "./query.js";

export const listBoardsToolName = "list_boards";

export const listBoardsToolDescription = "List trading boards for a given engine and market";

export const listBoardsToolSchema = listBoardsSchema;

export function createListBoardsHandler(client: IssClientPort) {
  return async (args: Record<string, unknown>) => {
    const { engine, market } = listBoardsSchema.parse(args);
    const rows = await listBoards(client, engine, market);
    return { content: [{ type: "text" as const, text: formatTable(rows, `Boards: ${engine}/${market}`) }] };
  };
}
