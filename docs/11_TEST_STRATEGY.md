# PropVista CRM / Property AI Studio — Test Strategy

| Field | Value |
|-------|--------|
| **Document** | `11_TEST_STRATEGY.md` — QA & Test Strategy |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **Governance** | `docs/00_PROJECT_CONSTITUTION.md` §14–15, §22 |
| **Requirements** | PRD, SRS, Requirements & Proposal |
| **UI SOT** | `docs/design_reference/**` + `docs/07_UI_IMPLEMENTATION_GUIDE.md` |
| **Backlog** | `docs/08_EPICS_AND_FEATURES.md`, `docs/09_SPRINT_PLAN.md` |
| **API** | `docs/openapi.yaml` |

---

## 1. Purpose

This document defines how QA and engineering verify Property AI Studio / PropVista CRM for MVP: what to test, how, when, tools, ownership, entry/exit criteria, and the complete test plan mapped to sprints and screens.

## 2. Scope

### 2.1 In Scope (MVP)

- Auth (email/password, JWT, five roles)
- Homepage, AI search (standard/fallback/empty), property detail + Leaflet map
- Favorites, customer dashboard, leads list/detail (MVP subset), visit scheduling
- Property inventory/editor/media, bulk upload
- AI chat, loan analysis, AI config (Gemini only)
- Notifications (email + in-app), CMS, command center & reports
- Shared loading/empty/error, responsive, a11y baseline, health/deploy smoke

### 2.2 Explicitly Out of Scope (do not test as product features)

Kanban; activity timeline product; reminders/automation; virtual tours/video upload; SMS/WhatsApp/push; alternate LLMs; module-level permissions; multi-org.

**Negative tests required:** confirm these are absent from MVP navigation and flows.

### 2.3 Quality Objectives

| Objective | Target |
|-----------|--------|
| Core business logic unit coverage | >80% (NFR-M-004) |
| New endpoints | Integration: happy + auth fail + validation fail |
| UI fidelity | Indistinguishable from HTML for in-scope screens |
| Primary route load | <2s average on reference broadband (NFR) |
| CI gates | Typecheck, ESLint (no warnings on completed screens), tests pass |
| Release smoke | Auth, property list/detail, AI search, lead capture, admin login |

---

## 3. QA Strategy

### 3.1 Principles

1. **Evidence > claims** — screenshots, test logs, CI artifacts.
2. **HTML wins** — UI defects judged against `design_reference` HTML + `screen.png`.
3. **Server is source of truth** — AuthZ and business rules verified on API, not only UI.
4. **AI isolation** — Mock Gemini in automated tests; sandbox/manual Gemini checks for RCs.
5. **No redesign bugs** — “Looks better” ≠ pass; divergence from HTML = fail.
6. **MVP honesty** — Presence of Out-of-MVP features = release blocker.
7. **Shift-left** — Definition of Ready requires testable AC; tests written with feature work.
8. **Real API before Done** — Mocks allowed temporarily; Constitution DoD requires real API for Done.

### 3.2 Roles & Ownership

| Role | Responsibility |
|------|----------------|
| Developer | Unit + API/integration tests for owned code; fix defects; no console/TS/lint errors |
| QA | UI fidelity, exploratory, responsive, a11y baseline, acceptance, regression packs, release sign-off |
| Tech Lead | Test architecture, coverage gates, AI mock strategy, flaky-test control |
| Product Owner | Acceptance of MVP RC; scope waivers in writing only |
| AI coding assistants | Must add tests per Constitution §22; must not skip UI Verification |

### 3.3 Test Pyramid

```
        /\
       /E2E\          Critical journeys (few, stable)
      /------\
     /  UI /  \       Component + Playwright/Cypress journeys + manual fidelity
    / Component\
   /------------\
  / Integration  \    API + DB (Prisma) — primary backend gate
 /----------------\
/   Unit tests     \  Domain services, validators, mappers — largest layer
--------------------
```

### 3.4 Environments

