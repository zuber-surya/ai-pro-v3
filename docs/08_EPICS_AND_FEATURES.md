# PropVista CRM / Property AI Studio — Epics, Features & Stories

| Field | Value |
|-------|--------|
| **Document** | Product Backlog Decomposition |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **Governance** | `docs/00_PROJECT_CONSTITUTION.md` (Epic → Feature → … → Merge) |
| **Functional SOT** | `docs/REQUIREMENTS_AND_PROPOSAL.md` |
| **UI SOT** | `docs/design_reference/**` |
| **Traceability** | PRD §10 FRs, UI Implementation Guide SCR-* |

## 1. How to Use

1. Follow Constitution lifecycle: Epic → Feature → Technical Design → DB → APIs → (Mock) → Frontend → Real API → Test → UI Verification → Approval → Merge.
2. Feature is Ready only when Definition of Ready (§13) is satisfied.
3. **Out-of-MVP** epics/features must not ship in MVP navigation or misleading partial UIs.
4. Complexity: **S** (1–3d) · **M** (3–7d) · **L** (1–2w) · **XL** (2w+).
5. Priority: **P0** critical path · **P1** MVP required · **P2** MVP secondary · **FUTURE** post-MVP / excluded.

## 2. Epic Index

| Epic | Name | Scope | Roles |
|------|------|-------|-------|
| EPIC-00 | Platform Foundation | MVP | Engineers |
| EPIC-01 | Authentication & Session | MVP | All |
| EPIC-02 | Users & Agents Admin | MVP | Admin, Super Admin |
| EPIC-03 | Public Homepage & Marketing | MVP | Guest+ |
| EPIC-04 | AI Search & Discovery | MVP | Guest+ |
| EPIC-05 | Public Property Details | MVP | Guest+ |
| EPIC-06 | Favorites & Saved Searches | MVP | Customer (+ Guest CTA) |
| EPIC-07 | Property Inventory & Listing Editor | MVP | Agent, Admin, Super Admin |
| EPIC-08 | Bulk Property Upload | MVP | Admin, Super Admin |
| EPIC-09 | CRM Leads (List + Detail) | MVP | Agent, Admin, Super Admin |
| EPIC-10 | Visit Scheduling | MVP | Customer, Agent, Admin |
| EPIC-11 | Customer Portal | MVP | Customer |
| EPIC-12 | AI Chat & Loan Analysis | MVP | Guest+, Customer |
| EPIC-13 | AI Chatbot Configuration | MVP | Admin, Super Admin |
| EPIC-14 | Notifications (Email + In-App) | MVP | Authenticated; Admin rules |
| EPIC-15 | CMS | MVP | Admin write; public read |
| EPIC-16 | Admin Command Center & Reports | MVP | Agent subset, Admin, Super Admin |
| EPIC-17 | Maps (Leaflet + OSM) | MVP | Public |
| EPIC-18 | Cross-Cutting UX, Health & Deploy | MVP | All |
| EPIC-F01 | Lead Kanban Pipeline | FUTURE / EXCLUDED-MVP | — |
| EPIC-F02 | Activity Timeline Product | FUTURE / EXCLUDED-MVP | — |
| EPIC-F03 | Reminders & Automation | FUTURE / EXCLUDED-MVP | — |
| EPIC-F04 | Virtual Tours & Video Upload | FUTURE / EXCLUDED-MVP | — |
| EPIC-F05 | SMS / WhatsApp / Push | FUTURE / EXCLUDED-MVP | — |
| EPIC-F06 | Advanced CRM (Contacts / Opportunity) | FUTURE | — |

## 3. Global Out of Scope (MVP)

Per Constitution: Kanban; activity timeline product; reminder system; automation engines; virtual tours; video upload; SMS; WhatsApp; push; alternate LLMs; module-level permissions; multi-org.

---

## EPIC-00: Platform Foundation

| Field | Value |
|-------|--------|
| **Business outcome** | Runnable stack: Next.js 15, Express, Prisma, PostgreSQL, tokens, API client, feature folders |
| **In scope** | Scaffold, DESIGN.md tokens, shared primitives, centralized lib/api, health |
| **Out of scope** | Product screens; alternate stacks |
| **Roles impacted** | Engineers |
| **Design references** | propvista_crm/DESIGN.md; search icon asset |
| **Success metrics** | Both apps boot; health OK; tokens applied; no business logic in UI |
| **Dependencies / risks** | Constitution §5 stack lock |

### FEAT-00-01: Repo & Stack Scaffold

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-00-01 |
| **Parent Epic** | EPIC-00 |
| **Description** | Initialize frontend/backend per Constitution mandatory stack with TypeScript strict and Prisma. |
| **Priority** | P0 |
| **Dependencies** | None |
| **Estimated Complexity** | M |
| **HTML / Screens** | n/a (infra) |
| **APIs** | GET /api/v1/health |

**Acceptance Criteria**
- [ ] Next.js 15 App Router + React 19 frontend boots
- [ ] Express + Prisma + PostgreSQL backend boots
- [ ] Strict TypeScript + ESLint configured
- [ ] Feature-based folder layout present

**Stories**
- STORY-00-01-01 As a developer, I can clone and run frontend/backend with documented env vars.
- STORY-00-01-02 As a developer, I have Prisma baseline schema and migrate command.
- STORY-00-01-03 As a developer, health endpoint is available for smoke checks.

### FEAT-00-02: Design Tokens & Shared UI Primitives

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-00-02 |
| **Parent Epic** | EPIC-00 |
| **Description** | Port DESIGN.md tokens and shared Button/Input/Modal/Loader/Empty/Error primitives matching HTML. |
| **Priority** | P0 |
| **Dependencies** | FEAT-00-01 |
| **Estimated Complexity** | M |
| **HTML / Screens** | propvista_crm/DESIGN.md; AST search icon |
| **APIs** | n/a |

**Acceptance Criteria**
- [ ] CSS variables/tokens match DESIGN.md
- [ ] Shared primitives do not invent a new visual language
- [ ] Search magnifying-glass asset available where HTML uses it

**Stories**
- STORY-00-02-01 As a developer, I can use brand tokens from DESIGN.md.
- STORY-00-02-02 As a developer, shared Loader/Empty/Error match Constitution state rules.

### FEAT-00-03: Centralized API Client & Auth Shell

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-00-03 |
| **Parent Epic** | EPIC-00 |
| **Description** | Typed API modules and JWT refresh interceptors; components never call fetch directly. |
| **Priority** | P0 |
| **Dependencies** | FEAT-00-01 |
| **Estimated Complexity** | M |
| **HTML / Screens** | n/a |
| **APIs** | client infrastructure |

**Acceptance Criteria**
- [ ] All HTTP goes through lib/api
- [ ] Access/refresh handling ready for EPIC-01
- [ ] Error envelope mapping consistent with OpenAPI

