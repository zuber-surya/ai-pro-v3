# PropVista CRM / Property AI Studio — Requirements Documentation

| Field | Value |
|-------|--------|
| **Document** | Team-facing Requirements Overview |
| **Version** | 1.0.0 |
| **Date** | 2026-08-05 |
| **Audience** | Engineering, QA, Product, Ops, partners |
| **Status** | MVP feature-complete (RC hardening) |
| **Product names** | Engineering: **Property AI Studio** · UI brand: **PropVista CRM** |

---

## 1. Purpose of this document

Share a single, readable overview of **what the product is**, **what is in/out of MVP**, **modules**, **tech stack**, **roles**, and **where deeper specs live**.

This is a **summary for onboarding and collaboration**. Authoritative detail remains in the frozen/source docs listed in §12.

---

## 2. Project overview

### 2.1 What it is

An **AI-powered real estate web platform** that combines:

- Natural-language property discovery (Google Gemini)
- Public listing browse + premium property detail
- Customer portal (favorites, requirements, inquiries, saved searches)
- Agent/Admin CRM (leads, visits, inventory, bulk CSV)
- Admin command center, reports, CMS, AI chatbot configuration
- Email + in-app notifications

### 2.2 Problem

Agents and admins use fragmented tools for listings, leads, and reporting. Buyers face rigid filters that don’t match how people describe homes.

### 2.3 Solution

One **single-organization** product with Gemini NLP search (explainable match scores + reasons), filter **fallback** when AI fails, role-based portals, and UI fidelity to `docs/design_reference/**`.

### 2.4 MVP success criteria

- Guests/customers discover properties via AI search and filters  
- Customers manage favorites, inquiries, profile, loan analysis, saved searches  
- Agents/Admins manage properties, leads, users/agents, CMS, reports, AI config  
- UI matches design HTML for in-scope screens  
- APIs are real, typed, and role-aware (no leftover mocks)  
- Out-of-MVP items are **not** shipped in nav/APIs  

---

## 3. Technology stack (binding)

| Layer | Technology |
|-------|------------|
| Frontend | **Next.js 15** (App Router), **React 19**, TypeScript (strict), **Tailwind CSS** |
| Frontend deploy | **Vercel** (`frontend/` monorepo root) |
| Backend | **Node.js**, **Express**, TypeScript, **Prisma** |
| Database | **PostgreSQL** (Prisma migrations) |
| AI | **Google Gemini only** (server-side API key; never in the browser) |
| Maps | **Leaflet** + **OpenStreetMap** |
| Auth | Email + password; **JWT** access + refresh; bcrypt |
| Notifications (MVP) | **Email + in-app** only |
| API base | `/api/v1` |

### Local defaults

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:3001` |
| Backend health | `http://localhost:4001/api/v1/health` |

### Forbidden in MVP

- Alternate LLM providers  
- SMS / WhatsApp / Push  
- Multi-tenant / multi-org  
- Module-level permission engines (role-only AuthZ)  
- Kanban pipeline, activity timeline product, reminders product, virtual tours, video upload  

---

## 4. Repository layout

```text
ai-prop-v3/
├── docs/                 # Constitution, PRD/SRS, OpenAPI, design_reference, checklists
├── frontend/             # Next.js app → Vercel
├── backend/              # Express + Prisma → PostgreSQL
└── README.md
```

**Architecture style:** Clean Architecture — UI → feature hooks → `lib/api` → Express routes → services → Prisma repositories → integrations (Gemini, email, storage).

---

## 5. User roles (exactly five)

Authorization is **role-based only** (no permissions matrix).

| Role | Capabilities (summary) |
|------|------------------------|
| **Guest** | Public home, search, property detail, CMS pages, register/login CTAs, chat widget |
| **Customer** | All guest + favorites, inquiries, customer dashboard, requirements, saved searches, loan analysis, visits |
| **Agent** | Assigned/own properties & leads, inventory/editor (scoped), visits, command-center subset |
| **Admin** | Org users/agents, properties, leads, CMS, reports, AI config, notification rules, bulk upload |
| **Super Admin** | Full admin capabilities including elevated user/role management |

Login home routing: Admin/Agent → `/admin` · Customer → `/customer`.

