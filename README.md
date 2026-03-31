# listingbureau-mcp

MCP server for [Listing Bureau](https://listingbureau.com) Amazon ranking services. Provides tools for managing projects, schedules, orders, wallet, and account settings.

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

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

Add to your project's `.mcp.json`:

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

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LB_API_KEY` | Yes | - | Listing Bureau API key |
| `LB_BASE_URL` | No | `https://listingbureau.com` | API base URL (override for staging/dev) |

## Tools

### Account (4 tools)

| Tool | Description |
|------|-------------|
| `lb_account_get` | Get account info (email, name, company, plan) |
| `lb_account_update_profile` | Update profile fields (first_name, last_name, company) |
| `lb_account_get_service_rates` | Get current service pricing rates |
| `lb_account_get_subscription` | Get subscription info (plan, fee, discount) |

### Wallet (3 tools)

| Tool | Description |
|------|-------------|
| `lb_wallet_get_balance` | Get wallet balance (credits and USD) |
| `lb_wallet_get_transactions` | Get transaction history (paginated) |
| `lb_wallet_topup` | Generate a Stripe checkout URL to top up wallet balance |

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

### Orders (3 tools)

| Tool | Description |
|------|-------------|
| `lb_orders_list` | List orders (paginated, newest first) |
| `lb_orders_get` | Get order details |
| `lb_orders_report_issue` | Report an issue with an order |

### Feedback (1 tool)

| Tool | Description |
|------|-------------|
| `lb_feedback_submit` | Submit feedback (10-5000 characters) |

**Total: 20 tools**

## Development

```bash
npm install
npm run build
npm run dev    # watch mode
npm test
```

## License

MIT
