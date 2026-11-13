# Routeless: The Last Mile

> Rural student bus network simulation and deterministic schedule optimizer.
> Matching limited rural bus fleets directly to verified student demand.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 18 (recommended Node 20 or 24)
- npm >= 9

### Running the Backend (Port 3001)
```bash
cd backend
npm install
npm run dev
```
- API health check: `http://localhost:3001/api/health`
- Source transport dataset: `http://localhost:3001/api/dataset`
- Optional what-if provider: set `LLM_API_KEY`, `LLM_API_URL`, and `LLM_MODEL` in `backend/.env`; deterministic parsing remains available without a key.
- Run deterministic engine tests: `npm test`
- Run baseline simulator CLI: `npm run sim`
- Run schedule optimizer CLI: `npm run optimize`

### Running the Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
- App accessible at: `http://localhost:5173`
- Defaults to **Mock Mode** (`VITE_USE_MOCK=true`), reading directly from `/contracts/fixtures/` with zero backend dependency.
- To connect to the live backend, set `VITE_USE_MOCK=false` in `frontend/.env`.

---

## 2. Track Ownership & Developer Independence

The project is architected into 3 decoupled parallel tracks joined by `/contracts`:

| Track | Role | Scope & Ownership | Mock / Stub Used | Prompt Log |
|---|---|---|---|---|
| **Track A** | Engine (Dev 1) | `/backend/src/engine`, `/backend/tests` | Fixtures from `/contracts/fixtures` | `prompts/dev1-engine.md` |
| **Track B** | Owner UI (Dev 2) | `/frontend/src/views/OwnerView`, `/frontend/src/components` | `sample-simresult.json` in mock mode | `prompts/dev2-owner-ui.md` |
| **Track C** | Platform (Dev 3) | `/contracts`, `/backend/src/api`, `/backend/src/llm`, `/frontend/src/api`, `/frontend/src/store`, `/frontend/src/views/StudentView`, deployment | Stub engine returning sample fixture | `prompts/dev3-platform.md` |

### How Developers Work Independently:
- **Dev 1 (Engine):** Works purely in `/backend/src/engine` and tests with `npm test`, `npm run sim`, and `npm run optimize`. No UI or HTTP server required.
- **Dev 2 (Owner UI):** Works purely in `/frontend/src/views/OwnerView` and `/frontend/src/components`. Runs `npm run dev` with mock mode enabled to iterate on maps, charts, and replay without waiting for the backend.
- **Dev 3 (Platform):** Manages API routes in `/backend/src/api`, LLM services in `/backend/src/llm`, student registration in `/frontend/src/views/StudentView`, and deployments.

---

## 3. Repository Architecture

```
/contracts
  types.ts              # Canonical shared TypeScript data contracts
  api.md                # Full REST API request/response specifications
  /fixtures
    transport-dataset.json # Mangaluru / Polali routes, fleet, allocations, and economics
    optimized-schedule.json # Precomputed Polali allocation used as optimizer fallback
    network.json        # 6 stops, 2 routes, 3 buses synthetic network
    students.json       # ~95 student demand registrations with morning mismatch
    sample-simresult.json # Timeline events and performance metrics fixture

/backend
  /src
    /engine             # Pure deterministic simulator, scorer, optimizer, RNG
    /api                # Express server, routes, in-memory store
    /llm                # Natural language what-if parser & result explainer
  /tests                # Vitest unit test suite

/frontend
  /src
    /api                # Typed API client with mock mode toggle
    /store              # Zustand state store
    /views              # OwnerView (operator dashboard) & StudentView (portal)
    /components         # SimMap (SVG), ImpactPanel, DemandHeatmap, ScenarioBar

prompts/                # Role-specific append-only prompt logs
ARCHITECTURE.md         # System design and specifications
PLAN.md                 # 3-hour parallel execution timeline & milestones
AGENTS.md               # Workflow governance & invariants
```

---

## 4. Integration Checkpoints

- **Phase 0 (Setup):** Contracts, fixtures, and runnable scaffolds committed to `main`.
- **Checkpoint 1 (1:15):** Track A merges real `simulate()`; Track C wires it into `/api/simulate`.
- **Checkpoint 2 (1:30):** Track B switches frontend from mock mode to the real backend API.
- **Checkpoint 3 (2:00):** Track A delivers `optimize()`; full optimization loop wired end-to-end.
- **Checkpoint 4 (2:20):** Track C merges LLM what-if translation.
- **Feature Freeze (2:30):** Bug fixes, visual polish, and demo rehearsal.

