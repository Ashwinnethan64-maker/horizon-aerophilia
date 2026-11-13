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

