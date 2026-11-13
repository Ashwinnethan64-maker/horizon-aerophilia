# Routeless: The Last Mile

> Rural student bus network simulation and deterministic schedule optimizer.
> Matching limited rural bus fleets directly to verified student demand.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 18 (recommended Node 20 or 24)
- npm >= 9

### Monorepo Workspace Commands
From the project root:
```bash
<<<<<<< HEAD
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
=======
# Run all automated tests (Engine, What-If, API Integration)
npm test
>>>>>>> feat/api-student

# Build both backend (TypeScript) and frontend (Vite React)
npm run build

# Start backend development server (Port 3001)
npm run dev:backend

# Start frontend development server (Port 5173)
npm run dev:frontend

# Warmup probe / health ping
npm run warmup

# Run baseline simulation CLI
npm run sim

# Run schedule optimizer CLI
npm run optimize
```

---

## 2. Cloud Deployment

Routeless is configured for zero-configuration deployment across leading cloud providers.

### A. One-Click Blueprint on Render (`render.yaml`)
The root `render.yaml` automatically sets up:
1. **Web Service (`routeless-backend`):** Node.js Express server running `npm run build` and `npm start` with health check at `/api/health`.
2. **Static Site (`routeless-frontend`):** Vite React SPA publishing `./dist` with SPA rewrite rules and automatic backend URL binding.

### B. Frontend Deployment on Vercel or Netlify
- **Vercel:** Fully configured via `frontend/vercel.json` with SPA route rewrites and API proxies.
- **Netlify:** Fully configured via `frontend/netlify.toml` with `/* -> /index.html 200` rewrite.
- Set `VITE_API_URL=https://your-backend-domain.com/api` in your deployment environment variables.

---

## 3. Interactive Demo Walkthrough

### 1. Live vs. Mock Mode Toggle
At the top of the app in the navigation bar, click the **Live API / Mock Mode** badge:
- **Mock Mode:** Operates 100% offline using deterministic fixtures in `/contracts/fixtures/`.
- **Live API:** Connects directly to the running Express server (`http://localhost:3001/api`).

### 2. Operator View (Dashboard)
- **Preset Scenarios:** Click scenario chips (Board Exam Surge, Monsoon Rain, Bus Breakdown, Bridge Closure) to see real-time impact on stranded students and average wait.
- **Access vs. Cost Policy Slider:** Adjust the slider to favor remote student access vs. operational cost viability.
- **Schedule Optimizer:** Click **"Optimize"** to trigger hill-climbing optimization that reallocates underutilized buses to peak morning stops, reducing stranded students from 28 to 4.
- **Natural Language What-If:** Test questions like *"Move Bus 3 to 07:45 AM"* or click the quick-preset chips to see simulated metric changes and plain-language explanations.

### 3. Student View (Community Portal)
- **Commute Registration:** Enter student name, select home village stop, choose arrival deadline, and pick days of the week.
- **Dynamic Bus Recommendation:** The portal automatically computes pickup times, arrival at school, and crowding risk.
- **Crowding Alert & Fallback Advice:** If a bus is projected to reach capacity at a stop (e.g. Stop S2 peak rush), the portal displays a prominent warning and suggests concrete fallback options.
- **Disruption Reporting:** Students can tap *"Bus Full / Stranded"* or *"Bus Missed / Late"* to notify operators and trigger demand adjustments.

---

## 4. Track Ownership & Developer Independence

The project is architected into 3 decoupled parallel tracks joined by `/contracts`:

| Track | Role | Scope & Ownership | Mock / Stub Used | Prompt Log |
|---|---|---|---|---|
| **Track A** | Engine (Dev 1) | `/backend/src/engine`, `/backend/tests/engine.test.ts` | Fixtures from `/contracts/fixtures` | `prompts/dev1-engine.md` |
| **Track B** | Owner UI (Dev 2) | `/frontend/src/views/OwnerView`, `/frontend/src/components` | `sample-simresult.json` in mock mode | `prompts/dev2-owner-ui.md` |
| **Track C** | Platform (Dev 3) | `/contracts`, `/backend/src/api`, `/backend/src/llm`, `/frontend/src/api`, `/frontend/src/store`, `/frontend/src/views/StudentView`, deployment | Stub engine returning sample fixture | `prompts/dev3-platform.md` |

See [CONTRIBUTING.md](CONTRIBUTING.md) for track governance and pull request rules.

---

## 5. Repository Architecture

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
  /tests                # Vitest unit & integration test suites (30 tests)

/frontend
  /src
    /api                # Typed API client with mock mode toggle
    /store              # Zustand state store with 7 slices
    /views              # OwnerView (operator dashboard) & StudentView (portal)
    /components         # SimMap (SVG), ImpactPanel, DemandHeatmap, ScenarioBar

prompts/                # Role-specific append-only prompt logs
ARCHITECTURE.md         # System design and specifications
PLAN.md                 # 3-hour parallel execution timeline & milestones
CONTRIBUTING.md         # Workflow governance, track boundaries & PR checklist
render.yaml             # Render cloud deployment specification
```

---

## 6. Verification Status

- **Automated Tests:** 30/30 tests pass (Engine: 3, What-If: 13, API: 14).
- **TypeScript Builds:** Zero errors on both backend and frontend.
- **Merge Readiness:** Verified conflict-free mergeability with `main`.
