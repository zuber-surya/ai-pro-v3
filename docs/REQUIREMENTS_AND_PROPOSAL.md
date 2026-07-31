# Property AI Studio — Requirements & Proposal

> **Source of Truth (SOT)** document for scope, phases, deliverables, and progress tracking.
> Last updated: 2026-07-29 (frontend design port from `/src` into Next.js)

---

## 1. Executive Summary

Property AI Studio is an AI-powered real estate platform for buyers, sellers, agents, and administrators. It unifies property management, CRM, AI-driven search, lead management, marketing, analytics, and administration into a single product.

**Core differentiation:** Google Gemini-powered natural language property search and conversational assistant.

---

## 2. Problem Statement

Real estate professionals juggle fragmented tools for listing, search, lead capture, client communication, and reporting. Buyers struggle with rigid search filters that don't match how they think about homes. No single platform combines CRM, AI search, and transaction management with a modern UX.

---

## 3. Solution

A web platform with:

- AI-powered natural language property search (Google Gemini)
- Full CRM for leads, contacts, and pipeline management
- Property listing creation, management, and media galleries
- Role-based dashboards (Admin, Agent, Customer)
- Appointment scheduling and tour management
- Notification engine, CMS, and analytics
- Responsive design across devices

---

## 4. Technology Stack

| Layer | Technology |
|-------|-----------|
| UI prototype (existing) | React 19, Vite, Express, Tailwind CSS, Lucide, Framer Motion |
| Production frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Production backend | Node.js, React , Express.js, Prisma ORM |
| Database | PostgreSQL , Alembic migrations |
| AI | Google Gemini API (`@google/genai`) |
| State management | Zustand (frontend), React Query (server state) |
| Auth | JWT (access + refresh tokens), bcrypt, python-jose |

---

## 5. User Roles

| Role | Access |
|------|--------|
| Super Admin | Full system — config, users, audit, all data |
| Admin | Org-level — users, roles, CMS, reports, AI config, settings |
| Agent | Own properties, assigned leads, tasks, tours, performance |
| Customer | Search, favorites, inquiries, chat, loan analysis, profile |
| Guest | Limited property browsing, public pages, registration |

---

## 6. Existing Assets (Design Prototype)

A fully designed and functional React application exists under `/src` with mock data and Express + Gemini AI backend (`server.ts`). This is the **design and interaction source of truth** for production UI.

**Production `frontend/` status:** Designed `/src` UI has been ported into Next.js (`frontend/src/components/**`) with App Router pages and FastAPI wiring. Root `/src` remains as the design reference prototype.

### Screens already designed and implemented in `/src`:

| Category | Components |
|----------|-----------|
| Auth | `LoginPage` |
| Customer | `CustomerDashboardView`, `HeroSearch`, `PropertyFilters`, `PropertyGrid`, `PropertyDetails` |
| Admin Dashboard | `AdminDashboard`, `AdminSidebar` |
| Admin Properties | `AdminPropertiesView`, `AdminPropertyEditor` |
| Admin CRM | `ClientsView`, `AdminLeadDetailView`, `AddLeadModal` |
| Admin Agents/Users | `AdminAgentsView`, `AdminUsersView` |
| Admin Config | `AdminAIConfigView`, `AdminNotificationRulesView`, `AdminCMSView`, `AdminReportsView` |
| AI Features | `AIChatbot`, `AILoanAnalysisModal` |
| Scheduling | `ScheduleVisitModal` |
| Analytics | `AnalyticsView`, `TasksView` |
| Shared UI | `Header`, `Footer`, `Button`, `Card`, `Input`, `Form`, `Modal`, `Table`, `Layout`, `Navigation`, `Loader`, `States`, `SkeletonLoader`, `EmptySearchState`, `NotificationsDropdown` |
| Data | `data/properties.ts`, `data/leads.ts` |
| Types | `types.ts` (all TypeScript interfaces) |

### Express AI API endpoints (prototype):

| Endpoint | Purpose |
|----------|---------|
| `POST /api/search` | NLP property search via Gemini |
| `POST /api/chat` | Conversational AI assistant |
| `POST /api/loan-analysis` | Mortgage affordability analysis |
| `GET /api/health` | Health check |

---

## 7. Build Phases

### Phase 0 — Discovery & Planning ✅ COMPLETE

| Deliverable | Status |
|-------------|--------|
| Project overview | ✅ |
| Stakeholder analysis | ✅ |
| UI screen inventory (from `/src`) | ✅ |
| Route map (Next.js App Router) | ✅ |
| Navigation flow | ✅ |
| User role matrix | ✅ |
| Feature inventory (150+ features cataloged) | ✅ |
| MVP scope definition | ✅ |
| Future scope | ✅ |
| Dependency map | ✅ |
| Risk register | ✅ |
| Project glossary | ✅ |

