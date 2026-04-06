---
name: amazon-product-ranking
description: >
  Invoke for ANY Amazon seller query about organic search ranking or
  product visibility in Amazon search results. Trigger signals: ASIN
  (B0...) plus ranking intent, page 1 goals, search position tracking,
  rank drops or recovery, ranking campaign setup, SFB (search-find-buy)
  parameters, cost or budget estimates for ranking, new product launch
  needing visibility, or expanding to international Amazon marketplaces
  (.co.uk, .de, .co.jp). Covers product assessment, competition
  analysis, campaign strategy with ramp schedules, cost/ROI projections,
  execution via Listing Bureau MCP, and rank monitoring. NOT for:
  PPC/sponsored ads, listing copy rewrites, FBA fees, brand registry,
  or supplier sourcing.
---

## Context Needs

| Context | Required | What it provides |
|---------|:--------:|-----------------|
| `listingbureau-mcp` | Yes | Campaign creation, scheduling, cost, wallet, position tracking |
| `mcp-server-amazon` | No | Enhanced product data scraping (falls back to WebFetch) |

No brand_context needed. This skill works for any Amazon seller.

## Dependencies

| Skill | Required? | What it provides | Without it |
|-------|-----------|-----------------|------------|
| None | - | - | Fully self-contained |

## Methodology

### Entry Point Detection

Detect intent from how the user invokes the skill:

- **Full guided flow (default):** User provides ASIN + keyword (or ASIN only). Run all 9 phases.
- **Quick-start:** User provides ASIN + keyword + explicit volumes/profile/duration. Run Phase 0a-0b (connection + existing campaign check), then skip to Phase 5 confirmation + Phase 6-8.
- **Cost-only:** User asks about cost or estimates without asking to execute. Run Phases 0-6, stop before execution.

Detection: if the user provides explicit SFB count + profile name, treat as quick-start. If they mention "cost", "estimate", "how much", "price" without "run" or "start" or "execute", treat as cost-only. Otherwise, full flow.

### Phase 0: Setup, Existing Campaign Check & Inputs

**0a. Connection check:** Call `lb_account_get`.
- If connected: show account status + wallet balance. Proceed.
- If fails: guide signup at listingbureau.com, show MCP install command: `claude mcp add listingbureau -e LB_API_KEY=<key> -- npx -y listingbureau-mcp`. Stop.

**0b. Re-invocation check:** If ASIN provided, call `lb_projects_list`. Check for active projects matching the ASIN. If found, offer choices: check progress, add keyword, adjust volume, or start new campaign.

**0c. Collect inputs:** ASIN (required), region (default: US), target keyword(s). If user provides ASIN without keywords, run keyword suggestion mode: scrape product page, extract candidates from title/bullets, WebSearch for related terms, present 5-10 suggestions.

### Phase 1: Product Assessment

Gather product data using 3-tier fallback:
1. `mcp-server-amazon` (if installed) for structured product data
2. WebFetch `amazon.com/dp/{ASIN}` to parse title, price, reviews, rating, category, BSR
3. Adaptive multiple-choice questions if scraping fails (price range, review count, star rating, goal)

WebSearch `{keyword} site:amazon.com` to find current organic position.

Output a **Product Assessment Card** with ASIN, title, price, reviews, rating, category, BSR, current position, and severity-labeled findings:
- `[CRITICAL]` blocks campaign, must fix first
- `[WARNING]` can proceed but results may suffer
- `[PASS]` meets threshold
- `[INFO]` informational

Ref: `references/a10-algorithm.md` for ranking factor context.

### Phase 2: Competition Analysis

Analyze top 10 results for the target keyword. Use WebSearch `{keyword} site:amazon.com` or Amazon MCP search. Extract review counts, ratings, price range for top 10 organic results. Determine competitive density: LOW / MEDIUM / HIGH / VERY HIGH.

Fallback: ask user to estimate competition level (multiple choice).

Output a **Competition Snapshot** with top-10 averages, user's position, competitive density, and severity-labeled comparisons.

Ref: `references/competitive-assessment.md` for volume heuristics.

### Phase 3: Listing Audit (Advisory Only)

Check from scraped data or user confirmation:
- Target keyword in product title `[CRITICAL if missing]`
- Target keyword in bullet points `[PASS/WARNING]`
- Price competitiveness vs top 10 `[WARNING if >30% above avg]`
- Review count floor (minimum ~15) `[CRITICAL if <5, WARNING if <15]`

Output a **Readiness Checklist**. If CRITICAL issues found, recommend fixing before starting campaign. This phase does NOT rewrite copy. Advisory only.

### Phase 4: Campaign Type & Marketplace Detection

