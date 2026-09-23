# CHAPTER 6 — RECOMMENDATION ENGINE

The **Recommendation Engine** is the system responsible for answering:

> **“What should SwapSoko show this user, and in what order?”**

It powers far more than the homepage.
It should influence: Home feed, Swipe recommendations, Feed/reels, Search suggestions, Similar listings, “You may like”, “People looking for this”, SwapGuru recommendations, Multi-Swap candidate discovery, Notifications, Wishlist recommendations, Campus/community recommendations

The important distinction is:
> **Search finds what the user explicitly asked for. Recommendation finds what the system believes the user is likely to want.**

---

# 1. Pipeline Architecture
Candidate Generation -> Eligibility filtering -> Personalization -> Ranking -> Diversity -> Safety -> Final feed

---

# 2-4. Candidate Generation
Candidates are generated from: User's wishlist, owned items, view/save/swipe history, similar users, similar items, trending, local, campus, new listings, multi-swap.
Every candidate gets a `source`.

---

# 5. Eligibility Filtering
Remove deleted, blocked, reported, swapped, expired, private, own listings, or wrong community permissions.

---

# 6-9. User Preference Profile & Signals
System continuously updates a user profile representation (e.g. `gaming: 0.86, electronics: 0.91`).
Signals: View (+1), Long view (+2), Save (+5), Swipe Right (+6), Offer (+10), Swap (+20).
Explicit signals (saves/swipes) > Implicit (views).

---

# 10-13. Recommendation Types (Hybrid)
Content-based (similar items to what user likes) + Collaborative Filtering (similar users) + Value + Location + Freshness + Demand.

---

# 14-16. Ranking Score vs Match Score
**Recommendation Score**: How likely is the user to want this? (Preference + Relevance + Freshness)
**Match Score**: How mathematically compatible is the trade? (Value gap + Category intersection)
These must be separate. A 94% trade match might have a low recommendation score if the user doesn't care about that category.

---

# 17. UI Distinctions
"Because you saved...", "Trending near you", "Similar to your item", "Good trade for your PS5".

---

# 18-22. Feed Diversity
Don't return 20 cameras in a row. Enforce category and seller diversity. Max 3 consecutive identical categories.

---

# 23-25. Freshness & Exploration
New listings get a freshness boost.
85% personalized exploitation, 10% related categories, 5% random experimental exploration.

---

# 26-28. Cold Start
If no data exists: ask during onboarding, or use Location/Campus/Trending/New.

---

# 29-31. Multi-Variable Ranking
Location matters, but doesn't override value. Value compatibility filters unrealistic recommendations unless multi-swap is possible.

---

# 32-38. Hooks to Other Engines
SwapGuru passes its requests through Recommendation Engine. Swipe Engine asks "What's next" from it.
Apply interest decay over time so past obsessions fade.

---

# 39-43. Database Logs
Log `user_interactions` and `recommendation_events` to scientifically tune the engine.

---

# 44-46. Contextual Weighting
Home needs balanced personalization. Swipe needs strong trade compatibility. Reels needs high engagement/content relevance.

---

# 47-52. Real-Time Feedback Loop
When user likes something, event hits queue, updates user signals, and next recommendation instantly improves. Let users hide/remove categories.

---

# 53-54. The Ultimate Goal
Orchestrate all constraints (What I have, What I want, Who wants it, Where, Value, Compatibility) to generate perfect candidate lists for every surface.

Next up: Chapter 7 - Match/Compatibility Engine.