**Stories**
- STORY-00-03-01 As a developer, feature hooks call API modules only.
- STORY-00-03-02 As a developer, 401 triggers refresh flow contract.

## EPIC-01: Authentication & Session

| Field | Value |
|-------|--------|
| **Business outcome** | Email/password register, login, logout, JWT session, role enforcement, protected routes |
| **In scope** | FR-AUTH-001–004, 007 |
| **Out of scope** | Social login; module permissions |
| **Roles impacted** | Guest, Customer, Agent, Admin, Super Admin |
| **Design references** | Login/register (Requirements); homepage Sign In / Join AI Pro |
| **Success metrics** | Role-gated routes; hashed passwords; refresh tokens |
| **Dependencies / risks** | EPIC-00 |

### FEAT-01-01: Register & Login

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-01-01 |
| **Parent Epic** | EPIC-01 |
| **Description** | Email+password registration and login with validation and safe errors. |
| **Priority** | P0 |
| **Dependencies** | FEAT-00-03 |
| **Estimated Complexity** | M |
| **HTML / Screens** | Login/register (Requirements) |
| **APIs** | POST /auth/register, POST /auth/token (login) |

**Acceptance Criteria**
- [ ] User can register with email/password
- [ ] Passwords hashed at rest
- [ ] Invalid credentials return safe errors
- [ ] Login issues access + refresh tokens

**Stories**
- STORY-01-01-01 As a Guest, I can register with email and password.
- STORY-01-01-02 As a user, I can log in and receive a JWT session.
- STORY-01-01-03 As a user, validation errors show inline per UX rules.

### FEAT-01-02: Session, Logout & Route Guards

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-01-02 |
| **Parent Epic** | EPIC-01 |
| **Description** | Refresh token use, logout revoke, FE/BE route guards by role. |
| **Priority** | P0 |
| **Dependencies** | FEAT-01-01 |
| **Estimated Complexity** | M |
| **HTML / Screens** | SCR-HOME CTAs |
| **APIs** | POST /auth/refresh, POST /auth/logout |

**Acceptance Criteria**
- [ ] Protected routes redirect unauthenticated users
- [ ] Role mismatch returns 403
- [ ] Logout invalidates refresh token
- [ ] Homepage Sign In / Join AI Pro navigate correctly

**Stories**
- STORY-01-02-01 As a user, I can log out and lose session.
- STORY-01-02-02 As a Customer, I cannot open Admin routes.
- STORY-01-02-03 As Guest, protected customer routes redirect to login.

## EPIC-02: Users & Agents Admin

| Field | Value |
|-------|--------|
| **Business outcome** | Admins manage users and agent profiles using role string only |
| **In scope** | FR-AUTH-005–006 |
| **Out of scope** | Module permission matrix; multi-org |
| **Roles impacted** | Admin, Super Admin |
| **Design references** | AdminUsersView, AdminAgentsView (Requirements) |
| **Success metrics** | CRUD with server-side role checks |
| **Dependencies / risks** | EPIC-01 |

### FEAT-02-01: User Administration

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-02-01 |
| **Parent Epic** | EPIC-02 |
| **Description** | List/create/update/deactivate users; assign one of five roles. |
| **Priority** | P1 |
| **Dependencies** | FEAT-01-02 |
| **Estimated Complexity** | M |
| **HTML / Screens** | Admin users view (Requirements) |
| **APIs** | CRUD /users |

**Acceptance Criteria**
- [ ] Admin can list users with pagination
- [ ] Admin can create/update/deactivate users
- [ ] Only five roles assignable
- [ ] Non-admin cannot access APIs

**Stories**
- STORY-02-01-01 As Admin, I can manage user accounts.
- STORY-02-01-02 As Super Admin, I can assign Admin role.

### FEAT-02-02: Agent Profiles

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-02-02 |
| **Parent Epic** | EPIC-02 |
| **Description** | Manage agent name, email, phone, image for listing contact cards. |
| **Priority** | P1 |
| **Dependencies** | FEAT-02-01 |
| **Estimated Complexity** | M |
| **HTML / Screens** | Admin agents view |
| **APIs** | CRUD /agents |

**Acceptance Criteria**
- [ ] Admin can CRUD agents
- [ ] Agent image uses local storage in development
- [ ] Property details can resolve agent card

**Stories**
- STORY-02-02-01 As Admin, I can create and edit agent profiles.
- STORY-02-02-02 As Guest, I see agent card data on published properties.

## EPIC-03: Public Homepage & Marketing

| Field | Value |
|-------|--------|
| **Business outcome** | Pixel-faithful homepage: hero AI search, featured, journey, testimonials, chat entry |
| **In scope** | FR-HOME-001–007; SCR-HOME |
| **Out of scope** | Redesign; Out-of-MVP widgets |
| **Roles impacted** | Guest+ |
| **Design references** | propvista_crm_homepage |
| **Success metrics** | UI Guide SCR-HOME checklist complete |
| **Dependencies / risks** | EPIC-00; EPIC-04 search; EPIC-12 chat; EPIC-15 CMS |

### FEAT-03-01: Homepage Shell & Marketing Sections

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-03-01 |
| **Parent Epic** | EPIC-03 |
| **Description** | Header, hero, chips, featured grid, how-it-works, testimonials, footer per HTML. |
| **Priority** | P0 |
| **Dependencies** | FEAT-00-02 |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-HOME code.html + screen.png |
| **APIs** | GET featured properties; GET cms homepage |

**Acceptance Criteria**
- [ ] Layout matches screen.png at desktop
- [ ] Suggestion chips populate search
- [ ] Featured cards show image/price/beds/baths/location/save
- [ ] Journey + testimonials sections present
- [ ] Responsive per HTML

**Stories**
- STORY-03-01-01 As Guest, I see PropVista branding as a hero-level signal.
- STORY-03-01-02 As Guest, I can click suggestion chips into search.
- STORY-03-01-03 As Guest, I see featured property cards.

### FEAT-03-02: Homepage Lead Capture Entry

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-03-02 |
| **Parent Epic** | EPIC-03 |
| **Description** | Contact/lead capture where HTML/design-details provide forms. |
| **Priority** | P1 |
| **Dependencies** | FEAT-03-01, FEAT-09-01 |
| **Estimated Complexity** | S |
| **HTML / Screens** | SCR-HOME / design-details forms |
| **APIs** | POST /leads |

**Acceptance Criteria**
- [ ] Submit creates lead via API
- [ ] Validation errors inline
- [ ] Success confirmation shown

**Stories**
- STORY-03-02-01 As Guest, I can submit a contact/lead form from a public surface.

## EPIC-04: AI Search & Discovery

