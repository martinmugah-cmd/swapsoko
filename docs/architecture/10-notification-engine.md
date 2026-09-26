# CHAPTER 10 — NOTIFICATION & REAL-TIME EVENT ENGINE

The **Notification Engine** is the communication layer connecting all SwapSoko engines to the user interface. It follows an **event-driven architecture**, meaning features do not send notifications directly; they emit *events*, which the Notification Engine processes.

## 1. Event-Driven Architecture
> **Features create events. The Notification Engine decides whether, how, and where those events should be delivered.**

```text
Swap Engine -> SWAP_ACCEPTED Event -> Event Bus -> Notification Engine -> UI / Push / Email
```

## 2. Notification Model
Notifications contain `entity_type` and `entity_id` to make them actionable (e.g. linking directly to a Swap or a Message).
- Types are strictly typed (e.g. `OFFER_ACCEPTED`, `MESSAGE_RECEIVED`).
- States include `delivered_at`, `seen_at`, `read_at`.

## 3. Delivery Channels & Preferences
Notifications are delivered based on user preferences and priority matrix:
- **Low**: e.g., someone saved a listing.
- **Normal**: e.g., new swap offer.
- **High**: e.g., multi-swap expiring.
- **Critical**: e.g., security alerts.

Users have granular control over channels (`IN_APP`, `PUSH`, `EMAIL`).

## 4. Aggregation
To prevent spam, similar events are grouped (e.g. "12 people saved your PS5") using an `aggregation_key` and a time window.

## 5. Real-Time Delivery
Instead of polling, the frontend subscribes to real-time database changes (e.g., Supabase Realtime). Toasts are displayed for active sessions. It integrates with active states (e.g., do not show a toast for a message if the user is already in that chat).

## 6. Business History vs. Notification UI
The underlying `system_events` table is the immutable business history. The `notifications` table is the UI presentation layer and can be truncated or deleted after a retention period without affecting platform integrity.