**Artifacts:** `docs/phase-0/01–12_*.md`

---

### Phase 1 — Project Initialization ✅ COMPLETE

| Task | Status |
|------|--------|
| Backend scaffold: FastAPI app with layered architecture | ✅ |
| Frontend scaffold: Next.js 15 with App Router | ✅ |
| Config management: pydantic-settings, `.env` | ✅ |
| Database setup: SQLAlchemy, Alembic, session factory | ✅ |
| CORS middleware | ✅ |
| Makefile for common commands | ✅ |

---

### Phase 2 — Authentication & User Model ⚠️ PARTIAL

| Task | Status |
|------|--------|
| User model (email, password_hash, is_active, soft delete) | ✅ |
| Alembic migration: `users` table | ✅ |
| Password hashing (bcrypt) | ✅ |
| JWT access + refresh token helpers | ✅ |
| `POST /auth/register` endpoint | ✅ |
| `POST /auth/token` endpoint (login) | ✅ |
| `POST /auth/refresh` endpoint | ✅ |
| `get_current_user` dependency | ✅ |
| User schema (Pydantic) | ✅ |
| User `role` column (string: admin/customer/etc.) | ✅ |
| Frontend auth store + AuthProvider | ✅ |
| Frontend protected routes (`RequireAuth`) | ✅ |
| Frontend login/register pages (Next.js) | ✅ |
| Full RBAC roles/permissions tables + middleware | ❌ |

---

### Phase 3 — Database Schema Expansion ✅ COMPLETE

| Task | Status |
|------|--------|
| Property model (title, price, address, beds, baths, sqft, type, agent FK) | ✅ |
| Agent model (name, email, phone, profile image) | ✅ |
| PropertyAmenity model | ✅ |
| NearbyLandmark model | ✅ |
| PropertyImage model | ✅ |
| Lead, Favorite, Notification, CMS page models | ✅ |
| Alembic migration: `000000000002` (+ later schema updates) | ✅ |

**Tables (core):** `users`, `agents`, `properties`, `property_amenities`, `nearby_landmarks`, `property_images`, `leads`, `favorites`, plus notifications/CMS as migrated

---

### Phase 4 — Service & Repository Layer ✅ COMPLETE

| Task | Status |
|------|--------|
| BaseRepository (generic CRUD) | ✅ |
| PropertyRepository, AgentRepository, AmenityRepo, LandmarkRepo, ImageRepo | ✅ |
| BaseService (generic CRUD) | ✅ |
| PropertyService, AgentService, AmenityService, LandmarkService, ImageService | ✅ |
| Pydantic schemas for all models | ✅ |
| `__init__.py` exports | ✅ |

---

### Phase 5 — API Endpoints ⚠️ PARTIAL

| Task | Status |
|------|--------|
| Auth router (`/auth`) | ✅ |
| Property CRUD router (`/properties`) | ✅ |
| Agent CRUD router (`/agents`) | ✅ |
| PropertyAmenity router (`/property-amenities`) | ✅ |
| NearbyLandmark router (`/nearby-landmarks`) | ✅ |
| PropertyImage router (`/property-images`) | ✅ |
| API router aggregation (`api/v1/api.py`) | ✅ |
| Lead endpoints (`/leads`) | ✅ |
| Property search/filter query params | ✅ |
| Favorites endpoints (`/favorites`) | ✅ |
| AI endpoints (`/ai/search`, `/ai/chat`) | ✅ |
| Notifications endpoints | ✅ |
| Users admin endpoints | ✅ |
| CMS endpoints (`/cms/pages`, public `/pages`) | ✅ |
| Health / admin stats endpoints | ✅ |
| Loan-analysis AI endpoint | ✅ |
| Pagination, sorting, error handling polish | ⚠️ Partial |

---

### Phase 6 — Frontend Migration ✅ MOSTLY COMPLETE (design port)

Designed `/src` components ported into `frontend/` Next.js App Router with FastAPI wiring via `lib/api.ts` + `lib/mappers.ts`. Root `/src` remains as design reference.