| Field | Value |
|-------|--------|
| **Business outcome** | NLP search via Gemini with standard, fallback, and empty UI states on one route |
| **In scope** | FR-SEARCH-001–013; SCR-SEARCH-STD/FB/EMPTY |
| **Out of scope** | Non-Gemini providers |
| **Roles impacted** | Guest+ |
| **Design references** | search_results_standard_view; filter_fallback_view; empty_state |
| **Success metrics** | AI failure never dead-ends; scores/reasons when AI succeeds |
| **Dependencies / risks** | EPIC-00; property data; Gemini secrets |

### FEAT-04-01: NLP Search API (Gemini)

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-04-01 |
| **Parent Epic** | EPIC-04 |
| **Description** | Parse NL query to filters + ranked properties with match score/reasons; timeout + error signaling. |
| **Priority** | P0 |
| **Dependencies** | FEAT-00-01, property data |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-SEARCH-STD |
| **APIs** | POST /search (AI) |

**Acceptance Criteria**
- [ ] POST search returns ranked results with scores when Gemini OK
- [ ] Timeout/error returns structured failure for FE fallback
- [ ] Gemini key never sent to browser
- [ ] Rate limiting on AI search

**Stories**
- STORY-04-01-01 As Guest, my NL query returns matching properties with scores.
- STORY-04-01-02 As system, Gemini failure is detectable by FE without a blank page.

### FEAT-04-02: Search Results Standard UI

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-04-02 |
| **Parent Epic** | EPIC-04 |
| **Description** | Implement SCR-SEARCH-STD: loading, scores, reasons, filters, grid/list, pagination, favorites. |
| **Priority** | P0 |
| **Dependencies** | FEAT-04-01, FEAT-00-02 |
| **Estimated Complexity** | XL |
| **HTML / Screens** | SCR-SEARCH-STD |
| **APIs** | POST /search; favorites |

**Acceptance Criteria**
- [ ] UI matches standard HTML/screenshot
- [ ] Loading state per HTML
- [ ] Filters for type/price/beds/amenities work
- [ ] Grid/list toggle + pagination
- [ ] Favorite control on cards

**Stories**
- STORY-04-02-01 As Guest, I see AI match % and reasons.
- STORY-04-02-02 As Guest, I can filter and paginate results.
- STORY-04-02-03 As Customer, I can favorite from results.

### FEAT-04-03: Search Fallback & Empty States

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-04-03 |
| **Parent Epic** | EPIC-04 |
| **Description** | Wire SCR-SEARCH-FB and SCR-SEARCH-EMPTY to AI failure and zero results. |
| **Priority** | P0 |
| **Dependencies** | FEAT-04-02 |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-SEARCH-FB; SCR-SEARCH-EMPTY |
| **APIs** | filter-only search path |

**Acceptance Criteria**
- [ ] AI fail shows fallback banner + filter results
- [ ] Empty shows guidance, refine CTAs, chips per HTML
- [ ] Reset Search works
- [ ] No blank dead-end

**Stories**
- STORY-04-03-01 As Guest, when AI fails I see the fallback view.
- STORY-04-03-02 As Guest, when zero matches I see the empty state.

## EPIC-05: Public Property Details

| Field | Value |
|-------|--------|
| **Business outcome** | Premium property detail with gallery, floorplan, map, agent, CTAs |
| **In scope** | FR-PROP-D-001–011; SCR-PROP-D (no virtual tour/video) |
| **Out of scope** | Video upload; virtual tours |
| **Roles impacted** | Guest+ |
| **Design references** | property_details_premium_view |
| **Success metrics** | UI Guide SCR-PROP-D complete |
| **Dependencies / risks** | EPIC-07 data; EPIC-17; EPIC-06; EPIC-09; EPIC-10 |

### FEAT-05-01: Property Detail Page

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-05-01 |
| **Parent Epic** | EPIC-05 |
| **Description** | Gallery, floorplan, overview, amenities, price breakdown, similar, landmarks sections. |
| **Priority** | P0 |
| **Dependencies** | property read API, FEAT-00-02 |
| **Estimated Complexity** | XL |
| **HTML / Screens** | SCR-PROP-D |
| **APIs** | GET /properties/:id |

**Acceptance Criteria**
- [ ] Loads by id with all HTML sections except excluded media types
- [ ] Gallery/carousel works
- [ ] Similar properties carousel
- [ ] 404/error states
- [ ] Pixel checklist SCR-PROP-D

**Stories**
- STORY-05-01-01 As Guest, I can open a property and see gallery and details.
- STORY-05-01-02 As Guest, I see floorplan and amenities.
- STORY-05-01-03 As Guest, I see similar properties.

### FEAT-05-02: Detail CTAs (Inquire / Contact / Schedule / Favorite)

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-05-02 |
| **Parent Epic** | EPIC-05 |
| **Description** | Wire Inquire, Contact agent, Schedule tour, and Favorite controls. |
| **Priority** | P0 |
| **Dependencies** | FEAT-05-01, FEAT-09-01, FEAT-10-01, FEAT-06-01 |
| **Estimated Complexity** | M |
| **HTML / Screens** | SCR-PROP-D CTAs |
| **APIs** | POST /leads; POST /visits; favorites |

**Acceptance Criteria**
- [ ] Inquire creates lead
- [ ] Schedule opens ScheduleVisitModal flow
- [ ] tel/mailto or equivalent for contact
- [ ] Favorite toggles for authenticated Customer

**Stories**
- STORY-05-02-01 As Guest/Customer, I can inquire about a property.
- STORY-05-02-02 As Customer, I can schedule a tour.
- STORY-05-02-03 As Customer, I can save the property.

## EPIC-06: Favorites & Saved Searches

| Field | Value |
|-------|--------|
| **Business outcome** | Save/unsave properties; saved searches from customer dashboard |
| **In scope** | Favorites API; customer grid; search/detail save controls |
| **Out of scope** | n/a |
| **Roles impacted** | Customer (Guest prompted to auth) |
| **Design references** | SCR-CUS-DASH; search/detail hearts |
| **Success metrics** | Favorites persist; remove works |
| **Dependencies / risks** | EPIC-01 |

### FEAT-06-01: Favorites

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-06-01 |
| **Parent Epic** | EPIC-06 |
| **Description** | Toggle and list favorites for Customer. |
| **Priority** | P1 |
| **Dependencies** | FEAT-01-02 |
| **Estimated Complexity** | M |
| **HTML / Screens** | SCR-CUS-DASH; search/detail controls |
| **APIs** | favorites CRUD |

**Acceptance Criteria**
- [ ] Authenticated user can favorite/unfavorite
- [ ] List appears on customer dashboard
- [ ] Guest favorite prompts login

**Stories**
- STORY-06-01-01 As Customer, I can save and remove properties.
- STORY-06-01-02 As Guest, favorite prompts authentication.

