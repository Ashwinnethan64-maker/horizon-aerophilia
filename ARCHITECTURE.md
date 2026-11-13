# ARCHITECTURE

**Project:** Routeless: The Last Mile
**Purpose:** An interactive simulation and optimizer that helps rural bus operators match limited buses to student demand, and gives students visibility into the plan.

---

## 1. Goals and Principles

**Primary objective:** maximize the number of students who reach their institution on time. Revenue is a sustainability constraint, not the goal.

**Design principles**

1. **Separate frontend and backend, joined by a typed contract.** The two sides meet only at the API in `/contracts`, so they can be built and merged independently.
2. **The LLM never computes.** It translates text into structured parameters and explains results. The simulator and optimizer are deterministic code.
3. **Everything is config.** Buses, capacities, costs, weights, and scenarios live in data, not in code, so new constraints are patches, not rewrites.
4. **Fair comparisons.** A seeded RNG means "before" and "after" replays use identical demand.
5. **Works without the LLM and without the backend.** Preset what-ifs, a precomputed default optimization, and a frontend mock mode keep the demo alive if something fails.

---

## 2. Tech Stack

| Layer              | Choice                                                | Reason                                                        |
| ------------------ | ----------------------------------------------------- | ------------------------------------------------------------- |
| Frontend framework | React + Vite + TypeScript                             | Fast setup, strong AI-tool support, shared types with backend |
| Styling            | Tailwind CSS                                          | Quick, consistent UI                                          |
| State              | Zustand                                               | Minimal boilerplate, shared across Owner and Student views    |
| Simulation view    | SVG (Canvas if it lags)                               | About 100 dots and a few buses; easy to style and debug       |
| Charts             | Recharts                                              | Demand heatmap, before/after comparisons                      |
| Backend            | Node.js + TypeScript + Express (or Fastify)           | Same language as frontend, so contract types are shared       |
| Engine             | Pure TypeScript modules inside the backend            | Deterministic, testable, no framework dependencies            |
| LLM access         | Backend `/api/whatif` route                           | Keeps the API key server-side                                 |
| Validation         | Zod                                                   | Validates request bodies and LLM JSON                         |
| Tests              | Vitest                                                | Engine unit tests                                             |
| Persistence        | In-memory on the backend (JSON fixtures as seed)      | No database or auth needed                                    |
| Hosting            | Frontend on Vercel/Netlify; backend on Render/Railway | Free tiers, deploy from GitHub                                |

**Fallback if the team is Python-strong:** backend in FastAPI with the engine in Python, keeping the same API contract. The frontend is unaffected.

---

## 3. System Overview

```
┌──────────────────────── Frontend (React, /frontend) ────────────────────────┐
│                                                                              │
│   Owner View          Student View            Scenario / What-if panel       │
│        └──────────────────┬──────────────────────────┘                       │
│                           ▼                                                  │
│                   Zustand store                                              │
│                           │                                                  │
│                  Typed API client  ◄── mock mode (reads /contracts/fixtures) │
└───────────────────────────┬──────────────────────────────────────────────────┘
                            │ HTTP + JSON (contract in /contracts)
                            ▼
┌──────────────────────── Backend (Node, /backend) ───────────────────────────┐
│   API routes + Zod validation                                                │
│        │                                   │                                 │
│        ▼                                   ▼                                 │
│   Engine (pure TS)                    LLM service                            │
│   ┌───────────┬────────┬───────────┐       │                                │
│   │ Simulator │ Scorer │ Optimizer │       ▼                                │
│   └───────────┴────────┴───────────┘   LLM provider                         │
│   Scenarios + seeded RNG                                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Core data loop**

```
Student registers need ─► Demand data ─► Simulation + Optimizer ─► New schedule
        ▲                                                              │
        └────────────── student sees their bus / fallback ◄────────────┘
                Owner sees demand, impact, and viability gap
