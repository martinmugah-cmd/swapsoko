# CHAPTER 9 — MULTI-SWAP / SWAP CHAIN ENGINE

The **Multi-Swap Engine** discovers closed-loop trades (cycles) between users when a direct swap is not possible.

> **“If A doesn't directly have what B wants, can SwapSoko find a chain of traders where everyone's desired item eventually reaches them?”**

## 1. Graph Model
- **Nodes**: Users and their Items.
- **Edges**: Potential trade relationships (A's Item -> B's Desired Item).
- **Cycle**: A path that eventually returns to the starting participant. Example: `A -> B -> C -> A`.

## 2. Constraints & Search Policy
- **Direct Matches First**: Always prefer A <-> B before multi-swap.
- **Chain Length Limit (MAX_DEPTH)**: Cap chains at 3-4 intermediaries to prevent logistical nightmare.
- **Candidate Generation**: Do not search the whole graph. Filter candidates using Recommendation Engine + Match Engine.
- **Min Edge Threshold**: `MIN_EDGE_MATCH = 60`. Do not form chains with very poor compatibility.

## 3. Chain Scoring & Trust
- **Chain Match Score**: Uses the minimum edge score (or geometric mean) so weak links aren't hidden.
- **Chain Risk/Trust**: The weakest link dictates chain safety. Do not allow risky traders to join a chain.
- **Logistics**: Handover distance heavily penalizes chains. Geographic feasibility is essential.

## 4. Multi-Swap Status Lifecycle
1. **DISCOVERED**: Algorithm finds the cycle.
2. **PROPOSED**: Initiator triggers proposals to participants.
3. **PARTIALLY_ACCEPTED**: Some users have agreed, waiting for the rest.
4. **FULLY_ACCEPTED**: All users agree. Items are marked `RESERVED` / `LOCKED`.
5. **CONFIRMED**: Final acknowledgement before handover.
6. **IN_PROGRESS**: Handovers occurring.
7. **COMPLETED**: Two-phase receipt confirmed.

## 5. Counter Offers & Repair
- Counters invalidate the current graph path and require a recalculation (e.g., if John counters for AirPods instead of iPhone).
- **Repair**: If a user drops out (REJECT), try to repair the chain (e.g. `A -> B -> D -> A` instead of `A -> B -> C -> A`).

## 6. Execution & Handovers
- Each leg has states: `PENDING -> MEETING_SCHEDULED -> HANDOVER_PENDING -> HANDOVER_CONFIRMED -> COMPLETED`.
- Use a **One-Time QR Code** for secure, platform-verified handovers.
- **Immutability**: Completed multi-swaps generate an immutable Receipt. Deleting a listing does not delete the Receipt.

