# PropVista CRM / Property AI Studio — Code Review Checklist

| Field | Value |
|-------|--------|
| **Document** | `15_CODE_REVIEW_CHECKLIST.md` |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **Use** | Copy relevant sections into GitHub PR review comments / Review Summary |
| **Governance** | Constitution §14–18, Coding Standards Manual, Test Strategy, UI Guide |

### How to use in a PR

1. Reviewer marks each applicable row **Pass** or **Fail**.  
2. Failures must cite severity: **Blocking** / **Major** / **Minor**.  
3. PR cannot merge while any **Blocking** item is Fail (unless PO written waiver).  
4. Paste a filled **Review Summary** (template at end) as the approving review comment.

**Governing references:** `00_PROJECT_CONSTITUTION.md`, `design_reference/**`, `REQUIREMENTS_AND_PROPOSAL.md`, PRD/SRS, `03_SYSTEM_ARCHITECTURE_DOCUMENT.md`, `04_DATABASE_DESIGN_DOCUMENT.md`, `openapi.yaml`, `07_UI_IMPLEMENTATION_GUIDE.md`, `08_EPICS_AND_FEATURES.md`, `09_SPRINT_PLAN.md`, `11_TEST_STRATEGY.md`, `14_CODING_STANDARDS.md`.

---

## Review Workflow

