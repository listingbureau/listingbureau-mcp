# Ramp Strategies and Schedules

## Why Ramp?

Starting a campaign at full volume on day 1 looks unnatural. Real products gain traction gradually -- word of mouth spreads, ads kick in, reviews accumulate. A10 expects velocity to build over time. Ramping mimics natural demand growth.

Similarly, stopping cold looks unnatural. Products don't go from 10 sales/day to zero overnight unless something went wrong. Always taper down.

## New Launch Schedule (8-14 Days)

Exploits the honeymoon phase. Front-loads signals while A10 is actively evaluating the new product.

**Target: reach peak volume by day 6, sustain through day 10, taper by day 14.**

| Day Range | Volume % | Purpose |
|-----------|:--------:|---------|
| Days 1-2 | 50% | Signal establishment -- introduce the product to the keyword |
| Days 3-5 | 75% | Acceleration -- build velocity while honeymoon is active |
| Days 6-10 | 100% | Peak -- maximum signals during the honeymoon evaluation window |
| Days 11-14 | 80% | Begin taper -- start transitioning to organic momentum |
| Day 15+ | 50-60% | Maintenance (optional) -- sustain gains while organic sales build |

**Example: 5 SFB/day peak, Standard profile (1:2:8)**

| Day | SFB | ATC | PGV | Total |
|-----|:---:|:---:|:---:|:-----:|
| 1-2 | 3 | 5 | 20 | 28 |
| 3-5 | 4 | 8 | 30 | 42 |
| 6-10 | 5 | 10 | 40 | 55 |
| 11-14 | 4 | 8 | 32 | 44 |
| 15+ | 3 | 6 | 20 | 29 |

**Total for 14-day launch (no maintenance):** ~59 SFB, ~116 ATC, ~458 PGV

### Launch Checkpoints

- **Day 3:** Signals should be executing as scheduled. Check `lb_projects_get_stats`.
- **Day 7:** First position movement expected. If no movement, listing may need attention.
- **Day 14:** Evaluate whether to continue maintenance or stop. If position reached page 1, begin taper. If still on page 2+, extend peak phase by 7 days.

---

## Re-Ranking Schedule (60-90 Days, 3 Phases)

No honeymoon available. A10 has existing (likely negative) history for this keyword. Recovery requires extended, consistent signals to overwrite the historical pattern.

### Phase 1: Signal Calibration (Weeks 1-4)

Rebuild baseline velocity. Show A10 that the product is generating consistent activity on this keyword again.

| Day Range | Volume % | Purpose |
|-----------|:--------:|---------|
| Days 1-3 | 25% | Soft start -- avoid sudden spike after period of inactivity |
| Days 4-7 | 40% | Gradual build |
| Days 8-14 | 60% | Establish consistent baseline |
| Days 15-28 | 75% | Prove sustained momentum |

### Phase 2: Acceleration (Weeks 5-8)

A10 has recalibrated expectations. Now push toward target position with full volume.

| Day Range | Volume % |
|-----------|:--------:|
| Days 29-56 | 100% |

### Phase 3: Stabilization (Weeks 9-12)

Prove the new ranking is sustainable. Gradually reduce signals while monitoring that organic sales maintain position.

| Day Range | Volume % | Purpose |
|-----------|:--------:|---------|
| Days 57-70 | 80% | Begin taper |
| Days 71-84 | 60% | Test organic sustainability |
| Day 85+ | 40% or stop | If position holds at 60%, reduce further or stop |

**Example: 4 SFB/day peak, Conservative profile (1:3:10)**

| Phase | Day Range | SFB | ATC | PGV |
|-------|-----------|:---:|:---:|:---:|
| Calibration | 1-3 | 1 | 3 | 10 |
| Calibration | 4-7 | 2 | 5 | 16 |
| Calibration | 8-14 | 3 | 7 | 24 |
| Calibration | 15-28 | 3 | 9 | 30 |
| Acceleration | 29-56 | 4 | 12 | 40 |
| Stabilization | 57-70 | 3 | 9 | 30 |
| Stabilization | 71-84 | 3 | 7 | 24 |

**Total for 84-day re-rank:** ~270 SFB, ~764 ATC, ~2,558 PGV

### Re-Ranking Checkpoints

- **Day 14:** Baseline established. Position may not have moved yet -- this is expected.
- **Day 30:** Should see initial movement (2-5 positions). If none, run diagnostic.
- **Day 56:** Should be within striking distance of target. If no movement at all, reassess keyword difficulty or listing quality.
- **Day 84:** Final assessment. If target not reached, decide: extend, pivot to different keyword, or accept current position.

---

## Keyword Expansion Schedule (14-21 Days)

Existing product with ranking history, targeting a new keyword. Partial honeymoon may apply if the keyword is genuinely new to the listing.

| Day Range | Volume % | Purpose |
|-----------|:--------:|---------|
| Days 1-3 | 40% | Introduce the product to the new keyword |
| Days 4-7 | 70% | Build relevance signals |
| Days 8-14 | 100% | Peak -- establish the product on this keyword |
| Days 15-21 | 80% | Taper |
| Day 22+ | 50% or stop | Maintenance based on results |

**Example: 5 SFB/day peak, Standard profile (1:2:8)**

| Day | SFB | ATC | PGV | Total |
|-----|:---:|:---:|:---:|:-----:|
| 1-3 | 2 | 4 | 16 | 22 |
| 4-7 | 3 | 7 | 28 | 38 |
| 8-14 | 5 | 10 | 40 | 55 |
| 15-21 | 4 | 8 | 32 | 44 |
| 22+ | 3 | 5 | 20 | 28 |

**Total for 21-day expansion (no maintenance):** ~81 SFB, ~166 ATC, ~664 PGV

---

## Taper Protocol

**Rule: Never stop a campaign abruptly.** Sudden velocity drops signal to A10 that something went wrong.

### Standard Taper (3-4 Weeks)

| Week | Reduction | Action |
|------|:---------:|--------|
| Week 1 | -20% | Reduce all signal types proportionally |
| Week 2 | -20% more | Continue reducing |
| Week 3 | -20% more | Monitor position closely |
| Week 4 | Stop or maintain minimum | If position holds, safe to stop |

At each step, check position. If position drops significantly after a reduction, hold at the current level for another week before reducing further.

### Emergency Taper (Stock-out, Budget Exhausted)

If signals must stop quickly, compress the taper into 5-7 days:
- Day 1-2: 60% of current volume
- Day 3-4: 30% of current volume
- Day 5-7: 10% of current volume (PGV only)

Even a compressed taper is better than cold stop.

---

## Schedule Generation Rules

When generating the actual per-day schedule for `lb_schedule_set`:

1. **Round to whole numbers** -- signal counts must be integers
2. **Minimum 1 of each type** -- never schedule 0 of any signal on an active day
3. **Maintain ratio at peak; approximate at reduced volumes** -- at 100% volume, each day's SFB:ATC:PGV matches the profile ratio exactly. At reduced volumes (ramp-up and taper), apply the volume percentage to the peak values of each signal type independently, then round up. This produces slightly different daily ratios at non-peak levels, which is acceptable and adds natural variance
4. **Add natural variance** -- vary daily volumes by +/-10-15% from the calculated amount (e.g., if target is 5 SFB, alternate between 4 and 6). Perfect consistency is itself a pattern.
5. **Weekend adjustment** -- optionally reduce weekend volume by 10-20% (real shopping patterns show slight weekend dips in many categories). This is a refinement, not a requirement.
