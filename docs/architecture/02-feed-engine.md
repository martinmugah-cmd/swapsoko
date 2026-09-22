# CHAPTER 2 — FEED ENGINE (TikTok/Reels-style Discovery System)

The Feed Engine is the **second most important system** in SwapSoko after the Recommendation Engine.

If the Recommendation Engine decides **what** users should see, the Feed Engine decides **how** they experience it.

This chapter covers the complete architecture from UI to backend to database.

---

# 1. Philosophy

Instagram optimizes for engagement.

TikTok optimizes for watch time.

Facebook Marketplace optimizes for listings.

**SwapSoko optimizes for completed swaps.**

The feed is therefore **not** a social media feed.

It is a **Discovery Feed**.

Every scroll should make the user think:

> "I could actually trade for this."

---

# 2. System Architecture

```text
                 USER
                   │
              Opens Feed
                   │
                   ▼
          Feed Controller
                   │
        Requests Recommendations
                   │
                   ▼
      Recommendation Engine
                   │
                   ▼
       Ranked Listing IDs
                   │
                   ▼
      Feed Content Builder
                   │
         Fetch Media + Metadata
                   │
                   ▼
        Feed Response API
                   │
                   ▼
          React Frontend
                   │
                   ▼
      Video Player + UI Layer
```

Notice

Feed **never decides ranking.**
Recommendation Engine already did that.
Feed simply displays.

---

# 3. Feed Layout

The screen is always fullscreen.

```text
┌──────────────────────────────┐
            VIDEO
            VIDEO
            VIDEO
            VIDEO
            VIDEO
──────────────────────────────
Gaming Laptop
Worth KES 68,000
Looking for
MacBook Air
92% Swap Match
Near JKUAT
──────────────────────────────
❤️
💬
⭐
↗
🔄 Offer Swap
└──────────────────────────────┘
```

Unlike Instagram:
No white cards.
No scrolling document.
The entire screen belongs to one listing.

---

# 4. Feed Navigation

Inside Swipes

```text
━━━━━━━━━━━━━━━━━━
Swipe
Feed
━━━━━━━━━━━━━━━━━━
```

Switching tabs should animate.

```text
Swipe
↓
Slide Left
↓
Feed
```

Not:
```text
Disappear
↓
Appear
```

---

# 5. Frontend Architecture

```text
FeedPage
│
├── FeedController
├── FeedVideo
├── FeedOverlay
├── FeedActions
├── FeedDetails
├── FeedComments
├── OfferSheet
├── ShareSheet
└── VideoManager
```

Every responsibility stays isolated.

---

# 6. Feed Controller

Brain of frontend.
Responsibilities:
* Load feed
* Prefetch
* Cache
* Infinite scroll
* Cursor
* Resume position

Never renders videos.

---

# 7. Video Manager

Controls:
Play, Pause, Buffer, Mute, Volume, Loop, Dispose, Preload.

Only:
Current, Previous, Next
Stay in memory.

---

# 8. Feed Card

Every listing:

```text
Listing
↓
Video
↓
Overlay
↓
Buttons
↓
Metadata
```

Nothing else.

---

# 9. Overlay

Bottom left

```text
Gaming Laptop
Worth
KES 68,000
Looking For
MacBook Air
92%
Swap Match
📍
2 km away
Verified Seller
```

This overlay fades in after the video starts.

---

# 10. Action Buttons

Right side

```text
❤️
Comment
⭐
Save
↗
Share
🔄
Offer Swap
```

Offer Swap is emphasized because it is the platform's primary action.

---

# 11. Database

## listing_media
```sql
id
listing_id
media_type
video_url
thumbnail_url
duration
height
width
position
created_at
```

## feed_views
```sql
id
user_id
listing_id
viewed_seconds
completion_percentage
created_at
```

## feed_sessions
```sql
id
user_id
started_at
ended_at
device
last_listing
```

## feed_events
```sql
id
user_id
listing_id
event
timestamp
```

Events:
VIEW, SKIP, LIKE, SAVE, COMMENT, SHARE, OFFER, WATCH25, WATCH50, WATCH75, WATCH100

---

# 12. Opening Feed

User taps Feed.
Frontend:
```http
GET /feed
```
Backend:
```text
Recommendation Engine
↓
Top 20 IDs
↓
Fetch Listings
↓
Fetch Media
↓
Fetch Seller
↓
Return JSON
```

---

# 13. Response

