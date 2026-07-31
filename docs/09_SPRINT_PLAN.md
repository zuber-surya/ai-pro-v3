# PropVista CRM / Property AI Studio — Sprint Plan

| Field | Value |
|-------|--------|
| **Document** | Sprint Plan (MVP) |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **Cadence** | 2 weeks per sprint (adjust capacity with PO) |
| **Backlog** | `docs/08_EPICS_AND_FEATURES.md` |
| **Governance** | `docs/00_PROJECT_CONSTITUTION.md` |
| **UI checklist** | `docs/07_UI_IMPLEMENTATION_GUIDE.md` |

## 1. Rules

1. Lifecycle per feature: Epic → Feature → Technical Design → DB → APIs → (Mock) → Frontend → Real API → Test → UI Verification → Approval → Merge.
2. **No EPIC-F\*** (Kanban, timeline product, reminders, virtual tours/video, SMS/WhatsApp/Push, advanced CRM) in these sprints.
3. HTML is UI SOT; no redesign.
4. Gemini only; email + in-app notifications only; Leaflet + OSM for maps.
5. Sprint DoD inherits Constitution §14 plus the sprint-specific checklist below.

## 2. Sprint Index

| Sprint | Theme | Primary epics | Exit milestone |
|--------|--------|---------------|----------------|
| 0 | Foundation | EPIC-00 | Apps boot; tokens; API client |
| 1 | Auth | EPIC-01 | Register/login/guards |
| 2 | Users & Agents | EPIC-02 | Admin user/agent CRUD |
| 3 | Property Admin | EPIC-07 | Inventory + editor + media |
| 4 | Property Public + Maps | EPIC-05, EPIC-17 | SCR-PROP-D (core) |
| 5 | AI Search | EPIC-04 | SCR-SEARCH-STD/FB/EMPTY |
| 6 | Homepage | EPIC-03 | SCR-HOME shell |
| 7 | CRM + Visits | EPIC-09, EPIC-10 | Lead list/detail MVP + schedule |
| 8 | Customer + Favorites | EPIC-06, EPIC-11 | SCR-CUS-DASH |
| 9 | AI Chat + Config | EPIC-12, EPIC-13 | Chat, loan, SCR-AI-CFG |
| 10 | Notifications + CMS | EPIC-14, EPIC-15 | Email/in-app + CMS |
| 11 | Bulk Upload | EPIC-08 | SCR-BULK |
| 12 | Command Center | EPIC-16 | SCR-CMD + reports |
| 13 | Harden & Ship MVP | EPIC-18 + buffers | DoD / deploy gates |

---

## Sprint 0 — Platform Foundation

### Goals

- Establish Constitution-compliant monorepo stack and engineering shell.
- Unblock all later feature work with tokens, API client, and health.

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-00-01 | Repo & Stack Scaffold | P0 | M |
| FEAT-00-02 | Design Tokens & Shared UI Primitives | P0 | M |
| FEAT-00-03 | Centralized API Client & Auth Shell | P0 | M |

### Deliverables

- `frontend/` Next.js 15 + React 19 + TypeScript strict boots
- `backend/` Express + Prisma + PostgreSQL boots; migrations runnable
- DESIGN.md tokens applied; shared Loader/Empty/Error primitives
- Centralized `lib/api` client (no direct fetch in components)
- `GET /api/v1/health` smoke endpoint
- Env/secrets pattern documented (Gemini key server-only)

### Dependencies

- None (start of critical path)
- PostgreSQL available locally
- Access to Constitution, OpenAPI, DESIGN.md

### Risks

| Risk | Mitigation |
|------|------------|
| Stack drift vs older docs (FastAPI/Vite mentions) | Constitution §5 wins |
| Overbuilding infra | Scaffold only; no product screens |

### Definition of Done

- [ ] Frontend and backend start cleanly with documented env
- [ ] Prisma migrate applies baseline
- [ ] Health check returns OK
- [ ] API client pattern documented and used by a sample call
- [ ] No TypeScript/ESLint errors on scaffold
- [ ] Code reviewed; QA smoke on boot paths

---

## Sprint 1 — Authentication & Session

### Goals

- Ship email/password auth with JWT access/refresh and role-based route guards.
- Enable Guest → authenticated entry (homepage CTAs wired to auth).

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-01-01 | Register & Login | P0 | M |
| FEAT-01-02 | Session, Logout & Route Guards | P0 | M |

### Deliverables

- Register/login/logout APIs and UI
- Password hashing; access + refresh tokens
- Role stored on user (Guest/Customer/Agent/Admin/Super Admin)
- Protected route redirects; 403 on role mismatch
- Homepage Sign In / Join AI Pro navigation (even if homepage shell is partial)

