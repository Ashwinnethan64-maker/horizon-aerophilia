# Agent Instructions & Workflow Governance

This project follows the execution roadmap detailed in [PLAN.md](file:///home/shamblonaut/dev/clones/horizon-aerophilia/PLAN.md) and the system design in [ARCHITECTURE.md](file:///home/shamblonaut/dev/clones/horizon-aerophilia/ARCHITECTURE.md).

---

## 1. Track Roles & Scope

Work is divided into 3 parallel execution tracks so agents and developers can build independently against contracts and fixtures:

| Track | Role | Scope & Ownership | Mock / Stub Used | Prompt Log |
|---|---|---|---|---|
| **Track A** | Engine (Dev 1) | `/backend/src/engine`, `/backend/tests` | Fixtures from `/contracts/fixtures` | [`prompts/dev1-engine.md`](file:///home/shamblonaut/dev/clones/horizon-aerophilia/prompts/dev1-engine.md) |
| **Track B** | Owner UI (Dev 2) | `/frontend/src/views/OwnerView`, `/frontend/src/components` | `sample-simresult.json` in mock mode | [`prompts/dev2-owner-ui.md`](file:///home/shamblonaut/dev/clones/horizon-aerophilia/prompts/dev2-owner-ui.md) |
| **Track C** | Platform (Dev 3) | `/contracts`, `/backend/src/api`, `/backend/src/llm`, `/frontend/src/api`, `/frontend/src/store`, `/frontend/src/views/StudentView`, deployment | Stub engine returning sample fixture | [`prompts/dev3-platform.md`](file:///home/shamblonaut/dev/clones/horizon-aerophilia/prompts/dev3-platform.md) |
| **Lead** | Planning / Setup | Project configuration, cross-track alignment | N/A | [`prompts/general.md`](file:///home/shamblonaut/dev/clones/horizon-aerophilia/prompts/general.md) |

---

## 2. Mandatory Manual Prompt Logging

There is no automated background script or hook. The agent must **manually append** user prompts and major turn outcomes to the appropriate role-specific file in `prompts/`:

1. Identify the active track/role being executed.
2. Append a markdown entry at the bottom of `prompts/<role>.md`:
   ```markdown
   ### [YYYY-MM-DD HH:MM] Prompt #<number> — <Short Topic>
   - **User Prompt:** <verbatim prompt>
   - **Context / Goal:** <summary of goal>
   - **Action Taken / Result:** <summary of modifications / deliverables>
   - **Issues / Debugging:** <bugs found, fixes applied, or test results>
   ```
3. Never overwrite past history; entries are strictly append-only.

---

## 3. Project Invariants

1. **Preserve Git History:** Never force-push or re-initialize repository history.
2. **Separation of Concerns:** Keep `frontend/` and `backend/` strictly separated; interface through `/contracts`.
3. **No Premature Application Code:** Do not scaffold frameworks (React, Vite, Express, Python web frameworks, databases, Docker) before the problem statement is officially announced.
4. **No Secrets in VCS:** Never commit `.env` files, API keys, or access tokens.
5. **Deterministic Engine:** Engine simulation and optimizer logic must be deterministic code using seeded RNG (`rng.ts`). The LLM never computes simulation results.

---

## 4. Integration Checkpoints & Sync Sequence

Follow the timeline defined in `PLAN.md`:

- **Phase 0 (Setup):** Commit `/contracts` (`types.ts`, `api.md`, `fixtures/`) and basic project scaffolds.
- **Checkpoint 1 (1:15):** Track A delivers `simulate()`; Track C wires it into `/api/simulate`.
- **Checkpoint 2 (1:30):** Track B switches frontend client from mock mode to the real backend API.
- **Checkpoint 3 (2:00):** Track A delivers `optimize()`; full optimization loop wired end-to-end.
- **Checkpoint 4 (2:20):** Track C merges LLM what-if translation only if base system is stable.
- **Feature Freeze (2:30):** Only bug fixes, polish, and demo rehearsal.