---

## 6. Modules & functional areas

| Module | Description | Primary routes |
|--------|-------------|----------------|
| **Auth** | Register, login, refresh, logout, route guards | `/login`, `/register` |
| **Public marketing** | Homepage, featured listings, journey, contact/lead form, chat FAB | `/` |
| **AI Search** | NLP search, match %, reasons, filters, grid/list, empty & fallback | `/search` |
| **Property detail** | Gallery, amenities, map, EMI/loan analysis, agent CTAs, schedule/inquire | `/properties/[id]` |
| **Customer portal** | Saved properties, requirements, inquiries, notifications, saved searches | `/customer` |
| **Property inventory** | List/filter/CRUD, publish/archive, bulk entry | `/properties` |
| **Listing editor** | Create/edit listing, media, amenities, draft/publish | `/properties/[id]/edit` |
| **Bulk upload** | CSV validate + commit | `/properties/bulk` |
| **CRM leads** | Lead list + detail (stage, notes, visit) — **not** Kanban | `/admin/leads`, `/admin/leads/[id]` |
| **Users & agents** | Admin user/agent management | `/admin/users`, `/admin/agents` |
| **Command center** | KPIs, charts, activity, leaderboard | `/admin` |
| **Reports** | Org metrics | `/admin/reports` |
| **AI config** | Greeting, FAQs, escalation, tone, live preview (Gemini) | `/admin/ai-config` |
| **CMS** | Admin pages + public `/pages/[slug]` | `/admin/cms`, `/pages/[slug]` |
| **Notifications** | In-app bell + email; admin notification rules | Shell bell · `/admin/notification-rules` |
| **Maps** | Leaflet map on property detail | Embedded on detail |

### Backend feature areas (conceptual)

Auth · Users · Agents · Properties (inventory, media, amenities, landmarks) · Search (AI + fallback) · Leads · Visits · Favorites · Saved searches · Customer profiles · AI (chat, loan, config) · Notifications · CMS · Metrics/Reports · Health

---

## 7. Screens & design mapping

UI source of truth: `docs/design_reference/<screen>/code.html` (**HTML wins**). Do not redesign HTML to match the app.

| Screen ID | Design folder | Live route | MVP |
|-----------|---------------|------------|-----|
| SCR-HOME | `propvista_crm_homepage` | `/` | Yes |
| SCR-SEARCH-* | `search_results_*` | `/search` | Yes |
| SCR-PROP-D | `property_details_premium_view` | `/properties/[id]` | Yes |
| SCR-CUS-DASH | `customer_account_dashboard` | `/customer` | Yes |
| SCR-LEAD-D | `lead_detail_sarah_jenkins` | `/admin/leads/[id]` | Yes* |
| SCR-PROP-INV | `property_inventory_admin_view` | `/properties` | Yes |
| SCR-PROP-EDIT | `listing_editor_basic_info` | `/properties/[id]/edit` | Yes |
| SCR-BULK | `bulk_upload_validation_results` | `/properties/bulk` | Yes |
| SCR-AI-CFG | `ai_chatbot_configuration` | `/admin/ai-config` | Yes |
| SCR-CMD | `admin_agent_command_center` | `/admin` | Yes |
| SCR-LEAD-KANBAN | `lead_pipeline_kanban_view` | — | **Out of MVP** |

\* Lead detail: MVP panels (contact, stage, notes, visit). Reminder/timeline **product** is Future.

Functional screens without dedicated design HTML: login, register, lead list, users, agents, CMS, notification rules, reports.

Full matrix: `docs/design_reference/design-references-catalog.md`.

---

## 8. Key business rules

1. **Gemini only** — search, chat, loan analysis, config preview; no alternate LLM.  
2. **AI search failure → filter fallback** — never a blank dead-end.  
3. **Single organization** — no multi-tenant orgs.  
4. **Role-only AuthZ** — enforce on the server, not UI hiding alone.  
5. **Notifications** — email + in-app only in MVP.  
6. **Bulk import** — CSV validate then commit valid rows.  
7. **Property statuses** — e.g. draft / published / archived / sold / rented (product taxonomy).  
8. **UI fidelity** — match design HTML; Out-of-MVP HTML must not ship.

