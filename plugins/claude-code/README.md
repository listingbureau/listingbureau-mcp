# Listing Bureau - Claude Code Plugin

Amazon organic ranking MCP server for Claude Code. Run ranking campaigns, track keyword positions, and monitor rank movement -- all from the Claude Code CLI.

## What's included

- **21 MCP tools** across 7 categories: Projects, Schedule, Cost Estimation, Wallet, Orders, Account, Feedback
- **Campaign methodology skill** -- a guided 9-phase workflow for product assessment, competition analysis, strategy, cost/ROI, execution, and monitoring

## Install

### From the marketplace (after acceptance)

```bash
/plugin install listingbureau@claude-plugins-official
```

### Local install (for testing)

```bash
claude plugin install --path ./plugins/claude-code
```

### Manual MCP setup (alternative)

```bash
claude mcp add listingbureau -e LB_API_KEY=your-api-key -- npx listingbureau-mcp
```

## API key setup

1. Create an account at [listingbureau.com](https://listingbureau.com/mcp?utm_source=github&utm_medium=plugin-readme&utm_campaign=claude-code)
2. Copy the API key from **Settings** in the dashboard
3. Set the environment variable before starting Claude Code:

```bash
export LB_API_KEY=your-api-key-here
```

Or add it to the shell profile (`~/.zshrc`, `~/.bashrc`, etc.) so it persists.

## Tools

| Category | Tools | Description |
|----------|-------|-------------|
| Projects | 6 | Create, list, get, update, archive projects + daily stats |
| Schedule | 3 | Get, set, quick-set daily campaign schedules |
| Cost Estimation | 1 | Estimate campaign cost, daily averages, wallet sustainability |
| Wallet | 3 | Balance, transactions, top-up via Stripe |
| Orders | 3 | List, get details, report issues |
| Account | 4 | Profile, service rates, subscription info |
| Feedback | 1 | Submit feedback and feature requests |

## Campaign methodology skill

The plugin includes a companion skill (`skills/amazon-product-ranking/`) that teaches Claude how to run a complete ranking campaign:

1. Product assessment and listing audit
2. Competition analysis
3. Funnel profile selection (Aggressive, Standard, Conservative, etc.)
4. Ramp schedule generation with daily variance
5. Cost/ROI projections
6. Campaign execution and monitoring

Trigger it by mentioning an ASIN with ranking intent, e.g. "Help me rank B0XXXXXXXXX for 'wireless earbuds'".

## Links

- [Listing Bureau](https://listingbureau.com/mcp?utm_source=github&utm_medium=plugin-readme&utm_campaign=claude-code)
- [GitHub](https://github.com/listingbureau/listingbureau-mcp)
- [npm](https://www.npmjs.com/package/listingbureau-mcp)

## License

MIT