### Dependencies

- Sprint 0 complete (FEAT-00-03)
- OpenAPI auth contracts

### Risks

| Risk | Mitigation |
|------|------------|
| Token/CSRF cookie strategy unclear | Lock in Technical Design before FE |
| Social login scope creep | Explicitly out of MVP |

### Definition of Done

- [ ] FR-AUTH-001–004, 007 acceptance criteria pass
- [ ] Real auth APIs integrated (no leftover mocks)
- [ ] Role guards verified for each role
- [ ] Validation, loading, error states for auth forms
- [ ] Constitution §14 checklist satisfied
- [ ] Code reviewed; QA approved

---

## Sprint 2 — Users & Agents Admin

### Goals

- Admin/Super Admin can manage users and agent profiles.
- Provide agent data needed for property contact cards.

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-02-01 | User Administration | P1 | M |
| FEAT-02-02 | Agent Profiles | P1 | M |

### Deliverables

- User list/create/update/deactivate + role assignment (five roles only)
- Agent CRUD (name, email, phone, image); local image storage in dev
- Role-gated Admin APIs and screens (Requirements AdminUsersView / AdminAgentsView)
- Seed Super Admin + sample Agent for later sprints

### Dependencies

- Sprint 1 (auth + guards)
- FEAT-00-02 primitives

### Risks

| Risk | Mitigation |
|------|------------|
| Module-permission designs appear | Reject; role-only AuthZ |
| Missing HTML for admin users/agents | Follow Requirements prototype; fidelity to existing admin patterns |

### Definition of Done

- [ ] FR-AUTH-005–006 pass
- [ ] Non-admin cannot call user/agent write APIs
- [ ] Agent image upload works in local-dev storage
- [ ] Loading/empty/error states on admin lists
- [ ] Constitution §14; code review; QA approved

---

## Sprint 3 — Property Inventory & Listing Editor

### Goals

- Agents/Admins can create, edit, publish, and manage inventory.
- Seed published properties for public/search sprints.
- Exclude video/virtual tour UI (Constitution).

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-07-01 | Property Inventory Admin View | P0 | XL |
| FEAT-07-02 | Listing Editor Basic Info | P0 | L |
| FEAT-07-03 | Property Media (Photos + Floorplan) | P1 | L |

### Deliverables

- SCR-PROP-INV pixel implementation (search, filters, sort, pagination, badges, row/bulk actions, columns, export, empty)
- SCR-PROP-EDIT create/edit; Save Draft / Publish; amenities; description/highlights
- Photo + floorplan upload (local filesystem in dev)
- Property seed data for public browsing
- **Absent:** virtual tour / video upload controls

### Dependencies

- Sprint 1–2 (auth, agents)
- Database design for properties/amenities/images
- UI Guide SCR-PROP-INV, SCR-PROP-EDIT

### Risks

| Risk | Mitigation |
|------|------------|
| XL inventory scope slips | Split bulk row actions vs export if needed; keep Publish path P0 |
| HTML shows video/tour fields | Do not ship; document exclusion |
| Media storage premature cloud work | Local storage only in dev per Constitution |

### Definition of Done

- [ ] FR-PROP-M-001–006, 008–015 pass; FR-PROP-M-007 not shipped
- [ ] SCR-PROP-INV and SCR-PROP-EDIT UI Guide checklists complete
- [ ] Draft/Publish persist; media visible on reload
- [ ] Real APIs; no mocks left for this scope
- [ ] Constitution Screen Completion Policy; §14; QA approved

---

## Sprint 4 — Public Property Details + Maps

### Goals

- Deliver premium public property detail page with Leaflet map.
- Wire inquire/contact/schedule/favorite entry points (schedule/favorites may complete in later sprints if APIs not ready—prefer full wiring).

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-05-01 | Property Detail Page | P0 | XL |
| FEAT-17-01 | Property Map & Landmarks | P1 | M |
| FEAT-05-02 | Detail CTAs (Inquire / Contact / Schedule / Favorite) | P0 | M |

### Deliverables

- SCR-PROP-D: gallery, floorplan, overview, amenities, price breakdown, agent card, similar
- Leaflet + OSM map, lazy-loaded; landmarks when data exists
- CTAs: Inquire (lead), Contact (tel/mailto), Schedule Visit, Favorite
- 404/error/loading states

### Dependencies

- Sprint 3 published properties + agents + media
- Lead create API (minimal) and/or stub ticket if Sprint 7 parallel—prefer real POST /leads
- Visit + favorites APIs (coordinate with Sprints 7–8)