| Env | Data | Gemini | Purpose |
|-----|------|--------|---------|
| Local | Local PostgreSQL + seed | Mock or limited key | Dev + unit/integration |
| CI | Ephemeral DB | Always mocked | PR gates |
| Staging | Staging DB + seed | Real Gemini (rate-limited) | QA fidelity, AI sandbox, UAT |
| Production | Live | Real Gemini | Smoke only post-deploy |

### 3.5 Entry / Exit Criteria

**Feature test entry**

- [ ] Feature Ready (Constitution §13)
- [ ] AC testable; OpenAPI contract available
- [ ] Build deploys to Local/Staging
- [ ] Seed data sufficient for scenarios

**Feature test exit (Done)**

- [ ] Constitution §14 DoD + §15 QA checklist
- [ ] UI Guide screen checklist (if UI)
- [ ] Required automated tests green in CI
- [ ] Defects fixed or PO-waived in writing

**Sprint exit**

- [ ] Sprint Plan DoD for that sprint
- [ ] Regression pack for touched areas green
- [ ] No Sev-1/Sev-2 open without waiver

**MVP RC exit**

- [ ] All MVP SCR-* Screen Completion Policy complete
- [ ] Acceptance suite signed by PO
- [ ] Security checklist complete
- [ ] Out-of-MVP absence verified
- [ ] Smoke on staging green; Vercel FE deploy path verified

### 3.6 Defect Severity

| Severity | Definition | SLA (staging) |
|----------|------------|---------------|
| S1 | Blocker: auth broken, data loss, security hole, blank critical page | Fix before merge/release |
| S2 | Major: primary journey broken, AI fallback missing, role bypass | Fix in sprint |
| S3 | Minor: non-critical UI/HTML delta, copy, secondary path | Backlog / same sprint if fidelity |
| S4 | Cosmetic / enhancement (must still not violate HTML if in-scope) | PO triage |

**HTML fidelity gaps on in-scope screens are at least S2** unless PO waives.

### 3.7 Traceability

| Artifact | Maps to |
|----------|---------|
| FR-* (PRD/SRS) | TC-* cases |
| FEAT-* | Sprint + automated suites |
| SCR-* | UI / responsive / a11y / acceptance |
| OpenAPI operations | API tests |

---

## 4. Unit Testing

### 4.1 Purpose

Verify domain logic in isolation: validators, mappers, pricing/loan formula fallback, search filter builders, auth helpers, notification rule evaluation, bulk row validators.

### 4.2 Scope

| Include | Exclude |
|---------|---------|
| Backend services / use-cases | React presentational markup |
| Pure mappers DTO ↔ domain ↔ VM | Pixel layout |
| Zod/Joi/class-validator schemas | Live Gemini / live DB |
| Loan formula fallback math | Full HTTP stack |

### 4.3 Standards

- Framework: **Vitest** or **Jest** (match repo choice; TypeScript).
- Location: colocated `*.test.ts` / `__tests__` near unit under test.
- Naming: `describe(unit)` / `it(behavior)`.
- Coverage gate: **>80%** on core business logic packages (services, validators, mappers).
- No network; Gemini client always mocked.
- Deterministic clocks/IDs where needed.

### 4.4 Mandatory Unit Suites

| Suite ID | Area | Examples |
|----------|------|----------|
| UT-AUTH | Password hash/compare wrappers, token claims shape | Reject empty password; role enum |
| UT-SEARCH | NL→filter mapping helpers (post-Gemini parse) | Bedrooms/price bounds |
| UT-LOAN | Formula fallback | Known income→payment fixtures |
| UT-BULK | Row validation | Missing required field → error row |
| UT-LEAD | Stage transition rules | Invalid stage rejected |
| UT-MAPPER | Property/Lead DTO mappers | Null-safe amenities |
| UT-AI-CFG | Config defaults merge | Greeting fallback |

### 4.5 Done Criteria (unit)

