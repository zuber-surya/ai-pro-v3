# PropVista CRM / Property AI Studio — Project Handover Guide

| Field | Value |
|-------|--------|
| **Document** | `20_PROJECT_HANDOVER_GUIDE.md` |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **Type** | Enterprise operations & onboarding manual |
| **Audience** | Incoming engineering, QA, DevOps, and product owners |
| **Goal** | Enable a new team to take full ownership **without additional explanation** |

---

## Document control

| Item | Value |
|------|--------|
| Product name (engineering) | Property AI Studio |
| Product name (UI brand) | PropVista CRM |
| Governing charter | `docs/00_PROJECT_CONSTITUTION.md` |
| Functional SOT | `docs/REQUIREMENTS_AND_PROPOSAL.md` |
| UI SOT | `docs/design_reference/**` (HTML wins) |
| API SOT | `docs/openapi.yaml` |
| Handover owner (outgoing) | Open — assign at operational handover (not blocking docs freeze) |
| Handover owner (incoming) | Open — assign at operational handover (not blocking docs freeze) |
| Handover date | Open — assign at operational handover (not blocking docs freeze) |

**Conflict resolution order:** Constitution → design_reference HTML → Requirements → PRD/SRS → Architecture/DB/OpenAPI → implementation guides.

**Docs freeze open items (explicit):** Named people for Product Owner, Tech Lead, QA Lead, Release Manager, DevOps, Security, Gemini billing, Email admin, DBA remain unassigned in § contacts until staffing is known. Demo credentials stay in a private runbook (not git). Repo/GitHub/CI/`CLAUDE.md` deferred until Q2 choice (2A/2B/2C).

---

## 1. Project Overview

Property AI Studio is an AI-powered real estate platform for property discovery, listing management, CRM (leads), customer portal, admin analytics, CMS, and Gemini-backed assistants.

**Differentiation:** Google Gemini natural-language property search (with scores/reasons), conversational chat, loan analysis, and admin-configurable AI behavior—with **filter fallback** when AI fails (never a blank dead-end).

**MVP delivery shape:**

| Layer | Implementation |
|-------|----------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind → **Vercel** |
| Backend | Node.js, Express, TypeScript, Prisma → PostgreSQL |
| AI | **Gemini only** (server-side keys) |
| Maps | Leaflet + OpenStreetMap |
| Auth | Email + password; JWT access + refresh |
| Notifications | Email + in-app only |
| Org model | **Single organization**; five roles; no module permissions |

**Explicitly out of MVP:** Kanban pipeline, activity timeline product, reminders/automation, virtual tours, video upload, SMS, WhatsApp, push, alternate LLMs, multi-tenant orgs.

---

## 2. Business Context

### Problem

Agents and admins juggle fragmented tools for listings, leads, and reporting. Buyers face rigid filters that do not match how people describe homes.

### Solution

One web product: AI search + CRM + inventory + customer portal + admin command center, with HTML-faithful PropVista CRM UX.

### Success (MVP)

- Guests/customers discover properties via NLP search and filters  
- Agents/admins manage properties, leads, users/agents, CMS, reports, AI config  
- Fidelity to `design_reference`; security and performance gates met  
- No Out-of-MVP scope creep  

### Stakeholders (roles)

| Role | Interest |
|------|----------|
| Product Owner | Scope, MVP honesty, acceptance |
| Engineering | Delivery per Constitution lifecycle |
| QA | Fidelity, regression, release gates |
| Ops | Deploy, secrets, backups, monitoring |
| End users | Guest, Customer, Agent, Admin, Super Admin |

### Personas (summary)

See PRD §6: Guest seeker, registered buyer, sales agent, operations admin, super admin.

---

## 3. Architecture Overview

### 3.1 Context

```text
Browser → Vercel (Next.js) → Express /api/v1 → PostgreSQL
                              ↓
                         Gemini · Email · Local/Object storage
Browser → OSM tiles (Leaflet)
```

Full diagrams: `docs/03_SYSTEM_ARCHITECTURE_DOCUMENT.md`.

### 3.2 Clean Architecture

| Layer | Owns |
|-------|------|
| UI components | Presentation only |
| Feature hooks | Orchestration; call `lib/api` |
| Express routes | HTTP + validation; call services |
| Services | Business rules + AuthZ |
| Repositories | Prisma persistence |
| Integrations | Gemini, email, storage |