### FEAT-06-02: Saved Searches

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-06-02 |
| **Parent Epic** | EPIC-06 |
| **Description** | Store and reopen saved search criteria from customer quick actions. |
| **Priority** | P2 |
| **Dependencies** | FEAT-04-02, FEAT-11-01 |
| **Estimated Complexity** | M |
| **HTML / Screens** | SCR-CUS-DASH quick actions |
| **APIs** | saved-searches |

**Acceptance Criteria**
- [ ] Customer can save current search
- [ ] Customer can reopen saved search on /search
- [ ] Delete saved search

**Stories**
- STORY-06-02-01 As Customer, I can save and reopen a search.

## EPIC-07: Property Inventory & Listing Editor

| Field | Value |
|-------|--------|
| **Business outcome** | Agents/Admins manage listings via inventory grid + basic info editor + media |
| **In scope** | FR-PROP-M-001–006, 008–015 |
| **Out of scope** | FR-PROP-M-007 video/virtual tour |
| **Roles impacted** | Agent, Admin, Super Admin |
| **Design references** | property_inventory_admin_view; listing_editor_basic_info |
| **Success metrics** | Draft/Publish; inventory ops; local media in dev |
| **Dependencies / risks** | EPIC-01; EPIC-02 agents |

### FEAT-07-01: Property Inventory Admin View

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-07-01 |
| **Parent Epic** | EPIC-07 |
| **Description** | Grid with search, filters, sort, pagination, badges, row/bulk actions, columns, export, empty. |
| **Priority** | P0 |
| **Dependencies** | FEAT-01-02 |
| **Estimated Complexity** | XL |
| **HTML / Screens** | SCR-PROP-INV |
| **APIs** | GET/PATCH/DELETE /properties; export |

**Acceptance Criteria**
- [ ] Matches SCR-PROP-INV HTML
- [ ] Search/filter/sort/paginate
- [ ] Edit/duplicate/archive/delete
- [ ] Bulk select status/export/delete
- [ ] CSV export and empty state

**Stories**
- STORY-07-01-01 As Admin, I can manage the inventory list.
- STORY-07-01-02 As Agent, I see own/assigned listings per rules.
- STORY-07-01-03 As Admin, I can export CSV and bulk update status.

### FEAT-07-02: Listing Editor Basic Info

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-07-02 |
| **Parent Epic** | EPIC-07 |
| **Description** | Create/edit fields, amenities, description/highlights, Save Draft / Publish; exclude video/tour. |
| **Priority** | P0 |
| **Dependencies** | FEAT-07-01 |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-PROP-EDIT |
| **APIs** | POST/PUT /properties |

**Acceptance Criteria**
- [ ] Matches SCR-PROP-EDIT
- [ ] Draft and Publish work
- [ ] Amenities + custom amenity
- [ ] Validation per HTML
- [ ] No virtual tour/video upload UI shipped

**Stories**
- STORY-07-02-01 As Agent, I can create a draft listing.
- STORY-07-02-02 As Agent, I can publish a listing.
- STORY-07-02-03 As Agent, excluded video/tour controls are absent.

### FEAT-07-03: Property Media (Photos + Floorplan)

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-07-03 |
| **Parent Epic** | EPIC-07 |
| **Description** | Upload photos and floorplan; local filesystem in development. |
| **Priority** | P1 |
| **Dependencies** | FEAT-07-02 |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-PROP-EDIT media sections |
| **APIs** | property media endpoints |

**Acceptance Criteria**
- [ ] Photo upload + gallery order
- [ ] Floorplan upload
- [ ] Dev uses local storage
- [ ] Errors surfaced in UI

**Stories**
- STORY-07-03-01 As Agent, I can upload property photos.
- STORY-07-03-02 As Agent, I can upload a floorplan.

## EPIC-08: Bulk Property Upload

| Field | Value |
|-------|--------|
| **Business outcome** | Validate upload, show errors, import valid rows only |
| **In scope** | FR-BULK-001–006; SCR-BULK |
| **Out of scope** | Silent import without validation UI |
| **Roles impacted** | Admin, Super Admin |
| **Design references** | bulk_upload_validation_results |
| **Success metrics** | Summary counts + error table + download report |
| **Dependencies / risks** | EPIC-07 |

### FEAT-08-01: Bulk Upload Validate & Import

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-08-01 |
| **Parent Epic** | EPIC-08 |
| **Description** | Upload file, validate, show SCR-BULK results, import valid, re-upload path. |
| **Priority** | P1 |
| **Dependencies** | FEAT-07-01 |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-BULK |
| **APIs** | bulk upload session APIs |

**Acceptance Criteria**
- [ ] Summary total/valid/error/warning
- [ ] Error table with row/field/message/value/fix
- [ ] Download error CSV
- [ ] Import valid only
- [ ] Fix and re-upload works

**Stories**
- STORY-08-01-01 As Admin, I upload and see validation results.
- STORY-08-01-02 As Admin, I import only valid rows.
- STORY-08-01-03 As Admin, I download an error report.

## EPIC-09: CRM Leads (List + Detail)

| Field | Value |
|-------|--------|
| **Business outcome** | Capture leads; list; detail with notes/stage/schedule — no Kanban/timeline/reminders |
| **In scope** | FR-CRM-001–010 |
| **Out of scope** | FR-CRM-011–015 (Kanban, timeline, reminders, convert, contacts module) |
| **Roles impacted** | Agent, Admin, Super Admin; public capture |
| **Design references** | lead_detail_sarah_jenkins (MVP subset); list from Requirements |
| **Success metrics** | Lead detail UI Guide MVP subset; no nav to Kanban |
| **Dependencies / risks** | EPIC-01; properties |

### FEAT-09-01: Lead Capture & List

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-09-01 |
| **Parent Epic** | EPIC-09 |
| **Description** | Public/property capture + Agent/Admin list + Add Lead modal. |
| **Priority** | P0 |
| **Dependencies** | FEAT-01-02 |
| **Estimated Complexity** | L |
| **HTML / Screens** | capture forms; ClientsView list |
| **APIs** | POST/GET /leads |

**Acceptance Criteria**
- [ ] Capture creates lead with source
- [ ] List paginated for Agent/Admin
- [ ] Add lead modal works
- [ ] No Kanban link in MVP nav

**Stories**
- STORY-09-01-01 As Guest, submitting an inquiry creates a lead.
- STORY-09-01-02 As Agent, I can view and add leads in a list.

### FEAT-09-02: Lead Detail MVP Subset

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-09-02 |
| **Parent Epic** | EPIC-09 |
| **Description** | Header, contact, interests, notes, stage change, schedule, call/email — no timeline/reminder backends. |
| **Priority** | P0 |
| **Dependencies** | FEAT-09-01, FEAT-10-01 |
| **Estimated Complexity** | XL |
| **HTML / Screens** | SCR-LEAD-D (MVP subset) |
| **APIs** | GET/PATCH /leads/:id; notes; visits |

