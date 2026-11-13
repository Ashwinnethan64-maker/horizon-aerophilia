# Contributing to Routeless: The Last Mile

Welcome to **Routeless: The Last Mile**. To ensure fast, conflict-free parallel development across the team, all contributors and AI agents must follow the governance rules below.

---

## 1. Track Boundaries & Folder Ownership

Work is split into 3 independent execution tracks. **Only touch folders and files your track owns.**

| Track | Role | Scope & Ownership | Mock / Stub Used | Prompt Log |
|---|---|---|---|---|
| **Track A** | Engine (Dev 1) | `/backend/src/engine`, `/backend/tests/engine.test.ts` | Fixtures from `/contracts/fixtures` | `prompts/dev1-engine.md` |
| **Track B** | Owner UI (Dev 2) | `/frontend/src/views/OwnerView`, `/frontend/src/components` | `sample-simresult.json` in mock mode | `prompts/dev2-owner-ui.md` |
| **Track C** | Platform (Dev 3) | `/contracts`, `/backend/src/api`, `/backend/src/llm`, `/frontend/src/api`, `/frontend/src/store`, `/frontend/src/views/StudentView`, deployment | Stub engine returning sample fixture | `prompts/dev3-platform.md` |

If a change is required in another track's directory, propose it to that track's owner rather than modifying it directly.

---

## 2. Invariants & Architecture Principles

1. **Contracts are the Single Source of Truth:**
   All shared data models live in `/contracts/types.ts` and the REST endpoint definitions in `/contracts/api.md`. Changes to `/contracts` require consensus from all three tracks.
2. **Deterministic Engine:**
   Simulation and optimizer logic in `/backend/src/engine` must remain 100% deterministic using the seeded RNG (`rng.ts`). The same seed must always produce the identical `SimResult`.
3. **The LLM Never Computes:**
   The LLM translates natural language into structured actions and generates plain-language explanations of metric diffs. It never calculates passenger loads or simulation numbers.
4. **Offline Resilience:**
   The entire system must run without internet access or LLM API keys. Presets and mock fallbacks must function cleanly offline.
5. **Zero Secrets in Version Control:**
   Never commit `.env` files, API keys, or access tokens. Always use `.env.example` as a template.

---

## 3. Mandatory Prompt Logging

Per project rules, every developer/agent must **manually append** user prompts and major turn outcomes to their track's file in `prompts/`:

- Track A: `prompts/dev1-engine.md`
- Track B: `prompts/dev2-owner-ui.md`
- Track C: `prompts/dev3-platform.md`

### Log Format:
```markdown
### [YYYY-MM-DD HH:MM] Prompt #<number> — <Short Topic>
- **User Prompt:** <verbatim prompt>
- **Context / Goal:** <summary of goal>
- **Action Taken / Result:** <summary of modifications / deliverables>
- **Issues / Debugging:** <bugs found, fixes applied, or test results>
```
*Entries are strictly append-only; never overwrite past history.*

---

## 4. Pull Request Checklist

Before submitting a PR to `main`:

- [ ] All tests pass: `npm test`
- [ ] Both frontend and backend compile cleanly: `npm run build`
- [ ] No git conflicts against `main`: `git merge-tree $(git merge-base main HEAD) main HEAD`
- [ ] Zero untracked `.env` files or temporary debug files
- [ ] Relevant prompt log updated in `prompts/`

