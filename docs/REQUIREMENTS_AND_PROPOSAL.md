# Property AI Studio — Requirements & Proposal

> **Document Status:** Functional Source of Truth (SOT)  
> **Version:** 2.0.0  
> **Last updated:** 2026-07-31  
> **Governance:** `docs/00_PROJECT_CONSTITUTION.md` is binding for stack, process, MVP exclusions, and conflict resolution. On any conflict between this file and the Constitution, **the Constitution wins** for stack/process/exclusions; this file remains the functional SOT for features, business rules, roles, scope, modules, and workflows **only where it does not contradict the Constitution**.

---

## 1. Executive Summary

Property AI Studio (UI brand: **PropVista CRM**) is an AI-powered real estate platform for buyers, sellers, agents, and administrators. It unifies property discovery, listing management, CRM lead handling, role-based dashboards, AI-assisted search and chat, loan analysis, notifications, and administration into a **single-organization** web product.

**Core differentiation:** Google Gemini–powered natural language property search and conversational assistance, with explainable match results and admin-configurable AI behavior.

**MVP success:** Guests/customers discover properties via filters and Gemini NLP search; customers manage favorites, inquiries, profile, and loan analysis; agents/admins manage properties, leads, users/agents, CMS, reports, and AI configuration; UI matches `docs/design_reference/**`; APIs are real, typed, and role-aware.

---

## 2. Problem Statement

Real estate professionals juggle fragmented tools for listing, search, lead capture, client communication, and reporting. Buyers struggle with rigid search filters that do not match how they think about homes. No single platform combines CRM, AI search, and modern UX under one role-aware product.

---

## 3. Solution

A web platform with:

- AI-powered natural language property search (Google Gemini **only**)
- CRM for leads (list + detail; **non-Kanban** for MVP), notes, and basic stage workflow
- Property listing creation, inventory, media galleries, and bulk upload
- Role-based experiences for Guest, Customer, Agent, Admin, Super Admin
- Appointment / visit scheduling (not virtual tours)
- Notifications (email + in-app only), CMS, analytics / command center
- Maps via Leaflet + OpenStreetMap
- Responsive design across desktop, tablet, and mobile

---

## 4. Technology Stack (Binding — matches Constitution §5)

| Layer | Technology |
|-------|------------|
| Production frontend | Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS |
| Maps | Leaflet + OpenStreetMap |
| Frontend deploy | Vercel |
| Production backend | Node.js, Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL (Prisma migrations) |
| AI | Google Gemini API only (`@google/genai` or official Gemini SDK) |
| Auth | Email + password; JWT access + refresh tokens; bcrypt (or equivalent) |
| Notifications (MVP) | Email + in-app |
| State (FE) | Zustand (client), React Query (server state) as adopted in architecture |

### 4.1 Explicitly Forbidden (MVP)

- Alternate LLM providers or “LLM fallback” engines  
- FastAPI, SQLAlchemy, Alembic, python-jose (historical only — do not implement)  
- SMS, WhatsApp, Push  
- Module-level permission engines / permissions tables  
- Multi-tenant / multi-organization architecture  
- Kanban pipeline, activity timeline product, reminders/automation, virtual tours, video upload  

---

## 5. User Roles

Exactly **five** roles. Authorization is **role-based only** (no module-level permission matrix).

| Role | Access |
|------|--------|
| Super Admin | Full system — users, agents, config, all org data; audit product deferred post-MVP unless separately approved |
| Admin | Org-level — users, agents, CMS, reports, AI config, notification rules, properties, leads |
| Agent | Own/assigned properties and leads, visit scheduling, inventory/editor as scoped; command-center subset where designed |
| Customer | Search, favorites, inquiries, chat, loan analysis, profile, customer dashboard |
| Guest | Public browse/search/property details, public CMS pages, registration CTAs |

---

## 6. Design & Documentation Assets

### 6.1 UI Source of Truth

`docs/design_reference/**` (per-screen `code.html` + `screen.png`). HTML wins all UI conflicts. Kanban HTML is **Out of MVP** (reference only).

