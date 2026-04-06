# amazon-product-ranking

## Amazon Ranking Tool for Claude Code & AI Agents

The AI-powered Amazon SEO tool that runs organic product ranking campaigns from your AI assistant. Built on the [Listing Bureau Amazon MCP server](https://www.npmjs.com/package/listingbureau-mcp).

Stop guessing at signal volumes, funnel ratios, and ramp schedules. This skill turns any AI agent into a full Amazon product ranking strategist: from "I want to rank for this keyword" to a running campaign with optimal settings, cost projections, and monitoring.

Whether you need an **Amazon rank tracker**, an **Amazon listing optimization tool**, or a complete **Amazon campaign tool**, this skill handles the full workflow. Works for new product launches, re-ranking recovery campaigns, keyword expansion, and international Amazon marketplaces. The complete AI toolkit among **Amazon seller tools** and Amazon FBA tools.

---

## Quick Demo

```
You:    Rank my product B01MTJK06C for "stainless steel water bottle"

Agent:  Product Assessment
        ASIN: B01MTJK06C | Hydro Flask 32oz | $44.95 | 12,847 reviews (4.7)
        Position: #28 (page 3) for "stainless steel water bottle"
        [PASS] Reviews strong  [PASS] Rating above threshold
        [WARNING] Price 50% above category avg

        Competition: HIGH (top 10 avg 8,234 reviews)
        Strategy: Standard profile, 5 SFB/day peak, 14-day launch (~59 SFB)
        Cost: ~$3,260 gross, ~$2,160 adjusted (after SFB sale proceeds)
        ROI: ~$11,640/month organic revenue if page 1 achieved

        Ready to launch? [confirm to execute]

You:    Yes

Agent:  Campaign live. Project created, schedule set.
        Day 7 checkpoint: check position movement.
```

---

## Features

- **Amazon product ranking assessment** -- evaluate any product's readiness for a ranking campaign with severity-labeled findings
- **Competition analysis** -- assess keyword difficulty from top-10 competitor data to calibrate signal volumes
- **Amazon listing optimization audit** -- check keyword coverage, pricing, review thresholds. Advisory findings, not copy rewrites
- **AI-powered campaign strategy** -- select optimal funnel profiles (5 profiles for different product types), calculate volumes, generate progressive ramp schedules
- **Amazon rank tracker** -- monitor keyword position movement throughout the campaign with contextual progress framing
- **Cost breakdown with SFB sale proceeds** -- show gross spend AND net cost after accounting for revenue from SFB purchases
- **ROI projections** -- estimate organic revenue uplift and payback period at target position
- **Budget-first planning** -- work backward from a budget to find the best campaign configuration
- **Multi-keyword campaigns** -- run balanced campaigns across multiple keywords for one ASIN
- **International marketplace support** -- adjusted strategies for non-US Amazon regions (ATC+PGV when SFB unavailable)
- **New launch honeymoon exploitation** -- aggressive ramp strategy to capitalize on Amazon's 30-45 day visibility boost
- **Re-ranking recovery** -- 60-90 day 3-phase strategy for products that lost position
- **Troubleshooting diagnostics** -- systematic decision tree for campaigns not producing expected results
- **Re-invocation awareness** -- detects existing campaigns for an ASIN before creating duplicates

---

## Requirements

### Required

| Dependency | Purpose | Install |
|-----------|---------|---------|
| Listing Bureau account | Campaign infrastructure | Free signup at [listingbureau.com](https://listingbureau.com) |
| `listingbureau-mcp` | MCP server for campaign management | See install below |

### Optional (Enhances Automation)

| Dependency | What it adds | Without it |
|-----------|-------------|-----------|
| `mcp-server-amazon` | More reliable product data scraping | Skill uses WebFetch to scrape Amazon pages directly. Works but less reliable if Amazon changes HTML. |

---

## Install

### Claude Code

1. **Install the Listing Bureau MCP server** (if not already):
   ```bash
   claude mcp add listingbureau -e LB_API_KEY=your_key_here -- npx listingbureau-mcp
   ```

2. **Install the skill:**
   ```bash
   # Copy the skill folder to your Claude Code skills directory
   cp -r amazon-product-ranking ~/.claude/skills/amazon-product-ranking
   ```

3. **Optional -- install Amazon MCP for better product data:**
   ```bash
   claude mcp add amazon -- npx mcp-server-amazon
   ```

### OpenClaw / Other Agent Harnesses

Copy the `amazon-product-ranking/` folder to your agent's skills directory. The skill follows the standard SKILL.md + references structure.

### Claude.ai (ZIP Upload)

1. Download this folder as a ZIP
2. Upload to Claude.ai project knowledge
3. Reference the SKILL.md in your system prompt

---

## How It Works

The skill runs 9 phases internally. The user invokes one command and the skill handles the rest.

| Phase | What Happens |
|-------|-------------|
| 0. Setup | Verify MCP connection, check for existing campaigns, collect ASIN + keyword |
| 1. Product Assessment | Scrape product data (price, reviews, rating, category, BSR, position) |
| 2. Competition Analysis | Analyze top 10 results for keyword difficulty calibration |
| 3. Listing Audit | Check keyword coverage, pricing, review thresholds |
| 4. Campaign Type | Detect launch vs re-rank vs expansion, region, seasonality |
| 5. Strategy | Select funnel profile, calculate volumes, generate ramp schedule |
| 6. Cost & ROI | Full cost breakdown with SFB proceeds, ROI projection, wallet check |
| 7. Execute | Create projects and set schedules (requires user confirmation) |
| 8. Monitor | Tracking plan, troubleshooting guide, campaign summary document |

### Three Entry Points

- **Full flow:** `"Rank my product B01MTJK06C for 'water bottle'"` -- all 9 phases
- **Quick-start:** `"Quick campaign: B01MTJK06C, 'water bottle', 5 SFB, standard, 14 days"` -- skip assessment, go straight to strategy + execution
- **Cost-only:** `"What would a ranking campaign cost for B01MTJK06C?"` -- assessment through cost, no execution

### Funnel Profiles

The skill selects from 5 scientifically-calibrated funnel profiles based on product characteristics:

| Profile | SFB:ATC:PGV Ratio | Best For |
|---------|:-----------------:|----------|
| Conservative | 1:2-3:8-12 | Re-ranking, risk-averse |
| Standard | 1:2:8-10 | Most products (default) |
| Aggressive | 1:1-1.5:4-6 | New launches with strong listings |
| Low-Price | 1:1-1.5:5-7 | Products under $15, consumables |
| High-Price | 1:2-3:10-15 | Products over $50, electronics |

---

## How to Improve Amazon Ranking

Amazon's A10 algorithm ranks products based on keyword-level sales velocity, conversion rate, and click-through rate. Products that generate consistent purchase signals from keyword searches rank higher than products that don't.

The challenge: new products have no sales history. Products that lost rank need to overcome negative history. And the signal ratios (how many page views vs add-to-carts vs purchases) need to match natural shopping behavior for the product's category.

This skill encodes that domain expertise into automated campaign design, so sellers don't need to figure out the science themselves.

### What is the Amazon Honeymoon Phase?

When a new product is listed, Amazon grants a 30-45 day temporary visibility boost. During this window, strong purchase signals lead to lasting organic rank. Weak signals during this period are hard to recover from. The skill's launch strategy is designed to maximize this window.

### How Long Does Amazon Ranking Take?

- **New launches:** 7-21 days for page 1 with proper signal volume
- **Re-ranking (lost position):** 60-90 days across 3 phases
- **Keyword expansion:** 14-21 days for existing products targeting new keywords

Results depend on competition level, listing quality, and signal volume. The skill calibrates all three.

---

## File Structure

```
amazon-product-ranking/
  SKILL.md                              Main skill methodology
  README.md                             This file
  references/
    a10-algorithm.md                    Amazon ranking mechanics
    funnel-ratios.md                    Signal profiles and ratios
    ramp-strategies.md                  Launch/re-rank/expansion schedules
    category-profiles.md                Category-specific settings
    competitive-assessment.md           Competition analysis methods
    cost-and-roi.md                     Pricing, proceeds, ROI formulas
    marketplace-strategies.md           International region strategies
    troubleshooting.md                  Campaign diagnostic guide
```

---

## License

MIT
