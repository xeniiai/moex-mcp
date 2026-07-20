#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { IssClient } from "./shared/adapters/iss-client.adapter.js";
import { createServer } from "./server.js";

const transportMode = (process.env.TRANSPORT ?? "stdio").toLowerCase();

async function runStdio(): Promise<void> {
  const client = new IssClient();
  const server = createServer(client);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function runHttp(): Promise<void> {
  const host = process.env.HOST ?? "0.0.0.0";
  const port = Number(process.env.PORT ?? "8030");
  const mcpPath = process.env.MCP_PATH ?? "/mcp";

  const transports: Record<string, StreamableHTTPServerTransport> = {};
  const app = createMcpExpressApp();

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });
  app.get("/ready", (_req, res) => {
    res.status(200).json({ status: "ready" });
  });

  app.post(mcpPath, async (req, res) => {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            transports[id] = transport;
          },
        });
        transport.onclose = () => {
          const id = transport.sessionId;
          if (id) delete transports[id];
        };
        const server = createServer(new IssClient());
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      } else {
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Bad Request: No valid session ID provided" },
          id: null,
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP POST error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  app.get(mcpPath, async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  app.delete(mcpPath, async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  app.listen(port, host, () => {
    console.log(`moex-mcp listening on http://${host}:${port}${mcpPath} (transport=${transportMode})`);
  });
}

if (transportMode === "streamable-http" || transportMode === "http") {
  await runHttp();
} else {
  await runStdio();
}