### Risks

| Risk | Mitigation |
|------|------------|
| CTA backends not ready | Contract-first mocks with tracked removal; no merge with permanent mocks |
| Map performance | Lazy-load Leaflet (NFR) |
| Similar properties empty | Seed enough listings |

### Definition of Done

- [ ] FR-PROP-D-001–011 (MVP) pass; no virtual tour/video
- [ ] SCR-PROP-D pixel + responsive + states checklists
- [ ] Leaflet/OSM only; map failure does not blank the page
- [ ] CTAs hit real APIs or tracked mocks cleared before sprint close
- [ ] Constitution §14; QA approved

---

## Sprint 5 — AI Search & Discovery

### Goals

- Ship Gemini NLP search with standard, fallback, and empty UI on `/search`.
- Never dead-end on AI failure.

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-04-01 | NLP Search API (Gemini) | P0 | L |
| FEAT-04-02 | Search Results Standard UI | P0 | XL |
| FEAT-04-03 | Search Fallback & Empty States | P0 | L |

### Deliverables

- POST AI search with scores/reasons; timeout/error envelope; rate limit
- SCR-SEARCH-STD: loading, filters, grid/list, pagination, favorite control
- SCR-SEARCH-FB fallback banner + filter results
- SCR-SEARCH-EMPTY guidance, refine CTAs, chips
- Gemini key server-side only

### Dependencies

- Sprint 0 API client; Sprint 3 property corpus
- Gemini API credentials
- OpenAPI search contracts

### Risks

| Risk | Mitigation |
|------|------------|
| Gemini latency/quota | Timeouts + mandatory fallback UI |
| NL parsing quality | Seed fixtures; log structured failures |
| Scope into non-Gemini providers | Forbidden |

### Definition of Done

- [ ] FR-SEARCH-001–013 pass
- [ ] All three search HTML references verified vs screenshots
- [ ] AI failure path demoed to QA
- [ ] Real Gemini integration (no fake scores in production path)
- [ ] Constitution §14; QA approved

---

## Sprint 6 — Public Homepage & Marketing

### Goals

- Pixel-faithful SCR-HOME with hero search, featured, journey, testimonials.
- Wire search chips/submit into Sprint 5 search; lead capture entry.

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-03-01 | Homepage Shell & Marketing Sections | P0 | L |
| FEAT-03-02 | Homepage Lead Capture Entry | P1 | S |

### Deliverables

- SCR-HOME full layout per HTML/screenshot
- Suggestion chips → `/search`
- Featured property cards (from API/CMS)
- Contact/lead form submission where HTML provides
- Chat widget shell may mount placeholder until Sprint 9 (must not look broken; prefer wiring FEAT-12-01 if capacity)

### Dependencies

- Sprint 5 search route
- Sprint 3 featured properties
- FEAT-09-01 lead create (minimal API acceptable)
- CMS optional (full CMS Sprint 10)—static/seed content OK interim

### Risks

| Risk | Mitigation |
|------|------------|
| Waiting on CMS | Seed homepage content; swap to CMS in Sprint 10 |
| Chat incomplete | Document interim; complete in Sprint 9 |

### Definition of Done

- [ ] FR-HOME-001–006 pass (007 may finalize with CMS Sprint 10)
- [ ] SCR-HOME UI Guide checklist complete
- [ ] Search and featured navigation work end-to-end
- [ ] Constitution §14; QA approved

---

## Sprint 7 — CRM Leads + Visit Scheduling

### Goals

- Lead capture, list, MVP lead detail (no Kanban/timeline/reminders).
- Schedule visit from property and lead surfaces.

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-09-01 | Lead Capture & List | P0 | L |
| FEAT-09-02 | Lead Detail MVP Subset | P0 | XL |
| FEAT-10-01 | Schedule Visit | P1 | M |

### Deliverables

- Lead APIs + Agent/Admin list + Add Lead modal
- SCR-LEAD-D MVP: contact, stage, interests, notes, schedule, call/email
- ScheduleVisitModal flow; visit_request persistence
- **No** Kanban nav; **no** timeline/reminder product backends

### Dependencies

- Sprint 1 auth roles
- Sprint 4 property CTAs
- UI Guide SCR-LEAD-D (MVP subset notes)

### Risks

| Risk | Mitigation |
|------|------------|
| HTML shows timeline/reminders | Preserve layout fidelity without shipping excluded systems; hide/disable per Constitution |
| Kanban pressure | EPIC-F01 only; ban from MVP nav |

### Definition of Done

