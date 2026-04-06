# Funnel Profiles and Signal Ratios

## Core Concept

Amazon's A10 algorithm evaluates keyword-level conversion funnels. A product that only receives purchases looks artificial. Real shoppers browse (PGV), some add to cart (ATC), and fewer actually buy (SFB). The funnel ratio defines how many of each signal type to send per day relative to purchases.

**Signal types:**
- **SFB (Search-Find-Buy)** -- a full purchase journey: search keyword, find product, buy it. Strongest ranking signal. Generates real Amazon orders.
- **ATC (Add-to-Cart)** -- search keyword, find product, add to cart but don't purchase. Signals strong purchase intent.
- **PGV (Page View)** -- search keyword, find product, view the listing page. Signals relevance and interest.

## Funnel Profiles

### Conservative (1 : 2-3 : 8-12)

For every 1 SFB, send 2-3 ATC and 8-12 PGV.

**When to use:**
- Re-ranking campaigns (no honeymoon, need sustained consistency)
- Products with uncertain listing quality
- Risk-averse sellers or first-time campaign users
- High-competition keywords where gradual improvement is safer

**Why this ratio works:** Mimics a low-converting product category where many people browse, some consider, few buy. Appears very natural to A10. Lower daily cost due to fewer SFB orders.

**Example at 3 SFB/day:** 3 SFB + 8 ATC + 30 PGV = 41 total daily signals

---

### Standard (1 : 2 : 8-10)

For every 1 SFB, send 2 ATC and 8-10 PGV.

**When to use:**
- Default profile for most campaigns
- Products with decent reviews (50+) and moderate competition
- Keyword expansion campaigns
- Established products seeking incremental improvement

**Why this ratio works:** Matches typical conversion rates across most Amazon categories (8-15% CVR). The 2:1 ATC-to-SFB ratio reflects genuine purchase consideration behavior.

**Example at 5 SFB/day:** 5 SFB + 10 ATC + 45 PGV = 60 total daily signals

---

### Aggressive (1 : 1-1.5 : 4-6)

For every 1 SFB, send 1-1.5 ATC and 4-6 PGV.

**When to use:**
- New product launches during honeymoon phase
- Products with strong listings (high images, A+ content, competitive price)
- Short-window campaigns (7-14 days) where speed matters
- Categories with high natural conversion rates (consumables, low-cost items)

**Why this ratio works:** Higher conversion ratio is sustainable for products with genuinely strong listings. During honeymoon, A10 is more forgiving of higher CVR because the product is new. This profile pushes maximum ranking impact.

**Risk:** If the listing doesn't actually convert well organically, the high ratio will look artificial once campaign signals stop. Only use when the listing quality justifies the conversion rate.

**Example at 5 SFB/day:** 5 SFB + 7 ATC + 25 PGV = 37 total daily signals

---

### Low-Price / Consumable (1 : 1-1.5 : 5-7)

For every 1 SFB, send 1-1.5 ATC and 5-7 PGV.

**When to use:**
- Products priced under $15
- Grocery, supplements, health & beauty consumables
- Products with high natural repeat purchase rates
- Impulse-buy categories

**Why this ratio works:** Low-price items have naturally higher conversion rates -- shoppers don't deliberate as long before purchasing. A $5 snack has 20-30% CVR vs. a $200 electronic at 5-8% CVR. The funnel can be steeper without looking suspicious.

**Example at 4 SFB/day:** 4 SFB + 5 ATC + 24 PGV = 33 total daily signals

---

### High-Price / Considered Purchase (1 : 2-3 : 10-15)

For every 1 SFB, send 2-3 ATC and 10-15 PGV.

**When to use:**
- Products priced over $50
- Electronics, furniture, appliances, premium goods
- Products where buyers research extensively before purchasing
- Categories with naturally low conversion rates (3-8%)

**Why this ratio works:** Expensive items have long consideration cycles. Many page views (research), moderate add-to-cart (comparison shopping), few purchases (deliberate decision). A high-ticket item with a 20% conversion rate would look extremely suspicious.

**Example at 3 SFB/day:** 3 SFB + 8 ATC + 38 PGV = 49 total daily signals

---

## Profile Selection Decision Tree

```
START
  |
  ├── Is this a NEW LAUNCH with honeymoon window?
  │     ├── YES → Is the listing fully optimized (images, A+, competitive price)?
  │     │           ├── YES → AGGRESSIVE
  │     │           └── NO  → STANDARD (fix listing first, then consider aggressive)
  │     └── NO  → continue
  |
  ├── Is the product priced under $15 AND consumable/grocery?
  │     ├── YES → LOW-PRICE / CONSUMABLE
  │     └── NO  → continue
  |
  ├── Is the product priced over $50 OR electronics/furniture/premium?
  │     ├── YES → HIGH-PRICE / CONSIDERED
  │     └── NO  → continue
  |
  ├── Is this a RE-RANKING campaign (lost position, need recovery)?
  │     ├── YES → CONSERVATIVE
  │     └── NO  → continue
  |
  └── Default → STANDARD
```

## Volume Calculation

Once the profile is selected, multiply the SFB target by the ratio to get daily ATC and PGV volumes.

**Formula:**
```
Daily ATC = SFB_per_day x ATC_multiplier
Daily PGV = SFB_per_day x PGV_multiplier
```

Use the midpoint of each ratio range for initial calculation. Adjust based on competition level:
- **Low competition:** Use lower end of ratio range
- **High competition:** Use higher end of ratio range

## Multi-Keyword Allocation

When running campaigns for multiple keywords on one ASIN:

1. **Each keyword gets its own balanced funnel** -- never share signals across keywords
2. **Each keyword needs its own LB project** -- one project per keyword
3. **Budget allocation options:**
   - **Equal split** -- same SFB/day per keyword (simpler, works for similar-priority keywords)
   - **Weighted** -- more volume on primary keyword, less on secondary (better when one keyword matters more)
4. **Total daily signals** = sum across all keyword projects

**Example: 2 keywords, Standard profile, weighted 60/40:**
- KW1 (primary): 3 SFB + 6 ATC + 27 PGV
- KW2 (secondary): 2 SFB + 4 ATC + 18 PGV
- Total daily: 5 SFB + 10 ATC + 45 PGV

## Profile Override

Users can override the recommended profile. When they do, show a brief note about the trade-off:

- Switching from Conservative to Aggressive: "Higher daily cost, faster results if listing converts well. Risk: rank decay if organic CVR doesn't match the campaign's implied conversion rate."
- Switching from Aggressive to Conservative: "Lower daily cost, slower but more sustainable. Good choice if uncertain about listing quality."
