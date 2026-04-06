# Campaign Troubleshooting Guide

## When to Troubleshoot

Run diagnostics when a campaign isn't producing expected results after the relevant checkpoint:
- **Launch campaigns:** No movement after day 7
- **Re-ranking campaigns:** No movement after day 30
- **Keyword expansion:** No movement after day 10

Minor position fluctuations (1-3 positions) in either direction are normal. Only diagnose when position is flat or declining over 5+ days.

## Diagnostic Decision Tree

```
Campaign not producing results
  |
  1. Are signals being delivered?
  |    |-- NO → Fulfillment issue (see below)
  |    |-- YES → continue
  |
  2. Has the listing changed during the campaign?
  |    |-- YES → Listing change impact (see below)
  |    |-- NO → continue
  |
  3. Has competition shifted?
  |    |-- YES → Competition shift (see below)
  |    |-- NO → continue
  |
  4. Is the conversion rate healthy?
  |    |-- NO → Conversion problem (see below)
  |    |-- YES → continue
  |
  5. Is the keyword too competitive for current volume?
  |    |-- YES → Volume insufficient (see below)
  |    |-- NO → continue
  |
  6. Is the product indexed for this keyword?
  |    |-- NO → Indexing problem (see below)
  |    |-- YES → Extended timeline needed
```

## Issue: Signal Fulfillment Delay

**Symptom:** `lb_projects_get_stats` shows execution count significantly below assigned count.

**Common causes:**
- Temporary fulfillment delays (usually resolves within 24-48 hours)
- Wallet balance insufficient (check `lb_wallet_get_balance`)
- Schedule not properly set (verify with `lb_schedule_get`)

**Actions:**
1. Check wallet balance -- top up if needed
2. Verify schedule is correctly set via `lb_schedule_get`
3. Wait 24-48h -- fulfillment delays are common and usually self-resolving
4. If persistent (3+ days below target), contact Listing Bureau support

## Issue: Listing Changed During Campaign

**Symptom:** Position stalled or declined after the seller made listing changes.

**Why this matters:** Amazon's A10 re-evaluates relevance when listing content changes. Title changes can reset keyword relevance. Price changes affect conversion rate calculations. Image changes affect CTR.

**Actions:**
1. Identify what changed (title, price, images, bullets, A+ content)
2. If title changed: check that the target keyword is still present
3. If price changed: assess whether the new price is competitive
4. **Recommendation:** Keep listings stable during active campaigns. Make changes between campaigns or after reaching target position.

## Issue: Competition Shift

**Symptom:** Position was improving then stalled or reversed, despite consistent signal delivery.

**Common causes:**
- New competitor entered with aggressive pricing or PPC campaign
- Existing competitor launched their own ranking campaign
- Seasonal demand shift (competitor ramped for peak season)

**Actions:**
1. Re-run competition analysis (Phase 2) to compare against baseline
2. Check if top-10 composition has changed
3. Options:
   a) Increase daily volume by 20-30% to match new competitive pressure
   b) Extend campaign duration to outlast the competitor's campaign
   c) Target a less competitive long-tail keyword instead
   d) Combine ranking signals with PPC advertising for reinforcement

## Issue: Low Conversion Rate

**Symptom:** Position stalled despite consistent signals. May also see brief position gains that quickly reverse.

**Why this matters:** A10 demotes listings with poor conversion rates. Ranking signals drive traffic to the listing, but if that traffic doesn't convert at a rate matching or exceeding the category average, A10 interprets this as a poor fit for the keyword.

**How to check:** The seller can view their conversion rate in Seller Central under Business Reports > Detail Page Sales and Traffic.

**Actions:**
1. Check CVR in Seller Central -- is it above or below category average?
2. If CVR is low, the listing itself needs work before more signals will help:
   - Main image quality and clarity
   - Title keyword relevance and readability
   - Bullet point persuasiveness
   - Price competitiveness
   - A+ content quality
   - Review count and rating
3. **Recommendation:** Pause or reduce campaign volume, fix listing, then resume.

## Issue: Volume Insufficient for Competition Level

**Symptom:** Gradual but very slow movement, or position hovering just below target.

**Why this matters:** Some keywords require more daily signals than initially estimated, especially if competition has increased since the campaign started.

**Actions:**
1. Re-assess competition level (may have been underestimated)
2. Options:
   a) Increase SFB by 20-30% (with proportional ATC/PGV increase)
   b) Extend campaign duration by 50%
   c) Switch to a less competitive long-tail variant of the keyword
   d) Add a complementary keyword to build broader relevance

## Issue: Product Not Indexed for Keyword

**Symptom:** No position data at all. Product doesn't appear anywhere in search results for the keyword.

**Why this matters:** If the product isn't indexed for a keyword, ranking signals for that keyword have nothing to build on. The keyword must be in the listing (title, bullets, or backend search terms) for Amazon to consider the product relevant.

**Actions:**
1. Verify the target keyword appears in the product title or bullet points
2. Check backend search terms in Seller Central
3. If keyword is missing from all listing fields: add it, wait 24-48h for re-indexing, then resume campaign
4. If keyword is present but product still not indexed: possible Amazon suppression. Check for listing issues in Seller Central.

## Issue: Extended Timeline Needed

**Symptom:** All diagnostics pass. Signals delivering, listing stable, competition unchanged, CVR healthy, just slow progress.

**Why this matters:** Some keyword/product combinations simply take longer. This is especially true for re-ranking campaigns where historical negative signals need to be overcome.

**Actions:**
1. Maintain current volume -- consistency is key
2. Extend campaign duration by 2-4 weeks
3. Monitor weekly rather than daily -- short-term fluctuations are noise
4. Set expectations: some campaigns take 60-90 days for meaningful results

## General Troubleshooting Tips

- **Don't panic at daily fluctuations.** Amazon re-indexes positions multiple times per day. A product can appear at #12 in the morning and #18 in the afternoon. Look at 3-5 day trends, not hourly snapshots.
- **Position tracking lag.** LB position tracking updates may lag behind real-time Amazon changes by 12-24 hours.
- **Weekday vs weekend variation.** Some categories show natural position fluctuation between weekdays and weekends due to different shopping patterns.
- **Patience is a strategy.** The most common mistake is stopping a campaign too early because day 5 didn't show movement. A10 needs sustained proof.

## When to Stop a Campaign

Stop (with taper) when:
- Target position reached and held for 5+ days
- Budget exhausted with no meaningful movement after 30+ days
- Fundamental listing issue identified that can't be fixed while campaign runs
- Product goes out of stock (pause immediately, resume when restocked)

Never stop because of 1-2 days of flat or slightly declining position. That's noise, not signal.