| Task | Status |
|------|--------|
| App layout (header, footer, sidebar) | ✅ SiteHeader/SiteFooter + designed AdminSidebar (Next Link) |
| Auth pages (login, register) + auth context | ✅ Designed LoginPage wired to JWT auth store |
| Customer: property search, grid, details | ✅ HeroSearch, PropertyFilters, PropertyGrid, PropertyDetails |
| Customer: dashboard, favorites | ✅ CustomerDashboardView + favorites API |
| Admin: dashboard, sidebar navigation | ✅ AdminDashboard + Link-based AdminSidebar |
| Admin: properties list + editor | ✅ AdminPropertiesView + AdminPropertyEditor (API) |
| Admin: leads/clients pipeline + detail | ✅ ClientsView, AddLeadModal, AdminLeadDetailView |
| Admin: agents management | ✅ AdminAgentsView (designed UI) |
| Admin: users management | ✅ AdminUsersView (designed UI) |
| Admin: AI config | ✅ AdminAIConfigView |
| Admin: CMS | ✅ AdminCMSView |
| Admin: reports | ✅ AdminReportsView |
| Admin: notifications | ✅ AdminNotificationRulesView + API notification dropdown |
| Home / marketing landing | ✅ HeroSearch landing |
| Shared UI components (Button, Card, Modal, Table, etc.) | ✅ `frontend/src/components/ui` |
| API integration | ✅ Properties, favorites, leads, AI; some admin screens local-state |
| Loading states / skeleton loaders | ✅ SkeletonLoader ported |
| Dark/light mode | ❌ |
| Responsive QA vs `/src` | ⚠️ Pending formal QA |

---

### Phase 7 — AI Integration ✅ MOSTLY COMPLETE

| Task | Status |
|------|--------|
| Gemini client setup in FastAPI | ✅ |
| `POST /api/v1/ai/search` — NLP property search | ✅ |
| `POST /api/v1/ai/chat` — Conversational assistant | ✅ |
| `POST /api/v1/ai/loan-analysis` — Mortgage analysis | ✅ (+ formula fallback) |
| Frontend: AI chatbot component | ✅ Wired to FastAPI |
| Frontend: AI search (HeroSearch) | ✅ |
| Frontend: loan analysis modal | ✅ Wired to FastAPI |

---

### Phase 8 — Lead & CRM Features ⚠️ PARTIAL

| Task | Status |
|------|--------|
| Lead model + migration | ✅ |
| Lead CRUD endpoints | ✅ |
| Lead capture form (property pages) | ✅ |
| Lead pipeline/list view (admin) | ✅ ClientsView + API |
| Lead detail view | ✅ AdminLeadDetailView |
| Contact management | ❌ |
| Basic lead status workflow | ✅ Via ClientsView + `apiUpdateLead` |
| Notification on new lead | ⚠️ Notifications API; rules engine is local UI |

---

### Phase 9 — Admin & Platform Features ⚠️ PARTIAL

| Task | Status |
|------|--------|
| RBAC: roles table, permission checks, middleware | ⚠️ Role string on user only |
| User management UI | ✅ Designed AdminUsersView |
| Notification rules engine | ⚠️ Designed UI (local state) |
| Basic CMS | ✅ Designed AdminCMSView + public CMS pages |
| System health dashboard | ⚠️ AdminDashboard KPIs (designed) |
| Analytics/reports views | ✅ AdminReportsView |
| Appointment/tour scheduling | ✅ ScheduleVisitModal (local confirm) |

---

### Phase 10 — Testing, QA & Deployment 🔲 NOT STARTED

| Task | Status |
|------|--------|
| Backend unit tests (pytest) | ❌ |
| Frontend tests (Vitest + React Testing Library) | ❌ |
| API integration tests | ❌ |
| RBAC permission tests | ❌ |
| Security audit (OWASP basics) | ❌ |
| Performance benchmarks (<2s page load) | ❌ |
| CI/CD pipeline (GitHub Actions) | ❌ |
| Staging deployment | ❌ |
| Production deployment docs | ❌ |
| Monitoring & error tracking | ❌ |

---

## 8. MVP Feature Matrix

Features required for MVP launch, mapped to build phases:

| Feature ID | Feature | Phase | Status |
|------------|---------|-------|--------|
| AUTH-001 | Email/password registration | 2 | ✅ |
| AUTH-002 | Login/logout (JWT) | 2 | ✅ |
| AUTH-005 | Basic RBAC (admin/user) | 9 | ⚠️ Role string only |
| PROP-001 | Property listing creation | 5+6 | ⚠️ API + simplified editor UI |
| PROP-002 | Property search with filters | 5+6 | ⚠️ API + simplified search UI (not `/src` design) |
| PROP-003 | Property details view | 6 | ⚠️ API-backed simplified view |
| PROP-005 | Property favorites | 5+6 | ⚠️ API + basic favorites page |
| AI-001 | Natural language search | 7 | ⚠️ Backend + basic AISearchBar |
| AI-002 | AI chatbot | 7 | ⚠️ Backend + basic chatbot |
| CRM-001 | Lead capture form | 8 | ✅ |
| CRM-002 | Lead list view | 8 | ⚠️ Basic list (not `/src` pipeline design) |
| CRM-004 | Contact management | 8 | ❌ |
| ADM-001 | User management | 9 | ⚠️ Basic UI |
| ADM-004 | Notification system | 9 | ⚠️ Basic list; no rules engine |
| ADM-005 | Basic CMS | 9 | ⚠️ API + admin/public pages |
| ADM-013 | System health dashboard | 9 | ⚠️ Admin stats snapshot |