**Forbidden:** Business rules in React; ad-hoc `fetch` in components; Prisma in UI; Gemini keys in the browser.

### 3.3 Feature-based frontend

Features under `frontend/src/features/{auth,properties,search,leads,admin,ai,customer,cms,notifications}`.

### 3.4 Search state machine

One route `/search` with variants matching three HTML references:

- Standard (AI success)  
- Fallback (AI fail → filter results + banner)  
- Empty (zero results)  

---

## 4. Technology Stack

| Area | Mandatory technology |
|------|----------------------|
| FE framework | Next.js 15 (App Router) |
| UI | React 19 |
| Language | TypeScript (strict) |
| CSS | Tailwind CSS + `DESIGN.md` tokens |
| Maps | Leaflet + OSM |
| FE host | Vercel |
| BE runtime | Node.js |
| BE framework | Express.js |
| ORM | Prisma |
| DB | PostgreSQL |
| AI | Google Gemini (`@google/genai` or official SDK) **only** |
| Auth | Email/password, JWT access + refresh |
| Notifications | Email + in-app |
| Dev media | Local filesystem |
| Tests | Unit (Vitest/Jest), integration (Supertest + test DB), E2E (Playwright recommended) |

**Non-binding historical mentions** (FastAPI, Alembic, Vite-only, etc.) in older notes must **not** be followed—Constitution §5 wins.

---

## 5. Folder Structure

### 5.1 Repository (logical)

```text
/
  docs/                          # All SOTs, guides, design_reference
    design_reference/            # UI SOT (read-only for implementers)
  frontend/                      # Next.js 15 application
  backend/                       # Express + Prisma
```

Exact monorepo tooling may vary; feature boundaries must remain clear.

### 5.2 Frontend (target)

```text
frontend/src/
  app/                 # App Router routes (thin)
  features/            # Domain UI + hooks
  components/          # Shared primitives
  hooks/               # Shared hooks
  lib/api/             # Centralized API client
  lib/auth/
  lib/mappers/
  types/
  styles/
```

### 5.3 Backend (target)

```text
backend/src/
  routes/
  middleware/          # auth, validate, rateLimit, errorHandler
  services/
  repositories/
  validators/
  integrations/gemini|email|storage/
  prisma/
  types/
  utils/
```

### 5.4 Design reference

`docs/design_reference/<screen>/code.html` + `screen.png` — **do not “fix” HTML to match bad code.**

---

## 6. Environment Setup

### 6.1 Prerequisites

| Tool | Notes |
|------|-------|
| Node.js | LTS compatible with Next 15 / Express (document exact version in README when pinned) |
| npm/pnpm/yarn | Match lockfile in repo |
| PostgreSQL | Local 14+ recommended |
| Git | Required |
| Gemini API key | Server-only; never commit |
| Optional | Docker for Postgres; Mailhog/Ethereal for email |

### 6.2 Environment variables (typical)

| Variable | Service | Secret | Purpose |
|----------|---------|--------|---------|
| `DATABASE_URL` | backend | Yes | PostgreSQL connection |
| `DATABASE_URL_TEST` | backend CI | Yes | Test DB |
| `JWT_ACCESS_SECRET` | backend | Yes | Access tokens |
| `JWT_REFRESH_SECRET` | backend | Yes | Refresh tokens |
| `GEMINI_API_KEY` | backend | Yes | AI provider |
| `EMAIL_*` | backend | Yes | Transactional email |
| `PORT` | backend | No | API port (e.g. 4001) |
| `CORS_ORIGIN` | backend | No | FE origin(s) |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | No | API base (`…/api/v1`) |
| Storage paths | backend | No | Local media root (dev) |

Maintain a private `.env.example` in each app **without real secrets**. Production secrets live in the host secret manager (Vercel / server vault)—never in git.

### 6.3 Access required for incoming team

- GitHub repo (admin for leads)  
- Vercel project  
- Production/staging DB + backup access  
- Gemini project/billing  
- Email provider  
- Staging/prod URLs  
- Docs drive / issue tracker  

---

## 7. Local Development

### 7.1 Clone & install

```bash
git clone <REPO_URL>
cd ai-prop-v3
# Install frontend + backend deps per package manifests
cd frontend && npm install
cd ../backend && npm install
```

### 7.2 Run (typical)

```bash
# Terminal 1 — database up
# Terminal 2 — backend
cd backend && npm run dev

# Terminal 3 — frontend
cd frontend && npm run dev
```