- [ ] New business logic has unit tests (Constitution §22.2)
- [ ] Coverage threshold met or gap listed with Tech Lead approval
- [ ] CI runs unit tests on every PR

---

## 5. Integration Testing

### 5.1 Purpose

Verify API + Prisma/PostgreSQL behavior together: persistence, transactions, role middleware, file metadata, notification writes.

### 5.2 Scope

- HTTP handlers → services → Prisma → DB
- Auth middleware + refresh token persistence
- Multipart media upload (local storage in dev)
- Bulk upload session + row errors tables
- Seeded fixtures; transactional rollback or DB reset per suite

### 5.3 Standards

- Supertest (or equivalent) against Express app
- Test DB URL separate from dev (`DATABASE_URL_TEST`)
- Migrations applied before suite
- Gemini mocked at adapter boundary
- Each new endpoint: **happy path + auth failure + validation failure** (Constitution §22.2)

### 5.4 Mandatory Integration Suites

| Suite ID | Coverage |
|----------|----------|
| IT-AUTH | Register, login, refresh, logout, protected 401 |
| IT-USERS-AGENTS | Admin CRUD; non-admin 403 |
| IT-PROP | Create draft/publish; list filters; soft constraints |
| IT-MEDIA | Photo/floorplan upload; reject invalid type |
| IT-SEARCH | Filter-only path; AI path with mocked Gemini success/fail |
| IT-LEADS-NOTES | Capture, list, patch stage, notes |
| IT-VISITS | Create visit_request |
| IT-FAV | Favorite toggle idempotency |
| IT-NTF | Create in-app; mark read |
| IT-BULK | Validate + import valid only |
| IT-CMS-METRICS | CMS read/write; metrics snapshot read |
| IT-AI-CFG | Save config; chat uses config (mocked model) |

### 5.5 Done Criteria (integration)

- [ ] All new/changed endpoints covered per §22.2
- [ ] Role matrix spot-checked for Admin vs Customer vs Guest
- [ ] CI green against test database

---

## 6. API Testing

### 6.1 Purpose

Contract and behavioral verification of `/api/v1` against OpenAPI: status codes, schemas, auth, rate limits, error envelope.

### 6.2 Scope

| Check | Requirement |
|-------|-------------|
| Contract | Response/request match `openapi.yaml` |
| AuthN | Missing/invalid token → 401 |
| AuthZ | Wrong role → 403 |
| Validation | Bad body → 400 with field errors |
| Pagination | List endpoints bounded; no unbounded dumps |
| Idempotency | Favorites toggle, logout |
| AI | Search/chat/loan error envelopes safe (no secrets) |
| Rate limit | Auth + AI endpoints return 429 when exceeded (staging/CI configurable) |

### 6.3 Approach

1. **Automated:** integration tests as primary; optional schemathesis/Dredd or OpenAPI validator in CI.
2. **Manual/exploratory:** Staging Postman/Insomnia collection derived from OpenAPI for QA.
3. **Negative:** SQL/XSS payloads in string fields rejected/sanitized; Gemini key never in response.

### 6.4 API Test Matrix (core)

| Area | Happy | 401 | 403 | 400 | Notes |
|------|-------|-----|-----|-----|-------|
| POST /auth/login | Y | — | — | Y | Lockout/rate limit |
| POST /auth/register | Y | — | — | Y | Duplicate email |
| Properties CRUD | Y | Y | Y | Y | Agent scope |
| POST /search | Y | optional | — | Y | Mock AI fail → structured error |
| POST /chat | Y | optional | — | Y | |
| POST /loan-analysis | Y | optional | — | Y | Fallback body |
| Leads / notes | Y | Y | Y | Y | |
| Visits | Y | Y | Y | Y | |
| Favorites | Y | Y | — | Y | |
| Notifications | Y | Y | Y | Y | |
| Bulk sessions | Y | Y | Y | Y | Admin only |
| AI config | Y | Y | Y | Y | Admin only |
| Metrics | Y | Y | Y | Y | |

### 6.5 Done Criteria (API)