```json
[
 {
   "listing":{
      ...
   },
   "media":[...],
   "seller":{...},
   "swap_match":92,
   "distance":"2 km"
 }
]
```

Everything needed for rendering arrives in one response.

---

# 14. Infinite Feed

Never Load 1000 listings.
Instead:
20 -> User reaches 16 -> Load Next 20 -> Continue.
Uses cursor pagination.

---

# 15. Cursor

Instead of `Page 3`, use `Cursor "c29tZV9jdXJzb3I="`.
This avoids duplicates and performs better on large datasets.

---

# 16. Preloading

Current: Listing 18
Already downloaded: 19, 20.
When 19 opens, Download 21.
Smooth. No spinner.

---

# 17. Buffer Strategy

Memory: Current + Previous + Next.
Only 3 videos.
Everything else destroyed.

---

# 18. Scroll Engine

User drags 30% -> Stay.
User drags 70% -> Next listing.
Snap animation.

---

# 19. Snap Animation

Current: 100% ↓ 98%
Next: 98% ↓ 100%
Duration: ≈ 220–300 ms. Ease-out curve.

---

# 20. Autoplay

Rules:
Current 100% visible -> Play.
Previous -> Pause.
Next -> Preload.

Only one video should ever play audio at a time.

---

# 21. Watch Tracking

Every second, Frontend Calculates Watch % -> 25 -> 50 -> 75 -> 100.
Sends compact events to the backend (throttled rather than every frame) so the Recommendation Engine learns viewing behavior without excessive network traffic.

---

# 22. Like Flow

```text
Tap ❤️
↓
Optimistic UI
↓
POST
↓
Backend
↓
Success
↓
Keep

Failure
↓
Rollback
```

The UI responds immediately while the request completes in the background.

---

# 23. Save Flow

```text
Tap ⭐
↓
saved_listings
↓
Update UI
↓
Update Recommendation Engine
```

Saved items become a strong personalization signal.

---

# 24. Comment Flow

```text
Video
↓
Bottom Sheet
↓
Comments
↓
Reply
↓
Realtime Update
```

Comments should slide up over the video instead of opening a new page.

---

# 25. Offer Swap Flow

```text
Offer Swap
↓
Select Item
↓
AI Analysis
↓
Proposal
↓
Submit
↓
Return To Feed
```

Feed position remains unchanged.

---

# 26. Resume Feed

Database: `feed_sessions` -> Last Listing -> Last Position.
Open tomorrow: Resume Exactly there.

---

# 27. Live Updates

Someone likes Video -> Increase Count -> Animate -> No Refresh.
Supabase Realtime keeps counts fresh.

---

# 28. Analytics

Track:
Average Watch, Average Session, Offers, Likes, Shares, Completion, Scroll Speed, Exit Point, Bounce Rate.
This helps improve both the recommendation model and the user experience.

---

# 29. Security

Prevent:
- Deleted listings appearing.
- Blocked users appearing.
- Private listings leaking.
- Hidden communities surfacing.
- Unauthorized media URLs.

Use Supabase Row Level Security (RLS) to ensure the backend only returns content the current user is allowed to access.

---

# 30. Feed Lifecycle

```text
User Opens Feed
        │
        ▼
Request Recommendations
        │
        ▼
Receive Top 20 Listings
        │
        ▼
Load Current + Next Two Videos
        │
        ▼
Autoplay First Listing
        │
        ▼
User Watches / Skips / Likes / Saves / Offers
        │
        ▼
Events Stored
        │
        ▼
Recommendation Engine Updated
        │
        ▼
Prefetch Next Batch
        │
        ▼
Continue Infinitely
```

---

# 31. How the Feed Engine Connects to the Rest of SwapSoko

```text
                 Feed Engine
                      │
 ┌────────────────────┼────────────────────┐
 ▼                    ▼                    ▼
Recommendation     Video Storage      Analytics
Engine             (Supabase)         Engine
 │                    │                    │
 ▼                    ▼                    ▼
Value Engine     Messaging Engine   Notification
 │                    │                    │
 └──────────────┬─────┴────────────────────┘
                ▼
         SwapGuru AI Engine
                │
                ▼
        Offer Swap Workflow
```

The Feed Engine is **not** an isolated feature. It is the presentation layer where many of SwapSoko's other engines converge: recommendations determine what appears, location provides context, trust scores influence presentation, analytics measure engagement, and SwapGuru plus the Multi-Swap Engine are invoked when a user decides to make an offer. This tight integration is what makes the feed more than just a list of videos—it becomes the primary discovery experience for the entire platform.
