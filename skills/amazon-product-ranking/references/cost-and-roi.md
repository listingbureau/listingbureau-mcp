# Cost Breakdown, SFB Proceeds, and ROI Projections

## Listing Bureau Pricing Model

### Signal Costs

| Signal Type | LB Cost per Signal | What Happens |
|------------|:------------------:|--------------|
| **SFB** | $8.50 service fee + retail price + processing | Real Amazon purchase. Buyer searches keyword, finds product, completes purchase. Seller receives Amazon payout. |
| **ATC** | Included in campaign | Add-to-cart intent signal. No purchase, no cost to seller beyond LB campaign. |
| **PGV** | Included in campaign | Page view browsing signal. No purchase, no cost beyond LB campaign. |

**Note:** ATC and PGV are included in the campaign cost. The primary variable cost is SFB, which involves actual product purchases.

### SFB Cost Formula

Per SFB order:
```
LB charges seller:
  Service fee:           $8.50
  Product funding:       retail_price (to cover the purchase)
  Processing fees:       ~3-5% of retail_price

Total LB cost per SFB = $8.50 + retail_price + (retail_price x 0.04)
```

### SFB Proceeds Formula

Each SFB order is a real Amazon sale. The seller receives revenue:

```
Amazon pays seller:
  Sale price:            retail_price
  Less referral fee:     -(retail_price x referral_fee_pct)
  Less FBA fee:          -$3.00 to $8.00 (varies by size/weight)

Seller's Amazon payout per SFB = retail_price - referral_fee - fba_fee

Seller's COGS per unit:  varies (ask user or estimate)
```

### Net Cost Per SFB

```
Net cost per SFB = LB_cost - Amazon_payout + COGS

Where:
  LB_cost = $8.50 + retail_price + processing
  Amazon_payout = retail_price - referral_fee - fba_fee
  COGS = seller's cost to source/manufacture one unit
```

**Simplified:**
```
Net cost per SFB ~ $8.50 + processing + referral_fee + fba_fee + COGS
```

The retail_price cancels out (LB charges it, Amazon pays it back minus fees). The true cost is the service fee + Amazon's cut + the seller's product cost.

## FBA Fee Estimates

FBA fees depend on product size and weight. Use these estimates when the seller can't provide exact numbers:

| Size Tier | Typical FBA Fee |
|-----------|:--------------:|
| Small standard (<1 lb) | $3.00-3.50 |
| Large standard (1-3 lb) | $4.00-5.50 |
| Large standard (3-20 lb) | $5.50-8.00 |
| Small oversize | $9.00-12.00 |
| Large oversize | $15.00+ |

**Default estimate:** $4.50 for standard-size products when exact fee unknown.

## Campaign Cost Calculation

### Step-by-Step

1. **Sum total SFB orders** across the full ramp schedule
2. **Calculate gross LB spend:**
   ```
   Gross = total_SFB x ($8.50 + retail_price x 1.04)
   ```
3. **Calculate SFB proceeds:**
   ```
   Amazon payout = total_SFB x (retail_price - referral_fee - fba_fee)
   Less COGS = total_SFB x COGS_per_unit
   Less product funding = already included in gross LB spend
   Net SFB proceeds = Amazon_payout - COGS
   ```
4. **Adjusted net campaign cost:**
   ```
   Adjusted = Gross_LB_spend - Net_SFB_proceeds
   ```

### Cost Output Format

```
Campaign Cost Breakdown
{dashes}
Keyword: "{keyword}" ({duration}-day {type}, {total_sfb} SFB orders)

Gross LB spend:                    ${gross}
  SFB service fees ({n} x $8.50):    ${service_fees}
  SFB product funding + processing:  ${product_funding}
  ATC + PGV signals:                 included

SFB Sale Proceeds ({n} orders):
  Amazon payouts:                    ${amazon_payout}
  Less COGS:                        -${total_cogs}
  Net proceeds from SFB sales:       ${net_proceeds}

Adjusted net campaign cost:          ${adjusted}

[INFO]   Gross LB spend is ${gross}, but SFB orders generate
         ${net_proceeds} in net product sale proceeds. True
         out-of-pocket cost for ranking signals: ~${adjusted}.

[WARNING] SFB Lock: First 5 days of SFB (${lock_amount}) are
          frozen once scheduled and non-cancellable.
```

