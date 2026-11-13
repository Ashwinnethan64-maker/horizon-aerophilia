# PLAN

**Project:** Routeless: The Last Mile
**Time budget:** 3 hours
**Team:** 3 developers, 3 independent tracks

See `ARCHITECTURE.md` for the system design. This document says who does what, in what order, and when the tracks meet.

---

## How to use this plan

- Each track is **self-contained**: you can finish it without waiting on anyone else, because each track builds against fixtures or stubs from `/contracts`.
- Tick the checkboxes as you go.
- Only touch folders your track owns. If you need a change elsewhere, message the owner.
- Merge to `main` through small PRs, at least once per phase.
- Log every significant AI prompt, what went wrong, and the fix in your track's log file in `prompts/` (e.g. `prompts/dev1-engine.md`, `prompts/dev2-owner-ui.md`, `prompts/dev3-platform.md`) (this is scored).

| Track       | Developer | Owns                                                                                                                                            | Mock/stub used meanwhile                 |
| ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| A: Engine   | Dev 1     | `/backend/src/engine`, `/backend/tests`                                                                                                         | Fixtures from `/contracts/fixtures`      |
| B: Owner UI | Dev 2     | `/frontend/src/views/OwnerView`, `/frontend/src/components`                                                                                     | `sample-simresult.json` in mock mode     |
| C: Platform | Dev 3     | `/contracts`, `/backend/src/api`, `/backend/src/llm`, `/frontend/src/api`, `/frontend/src/store`, `/frontend/src/views/StudentView`, deployment | Stub engine returning the sample fixture |

---

## Phase 0: Setup (0:00 to 0:20) — everyone together

Do this together, because everything after depends on it.

- [x] Create the GitHub repo (public) and add all three developers
- [x] Create the folder skeleton: `/contracts`, `/backend`, `/frontend`
- [x] **Dev 3 leads, all agree:** write `/contracts/types.ts` (Network, Bus, Student, Scenario, SimResult, Weights)
- [x] **Dev 3 leads, all agree:** write `/contracts/api.md` with every endpoint's request and response
- [x] **Dev 3 leads:** write `/contracts/fixtures/network.json` (about 6 stops, 3 buses) and `students.json` (about 100)
- [x] **Dev 1 leads:** hand-write `/contracts/fixtures/sample-simresult.json` in the exact `SimResult` shape (a short event timeline plus metrics)
- [x] Scaffold frontend (Vite + React + TS + Tailwind) and backend (Node + TS + Express)
- [x] Add `.env.example` files, `.gitignore`, and a root `README.md`
- [x] Create branches: `feat/engine`, `feat/owner-ui`, `feat/api-student`

**Exit check:** all three can run their app locally, and the types and fixtures are committed to `main`. (Completed)

---

## Track A: Engine (Dev 1)

**Goal:** a deterministic simulator and optimizer that turns a network, demand, and scenario into a `SimResult`.
**Branch:** `feat/engine`
**You are independent because:** you code against `/contracts/types.ts` and run everything through a CLI, with no server or UI needed.

### A1. Foundations (0:20 to 0:45)

- [ ] `rng.ts`: seeded random number generator (same seed, same sequence)
- [ ] Time helpers: parse `"HH:MM"` to minutes and back
- [ ] Load fixtures and validate them against the types

### A2. Simulator (0:45 to 1:15)

- [ ] 1-minute tick loop from about 06:00 to 10:00
- [ ] Student arrival at stops from the demand data
- [ ] Bus movement along route stops using `travelMinutes`
- [ ] Boarding up to capacity; leftovers wait for the next bus or become stranded
- [ ] Event timeline output (`board`, `strand`, `arrive`, `bus_position`) matching `sample-simresult.json`
- [ ] Metrics: served on time, stranded, average wait, load factor, revenue, cost, viability gap
- [ ] Headless mode (skips event recording, for speed)
- [ ] `npm run sim` CLI that prints baseline metrics

**Milestone A-1 (about 1:15):** `simulate()` returns a valid `SimResult`. Hand it to Dev 3 to wire into `/api/simulate`.

### A3. Scorer and scenarios (1:15 to 1:40)

- [ ] `scorer.ts` using `W1..W4` from `Weights`
- [ ] `scenarios.ts`: patch types (`demandMultiplier`, `capacityMultiplier`, `travelTimeMultiplier`, `removeBus`, `closeRoute`)
- [ ] Preset scenarios: exam surge, rain, breakdown, route closure

### A4. Optimizer (1:40 to 2:15)

- [ ] Random-restart hill climbing over departure offsets and bus-to-route assignment
- [ ] Respect constraints: capacity, driver hours, permitted routes
- [ ] Cap runtime (about 1 to 2 seconds) or a fixed iteration count
- [ ] Output: new schedule, diff against old, before and after `SimResult`
- [ ] Precompute and save a good default schedule as a fallback
- [ ] CLI: `npm run optimize` prints baseline vs optimized

**Milestone A-2 (about 2:00):** `optimize()` is exported and beats baseline on the fixture network.