```

---

## 4. Users and Views

A role toggle at the top of the app switches between views. There is no login.

### Owner view

- Demand heatmap by stop and time versus seats offered
- Live simulation of the current schedule
- One-click **Optimize** with before/after replay and a summary of changes
- Impact panel: students served, stranded, average wait, load factor, cost, revenue, viability gap
- Constraint controls: number of buses, capacity, driver hours, fuel cost, permitted routes
- Scenario bar (exam surge, rain, breakdown, route closure)
- Access vs. Cost slider
- What-if text box (LLM-assisted)

### Student view

- Registration form: home stop, institution, arrival deadline, days of week
- "My bus": bus, time, stop, typical crowding
- Unserved notice with a fallback (nearest served stop or pooled option)
- Disruption report ("bus didn't come") that feeds back into the simulation

---

## 5. Shared Contract (`/contracts`)

The contract is the only thing both sides depend on. It changes only by agreement, through a small PR.

```
/contracts
  types.ts          Network, Bus, Student, Scenario, SimResult, etc.
  api.md            endpoint list with request/response shapes
  fixtures/         network.json, students.json, sample-simresult.json
```

### Data model

```ts
type Stop = { id: string; name: string; x: number; y: number };

type Route = {
  id: string;
  stopIds: string[];
  travelMinutes: number[]; // between consecutive stops
  destinationStopId: string; // school or college
};

type Bus = {
  id: string;
  routeId: string;
  capacity: number;
  departureTimes: string[]; // "HH:MM"
  costPerKm: number;
  maxDriverHours: number;
};

type Student = {
  id: string;
  homeStopId: string;
  destinationId: string;
  arriveBy: string; // "HH:MM"
  days: number[]; // 0-6
};

type Network = { stops: Stop[]; routes: Route[]; buses: Bus[] };

type Scenario = {
  id: string;
  label: string;
  patches: Patch[]; // e.g. capacity x0.7, route closed, demand x1.4
};

type Weights = {
  served: number;
  wait: number;
  crowding: number;
  viability: number;
};

type SimResult = {
  events: SimEvent[]; // timeline for animation
  metrics: {
    servedOnTime: number;
    stranded: number;
    avgWaitMin: number;
    loadFactor: number;
    revenue: number;
    cost: number;
    viabilityGap: number; // max(0, requiredRevenue - revenue)
  };
};
```

### API endpoints (v1)

| Method     | Path             | Purpose                                                    |
| ---------- | ---------------- | ---------------------------------------------------------- |
| GET        | `/api/network`   | Stops, routes, buses                                       |
| GET / POST | `/api/students`  | List and register demand                                   |
| POST       | `/api/simulate`  | Run a schedule and scenario, return `SimResult`            |
| POST       | `/api/optimize`  | Return new schedule, diff, and before/after `SimResult`    |
| POST       | `/api/whatif`    | Text in; validated parameters, result, and explanation out |
| GET        | `/api/scenarios` | List of preset scenarios                                   |

Full request and response shapes live in `/contracts/api.md`.

---

## 6. Backend

### 6.1 Engine (`/backend/src/engine`)

Pure TypeScript with no HTTP or framework imports. Exposes two functions:

```ts
simulate(network, students, scenario, seed): SimResult
optimize(network, students, weights, seed): { schedule, diff, before, after }
```

**Simulator**

- Discrete time steps of 1 simulated minute.
- Each tick: students arrive at stops, buses advance along routes, boarding occurs up to capacity, and students who cannot board wait or are marked stranded.
- Uses a **seeded RNG** (`rng.ts`) so the same seed gives identical demand across runs.
- Outputs an event timeline (for animation) and summary metrics.
- Has a **headless mode** (no events recorded) used by the optimizer for speed.

**Scorer**

```
score = W1 * servedOnTime
      - W2 * avgWait
      - W3 * overcrowding
      - W4 * max(0, minRevenue - revenue)