- [ ] Collection/tests updated when OpenAPI changes
- [ ] No undocumented breaking changes without version note
- [ ] Error responses never leak stack traces or secrets in staging/prod mode

---

## 7. UI Testing

### 7.1 Purpose

Prove HTML fidelity, interactions, validation, and UI states for every in-scope screen.

### 7.2 Layers

| Layer | Tooling | Proves |
|-------|---------|--------|
| Component | React Testing Library | Loading/empty/error wiring, a11y roles |
| E2E journey | Playwright or Cypress | Auth, search, inquiry, admin property CRUD |
| Manual fidelity | Side-by-side HTML + screenshot | Pixel-perfect (Constitution) |
| Visual regression (encouraged) | Playwright screenshots / Percy optional | Catch drift |

### 7.3 Screen Matrix (MVP — none skipped)

| Screen | Automated focus | Manual fidelity |
|--------|-----------------|-----------------|
| SCR-HOME | Search submit, chips, featured links, chat open | Full page vs HTML |
| SCR-SEARCH-STD | Results, scores, filters, pagination | Full |
| SCR-SEARCH-FB | Fallback banner path (mock AI fail) | Full |
| SCR-SEARCH-EMPTY | Zero results path | Full |
| SCR-PROP-D | Gallery, CTAs, map mount | Full |
| SCR-CUS-DASH | Saves, requirements, inquiries | Full |
| SCR-LEAD-D | Notes, stage, schedule (MVP subset) | Full; no timeline/reminder product |
| SCR-PROP-EDIT | Draft/Publish, amenities | Full; no video/tour |
| SCR-PROP-INV | Filters, bulk, export | Full |
| SCR-BULK | Summary + error table | Full |
| SCR-AI-CFG | Save + preview | Full |
| SCR-CMD | KPIs, charts, date range | Full |
| Auth login/register | Form validation | Per prototype |
| SCR-LEAD-KANBAN | **Absence test only** | Must not be in MVP nav |

### 7.4 UI State Checklist (every screen)

- [ ] Default / populated
- [ ] Loading
- [ ] Empty
- [ ] Error / inline validation / toast
- [ ] Hover / active / focus
- [ ] No console errors
- [ ] No broken images/icons

### 7.5 Done Criteria (UI)

- [ ] UI Implementation Guide checklists for touched screens
- [ ] Constitution §15 UI/UX items
- [ ] E2E critical paths green in CI or staging nightly

---

## 8. Responsive Testing

### 8.1 Purpose

Verify layouts match HTML responsive behavior across viewports (Constitution Screen Completion + NFR-U-002).

### 8.2 Breakpoints (minimum)

| Name | Width | Required |
|------|-------|----------|
| Mobile | 375px | Yes |
| Tablet | 768px | Yes |
| Desktop | 1280px | Yes |
| Wide (optional) | 1440px+ | Spot-check marketing/admin |

### 8.3 Method

1. DevTools device mode + real device spot-check (iOS/Android browser) on staging for homepage, search, property detail, admin inventory.
2. E2E project viewports for smoke on critical routes.
3. Compare against HTML at same width (reference HTML is SOT for stacking/overflow).

### 8.4 Responsive Checklist

- [ ] No horizontal scroll on primary routes (unless HTML has it)
- [ ] Nav/header usable on mobile
- [ ] Tables/inventory: horizontal strategy matches HTML (scroll/cards)
- [ ] Map/gallery usable on mobile
- [ ] Modals (schedule, loan, add lead) fit viewport
- [ ] Touch targets adequate on primary CTAs

### 8.5 Done Criteria

- [ ] Each completed screen: mobile/tablet/desktop verified and recorded
- [ ] Sprint 13 full responsive sweep for MVP RC

---

## 9. Accessibility Testing

### 9.1 Purpose

Meet Constitution accessibility baseline: labels, keyboard focus, alt text, contrast from design tokens (NFR-U-003). Not a full WCAG audit unless PO expands scope—baseline is mandatory.