Default local URLs (confirm in README when published):

| App | URL |
|-----|-----|
| Frontend | `http://localhost:3001` |
| API | `http://localhost:4001/api/v1` |
| Health | `GET /api/v1/health` |

### 7.3 Dev rules

1. Open relevant `design_reference` HTML before UI work.  
2. Follow Epic → Feature → Design → DB → API → FE → Real API → Test → UI Verification → Merge.  
3. All HTTP via `lib/api`.  
4. Do not implement Out-of-MVP screens in MVP branches.

---

## 8. Database Setup

| Item | Detail |
|------|--------|
| Engine | PostgreSQL |
| ORM | Prisma |
| Design SOT | `docs/04_DATABASE_DESIGN_DOCUMENT.md` |
| Naming | `snake_case` tables/columns; Prisma models `PascalCase` |

**Core domains (MVP):** users, refresh_tokens, agents, properties (+ amenities, landmarks, images), favorites, customer_profiles, leads, lead_notes, visit_requests, notifications, notification_rules, cms_pages, ai_configs, property_view_events, metrics snapshots, bulk upload sessions/errors, saved_searches.

Create empty DB:

```bash
createdb propvista_dev
# set DATABASE_URL=postgresql://USER:PASS@localhost:5432/propvista_dev
```

---

## 9. Running Migrations

```bash
cd backend
npx prisma migrate dev          # local
npx prisma migrate deploy       # staging/prod
npx prisma generate
```

**Rules (Constitution):**

- Every schema change = migration  
- Apply migrations **before** serving code that needs the new schema  
- Prefer forward-fix over untested down migrations in production  
- Record migration logs in release packets  

---

## 10. Seeding Data

Purpose: local/staging demos and QA fidelity (enough listings for search/detail/maps).

```bash
cd backend
npx prisma db seed              # if seed script configured
# or: npm run seed
```

**Minimum seed content:**

- Super Admin, Admin, Agent, Customer users  
- Agents with profiles  
- ≥8 published properties with images/amenities/landmarks  
- Sample leads across stages  
- AI config defaults (greeting)  
- Optional CMS homepage blocks  

Document passwords **only** in a private ops vault—not in this public guide’s committed copy if the repo is shared broadly. Use a private `SEEDS.md` or password manager entry for the incoming team.

---

## 11. API Overview

| Item | Value |
|------|--------|
| Base path | `/api/v1` |
| Spec | `docs/openapi.yaml` (~55 paths / ~77 operations) |
| Index | `docs/05_API_SPECIFICATION.md` |
| Auth | Bearer JWT |
| Errors | `{ "error": { "code", "message", "details" } }` |
| Lists | Paginated `meta` |
| Prices | Decimal strings |
| Checklist | `docs/17_API_CHECKLIST.md` |

### Major tags

Health, Auth, Users, Agents, Properties (+ media, bulk, export), Search/AI, Favorites, Customer, Leads/Notes, Visits, Notifications/Rules, CMS, Metrics, AI Config.

### Verification

Complete **Definition of API Complete** in `17_API_CHECKLIST.md` before calling an endpoint Done.

---

## 12. Frontend Overview

| Item | Value |
|------|--------|
| Brand UI | PropVista CRM |
| Routes | See `07_UI_IMPLEMENTATION_GUIDE.md` §4 |
| Fidelity | Pixel Perfect manual mandatory |
| State | Discriminated unions: idle/loading/success/empty/error |
| Maps | Lazy-load Leaflet on property detail |
| Deploy | Vercel |

### MVP screens (must ship)

SCR-HOME, SCR-SEARCH-STD/FB/EMPTY, SCR-PROP-D, SCR-CUS-DASH, SCR-LEAD-D (MVP subset), SCR-PROP-EDIT, SCR-PROP-INV, SCR-BULK, SCR-AI-CFG, SCR-CMD — plus auth surfaces.

### Do not ship in MVP nav

SCR-LEAD-KANBAN (reference only).

### Guides

- `07_UI_IMPLEMENTATION_GUIDE.md` — per-screen build checklist  
- `16_UI_PIXEL_PERFECT_CHECKLIST.md` — verification & sign-off  

---

## 13. AI Integration

