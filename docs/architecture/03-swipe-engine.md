# CHAPTER 3 — SWIPE ENGINE

The **Swipe Engine** is SwapSoko's active-discovery system.

The Feed says:
> "Here are things you might find interesting."

The Swipe Engine says:
> **"Here is one specific item. Would you actually consider trading for it?"**

That distinction is extremely important because the Swipe Engine can collect **much stronger intent signals** than the Feed.
A user watching a laptop for 8 seconds tells us something.
A user explicitly swiping right on that laptop tells us much more.
And a user swiping right **and then sending an offer** tells us even more.

---

# 1. What the Swipe Engine Does
The Swipe Engine is responsible for:
* Selecting the next listing
* Showing one listing at a time
* Left/right swipe gestures
* Swipe buttons
* Match percentage
* Undo
* Skip handling
* Right-swipe intent
* Creating potential matches
* Preventing duplicate cards
* Personalizing future cards
* Connecting swipes to offers
* Connecting swipes to Multi-Swap
* Recording behavioral signals
* Handling card animations
* Maintaining the swipe queue

The actual recommendation of **which listing should come next** is still performed by the Recommendation Engine.
The Swipe Engine consumes those recommendations.

---

# 2. Architecture
```text
                         USER
                           │
                           ▼
                     SWIPES PAGE
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
              SWIPE                FEED
                 │
                 ▼
          Swipe Controller
                 │
                 ▼
       Recommendation Engine
                 │
                 ▼
          Candidate Queue
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
      Card     Card      Card
        │
        ▼
   User Decision
        │
 ┌──────┼───────────┐
 ▼      ▼           ▼
LEFT   RIGHT       SAVE
 │      │
 ▼      ▼
Skip   Intent
        │
        ▼
   Potential Match
        │
        ▼
     Offer Flow
```

---

# 3. The UI
The Swipe page should have **two experiences side-by-side as tabs**:
```text
┌─────────────────────────────────┐
│          SWIPE | FEED           │
├─────────────────────────────────┤
│                                 │
│                                 │
│           LISTING               │
│                                 │
│                                 │
│                                 │
│     ←                    →      │
│                                 │
│                                 │
│      [PASS]        [SWAP]       │
│                                 │
└─────────────────────────────────┘
```
The Feed is the immersive vertical video experience we designed in Chapter 2.
The Swipe side is deliberately different.
It is a **card-based decision interface**.

---

# 4. Swipe Card
A card could look like:
```text
┌──────────────────────────────┐
│                              │
│          IMAGE / VIDEO       │
│                              │
│                              │
│       94% MATCH              │
│                              │
├──────────────────────────────┤
│ Gaming Laptop                │
│ Lenovo Legion 5              │
│                              │
│ Estimated Value              │
│ KES 65,000                   │
│                              │
│ Looking for                  │
│ MacBook • PS5 • Camera       │
│                              │
│ 📍 2.1 km away               │
│ 🎓 JKUAT                     │
│ ✓ Verified Seller            │
└──────────────────────────────┘

       ✕             ↻             ✓
      Pass          Undo          Swap
```
The card contains enough information to make a decision without opening the listing.

---

# 5. Why the Match Percentage Matters
The **Chameleon Match Badge** we've discussed earlier becomes especially useful here.
Example:
```text
94%
EXCELLENT MATCH
```
The percentage isn't saying:
> "94% chance you will complete this swap."

It should represent:
> **How compatible this listing appears with your trading preferences and potential swap opportunities.**

It can combine:
* Category compatibility
* Wishlist compatibility
* Value compatibility
* Location
* Seller preferences
* What the seller wants
* What you own
* Previous behavior
* Potential multi-way opportunities

---

# 6. The Card Stack
Don't load only one card.
Maintain a small stack.
```text
             CARD 3
          ┌───────────┐
          │           │
          └───────────┘

             CARD 2
        ┌───────────────┐
        │               │
        └───────────────┘

             CARD 1
     ┌─────────────────────┐
     │                     │
     │      CURRENT        │
     │                     │
     └─────────────────────┘
```
Only the current card is interactive.
Cards 2 and 3 are already loaded.

---

# 7. Why Preload?
Imagine the user swipes right.
If the application then has to request Listing -> Images -> Seller -> Location -> Value, the user sees a loading screen. Bad.
Instead: Current = Listing 21. Preloaded: 22, 23, 24.
When 21 leaves, 22 instantly becomes current.

---