- [ ] FR-CRM-001–010 pass; FR-CRM-011–015 absent from product
- [ ] SCR-LEAD-D MVP checklist; no Kanban link
- [ ] Notes + stage persist; schedule creates visit
- [ ] Constitution §14; QA approved

---

## Sprint 8 — Favorites & Customer Portal

### Goals

- Favorites + saved searches; customer dashboard SCR-CUS-DASH.

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-06-01 | Favorites | P1 | M |
| FEAT-06-02 | Saved Searches | P2 | M |
| FEAT-11-01 | Customer Dashboard | P1 | L |

### Deliverables

- Favorite/unfavorite from search, detail, dashboard
- Guest favorite → login prompt
- SCR-CUS-DASH: profile, stats, saved grid, requirements editor, inquiry history list, quick actions, notifications bell entry
- Inquiry history as list (not activity-timeline product)

### Dependencies

- Sprint 1 auth; Sprint 5–7 search/leads
- Notifications list can be empty until Sprint 10 (bell UI present)

### Risks

| Risk | Mitigation |
|------|------------|
| Timeline product creep on dashboard | Inquiry list only |
| Saved searches lower priority | Ship FEAT-06-01 + FEAT-11-01 first; FEAT-06-02 if capacity |

### Definition of Done

- [ ] FR-CUS-001–006 pass; rich timeline not shipped
- [ ] SCR-CUS-DASH checklist; favorites persist after reload
- [ ] Constitution §14; QA approved

---

## Sprint 9 — AI Chat, Loan Analysis & AI Config

### Goals

- Gemini chatbot on homepage; loan analysis with formula fallback; admin AI config + preview.

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-12-01 | AI Chatbot Widget | P0 | L |
| FEAT-12-02 | Loan Analysis | P1 | M |
| FEAT-13-01 | AI Config Admin UI | P1 | L |

### Deliverables

- Chat open/close, send, greeting from config; loading/error
- Loan analysis modal; formula fallback on Gemini fail
- SCR-AI-CFG: FAQ, escalation/hours, tone/prompt, preview, save
- No LLM provider switcher

### Dependencies

- Sprint 0 Gemini server wiring; Sprint 6 homepage mount point
- Auth for admin config (Sprint 1–2)

### Risks

| Risk | Mitigation |
|------|------------|
| Chat cost/abuse | Rate limits; server-only keys |
| Config preview vs production prompt drift | Same service path for preview |

### Definition of Done

- [ ] FR-AI-001–007 pass (health may finalize Sprint 13)
- [ ] SCR-AI-CFG + homepage chat HTML behaviors verified
- [ ] Formula fallback demoed
- [ ] Constitution §14; QA approved

---

## Sprint 10 — Notifications + CMS

### Goals

- In-app + email notifications; admin rules; CMS for homepage/pages.

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-14-01 | In-App Notifications | P1 | M |
| FEAT-14-02 | Email Notifications & Rules | P1 | L |
| FEAT-15-01 | CMS Pages Admin & Public | P2 | M |

### Deliverables

- Notifications dropdown; unread; mark read
- Email on key events (e.g. new lead) when rules enabled
- AdminNotificationRulesView (email + in-app only)
- CMS admin + public consume; homepage FR-HOME-007 finalized
- **Absent:** SMS / WhatsApp / Push

### Dependencies

- Sprint 7 leads for notification events
- Sprint 6 homepage for CMS content swap
- Email provider credentials

### Risks

| Risk | Mitigation |
|------|------------|
| Email deliverability | Dev catcher (Mailhog/Ethereal); document prod later |
| Channel scope creep | Constitution channel ban |

### Definition of Done

- [ ] FR-PLT-001–004 pass; FR-PLT-005 absent
- [ ] Bell works on customer/admin shells
- [ ] CMS-driven homepage content verified
- [ ] Constitution §14; QA approved

---

## Sprint 11 — Bulk Property Upload

### Goals

- Admin bulk upload with validation results UI and import-valid-only.

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-08-01 | Bulk Upload Validate & Import | P1 | L |

### Deliverables

- Upload → validate → SCR-BULK summary + error table
- Download error CSV
- Import valid rows only; fix & re-upload path
- Link from inventory admin

### Dependencies

- Sprint 3 property schema/APIs
- UI Guide SCR-BULK

### Risks

| Risk | Mitigation |
|------|------------|
| Large file / partial failure | Clear session model; transactional import of valid set |
| Ambiguous CSV schema | Publish template + field docs in Technical Design |

### Definition of Done

