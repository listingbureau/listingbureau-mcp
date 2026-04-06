# Amazon A10 Algorithm: Ranking Mechanics

## How Amazon Ranks Products

Amazon's A10 algorithm determines organic search result ordering. Unlike Google (which ranks pages), A10 ranks products within Amazon's marketplace. The core objective: surface products most likely to generate a sale for a given search query.

## Key Ranking Factors (Weighted)

### Tier 1: Strongest Signals
- **Sales volume on the keyword** -- the number of purchases that originate from a specific keyword search. This is THE dominant factor. A10 tracks which keyword the buyer searched before purchasing.
- **Conversion rate (CVR)** -- purchases divided by page views for that keyword. High CVR tells Amazon the product satisfies search intent.
- **Click-through rate (CTR)** -- clicks from search results divided by impressions. Driven by main image, title, price, rating, and review count.

### Tier 2: Strong Signals
- **Add-to-cart rate** -- signals purchase intent even without immediate conversion. A10 treats this as a leading indicator of future sales.
- **Page view volume** -- increased browsing activity signals growing interest and relevance.
- **External traffic** -- visits arriving from outside Amazon (social media, Google, direct links). A10 now weighs this positively as it brings net-new demand to the platform.
- **Review accumulation rate and rating** -- products accumulating positive reviews faster rank higher. Rating above 4.0 is baseline; above 4.5 is advantageous.

### Tier 3: Supporting Signals
- **Listing relevance** -- keyword presence in title, bullet points, backend search terms, and A+ content. Title keywords carry the most weight.
- **Seller authority** -- account age, performance metrics, return rate, customer service scores. Newer accounts may see slower ranking movement.
- **Inventory availability** -- stock-outs cause immediate rank decay. Amazon will not surface products that cannot be fulfilled.
- **Price competitiveness** -- not lowest-price-wins, but significantly overpriced listings for a category will underperform.
- **Fulfillment method** -- FBA (Fulfilled by Amazon) products receive a ranking advantage over FBM (Fulfilled by Merchant) due to faster delivery and Prime eligibility.

## The Honeymoon Phase

When a new product is listed (or re-listed after extended absence), Amazon grants a **30-45 day temporary visibility boost**. During this window:

- The product appears in search results at positions it hasn't "earned" through sales history
- Amazon monitors CTR, CVR, and sales volume more closely than usual
- Strong performance during the honeymoon leads to lasting organic rank
- Weak performance during the honeymoon is difficult (not impossible) to recover from

### Exploiting the Honeymoon

The honeymoon is a **testing window**, not a guarantee. Amazon gives the product exposure to see how buyers respond. The strategy:

1. **Listing must be fully optimized BEFORE launch** -- title, images, A+ content, bullet points, pricing. There is no second first impression.
2. **Front-load ranking signals** -- aggressive ramp in the first 7-14 days while Amazon is actively monitoring.
3. **Prioritize conversion** -- clicks and views that don't convert during honeymoon actively hurt ranking. Better to have fewer, high-quality signals than high volume with low conversion.
4. **Do not change the listing** -- mid-honeymoon changes (title, images, price) can reset the evaluation window and confuse the algorithm.

### Honeymoon Availability

- **New launches:** Full honeymoon applies (30-45 days)
- **Re-ranking:** NO honeymoon. The product has existing history. A10 requires extended proof of consistent performance to restore rank.
- **Keyword expansion:** Partial honeymoon possible if the keyword is genuinely new to the listing, but typically shorter (7-14 days).

## How Ranking Signals Work

Amazon's A10 evaluates signals at the **keyword level**, not the product level. A product can rank #1 for one keyword and #50 for another.

### Signal Authenticity

A10 distinguishes between organic and artificial signals based on behavioral patterns:

- **Natural funnel shape** -- real shoppers browse (page views), some add to cart, fewer purchase. A product that only gets purchases looks suspicious.
- **Session diversity** -- signals from varied geographic locations, devices, and browsing patterns appear more natural than uniform patterns.
- **Temporal distribution** -- real shopping happens across the day with natural peaks and valleys. Perfectly uniform hourly distribution is unnatural.
- **Keyword path** -- A10 tracks the search term used before each action. Signals must originate from keyword searches, not direct ASIN visits.

### Ranking Momentum and Decay

- **Momentum:** Consistent daily signals compound. Day 7 of a campaign is more effective than day 1 because A10 has accumulated evidence.
- **Decay:** Sudden signal stops cause rank loss. The algorithm interprets a volume drop as declining relevance. Always taper -- never stop cold.
- **Recovery:** Regaining lost rank takes 2-3x the effort of the initial campaign because A10 has negative history to overcome.

## Position and Sales Relationship

| Position | Estimated CTR | Notes |
|----------|:------------:|-------|
| #1 | 25-35% | Dominant position, captures majority of clicks |
| #2-3 | 15-25% | Strong positions, meaningful click share |
| #4-7 | 8-15% | Mid-page, still visible above fold on most devices |
| #8-15 | 3-8% | Bottom of page 1 / top of page 2 |
| #16-30 | 1-3% | Page 2-3, minimal organic traffic |
| #30+ | <1% | Effectively invisible to most shoppers |

Page 1 (positions 1-15 on desktop, 1-12 on mobile) captures ~85% of all clicks for a keyword. Moving from page 2 to page 1 is the single highest-impact position change.

## Practical Implications for Campaign Design

1. **Match signal ratios to natural shopping behavior** -- use funnel profiles that mirror real CVR for the product category
2. **Keyword-level targeting** -- every signal must trace back to a keyword search
3. **Sustained over burst** -- 14 days of consistent signals outperforms 3 days of heavy signals
4. **Taper, never stop** -- reduce volume 20%/week over 3-4 weeks when concluding
5. **Listing quality is prerequisite** -- signals drive traffic, but the listing must convert that traffic or ranking gains reverse
6. **Monitor, don't panic** -- meaningful rank movement typically takes 7-14 days of consistent signals