| Feature | Behavior |
|---------|----------|
| AI Search | NL → ranked properties + scores/reasons; timeout → **filter fallback** + banner |
| AI Chat | Conversational widget; greeting from `ai_configs` |
| Loan Analysis | Gemini + **formula fallback** on failure |
| Admin config | FAQ, escalation/hours, tone/prompt, preview (`SCR-AI-CFG`) |

**Rules:**

- Gemini **only**—no OpenAI/Anthropic fallback  
- Keys only on server  
- Rate-limit AI endpoints  
- Mock Gemini in CI; sandbox check on release candidates  
- Never invent inventory not returned by APIs  

Architecture details: `03_SYSTEM_ARCHITECTURE_DOCUMENT.md` (Gemini adapter section).

---

## 14. Authentication

| Concern | Policy |
|---------|--------|
| Method | Email + password |
| Tokens | Access + refresh; refresh persisted/revocable |
| Logout | Revokes refresh |
| Storage | Prefer httpOnly cookies when architecture allows; else secure strategy per SRS |
| Password | Hashed (bcrypt/argon2); never in API responses |
| Client | Central API client attaches auth; handles 401 refresh |

Endpoints: register, token/login, refresh, logout, me — see OpenAPI Auth tag.

---

## 15. User Roles

| Role | Access summary |
|------|----------------|
| Guest | Public browse, search, register, lead capture |
| Customer | Favorites, dashboard, inquiries, chat, loan, schedule |
| Agent | Own/assigned properties & leads, tours as scoped |
| Admin | Org ops: users, agents, CMS, reports, AI config, bulk, notifications rules |
| Super Admin | Full system controls as Requirements specify |

**No module-level permission matrix.** Capability = role only. Server enforces AuthZ on every protected route (UI hiding is not security).

---

## 16. Deployment Process

| Component | Target |
|-----------|--------|
| Frontend | **Vercel** |
| Backend | Node/Express process + PostgreSQL (host per ops choice) |
| Secrets | Platform secret stores |

### Recommended order

1. Pre-deploy backup  
2. `prisma migrate deploy`  
3. Deploy backend  
4. Deploy frontend  
5. Smoke tests  
6. Soak / post-deploy verification  

Full gate list: `docs/18_RELEASE_CHECKLIST.md`.

### Environments

| Env | Purpose |
|-----|---------|
| Local | Dev + local storage + local Postgres |
| Staging | Pre-prod; real Gemini with limits |
| Production | Live |

---

## 17. CI/CD Process

### Target pipeline (implement if not yet fully wired)

```text
PR → lint → typecheck → unit → integration (test DB) → build
main/release → deploy staging → smoke
tag vX.Y.Z → production per Release Checklist
```

### Merge requirements

- CI green  
- Code review (+ QA for user-facing)  
- Constitution DoD  
- No permanent mocks for completed features  
- UI evidence for screen changes  

Branching: `main`, `feature/<epic>-<short>`, `fix/...`, `chore/...` — Constitution §11.

---

## 18. Testing Strategy

SOT: `docs/11_TEST_STRATEGY.md`.

| Level | Focus |
|-------|-------|
| Unit | Services, validators, mappers; &gt;80% core logic |
| Integration | API + DB; happy + 401/403 + validation |
| UI / E2E | Critical journeys; HTML fidelity manual |
| AI | Mocked in CI; sandbox on RC |
| Release | Smoke + core/full regression + UAT |

Bugs: `docs/19_BUG_TRACKING_GUIDE.md` (S1–S4, triage, blockers).

---

## 19. Coding Standards

SOT: `docs/14_CODING_STANDARDS.md` + Constitution §6.

Highlights:

- SOLID, DRY, KISS, YAGNI  
- Strict TypeScript; no business logic in UI  
- Naming conventions for FE/BE/DB/API  
- Error envelope; structured logging  
- Pre-commit checklist in Coding Standards §35  
- PR review: `docs/15_CODE_REVIEW_CHECKLIST.md`  

---

## 20. Git Workflow

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready; protected |
| `develop` | Optional integration |
| `feature/<epic>-<name>` | Feature work |
| `fix/<issue>-<name>` | Bugfixes |
| `chore/<name>` | Tooling |

### Commits & PRs

- Atomic; message explains **why**  
- Link Epic/Feature ID  
- UI PRs attach HTML/screenshot evidence  
- No secrets; no leftover mocks  
- Tags: `vMAJOR.MINOR.PATCH` on release SHA  

---

## 21. Documentation Index

