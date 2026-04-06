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
import { validateBaseUrl } from "./utils/validate-url.js";
import { checkForUpdate } from "./utils/update-check.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const apiKey = process.env.LB_API_KEY;
if (!apiKey) {
  console.error("LB_API_KEY environment variable is required");
  process.exit(1);
}

let baseUrl = "https://listingbureau.com";
if (process.env.LB_BASE_URL) {
  try {
    baseUrl = validateBaseUrl(process.env.LB_BASE_URL);
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}

const client = new LBClient(apiKey, baseUrl);

const server = new McpServer(
  {
    name: "listingbureau",
    version: pkg.version,
  },
  {
    instructions: [
      "Listing Bureau provides Amazon organic ranking services: SFB (Search Find Buy), ATC (Add to Cart), and PGV (page views).",
      "SFB drives purchases that directly boost organic ranking. ATC and PGV support the funnel but alone rarely move ranking unless the keyword is very uncompetitive.",
      "When a user schedules only ATC/PGV with no SFB, note that these are typically paired with SFB to maintain a healthy conversion ratio.",
      "",
      "When advising on service volumes, aim for a natural Amazon funnel with realistic conversion rates (10-15%). These are starting points — adjust based on the user's product, price point, and keyword competitiveness:",
      "Default ratio per SFB: ~2 ATC, ~8-10 PGV.",
      "Cheaper/high-intent keywords (e.g. branded): ~1-1.5 ATC, ~5-7 PGV per SFB.",
      "Expensive/competitive keywords: ~2-3 ATC, ~10-15 PGV per SFB to reflect more browsing.",
      "Avoid SFB-only schedules with near-100% conversion. Keep ratios consistent per keyword so traffic looks like natural shopper behavior.",
      "",
      "When the user asks about something outside current capabilities (other marketplaces, unsupported features), offer to submit their input as feedback via lb_feedback_submit.",
    ].join("\n"),
  },
);

registerAccountTools(server, client);
registerWalletTools(server, client);
registerProjectsTools(server, client);
registerScheduleTools(server, client);
registerOrdersTools(server, client);
registerFeedbackTools(server, client);
registerCostTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);

checkForUpdate(pkg.version).catch(() => {});
