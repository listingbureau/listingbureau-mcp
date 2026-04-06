# listingbureau-mcp

<a href="https://www.npmjs.com/package/listingbureau-mcp"><img src="https://img.shields.io/npm/v/listingbureau-mcp" alt="npm version" /></a>
<a href="https://www.npmjs.com/package/listingbureau-mcp"><img src="https://img.shields.io/npm/dm/listingbureau-mcp" alt="npm downloads" /></a>
<a href="https://github.com/listingbureau/listingbureau-mcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
<a href="https://github.com/listingbureau/listingbureau-mcp/stargazers"><img src="https://img.shields.io/github/stars/listingbureau/listingbureau-mcp?style=flat" alt="GitHub stars" /></a>
<img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node.js >= 20" />

Organic ranking campaigns for Amazon products, managed through your AI assistant.

The only ranking-focused Amazon MCP server. Create ranking campaigns, set campaign schedules, track keyword positions, and monitor rank movement from Claude, Cursor, or any MCP-compatible client.

Built on the same infrastructure associated with 1,700+ products reaching page one. Median time: 48 days. Past performance does not predict future results.

<p align="center">
  <img src="https://raw.githubusercontent.com/listingbureau/listingbureau-mcp/main/assets/demo.gif" alt="listingbureau-mcp demo" width="800" />
</p>

<div align="center">
<table>
  <tr>
    <td align="center"><strong>Works<br/>with</strong></td>
    <td align="center"><img src="https://img.shields.io/badge/Claude_Desktop-black?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude Desktop" /></td>
    <td align="center"><img src="https://img.shields.io/badge/Claude_Code-black?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude Code" /></td>
    <td align="center"><img src="https://img.shields.io/badge/Cursor-black?style=for-the-badge&logo=cursor&logoColor=white" alt="Cursor" /></td>
    <td align="center"><img src="https://img.shields.io/badge/OpenClaw-black?style=for-the-badge" alt="OpenClaw" /></td>
    <td align="center"><img src="https://img.shields.io/badge/Any_MCP_Client-black?style=for-the-badge" alt="Any MCP Client" /></td>
  </tr>
</table>
<em>If it speaks MCP, it'll replace your ranking agency.</em>
</div>

## 🚀 What it does

This MCP server connects your AI assistant to [Listing Bureau](https://listingbureau.com/mcp?utm_source=github&utm_medium=readme&utm_campaign=mcp)'s Amazon ranking infrastructure. Three signal types drive organic rank improvement:

- **Search-Find-Buy (SFB)** signals the A10 algorithm that real shoppers searched for a keyword, found the product, and purchased it
- **Add-to-Cart (ATC)** builds conversion intent and purchase intent signals
- **Page Views (PGV)** generate session-level browsing behavior that supports organic discovery

Your assistant handles the entire workflow: create a project for any ASIN and keyword, set a daily campaign schedule, estimate costs before committing, and pull position reports to track movement.

## 📦 Quick start

### Claude Desktop (one-click)

Download the Desktop Extension and double-click to install. Claude Desktop will prompt for your API key.

**[Download listingbureau-mcp.mcpb](https://github.com/listingbureau/listingbureau-mcp/releases/latest/download/listingbureau-mcp.mcpb)** (requires Claude Desktop 4.0+)

<details>
<summary>Manual config (alternative)</summary>

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "listingbureau": {
      "command": "npx",
      "args": ["listingbureau-mcp"],
      "env": {
        "LB_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

</details>

### Claude Code

```bash
claude mcp add listingbureau -- npx listingbureau-mcp
```

Then set your API key in the MCP config.

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "listingbureau": {
      "command": "npx",
      "args": ["listingbureau-mcp"],
      "env": {
        "LB_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 🔑 Get an API key

Create an account at [listingbureau.com](https://listingbureau.com/mcp?utm_source=github&utm_medium=readme&utm_campaign=mcp-signup). Your API key is in the dashboard under Settings.

## ⚙️ Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LB_API_KEY` | Yes | - | Listing Bureau API key |
| `LB_BASE_URL` | No | `https://listingbureau.com` | API base URL (override for staging/dev) |

## 🔧 Tools

21 tools across 7 categories.

### 📂 Projects (6 tools)

| Tool | Description |
|------|-------------|
| `lb_projects_list` | List projects with optional region/active filters |
| `lb_projects_create` | Create a new Amazon project (ASIN + keyword + region) |
| `lb_projects_get` | Get project details (schedule, services, SERP data) |
| `lb_projects_update` | Update project (pause/resume) |
| `lb_projects_archive` | Archive (soft delete) a project |
| `lb_projects_get_stats` | Get daily stats (SFB, ATC, PGV, SERP, ARA, BR, SQR) |

### 📅 Schedule (3 tools)

| Tool | Description |
|------|-------------|
| `lb_schedule_get` | Get current per-day schedule |
| `lb_schedule_set` | Set full per-day schedule (replaces existing) |
| `lb_schedule_quick_set` | Quick-set uniform daily volumes |

### 💲 Cost Estimation (1 tool)

| Tool | Description |
|------|-------------|
| `lb_estimate_cost` | Estimate campaign cost before committing. Computes total cost, daily averages, and wallet sustainability. |

### 💰 Wallet (3 tools)

| Tool | Description |
|------|-------------|
| `lb_wallet_get_balance` | Get wallet balance (credits and USD) |
| `lb_wallet_get_transactions` | Get transaction history (paginated) |
| `lb_wallet_topup` | Generate a Stripe checkout URL to top up wallet balance |

### 📦 Orders (3 tools)

| Tool | Description |
|------|-------------|
| `lb_orders_list` | List orders (paginated, newest first) |
| `lb_orders_get` | Get order details |
| `lb_orders_report_issue` | Report an issue with an order |

### 👤 Account (4 tools)

| Tool | Description |
|------|-------------|
| `lb_account_get` | Get account info (email, name, account status, wallet balance) |
| `lb_account_update_profile` | Update profile fields (first_name, last_name, company) |
| `lb_account_get_service_rates` | Get current service pricing rates |
| `lb_account_get_subscription` | Get subscription info (plan, fee, discount) |

### 💬 Feedback (1 tool)

| Tool | Description |
|------|-------------|
| `lb_feedback_submit` | Submit feedback, feature requests, or suggestions (10-5000 characters) |

## 🧠 Campaign methodology skill

The MCP server ships with a companion skill at [`skills/amazon-product-ranking/`](skills/amazon-product-ranking/) that provides a guided 9-phase campaign workflow. The skill teaches the AI how to use the tools effectively: product assessment, competition analysis, funnel profile selection, ramp schedules, cost/ROI projections, execution, and monitoring.

**Claude Code:** Copy or symlink the `skills/amazon-product-ranking/` folder into your `.claude/skills/` directory.

**Other platforms:** The server instructions reference the skill automatically. The AI can read the methodology from the GitHub link included in the instructions.

## 🛠️ Development

```bash
npm install
npm run build
npm run dev    # watch mode
npm test
```

## 🔗 Links

- [Landing page](https://listingbureau.com/mcp?utm_source=github&utm_medium=readme&utm_campaign=mcp-links)
- [Create an account](https://listingbureau.com/auth/signup?utm_source=github&utm_medium=readme&utm_campaign=mcp-links-signup)

## 📄 License

MIT
