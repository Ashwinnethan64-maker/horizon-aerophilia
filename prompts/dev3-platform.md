# Track C: Platform — Prompt Log

Role: Dev 3 (Platform / Contracts / Backend API / Student View / Integration)
Owner: Track C

---

### [2026-11-13 11:40] Prompt #1 — Platform Developer Roadmap & Staging
- **User Prompt:** I am the platform developer. What do I need to work on, and in what stages?
- **Context / Goal:** Outline the complete responsibilities, ownership boundaries, and sequential execution stages for the Platform Developer (Dev 3 / Track C) based on `PLAN.md` and `ARCHITECTURE.md`.
- **Action Taken / Result:** Summarized the track ownership (`/contracts`, `/backend/src/api`, `/backend/src/llm`, `/frontend/src/api`, `/frontend/src/store`, `/frontend/src/views/StudentView`, deployment) and broke down the execution roadmap across stages C1 through C7 with key synchronization checkpoints.
- **Issues / Debugging:** None.

### [2026-11-13 11:43] Prompt #2 — Planning: C1 Verification & C2 Execution
- **User Prompt:** /plan Verify completion of C1 first, then start working on C2
- **Context / Goal:** Verify full completion of Stage C1 (Contracts & Fixtures realism), then formulate a detailed implementation plan for Stage C2 (Backend Skeleton, Zod Validation, API Test Suite, and Deployment Readiness).
- **Action Taken / Result:** Audited contract types (`types.ts`), API spec (`api.md`), fixtures (`network.json`, `students.json`), and verified CLI simulation & optimization gains (+476.4 score improvement). Authored implementation plan artifact for C2 covering API integration tests, deployment configurations (`render.yaml`, `vercel.json`), and cross-origin connectivity.
- **Issues / Debugging:** None.

### [2026-11-13 11:47] Prompt #3 — Execution of Stage C2 (Backend Skeleton, API Test Suite & Deployment Readiness)
- **User Prompt:** Approval of C2 implementation plan
- **Context / Goal:** Implement automated end-to-end integration tests for all 7 Express endpoints, verify Zod schema validation, configure deployment manifests (`render.yaml`, `vercel.json`, `netlify.toml`), and add root monorepo scripts for unified build and testing.
- **Action Taken / Result:**
  - Authored `backend/tests/api.test.ts` covering 14 integration test cases: `GET /api/health`, CORS options preflight, `GET /api/network`, `GET` & `POST /api/students` (including 201 valid student creation and 400 validation error responses), `GET /api/scenarios`, `POST /api/simulate` (baseline, scenario patch, and invalid payload handling), `POST /api/optimize` (verifying schedule diff and score delta properties), and `POST /api/whatif` (including 400 missing prompt and graceful fallback).
  - Configured `render.yaml` for zero-configuration backend web service and static frontend deployments on Render.
  - Configured `frontend/vercel.json` and `frontend/netlify.toml` for seamless client-side SPA routing rewrites.
  - Added root `package.json` with workspace commands (`npm test`, `npm run build`, `npm run sim`, `npm run optimize`).
  - Verified 17/17 tests pass (100% pass across engine and API suites) and root build succeeds (`tsc` for backend, `tsc && vite build` for frontend).
- **Issues / Debugging:**
  - In `backend/tests/api.test.ts`, corrected property assertion on `OptimizationResult` from `modifications` to `diff` matching `/contracts/types.ts` and `/contracts/api.md`.

### [2026-11-13 11:53] Prompt #4 — Planning: Stage C3 (Frontend Foundation & Shared State)
- **User Prompt:** /plan check what needs to be done in C3 and plan the implementation
- **Context / Goal:** Analyze Stage C3 requirements against `PLAN.md` and `ARCHITECTURE.md` Section 7.1, and draft an implementation plan covering typed API client, mock toggle, complete Zustand store slices, and App shell enhancements.
- **Action Taken / Result:** Audited `client.ts`, `mock.ts`, `useStore.ts`, and `App.tsx`. Formulated plan covering in-memory mock student persistence, interactive Live/Mock toggle in the UI, scenario state slice, and full contract type alignment. Authored implementation plan artifact in `plan_c3.md`.
- **Issues / Debugging:** None.

### [2026-11-13 11:55] Prompt #5 — Execution of Stage C3 (Frontend Foundation & Shared State)
- **User Prompt:** Approval of Stage C3 implementation plan
- **Context / Goal:** Execute Stage C3 to deliver a typed API client, comprehensive fixture-backed mock service, Zustand store implementing all 7 slices from `ARCHITECTURE.md` Section 7.1, and an interactive App shell.
- **Action Taken / Result:**
  - Updated `frontend/src/api/client.ts` with typed methods for all 8 contract endpoints, multi-env base URL fallback (`VITE_API_URL` and `VITE_API_BASE_URL`), and reactive `setMockMode()` / `isMock` toggles.
  - Enhanced `frontend/src/api/mock.ts` with in-memory persistence for `mockStudents`, scenario-specific metric shifts, and exact `OptimizationResult` diff shapes.
  - Implemented all 7 slices in `frontend/src/store/useStore.ts` (`network`, `students`, `schedule`, `scenarios`, `weights`, `results`, `ui`).
  - Updated `frontend/src/App.tsx` shell with interactive "Live API" vs "Mock Mode" status badge, role switcher, and error recovery banner.
  - Successfully verified frontend production build (`tsc && vite build`) and backend Vitest suite (17/17 tests passing).
- **Issues / Debugging:** None.

