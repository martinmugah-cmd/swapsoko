# CHAPTER 5 — SWAPGURU AI ENGINE

**SwapGuru is the AI intelligence layer of SwapSoko.**

Its job is not simply to be a chatbot. It should understand:
* What the user owns
* What they want
* What listings exist
* Item values
* Trade compatibility
* Location
* Seller reliability
* Previous interactions
* Direct swaps
* Multi-way swaps
* Negotiation
* Trade history

Then turn that information into **actionable trading decisions**.

> **SwapGuru should reason over SwapSoko's actual data and engines rather than hallucinate answers from an LLM.**

---

# 1. What SwapGuru Actually Is
SwapGuru receives a request, uses intent detection to decide which internal SwapSoko engines to call (Value, Recommendation, Search, Location, Trust), retrieves real data, and then reasons over that data to give a grounded answer with actionable UI buttons.

---

# 2. SwapGuru's Main Capabilities
1. Value Analysis
2. Trade Analysis
3. Trade Discovery
4. Trade Suggestions
5. Negotiation
6. Multi-Swap Discovery
7. Listing Assistance
8. Market Explanation
9. Offer Analysis
10. Search Assistant

---

# 3. SwapGuru UI
It should feel like a trading assistant, with quick action chips like [ Analyze my item ], [ Find a trade ], [ Check an offer ].

---

# 4. Contextual SwapGuru
SwapGuru appears contextually:
- Listing page: "Is this fairly valued?"
- Offer page: "Analyze this offer"
- Swipe page: "Why is this a 94% match?"

---

# 5. Backend Architecture
React -> SwapGuru API -> Intent Classifier -> Tool Router (calls Value/Rec/Search/Trust engines) -> Context Builder -> LLM -> Response Validator -> User.

---

# 6-12. Tool Calling and Intent Detection
SwapGuru maps user messages to INTENTS (e.g., TRADE_DISCOVERY).
It extracts entities (e.g., Item = PS5).
It executes internal tools (`getItemValue`, `searchListings`).
It DOES NOT pass thousands of records to the LLM. It filters and ranks first, then sends the top candidates to the LLM.

---

# 13-16. Trade Suggestions
SwapGuru explains *why* a trade is good (closest value, high trust, nearby) instead of just dumping listings. This is intent-based discovery.

---

# 17-20. Offer Analysis & Negotiation
Analyzes incoming offers. If there is a massive value gap, it doesn't say "scam", it advises negotiating for a cash top-up.
It generates UI Action Buttons like [Create Counter Offer] with pre-filled cash adjustments.

---

# 21-22. Multi-Swap Discovery
Can investigate multi-party swap chains if a direct swap isn't possible, leaning on the Multi-Swap Engine.

---

# 23-24. Listing Creation & Image Analysis
Helps generate descriptions, but distinguishes AI text from verified facts.

---

# 25-27. Database Schema
Conversations, messages, and tool_calls are stored for auditability and debugging. Explicit recommendations are stored in `swapguru_recommendations`.

---

# 28-29. Restrict Database Access
The LLM never gets raw SQL access. It can only call strictly typed, permissioned tools.

---

# 30-33. Prompt Architecture and Grounding
Prompt enforces: use engines for values/listings, never invent data, don't expose private info.
Responses are explicitly grounded in the engine data.

---

# 34-37. Orchestration, Not Duplication
SwapGuru does not replace other engines. It relies on the Value Engine for values, Trust Engine for trust, Location Engine for distances. It orchestrates them.

---

# 38-40. Guardrails and Actions
Never silently send an offer. Recommend an action, provide a button, and let the normal app workflow execute it.

---

# 41-43. Cost Control, Caching, UI
Send tiny structured JSON context to LLM, not the whole DB. Cache engine results. Use progressive loading states ("Checking your item...").

---

# 44. Suggested Starters
"What can I trade my PS5 for?", "Is this offer fair?", "Find a 3-way swap."

---

# 47. The Killer Feature
SwapGuru takes complex multi-variable constraints (I have X, I want Y, I will add max Z cash) -> orchestrates all engines -> outputs direct swaps, alternative swaps, and multi-way swaps with 1-click action buttons.