**Acceptance Criteria**
- [ ] Matches SCR-LEAD-D layout for MVP fields
- [ ] Notes timestamped create/list
- [ ] Stage change persists
- [ ] Schedule visit works
- [ ] Timeline/reminder products not shipped
- [ ] Call/email actions present

**Stories**
- STORY-09-02-01 As Agent, I open lead detail and see contact + stage.
- STORY-09-02-02 As Agent, I can add notes and change stage.
- STORY-09-02-03 As Agent, I do not get reminder/timeline product features.

## EPIC-10: Visit Scheduling

| Field | Value |
|-------|--------|
| **Business outcome** | Schedule visit modal/flow from property and lead surfaces |
| **In scope** | FR-CRM-009; ScheduleVisitModal |
| **Out of scope** | Reminder automation |
| **Roles impacted** | Customer, Agent, Admin |
| **Design references** | ScheduleVisitModal; CTAs in SCR-PROP-D / SCR-LEAD-D |
| **Success metrics** | Visit request persisted; confirmation UX |
| **Dependencies / risks** | EPIC-01; properties; leads |

### FEAT-10-01: Schedule Visit

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-10-01 |
| **Parent Epic** | EPIC-10 |
| **Description** | Modal to request/schedule property visit with confirmation. |
| **Priority** | P1 |
| **Dependencies** | FEAT-01-02 |
| **Estimated Complexity** | M |
| **HTML / Screens** | ScheduleVisitModal; SCR-PROP-D; SCR-LEAD-D |
| **APIs** | POST /visits |

**Acceptance Criteria**
- [ ] Modal fields validate
- [ ] Creates visit_request
- [ ] Success/error states
- [ ] Available from property detail and lead detail

**Stories**
- STORY-10-01-01 As Customer, I can schedule a property visit.
- STORY-10-01-02 As Agent, I can schedule from lead detail.

## EPIC-11: Customer Portal

| Field | Value |
|-------|--------|
| **Business outcome** | Customer dashboard: profile, stats, saves, requirements, inquiries, notifications entry |
| **In scope** | FR-CUS-001–006 (inquiry list not rich timeline product) |
| **Out of scope** | FR-CUS-007 rich activity timeline product |
| **Roles impacted** | Customer |
| **Design references** | customer_account_dashboard |
| **Success metrics** | SCR-CUS-DASH checklist |
| **Dependencies / risks** | EPIC-01, 06, 09, 14 |

### FEAT-11-01: Customer Dashboard

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-11-01 |
| **Parent Epic** | EPIC-11 |
| **Description** | Profile, stats, saved grid, requirement editor, inquiry history, quick actions, notifications bell. |
| **Priority** | P1 |
| **Dependencies** | FEAT-06-01, FEAT-01-02 |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-CUS-DASH |
| **APIs** | customer profile; favorites; inquiries; notifications |

**Acceptance Criteria**
- [ ] Matches SCR-CUS-DASH
- [ ] Requirement profile editable
- [ ] Inquiry history list (not timeline product)
- [ ] Quick actions: New search / Edit profile / Saved searches
- [ ] Notifications bell unread

**Stories**
- STORY-11-01-01 As Customer, I see dashboard stats and saved properties.
- STORY-11-01-02 As Customer, I edit requirement profile.
- STORY-11-01-03 As Customer, I view inquiry history.

## EPIC-12: AI Chat & Loan Analysis

| Field | Value |
|-------|--------|
| **Business outcome** | Gemini chatbot widget + loan affordability analysis |
| **In scope** | FR-AI-001, 007–008; homepage widget |
| **Out of scope** | Non-Gemini models |
| **Roles impacted** | Guest+ / Customer |
| **Design references** | Homepage chat widget; loan modal (Requirements) |
| **Success metrics** | Chat works with config greeting; loan has formula fallback |
| **Dependencies / risks** | Gemini; EPIC-13 optional |

### FEAT-12-01: AI Chatbot Widget

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-12-01 |
| **Parent Epic** | EPIC-12 |
| **Description** | Open/close chat, send messages via Gemini, greeting from config. |
| **Priority** | P0 |
| **Dependencies** | FEAT-00-03 |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-HOME chat; AI config greeting |
| **APIs** | POST /chat |

**Acceptance Criteria**
- [ ] Widget matches homepage HTML behavior
- [ ] Messages round-trip Gemini
- [ ] Uses configured welcome text when present
- [ ] Loading/error states
- [ ] Key server-side only

**Stories**
- STORY-12-01-01 As Guest, I can open chat and send a message.
- STORY-12-01-02 As Guest, I see configured greeting.

### FEAT-12-02: Loan Analysis

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-12-02 |
| **Parent Epic** | EPIC-12 |
| **Description** | Gemini loan analysis with formula fallback per Requirements. |
| **Priority** | P1 |
| **Dependencies** | FEAT-00-03 |
| **Estimated Complexity** | M |
| **HTML / Screens** | AILoanAnalysisModal |
| **APIs** | POST /loan-analysis |

**Acceptance Criteria**
- [ ] Modal/flow accepts income/inputs
- [ ] Returns analysis or formula fallback on AI fail
- [ ] No blank failure

**Stories**
- STORY-12-02-01 As Customer, I can run loan analysis.
- STORY-12-02-02 As system, formula fallback runs if Gemini fails.

## EPIC-13: AI Chatbot Configuration

| Field | Value |
|-------|--------|
| **Business outcome** | Admins configure greeting, FAQ, escalation, tone; preview chat |
| **In scope** | FR-AI-002–006; SCR-AI-CFG |
| **Out of scope** | Provider switching |
| **Roles impacted** | Admin, Super Admin |
| **Design references** | ai_chatbot_configuration |
| **Success metrics** | Preview uses saved config; Gemini only |
| **Dependencies / risks** | EPIC-12 |

### FEAT-13-01: AI Config Admin UI

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-13-01 |
| **Parent Epic** | EPIC-13 |
| **Description** | FAQ library, escalation/working hours, tone/prompt, preview chat, save. |
| **Priority** | P1 |
| **Dependencies** | FEAT-12-01 |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-AI-CFG |
| **APIs** | GET/PUT /ai-config |

**Acceptance Criteria**
- [ ] Matches SCR-AI-CFG
- [ ] Save persists ai_configs
- [ ] Preview reflects config
- [ ] No alternate LLM selector

**Stories**
- STORY-13-01-01 As Admin, I configure chatbot greeting and FAQs.
- STORY-13-01-02 As Admin, I preview chat responses.
- STORY-13-01-03 As Admin, I set escalation rules and tone.