### 9.2 Baseline Requirements

| Area | Rule |
|------|------|
| Images | Meaningful `alt`; decorative empty alt where appropriate |
| Forms | Label associated with control; errors announced |
| Keyboard | Tab order logical; focus visible; modals trap focus |
| Contrast | Use DESIGN.md tokens; do not invent low-contrast colors |
| Semantics | Buttons vs links correct; headings hierarchical where HTML provides |
| Chat/search | Input accessible name; loading status not keyboard-trapping forever |

### 9.3 Method

1. **Automated:** axe-core / eslint-plugin-jsx-a11y in CI on key pages (non-blocking warnings tracked; blockers for missing labels on primary forms).
2. **Manual:** Keyboard-only pass on auth, search, property detail CTAs, lead detail notes, admin publish.
3. **Screen reader spot-check (staging RC):** VoiceOver or NVDA on homepage search + login.

### 9.4 A11y Test Cases

| ID | Case |
|----|------|
| A11Y-01 | Login fields labeled; errors readable |
| A11Y-02 | Search input + submit keyboard operable |
| A11Y-03 | Property detail primary CTA reachable by keyboard |
| A11Y-04 | Modal Esc/close returns focus |
| A11Y-05 | Inventory table headers / row actions operable |
| A11Y-06 | Notification bell button named |

### 9.5 Done Criteria

- [ ] Baseline checklist signed for each completed MVP screen
- [ ] No critical axe violations on primary routes for RC (or waived with fix ticket)

---

## 10. Security Testing

### 10.1 Purpose

Validate Constitution security NFRs: auth, AuthZ, validation, secrets, OWASP basics, rate limits (NFR-S-*).

### 10.2 Mandatory Checks

| ID | Check | Method |
|----|-------|--------|
| SEC-01 | Passwords hashed; not returned in API | Integration + code review |
| SEC-02 | JWT invalid/expired rejected | API tests |
| SEC-03 | Role cannot escalate via body (`role: Admin`) | Integration |
| SEC-04 | Customer cannot access Admin APIs/routes | API + UI |
| SEC-05 | Agent data scoping on properties/leads | Integration |
| SEC-06 | Gemini API key absent from FE bundle & responses | Build grep + API |
| SEC-07 | XSS: script in property title/notes rendered safe | UI + API |
| SEC-08 | Injection: malicious strings in search/filters | API |
| SEC-09 | CSRF strategy for cookie auth (if cookies used) | Design review + test |
| SEC-10 | Rate limit auth + AI | Staging |
| SEC-11 | Upload: reject non-image / oversized file | Integration |
| SEC-12 | Bulk upload: no path traversal on filenames | Integration |
| SEC-13 | HTTPS assumed on deploy; secure cookies flags in prod | Deploy checklist |
| SEC-14 | No Out-of-MVP channels exposing PII via SMS/etc. | Absence |

### 10.3 AI Security

- [ ] Prompts cannot exfiltrate secrets
- [ ] Chat does not invent inventory not returned by APIs (spot-check)
- [ ] Admin AI config changes require Admin role

### 10.4 Done Criteria

- [ ] SEC-01–14 signed for MVP RC
- [ ] No open S1 security defects

---

## 11. Regression Testing

### 11.1 Purpose

Prevent breakage of previously Done features when new sprints merge.

### 11.2 Packs

| Pack | Trigger | Contents |
|------|---------|----------|
| Smoke | Every deploy / PR to main | Auth login, health, property detail open, admin login |
| Core regression | Nightly staging + pre-release | Smoke + AI search happy/fallback, lead capture, favorites, publish listing |
| Full regression | MVP RC / major releases | All MVP SCR-* fidelity spot-check + API matrix + a11y baseline + Out-of-MVP absence |
| AI regression | Any Gemini/prompt/config change | Search scores path, chat greeting, loan fallback, config preview |
| Role regression | AuthZ changes | Guest/Customer/Agent/Admin/Super Admin matrix |

