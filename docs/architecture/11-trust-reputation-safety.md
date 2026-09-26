# CHAPTER 11 — TRUST, REPUTATION & SAFETY ENGINE

The **Trust & Reputation Engine** evaluates the reliability and risk profile of a user based purely on an **immutable historical ledger of events** rather than static profile numbers. This prevents users from artificially manipulating their score by hiding or deleting past swaps.

## 1. Core Philosophy
> **"Never make trust a number that can simply be edited."**

Instead of updating a single number, SwapSoko records events (e.g. `SWAP_COMPLETED`, `NO_SHOW_CONFIRMED`) into a ledger (`reputation_events`). The Trust Engine consumes this ledger and deterministically produces the user's current Trust and Risk scores.

## 2. Trust Score vs Risk Score
- **Trust Score**: (Higher is better) Indicates transactional reliability. Influenced by completion rate, response behavior, verifications, and community conduct.
- **Risk Score**: (Higher is worse) Indicates potential danger. Influenced by no-shows, confirmed policy violations, repeated cancellations, and suspicious patterns.
- **Confidence**: Measures the sample size (`New`, `Emerging`, `Established`). High trust with low confidence is treated differently than high trust with high confidence.

## 3. Strict Metrics Definitions
The engine uses precise formulas:
- **Acceptance Rate**: `Accepted / (Accepted + Rejected)` (Ignores pending/withdrawn/expired offers).
- **Response Rate**: `Responded / Received`.
- **Completion Rate**: `Completed / Accepted`.
- **Cancellation Rate**: `Cancelled / Accepted`.
- **No-Show Rate**: `No-Shows / Scheduled Handovers`.

## 4. Historical Badges
Badges (e.g. `Fast Responder`, `Reliable Trader`, `Swap Veteran`) are dynamically awarded based on behavioral thresholds in the event ledger (e.g., median response time < 30 mins). They can be revoked dynamically if user behavior deteriorates.

## 5. Safeguards
The combination of Trust and Risk scores triggers automated safety measures. For example:
- `Risk > 60` triggers `MANUAL_REVIEW`.
- Low Trust + Moderate Risk might trigger `ESCROW_PROTECTION_REQUIRED`.

## 6. Real-Time UI Impact
Users see their exact breakdown (Completion Rate, Acceptance Rate, Response Time, Confidence Level) on their profile, building transparent credibility on the platform.
