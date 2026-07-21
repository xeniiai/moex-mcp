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

function createApp() {
  const allowedHosts = (process.env.ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  return createMcpExpressApp(
    allowedHosts.length > 0 ? { host: "0.0.0.0", allowedHosts } : { host: "0.0.0.0" },
  );
}

/** Stateless Streamable HTTP — preferred behind reverse proxies (no session sticky needed). */
async function runHttpStateless(): Promise<void> {
  const host = process.env.HOST ?? "0.0.0.0";
  const port = Number(process.env.PORT ?? "8030");
  const mcpPath = process.env.MCP_PATH ?? "/mcp";
  const app = createApp();

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });
  app.get("/ready", (_req, res) => {
    res.status(200).json({ status: "ready" });
  });

  app.post(mcpPath, async (req, res) => {
    const server = createServer(new IssClient());
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
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

  // Stateless mode has no SSE session stream
  app.get(mcpPath, (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    });
  });
  app.delete(mcpPath, (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    });
  });

  app.listen(port, host, () => {
    console.log(`moex-mcp listening on http://${host}:${port}${mcpPath} (stateless streamable-http)`);
  });
}

/** Stateful sessions — local debugging only; needs sticky sessions behind a proxy. */
async function runHttpStateful(): Promise<void> {
  const host = process.env.HOST ?? "0.0.0.0";
  const port = Number(process.env.PORT ?? "8030");
  const mcpPath = process.env.MCP_PATH ?? "/mcp";
  const transports: Record<string, StreamableHTTPServerTransport> = {};
  const app = createApp();

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
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Invalid or missing session ID" },
        id: null,
      });
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  app.delete(mcpPath, async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Invalid or missing session ID" },
        id: null,
      });
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  app.listen(port, host, () => {
    console.log(`moex-mcp listening on http://${host}:${port}${mcpPath} (stateful streamable-http)`);
  });
}

async function runHttp(): Promise<void> {
  const sessionMode = (process.env.MCP_SESSION_MODE ?? "stateless").toLowerCase();
  if (sessionMode === "stateful") {
    await runHttpStateful();
  } else {
    await runHttpStateless();
  }
}

if (transportMode === "streamable-http" || transportMode === "http") {
  await runHttp();
} else {
  await runStdio();
}