### 11.3 Automation Priority

Automate smoke + core first; full fidelity remains heavily manual until visual regression tooling is adopted.

### 11.4 Done Criteria

- [ ] Core pack green before sprint close if auth/search/property/CRM touched
- [ ] Full pack green for Sprint 13 / MVP RC

---

## 12. Acceptance Testing

### 12.1 Purpose

PO/stakeholder confirmation that MVP outcomes and FR acceptance criteria are met (PRD §23, SRS AC, Feature AC).

### 12.2 Participants

PO, QA lead, Tech lead; optional Agent/Admin persona walkthrough.

### 12.3 Acceptance Suites

| Suite | Outcome |
|-------|---------|
| UAT-GUEST | Browse home → search → detail → inquire (or register) |
| UAT-CUSTOMER | Register/login → favorite → dashboard → schedule → notifications |
| UAT-AGENT | Login → inventory → edit/publish → lead list/detail → notes/stage → schedule |
| UAT-ADMIN | Users/agents → CMS → AI config → notification rules → bulk → command center → reports |
| UAT-AI | NL search with scores; forced failure→fallback; chat; loan fallback; config preview |
| UAT-NEG | No Kanban; no SMS/push; no video/tour upload; no timeline/reminder product |

### 12.4 Acceptance Evidence

- Checklist signed with date/build SHA
- Screenshot pack vs `screen.png` for each SCR-*
- Known issues list with severity + waiver

### 12.5 Done Criteria

- [ ] All UAT suites pass or waived in writing
- [ ] PO accepts MVP RC
- [ ] Constitution release smoke complete

---

## 13. Complete Test Plan

### 13.1 Schedule Alignment (Sprint Plan)

| Sprint | Test focus | Primary suites |
|--------|------------|----------------|
| 0 | Scaffold CI, health | UT smoke, IT health |
| 1 | Auth | UT-AUTH, IT-AUTH, UI login, SEC-01–04 |
| 2 | Users/agents | IT-USERS-AGENTS, role UI |
| 3 | Inventory/editor/media | IT-PROP, IT-MEDIA, SCR-PROP-INV/EDIT UI |
| 4 | Detail + map + CTAs | SCR-PROP-D UI, map, API inquire |
| 5 | AI search | IT-SEARCH, SCR-SEARCH-*, AI fallback |
| 6 | Homepage | SCR-HOME UI, responsive |
| 7 | CRM + visits | IT-LEADS, IT-VISITS, SCR-LEAD-D MVP |
| 8 | Favorites + customer | IT-FAV, SCR-CUS-DASH |
| 9 | Chat/loan/config | AI suites, SCR-AI-CFG |
| 10 | Notifications + CMS | IT-NTF, email staging, CMS |
| 11 | Bulk | IT-BULK, SCR-BULK |
| 12 | Command center | SCR-CMD, metrics API |
| 13 | Harden + RC | Full regression, a11y, security, UAT, absence |

### 13.2 Master Test Case Catalog (MVP)

IDs align with SRS Appendix H style; expand per FR as features enter Ready.

#### Auth & Users

| TC ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-AUTH-001 | Register with valid email/password | API+UI | P0 |
| TC-AUTH-002 | Login issues tokens; logout revokes | API+UI | P0 |
| TC-AUTH-003 | Protected route redirects Guest | UI | P0 |
| TC-AUTH-004 | Role enforcement server-side | API | P0 |
| TC-AUTH-005 | Admin manages users | API+UI | P1 |
| TC-AUTH-006 | Admin manages agents | API+UI | P1 |
| TC-AUTH-007 | Homepage Sign In / Join CTAs | UI | P1 |
| TC-AUTH-N01 | Invalid login credentials | API+UI | P0 |
| TC-AUTH-N02 | Customer denied Admin API | API | P0 |

#### Search