# 8. Swipe Animation
This is one of the most important parts.
The card should behave like a **physical object**.
When the user drags right, it follows the finger. The card rotates slightly.
For example: Drag distance = 50 px -> Rotation ≈ 3°. At 150 px -> Rotation ≈ 8°.
Keep it subtle.

---

# 9. Right Swipe
User drags right beyond the threshold.
The card flies offscreen.
Then Next Card moves forward.

---

# 10. Left Swipe
Same concept. The listing exits.
Backend records: SKIP.

---

# 11. Swipe Threshold
Don't trigger a swipe from tiny movements.
For example: < 25% -> Return card to center. ≥ 25–35% -> Commit swipe.
The exact threshold should be tuned through testing.

---

# 12. Card Rotation
Conceptually: x = horizontal drag distance. rotation = x × small_factor.
So: Left drag -> rotation = negative. Right drag -> rotation = positive.
This creates the physical-card effect.

---

# 13. Match Labels During Drag
This is where SwapSoko can make the interface distinctive.
Dragging right: SWAP appears.
Dragging left: PASS appears.
The label becomes stronger as the swipe progresses.

---

# 14. Button Controls
Not everyone will swipe. Provide buttons: Pass, Undo, Swap.
Buttons trigger the **same underlying actions** as gestures.
Never implement separate business logic for Swipe Right vs Click Swap.
Both should eventually call something like `handleSwipe("right")`.

---

# 15. Swipe Database
You need a permanent history.

## swipes
```sql
id uuid primary key
user_id uuid
listing_id uuid
direction text
source text
match_score numeric
created_at timestamptz
```
direction: left / right
source: gesture / button

---

# 16. Why Keep Swipe History?
Suppose Martin repeatedly swipes left on Furniture. The Recommendation Engine learns: Furniture affinity ↓
But Martin repeatedly swipes right on Gaming/Electronics. The model learns: Gaming ↑↑, Electronics ↑
The Swipe Engine becomes a **preference-learning system**.

---

# 17. Right Swipe ≠ Completed Swap
This distinction is critical.
A right swipe should **not** immediately create a completed swap.
It means: "I'm interested."
The process becomes: Right Swipe -> Interest Recorded -> Show Offer Options -> Offer Now OR Continue Swiping.

---

# 18. What Happens After Right Swipe?
**Option B — Offer Prompt (Recommended non-blocking):**
A small sheet appears: "You liked this item. Want to make an offer?" [Offer Swap] [Keep Swiping]
If users don't want to make an offer immediately, they should continue swiping.

---

# 19. What Is a "Match"?
A right swipe by one person isn't necessarily a mutual match. You have "Interested" when the user swipes right.
A **Match** should mean something stronger: User A interested in B's listing + B is interested in A's listing = Potential Match.
Then: Potential Match -> Offer -> Acceptance -> Swap.

---

# 20. Direct Swap Matching
Martin owns PS5, wants MacBook.
Another user owns MacBook, wants PS5.
The engine can identify A wants B, B wants A. This is a **high-confidence direct match**.

---

# 21. Multi-Swap Connection
Martin → wants Camera. Alice → wants PS5. Brian → wants MacBook.
Martin owns PS5. Alice owns MacBook. Brian owns Camera.
The engine detects: Martin -> Alice -> Brian -> Martin.
The Swipe Engine discovers the opportunity. The **Multi-Swap Engine** executes it.

---

# 22. Undo
Undo should only work within a controlled window (e.g., 3 seconds) or limited number of undos per period.
Database doesn't delete the original event. Instead: swipe LEFT -> undo_event.
This preserves analytics integrity.

---

# 23. Why Don't We Delete the Original Swipe?
Because historical behavior is valuable. If you simply delete it, you lose the fact that the user initially rejected it.
Instead: LEFT -> UNDONE. The system knows the user reconsidered.

---

# 24. Database Model
I'd use: `swipes`, `swipe_undo_events`, `swipe_sessions`.

### swipe_sessions
```sql
id
user_id
started_at
ended_at
cards_seen
right_swipes
left_swipes
```
This gives you behavioral analytics.

---

# 25. Swipe Queue
The frontend maintains: Queue [101, 234, 890, 721, 555].
Current: 101. After swipe: 234.
The frontend requests more when the queue drops below a threshold (e.g., Queue < 5 -> Request another batch).

---

# 26. Backend Flow
When the user opens Swipe: GET /swipes
Backend: Authenticate user -> Get profile -> Get recommendation candidates -> Exclude previously processed listings -> Calculate ranking -> Return top candidates.

---

# 27. Exclusions
Don't show: Own listings, Deleted, Sold, Blocked users, Reported/removed, Already rejected recently, Restricted communities, Outside visibility rules, Involved in completed swaps.

