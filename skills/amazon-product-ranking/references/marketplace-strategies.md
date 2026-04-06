# International Marketplace Strategies

## Region Support Overview

The Listing Bureau MCP server supports multiple Amazon regions. However, signal availability varies by region.

| Region | SFB Available | ATC Available | PGV Available |
|--------|:------------:|:------------:|:------------:|
| US (amazon.com) | Yes | Yes | Yes |
| UK (amazon.co.uk) | No | Yes | Yes |
| DE (amazon.de) | No | Yes | Yes |
| FR (amazon.fr) | No | Yes | Yes |
| IT (amazon.it) | No | Yes | Yes |
| ES (amazon.es) | No | Yes | Yes |
| JP (amazon.co.jp) | No | Yes | Yes |
| CA (amazon.ca) | No | Yes | Yes |
| AU (amazon.com.au) | No | Yes | Yes |

**Key difference:** SFB (Search-Find-Buy) is the strongest ranking signal but is currently only available for US Amazon through Listing Bureau. Non-US campaigns rely on ATC and PGV signals only.

## US Region Strategy (Full Signal Stack)

US campaigns use all three signal types: SFB + ATC + PGV. All funnel profiles in `funnel-ratios.md` apply as documented.

No special adjustments needed. This is the default strategy.

## Non-US Region Strategy (ATC + PGV Only)

Without SFB, the campaign lacks the strongest ranking signal (actual purchases through keyword search). ATC and PGV still work but require adjustments.

### Adjusted Funnel Ratios (No SFB)

Since SFB is not available, recalibrate the ATC:PGV ratio:

| Profile | ATC : PGV (no SFB) | Equivalent US Profile |
|---------|:-------------------:|:---------------------:|
| Conservative | 1 : 4-5 | Conservative |
| Standard | 1 : 3-4 | Standard |
| Aggressive | 1 : 2-3 | Aggressive |

### Volume Adjustments

Without SFB, more ATC and PGV signals are needed to achieve similar ranking impact. As a rough guide:

- **ATC volume:** 2-3x what the US strategy would use (ATC becomes the primary ranking signal)
- **PGV volume:** 1.5-2x what the US strategy would use
- **Campaign duration:** 1.5-2x longer than US equivalent

**Example comparison:**
```
US campaign (14-day launch, Standard):
  5 SFB + 10 ATC + 40 PGV per day

Equivalent non-US campaign:
  0 SFB + 25 ATC + 80 PGV per day
  Duration: 21-28 days instead of 14
```

### User Coaching for Non-US

Explain the limitation clearly:

```
SFB (search-find-buy purchases) is the strongest Amazon ranking signal
but is currently only available for US Amazon through Listing Bureau.

For {region}, the campaign uses add-to-cart and page view signals.
These work but require higher volumes and longer duration to achieve
comparable results.

If strong purchase-based signals are needed for {region}, the seller
would need to coordinate purchases themselves outside of Listing Bureau.
```

### Non-US Cost Implications

Without SFB, the cost structure changes significantly:
- **No product funding costs** (no purchases being made)
- **No SFB service fees** ($8.50/order savings)
- **No SFB proceeds** (no Amazon payouts since no sales)
- **Lower total cost** but also slower results

The cost output for non-US should omit the SFB proceeds section entirely and simplify to:

```
Campaign Cost (ATC + PGV only)
{dashes}
Keyword: "{keyword}" ({duration}-day {type})

Total ATC signals:     {atc_total}
Total PGV signals:     {pgv_total}
Estimated cost:        ${cost}

[INFO]  This campaign uses ATC and PGV signals only (SFB is not
        available for {region}). Cost is lower than a US campaign
        but results take longer to materialize.
```

## Multi-Region Campaigns

Some sellers list products across multiple Amazon regions. When the user mentions multiple regions:

1. **Create separate campaigns per region** -- each region has its own Amazon algorithm instance
2. **US gets SFB strategy**, others get ATC+PGV strategy
3. **Prioritize US first** if budget is limited (strongest signal availability = best ROI)
4. **Show combined cost** across all regions

## Region Detection

Determine region from:
1. **User specifies it** ("rank on amazon.co.uk")
2. **ASIN format** -- while ASINs can be the same across regions, the user's context usually indicates region
3. **Default: US** if no region specified -- most Listing Bureau users are US sellers
4. **Ask if ambiguous:** "Which Amazon marketplace? US (amazon.com), UK (amazon.co.uk), DE (amazon.de), or another region?"

## Region-Specific Notes

### UK / EU Markets
- VAT implications on SFB orders (if they become available in the future)
- Competition levels generally lower than US for equivalent keywords
- Smaller search volumes but less competitive

### Japan
- Very different consumer behavior -- reviews matter even more
- Translation quality of listings is critical
- Generally lower competition for non-Japanese sellers' products

### Canada / Australia
- Often used as test markets before US launch
- Lower search volumes, lower competition
- Good for validating product-market fit with ranking signals