## EPIC-14: Notifications (Email + In-App)

| Field | Value |
|-------|--------|
| **Business outcome** | In-app notifications + email for key events; admin rules UI |
| **In scope** | FR-PLT-001–003 |
| **Out of scope** | SMS, WhatsApp, Push |
| **Roles impacted** | All authenticated; Admin for rules |
| **Design references** | NotificationsDropdown; AdminNotificationRulesView |
| **Success metrics** | Unread bell; email on new lead (when configured) |
| **Dependencies / risks** | EPIC-01; EPIC-09 |

### FEAT-14-01: In-App Notifications

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-14-01 |
| **Parent Epic** | EPIC-14 |
| **Description** | List/dropdown, unread indicator, mark read. |
| **Priority** | P1 |
| **Dependencies** | FEAT-01-02 |
| **Estimated Complexity** | M |
| **HTML / Screens** | NotificationsDropdown; SCR-CUS-DASH bell |
| **APIs** | GET/PATCH /notifications |

**Acceptance Criteria**
- [ ] Bell shows unread
- [ ] Dropdown lists notifications
- [ ] Mark read works
- [ ] No SMS/push UI

**Stories**
- STORY-14-01-01 As Customer, I see unread notifications.
- STORY-14-01-02 As Agent, I am notified of a new lead in-app.

### FEAT-14-02: Email Notifications & Rules

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-14-02 |
| **Parent Epic** | EPIC-14 |
| **Description** | Email channel for key events; admin notification rules UI (email + in-app only). |
| **Priority** | P1 |
| **Dependencies** | FEAT-14-01 |
| **Estimated Complexity** | L |
| **HTML / Screens** | AdminNotificationRulesView |
| **APIs** | notification-rules; email sender |

**Acceptance Criteria**
- [ ] Email sent for configured events (e.g. new lead)
- [ ] Admin can view/edit rules for email+in-app only
- [ ] No SMS/WhatsApp/Push channels

**Stories**
- STORY-14-02-01 As Admin, I manage notification rules.
- STORY-14-02-02 As Agent, I receive email on new lead when rule enabled.

## EPIC-15: CMS

| Field | Value |
|-------|--------|
| **Business outcome** | Manage CMS pages/homepage content; public consume |
| **In scope** | FR-PLT-004; FR-HOME-007 |
| **Out of scope** | Unrelated marketing site builders |
| **Roles impacted** | Admin write; public read |
| **Design references** | AdminCMSView (Requirements) |
| **Success metrics** | Homepage can be CMS-influenced |
| **Dependencies / risks** | EPIC-01; EPIC-03 |

### FEAT-15-01: CMS Pages Admin & Public

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-15-01 |
| **Parent Epic** | EPIC-15 |
| **Description** | CRUD CMS pages; public fetch for homepage/static pages. |
| **Priority** | P2 |
| **Dependencies** | FEAT-01-02 |
| **Estimated Complexity** | M |
| **HTML / Screens** | AdminCMSView; SCR-HOME content |
| **APIs** | CMS endpoints |

**Acceptance Criteria**
- [ ] Admin can edit CMS pages
- [ ] Public endpoints return published content
- [ ] Homepage consumes CMS where designed

**Stories**
- STORY-15-01-01 As Admin, I edit homepage CMS content.
- STORY-15-01-02 As Guest, I see published CMS-driven content.

## EPIC-16: Admin Command Center & Reports

| Field | Value |
|-------|--------|
| **Business outcome** | KPIs, charts, activity feed, date range; reports view |
| **In scope** | FR-ADM-001–007; SCR-CMD |
| **Out of scope** | FR-ADM-008 Tasks view (FUTURE); CRM timeline product |
| **Roles impacted** | Admin, Super Admin; Agent subset |
| **Design references** | admin_agent_command_center; AdminReportsView |
| **Success metrics** | SCR-CMD checklist; feed != CRM timeline product |
| **Dependencies / risks** | metrics; leads; properties |

### FEAT-16-01: Command Center Dashboard

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-16-01 |
| **Parent Epic** | EPIC-16 |
| **Description** | KPI cards, funnel, views chart, stage distribution, feed, date range. |
| **Priority** | P1 |
| **Dependencies** | metrics APIs, FEAT-01-02 |
| **Estimated Complexity** | XL |
| **HTML / Screens** | SCR-CMD |
| **APIs** | metrics endpoints |

**Acceptance Criteria**
- [ ] Matches SCR-CMD
- [ ] KPIs + trends
- [ ] Charts render
- [ ] Feed filters + date range
- [ ] Role-gated

**Stories**
- STORY-16-01-01 As Admin, I see KPIs and charts for selected range.
- STORY-16-01-02 As Admin, I filter the recent activity feed.

### FEAT-16-02: Admin Reports View

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-16-02 |
| **Parent Epic** | EPIC-16 |
| **Description** | Reports view per Requirements AdminReportsView. |
| **Priority** | P2 |
| **Dependencies** | FEAT-16-01 |
| **Estimated Complexity** | M |
| **HTML / Screens** | AdminReportsView |
| **APIs** | metrics/reports |

**Acceptance Criteria**
- [ ] Reports view accessible to Admin
- [ ] Data consistent with metrics
- [ ] Loading/empty/error states

**Stories**
- STORY-16-02-01 As Admin, I open reports view and see metrics summaries.

## EPIC-17: Maps (Leaflet + OSM)

| Field | Value |
|-------|--------|
| **Business outcome** | Property map with landmarks using Leaflet + OSM only |
| **In scope** | FR-PROP-D-005, 011 |
| **Out of scope** | Alternate map SDKs as primary |
| **Roles impacted** | Public |
| **Design references** | SCR-PROP-D map section |
| **Success metrics** | Lazy-loaded map; landmark markers |
| **Dependencies / risks** | EPIC-05 |

### FEAT-17-01: Property Map & Landmarks

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-17-01 |
| **Parent Epic** | EPIC-17 |
| **Description** | Leaflet map on detail; nearby landmarks from data model. |
| **Priority** | P1 |
| **Dependencies** | FEAT-05-01 |
| **Estimated Complexity** | M |
| **HTML / Screens** | SCR-PROP-D map |
| **APIs** | property landmarks in GET detail |

**Acceptance Criteria**
- [ ] Leaflet + OSM only
- [ ] Lazy-load on detail
- [ ] Landmarks shown when data exists
- [ ] No layout break if map fails (error/empty)

**Stories**
- STORY-17-01-01 As Guest, I see property location on Leaflet map.
- STORY-17-01-02 As Guest, I see nearby landmarks when available.

## EPIC-18: Cross-Cutting UX, Health & Deploy

