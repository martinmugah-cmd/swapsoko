# CHAPTER 1 — RECOMMENDATION ENGINE

This engine powers:
* Home Page
* Feed
* Swipe
* Search Suggestions
* SwapGuru
* Similar Listings
* Communities
* "You May Like"
* "Near You"
* "Perfect Match"
* Notifications

Without it, SwapSoko is just another marketplace.

---

# 1. Philosophy
The Recommendation Engine should answer one question:
> **"Given everything we know about this user right now, what is the next listing most likely to lead to a successful swap?"**

Notice the goal is **not** maximizing views or likes.
Unlike social media, your primary optimization target is **completed swaps**.
That changes every ranking decision.

---

# 2. System Overview
```text
                  USER
                    │
          Opens Feed / Swipe
                    │
                    ▼
        Recommendation Engine
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
User Profile   Listing Pool   Context
      ▼             ▼             ▼
      └─────────────┼─────────────┘
                    ▼
          Feature Extraction
                    ▼
             Score Generator
                    ▼
             Ranking Engine
                    ▼
           Top Ranked Listings
                    ▼
             Feed / Swipe UI
```
This engine **never owns listings**.
It only decides
> which listing should appear next.

---

# 3. Inputs
Every recommendation begins with inputs.
Imagine Martin opens Feed.
Backend asks:
```text
Who is Martin?
Where is Martin?
What does Martin own?
What does Martin want?
What has Martin skipped?
What has Martin liked?
What communities?
What campus?
Which listings has Martin seen?
Which swaps completed?
Which listings hidden?
Who blocked Martin?
Who did Martin block?
```
Only then can ranking begin.

---

# 4. User Profile Model
The engine creates an internal profile.
Not visible to users.

Example
```json
{
  "id":"user123",
  "location":"Juja",
  "campus":"JKUAT",
  "categories":{
      "Electronics":94,
      "Gaming":88,
      "Furniture":26,
      "Fashion":9
  },
  "average_value":64000,
  "preferred_distance":8,
  "likes_video":true,
  "community_score":{
      "Photography":82,
      "Gamers":96
  }
}
```
This profile changes continuously.

---

# 5. Database

## profiles
```sql
id uuid
username
campus_id
latitude
longitude
geohash
average_trade_value
preferred_radius
created_at
```

## user_preferences
```sql
id
user_id
electronics_score
gaming_score
books_score
phones_score
fashion_score
vehicles_score
furniture_score
sports_score
music_score
updated_at
```
This table is continuously updated.

## feed_events
```sql
id
user_id
listing_id
action
duration
created_at
```

Action
```text
VIEW
WATCH_25
WATCH_50
WATCH_100
LIKE
SAVE
COMMENT
SHARE
OFFER
COMPLETE_SWAP
SKIP
```
This table is the engine's memory.

---

# 6. Candidate Generation
Never compare
```text
200,000 listings
```
Instead
Generate
```text
600 candidates.
```
Sources: Nearby, Trending, Recent, Wishlist, Campus, Communities, AI Matches, Saved Categories, Random Exploration.

Suppose:
```text
Nearby: 150
Recent: 100
Trending: 70
Wishlist: 40
Communities: 90
Random: 150
↓
600 listings
```
These move to ranking.

---

# 7. Feature Extraction
Every listing is converted into numbers.
Example: Gaming Laptop
Features:
```text
Distance: 1.8 km
Category: Electronics
Estimated Value: 65,000
Seller Trust: 92
Popularity: 88
Freshness: 12 hours
Campus: JKUAT
Community: Gamers
```
Numbers are much easier for algorithms to compare.

---

# 8. Scoring Pipeline
Instead of one score, use multiple independent scorers.
```text
Listing
↓
Category Score
↓
Distance Score
↓
Wishlist Score
↓
Value Score
↓
Seller Score
↓
Freshness Score
↓
Popularity Score
↓
Community Score
↓
Diversity Score
↓
Final Score
```
This modular approach makes tuning easier.

---

# 9. Category Scorer
Reads `user_preferences`.
Suppose Electronics = 94.
Listing = Laptop -> Category Score = 94.
Listing = Shoes -> Category Score = 9.

---

# 10. Wishlist Scorer
User wishlist: MacBook, PS5, Drone.
Listing: MacBook Air -> Returns 100.
Listing: Office Chair -> Returns 4.

---

# 11. Distance Scorer
Uses geohashes to quickly identify nearby listings, then calculates exact distance for those candidates.
Approximate curve:
```text
0–2 km      → 100
2–5 km      → 90
5–10 km     → 75
10–20 km    → 55
20–50 km    → 30
50 km+      → 10
```
Users willing to travel farther can have a larger preferred radius stored in their profile.

---

# 12. Value Compatibility Scorer
Suppose Average swaps = KES 60,000.
Listing = KES 58,000 -> Returns 98.
Listing = KES 500,000 -> Returns 5.
This keeps recommendations realistic.

---

# 13. Seller Reputation Scorer
Reads `trust_score`, `completed_swaps`, `response_rate`, `acceptance_rate`, `reports`.
Returns 91. Higher trust slightly boosts ranking.

---

# 14. Freshness Scorer
Age: 15 minutes -> 100, 3 hours -> 92, 2 days -> 60, 30 days -> 8.
Older listings don't disappear immediately, but gradually lose priority.

---

# 15. Popularity Scorer
Reads Views, Likes, Offers, Comments, Shares, Watch Time, Saves.
Example formula:
```text
Popularity = (Offers × 5) + (Saves × 3) + (Shares × 2) + (Likes × 1)
```

---

# 16. Diversity Scorer
Applies a small penalty to repeated categories and encourages variety (e.g. Laptop -> Camera -> Phone -> Desk -> Console).
This keeps discovery fresh while still respecting user interests.

---

# 17. Final Score
Each scorer contributes to a weighted total.
Example:
```text
Category            94 × 0.20
Wishlist            100 × 0.15
Swap Compatibility  96 × 0.30
Distance            90 × 0.10
Value               98 × 0.10
Seller Trust        91 × 0.05
Freshness           92 × 0.05
Popularity          70 × 0.03
Community           85 × 0.02
```
The final score is used to sort listings before returning the top results.

---

# 18. Exploration vs. Personalization
Reserve a small percentage of feed slots (for example, around 10–15%) for exploration (new categories, brand-new sellers, emerging trends, high-quality listings outside the user's normal interests).

---

# 19. Learning Loop
Every interaction updates the user's preference profile.
* Skip within 2 seconds → small negative signal.
* Watch to completion → positive signal.
* Save → strong positive signal.
* Offer swap → very strong signal.
* Complete swap → strongest signal.
The engine doesn't just learn **what users watch**—it learns **what users successfully trade for**.

---

# 20. Frontend Integration
The frontend should never compute recommendations.
It simply requests a ranked batch: `GET /feed?cursor=abc123`
The backend returns already-ranked listings plus a cursor for the next page.
As the user approaches the end of the current batch, the frontend quietly requests the next one in the background.

---

# 21. Real-Time Adaptation
The recommendation profile should update continuously.
If a user interacts with 3 camera listings, the next feed request reflects this new interest rather than waiting until the next day.
