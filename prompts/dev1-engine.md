# Track A: Engine — Prompt Log

Role: Dev 1 (Engine / Simulator / Scorer / Optimizer)
Owner: Track A

### [2026-11-13 11:51] Prompt #1 — Complete A1 Engine Foundations
- **User Prompt:** implement the plan A1
- **Context / Goal:** Finish Track A's A1 foundation tasks: deterministic RNG, strict time parsing/formatting, and fixture loading with runtime validation.
- **Action Taken / Result:** Kept the seeded Mulberry32 generator and its same-seed test; added strict `time.ts` helpers and preserved the existing simulator exports; added Zod runtime schemas and a fixture loader for the transport dataset and sample simulation result; validated the backend's derived network and student records, plus network updates; marked A1 complete in `PLAN.md`.
- **Issues / Debugging:** `npm run build` could not be run because backend dependencies are absent (`tsc` not found). No tests were run.

### [2026-11-13 12:01] Prompt #2 — Implement A2 Simulator
- **User Prompt:** implement plan A2
- **Context / Goal:** Replace the fixture-returning simulator with a deterministic one-minute simulation for the 06:00-10:00 service window.
- **Action Taken / Result:** Implemented seeded stop-ready times, bus departures and movement over route travel minutes, stop-level boarding with capacity limits, rider drop-offs and deadline handling, timeline events, wait/load/revenue/cost/viability metrics, and headless metrics-only operation. Added optional route IDs, route distance and network economics to shared types so the new Mangaluru dataset can drive corridor-aware simulation and costs. Updated A2 checklist and API docs.
- **Issues / Debugging:** Dataset has no observed rider ready-times, so the simulator samples 06:00-06:59 deterministically from the seed. Build and tests were not run because backend dependencies are absent; `tsc` is unavailable.

### [2026-11-13 12:06] Prompt #3 — Implement A3 Scoring and Scenarios
- **User Prompt:** implement plan A3
- **Context / Goal:** Complete weighted metric scoring, all scenario patch operations, and the preset exam surge, rain, breakdown, and route closure scenarios.
- **Action Taken / Result:** Hardened `scoreMetrics()` to reject invalid weights and metrics while applying all four weights. `applyScenario()` now safely scales demand up or down, modifies capacity and travel time, removes buses, closes routes, and shifts departures; demand changes preserve a balanced spread of route riders. Moved backend preset definitions into `scenarios.ts` and aligned them with the current fleet/route IDs. Marked A3 complete in `PLAN.md` and corrected API scenario docs.
- **Issues / Debugging:** Build and tests were not run because backend dependencies are absent (`tsc` unavailable).

### [2026-11-13 12:17] Prompt #5 — Implement A5 Engine Tests and Hardening
- **User Prompt:** implement Plan A5
- **Context / Goal:** Add coverage for deterministic simulation, bus capacity, optimizer score non-regression, scenario effects, and edge cases.
- **Action Taken / Result:** Replaced the initial smoke tests with 11 tests across engine foundations, simulation, scenarios, and optimization. Coverage includes all scenario patch types, headless-compatible metrics, empty demand, all routes closed, result determinism, and per-bus occupancy. Marked A5 complete in `PLAN.md`.
- **Issues / Debugging:** Installed backend dependencies with `npm ci`; `npm test` passed (11/11) and `npm run build` passed.

### [2026-11-13 12:13] Prompt #4 — Implement A4 Schedule Optimizer
- **User Prompt:** implement A4
- **Context / Goal:** Replace fixed schedule edits and fabricated metrics with a deterministic optimizer evaluated by the A2 simulator.
- **Action Taken / Result:** Implemented seeded random-restart hill climbing over bus route assignments and departure offsets, with a fixed candidate cap. Candidate schedules enforce capacity, route permissions when configured, route existence, non-overlapping departures, and driver-hour limits. Results now contain simulated before/after metrics, route/departure diffs, and score delta. Added `optimized-schedule.json` as the POLALI-001 fallback and validate its allocation against the network's recommended allocation. Marked A4 complete in `PLAN.md` and updated fixture/API docs.
- **Issues / Debugging:** Build and tests were not run because backend dependencies are absent (`tsc` unavailable).

### [2026-11-13 12:41] Prompt #6 — A6 Integration Support and Weight Tuning
- **User Prompt:** implement A6
- **Context / Goal:** Debug the engine/API handoff, tune the access-versus-viability policy for the Mangaluru demo, and take over the what-if integration if engine work is complete.
- **Action Taken / Result:** Optimizer now honors API scenario IDs. Tuned the default viability weight to 1.1 and connected the frontend slider to move the viability weight inversely with access. CLI comparison at these defaults served 440 vs. 390 on time, lowered mean wait from 102.8 to 80.9 minutes, and reduced viability gap from ₹9,228 to ₹7,942. Implemented validated what-if action execution and an optional OpenAI-compatible provider with deterministic fallback. Fixed stale optimized results when scenario simulations refresh.
- **Issues / Debugging:** `npm run optimize` required an escalated run because the sandbox blocked tsx's local IPC socket. Backend build passed; frontend build passed with Vite's existing large-chunk warning. No tests were run for A6.

---