### [2026-11-13 12:01] Prompt #6 — C4 Track Dependencies Analysis
- **User Prompt:** does c4 require completion of other tracks?
- **Context / Goal:** Clarify dependencies of Stage C4 (Integration Checkpoint) with respect to Track A (Engine) and Track B (Owner UI) according to `PLAN.md` and repository status.
- **Action Taken / Result:** Analyzed `PLAN.md` sync points and current codebase state. Explained that C4 conceptually integrates Track A's `simulate()` / `optimize()` and Track B's Owner UI with the backend API. Clarified that because baseline engine and OwnerView are already scaffolded and tested, C4 is already partially validated, and Track C is completely unblocked from proceeding to Stage C5 (Student View).
- **Issues / Debugging:** None.

### [2026-11-13 12:04] Prompt #7 — Planning: Stage C4 Verification & Stage C5 Execution
- **User Prompt:** /plan verify c4 and then start implementing c5
- **Context / Goal:** Formally verify Stage C4 integration (real simulation/optimization contracts and live backend API connectivity) and plan the implementation of Stage C5 (Student View Experience).
- **Action Taken / Result:** Audited existing `StudentView.tsx` against requirements. Created detailed implementation plan artifact (`plan_c4_c5.md`) covering dynamic bus schedule lookup based on route travel times, crowding risk detection, unserved stop and capacity fallback guidance, day-of-week selection, disruption reporting ("Bus didn't come"), and mobile accessibility.
- **Issues / Debugging:** None.

### [2026-11-13 12:07] Prompt #8 — Execution: Stage C4 Verification & Stage C5 Implementation
- **User Prompt:** Approval of C4 & C5 implementation plan
- **Context / Goal:** Verify full Stage C4 integration (Milestone C-2) and execute Stage C5 delivering a complete, dynamic student transit experience in `StudentView.tsx`.
- **Action Taken / Result:**
  - Formally verified Stage C4 integration: backend Express API serves live deterministic `simulate()` and `optimize()` engine results, passing 17/17 tests across `engine.test.ts` and `api.test.ts`.
  - Re-implemented `frontend/src/views/StudentView.tsx` with:
    - Commute registration form with student name, stop dropdown, arrival deadline shortcuts (`08:15`, `08:30`, `09:00`), and interactive Mon–Fri day selection pills.
    - Dynamic "My Bus" recommendation engine that computes exact stop pickup times and arrival times using route travel minutes and bus schedule departures.
    - Crowding risk indicators (Low, Moderate, High, Over Capacity) and concrete fallback alternatives (e.g. Stop S2 peak warning with recommendation to take optimized Bus B3 at 07:45 AM).
    - Unserved warning card when no direct trip arrives prior to student deadline.
    - Disruption reporting panel ("Bus Full / Stranded", "Bus Missed / Late") with instant feedback acknowledgment.
  - Checked off completed milestones C1 through C5 in `PLAN.md`.
  - Verified clean compilation with Vite (`npm run build:frontend`) and 100% test pass (`npm test`).
- **Issues / Debugging:** None.

### [2026-11-13 12:09] Prompt #9 — Planning: Stage C6 (LLM What-If Service & Presets)
- **User Prompt:** /plan start working on C6
- **Context / Goal:** Plan the implementation of Stage C6 (LLM What-If Service & Offline Presets) supporting all 6 action types, JSON extraction with 1-retry fallback, deterministic rule matching when offline, metric diff explanation generation, and frontend preset chips.
- **Action Taken / Result:** Audited existing `schemas.ts`, `parseWhatIf.ts`, `explain.ts`, and `OwnerView.tsx`. Authored detailed implementation plan artifact (`plan_c6.md`) covering LLM API calling with retry, offline rule engine covering all 6 actions (`shift_departure`, `skip_stop`, `add_trip`, `remove_trip`, `change_capacity`, `apply_scenario`), simulation execution in `routes.ts`, and quick preset buttons for Owner View.
- **Issues / Debugging:** None.

### [2026-11-13 12:16] Prompt #10 — Execution: Stage C6 (LLM What-If Service & Presets)
- **User Prompt:** Approval of Stage C6 implementation plan
- **Context / Goal:** Implement and verify Stage C6: dual-mode what-if parsing (live LLM with 1 retry + offline rule engine for all 6 action types), schedule and network simulation execution in `routes.ts`, metric diff explanation generator in `explain.ts`, automated integration test suite in `whatif.test.ts`, and frontend preset buttons in `OwnerView.tsx`.
- **Action Taken / Result:**
  - Implemented dual-mode parser in `backend/src/llm/parseWhatIf.ts` handling all 6 action types: `shift_departure`, `add_trip`, `remove_trip`, `change_capacity`, `skip_stop`, and `apply_scenario`, with resilient pattern matching and Gemini API JSON generation with 1-retry on failure.
  - Updated `backend/src/api/routes.ts` to execute all 6 action types on the live schedule and network, run the simulation, and generate plain-language explanations.
  - Enhanced `backend/src/llm/explain.ts` with human-readable diff explanations detailing changes in served on time, stranded students, average wait time, and operational costs.
  - Authored comprehensive test suite `backend/tests/whatif.test.ts` (13 test cases) covering rule parsing, explanation text generation, and end-to-end `POST /api/whatif` integration.
  - Added quick-preset chips in `frontend/src/views/OwnerView.tsx` ("Shift Bus 3 to 07:45 AM", "Increase Bus 1 capacity to 50", "Cancel Bus 3 12:00 run", "What if Bus B1 breaks down?").
  - Verified 30/30 tests pass (100% pass across `engine.test.ts`, `whatif.test.ts`, and `api.test.ts`) and checked off Milestone C-3 in `PLAN.md`.
- **Issues / Debugging:**
  - In `backend/src/llm/parseWhatIf.ts`, refined capacity regex from greedy match to `(?:to|of|is|=|set to)\s*(\d{1,3})` to prevent capturing the bus number digit from phrases like "Bus B1 to 50".