| TC ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-SEARCH-001 | NL search returns scores/reasons | API+UI | P0 |
| TC-SEARCH-002 | Loading state shown | UI | P0 |
| TC-SEARCH-003 | Filters type/price/beds/amenities | UI+API | P0 |
| TC-SEARCH-004 | Clear/reset filters | UI | P1 |
| TC-SEARCH-005 | Grid/list + pagination | UI | P1 |
| TC-SEARCH-006 | Favorite from results | UI | P1 |
| TC-SEARCH-007 | AI fail → fallback banner + filter results | UI+API | P0 |
| TC-SEARCH-008 | Empty state guidance + chips | UI | P0 |
| TC-SEARCH-009 | Rate limit / timeout handling | API | P1 |

#### Property public & admin

| TC ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-PROP-D-001 | Detail loads sections per HTML | UI | P0 |
| TC-PROP-D-002 | Gallery + floorplan | UI | P0 |
| TC-PROP-D-003 | Leaflet map + landmarks | UI | P1 |
| TC-PROP-D-004 | Inquire / contact / schedule / favorite | UI+API | P0 |
| TC-PROP-D-005 | Similar properties | UI | P2 |
| TC-PROP-M-001 | Create draft + publish | API+UI | P0 |
| TC-PROP-M-002 | Amenities + custom | UI | P1 |
| TC-PROP-M-003 | Photo + floorplan upload | API+UI | P1 |
| TC-PROP-M-004 | Inventory search/filter/sort/page | UI | P0 |
| TC-PROP-M-005 | Row + bulk actions + CSV export | UI+API | P1 |
| TC-PROP-M-006 | Video/virtual tour controls absent | UI neg | P0 |
| TC-BULK-001 | Validate summary + error table | UI+API | P1 |
| TC-BULK-002 | Import valid only + error CSV | API+UI | P1 |

#### CRM / visits / customer

| TC ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-CRM-001 | Lead capture from public/detail | API+UI | P0 |
| TC-CRM-002 | Lead list + add lead | UI+API | P0 |
| TC-CRM-003 | Lead detail notes + stage | UI+API | P0 |
| TC-CRM-004 | Schedule visit modal | UI+API | P1 |
| TC-CRM-005 | Call/email actions present | UI | P2 |
| TC-CRM-N01 | Kanban not in MVP nav | UI neg | P0 |
| TC-CRM-N02 | Timeline/reminder product not shipped | UI neg | P0 |
| TC-CUS-001 | Dashboard stats + saved grid | UI | P1 |
| TC-CUS-002 | Requirement profile edit | UI+API | P1 |
| TC-CUS-003 | Inquiry history list | UI | P1 |
| TC-FAV-001 | Favorite/unfavorite persist | API+UI | P1 |
| TC-FAV-002 | Guest favorite prompts login | UI | P1 |

#### AI / notifications / CMS / admin

| TC ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-AI-001 | Chat send/receive + greeting | UI+API | P0 |
| TC-AI-002 | Loan analysis + formula fallback | UI+API | P1 |
| TC-AI-003 | AI config save + preview | UI+API | P1 |
| TC-AI-004 | No non-Gemini provider option | UI neg | P0 |
| TC-AI-005 | Key not in client | SEC | P0 |
| TC-NTF-001 | In-app unread + mark read | UI+API | P1 |
| TC-NTF-002 | Email on new lead when rule on | Staging | P1 |
| TC-NTF-003 | SMS/WhatsApp/Push absent | UI neg | P0 |
| TC-CMS-001 | Admin edit + public consume | API+UI | P2 |
| TC-ADM-001 | Command center KPIs/charts/feed | UI | P1 |
| TC-ADM-002 | Date range updates data | UI | P1 |
| TC-ADM-003 | Reports view | UI | P2 |
| TC-ADM-N01 | Tasks view not required MVP | Scope | P2 |

#### Cross-cutting