---

## 9. Explicitly out of MVP (Future)

| Item | Notes |
|------|--------|
| Lead Kanban pipeline | Design exists; absent from nav |
| Activity timeline product | Deferred |
| Reminders / automation engines | Deferred |
| Virtual tours / video upload | Deferred |
| SMS / WhatsApp / Push | Deferred |
| Advanced CRM (opportunity / contacts module) | Deferred |
| Alternate LLMs | Forbidden |
| Multi-org / module permissions | Forbidden |

---

## 10. Non-functional requirements (summary)

| Area | Expectation |
|------|-------------|
| Security | JWT auth; role checks; Gemini key server-only; no secrets in FE; rate limits on auth/AI |
| Performance | Paginated lists; AI timeouts with fallback; primary routes responsive |
| Accessibility | Labels, focus, keyboard on primary journeys |
| Responsive | Desktop / tablet / mobile verified for main SCR-* |
| Quality gates | Lint, TypeScript, tests, UI pixel checklist, API checklist, release checklist |
| Deploy | FE → Vercel; BE → Node + PostgreSQL; migrate before app traffic |

---

## 11. Delivery status (as of 2026-08-05)

| Item | Status |
|------|--------|
| MVP features (`progress.html`) | **80/80 Done** · 14/14 sprints |
| Docs freeze | Tag **`docs-v1.0`** (product docs) |
| UI / release | MVP RC engineering freeze; see `18_RELEASE_CHECKLIST.md` |
| Production cutover | Requires staging smoke + PO / ops sign-off |

---

## 12. Document map (where to go next)

| Need | Document |
|------|----------|
| Engineering process & stack law | `docs/00_PROJECT_CONSTITUTION.md` |
| Full functional SOT | `docs/REQUIREMENTS_AND_PROPOSAL.md` |
| Product requirements (PRD) | `docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md` |
| Software requirements (SRS) | `docs/02_SOFTWARE_REQUIREMENTS_SPECIFICATION.md` |
| System architecture | `docs/03_SYSTEM_ARCHITECTURE_DOCUMENT.md` |
| Database design | `docs/04_DATABASE_DESIGN_DOCUMENT.md` |
| API contract | `docs/openapi.yaml`, `docs/05_API_SPECIFICATION.md` |
| Frontend architecture | `docs/06_FRONTEND_ARCHITECTURE.md` |
| UI implementation | `docs/07_UI_IMPLEMENTATION_GUIDE.md` |
| Epics / features / stories | `docs/08_EPICS_AND_FEATURES.md` |
| Sprint plan | `docs/09_SPRINT_PLAN.md` |
| Task breakdown | `docs/10_TASK_BREAKDOWN.md` |
| Test strategy | `docs/11_TEST_STRATEGY.md` |
| Deployment | `docs/12_DEPLOYMENT_GUIDE.md` |
| Pixel / screen complete | `docs/16_UI_PIXEL_PERFECT_CHECKLIST.md` |
| Release gates | `docs/18_RELEASE_CHECKLIST.md` |
| Handover / ops onboarding | `docs/20_PROJECT_HANDOVER_GUIDE.md` |
| Design HTML inventory | `docs/design_reference/design-references-catalog.md` |
| Progress dashboard | `docs/progress.html` |
| Quick start | `README.md` |

### Conflict resolution (short)

1. Constitution (stack / process / MVP exclusions)  
2. Design HTML (UI)  
3. Requirements & Proposal (features / rules)  
4. PRD / SRS / Architecture / OpenAPI  
5. Implementation guides  

---

## 13. How to run (local)

```bash
# Backend
cd backend
cp .env.example .env   # fill secrets locally — never commit
npm install
npx prisma migrate deploy && npx prisma generate
npm run dev            # :4001

# Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev            # :3001
```

From repo root: `npm run lint` · `npm run typecheck` · `npm test` · `npm run build`.

---

## 14. Revision history

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-08-05 | Team-facing requirements overview for sharing |

---

*For formal acceptance criteria and FR IDs, use PRD/SRS and `REQUIREMENTS_AND_PROPOSAL.md`. This document does not replace those sources of truth.*