- [ ] FR-BULK-001–006 pass
- [ ] SCR-BULK pixel + states checklist
- [ ] Re-upload and error report demoed
- [ ] Constitution §14; QA approved

---

## Sprint 12 — Admin Command Center & Reports

### Goals

- SCR-CMD KPIs/charts/feed/date range; Admin reports view.
- Keep feed distinct from excluded CRM timeline product.

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-16-01 | Command Center Dashboard | P1 | XL |
| FEAT-16-02 | Admin Reports View | P2 | M |

### Deliverables

- KPI cards + trends; lead source funnel; property views; stage distribution
- Recent activity feed with filters + date range
- AdminReportsView
- Metrics snapshots/APIs populated from prior domain data
- **Absent:** Tasks view (FR-ADM-008 FUTURE); Kanban

### Dependencies

- Leads, properties, view events from prior sprints
- Seed/metrics job or on-read aggregations

### Risks

| Risk | Mitigation |
|------|------------|
| Empty charts | Seed view events + leads; document empty states |
| Confusing feed with timeline product | Label as command-center feed only |

### Definition of Done

- [ ] FR-ADM-001–007 pass; FR-ADM-008 not shipped
- [ ] SCR-CMD UI Guide checklist
- [ ] Role gating for Agent subset vs Admin
- [ ] Constitution §14; QA approved

---

## Sprint 13 — Harden, UX Cross-Cut & Ship MVP

### Goals

- Close cross-cutting UX/a11y, health/deploy, and remaining DoD gaps.
- MVP release candidate: no Out-of-MVP navigation; mocks gone; fidelity pass.

### Features

| ID | Name | Priority | Complexity |
|----|------|----------|------------|
| FEAT-18-01 | Shared UX States & A11y Baseline | P0 | L |
| FEAT-18-02 | Health, Observability & Frontend Deploy | P1 | S |

### Deliverables

- Full pass of loading/empty/error/hover/focus/responsive across all MVP screens
- Accessibility baseline (labels, focus, alt, contrast tokens)
- Health/ops smoke; Vercel frontend deploy path
- Regression: search AI fallback, auth roles, no Kanban/SMS/video/tour/timeline/reminders
- Bug-fix buffer from prior sprints
- MVP RC tagged for PO acceptance

### Dependencies

- All Sprint 0–12 MVP features merged or explicitly deferred by PO
- UI Implementation Guide for every SCR-*

### Risks

| Risk | Mitigation |
|------|------------|
| Late fidelity debt | Screen Completion Policy gates merge |
| Scope reopening Future epics | PO written waiver required; default deny |

### Definition of Done

- [ ] FEAT-18-01 / FEAT-18-02 acceptance criteria pass
- [ ] Every MVP SCR-* Screen Completion checklist complete
- [ ] Constitution §14 + release checklist: no Out-of-MVP in nav/flows
- [ ] No remaining mocks for completed features
- [ ] >80% unit coverage on core business logic (NFR) or PO-waived gaps listed
- [ ] Frontend deployable to Vercel; health green
- [ ] Code reviewed; QA approved; PO accepts MVP RC

---

## 3. Capacity Notes

- XL features (inventory, detail, search standard, lead detail, command center) dominate their sprints—avoid stacking a second XL in the same sprint.
- If velocity is lower: split Sprint 3 (inventory vs editor/media), Sprint 5 (API vs UI), Sprint 7 (list vs detail), Sprint 12 (dashboard vs reports) into follow-on micro-sprints with PO approval.
- Future epics EPIC-F01…F06 are **not** scheduled.

## 4. Traceability — Features → Sprint

| Feature | Sprint |
|---------|--------|
| FEAT-00-01 … 00-03 | 0 |
| FEAT-01-01 … 01-02 | 1 |
| FEAT-02-01 … 02-02 | 2 |
| FEAT-07-01 … 07-03 | 3 |
| FEAT-05-01, 05-02, FEAT-17-01 | 4 |
| FEAT-04-01 … 04-03 | 5 |
| FEAT-03-01 … 03-02 | 6 |
| FEAT-09-01 … 09-02, FEAT-10-01 | 7 |
| FEAT-06-01 … 06-02, FEAT-11-01 | 8 |
| FEAT-12-01 … 12-02, FEAT-13-01 | 9 |
| FEAT-14-01 … 14-02, FEAT-15-01 | 10 |
| FEAT-08-01 | 11 |
| FEAT-16-01 … 16-02 | 12 |
| FEAT-18-01 … 18-02 | 13 |
| FEAT-F* | Not scheduled |

## 5. Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | MVP Sprint 0–13 from Epics/Features order |

---

**End of Sprint Plan**