| TC ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-UX-001 | Loading/empty/error per screen | UI | P0 |
| TC-UX-002 | Responsive 375/768/1280 | UI | P0 |
| TC-A11Y-001 | Baseline keyboard + labels | A11y | P1 |
| TC-SEC-* | See §10 | Security | P0 |
| TC-HEALTH-001 | Health endpoint OK | API | P0 |
| TC-REG-SMOKE | Deploy smoke pack | E2E | P0 |
| TC-UAT-* | Acceptance suites §12 | UAT | P0 |

### 13.3 Critical E2E Journeys (automate)

1. **J-AUTH** — Register → logout → login → access customer route  
2. **J-SEARCH** — Home chip/query → STD results → open detail  
3. **J-FALLBACK** — Force AI error → FB UI → reset/refine  
4. **J-INQUIRE** — Detail inquire → lead visible to Agent  
5. **J-PUBLISH** — Agent create draft → upload photo → publish → appears public  
6. **J-FAV** — Customer favorite → appears on dashboard  
7. **J-ADMIN** — Admin login → AI config save → command center loads  

### 13.4 Test Data

| Set | Contents |
|-----|----------|
| Seed roles | Super Admin, Admin, Agent, Customer, Guest paths |
| Seed properties | ≥8 published with images, amenities, landmarks; mix of types/prices |
| Seed leads | Multiple stages/sources |
| Bulk CSV | Valid file + file with known row errors |
| AI fixtures | Mock Gemini success JSON; timeout error; malformed |

**PII:** staging data anonymized; no production dumps in local/CI.

### 13.5 Tools (recommended)

| Need | Tool |
|------|------|
| Unit | Vitest/Jest |
| Integration/API | Supertest + PostgreSQL test DB |
| Component | React Testing Library |
| E2E | Playwright (preferred) or Cypress |
| A11y | axe-core |
| API exploration | OpenAPI → Postman |
| Email | Mailhog/Ethereal in non-prod |
| Visual (optional) | Playwright screenshots |

### 13.6 CI Pipeline Gates

```
PR opened
  → lint (no warnings on touched completed screens)
  → typecheck
  → unit tests
  → integration tests (test DB)
  → (optional) Playwright smoke
  → build frontend/backend
Merge / main
  → full unit + integration
  → deploy staging
  → smoke E2E
Release
  → full regression + UAT sign-off
```

### 13.7 Reporting

| Report | Cadence |
|--------|---------|
| CI status | Every PR |
| Sprint test summary | Sprint review (pass/fail/waive counts) |
| Defect burn-down | Weekly |
| MVP RC test report | Once: coverage, fidelity, security, UAT, known issues |

### 13.8 Risks & Mitigations (Testing)

| Risk | Mitigation |
|------|------------|
| Flaky Gemini E2E | Mock in CI; sandbox only on staging RC |
| Pixel debates | HTML + screen.png sole arbiter |
| Under-tested AuthZ | Mandatory 403 cases per admin endpoint |
| Visual debt late | Fidelity required per sprint DoD, not only Sprint 13 |
| False confidence from mocks | DoD bans remaining mocks for completed features |

---

## 14. Mapping to Constitution Artifacts

| Constitution | This strategy |
|--------------|---------------|
| §14 Definition of Done | Feature/sprint/RC exit |
| §15 QA Checklist | UI + Functional + API + AI sections |
| §22 Testing Standards | Unit/Integration/UI/E2E + gates |
| §7 Screen Completion | UI + responsive + states |
| §24 Release smoke | TC-REG-SMOKE / deploy |
| Out-of-MVP rules | Negative TCs + UAT-NEG |

---

## 15. Related Documents

| Doc | Use |
|-----|-----|
| `00_PROJECT_CONSTITUTION.md` | Gates, DoD, testing standards |
| `07_UI_IMPLEMENTATION_GUIDE.md` | Per-screen checklists |
| `08_EPICS_AND_FEATURES.md` | Feature AC |
| `09_SPRINT_PLAN.md` | When to execute suites |
| `openapi.yaml` | API contract tests |
| SRS Appendix H | FR-level TC traceability |

---

## 16. Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Initial complete test strategy & plan for MVP |

---

**End of Test Strategy**