| Field | Value |
|-------|--------|
| **Business outcome** | Shared loading/empty/error; health; Vercel FE deploy; a11y baseline |
| **In scope** | FR-UX-001–005; FR-AI-008; NFR deploy |
| **Out of scope** | Redesign |
| **Roles impacted** | All |
| **Design references** | All SCR-* states |
| **Success metrics** | Constitution DoD UX gates |
| **Dependencies / risks** | EPIC-00 |

### FEAT-18-01: Shared UX States & A11y Baseline

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-18-01 |
| **Parent Epic** | EPIC-18 |
| **Description** | Enforce loading/empty/error/hover/focus/responsive patterns across screens. |
| **Priority** | P0 |
| **Dependencies** | FEAT-00-02 |
| **Estimated Complexity** | L |
| **HTML / Screens** | All SCR-* |
| **APIs** | n/a |

**Acceptance Criteria**
- [ ] Every MVP screen has loading/empty/error per UI Guide
- [ ] Keyboard focus visible
- [ ] Labels/alt text baseline
- [ ] Responsive matches HTML

**Stories**
- STORY-18-01-01 As QA, every MVP screen passes the state checklist.
- STORY-18-01-02 As user, I can tab through primary controls.

### FEAT-18-02: Health, Observability & Frontend Deploy

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-18-02 |
| **Parent Epic** | EPIC-18 |
| **Description** | Health checks; basic logging; Vercel frontend deploy config. |
| **Priority** | P1 |
| **Dependencies** | FEAT-00-01 |
| **Estimated Complexity** | S |
| **HTML / Screens** | n/a |
| **APIs** | GET /health |

**Acceptance Criteria**
- [ ] Health endpoint for ops
- [ ] Frontend deployable to Vercel
- [ ] Secrets not in client bundle

**Stories**
- STORY-18-02-01 As ops, I can hit health for smoke.
- STORY-18-02-02 As developer, frontend deploys to Vercel per Constitution.

## EPIC-F01: Lead Kanban Pipeline (FUTURE / EXCLUDED-MVP)

| Field | Value |
|-------|--------|
| **Business outcome** | Kanban pipeline with WIP and drag-drop (post-MVP) |
| **In scope (future)** | FR-CRM-014; SCR-LEAD-KANBAN |
| **Out of scope (MVP)** | Entire epic — do not implement or link in MVP nav |
| **Design references** | lead_pipeline_kanban_view (reference only) |
| **Dependencies / risks** | Preserve HTML for later; MVP honesty |

### FEAT-F01-01: Kanban Board

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-F01-01 |
| **Parent Epic** | EPIC-F01 |
| **Description** | Drag-drop stages, WIP limits, bulk ops. |
| **Priority** | FUTURE |
| **Dependencies** | EPIC-09 complete |
| **Estimated Complexity** | XL |
| **HTML / Screens** | SCR-LEAD-KANBAN |
| **APIs** | leads stage bulk |

**Acceptance Criteria**
- [ ] Board matches SCR-LEAD-KANBAN
- [ ] Drag-drop updates stage
- [ ] WIP limits enforced
- [ ] Not shipped in MVP

**Stories**
- STORY-F01-01-01 As Agent, I manage leads on Kanban (post-MVP).

## EPIC-F02: Activity Timeline Product (FUTURE / EXCLUDED-MVP)

| Field | Value |
|-------|--------|
| **Business outcome** | Full communication/activity timeline product |
| **Out of scope (MVP)** | FR-CRM-011; rich FR-CUS-007 timeline |
| **Dependencies / risks** | Distinct from command-center feed |

### FEAT-F02-01: CRM Communication Timeline

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-F02-01 |
| **Parent Epic** | EPIC-F02 |
| **Description** | Call logs and timeline feed product. |
| **Priority** | FUTURE |
| **Dependencies** | EPIC-09 |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-LEAD-D timeline sections |
| **APIs** | timeline APIs |

**Acceptance Criteria**
- [ ] Timeline product distinct from command-center feed
- [ ] Not in MVP

**Stories**
- STORY-F02-01-01 As Agent, I view full communication timeline (post-MVP).

## EPIC-F03: Reminders & Automation (FUTURE / EXCLUDED-MVP)

| Field | Value |
|-------|--------|
| **Business outcome** | Follow-up tasks, reminders, automation engines |
| **Out of scope (MVP)** | FR-CRM-012; Constitution ban |

### FEAT-F03-01: Reminders & Task Automation

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-F03-01 |
| **Parent Epic** | EPIC-F03 |
| **Description** | Follow-ups and automation rules. |
| **Priority** | FUTURE |
| **Dependencies** | EPIC-09 |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-LEAD-D reminder UI |
| **APIs** | reminders |

**Acceptance Criteria**
- [ ] Reminder system ships only post-MVP approval
- [ ] Not in MVP

**Stories**
- STORY-F03-01-01 As Agent, I set follow-up reminders (post-MVP).

## EPIC-F04: Virtual Tours & Video Upload (FUTURE / EXCLUDED-MVP)

| Field | Value |
|-------|--------|
| **Business outcome** | Video/virtual tour media on listings |
| **Out of scope (MVP)** | FR-PROP-M-007 |

### FEAT-F04-01: Video & Virtual Tour Media

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-F04-01 |
| **Parent Epic** | EPIC-F04 |
| **Description** | Upload/embed virtual tours and video. |
| **Priority** | FUTURE |
| **Dependencies** | EPIC-07 |
| **Estimated Complexity** | M |
| **HTML / Screens** | listing editor excluded fields |
| **APIs** | media video |

**Acceptance Criteria**
- [ ] Not in MVP editor
- [ ] Post-MVP only

**Stories**
- STORY-F04-01-01 As Agent, I attach virtual tour media (post-MVP).

## EPIC-F05: SMS / WhatsApp / Push (FUTURE / EXCLUDED-MVP)

| Field | Value |
|-------|--------|
| **Business outcome** | Additional notification channels |
| **Out of scope (MVP)** | FR-PLT-005 |

### FEAT-F05-01: Alternate Notification Channels

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-F05-01 |
| **Parent Epic** | EPIC-F05 |
| **Description** | SMS, WhatsApp, Push. |
| **Priority** | FUTURE |
| **Dependencies** | EPIC-14 |
| **Estimated Complexity** | L |
| **HTML / Screens** | n/a |
| **APIs** | notification channels |

**Acceptance Criteria**
- [ ] Channels absent from MVP rules UI
- [ ] Post-MVP only

**Stories**
- STORY-F05-01-01 As Admin, I enable SMS/WhatsApp/Push (post-MVP).

## EPIC-F06: Advanced CRM (Contacts / Opportunity) (FUTURE)

| Field | Value |
|-------|--------|
| **Business outcome** | Contacts module beyond lead fields; convert to opportunity |
| **In scope (future)** | FR-CRM-013, FR-CRM-015 |

### FEAT-F06-01: Contacts & Opportunity Conversion

