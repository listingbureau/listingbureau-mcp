# listingbureau-mcp

Organic ranking campaigns for Amazon products, managed through your AI assistant.

The only ranking-focused Amazon MCP server. Create ranking campaigns, set velocity schedules, track keyword positions, and monitor rank movement from Claude, Cursor, or any MCP-compatible client.

Built on the same infrastructure that moved 1,700+ products to page one. Median time: 48 days.

## What it does

This MCP server connects your AI assistant to [Listing Bureau](https://listingbureau.com)'s Amazon ranking infrastructure. Three signal types drive organic rank improvement:

- **Search-Find-Buy (SFB)** signals the A10 algorithm that real shoppers searched for a keyword, found the product, and purchased it
- **Add-to-Cart (ATC)** builds conversion velocity and purchase intent signals
- **Page Views (PGV)** generate session-level browsing behavior that supports organic discovery

Your assistant handles the entire workflow: create a project for any ASIN and keyword, set a daily velocity schedule, estimate costs before committing, and pull position reports to track movement.

## Quick start

### Claude Desktop

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

### Get an API key

Create an account at [listingbureau.com](https://listingbureau.com). Your API key is in the dashboard under Settings.

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LB_API_KEY` | Yes | - | Listing Bureau API key |
| `LB_BASE_URL` | No | `https://listingbureau.com` | API base URL (override for staging/dev) |

## Tools

21 tools across 7 categories.

### Projects (6 tools)

| Tool | Description |
|------|-------------|
| `lb_projects_list` | List projects with optional region/active filters |
| `lb_projects_create` | Create a new Amazon project (ASIN + keyword + region) |
| `lb_projects_get` | Get project details (schedule, services, SERP data) |
| `lb_projects_update` | Update project (pause/resume) |
| `lb_projects_archive` | Archive (soft delete) a project |
| `lb_projects_get_stats` | Get daily stats (SFB, ATC, PGV, SERP, ARA, BR, SQR) |

### Schedule (3 tools)

| Tool | Description |
|------|-------------|
| `lb_schedule_get` | Get current per-day schedule |
| `lb_schedule_set` | Set full per-day schedule (replaces existing) |
| `lb_schedule_quick_set` | Quick-set uniform daily volumes |

### Cost Estimation (1 tool)

| Tool | Description |
|------|-------------|
| `lb_estimate_cost` | Estimate campaign cost before committing. Computes total cost, daily averages, and wallet sustainability. |

### Wallet (3 tools)

| Tool | Description |
|------|-------------|
| `lb_wallet_get_balance` | Get wallet balance (credits and USD) |
| `lb_wallet_get_transactions` | Get transaction history (paginated) |
| `lb_wallet_topup` | Generate a Stripe checkout URL to top up wallet balance |

### Orders (3 tools)

| Tool | Description |
|------|-------------|
| `lb_orders_list` | List orders (paginated, newest first) |
| `lb_orders_get` | Get order details |
| `lb_orders_report_issue` | Report an issue with an order |

### Account (4 tools)

| Tool | Description |
|------|-------------|
| `lb_account_get` | Get account info (email, name, account status, wallet balance) |
| `lb_account_update_profile` | Update profile fields (first_name, last_name, company) |
| `lb_account_get_service_rates` | Get current service pricing rates |
| `lb_account_get_subscription` | Get subscription info (plan, fee, discount) |

### Feedback (1 tool)

| Tool | Description |
|------|-------------|
| `lb_feedback_submit` | Submit feedback (10-5000 characters) |

## Development

```bash
npm install
npm run build
npm run dev    # watch mode
npm test
```

## Links

- [Landing page](https://listingbureau.com/mcp)
- [Create an account](https://listingbureau.com)

## License

MIT