```

Weights come from the Access vs. Cost slider. Access-heavy settings raise W1 and lower W4.

**Optimizer (v1)**

- **Search space:** departure time offsets and bus-to-route assignments.
- **Method:** random-restart hill climbing, capped at roughly 1-2 seconds or a fixed iteration count. Each candidate is scored by a headless simulation.
- **Output:** new schedule, diff against the old one, and the viability gap.
- **Stretch:** add feeder loops as candidate routes.
- **Fallback:** a precomputed good schedule for the default network, used if the search misbehaves.

**Scenarios** are patches applied to the network config before simulation.

| Scenario       | Patch                                     |
| -------------- | ----------------------------------------- |
| Exam day surge | demand x1.4, earlier arrival deadlines    |
| Rain           | travel time x1.3, student no-show rate up |
| Breakdown      | one bus removed                           |
| Route closure  | one route's stops unavailable             |

A surprise constraint in the challenge should mean adding a new patch type, not changing the simulator.

### 6.2 API layer (`/backend/src/api`)

- Express/Fastify server, CORS configured for the frontend origin
- Zod validation on every request body
- In-memory store seeded from `/contracts/fixtures`
- During early development, routes call a **stub engine** that returns `sample-simresult.json`, then switch to the real engine at the first integration checkpoint

### 6.3 LLM service (`/backend/src/llm`)

**Flow**

1. Owner types a what-if, for example "Move Bus 2 to 7:15 and skip Stop D."
2. The frontend sends the text to `/api/whatif`, and the backend adds a compact schedule summary.
3. The LLM returns structured JSON only:
   ```json
   { "action": "shift_departure", "bus": "B2", "newTime": "07:15" }
   ```
4. The backend validates it with **Zod**. On failure it returns a friendly error so the UI can offer a retry.
5. The engine runs the modified schedule.
6. A second LLM call turns the metric diff into a plain-language explanation.

**Supported actions (v1):** `shift_departure`, `skip_stop`, `add_trip`, `remove_trip`, `change_capacity`, `apply_scenario`.

**Resilience:** preset what-if buttons call `/api/simulate` directly and never touch the LLM. If the provider is down, only the free-text box is affected.

---

## 7. Frontend

### 7.1 State (`/frontend/src/store`)

Single Zustand store with these slices:

- `network`: stops, routes, buses
- `students`: registered demand
- `schedule`: current and optimized schedules
- `scenario`: active patches
- `weights`: Access vs. Cost slider value
- `results`: baseline and optimized `SimResult`
- `ui`: role, replay position, loading flags

### 7.2 API client (`/frontend/src/api`)

- Typed functions, one per endpoint, using types from `/contracts`
- **Mock mode** (environment flag) returns fixtures instead of calling the backend, so UI work never blocks on the backend
- Base URL comes from an environment variable

### 7.3 Views and components

- `OwnerView`, `StudentView`
- `SimMap`: SVG stops, routes, student dots, and moving buses, driven by the `events` array
- `ImpactPanel`, `DemandHeatmap`, `ScenarioBar`, replay controls, before/after toggle

---

## 8. Repository Structure

```
/contracts
  types.ts  api.md
  /fixtures      network.json  students.json  sample-simresult.json
/backend
  /src
    /engine      simulator.ts  scorer.ts  optimizer.ts  scenarios.ts  rng.ts
    /api         server.ts  routes.ts  store.ts
    /llm         parseWhatIf.ts  explain.ts  schemas.ts
  /tests
  package.json
/frontend
  /src
    /api         client.ts  mock.ts
    /store       useStore.ts
    /views       OwnerView.tsx  StudentView.tsx
    /components  SimMap.tsx  ImpactPanel.tsx  DemandHeatmap.tsx  ScenarioBar.tsx
  package.json
