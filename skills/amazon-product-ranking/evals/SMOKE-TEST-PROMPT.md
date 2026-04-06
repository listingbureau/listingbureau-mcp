# Smoke Test: amazon-product-ranking skill (LB MCP integration)

## Context
The `amazon-product-ranking` skill at `/Users/pret/Git/listingbureau-mcp/skills/amazon-product-ranking/` is built and reviewed. Evals cover workflow logic. This smoke test covers the live Listing Bureau MCP integration -- the only part that can't be tested without the server.

Read the skill's SKILL.md and references/ for full context on what each phase does.

## Preconditions
- `listingbureau-mcp` MCP server connected with a valid API key
- Wallet balance >= $5 (buffer for ATC+PGV costs, expected spend ~$1)
- No existing project for ASIN B0GKR3D7SZ with keyword "smoke test ranking eval" (if one exists from a previous run, archive it first)

## What to test

Run through these checks sequentially. Report PASS/FAIL for each with evidence.

### 1. Connection (Phase 0a)
- Call `lb_account_get` -- should return account status
- Call `lb_wallet_get_balance` -- should return a balance amount
- Verify balance >= $5, otherwise BLOCK the test

### 2. Existing campaign check (Phase 0b)
- Call `lb_projects_list` -- should return without error (empty or populated)
- If any projects exist, confirm the response includes ASIN, keyword, and status fields

### 3. Cost estimation (Phase 6) -- read-only, no spend
- Call `lb_estimate_cost` with uniform volumes: sfb=3, atc=6, pgv=24, num_days=14, retail_price=47.99, region=US
- Verify the response includes: estimate totals, wallet affordability, rates_used, and sfb_lock info
- Verify the math is plausible (SFB unit cost should be roughly $8.50 + $47.99 + processing)
- Call `lb_estimate_cost` again with region=UK and sfb=0, atc=10, pgv=40, num_days=14
- Verify it accepts a non-US ATC+PGV-only estimate without error

### 4. Wallet top-up link (Phase 6e)
- Call `lb_wallet_topup` for the minimum amount
- Verify it returns a Stripe checkout URL
- DO NOT complete the payment

### 5. Project lifecycle (Phase 7) -- ATC+PGV only, no SFB
This tests create -> schedule -> verify -> stats -> cleanup. No SFB to avoid the lock (SFB cost estimation was already validated in step 3 via read-only lb_estimate_cost).

- 5a. Call `lb_projects_create` with: asin="B0GKR3D7SZ", keyword="smoke test ranking eval", region="US", expected_retail_price=47.99
- 5b. Note the project `ui_id` from the response
- 5c. Call `lb_schedule_set` with a 1-day schedule: [{ date: tomorrow's date YYYY-MM-DD, atc: 1, sfb: 0, pgv: 2 }]
- 5d. Call `lb_schedule_get` for the project -- verify the schedule matches what was set
- 5e. Call `lb_projects_get_stats` for the project -- verify it returns without error (values may be zero)
- 5f. Call `lb_projects_update` with active=false to pause the project
- 5g. Call `lb_schedule_set` to clear the schedule: [{ date: tomorrow's date, atc: 0, sfb: 0, pgv: 0 }]
- 5h. Call `lb_projects_archive` to soft-delete the project
- 5i. Call `lb_projects_list` and confirm the archived project no longer appears in active results (use active=true filter)

### 6. Tool inventory check
Verify every MCP tool referenced in SKILL.md exists on the server. The skill references these tools:
- lb_account_get
- lb_projects_list
- lb_projects_create
- lb_projects_get_stats
- lb_schedule_set
- lb_schedule_get
- lb_estimate_cost
- lb_wallet_get_balance
- lb_wallet_topup

If any tool is missing or has a different name, flag it as a finding.

## Rules
- DO NOT use SFB in any schedule (sfb must be 0 in all lb_schedule_set calls)
- DO NOT skip the cleanup steps (5f-5i) -- the project must be paused, cleared, and archived
- If any step fails, continue with remaining steps but note the failure
- If a tool returns an unexpected schema, document the exact response shape

## Output
Write results to `/tmp/lb-smoke-test-results.md` with:
- Date and time
- Wallet balance at start and end
- PASS/FAIL per check with raw response summary
- Any findings (missing tools, unexpected schemas, discrepancies with SKILL.md)
- Final verdict: READY / BLOCKED (with blockers listed)