### A5. Tests and hardening (2:15 to 2:30)

- [ ] Same seed gives identical `SimResult`
- [ ] Boarded count never exceeds capacity
- [ ] Optimized score is at least baseline score on the fixtures
- [ ] Each scenario patch changes the result in the expected direction
- [ ] Handle empty demand and a closed route without crashing

### A6. Support (2:30 onward)

- [ ] Help debug integration issues and tune optimizer weights for a good demo
- [ ] If done early, take the LLM what-if service from Track C (see Handoffs)

### Track A: definition of done

- `simulate()` and `optimize()` exported with the signatures in `ARCHITECTURE.md`
- Tests pass
- Output matches the `SimResult` type exactly
- Demo network shows a clear improvement after optimization

---

## Track B: Owner UI (Dev 2)

**Goal:** the visual owner experience: simulation map, before/after replay, impact panel, controls.
**Branch:** `feat/owner-ui`
**You are independent because:** you build entirely against `sample-simresult.json` and a mock API, with no backend needed.

### B1. Static map (0:20 to 0:50)

- [ ] `SimMap`: SVG with stops, route lines, and labels from `network.json`
- [ ] Student dots clustered at their home stops
- [ ] Bus icons positioned at the starting stop

### B2. Replay engine (0:50 to 1:20)

- [ ] Replay driven by the `events` array and a simulated clock
- [ ] Play, pause, speed (1x, 2x, 4x), and a scrubber
- [ ] Buses move along routes; boarding moves dots into the bus; stranded dots turn red
- [ ] Live counters: boarded, waiting, stranded, current time

**Milestone B-1 (about 1:20):** one complete replay of the sample data plays smoothly.

### B3. Impact panel and charts (1:20 to 1:50)

- [ ] `ImpactPanel`: served, stranded, average wait, load factor, cost, revenue, viability gap
- [ ] Before/after comparison with deltas (green for better, red for worse)
- [ ] `DemandHeatmap`: demand by stop and time slot versus seats offered (Recharts)

### B4. Controls (1:50 to 2:20)

