# General & Planning — Prompt Log

Role: Project Lead / Architecture & Planning

---

### [2026-11-13 11:33] Prompt #1 — Phase 0 Project Setup for All Tracks
- **User Prompt:** setup the project for all tracks, so that each developer can start working independently
- **Context / Goal:** Establish complete Phase 0 setup so all 3 developers (Track A: Engine, Track B: Owner UI, Track C: Platform) can develop in parallel against typed contracts and mock fixtures without blocking each other.
- **Action Taken / Result:**
  - Authored `/contracts/types.ts` with data models (`Network`, `Stop`, `Route`, `Bus`, `Student`, `Scenario`, `SimResult`, `SimMetrics`, `SimEvent`, `Weights`, `OptimizationResult`, `WhatIfRequest`, `WhatIfResponse`).
  - Authored `/contracts/api.md` specifying all 7 REST endpoints with status codes and example request/response payloads.
  - Generated `/contracts/fixtures/network.json` (6 stops, 2 routes, 3 buses), `/contracts/fixtures/students.json` (93 registered students with peak mismatch), and `/contracts/fixtures/sample-simresult.json`.
  - Built `/backend` scaffold (Node.js + TS + Express): seeded Mulberry32 RNG (`rng.ts`), simulation engine (`simulator.ts`), scorer (`scorer.ts`), optimizer (`optimizer.ts`), CLI scripts (`npm run sim`, `npm run optimize`), What-If translation (`parseWhatIf.ts`, `explain.ts`), Zod schemas (`schemas.ts`), in-memory store (`store.ts`), and Vitest suite.
  - Built `/frontend` scaffold (Vite + React + Tailwind + Zustand): typed API client with mock mode (`client.ts`, `mock.ts`), Zustand state slices (`useStore.ts`), SVG map (`SimMap.tsx`), metrics panel (`ImpactPanel.tsx`), demand chart (`DemandHeatmap.tsx`), preset scenario toolbar (`ScenarioBar.tsx`), `OwnerView.tsx`, and `StudentView.tsx`.
  - Configured root `.gitignore`, `.env.example` files, and comprehensive root `README.md`.
  - Verified backend unit tests pass (100% pass) and frontend compiles cleanly with Vite.
- **Issues / Debugging:**
  - Fixed relative path traversal for fixture resolution in `store.ts` and `simulator.ts` to point cleanly to `/contracts/fixtures/`.
  - Added `vitest.config.ts` and configured `tsconfig.json` to prevent transpiled `.js` test conflicts.
  - Added `vite/client` types and cleaned unused imports in frontend components to ensure zero-error TypeScript builds.

### [2026-11-13 11:35] Prompt #2 — Standardize on Express for Backend
- **User Prompt:** use express for the backend. edit the plan and documentation as needed.
- **Context / Goal:** Standardize documentation, system architecture, and execution plan on Express for the backend service, removing references to alternative frameworks.
- **Action Taken / Result:**
  - Verified backend implementation is built on Express (`express`, `@types/express`, `cors`, `zod` in `backend/src/api/server.ts` and `routes.ts`).
  - Updated `ARCHITECTURE.md` tech stack table and system design to firmly lock in Node.js + TypeScript + Express, removing Fastify/FastAPI alternatives.
  - Updated `PLAN.md` to check off completed Phase 0 setup milestones and confirm Express server setup.
- **Issues / Debugging:** None. Express backend is fully wired, verified, and operational.

### [2026-11-13 11:37] Prompt #3 — Verify and Configure Express Setup
- **User Prompt:** change the current setup if any to setup express
- **Context / Goal:** Confirm and audit the backend setup to ensure Express is fully and exclusively configured, tested across all routes, and prepared for instant local development.
- **Action Taken / Result:**
  - Audited `backend/package.json` and confirmed Express (`express@^4.19.2`, `@types/express@^4.17.21`, `cors@^2.8.5`, `zod@^3.23.8`) is the sole backend HTTP server framework.
  - Executed end-to-end HTTP integration tests against Express server on `http://localhost:3001` verifying `GET /api/health`, `GET /api/network`, and `POST /api/simulate`.
  - Added active local `.env` files in `backend/` and `frontend/` matching `.env.example` configurations for zero-config developer onboarding (with `.gitignore` protection verified).
- **Issues / Debugging:** Confirmed zero remaining configuration changes needed; Express is active and verified across all endpoints.