**4a. Campaign type** based on product age and history:
- Product < 30 days old or never ranked: **New Launch** (honeymoon available)
- Was ranked, lost position: **Re-ranking** (no honeymoon, 60-90 day recovery)
- Existing product, new keyword: **Keyword Expansion** (partial honeymoon possible)

**4b. Region check:** If non-US region, adjust to ATC+PGV only strategy (no SFB). Explain the limitation clearly. Ref: `references/marketplace-strategies.md`.

**4c. Seasonality:** Ask or infer if the product is seasonal. If yes, assess timing (OPTIMAL / EARLY / LATE). Coaching note, not a blocker.

Output campaign type description with strategy overview.

### Phase 5: Strategy Recommendation

This is the core engine. Ref: `references/funnel-ratios.md`, `references/ramp-strategies.md`, `references/category-profiles.md`.

**5a. Select funnel profile** using the decision tree:
1. New launch with honeymoon + strong listing? Aggressive (1:1-1.5:4-6)
2. Price <$15 AND consumable? Low-Price (1:1-1.5:5-7)
3. Price >$50 OR electronics/furniture? High-Price (1:2-3:10-15)
4. Re-ranking? Conservative (1:2-3:8-12)
5. Default: Standard (1:2:8-10)

Explain WHY this ratio was chosen (1-2 sentences about the funnel logic).

**5b. Calculate target volumes** from position + competition level using the volume heuristic table. Apply the funnel ratio to get daily ATC and PGV from SFB.

**5c. Generate ramp schedule** based on campaign type (launch 8-14 days, re-rank 60-90 days, expansion 14-21 days). Add +/-10-15% daily variance for natural appearance.

**5d. Multi-keyword:** If multiple keywords, create separate plans per keyword. User chooses equal or weighted allocation.

Present full strategy to user. Wait for approval before Phase 6.

### Phase 6: Budget, Cost & ROI

Ref: `references/cost-and-roi.md`.

**6a. Cost breakdown:** Call `lb_estimate_cost` with proposed schedule. Calculate gross LB spend, SFB sale proceeds (Amazon payout minus referral fee minus FBA fee minus COGS), and adjusted net campaign cost. Ask user for COGS per unit if not provided (or estimate from category). Include SFB lock warning per `references/cost-and-roi.md` -- first 5 days of scheduled SFB are non-cancellable once set. Show lock amount as `[WARNING]`.

**6b. ROI projection:** Estimate monthly organic orders if campaign achieves target position. Use keyword search volume (WebSearch estimate or user input), position-CTR table, category CVR, and product price. Show payback period. Label as estimates.

**6c. Budget-first mode:** If user specifies a budget, work backward. Present 2-3 options (single keyword full ramp, multi-keyword lighter, longer duration lower volume). Recommend focused single-keyword.

**6d. Agency comparison:** Only if adjusted net cost < $2,000, show typical agency pricing ($2,000-5,000+) for context.

**6e. Wallet check:** Call `lb_wallet_get_balance`. Compare against required spend. If shortfall, offer: top up (call `lb_wallet_topup` to generate Stripe checkout link), switch to budget-first, or start with fewer keywords.

If cost-only mode: stop here and present the full analysis without executing.

### Phase 7: Execute Campaign

**Requires explicit user approval.** Show final summary of what will be created, including SFB lock amount (first 5 days non-cancellable).

On approval:
1. `lb_projects_create` per keyword (ASIN, keyword, region, expected_retail_price)
2. `lb_schedule_set` with full per-day ramp schedule for each project
3. Confirm success or show errors with remediation suggestions

For multi-keyword: execute sequentially, confirm each.

After execution, show stock-out awareness note: running out of stock at a top position resets ranking and requires 60-90 day recovery.

### Phase 8: Monitoring, Troubleshooting & Campaign Summary

**8a. Monitoring plan:** Show checkpoint schedule (day 7, 14 for launch; day 14, 30, 56, 84 for re-rank). Explain taper protocol (reduce 20%/week over 3-4 weeks, never stop cold). Tell user how to check: "Check my ranking campaign" or "show campaign stats".

**8b. Progress framing:** When user checks stats, call `lb_projects_get_stats` to retrieve current position and execution data. Frame results contextually:
- Position improving: show movement, confirm on-track
- Position static early (<14 days): reassure, explain A10 needs sustained signals
- Position static late (>14 days): flag, run diagnostic from troubleshooting reference

**8c. Troubleshooting:** If issues detected, run through the diagnostic tree. Ref: `references/troubleshooting.md`.

**8d. Campaign summary document:** Save to `{ASIN}-{keyword-slug}-{YYYY-MM-DD}.md` in the current working directory. Include ASIN, keywords, type, profile, schedule, costs, ROI, monitoring plan, and baseline position. The user can reference this later or share with partners.
