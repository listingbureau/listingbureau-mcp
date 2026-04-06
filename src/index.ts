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

let version = "0.0.0";
try {
  const require = createRequire(import.meta.url);
  const pkg = require("../package.json") as { version: string };
  version = version;
} catch {
  // CJS bundle (Smithery scanner) — import.meta.url unavailable, version not needed for scanning
}

const INSTRUCTIONS = [
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
  "",
  "SFB units are real Amazon purchases of the user's product. The retail price in the SFB cost is not a net expense — the seller receives it back as normal Amazon sale proceeds. The actual out-of-pocket cost per SFB is the service fee plus the 11% tax/transfer overhead on the retail price.",
  "",
  "CAMPAIGN METHODOLOGY:",
  "For guided campaign workflows (product assessment, competition analysis, strategy recommendation, cost/ROI, execution, monitoring), use the amazon-product-ranking skill.",
  "Skill: https://github.com/listingbureau/listingbureau-mcp/tree/main/skills/amazon-product-ranking",
  "The skill covers: entry point detection (full flow / quick-start / cost-only), funnel profile selection, ramp schedules, campaign types (new launch / re-ranking / keyword expansion), and troubleshooting.",
  "Without the skill, use the funnel ratios above and the lb_* tools directly.",
].join("\n");

function buildServer(apiKey: string, baseUrl: string) {
  const client = new LBClient(apiKey, baseUrl);

  const server = new McpServer(
    { name: "listingbureau", version: version },
    { instructions: INSTRUCTIONS },
  );

  registerAccountTools(server, client);
  registerWalletTools(server, client);
  registerProjectsTools(server, client);
  registerScheduleTools(server, client);
  registerOrdersTools(server, client);
  registerFeedbackTools(server, client);
  registerCostTools(server, client);

  return server;
}

// Smithery SDK exports
export default function createServer(args: { config: { lbApiKey?: string }; env?: Record<string, string | undefined> }) {
  const apiKey = args.config?.lbApiKey || args.env?.LB_API_KEY || "";
  let baseUrl = "https://listingbureau.com";
  if (args.env?.LB_BASE_URL) {
    baseUrl = validateBaseUrl(args.env.LB_BASE_URL);
  }
  return buildServer(apiKey, baseUrl).server;
}

export function createSandboxServer() {
  return createServer({ config: { lbApiKey: "" }, env: {} });
}

// Direct stdio execution (npx listingbureau-mcp)
async function main() {
  const apiKey = process.env.LB_API_KEY ?? "";
  let baseUrl = "https://listingbureau.com";
  if (process.env.LB_BASE_URL) {
    try {
      baseUrl = validateBaseUrl(process.env.LB_BASE_URL);
    } catch (e) {
      console.error((e as Error).message);
      process.exit(1);
    }
  }

  const server = buildServer(apiKey, baseUrl);
  const transport = new StdioServerTransport();
  await server.connect(transport);

  checkForUpdate(version).catch(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