| Document | Path | Use |
|----------|------|-----|
| Constitution | `docs/00_PROJECT_CONSTITUTION.md` | Binding engineering OS |
| Requirements | `docs/REQUIREMENTS_AND_PROPOSAL.md` | Functional SOT |
| PRD | `docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md` | Product requirements |
| SRS | `docs/02_SOFTWARE_REQUIREMENTS_SPECIFICATION.md` | Formal FRs |
| Architecture | `docs/03_SYSTEM_ARCHITECTURE_DOCUMENT.md` | System design |
| Database | `docs/04_DATABASE_DESIGN_DOCUMENT.md` | Schema / ER |
| API index | `docs/05_API_SPECIFICATION.md` | Ops by tag |
| Frontend Architecture | `docs/06_FRONTEND_ARCHITECTURE.md` | Next.js FE structure |
| UI Guide | `docs/07_UI_IMPLEMENTATION_GUIDE.md` | Screen build |
| Epics/Features | `docs/08_EPICS_AND_FEATURES.md` | Backlog |
| Sprint Plan | `docs/09_SPRINT_PLAN.md` | Sprint 0–13 |
| Task Breakdown | `docs/10_TASK_BREAKDOWN.md` | Developer tasks ≤1 day |
| Test Strategy | `docs/11_TEST_STRATEGY.md` | QA strategy |
| Deployment Guide | `docs/12_DEPLOYMENT_GUIDE.md` | Deploy ops |
| AI Development Rules | `docs/13_AI_DEVELOPMENT_RULES.md` | Gemini rules |
| Coding Standards | `docs/14_CODING_STANDARDS.md` | Code handbook |
| Code Review | `docs/15_CODE_REVIEW_CHECKLIST.md` | PR gates |
| Pixel Perfect | `docs/16_UI_PIXEL_PERFECT_CHECKLIST.md` | UI verification |
| API Checklist | `docs/17_API_CHECKLIST.md` | API Done |
| Release | `docs/18_RELEASE_CHECKLIST.md` | Prod release |
| Bugs | `docs/19_BUG_TRACKING_GUIDE.md` | Defect process |
| OpenAPI | `docs/openapi.yaml` | API contract |
| Design reference | `docs/design_reference/**` | UI SOT |
| **This guide** | `docs/20_PROJECT_HANDOVER_GUIDE.md` | Ownership transfer |
| Docs freeze gate | `docs/DOCS_FREEZE_GATE.md` | Approval + `docs-v1.0` tag checklist |

---

## 22. Troubleshooting Guide

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| FE cannot call API | CORS / wrong `NEXT_PUBLIC_API_BASE_URL` | Align origin + base path `/api/v1` |
| 401 loops | Refresh token revoked/misconfigured cookies | Check auth middleware + client refresh |
| 403 on Admin | Role wrong or missing server check | Verify JWT role claim + `requireRole` |
| Migrations fail | Drift / dirty DB | `prisma migrate status`; restore backup on prod |
| AI search blank | Missing fallback UI or unhandled error | Ensure FE maps AI error → SCR-SEARCH-FB |
| Gemini 429/5xx | Quota/timeout | Rate limits, timeouts, filter fallback |
| Images 404 | Local storage path / static serve | Check storage integration + URL mapping |
| Map blank | Leaflet SSR/import | Client-only lazy load |
| Emails not sending | Provider env | Verify `EMAIL_*`; use catcher in non-prod |
| Pixel QA fails | Redesign drift | Diff vs HTML/`screen.png`; fix app not HTML |
| “Kanban missing” ticket | Out-of-MVP | Close as not-a-bug; EPIC-F01 future |

Enable structured logs with `requestId` when diagnosing API issues.

---

## 23. Known Limitations

| Limitation | Notes |
|------------|-------|
| MVP exclusions | Kanban, timeline product, reminders, virtual tours/video, SMS/WhatsApp/push |
| Lead detail | Layout may retain Future UI chrome; backends for timeline/reminders not shipped |
| Dev media | Local filesystem only; prod storage must keep same URL contract |
| Single org | No multi-tenant architecture |
| Roles only | No fine-grained module ACL |
| Gemini only | No multi-provider abstraction |
| Caching | Response caching largely future (see API checklist) |
| Older docs | May mention FastAPI/Vite—ignore vs Constitution |

Track release-specific known issues per `19_BUG_TRACKING_GUIDE.md` + Release Notes.

---

## 24. Future Roadmap

