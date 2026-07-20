/** Machine-friendly JSON for agents (preferred over markdown tables). */
export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function formatTable(rows: Record<string, unknown>[], title?: string): string {
  if (rows.length === 0) return title ? `## ${title}\n\nNo data available.` : "No data available.";

  const keys = Object.keys(rows[0]);
  const header = `| ${keys.join(" | ")} |`;
  const separator = `| ${keys.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${keys.map((k) => formatValue(row[k])).join(" | ")} |`).join("\n");

  const table = `${header}\n${separator}\n${body}`;
  return title ? `## ${title}\n\n${table}` : table;
}

export function formatKeyValue(data: Record<string, unknown>, title?: string): string {
  const lines = Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `- **${k}**: ${formatValue(v)}`);

  return title ? `## ${title}\n\n${lines.join("\n")}` : lines.join("\n");
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return formatNumber(value);
  return String(value);
}

function formatNumber(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) >= 1000) {
    return n.toLocaleString("ru-RU");
  }
  return String(n);
}

export function truncateRows(
  rows: Record<string, unknown>[],
  limit: number,
): { rows: Record<string, unknown>[]; truncated: boolean; total: number } {
  return {
    rows: rows.slice(0, limit),
    truncated: rows.length > limit,
    total: rows.length,
  };
}