- [ ] Before/after toggle that replays baseline or optimized results
- [ ] **Optimize** button with a loading state
- [ ] `ScenarioBar`: preset scenario buttons
- [ ] Access vs. Cost slider that updates weights
- [ ] Schedule diff panel: "Bus 2: 08:10 to 07:45", and so on
- [ ] What-if text box (UI only; the API call comes from Track C's client)

### B5. Polish (2:20 to 2:30)

- [ ] Empty, loading, and error states
- [ ] Mobile-friendly layout check
- [ ] Clear legend and labels so judges understand the map without explanation
- [ ] Consistent colors and typography

### B6. Support (2:30 onward)

- [ ] Rehearse the demo flow and fix visual bugs
- [ ] If done early, help Track C finish the student view

### Track B: definition of done

- Complete owner demo works in mock mode, including before/after replay
- Works unchanged when Track C swaps the client from mock to the real API
- Readable on a laptop projector and on a phone

---

## Track C: Platform (Dev 3)

**Goal:** the contract, the API, the student experience, the LLM service, and deployment.
**Branch:** `feat/api-student`
**You are independent because:** a stub engine returns the sample fixture, so the full request path works before the real engine exists.

### C1. Contract and fixtures (0:00 to 0:20, with everyone)

- [x] `types.ts`, `api.md`, `network.json`, `students.json` (see Phase 0)
- [x] Make the fixtures realistic: a crowded 07:30 run, a near-empty midday run, and a stop with too little capacity, so the optimizer has a visible win

### C2. Backend skeleton and first deploy (0:20 to 0:50)

- [x] Express server, CORS, health endpoint (`/api/health`)
- [x] In-memory store seeded from fixtures
- [x] Endpoints returning stub data: `/api/network`, `/api/students`, `/api/simulate`, `/api/optimize`, `/api/scenarios`
- [x] Zod validation on request bodies
- [x] **Deploy backend (Render or Railway) and frontend (Vercel or Netlify)**; confirm they connect

**Milestone C-1 (about 0:50):** deployed frontend can call the deployed stub backend. (Completed)

### C3. Frontend foundation (0:50 to 1:15)

- [x] `api/client.ts`: typed functions for every endpoint
- [x] `api/mock.ts`: mock mode toggled by `VITE_USE_MOCK`
- [x] Zustand store with the slices from `ARCHITECTURE.md`
- [x] App shell with the Owner/Student role toggle (renders Track B's `OwnerView` when ready)

### C4. Integration (1:15 to 1:30)

- [x] Swap the stub for Track A's real `simulate()` and `optimize()`
- [x] Verify the real output matches `SimResult`; report any mismatch to Dev 1 right away
- [x] Flip the frontend from mock to the real API and confirm Track B's UI still works

**Milestone C-2 (about 1:30):** the deployed app runs real simulations. (Completed)

### C5. Student view (1:30 to 2:00)

- [x] Registration form: home stop, institution, arrival deadline, days
- [x] `POST /api/students` adds demand; trigger a re-simulation
- [x] "My bus" card: bus, departure time, stop, typical crowding
- [x] Unserved notice with a fallback (nearest served stop)
- [x] Large buttons, few fields, simple language

### C6. LLM what-if service (2:00 to 2:25)

- [ ] `llm/schemas.ts`: Zod schemas for allowed actions
- [ ] `llm/parseWhatIf.ts`: prompt that outputs JSON only; validate and retry once on failure
- [ ] `/api/whatif`: parse, apply to schedule, simulate, return result plus explanation
- [ ] `llm/explain.ts`: plain-language summary of the metric diff
- [ ] Preset what-ifs that bypass the LLM entirely
- [ ] Graceful error message if the LLM provider fails

**Milestone C-3 (about 2:20):** a typed what-if returns a result and explanation, and presets work with the LLM off.

### C7. Deployment hardening and docs (2:25 to 2:50)

- [ ] Environment variables set in both hosts; no secrets in the repo
- [ ] Warm up the backend (free tiers sleep)
- [ ] Confirm the repo is public and both links work from a clean browser
- [ ] Finish role logs in `prompts/`
- [ ] Write `README.md` (what it is, how to run, links) and `CONTRIBUTING.md`

### Track C: definition of done

- Deployed frontend and backend links both work
- All endpoints match `/contracts/api.md`
- Student registration changes the simulation
- What-if works, and presets work without the LLM

---

## Sync points (everyone)

| Time | Sync               | What happens                                                                                    |
| ---- | ------------------ | ----------------------------------------------------------------------------------------------- |
| 0:20 | Contract freeze    | Types, fixtures, and API spec locked. Later changes need a message to all three and a small PR. |
| 0:50 | Deploy check       | Stubs are live. Everyone confirms they can run and deploy.                                      |
| 1:15 | Engine handoff     | Dev 1 delivers `simulate()`. Dev 3 wires it in.                                                 |
| 1:30 | Real API switch    | Frontend leaves mock mode. Dev 2 verifies the UI against real output.                           |
| 2:00 | Optimizer handoff  | `optimize()` wired in. Full loop works end to end.                                              |
| 2:20 | LLM merge          | What-if merged only if everything else is stable.                                               |
| 2:30 | **Feature freeze** | No new features. Only bug fixes, polish, and docs.                                              |
| 2:50 | Final check        | Both links verified, repo public, `prompts/` logs complete.                                     |

---

## Merge order

Merge in this order to minimize conflicts, since each branch touches different folders:

1. `main` gets the contracts and scaffolds (Phase 0)
2. `feat/api-student`: stubs and deployment (about 0:50)
3. `feat/engine`: engine plus tests (about 1:15, refreshed at 2:00)
4. `feat/owner-ui`: owner views (about 1:30, refreshed at 2:20)
5. Final integration fixes on `main` after 2:30

Rules:

- Pull from `main` before starting each phase.
- Do not rewrite shared files; if `/contracts` must change, update it first and tell the team.
- Keep PRs small and merge quickly. A branch that stays unmerged for over an hour is a risk.

---

## Handoffs and fallbacks

| If...                      | Then...                                                                      |
| -------------------------- | ---------------------------------------------------------------------------- |
| Dev 1 finishes early       | Take `llm/` and `/api/whatif` from Track C                                   |
| Dev 2 finishes early       | Take the Student view from Track C                                           |
| Dev 3 is overloaded        | Hand off the Student view to Dev 2 and the LLM service to Dev 1              |
| Engine is late             | Keep the stub engine running; the UI and student view still work in the demo |
| Optimizer is unstable      | Ship the precomputed fallback schedule                                       |
| LLM is down                | Presets cover the what-if demo                                               |
| Backend is down at judging | Frontend mock mode is the emergency fallback                                 |

---

## Prompt logging (everyone, ongoing)

For each significant AI prompt, add an entry to your role file in `prompts/` (`prompts/dev1-engine.md`, `prompts/dev2-owner-ui.md`, `prompts/dev3-platform.md`):

```markdown
### [YYYY-MM-DD HH:MM] Prompt #<number> — <Short Topic>
- **User Prompt:** <verbatim prompt>
- **Context / Goal:** <what was requested>
- **Action Taken / Result:** <what was changed/created>
- **Issues / Debugging:** <notes on bugs, fixes, prompt adjustments>
```

Aim for at least 3 to 5 entries per developer, and include at least one real debugging story each. The judges score iterations and the debugging process.

---

## Final checklist (2:50 to 3:00)

- [ ] Deployed frontend link opens from an incognito window
- [ ] Backend health endpoint responds
- [ ] GitHub repo is public and the latest `main` is deployed
- [ ] Full demo script rehearsed once, start to finish
- [ ] Baseline, optimize, scenario, student registration, and what-if all work
- [ ] `prompts/`, `README.md`, and `ARCHITECTURE.md` are committed
- [ ] Both links are ready to paste into the submission form