prompts/         role-specific prompt logs in prompts/<role>.md
ARCHITECTURE.md  this document
CONTRIBUTING.md  ownership and branching rules
README.md
```

---

## 9. Team Split and Ownership

Three developers, each owning distinct folders so work can proceed in parallel and merge cleanly.

### Dev 1: Engine

**Owns:** `/backend/src/engine`, `/backend/tests`

- `rng.ts`, `simulator.ts` (with headless mode), `scorer.ts`, `scenarios.ts`, `optimizer.ts`
- CLI script (`npm run sim`) that loads fixtures, runs baseline and optimized, and prints metrics
- Unit tests: same seed gives same result, capacity is respected, optimizer beats baseline on the fixture network
- **Done when:** the CLI shows the optimized schedule serving more students than baseline, in the `SimResult` shape.

### Dev 2: Frontend (Owner view and simulation)

**Owns:** `/frontend/src/views/OwnerView`, `/frontend/src/components`

- `SimMap`, replay controls, before/after toggle
- `ImpactPanel`, `DemandHeatmap`, `ScenarioBar`, Access vs. Cost slider, Optimize button
- Builds against `sample-simresult.json` in mock mode
- **Done when:** the full owner demo works in mock mode, including before/after replay.

### Dev 3: API, LLM, data, student view, deploy

**Owns:** `/backend/src/api`, `/backend/src/llm`, `/frontend/src/api`, `/frontend/src/store`, `/frontend/src/views/StudentView`, `/contracts/fixtures`

- Synthetic fixture network and about 100 students with a deliberate mismatch for the optimizer to fix
- Server and endpoints backed by a stub engine until Dev 1 delivers
- LLM what-if parser, explainer, and presets
- API client with mock mode, Zustand store, app shell with the Owner/Student toggle
- Student view: registration form, "my bus", unserved fallback notice
- Deployment, CORS, environment variables, and `prompts/` log upkeep

If Dev 1 finishes early, they take the LLM service and the student view from Dev 3.

### Working rules

- **One owner per folder.** No edits outside your folders without a message.
- **`/contracts` changes by agreement.** Post the change, update the contract in a small PR, then code against it.
- **Branches:** `feat/engine`, `feat/owner-ui`, `feat/api-student`, merged to `main` through short PRs, small and often.

---

## 10. Synthetic Data

- A fictional village cluster: about 6 stops, 3 buses, 2 routes plus a spare bus
- About 80-100 students with realistic timings clustered around 7:00-9:00
- At least one deliberate mismatch: a crowded 7:30 run and a near-empty midday run, so the optimizer has a visible win

---

## 11. Build Plan and Integration Checkpoints (3 hours)

| Time      | Milestone                                                                           |
| --------- | ----------------------------------------------------------------------------------- |
| 0:00-0:20 | Contracts and fixtures committed; blank frontend and stub backend **deployed**      |
| 0:20-1:15 | Parallel work: engine, owner UI in mock mode, API and student view against the stub |
| 1:15      | **Checkpoint 1:** engine merged into backend; `/api/simulate` returns real results  |
| 1:30      | **Checkpoint 2:** frontend switches from mock mode to the real API                  |
| 2:00      | **Checkpoint 3:** optimizer, scenarios, and student registration working end to end |
| 2:20      | **Checkpoint 4:** LLM what-if merged (only if the above is stable)                  |
| 2:30      | Feature freeze: testing, bug fixes, demo rehearsal, final `prompts/` logs          |
| 2:50      | Confirm deployed links work and the repo is public                                  |

---

## 12. Deployment

- **Frontend:** Vercel or Netlify, with `VITE_API_URL` pointing to the backend
- **Backend:** Render or Railway, with `LLM_API_KEY` and `FRONTEND_ORIGIN` set as environment variables
- Deploy stubs in the first 20 minutes so every later merge is already deployable
- Note: free-tier backends may sleep when idle, so hit the health endpoint a few minutes before judging

---

## 13. Risks and Mitigations

| Risk                                  | Mitigation                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Optimizer slow or unstable            | Cap iterations, seeded RNG, precomputed fallback result                    |
| Animation consumes time               | Simple dots moving along lines; polish last                                |
| LLM unavailable during judging        | Preset what-ifs work without the LLM                                       |
| Backend asleep or down during judging | Frontend mock mode as an emergency fallback; warm up the server beforehand |
| Contract drift between teammates      | Fixtures are the source of truth; change them first                        |
| Merge conflicts                       | One owner per folder; small, frequent PRs                                  |
| Surprise challenge                    | All numbers in config; scenarios are patches                               |
| Optimizer recommends cutting routes   | Score access first; show the viability gap instead of dropping service     |

---

## 14. Evaluation Mapping

| Criterion                          | Where it shows up                                |
| ---------------------------------- | ------------------------------------------------ |
| Prompt quality and iterations      | `prompts/` role logs                             |
| AI utilization                     | Natural-language what-if and result explanations |
| Creativity                         | Interactive simulation with before/after replay  |
| Problem-solving approach           | Demand-first optimization with viability gap     |
| Debugging process                  | Documented failures and fixes in `prompts/`      |
| Adaptability to surprise challenge | Config-driven scenarios and patches              |
| Final working solution             | Deployed app plus public GitHub repo             |

---

## 15. Demo Script (suggested)

1. Introduce the persona: a small operator with 3 buses, and students stranded at Stop C.
2. Run the baseline and show the stranded counter.
3. Click **Optimize** and replay the same morning; show the improvement.
4. Show the viability gap and move the Access vs. Cost slider.
5. Switch to the Student view and register a new student; watch the plan update.
6. Trigger a scenario (breakdown or exam surge) and re-optimize.
7. Use the what-if box for one natural-language change.
