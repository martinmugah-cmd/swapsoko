# CHAPTER 7 — MATCH / COMPATIBILITY ENGINE

The **Match Engine** answers one specific question:
> **“How compatible is this potential trade for this particular user?”**
This powers the **Chameleon percentage-match badge** (e.g., 94% Match).

---

# 1. Separation of Concerns
- Value Engine: What is this worth?
- Match Engine: How compatible is this trade?
- Recommendation Engine: Should we show this?
- SwapGuru: Explain what it means.

---

# 2-4. Architecture & Weights (v1)
Calculates `match_score` (0-100) and `confidence`.
- Value compatibility: 25%
- Intent compatibility: 20%
- Item/category relevance: 15%
- User preference: 15%
- Location: 10%
- Condition compatibility: 5%
- Seller/trade reliability: 5%
- Availability/freshness: 5%

---

# 5-8. Value Compatibility (25%)
Not just percentage difference. Also factors in cash top-up tolerance (`max_cash_adjustment`).

---

# 9-13. Intent & Item Compatibility (35% total)
Explicit intent (wishlists, saved items) > Implicit intent (views).
Semantic similarity between categories. (A laptop vs a tablet is closer than a laptop vs a sofa).

---

# 14-15. Condition (5%)
Condition mismatches heavily penalize the match score, though condition is primarily handled by the Value Engine first.

---

# 16-17. Location (10%)
Proximity boost. 0-2km gets 100 points, 50+km gets 30 points. It's a factor, not a dictator.

---

# 18-20. Trust & Availability (10% total)
Seller reputation (completed swaps, acceptance rate).
Blocked/deleted/completed items automatically return `0`.

---

# 21-28. Outputs & The Chameleon Badge
Outputs:
`{ score: 94, tier: "EXCELLENT", confidence: 88, breakdown: {...} }`
The frontend React app uses `tier` (EXCELLENT, STRONG, POSSIBLE, WEAK, POOR) to animate color/style, but the backend is authoritative on the number.
Clicking the badge opens the visual breakdown.

---

# 29-31. Confidence Score
Based on completeness of data, metadata quality, and number of comparable listings. 
94% match with 24% confidence should be visually distinct from 94% match with 91% confidence.

---

# 32-35. Caching & Authority
Matches can be cached per user-listing pair.
The backend calculates it. Frontend NEVER submits `score: 99`.

---

# 40-43. Future Machine Learning
Later, use completed swaps to train the weights using actual outcomes, not just views/clicks.

---

# 48-49. Multiple Items
If a user owns multiple items, the Match Engine calculates the score for each owned item and returns the highest combination (e.g. "94% Match — strongest with your PS5").