```text
PR opened (links Epic/Feature ID)
    ↓
CI green (lint, typecheck, tests)
    ↓
Author self-check (Coding Standards §35 + this checklist)
    ↓
Peer / Tech Lead review (this checklist)
    ↓
UI Verification evidence (if UI) + QA review for user-facing
    ↓
All Blocking = Pass; Majors resolved or waived
    ↓
Approve → Merge (protected branch rules)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. Ready & scope | Author | Feature Ready; MVP scope confirmed |
| 2. CI | Automation | Lint, typecheck, unit/integration pass |
| 3. Self-review | Author | Checklist self-Pass; screenshots attached if UI |
| 4. Code review | Reviewer | All applicable items Pass/Fail with notes |
| 5. QA (user-facing) | QA | Constitution §15; Screen Completion |
| 6. Approval | Reviewer + QA (if UI) | Definition of Approved Code met |
| 7. Merge | Maintainer | No Blocking fails; branch up to date |

**Rules**

- One feature/fix per PR when practical.  
- AI-assisted PRs follow the same checklist—no shortcuts.  
- “Approve with nits” allowed only when nits are **Minor**.  
- Re-request review after addressing Blocking/Major comments.

---

## Mandatory Blocking Issues

Any of the following is an automatic **Request Changes** (cannot merge):

| ID | Blocking issue |
|----|----------------|
| B1 | Out-of-MVP scope shipped (Kanban, timeline product, reminders, virtual tours/video, SMS/WhatsApp/push, alternate LLM, module permissions, multi-org) |
| B2 | UI redesign / visual divergence from `design_reference` HTML or screenshot for in-scope screens |
| B3 | Business rules or AuthZ only in the client (server missing checks) |
| B4 | Secrets committed or Gemini/API keys exposed to the browser |
| B5 | Ad-hoc `fetch`/`axios` bypassing centralized `lib/api` (new occurrences) |
| B6 | Completed feature merged with permanent mocks (no tracked temporary mock ticket) |
| B7 | New/changed write endpoint without validation |
| B8 | Typecheck or ESLint failing; PR introduces `any` sprawl without boundary note |
| B9 | Missing tests for new business logic / new endpoints (happy + auth fail + validation fail) |
| B10 | Console errors on verified flows; production stack traces/secrets in client errors |
| B11 | Broken AuthN/AuthZ on protected routes (401/403 incorrect or absent) |
| B12 | No Epic/Feature linkage and unclear acceptance criteria |

---

## Major Issues

Must fix before merge **or** obtain written Tech Lead / PO waiver with ticket:

| ID | Major issue |
|----|-------------|
| M1 | Feature folder / Clean Architecture layering violated (logic in wrong layer) |
| M2 | OpenAPI / contract drift without update |
| M3 | Schema change without migration |
| M4 | Missing loading/empty/error states on touched UI |
| M5 | Responsive not verified for touched screens |
| M6 | Accessibility baseline broken (unlabeled inputs, no focus, missing alt on meaningful images) |
| M7 | N+1 queries or unbounded list payloads on hot paths |
| M8 | AI search without timeout/fallback path |
| M9 | Inadequate logging (swallowed errors) or PII/secrets in logs |
| M10 | Incomplete AuthZ matrix for new Admin/Agent endpoints |
| M11 | UI PR without HTML/screenshot comparison evidence |
| M12 | Circular feature dependencies or god-module growth |

---

## Minor Issues

May merge as “Approve with nits” if tracked; prefer fix-in-PR when cheap:

| ID | Minor issue |
|----|-------------|
| m1 | Naming inconsistency (still understandable) |
| m2 | Comment noise / missing why-comment on non-obvious logic |
| m3 | Test descriptions unclear |
| m4 | Dead imports / minor duplication not yet extracted |
| m5 | Docs typo; README env hint incomplete but not blocking runbook |
| m6 | Non-critical performance micro-optimization |
| m7 | Optional visual-regression snapshot not added (manual fidelity present) |

---

## Auto-Approval Conditions

Auto-approval (or single-reviewer fast-track) is allowed **only if all** are true:

1. CI green (lint, typecheck, tests).  
2. Diff is **non-user-facing** OR purely mechanical (deps lockfile with hash verify, docs typo, test-only fix with no prod behavior change).  
3. No API contract, schema, AuthZ, or security surface change.  
4. No `design_reference` / UI markup change.  
5. Author is not the sole reviewer when branch protection requires otherwise—**bot labels do not replace human review for product code**.  
6. Diff &lt; ~200 LOC **and** no Blocking/Major checklist items apply.  

**Never auto-approve:** auth, payments-adjacent data, Gemini integrations, role middleware, property/lead write paths, bulk upload, or any screen fidelity change.

---

## Definition of Approved Code

Code is **Approved** only when:

- [ ] All **applicable** checklist items below are **Pass** (or Minor with explicit “nit OK”).  
- [ ] Zero open **Blocking** fails.  
- [ ] All **Major** fails fixed or waived in writing with ticket ID.  
- [ ] CI green on the merge commit SHA.  
- [ ] Constitution §14 DoD satisfied for the feature slice.  
- [ ] If UI: Constitution §17 UI Verification evidence attached; QA approved for user-facing.  
- [ ] If API: OpenAPI aligned; AuthZ + validation verified.  
- [ ] Mocks absent for completed scope (or temporary mock ticket linked and not claimed Done).  
- [ ] Reviewer posts **Approve** with Review Summary template completed.  

Partial completion is **not** Approved.

---

# Checklist Items

Legend: mark `Pass` / `Fail` / `N/A`. Add notes for every Fail.

---

## 1. General Review

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| G1 | PR description states goal, Epic/Feature ID, and test plan | Traceability to Constitution lifecycle | ☐ Pass ☐ Fail ☐ N/A | |
| G2 | Implements Ready acceptance criteria only—no extras | Prevents scope creep | ☐ Pass ☐ Fail ☐ N/A | |
| G3 | No Out-of-MVP features or nav links | MVP honesty (Constitution) | ☐ Pass ☐ Fail ☐ N/A | |
| G4 | Diff is focused; unrelated refactors separated or justified | Reviewability; safer rollback | ☐ Pass ☐ Fail ☐ N/A | |
| G5 | No secrets, credentials, or dumps in the diff | Security incident prevention | ☐ Pass ☐ Fail ☐ N/A | |
| G6 | No commented-out dead code or leftover debug | Maintainability; DoD quality | ☐ Pass ☐ Fail ☐ N/A | |
| G7 | Follows Coding Standards Manual / Constitution | Consistency across AI + human authors | ☐ Pass ☐ Fail ☐ N/A | |
| G8 | Known limitations documented in PR (with tickets) | Honest Done criteria | ☐ Pass ☐ Fail ☐ N/A | |

---

## 2. Architecture

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| A1 | Clean Architecture layers respected (UI → hooks → API → routes → services → repos → DB) | Testability; no logic leakage | ☐ Pass ☐ Fail ☐ N/A | |
| A2 | No business logic in React components beyond trivial conditionals | Server authority; reuse | ☐ Pass ☐ Fail ☐ N/A | |
| A3 | Feature-based folder placement correct | Scalability; Constitution §10 | ☐ Pass ☐ Fail ☐ N/A | |
| A4 | Centralized `lib/api` used; no new ad-hoc HTTP clients | Auth headers + error envelope consistency | ☐ Pass ☐ Fail ☐ N/A | |
| A5 | Integrations (Gemini/email/storage) behind adapters | Substitutability; test mocks | ☐ Pass ☐ Fail ☐ N/A | |
| A6 | DRY/KISS/YAGNI respected; no god-modules | Long-term cost | ☐ Pass ☐ Fail ☐ N/A | |
| A7 | No circular dependencies between features | Build health; decoupling | ☐ Pass ☐ Fail ☐ N/A | |
| A8 | Gemini-only; no alternate LLM provider abstraction | Constitution AI policy | ☐ Pass ☐ Fail ☐ N/A | |

---

## 3. Business Logic

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| BL1 | Behavior matches Requirements / FR / Feature AC | Correct product | ☐ Pass ☐ Fail ☐ N/A | |
| BL2 | Role rules enforced for Guest/Customer/Agent/Admin/Super Admin | Authorization integrity | ☐ Pass ☐ Fail ☐ N/A | |
| BL3 | Domain invariants in services (publish, stage change, bulk import valid-only) | Data integrity | ☐ Pass ☐ Fail ☐ N/A | |
| BL4 | AI search failure uses filter fallback—not another LLM | Policy + UX | ☐ Pass ☐ Fail ☐ N/A | |
| BL5 | Loan analysis has formula fallback when Gemini fails | Reliability | ☐ Pass ☐ Fail ☐ N/A | |
| BL6 | Lead detail MVP excludes timeline/reminder product backends | Out-of-MVP | ☐ Pass ☐ Fail ☐ N/A | |
| BL7 | Edge cases handled (empty lists, 404 property, duplicate email) | Production resilience | ☐ Pass ☐ Fail ☐ N/A | |

---

## 4. Frontend

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| F1 | HTML `code.html` + `screen.png` compared; evidence in PR | Pixel fidelity SOT | ☐ Pass ☐ Fail ☐ N/A | |
| F2 | No redesign (colors, spacing, icons, layout, copy) vs reference | Constitution absolute | ☐ Pass ☐ Fail ☐ N/A | |
| F3 | Loading, empty, error, hover, focus states implemented | Screen Completion Policy | ☐ Pass ☐ Fail ☐ N/A | |
| F4 | Components call hooks; hooks call API modules | Architecture | ☐ Pass ☐ Fail ☐ N/A | |
| F5 | Tailwind/tokens match `DESIGN.md`; no rogue visual library | Brand + fidelity | ☐ Pass ☐ Fail ☐ N/A | |
| F6 | Client Components only when needed (`'use client'` justified) | Next.js performance/default RSC | ☐ Pass ☐ Fail ☐ N/A | |
| F7 | Maps use Leaflet + OSM; lazy-loaded on detail | Stack + performance | ☐ Pass ☐ Fail ☐ N/A | |
| F8 | No console errors during walkthrough | DoD | ☐ Pass ☐ Fail ☐ N/A | |
| F9 | Video/virtual tour controls not shipped | Out-of-MVP | ☐ Pass ☐ Fail ☐ N/A | |

---

## 5. Backend

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| BE1 | Routes thin; logic in services | Clean Architecture | ☐ Pass ☐ Fail ☐ N/A | |
| BE2 | Prisma access via repositories (or agreed data layer) | Persistence boundary | ☐ Pass ☐ Fail ☐ N/A | |
| BE3 | Middleware: auth, role, validation, error handler used appropriately | Consistency/security | ☐ Pass ☐ Fail ☐ N/A | |
| BE4 | DTOs mapped; raw Prisma entities not leaked carelessly | Encapsulation; hide secrets fields | ☐ Pass ☐ Fail ☐ N/A | |
| BE5 | Transactions used for multi-step writes where required | Consistency (e.g. bulk) | ☐ Pass ☐ Fail ☐ N/A | |
| BE6 | Rate limiting considered for auth/AI endpoints | Abuse protection | ☐ Pass ☐ Fail ☐ N/A | |
| BE7 | Temporary mocks tracked; not left for Done features | Constitution mock policy | ☐ Pass ☐ Fail ☐ N/A | |

---

## 6. Database

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| D1 | Naming matches DB standards (`snake_case` tables/columns) | Consistency with DATABASE_DESIGN | ☐ Pass ☐ Fail ☐ N/A | |
| D2 | Migration included for schema changes | Deploy safety | ☐ Pass ☐ Fail ☐ N/A | |
| D3 | FKs/uniques/indexes appropriate for new queries | Integrity + performance | ☐ Pass ☐ Fail ☐ N/A | |
| D4 | No destructive migration without plan/rollback note | Data safety | ☐ Pass ☐ Fail ☐ N/A | |
| D5 | Password hashes and secrets never selected into API responses | Security | ☐ Pass ☐ Fail ☐ N/A | |
| D6 | Seed changes documented if required for QA | Testability | ☐ Pass ☐ Fail ☐ N/A | |

---

## 7. API

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| API1 | Paths/methods align with `/api/v1` and OpenAPI | Contract integrity | ☐ Pass ☐ Fail ☐ N/A | |
| API2 | `openapi.yaml` updated when contract changes | Consumer + test sync | ☐ Pass ☐ Fail ☐ N/A | |
| API3 | Consistent error envelope; no stack traces to clients in prod mode | Security + UX | ☐ Pass ☐ Fail ☐ N/A | |
| API4 | List endpoints paginated / bounded | Performance NFR | ☐ Pass ☐ Fail ☐ N/A | |
| API5 | Status codes correct (201 create, 401/403/400/404/409) | Client handling | ☐ Pass ☐ Fail ☐ N/A | |
| API6 | JSON field naming `camelCase` at API boundary | FE/BE alignment | ☐ Pass ☐ Fail ☐ N/A | |

---

## 8. Security

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| S1 | AuthN required on protected endpoints | Unauthorized access | ☐ Pass ☐ Fail ☐ N/A | |
| S2 | AuthZ role checks server-side (default deny) | Privilege escalation | ☐ Pass ☐ Fail ☐ N/A | |
| S3 | Input validation on all writes | Injection / corrupt data | ☐ Pass ☐ Fail ☐ N/A | |
| S4 | No secrets in repo, client bundle, or logs | Credential leak | ☐ Pass ☐ Fail ☐ N/A | |
| S5 | XSS-safe rendering of user/HTML content | Client attacks | ☐ Pass ☐ Fail ☐ N/A | |
| S6 | Upload type/size checks; no path traversal | Filesystem abuse | ☐ Pass ☐ Fail ☐ N/A | |
| S7 | Gemini key server-only | Cost + key theft | ☐ Pass ☐ Fail ☐ N/A | |
| S8 | Agent/customer data scoping respected | IDOR / data leak | ☐ Pass ☐ Fail ☐ N/A | |

---

## 9. Performance

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| P1 | No obvious N+1 or full-table scans on hot paths | Latency/cost | ☐ Pass ☐ Fail ☐ N/A | |
| P2 | Heavy admin chart libs not shipped on public homepage | Bundle / &lt;2s target | ☐ Pass ☐ Fail ☐ N/A | |
| P3 | AI calls non-blocking for chrome; timeouts present | UX under slow Gemini | ☐ Pass ☐ Fail ☐ N/A | |
| P4 | Leaflet lazy-loaded where applicable | Initial load | ☐ Pass ☐ Fail ☐ N/A | |
| P5 | Images/media reasonably sized for lists/cards | LCP / bandwidth | ☐ Pass ☐ Fail ☐ N/A | |

---

## 10. Accessibility

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| A11Y1 | Form controls have associated labels | Screen reader / baseline | ☐ Pass ☐ Fail ☐ N/A | |
| A11Y2 | Keyboard focus visible; modals operable | Keyboard users | ☐ Pass ☐ Fail ☐ N/A | |
| A11Y3 | Meaningful images have alt text | SR + SEO baseline | ☐ Pass ☐ Fail ☐ N/A | |
| A11Y4 | No a11y “fix” that redesigns visuals without PO | HTML SOT | ☐ Pass ☐ Fail ☐ N/A | |
| A11Y5 | Buttons vs links used correctly for actions/navigation | Semantics | ☐ Pass ☐ Fail ☐ N/A | |

---

## 11. Responsive Design

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| R1 | Mobile (~375), tablet (~768), desktop (~1280) checked for touched screens | NFR + Screen Completion | ☐ Pass ☐ Fail ☐ N/A | |
| R2 | Behavior matches HTML stacking/overflow at those widths | Fidelity | ☐ Pass ☐ Fail ☐ N/A | |
| R3 | Modals/tables usable on small viewports per HTML | Task completion | ☐ Pass ☐ Fail ☐ N/A | |
| R4 | Evidence noted in PR (screenshots or QA sign-off) | Auditability | ☐ Pass ☐ Fail ☐ N/A | |

---

## 12. TypeScript

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| TS1 | Strict mode respected; no implicit `any` | Safety | ☐ Pass ☐ Fail ☐ N/A | |
| TS2 | `unknown` + narrowing preferred over `any` | Soundness | ☐ Pass ☐ Fail ☐ N/A | |
| TS3 | Discriminated unions for async/UI states where applicable | Exhaustiveness | ☐ Pass ☐ Fail ☐ N/A | |
| TS4 | Shared DTO/domain types used; FE/BE not drifting silently | Contract integrity | ☐ Pass ☐ Fail ☐ N/A | |
| TS5 | No unjustified non-null assertions | Runtime safety | ☐ Pass ☐ Fail ☐ N/A | |

---

## 13. Testing

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| T1 | Unit tests for new business logic | Constitution §22; &gt;80% core goal | ☐ Pass ☐ Fail ☐ N/A | |
| T2 | Integration tests: happy + auth failure + validation failure for new endpoints | API correctness | ☐ Pass ☐ Fail ☐ N/A | |
| T3 | Gemini mocked at unit/integration boundaries | Deterministic CI | ☐ Pass ☐ Fail ☐ N/A | |
| T4 | UI/E2E or manual test notes for critical journeys touched | Regression | ☐ Pass ☐ Fail ☐ N/A | |
| T5 | Negative tests for Out-of-MVP absence when relevant | MVP honesty | ☐ Pass ☐ Fail ☐ N/A | |
| T6 | CI tests pass on the PR | Quality gate | ☐ Pass ☐ Fail ☐ N/A | |

---

## 14. Documentation

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| DOC1 | OpenAPI updated if API changed | Consumer sync | ☐ Pass ☐ Fail ☐ N/A | |
| DOC2 | Schema/design docs updated if structural DB change | SOT accuracy | ☐ Pass ☐ Fail ☐ N/A | |
| DOC3 | PR explains why; mocks/tickets linked | Process integrity | ☐ Pass ☐ Fail ☐ N/A | |
| DOC4 | Env vars documented if newly required | Onboarding / deploy | ☐ Pass ☐ Fail ☐ N/A | |
| DOC5 | No contradictory “invented” requirements in comments | Governance | ☐ Pass ☐ Fail ☐ N/A | |

---

## 15. Git

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| GIT1 | Branch naming `feature/<epic>-<short>` or `fix/...` | Workflow | ☐ Pass ☐ Fail ☐ N/A | |
| GIT2 | Commits atomic; messages explain why | History / bisect | ☐ Pass ☐ Fail ☐ N/A | |
| GIT3 | No force-push to protected defaults; history sane | Safety | ☐ Pass ☐ Fail ☐ N/A | |
| GIT4 | PR not mixing unrelated features | Review quality | ☐ Pass ☐ Fail ☐ N/A | |
| GIT5 | Merge only after approval + CI (no “merge now fix UI later”) | Constitution merge policy | ☐ Pass ☐ Fail ☐ N/A | |

---

## 16. Deployment

| # | Requirement | Why it matters | Pass / Fail | Reviewer Notes |
|---|-------------|----------------|-------------|----------------|
| DEP1 | Migrations ordered/safe for deploy | Uptime | ☐ Pass ☐ Fail ☐ N/A | |
| DEP2 | New env/secrets listed for staging/prod | Ops readiness | ☐ Pass ☐ Fail ☐ N/A | |
| DEP3 | Health checks still meaningful if touched | Smoke / Constitution §24 | ☐ Pass ☐ Fail ☐ N/A | |
| DEP4 | Frontend Vercel-compatible (no forbidden Node APIs in edge-sensitive code without note) | Deploy target | ☐ Pass ☐ Fail ☐ N/A | |
| DEP5 | Feature flags do not expose unfinished Out-of-MVP HTML | MVP honesty | ☐ Pass ☐ Fail ☐ N/A | |
| DEP6 | Rollback note for risky changes | Incident response | ☐ Pass ☐ Fail ☐ N/A | |

---

# GitHub PR Templates

## Author checklist (paste into PR body)

```markdown
## Summary
- Epic/Feature:
- Screens (SCR-*):
- Out of scope:

## Evidence
- [ ] HTML/screenshot comparison attached (if UI)
- [ ] Responsive notes (if UI)
- [ ] API/OpenAPI updated (if API)
- [ ] Migration included (if DB)

## Test plan
- [ ] Unit
- [ ] Integration
- [ ] Manual / QA

## Checklist self-review
- [ ] Coding Standards §35
- [ ] No Out-of-MVP
- [ ] No secrets
```

## Reviewer summary (paste into review)

```markdown
## Code Review Summary
- **Decision:** Approve | Approve with nits | Request changes
- **Blocking fails:** (none | list IDs)
- **Major fails:** (none | list IDs + waivers)
- **Minor nits:** (list)
- **UI evidence reviewed:** Yes | N/A
- **QA required/complete:** Yes | Pending | N/A
- **Notes:**
```

## Quick reject comment (Blocking)

```markdown
**Request changes — Blocking**
- [B#] <issue>
This violates Constitution / Coding Standards / MVP exclusions.
Please fix before re-requesting review.
```

---

## Severity → GitHub review mapping

| Severity | GitHub action |
|----------|----------------|
| Blocking | Request changes |
| Major | Request changes (or Approve blocked until waiver comment) |
| Minor | Comment or Approve with nits |
| Pass all applicable | Approve |

---

## Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Enterprise checklist for GitHub PRs |

---

**End of Code Review Checklist**