From `08_EPICS_AND_FEATURES.md` EPIC-F*:

| Epic | Theme |
|------|-------|
| EPIC-F01 | Lead Kanban pipeline |
| EPIC-F02 | Activity timeline product |
| EPIC-F03 | Reminders & automation |
| EPIC-F04 | Virtual tours & video upload |
| EPIC-F05 | SMS / WhatsApp / Push |
| EPIC-F06 | Contacts / opportunity conversion |

Do **not** activate these in MVP sprints without Constitution amendment + PO approval.

MVP implementation order: Sprint Plan §2 (Sprint 0–13).

---

## 25. Maintenance Procedures

| Cadence | Activities |
|---------|------------|
| Daily | Triage S1/S2; CI health; staging smoke if deploying |
| Weekly | Dependency alerts; bug metrics; seed refresh if needed |
| Per sprint | Sprint DoD; fidelity gates; API Complete |
| Per release | Full `18_RELEASE_CHECKLIST.md` |
| Monthly | Access review; secret rotation check; backup restore drill |
| Quarterly | Disaster recovery tabletop; roadmap vs MVP honesty review |

### Dependency updates

- Prefer patch/minor with CI green  
- Major upgrades require Tech Design + regression pack  
- Never upgrade in a way that forces UI redesign  

### Schema changes

1. Update Prisma schema  
2. Migration  
3. OpenAPI if API shape changes  
4. Update `04_DATABASE_DESIGN_DOCUMENT.md` if structural  
5. Deploy migrate-before-app  

---

## 26. Backup & Recovery

| Asset | Practice |
|-------|----------|
| PostgreSQL | Automated backups; pre-release snapshot; test restore |
| Media | Backup prod object/local store per ops policy |
| Secrets | Vault export procedure for break-glass (controlled) |
| Git | Remote is SOT; tags for releases |

### Recovery outline

1. Declare incident; stop risky deploys  
2. Assess: app-only vs DB corruption  
3. App rollback: previous Vercel deploy + previous BE image/tag  
4. DB: restore snapshot **or** forward-fix migration  
5. Smoke + post-deploy verification  
6. RCA for S1 (`19_BUG_TRACKING_GUIDE.md`)  

Record backup IDs in each release packet.

---

## 27. Security Practices

| Practice | Requirement |
|----------|-------------|
| Auth | Email/password; hashed passwords; JWT hygiene |
| AuthZ | Server-side roles; default deny; IDOR checks |
| Secrets | Never in git or FE bundle; Gemini server-only |
| Input | Validate all writes |
| Rate limit | Auth + AI |
| Uploads | Type/size; no path traversal |
| Channels | No SMS/WhatsApp/push in MVP |
| Review | Security section of Code Review + Release checklists |
| OWASP | Injection, XSS, CSRF strategy for cookie auth |

Report security bugs via security bug template in Bug Tracking Guide; treat as S1 when exploitable.

---

## 28. Monitoring & Logging

| Signal | Expectation |
|--------|-------------|
| Health | `GET /api/v1/health` monitored |
| Logs | Structured; `requestId`; no secrets/tokens |
| AI | Latency + fallback rate observable |
| HTTP | 5xx / auth failure spikes watched around deploys |
| Uptime | Align with NFR targets in PRD/SRS |
| On-call | Named during release windows |

Wire concrete vendors (Datadog, CloudWatch, etc.) in ops runbooks when chosen—architecture requires hooks, not a specific SaaS brand.

---

## 29. Team Responsibilities

| Role | Owns |
|------|------|
| Product Owner | Scope, AC acceptance, waivers, MVP honesty |
| Tech Lead | Architecture compliance, severity arbitration, technical risk |
| Frontend engineers | HTML fidelity, hooks, `lib/api`, Vercel FE |
| Backend engineers | Services, Prisma, AuthZ, Gemini adapters, email |
| QA | Pixel Perfect, regression, bug verification, release QA sign-off |
| Release manager | Release Checklist, Go/No-Go, rollback coordination |
| DevOps / Ops | Envs, secrets, backups, monitoring, DB ops |
| Incoming team lead | Handover checklist completion, contact updates |

AI coding assistants must obey Constitution—same quality bar as humans.

---

## 30. Handover Checklist

Incoming team must complete before declaring ownership transferred.

### Access