---

## 9. Phase Timeline (Estimated)

| Phase | Duration | Depends on |
|-------|----------|-----------|
| 0 — Discovery | ✅ Done | — |
| 1 — Initialization | ✅ Done | — |
| 2 — Auth | ⚠️ Mostly done; finish full RBAC | Phase 1 |
| 3 — Schema | ✅ Done | Phase 1 |
| 4 — Services | ✅ Done | Phase 3 |
| 5 — API endpoints | ⚠️ Mostly done; polish + loan-analysis | Phase 4 |
| 6 — Frontend migration | ✅ Design port done; polish remaining | Phase 2, 5 |
| 7 — AI integration | ✅ Mostly done | Phase 5, 6 |
| 8 — Lead/CRM | ⚠️ Partial polish | Phase 5, 6 |
| 9 — Admin features | ⚠️ Partial (RBAC depth) | Phase 2, 6 |
| 10 — Testing & deploy | 🔲 Not started (1–2 weeks) | All above |

**Primary remaining gap:** formal QA, deeper API sync for agents/users/CMS demo screens, full RBAC, Phase 10 tests.

**Estimated total remaining: 2–4 weeks**

---

## 10. Post-MVP Roadmap

| Release | Focus | Timeline |
|---------|-------|----------|
| 1.1 | Enhanced property features (comparison, bulk ops, import/export, geolocation) | Months 3–4 |
| 1.2 | AI power-ups (lead scoring, recommendations, smart descriptions, image enhancement) | Months 3–4 |
| 1.3 | CRM enhancements (scoring engine, activity timeline, scheduling, messaging, segmentation) | Months 5–6 |
| 1.4 | Marketing (email campaigns, SMS, social sharing, landing pages, drip campaigns) | Months 5–6 |
| 2.0 | Transactions (offers, escrow, documents, e-signature, closing) | Months 7+ |
| 2.x | Financial management, multi-tenancy, PWA/mobile, localization | Months 9+ |

---

## 11. Risk Summary

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| AI search quality insufficient | High | Medium | Prompt engineering, template fallbacks, user feedback loop |
| Scope creep before MVP | High | High | Strict phase adherence, this SOT doc as gate |
| Frontend migration takes longer than estimated | Medium | Medium | Reuse `/src` components directly, incremental migration |
| User adoption resistance | Medium | Medium | Focus on lead capture pain point, agent onboarding |
| Gemini API cost/availability | Low | Low | Usage monitoring, alternative LLM fallback |
| Data quality with empty DB | Medium | High | Seed scripts, CSV import early, mock data for demo |

---

## 12. Success Criteria (MVP)

- **Performance:** <2s average page load
- **Uptime:** 99.5%+
- **Security:** No critical vulnerabilities, JWT validated, inputs sanitized
- **Coverage:** >80% unit test coverage on core business logic
- **User flows validated:**
  - Agent creates property → published
  - Buyer searches (text + NLP) → views details → submits inquiry
  - Agent views/manages leads
  - Admin manages users, views notifications

---

## 13. Reference Documents

| Document | Location |
|----------|----------|
| Project overview | `docs/phase-0/01_PROJECT_OVERVIEW.md` |
| Stakeholder analysis | `docs/phase-0/02_STAKEHOLDER_ANALYSIS.md` |
| UI screen inventory | `docs/phase-0/03_UI_SCREEN_INVENTORY.md` |
| Route map | `docs/phase-0/04_ROUTE_MAP.md` |
| Navigation flow | `docs/phase-0/05_NAVIGATION_FLOW.md` |
| User role matrix | `docs/phase-0/06_USER_ROLE_MATRIX.md` |
| Feature inventory | `docs/phase-0/07_FEATURE_INVENTORY.md` |
| MVP scope | `docs/phase-0/08_MVP_SCOPE.md` |
| Future scope | `docs/phase-0/09_FUTURE_SCOPE.md` |
| Dependency map | `docs/phase-0/10_DEPENDENCY_MAP.md` |
| Risk register | `docs/phase-0/11_RISK_REGISTER.md` |
| Project glossary | `docs/phase-0/12_PROJECT_GLOSSARY.md` |
| UI prototype | `/src` (Vite + React + Express) — **design SOT** |
| Backend app | `backend/app/` (FastAPI) |
| Frontend app | `frontend/` (Next.js 15) — partial migration; many shells |
