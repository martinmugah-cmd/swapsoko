# CHAPTER 4 — VALUE ESTIMATION ENGINE

The **Value Estimation Engine** is one of the most important engines in SwapSoko because barter has a fundamental problem:
> **How do you determine whether two things are actually worth trading for each other?**

A simple marketplace can say:
> "Seller wants KES 50,000."

SwapSoko needs to answer something more sophisticated:
> "Based on the item's characteristics, condition, age, market evidence, historical SwapSoko transactions, and current demand, this item is probably worth KES 46,000–52,000."

That estimate then feeds into:
* Swipe Match %
* Multi-Swap balancing
* SwapGuru
* Offer suggestions
* Cash top-ups
* Recommendation Engine
* Listing creation
* Search filters
* Trade fairness indicators
* Analytics

The engine should **never pretend that an estimate is an exact market price**.

---

# 1. Core Philosophy
There are actually **three different values** SwapSoko needs to distinguish.
### A. Estimated Market Value
"What could this item reasonably be worth?"
Example: KES 65,000
### B. Trade Value
"What is this item realistically worth in a barter transaction?"
Example: KES 60,000
### C. User Asking Value
"What does the owner claim they want?"
Example: KES 75,000

---

# 2. Architecture
```text
                    LISTING
                       │
                       ▼
              Item Information
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
      Structured     Images        History
       Data            │             │
          │            ▼             │
          │       AI Analysis        │
          │            │             │
          └────────────┼─────────────┘
                       ▼
                Feature Extraction
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
      Market Data   Swap History   Demand
          │            │             │
          └────────────┼─────────────┘
                       ▼
                Valuation Model
                       │
                       ▼
             Confidence Calculation
                       │
                       ▼
                Final Estimate
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       SwapGuru      Matching     Multi-Swap
```

---

# 3. When Does Valuation Happen?
Not only when the listing is created. It should happen repeatedly.
* Listing creation -> Initial estimate
* Price/value changes -> Recalculate
* Market changes -> Recalculate
* New transaction evidence -> Model becomes more accurate
This means valuation is a **living estimate**, not a one-time number.

---

# 4. Listing Creation UI
The user's own expected value should **not overwrite** the engine's estimate.
The UI clearly separates "Estimated Swap Value (KES 61k-68k)" and "Your Expected Value (KES ___)".

---

# 5. Structured Item Data
Capture structured attributes (e.g. brand, model, year, ram, storage, condition, processor, gpu).
This dramatically improves valuation accuracy.

---

# 6. Database Architecture
Create a separate valuation layer.
`item_attributes`: id, listing_id, attribute_key, attribute_value, created_at.

---

# 7. valuations
`valuations`: id, listing_id, estimated_min, estimated_max, estimated_mid, trade_value, confidence_score, currency, model_version, created_at, expires_at.

---

# 8. valuation_sources
Every estimate should have evidence.
`valuation_sources`: id, valuation_id, source_type, source_reference, observed_value, weight, created_at.

---

# 9. Why Evidence Matters
A moderator should be able to inspect the evidence behind any estimate (e.g., 14 comparable listings, 8 completed swaps). This makes the engine explainable.

---

# 10. Market Data
The engine derives a reasonable range from multiple sources. You should **not blindly use the highest or lowest listing**.

---

# 11. Completed Swap Data
This becomes SwapSoko's most valuable proprietary dataset. Real trade values are much more useful than asking prices.

---

# 12. Active Listings vs Completed Swaps
Completed Swaps have very strong evidence weight. Active listings have weak evidence weight.

---

# 13. Condition Adjustment
Condition dramatically changes value. (e.g., Like New=100%, Good=85%, Fair=65%, Poor=40%).
These should be calibrated from actual data, not hard-coded universally.

---

# 14. Age Depreciation
Different categories depreciate differently (Electronics fast, Furniture slow). The engine needs **category-specific valuation models**.

---

# 15. Brand Premium
Brand should be a feature, not a fixed premium. The model learns the premium from observed data.

---

# 16. Demand Adjustment
High demand increases trade value. Low demand decreases trade value.

---

# 17. Supply/Demand Index
`market_pressure = demand / supply`. The formula should be calibrated empirically.

---

# 18. Trade Value
Market value isn't necessarily trade value. Some items are highly desirable in barter, increasing their trade value above standard market value.

---

# 19. The Value Range
Never present an exact number (e.g., KES 64,237). Use a range to communicate uncertainty (e.g., KES 61,000–68,000).

---

# 20. Confidence Score
Depends on evidence. High (92%) vs Medium (68%) vs Low (31%).

---

# 21. User Interface
Provide a "How we estimated this" breakdown showing Similar listings, Swaps, Condition, Demand, Location.

---

# 22. The Fair Trade Indicator
Alerts users to valuation gaps between their item and the target item (e.g., 🟢 CLOSE VALUE, or 🟠 VALUE GAP).

---

# 23. Cash Top-Up
The engine suggests a cash top-up structure to bridge a value gap. The final amount remains negotiable.

---

# 24. Multi-Swap
The Multi-Swap Engine uses valuations to identify where balancing payments might be needed across a chain.

---

# 25. SwapGuru Integration
SwapGuru shouldn't invent values independently. It calls the Value Engine and explains the gap to the user.

---

# 26. Frontend Architecture
ListingCreatePage, ListingPage, OfferPage.

---

# 27. Backend Architecture
Use Supabase/Edge Functions for computation rather than trusting the browser.

---

# 28. Why Server-Side?
A malicious user could manipulate the browser to inflate their item. Backend must calculate the official estimate.

---

# 29. Supabase Edge Function
POST /functions/v1/estimate-value -> Loads attributes, condition, comparables, etc -> Returns result.

---

# 30. Valuation Model
Start with a **hybrid model**: Base Comparable Value + Condition + Age + Demand + Local Market + Trade-Liquidity = Estimated Trade Value.

---

# 31. Model Versioning
Store `model_version` (e.g., valuation_v1). Protects analytics and disputes.

---

# 32. Never Rewrite Historical Swap Values
Historical transactions must retain the valuation that existed **at the time of the transaction**.

---

# 33. Database Snapshot
`swap_items` stores `estimated_value_at_swap` and `valuation_model_version`.

---

# 34. Real-Time Updating
Active listings get updated valuations, but completed swaps remain untouched.

---

# 35. Valuation Events
Track events: created, updated, expired, recalculated, overridden.

---

# 36. User-Provided Evidence
Allow uploads of receipts, warranty info, etc.

---

# 37. AI Image Analysis
Vision model -> extract attributes -> user confirms -> Valuation Engine. Never silently trust AI.

---

# 38. Fraud Detection
Identify suspicious listings (e.g., KES 8k for a KES 70k phone). Flag for moderation.

---

# 39. Manipulation Detection
Clearly distinguish user asking price from independent estimate.

---

# 40. Analytics
Track valuation accuracy, median absolute error, model drift, etc.

---

# 41. Engine Relationships
Every completed swap creates new evidence that makes the next valuation better.

---

# 42. Complete Lifecycle
User Creates -> Extract -> Compare -> Value -> Feed/Swipe -> Offer -> Negotiate -> Complete Swap -> Historical Evidence -> Future Valuations.

---

# 43. The Most Important Rule
**The Value Estimation Engine should advise, never dictate.**
It exists to give objective information, reduce asymmetric information, identify unreasonable offers, and make barter easier.
