# Track C: Platform — Prompt Log

Role: Dev 3 (Platform / Contracts / Backend API / Student View / Integration)
Owner: Track C

### [2026-11-13 11:50] Prompt #1 — Integrate Mangaluru Transport Dataset
- **User Prompt:** this is the updated dataset for the backend update it in the needed files
- **Context / Goal:** Replace the backend's old synthetic fixture source with the supplied POLALI-001 routes, fleet, allocations, and operating economics while retaining the frontend's existing shared `Network` and `Student` API shapes.
- **Action Taken / Result:** Added `TransportDataset` to the shared contract and saved the supplied dataset at `contracts/fixtures/transport-dataset.json`. The backend store now derives stops, routes, available fleet assignments, cost per km, and representative student records from that source. Added `GET /api/dataset`, updated contract and project docs, and aligned bus breakdown and route closure scenario patches to the new identifiers.
- **Issues / Debugging:** Backend build could not run because dependencies are not installed (`tsc: not found`). `/api/students` demand rows are generated from aggregate per-route demand and are explicitly documented as synthetic, not observed individual registrations.

### [2026-11-13 12:41] Prompt #2 — Complete A6 What-If and API Integration
- **User Prompt:** implement A6
- **Context / Goal:** Close the Track A / Track C integration gaps and finish the natural-language what-if handoff.
- **Action Taken / Result:** `/api/optimize` now evaluates the requested scenario and simulation endpoints reject unknown scenario IDs. The what-if flow uses the current network and scenario catalog, validates provider output, retries malformed provider output once, falls back to deterministic local rules, applies all supported actions immutably, and returns real before/after metrics. Updated action types, environment examples, API docs, current-network prompt text, the access/viability slider, and stale scenario result handling.
- **Issues / Debugging:** The backend build passed. The frontend build passed after installing frontend dependencies; Vite reports its existing >500 kB main chunk. No A6 test suite was run.

### [2026-11-13 12:46] Prompt #2a — Align Student and Demand Views with Live Data
- **User Prompt:** implement A6
- **Context / Goal:** Remove remaining old-fixture assumptions from the student portal and owner demand chart while finishing the integration support pass.
- **Action Taken / Result:** Student destination, direct route, bus assignment, stop departure, and estimated arrival now derive from the backend network. The demand chart now compares current route demand, assigned seats, and recommended allocation instead of old village data.
- **Issues / Debugging:** Frontend production build passed after the UI changes.

### [2026-11-13 12:50] Prompt #2b — Keep Preset What-Ifs Provider-Free
- **User Prompt:** implement A6
- **Context / Goal:** Ensure preset scenario commands work without a provider call, as required by the platform plan.
- **Action Taken / Result:** Reordered what-if parsing so recognized presets and structured local commands return before the optional provider call. Documented the retry/fallback behavior and checked off C6.
- **Issues / Debugging:** Backend TypeScript build passed after the parser change.

---

