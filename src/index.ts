#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { LBClient } from "./client/lb-client.js";
import { registerAccountTools } from "./tools/account.tools.js";
import { registerWalletTools } from "./tools/wallet.tools.js";
import { registerProjectsTools } from "./tools/projects.tools.js";
import { registerScheduleTools } from "./tools/schedule.tools.js";
import { registerOrdersTools } from "./tools/orders.tools.js";
import { registerFeedbackTools } from "./tools/feedback.tools.js";
import { registerCostTools } from "./tools/cost.tools.js";

const apiKey = process.env.LB_API_KEY;
if (!apiKey) {
  console.error("LB_API_KEY environment variable is required");
  process.exit(1);
}

const baseUrl =
  process.env.LB_BASE_URL || "https://listingbureau.com";

const client = new LBClient(apiKey, baseUrl);

const server = new McpServer({
  name: "listingbureau",
  version: "0.1.0",
});

registerAccountTools(server, client);
registerWalletTools(server, client);
registerProjectsTools(server, client);
registerScheduleTools(server, client);
registerOrdersTools(server, client);
registerFeedbackTools(server, client);
registerCostTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