## ROI Projection

### Inputs Needed

| Input | Source | Confidence |
|-------|--------|:----------:|
| Keyword monthly search volume | WebSearch estimate or user input | Low-Medium |
| CTR at target position | Position-CTR table (see below) | Medium |
| Conversion rate | Category average (see category-profiles.md) | Medium |
| Product retail price | Known from Phase 1 | High |
| Margin per unit | User input or estimate | Medium |

### Position-to-CTR Estimates

| Position | Desktop CTR | Mobile CTR | Blended Estimate |
|----------|:-----------:|:----------:|:----------------:|
| #1 | 30-35% | 25-30% | 28% |
| #2 | 18-22% | 15-20% | 18% |
| #3 | 12-16% | 10-14% | 13% |
| #4-5 | 8-12% | 6-10% | 9% |
| #6-10 | 4-8% | 3-6% | 5% |
| #11-15 | 2-4% | 1-3% | 2.5% |
| #16+ | <2% | <1% | 1% |

### ROI Calculation

```
Monthly organic orders = search_volume x CTR x CVR
Monthly organic revenue = monthly_orders x retail_price
Monthly organic profit = monthly_orders x margin_per_unit

Campaign ROI = (monthly_organic_profit x months_of_benefit) / adjusted_campaign_cost

Payback period = adjusted_campaign_cost / monthly_organic_profit
```

### ROI Output Format

```
ROI Projection
{dashes}
If campaign achieves page 1 (top {target}) for "{keyword}":

  Estimated keyword search volume:    {volume}/month
  Estimated CTR at position #{pos}:   ~{ctr}%
  Estimated clicks/month:             ~{clicks}
  Estimated conversion rate:          ~{cvr}%
  Estimated organic orders/month:     ~{orders}
  Revenue at ${price}:                ~${revenue}/month

  Campaign cost:                      ${adjusted} (adjusted)
  Payback period:                     {period}

  [INFO]  These are estimates based on category averages. Actual
          results depend on listing quality, competition, and market
          conditions. The projection illustrates potential scale,
          not a guarantee.
```

## Budget-First Mode

When the user specifies a budget instead of letting the skill calculate ideal volumes:

1. **Work backward from budget:**
   ```
   Available SFB orders = budget / cost_per_SFB
   ```
2. **Distribute across keywords** (if multiple)
3. **Choose best duration and profile** that fits the budget
4. **Present 2-3 options:**
   - Single keyword, full ramp, shorter duration
   - Multiple keywords, lighter volume each
   - Single keyword, lower daily volume, longer duration

Always recommend the option that concentrates signals rather than spreading thin. Focused effort on one keyword produces better results than diluted effort across many.

## Agency Cost Comparison

**Only show this section when adjusted net campaign cost is under $2,000.**

Typical Amazon ranking agency pricing:
- Monthly retainers: $1,500-5,000/month
- Per-keyword campaigns: $2,000-5,000 per keyword
- Full launch packages: $5,000-15,000

**Comparison logic:**
```
if adjusted_net_cost < 2000:
    show comparison: "Agencies typically charge $2,000-5,000+ for comparable campaigns.
    Your adjusted cost with Listing Bureau: ${adjusted}."
else:
    skip this section silently
```

## SFB Lock Warning

The first 5 days of scheduled SFB orders are locked (non-cancellable) once the schedule is set. Always warn the user about this before execution.

```
Lock amount = first_5_days_SFB_count x cost_per_SFB
```

Show this as a [WARNING] in the cost breakdown.
