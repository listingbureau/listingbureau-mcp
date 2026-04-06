# Competitive Assessment and Volume Heuristics

## How to Assess Keyword Competition

Competition determines how many daily signals are needed. Ranking for a keyword where the top 10 have 20,000+ reviews requires more volume than a niche keyword where top results have 200 reviews.

## Data Gathering Methods

### Method 1: WebSearch (Always Available)

Search `{keyword} site:amazon.com` and analyze the top 10 organic results:

**Extract per result:**
- Product title
- Review count (from search snippet)
- Star rating
- Price
- Whether it's a sponsored result (exclude from analysis)

**Limitations:** WebSearch returns Google's view of Amazon, not Amazon's internal ranking. Position numbers may differ from actual Amazon search. Use as a proxy, not gospel.

### Method 2: Amazon MCP (If Installed)

`mcp-server-amazon` provides structured product search data directly from Amazon. More accurate than WebSearch for Amazon-specific ranking data.

### Method 3: User Input (Fallback)

If both methods fail, ask:

```
How competitive is this keyword on Amazon?
  a) Low -- top results have <500 reviews, niche category
  b) Medium -- top results have 500-5,000 reviews
  c) High -- top results have 5,000-20,000 reviews
  d) Very High -- top results have 20,000+ reviews, major brands
```

## Competition Levels

### Low Competition
- **Top 10 average reviews:** Under 500
- **Characteristics:** Niche category, few established brands, long-tail keywords
- **Volume needed:** 2-3 SFB/day is often sufficient
- **Expected timeline:** Page 1 within 7-14 days (launch) or 30-45 days (re-rank)

### Medium Competition
- **Top 10 average reviews:** 500-5,000
- **Characteristics:** Established category with room for new entrants, moderate brand presence
- **Volume needed:** 3-5 SFB/day
- **Expected timeline:** Page 1 within 14-21 days (launch) or 45-60 days (re-rank)

### High Competition
- **Top 10 average reviews:** 5,000-20,000
- **Characteristics:** Major category, strong brand presence, high search volume keywords
- **Volume needed:** 5-8 SFB/day
- **Expected timeline:** Page 1 within 21-30 days (launch) or 60-90 days (re-rank)

### Very High Competition
- **Top 10 average reviews:** 20,000+
- **Characteristics:** Dominant category (e.g., "phone case", "water bottle"), major brands with massive advertising budgets
- **Volume needed:** 8-15 SFB/day, often combined with advertising
- **Expected timeline:** Page 1 may take 30+ days (launch) or 90+ days (re-rank). Some keywords may not be achievable through ranking signals alone.

## Volume Heuristic Table

Cross-reference current position with competition level to find starting SFB/day:

| Current Position | Low Comp | Medium Comp | High Comp | Very High Comp |
|------------------|:--------:|:-----------:|:---------:|:--------------:|
| Not indexed | 2 | 3 | 4 | 5 |
| Page 5+ (#50+) | 2 | 3 | 4 | 6 |
| Page 3-5 (#20-50) | 2 | 4 | 5 | 8 |
| Page 2 (#10-20) | 3 | 5 | 7 | 10 |
| Page 1 bottom (#5-10) | 3 | 5 | 8 | 12 |
| Page 1 top (#1-5) | 4 | 6 | 10 | 15 |

**Notes:**
- "Page 1 top" volumes are for improving within page 1 or defending a top position
- Very high competition often requires complementary strategies (PPC, external traffic)
- These are starting points -- adjust based on results after day 7-14

## Competition Analysis Output Format

Present findings in this structure:

```
Competition: "{keyword}"
{line of dashes matching header width}
Top 10 Avg Reviews:    {number}
Top 10 Avg Rating:     {number} stars
Top 10 Price Range:    ${low}-${high}
Your Position:         #{position} (page {page})
Competitive Density:   {LOW / MEDIUM / HIGH / VERY HIGH}

{severity labels for each finding}
```

## Position Finding

To find the user's current position for a keyword:

1. **Amazon MCP search** (most accurate): Search the keyword, look for the ASIN in results
2. **WebSearch proxy:** Search `{keyword} {ASIN} site:amazon.com` -- if the ASIN appears, the product is indexed for that keyword
3. **LB position tracking:** After a project is created, `lb_projects_get_stats` tracks position daily
4. **User input:** Ask "Do you know your current position for this keyword?"
5. **Assume "not indexed"** if no data source returns a position -- safest default

## Competitive Advantages to Note

When analyzing competition, flag any advantages the user's product has:

- **Review count above top-10 average** -- strong social proof, ranking gains more likely to stick
- **Rating above top-10 average** -- better conversion expected
- **Price below category average** -- conversion advantage
- **FBA fulfillment** -- Prime badge gives CTR and conversion edge over FBM competitors
- **Recent listing optimization** -- fresh images, A+ content, updated bullets

Also flag disadvantages:
- **Review count well below top-10 average** -- harder to sustain gains
- **Rating below 4.0** -- conversion headwind
- **Price significantly above average** -- needs listing to justify premium
- **FBM fulfillment** -- missing Prime badge
