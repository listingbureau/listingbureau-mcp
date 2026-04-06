# Listing Bureau - Cursor Integration

Amazon organic ranking MCP server for Cursor. Run ranking campaigns, track keyword positions, and monitor rank movement from Cursor's AI assistant.

## One-click install

Click the link below to add the Listing Bureau MCP server to Cursor:

[![Install in Cursor](https://img.shields.io/badge/Install_in-Cursor-blue?style=for-the-badge&logo=cursor&logoColor=white)](cursor://anysphere.cursor-deeplink/mcp/install?name=ListingBureau&config=eyJtY3BTZXJ2ZXJzIjp7Imxpc3RpbmdidXJlYXUiOnsiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsiLXkiLCJsaXN0aW5nYnVyZWF1LW1jcCJdLCJlbnYiOnsiTEJfQVBJX0tFWSI6InlvdXItYXBpLWtleS1oZXJlIn19fX0=)

> **Important:** After clicking, Cursor will open a config dialog. Replace `your-api-key-here` with the actual API key from the [Listing Bureau dashboard](https://listingbureau.com/auth/dashboard) before confirming.

## Manual setup

### Project-scoped (recommended)

Add to `.cursor/mcp.json` in the project root:

```json
{
  "mcpServers": {
    "listingbureau": {
      "command": "npx",
      "args": ["-y", "listingbureau-mcp"],
      "env": {
        "LB_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Global

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "listingbureau": {
      "command": "npx",
      "args": ["-y", "listingbureau-mcp"],
      "env": {
        "LB_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Get an API key

1. Create an account at [listingbureau.com](https://listingbureau.com/mcp?utm_source=github&utm_medium=cursor-readme&utm_campaign=cursor)
2. Go to **Settings** in the dashboard
3. Copy the API key and paste it into the config above

## What's included

21 MCP tools across 7 categories: Projects, Schedule, Cost Estimation, Wallet, Orders, Account, and Feedback. Full tool list in the [main README](../../README.md#-tools).

## Links

- [Listing Bureau](https://listingbureau.com/mcp?utm_source=github&utm_medium=cursor-readme&utm_campaign=cursor)
- [GitHub](https://github.com/listingbureau/listingbureau-mcp)
- [npm](https://www.npmjs.com/package/listingbureau-mcp)

## License

MIT