| Field | Value |
|-------|--------|
| **Feature ID** | FEAT-F06-01 |
| **Parent Epic** | EPIC-F06 |
| **Description** | Contact management + convert lead to opportunity. |
| **Priority** | FUTURE |
| **Dependencies** | EPIC-09 |
| **Estimated Complexity** | L |
| **HTML / Screens** | SCR-LEAD-D convert CTA |
| **APIs** | contacts; opportunities |

**Acceptance Criteria**
- [ ] Ships only after MVP CRM list/detail stable

**Stories**
- STORY-F06-01-01 As Agent, I convert lead to opportunity (post-MVP).
- STORY-F06-01-02 As Agent, I manage contacts module (post-MVP).


---

## 4. Suggested Implementation Order (MVP)

1. EPIC-00 Platform Foundation
2. EPIC-01 Auth
3. EPIC-02 Users & Agents
4. EPIC-07 Property Inventory & Editor (+ seed data)
5. EPIC-05 Property Details + EPIC-17 Maps
6. EPIC-04 AI Search
7. EPIC-03 Homepage
8. EPIC-09 CRM Leads → EPIC-10 Visits
9. EPIC-06 Favorites → EPIC-11 Customer
10. EPIC-12 AI Chat → EPIC-13 AI Config
11. EPIC-14 Notifications → EPIC-15 CMS
12. EPIC-08 Bulk Upload
13. EPIC-16 Command Center & Reports
14. EPIC-18 UX polish, health, deploy gates

Do **not** schedule EPIC-F* into MVP sprints.

## 5. Screen ↔ Epic Traceability

| Screen | Epic(s) | MVP |
|--------|---------|-----|
| SCR-HOME | EPIC-03, 12, 15 | Yes |
| SCR-SEARCH-* | EPIC-04, 06 | Yes |
| SCR-PROP-D | EPIC-05, 10, 17, 06 | Yes |
| SCR-CUS-DASH | EPIC-11, 06, 14 | Yes |
| SCR-LEAD-KANBAN | EPIC-F01 | **No** |
| SCR-LEAD-D | EPIC-09, 10 | Yes* |
| SCR-PROP-EDIT | EPIC-07 | Yes |
| SCR-PROP-INV | EPIC-07 | Yes |
| SCR-BULK | EPIC-08 | Yes |
| SCR-AI-CFG | EPIC-13 | Yes |
| SCR-CMD | EPIC-16 | Yes |

\* MVP subset without timeline/reminder products.

## 6. Counts

| Scope | Epics | Features |
|-------|-------|----------|
| MVP (EPIC-00…18) | 19 | 35 |
| Future / Excluded (EPIC-F01…F06) | 6 | 6 |
| **Total** | **25** | **41** |

Every feature above includes Description, Priority, Dependencies, Acceptance Criteria, and Estimated Complexity.

## 7. Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Full Epic → Feature → Story backlog per Constitution |
| 1.1.0 | 2026-07-31 | Auth path `/auth/token`; FEAT→FR index (§8) |

## 8. FEAT → FR Traceability Index (MVP)

| Feature | Primary FR IDs | Sprint | Tasks |
|---------|----------------|--------|-------|
| FEAT-00-01 | NFR / stack (no product FR) | 0 | `10` index |
| FEAT-00-02 | NFR-UI / tokens | 0 | `10` index |
| FEAT-00-03 | FR-AUTH-003 (shell) | 0 | `10` index |
| FEAT-01-01 | FR-AUTH-001, FR-AUTH-002, FR-AUTH-007 | 1 | `10` index |
| FEAT-01-02 | FR-AUTH-002, FR-AUTH-003, FR-AUTH-004 | 1 | `10` index |
| FEAT-02-01 | FR-AUTH-005 | 2 | `10` index |
| FEAT-02-02 | FR-AUTH-006 | 2 | `10` index |
| FEAT-03-01 | FR-HOME-001–005, FR-HOME-007 | 6 | `10` index |
| FEAT-03-02 | FR-HOME-006, FR-CRM-001 | 6 | `10` index |
| FEAT-04-01 | FR-SEARCH-001–005, FR-SEARCH-011 | 5 | `10` index |
| FEAT-04-02 | FR-SEARCH-003–010 | 5 | `10` index |
| FEAT-04-03 | FR-SEARCH-011–013 | 5 | `10` index |
| FEAT-05-01 | FR-PROP-D-001–008, FR-PROP-D-010–011 | 4 | `10` index |
| FEAT-05-02 | FR-PROP-D-009; FR-CRM-001; visit FRs | 4 | `10` index |
| FEAT-06-01 | FR-SEARCH-010, FR-PROP-D-009, FR-CUS-002 | 8 | `10` index |
| FEAT-06-02 | FR-CUS-005 (saved searches) | 8 | `10` index |
| FEAT-07-01 | FR-PROP-M inventory FRs | 3 | `10` index |
| FEAT-07-02 | FR-PROP-M editor FRs | 3 | `10` index |
| FEAT-07-03 | FR-PROP-M media (photos/floorplan; no video) | 3 | `10` index |
| FEAT-08-01 | FR-BULK-001–006 | 11 | `10` index |
| FEAT-09-01 | FR-CRM-001–004 (capture + list) | 7 | `10` index |
| FEAT-09-02 | FR-CRM-005–010 (detail/notes/stage; no Kanban/timeline) | 7 | `10` index |
| FEAT-10-01 | FR-CRM-009 (schedule visit) | 7 | `10` index |
| FEAT-11-01 | FR-CUS-001–006 | 8 | `10` index |
| FEAT-12-01 | FR-AI chat FRs / FR-HOME-005 | 9 | `10` index |
| FEAT-12-02 | FR-AI loan analysis | 9 | `10` index |
| FEAT-13-01 | FR-AI-002–006 (config) | 9 | `10` index |
| FEAT-14-01 | FR-PLT-001–002 (in-app) | 10 | `10` index |
| FEAT-14-02 | FR-PLT-003 (email + rules) | 10 | `10` index |
| FEAT-15-01 | FR-PLT-004, FR-HOME-007 | 10 | `10` index |
| FEAT-16-01 | FR-ADM command center | 12 | `10` index |
| FEAT-16-02 | FR-ADM reports | 12 | `10` index |
| FEAT-17-01 | Map / landmark FRs (Leaflet+OSM) | 4 | `10` index |
| FEAT-18-01 | FR-UX states / a11y | 13 | `10` index |
| FEAT-18-02 | Health / deploy gates | 13 | `10` index |

Epic-level FR ranges remain in each EPIC “In scope” block. Sprint assignment: `09_SPRINT_PLAN.md`. Task IDs: `10_TASK_BREAKDOWN.md` §4.

---

**End of Epics, Features & Stories**