- [ ] GitHub (code, Actions, packages)  
- [ ] Vercel  
- [ ] Staging + production servers/DB  
- [ ] Secret vault  
- [ ] Gemini project  
- [ ] Email provider  
- [ ] Domain/DNS (if applicable)  
- [ ] Issue tracker labels/boards  

### Knowledge

- [ ] Read Constitution end-to-end  
- [ ] Walk `design_reference` inventory  
- [ ] OpenAPI + API Checklist understood  
- [ ] Sprint Plan + Epics backlog understood  
- [ ] Pixel Perfect + Bug + Release processes understood  

### Runtime proof

- [ ] Local FE+BE boot  
- [ ] Migrations + seed succeed  
- [ ] Login as each role  
- [ ] AI search happy + forced fallback  
- [ ] Staging smoke Pass  
- [ ] Identify last production tag/SHA  

### Ops proof

- [ ] Backup restore drill scheduled or completed  
- [ ] Rollback steps rehearsed on paper  
- [ ] Monitoring dashboards accessible  
- [ ] Support contacts filled (§31)  

### Sign-off

| Party | Name | Date | Signature |
|-------|------|------|-----------|
| Outgoing tech lead | | | |
| Incoming tech lead | | | |
| Product Owner | | | |
| QA lead | | | |

**Ownership transferred:** ☐ Yes ☐ No  

---

## 31. Support Contacts (placeholder)

| Function | Name | Email | Phone / chat | Notes |
|----------|------|-------|--------------|-------|
| Product Owner | _TBD_ | | | |
| Tech Lead (incoming) | _TBD_ | | | |
| Tech Lead (outgoing / transition) | _TBD_ | | | |
| QA Lead | _TBD_ | | | |
| Release Manager | _TBD_ | | | |
| DevOps / On-call primary | _TBD_ | | | |
| DevOps / On-call secondary | _TBD_ | | | |
| Security contact | _TBD_ | | | |
| Gemini / cloud billing owner | _TBD_ | | | |
| Email provider admin | _TBD_ | | | |
| Database admin | _TBD_ | | | |
| Vendor support (hosting) | _TBD_ | | | |
| Escalation (engineering manager) | _TBD_ | | | |
| Escalation (business owner) | _TBD_ | | | |

**Incident channel:** _TBD (Slack/Teams)_  
**Status page:** _TBD_  

Update this table during handover day; keep a private copy if this repo is public.

---

## 32. Appendix

### A. Glossary

| Term | Meaning |
|------|---------|
| SOT | Source of truth |
| SCR-* | Screen ID from UI guides |
| DoD | Definition of Done |
| MVP | Minimum viable product scope per Constitution |
| Envelope | Standard API error JSON shape |
| Fallback | Non-AI filter search UI when Gemini fails |

### B. Critical user journeys (smoke)

1. Register/login  
2. Home → search → detail  
3. AI failure → fallback UI  
4. Inquire → lead visible to agent  
5. Agent publish listing  
6. Customer favorite → dashboard  
7. Admin AI config + command center  

### C. MVP screen → route map

| Screen | Route |
|--------|-------|
| SCR-HOME | `/` |
| SCR-SEARCH-* | `/search` |
| SCR-PROP-D | `/properties/[id]` |
| SCR-CUS-DASH | `/customer` |
| SCR-LEAD-D | `/admin/leads/[id]` |
| SCR-PROP-INV | `/properties` |
| SCR-PROP-EDIT | `/properties/[id]/edit` |
| SCR-BULK | `/properties/bulk` |
| SCR-AI-CFG | `/admin/ai-config` |
| SCR-CMD | `/admin` |
| SCR-CLIENTS | `/admin/leads` |
| SCR-REPORTS | `/admin/reports` |
| Full matrix | `docs/design_reference/design-references-catalog.md` |

### D. First-week onboarding plan

| Day | Activity |
|-----|----------|
| 1 | Access + Constitution + run local stack |
| 2 | Seed data + role walkthrough + OpenAPI |
| 3 | Implement tiny chore PR using Code Review checklist |
| 4 | Pair on one UI screen fidelity review |
| 5 | Staging smoke + bug triage shadow + fill §31 contacts |

### E. Decision log reminder

Material stack or scope changes require **Constitution amendment** + PO approval—not silent PR decisions.

### F. Revision history

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Initial enterprise Project Handover Guide |

---

**End of Project Handover Guide**

*A team that has completed §30 Handover Checklist and filled §31 contacts is cleared for independent ownership.*
