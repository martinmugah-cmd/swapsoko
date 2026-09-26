# CHAPTER 8 — TRUST & REPUTATION ENGINE

The **Trust & Reputation Engine** answers:
> **“How trustworthy and reliable is this person as a trading partner?”**

It calculates acceptance rate, response time, completed swaps, cancellation rate, reliability, trader reputation, verification status, community trust, risk signals, and trust badges.

---

# 1. Core Principle
> **Trust must be calculated from immutable historical events, not from whatever the current profile says.**
Never make the profile statistics the source of truth. The source of truth should be events (`swap_events`, `offer_events`, `review_events`, etc.).

---

# 2. Trust Is NOT One Number
Maintain multiple independent metrics (completed swaps, acceptance rate, response time, cancellation rate, etc.) and derive a score from them.

---

# 3. Swap Lifecycle
PROPOSED -> COUNTERED -> ACCEPTED -> CONFIRMED -> IN_PROGRESS -> COMPLETED.
Only a confirmed completion by both parties logs a `SWAP_COMPLETED` event.

---

# 4. Acceptance Rate
Only legitimate, non-expired offers count toward the denominator (eligible offers received).
`Acceptance Rate = Accepted Offers / Eligible Offers Received * 100`

---

# 5. Response Time
Measures actual human interaction (ACCEPT, REJECT, COUNTER, MESSAGE). 
Median response time is more robust than average response time.
Never trust client time. Use server timestamps.

---

# 6. Completion & Cancellation Rate
`Completion Rate = Completed Swaps / Accepted Swaps * 100`
Distinguish between USER_CANCELLED and OTHER_PARTY_CANCELLED. Do not punish the victim of a cancellation.

---

# 7. Reliability Score
`Reliability = completion + response + acceptance - cancellation - dispute`
New users have "Insufficient history" (Confidence 0), not "0% trustworthy". Use Bayesian smoothing/shrinkage to prevent 1 successful trade from yielding a 100% score.

---

# 8. Verification & Community Reputation
`EMAIL_VERIFIED`, `STUDENT_VERIFIED`, etc.
Verification proves identity, not trading behavior. Keep Trust Score and Verification separate. (e.g. Trust: 93, Verification: Student).

---

# 9. Ratings
`UNIQUE(swap_id, reviewer_id, reviewee_id)`
Only allowed if `swap.status = COMPLETED`. Use confidence-aware aggregation instead of simple average.

---

# 10. Risk vs Trust
Keep them separate. 
- Trust: "How reliable does their historical behavior appear?"
- Risk: "How suspicious or dangerous is their current behavior?"
Risk signals (fraud reports, rapid cancellations) enter a moderation system.

---

# 11. Multi-Swap Trust
Do not simply average trust scores in a multi-swap chain. A weak link matters more (`Chain reliability = minimum participant reliability`).

---

# 12. Trust Decay & Rolling Windows
Recent behavior matters more. Maintain recent (30/90 day) reliability vs lifetime reliability.

---

# 13. Immutable History
If a listing is deleted, `listing.status = DELETED`, but the completed swap and trust events are retained forever.