### 6.2 Screens in design_reference (MVP unless noted)

| Directory | Intent | MVP |
|-----------|--------|-----|
| `propvista_crm_homepage` | Homepage / AI search landing | Yes |
| `search_results_standard_view` | AI search results | Yes |
| `search_results_filter_fallback_view` | Filter fallback results | Yes |
| `search_results_empty_state` | Zero results | Yes |
| `property_details_premium_view` | Property details | Yes |
| `customer_account_dashboard` | Customer dashboard | Yes |
| `lead_detail_sarah_jenkins` | Lead detail | Yes |
| `listing_editor_basic_info` | Listing create/edit | Yes |
| `property_inventory_admin_view` | Property inventory | Yes |
| `bulk_upload_validation_results` | Bulk upload results | Yes |
| `ai_chatbot_configuration` | AI chatbot config | Yes |
| `admin_agent_command_center` | Admin command center | Yes |
| `lead_pipeline_kanban_view` | Lead Kanban | **No — Out of MVP** |
| `propvista_crm` | Shell tokens (`DESIGN.md`) | Yes (tokens) |

Auth login/register and several admin surfaces (users, agents, CMS admin, notification rules, reports, lead list) are in functional scope without dedicated HTML under `design_reference/`; implement per PRD/SRS/UI guide “functional-only” specs.

### 6.3 Canonical API (production)

Contract: `docs/openapi.yaml` / `docs/05_API_SPECIFICATION.md`.  
Login: `POST /api/v1/auth/token` (not a separate `/auth/login` product path).  
AI capabilities: search, chat, loan-analysis — Gemini-backed.  
Temporary FE mocks must match OpenAPI and be removed when backend is ready (no separate approved-mock catalog).

---

## 7. Build Phases (Target Delivery)

Phases describe delivery order for the **Express + Prisma + Next.js** monorepo. Status reflects this workspace as of 2026-07-31: **documentation set complete; application packages not yet scaffolded**.

### Phase 0 — Discovery & Planning ✅ COMPLETE (docs)

MVP scope, roles, design inventory, epics/features, sprint/task plans, architecture, DB, OpenAPI, UI guide, test/deploy/checklists.

### Phase 1 — Project Initialization 🔲 NOT STARTED

| Task | Status |
|------|--------|
| Backend scaffold: Express + TypeScript + layered Clean Architecture | ❌ |
| Frontend scaffold: Next.js 15 App Router + React 19 | ❌ |
| Prisma + PostgreSQL setup and migrate | ❌ |
| Config / env validation | ❌ |
| CORS, health endpoint | ❌ |
| Shared tokens from `DESIGN.md` | ❌ |

### Phase 2 — Authentication & User Model 🔲 NOT STARTED

| Task | Status |
|------|--------|
| User model + `role` enum (five roles) | ❌ |
| Password hashing + JWT access/refresh | ❌ |
| `POST /auth/register`, `POST /auth/token`, `POST /auth/refresh` | ❌ |
| Role middleware (role-only AuthZ — **no** permissions tables) | ❌ |
| Frontend auth store, login/register, protected routes | ❌ |

### Phase 3 — Database Schema 🔲 NOT STARTED

Implement schema per `docs/04_DATABASE_DESIGN_DOCUMENT.md` (users, refresh_tokens, agents, properties, amenities, landmarks, images, favorites, customer_profiles, leads, lead_notes, visit_requests, notifications, notification_rules, cms_pages, ai_configs, bulk upload tables, saved_searches, metrics snapshots, property_view_events).

### Phase 4 — Service & Repository Layer 🔲 NOT STARTED

Repositories + application services; no business logic in Express controllers or React components.

### Phase 5 — API Endpoints 🔲 NOT STARTED

Implement OpenAPI operations: Auth, Users, Agents, Properties/Media, Search/AI, Favorites, Customer, Leads, Visits, Notifications, CMS, Metrics, AI Config, Bulk, Health.