---

# 28. Don't Permanently Hide Every Left Swipe
A left swipe means: "I'm not interested in this item right now."
Implement **suppression periods**. (e.g., Hide listing for 30 days).
But if the seller updates the listing significantly (New price/media/description), it can re-enter the pool.

---

# 29. Frontend State
Conceptually:
```typescript
interface SwipeState {
  queue: Listing[];
  currentIndex: number;
  isDragging: boolean;
  dragX: number;
  direction: "left" | "right" | null;
  undoAvailable: boolean;
  loading: boolean;
}
```
The UI state controls animation. The backend controls persistent business state.

---

# 30. React Component Architecture
```text
SwipesPage
│
├── SwipeHeader
├── SwipeTabs
├── SwipeDeck
│   ├── SwipeCard
│   ├── SwipeCard
│   └── SwipeCard
├── MatchBadge
├── SwipeActions
├── OfferSheet
├── UndoToast
└── ListingPreview
```

---

# 31. Gesture Layer
Use a gesture library or pointer/touch events.
Pointer Down -> Track Movement -> Calculate X/Y -> Update Card Transform -> Release -> Determine Threshold -> Commit / Reset.
The business logic doesn't care whether the action came from Mouse/Touch/Trackpad/Button. They all resolve into `handleSwipe(direction)`.

---

# 32. Desktop Experience
Desktop: Mouse drag should work. Keyboard shortcuts can also be supported:
← = Pass, → = Swap, ↑ = Details, ↓ = Save.

---

# 33. Mobile Experience
Mobile: Finger drag -> Card follows finger -> Release -> Snap.
Buttons remain accessible.

---

# 34. Haptic / Microinteraction Layer
On supported mobile devices:
Right/Left swipe: tiny vibration.
Successful match: stronger confirmation.
Match percentage badge: scale 0.9 -> 1.05 -> 1.0. (Subtle).

---

# 35. Swipe Analytics
Track: Cards shown, skipped, accepted, Time per card, Right/Left rate, Undo rate, Offer conversion, Swap conversion.
The most important metric is: Right Swipe -> Offer -> Accepted -> Completed Swap.

---

# 36. The Swipe Funnel
1,000 Cards Shown -> 420 Swipes -> 120 Right -> 65 Offers -> 38 Accepted -> 27 Completed.
This tells you exactly where the product is failing (e.g., bad recommendation vs bad offer UX).

---

# 37. Security / RLS
Users should only be able to create their own swipe events (user_id = authenticated_user).
They should not modify another user's swipe history.

---

# 38. Anti-Abuse
The backend should detect abnormal behavior (e.g., 10,000 swipes in 30s).
Rate-limit: Swipe requests, Event submissions, Offer creation.

---

# 39. Interaction With Recommendation Engine
Every swipe becomes training data.
Swipe Left = Negative signal.
Swipe Right = Strong positive signal.
Right Swipe + Offer = Very strong signal.
Completed Swap = Extremely strong signal.
Feedback loop: Recommendation -> Swipe -> Behavior -> Learning -> Better Recommendation -> Better Swaps.

---

# 40. Interaction With Value Engine
When the user right-swipes, value comparison kicks in.
Listing = KES 65,000. Their PS5 = KES 60,000.
Estimated Difference = KES 5,000. Possible cash top-up.

---

# 41. Interaction With SwapGuru
After a strong match, SwapGuru can provide: "This looks like a strong trade. Your PS5 is 60k, laptop is 65k. Offer PS5 + 5k cash." -> [Make Offer].

---

# 42. Interaction With Location Engine
Card: 📍 1.4 km away.
Engine uses location to influence ranking, but never exposes exact GPS coordinates until both parties agree.

---

# 43. Interaction With Trust Engine
Card: ✓ Verified, 98% Acceptance, 23 Completed Swaps.
Trust gives users confidence.

---

# 44. What Happens When User Runs Out of Cards?
Don't immediately show "No more listings."
Instead: "You've seen everything nearby. Expand your search? [10 km] [25 km]"
Or: "Explore new categories? Gaming / Fashion"

---

# 45. Empty State
If absolutely nothing exists: "You've reached the end. New items are being added every day. [Explore Feed]"

---

# 46. Final Architecture
Feed generates curiosity. Swipe captures explicit intent. Search captures explicit demand.
All three feed behavioral data back into the Recommendation Engine, while a right swipe can progress directly into valuation, SwapGuru assistance, and eventually a direct or multi-way swap.
