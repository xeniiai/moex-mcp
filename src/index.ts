#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { IssClient } from "./shared/adapters/iss-client.adapter.js";
import { createServer } from "./server.js";

const client = new IssClient();
const server = createServer(client);

const transport = new StdioServerTransport();
await server.connect(transport);