### Phase 6 — Frontend (design fidelity) 🔲 NOT STARTED

Pixel-faithful implementation of MVP `design_reference` screens + functional-only admin/auth screens; centralized API client; loading/empty/error/success states.

### Phase 7 — AI Integration 🔲 NOT STARTED

Gemini client (server-only); NLP search with filter fallback; chat; loan analysis; AI config admin.

### Phase 8 — Lead & CRM (MVP) 🔲 NOT STARTED

Lead capture, list (`/admin/leads`), detail, notes, stage updates, visit scheduling.  
**Contact management beyond leads = post-MVP** (not CRM-004 MVP).  
**Kanban = Out of MVP.**

### Phase 9 — Admin & Platform 🔲 NOT STARTED

Users, agents, CMS, notification rules (email + in-app), reports/command center, maps (Leaflet/OSM). Role checks only — no permissions engine.

### Phase 10 — Testing, QA & Deployment 🔲 NOT STARTED

Unit, integration, API, UI, E2E per `11_TEST_STRATEGY.md`; CI; Vercel FE; Postgres + backend deploy; seed data for demo.

---

## 8. MVP Feature Matrix

| Feature ID | Feature | Phase | Status |
|------------|---------|-------|--------|
| AUTH-001 | Email/password registration | 2 | ❌ |
| AUTH-002 | Login/logout (JWT access + refresh) | 2 | ❌ |
| AUTH-005 | Role-based AuthZ (five roles; no permissions tables) | 2+9 | ❌ |
| PROP-001 | Property listing creation / editor | 5+6 | ❌ |
| PROP-002 | Property search (filters + AI NLP) | 5+6+7 | ❌ |
| PROP-003 | Property details view | 6 | ❌ |
| PROP-005 | Property favorites | 5+6 | ❌ |
| PROP-BULK | Bulk upload validate/import | 5+6 | ❌ |
| AI-001 | Natural language search (Gemini) | 7 | ❌ |
| AI-002 | AI chatbot (Gemini) | 7 | ❌ |
| AI-003 | Loan analysis (Gemini + safe formula fallback) | 7 | ❌ |
| AI-004 | AI chatbot configuration (admin) | 9 | ❌ |
| CRM-001 | Lead capture forms | 8 | ❌ |
| CRM-002 | Lead list view (non-Kanban) | 8 | ❌ |
| CRM-003 | Lead detail + notes + stage | 8 | ❌ |
| CRM-005 | Visit / tour scheduling | 8 | ❌ |
| ADM-001 | User management | 9 | ❌ |
| ADM-002 | Agent management | 9 | ❌ |
| ADM-004 | Notifications (email + in-app) + rules UI | 9 | ❌ |
| ADM-005 | Basic CMS | 9 | ❌ |
| ADM-013 | Command center / metrics dashboard | 9 | ❌ |
| ADM-014 | Reports views | 9 | ❌ |
| MAP-001 | Leaflet + OSM maps on designed surfaces | 6+9 | ❌ |
| PLT-001 | Health + deploy + seed demo data | 1+10 | ❌ |

### 8.1 Explicitly Out of MVP (do not ship)

| ID | Item |
|----|------|
| CRM-004 | Contact management beyond leads → **post-MVP** |
| — | Kanban pipeline UI |
| — | Activity timeline product |
| — | Reminders / automation engines |
| — | Virtual tours / video upload |
| — | SMS / WhatsApp / Push |
| — | Alternate LLM / LLM fallback |
| — | Multi-org / permissions tables |

---

## 9. Phase Timeline (Estimated)

| Phase | Duration | Depends on |
|-------|----------|------------|
| 0 — Discovery (docs) | ✅ Done | — |
| 1 — Initialization | Sprint 0 | Docs freeze + repo scaffold |
| 2 — Auth | 1 sprint | Phase 1 |
| 3 — Schema | Overlaps Sprint 0–1 | Phase 1 |
| 4 — Services | Ongoing with APIs | Phase 3 |
| 5 — API | Sprints per `09_SPRINT_PLAN.md` | Phase 4 |
| 6 — Frontend fidelity | Parallel with APIs | Phase 2, design_reference |
| 7 — AI | Mid sprints | Phase 5 Gemini keys |
| 8 — CRM leads | Mid sprints | Phase 5–6 |
| 9 — Admin platform | Mid–late sprints | Phase 2, 6 |
| 10 — Test & deploy | Continuous + final | All above |

Detailed schedule: `docs/09_SPRINT_PLAN.md`, tasks: `docs/10_TASK_BREAKDOWN.md`.

---

## 10. Post-MVP Roadmap

| Release | Focus |
|---------|-------|
| 1.1 | Kanban pipeline (activate HTML), enhanced geo/compare |
| 1.2 | AI power-ups (lead scoring, recommendations, smart descriptions) |
| 1.3 | CRM: contact management (former CRM-004), activity timeline, reminders/automation |
| 1.4 | Marketing: SMS/WhatsApp/push (channels), campaigns |
| 2.0 | Transactions, documents, e-signature |
| 2.x | Multi-tenancy, PWA/mobile, localization |

---

## 11. Risk Summary

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| AI search quality insufficient | High | Medium | Prompt engineering, **filter-only fallback** (not alternate LLM), user feedback |
| Scope creep before MVP | High | High | Constitution MVP exclusions + this matrix as gate |
| Pixel fidelity vs HTML | High | Medium | UI guide + pixel checklist; no redesign |
| Gemini API cost/availability | Medium | Low | Usage monitoring, graceful filter fallback, rate limits |
| Empty DB for demos | Medium | High | Prisma seed scripts per DB design |
| Docs vs empty monorepo | High | Certain until Sprint 0 | Scaffold only after docs freeze + Q2 approval |

---

## 12. Success Criteria (MVP)

- **Performance:** <2s average page load (target)  
- **Uptime:** 99.5%+  
- **Security:** No critical vulnerabilities; JWT validated; inputs sanitized; role checks on every protected API  
- **Coverage:** Per `11_TEST_STRATEGY.md` gates  
- **Fidelity:** Visually indistinguishable from in-scope HTML  
- **User flows validated:**  
  - Agent/Admin creates property → published  
  - Guest/Customer searches (filters + NLP) → details → inquiry  
  - Agent manages leads (list + detail)  
  - Admin manages users/agents, CMS, AI config, notifications (email + in-app)  
  - Maps render via Leaflet/OSM where designed  

---

## 13. Reference Documents

| Document | Location |
|----------|----------|
| Project Constitution | `docs/00_PROJECT_CONSTITUTION.md` |
| PRD | `docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md` |
| SRS | `docs/02_SOFTWARE_REQUIREMENTS_SPECIFICATION.md` |
| System Architecture | `docs/03_SYSTEM_ARCHITECTURE_DOCUMENT.md` |
| Database Design | `docs/04_DATABASE_DESIGN_DOCUMENT.md` |
| API Specification | `docs/05_API_SPECIFICATION.md` + `docs/openapi.yaml` |
| Frontend Architecture | `docs/06_FRONTEND_ARCHITECTURE.md` |
| UI Implementation Guide | `docs/07_UI_IMPLEMENTATION_GUIDE.md` |
| Epics & Features | `docs/08_EPICS_AND_FEATURES.md` |
| Sprint Plan | `docs/09_SPRINT_PLAN.md` |
| Task Breakdown | `docs/10_TASK_BREAKDOWN.md` |
| Test Strategy | `docs/11_TEST_STRATEGY.md` |
| Deployment Guide | `docs/12_DEPLOYMENT_GUIDE.md` |
| AI Development Rules | `docs/13_AI_DEVELOPMENT_RULES.md` |
| Coding Standards | `docs/14_CODING_STANDARDS.md` |
| UI SOT | `docs/design_reference/**` |

**Superseded:** Any prior FastAPI / Alembic / python-jose / alternate-LLM wording in older revisions of this file is void. Use Constitution §5 and this v2.0.0 text.
