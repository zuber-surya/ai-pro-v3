# Software Requirements Specification (SRS)

| Field | Value |
|-------|--------|
| **Document** | Software Requirements Specification |
| **Product** | Property AI Studio (UI brand: PropVista CRM) |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **Standard** | IEEE 830-style structure adapted for this product |
| **Status** | Authoritative Software Requirements Specification |

## 1. Introduction

### 1.1 Purpose
This SRS specifies software requirements for Property AI Studio so that engineering, QA, and AI coding assistants can implement and verify the system without inventing features or redesigning UI.

### 1.2 Scope
The system is a single-organization AI-powered real estate web platform providing property discovery (NLP + filters), listings management, CRM leads, customer portal, admin analytics, CMS, notifications (email + in-app), and Gemini-based AI search/chat/loan analysis.

**UI SOT:** `docs/design_reference/**` (HTML wins on UI conflicts).  
**Functional SOT:** `docs/REQUIREMENTS_AND_PROPOSAL.md` and `docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md`.  
**Governance:** `docs/00_PROJECT_CONSTITUTION.md`.

### 1.3 Definitions
| Term | Definition |
|------|------------|
| Guest | Unauthenticated visitor |
| NLP Search | Natural-language search via Google Gemini |
| Fallback Mode | Filter-only results with visible AI-unavailable banner |
| MVP | Minimum viable product per Constitution/PRD |
| Role-based only | Authorization by role; no module permission matrix |

### 1.4 References
1. `docs/00_PROJECT_CONSTITUTION.md`
2. `docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md`
3. `docs/REQUIREMENTS_AND_PROPOSAL.md`
4. `docs/design_reference/**`

### 1.5 Overview
Section 2 provides system overview. Section 3 lists overall description. Section 4 contains specific requirements including every PRD functional requirement with full flows. Later sections cover NFRs, data, APIs, modules, screens, security, AI, reporting, notifications, search, property, CRM, CMS, errors, logging, and future auditing.

---

## 2. System Overview

### 2.1 System Context
```
[Guest/Customer/Agent/Admin/Super Admin Browsers]
        | HTTPS
[Next.js 15 Frontend on Vercel]
        | REST JSON /api/v1
[Node.js Express Backend]
   |        |         |
[PostgreSQL] [Gemini] [Email] [Local/Prod Storage]
[Prisma ORM]
```

### 2.2 Technology Constraints (Mandatory)
Frontend: Next.js 15, React 19, TypeScript, Tailwind.  
Backend: Node.js, Express, Prisma, PostgreSQL.  
AI: Google Gemini only. Maps: Leaflet + OpenStreetMap. Auth: email/password. Notifications MVP: email + in-app. Deploy frontend: Vercel. Dev storage: local.

### 2.3 User Classes
Guest, Customer, Agent, Admin, Super Admin — single organization.

### 2.4 MVP Exclusions (Shall Not Implement)
Kanban; activity timeline product; reminder system; automation; virtual tours; video upload; SMS; WhatsApp; push notifications.

### 2.5 Design Constraints
No UI redesign. Pixel fidelity to HTML for in-scope screens. Clean Architecture; no business logic in UI components; centralized API client; strict TypeScript.

---

## 3. Overall Description

### 3.1 Product Perspective
Greenfield production system replacing fragmented tools, guided by existing design HTML and requirements/PRD.

### 3.2 Product Functions (Summary)
Authentication/RBAC; Homepage marketing + AI entry; Search (AI/filter/empty/fallback); Property details; Inventory/editor/bulk; Favorites; Customer dashboard; CRM leads (list/detail); Visit scheduling; AI chat/config/loan; Notifications; CMS; Admin command center/reports.

### 3.3 Assumptions and Dependencies
Gemini availability; seed data for demos; evergreen browsers; Constitution stack; ClientsView is MVP lead list stand-in for deferred Kanban.

### 3.4 Apportioning of Requirements
Priority Must = MVP ship. Should = MVP fidelity/important. Could = optional within MVP if HTML requires. Won't = Future/Excluded.

---

## 4. Specific Requirements — Functional Requirements

Every PRD functional requirement is specified below with Description, Priority, Preconditions, Main Flow, Alternate Flow, Validation, and Acceptance Criteria.

**FR Count:** 107

### 4.1 Authentication and Users

#### FR-AUTH-001: Email/password registration

| Field | Value |
|-------|-------|
| **Module** | MOD-AUTH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest |
| **Screens** | SCR-REGISTER, SCR-HOME |

**Description**

Email/password registration. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- User is unauthenticated
- Registration UI available (Join AI Pro / Register)

**Main Flow**

1. Open Register
2. Enter email and password (and required profile fields if shown)
3. Submit
4. System creates Customer user with hashed password
5. User is authenticated or prompted to login

**Alternate Flow**

- Duplicate email -> validation error
- Weak/invalid password -> validation error
- Server error -> error state per HTML/UX

**Validation**

- Email format valid
- Password meets policy
- Email unique

**Acceptance Criteria**

- [ ] Account created with hashed password
- [ ] No plaintext password stored
- [ ] User can subsequently login

---
#### FR-AUTH-002: Login / logout with JWT access and refresh

| Field | Value |
|-------|-------|
| **Module** | MOD-AUTH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Customer, Agent, Admin, Super Admin |
| **Screens** | SCR-LOGIN |

**Description**

Login / logout with JWT access and refresh. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- User has registered account
- User is active (not soft-deleted)

**Main Flow**

1. Open Login
2. Submit email/password
3. Receive access + refresh tokens
4. Access role home
5. Logout clears session

**Alternate Flow**

- Invalid credentials -> 401 and error UI
- Inactive user denied
- Expired access token refreshed via refresh token
- Refresh failure forces re-login

**Validation**

- Credentials required
- Tokens validated on protected calls

**Acceptance Criteria**

- [ ] Successful login issues tokens
- [ ] Logout ends session
- [ ] Refresh renews access without password when valid

---
#### FR-AUTH-003: Protected routes require authentication

| Field | Value |
|-------|-------|
| **Module** | MOD-AUTH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | All authenticated roles |
| **Screens** | All protected screens |

**Description**

Protected routes require authentication. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Route marked protected

**Main Flow**

1. Unauthenticated request to protected route redirected to login or 401
2. Authenticated request proceeds

**Alternate Flow**

- Deep link after login returns to intended route when supported

**Validation**

- Auth middleware/guard present on protected pages and APIs

**Acceptance Criteria**

- [ ] No protected data returned without valid auth

---
#### FR-AUTH-004: Role stored and enforced server-side

| Field | Value |
|-------|-------|
| **Module** | MOD-AUTH / MOD-USERS |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | System |
| **Screens** | N/A |

**Description**

Role stored and enforced server-side. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- User record exists

**Main Flow**

1. Role is one of Guest/Customer/Agent/Admin/Super Admin (Guest typically unauthenticated)
2. Server checks role on authorized endpoints
3. UI may hide but never solely authorize

**Alternate Flow**

- Wrong role -> 403
- Missing role treated as unauthorized

**Validation**

- Role enum/string constrained
- No module-level permission matrix

**Acceptance Criteria**

- [ ] Server rejects cross-role access
- [ ] Five-role model only

---
#### FR-AUTH-005: Admin user management

| Field | Value |
|-------|-------|
| **Module** | MOD-USERS |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin, Super Admin |
| **Screens** | SCR-USERS |

**Description**

Admin user management. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Actor authenticated as Admin or Super Admin

**Main Flow**

1. Open Users admin
2. List users
3. Create/update/deactivate as designed UI allows
4. Changes persist

**Alternate Flow**

- Unauthorized role denied
- Cannot soft-lock last Super Admin if policy defined later—document as constraint

**Validation**

- Email unique on create/update
- Role assignment valid

**Acceptance Criteria**

- [ ] Users list loads
- [ ] Mutations persist and reflect on reload
- [ ] UI matches AdminUsersView design intent

---
#### FR-AUTH-006: Agent profile management

| Field | Value |
|-------|-------|
| **Module** | MOD-AGENTS |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin, Super Admin |
| **Screens** | SCR-AGENTS |

**Description**

Agent profile management. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Actor Admin/Super Admin

**Main Flow**

1. Open Agents admin
2. CRUD agent name, email, phone, profile image
3. Persist

**Alternate Flow**

- Validation failures inline
- Unauthorized denied

**Validation**

- Required agent fields
- Image type/size if upload

**Acceptance Criteria**

- [ ] Agent records usable on property detail agent cards

---
#### FR-AUTH-007: Homepage Sign In and Join AI Pro CTAs

| Field | Value |
|-------|-------|
| **Module** | MOD-HOME |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest |
| **Screens** | SCR-HOME |

**Description**

Homepage Sign In and Join AI Pro CTAs. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Homepage loaded

**Main Flow**

1. Sign In navigates to login
2. Join AI Pro navigates to registration

**Alternate Flow**

- Already authenticated user may be routed to role home

**Validation**

- CTA labels/placement match HTML

**Acceptance Criteria**

- [ ] CTAs visible and functional per SCR-HOME HTML

---
### 4.2 Homepage and Marketing

#### FR-HOME-001: Homepage hero branding, nav, AI search, suggestion chips

| Field | Value |
|-------|-------|
| **Module** | MOD-HOME |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-HOME |

**Description**

Homepage hero branding, nav, AI search, suggestion chips. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Public homepage reachable

**Main Flow**

1. Render branding/nav
2. Show NLP search hero
3. Show suggestion chips
4. Chip click populates/submits search

**Alternate Flow**

- CMS failure falls back to safe defaults without breaking search

**Validation**

- HTML structure/visual fidelity

**Acceptance Criteria**

- [ ] Matches propvista_crm_homepage HTML for hero/nav/chips

---
#### FR-HOME-002: Featured/curated property cards

| Field | Value |
|-------|-------|
| **Module** | MOD-HOME |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-HOME |

**Description**

Featured/curated property cards. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Featured properties API/CMS available or empty

**Main Flow**

1. Show cards with image, price, beds/baths, location, save control
2. Card opens property detail

**Alternate Flow**

- Empty featured -> empty/hidden section per design
- Save as Guest triggers auth gate

**Validation**

- Only published featured listings

**Acceptance Criteria**

- [ ] Cards match HTML; navigation to detail works

---
#### FR-HOME-003: How-it-works journey section

| Field | Value |
|-------|-------|
| **Module** | MOD-HOME |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-HOME |

**Description**

How-it-works journey section. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Homepage loaded

**Main Flow**

1. Render journey section content per HTML

**Alternate Flow**

- CMS content override if configured

**Validation**

- Copy/layout match HTML

**Acceptance Criteria**

- [ ] Section present and visually faithful

---
#### FR-HOME-004: Testimonials section

| Field | Value |
|-------|-------|
| **Module** | MOD-HOME |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-HOME |

**Description**

Testimonials section. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Homepage loaded

**Main Flow**

1. Render testimonials per HTML

**Alternate Flow**

- CMS-supplied testimonials when available

**Validation**

- Visual fidelity

**Acceptance Criteria**

- [ ] Section matches HTML

---
#### FR-HOME-005: AI chat widget on homepage

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-CHAT |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-HOME |

**Description**

AI chat widget on homepage. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Homepage loaded
- AI chat service configured

**Main Flow**

1. Open/close widget
2. Send message
3. Receive Gemini response using configured greeting

**Alternate Flow**

- AI failure -> user-safe error in widget
- Escalation path if rules match (config)

**Validation**

- Message non-empty
- Rate limits apply

**Acceptance Criteria**

- [ ] Widget matches HTML; chat uses Gemini only

---
#### FR-HOME-006: Public contact/lead capture on homepage surfaces

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-HOME |

**Description**

Public contact/lead capture on homepage surfaces. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Lead capture UI present per HTML/design-details

**Main Flow**

1. User submits name/phone/email/message as designed
2. Lead created with source
3. Success feedback

**Alternate Flow**

- Validation errors inline
- Duplicate/idempotent retry safe

**Validation**

- Required fields
- Email/phone format

**Acceptance Criteria**

- [ ] Lead appears in Agent/Admin lead list

---
#### FR-HOME-007: CMS-influenced homepage content

| Field | Value |
|-------|-------|
| **Module** | MOD-CMS |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+, Admin |
| **Screens** | SCR-HOME, SCR-CMS |

**Description**

CMS-influenced homepage content. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- CMS homepage content endpoint available

**Main Flow**

1. Homepage loads CMS banners/sections when present
2. Admin can edit via CMS

**Alternate Flow**

- Missing CMS -> designed defaults

**Validation**

- Published CMS only on public

**Acceptance Criteria**

- [ ] CMS changes reflect on public homepage without redesign

---
### 4.3 Search

#### FR-SEARCH-001: Natural-language property search

| Field | Value |
|-------|-------|
| **Module** | MOD-SEARCH / MOD-AI-SEARCH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-HOME, SCR-SEARCH-STD |

**Description**

Natural-language property search. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Search UI available
- Published properties may exist

**Main Flow**

1. Enter NLP query
2. Submit
3. System calls Gemini AI search
4. Show standard results when successful

**Alternate Flow**

- Timeout/error -> FR-SEARCH-011 fallback
- Zero results -> FR-SEARCH-012

**Validation**

- Query accepted as text

**Acceptance Criteria**

- [ ] NLP search invokes Gemini; results from property inventory only

---
#### FR-SEARCH-002: Search loading state

| Field | Value |
|-------|-------|
| **Module** | MOD-SEARCH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-SEARCH-* |

**Description**

Search loading state. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Search submitted

**Main Flow**

1. Show designed loading/skeleton until response

**Alternate Flow**

- Cancel/navigation leaves loading

**Validation**

- Loading matches HTML treatment

**Acceptance Criteria**

- [ ] No blank unstyled wait state

---
#### FR-SEARCH-003: Match score percentage on AI success

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-SEARCH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-SEARCH-STD |

**Description**

Match score percentage on AI success. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- AI search succeeded with scores

**Main Flow**

1. Each result shows match % prominently per HTML

**Alternate Flow**

- Fallback mode hides scores

**Validation**

- Score from API not fabricated client-side

**Acceptance Criteria**

- [ ] Standard view shows percentages

---
#### FR-SEARCH-004: Match reasons check/cross

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-SEARCH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-SEARCH-STD |

**Description**

Match reasons check/cross. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- AI search returned reasons

**Main Flow**

1. Display check/cross criteria per HTML

**Alternate Flow**

- Missing reasons -> omit gracefully without layout break

**Validation**

- Reasons bound to API payload

**Acceptance Criteria**

- [ ] Reasons visible on standard view when available

---
#### FR-SEARCH-005: Search auto-suggestions

| Field | Value |
|-------|-------|
| **Module** | MOD-SEARCH |
| **Scope** | MVP |
| **Priority** | Should |
| **Actors** | Guest+ |
| **Screens** | SCR-HOME, SCR-SEARCH-* |

**Description**

Search auto-suggestions. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- User typing in search where suggest designed

**Main Flow**

1. Suggestions appear
2. Selecting suggestion applies query

**Alternate Flow**

- Suggest API failure -> silent degrade

**Validation**

- Debounced requests

**Acceptance Criteria**

- [ ] Suggestions work when endpoint available

---
#### FR-SEARCH-006: Filter panel (type, price, beds, amenities, location)

| Field | Value |
|-------|-------|
| **Module** | MOD-SEARCH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-SEARCH-* |

**Description**

Filter panel (type, price, beds, amenities, location). Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Search results view open

**Main Flow**

1. Apply filters
2. Results update (AI or filter path as active)

**Alternate Flow**

- Invalid price range -> validation

**Validation**

- Filter values from designed controls

**Acceptance Criteria**

- [ ] Filters match HTML search views

---
#### FR-SEARCH-007: Clear/reset filters

| Field | Value |
|-------|-------|
| **Module** | MOD-SEARCH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-SEARCH-* |

**Description**

Clear/reset filters. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Filters applied

**Main Flow**

1. Clear all / Reset restores defaults and refreshes

**Alternate Flow**

- No-op if already clear

**Validation**

- Control labels match HTML

**Acceptance Criteria**

- [ ] Filters reset correctly

---
#### FR-SEARCH-008: Grid/list view toggle

| Field | Value |
|-------|-------|
| **Module** | MOD-SEARCH |
| **Scope** | MVP |
| **Priority** | Should |
| **Actors** | Guest+ |
| **Screens** | SCR-SEARCH-STD |

**Description**

Grid/list view toggle. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Standard search results with toggle in HTML

**Main Flow**

1. Toggle switches layout

**Alternate Flow**

- Preference may be session-local

**Validation**

- Both layouts faithful

**Acceptance Criteria**

- [ ] Toggle works per HTML

---
#### FR-SEARCH-009: Search results pagination

| Field | Value |
|-------|-------|
| **Module** | MOD-SEARCH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-SEARCH-STD |

**Description**

Search results pagination. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- More results than page size

**Main Flow**

1. Navigate pages
2. Maintain query/filters

**Alternate Flow**

- Out-of-range page -> clamp/empty

**Validation**

- Server pagination

**Acceptance Criteria**

- [ ] Pagination controls match HTML behavior

---
#### FR-SEARCH-010: Favorite control on result cards

| Field | Value |
|-------|-------|
| **Module** | MOD-FAV |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+, Customer |
| **Screens** | SCR-SEARCH-* |

**Description**

Favorite control on result cards. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Results rendered

**Main Flow**

1. Authenticated customer toggles favorite
2. Guest prompted to auth

**Alternate Flow**

- API failure -> error toast

**Validation**

- Auth required to persist

**Acceptance Criteria**

- [ ] Favorite state persists for Customer

---
#### FR-SEARCH-011: AI failure filter-only fallback with banner

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-SEARCH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-SEARCH-FB |

**Description**

AI failure filter-only fallback with banner. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- AI search fails or times out

**Main Flow**

1. Show filter-only results
2. Show visible fallback banner
3. No match scores

**Alternate Flow**

- Also zero results under fallback uses empty guidance

**Validation**

- Fallback flag set

**Acceptance Criteria**

- [ ] Matches SCR-SEARCH-FB HTML

---
#### FR-SEARCH-012: Empty search state

| Field | Value |
|-------|-------|
| **Module** | MOD-SEARCH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-SEARCH-EMPTY |

**Description**

Empty search state. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Search returns zero properties

**Main Flow**

1. Show empty illustration/message
2. Show refine CTAs and suggestion chips

**Alternate Flow**

- User refines filters/query

**Validation**

- Query retained in search bar

**Acceptance Criteria**

- [ ] Matches SCR-SEARCH-EMPTY HTML

---
#### FR-SEARCH-013: Fallback reset/refine controls

| Field | Value |
|-------|-------|
| **Module** | MOD-SEARCH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-SEARCH-FB |

**Description**

Fallback reset/refine controls. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Fallback view active

**Main Flow**

1. Reset Search / refine controls restore usable search

**Alternate Flow**

- Reset returns to broader results or homepage per design

**Validation**

- Controls labeled per HTML

**Acceptance Criteria**

- [ ] Controls functional on fallback view

---
### 4.4 Property Details

#### FR-PROP-D-001: Load property details core fields

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-PUB |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-PROP-D |

**Description**

Load property details core fields. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Valid published property id (or authorized draft for staff)

**Main Flow**

1. Load title, price, beds/baths/area
2. Render header

**Alternate Flow**

- Not found -> 404/error state
- Unauthorized draft -> 403/404

**Validation**

- Id required

**Acceptance Criteria**

- [ ] Core fields display; price as numeric string presentation

---
#### FR-PROP-D-002: Image gallery/carousel

| Field | Value |
|-------|-------|
| **Module** | MOD-MEDIA |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-PROP-D |

**Description**

Image gallery/carousel. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Property has zero or more images

**Main Flow**

1. Browse gallery per HTML

**Alternate Flow**

- No images -> placeholder/empty media treatment

**Validation**

- Accessible controls

**Acceptance Criteria**

- [ ] Gallery matches HTML

---
#### FR-PROP-D-003: Floorplan section

| Field | Value |
|-------|-------|
| **Module** | MOD-MEDIA |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-PROP-D |

**Description**

Floorplan section. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Floorplan may exist

**Main Flow**

1. Show floorplan section/image

**Alternate Flow**

- Missing floorplan -> hide/empty per design

**Validation**

- Media URL valid

**Acceptance Criteria**

- [ ] Floorplan section per HTML

---
#### FR-PROP-D-004: Overview/details/amenities/price breakdown

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-PUB |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-PROP-D |

**Description**

Overview/details/amenities/price breakdown. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Property loaded

**Main Flow**

1. Render sections/tabs per HTML

**Alternate Flow**

- Missing optional subsections handled gracefully

**Validation**

- Content from API

**Acceptance Criteria**

- [ ] Sections match HTML structure

---
#### FR-PROP-D-005: Map with Leaflet + OSM and landmarks

| Field | Value |
|-------|-------|
| **Module** | MOD-MAP |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-PROP-D |

**Description**

Map with Leaflet + OSM and landmarks. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Property location available

**Main Flow**

1. Render Leaflet/OSM map
2. Show neighborhood/landmarks when present

**Alternate Flow**

- Missing coords -> map empty/error treatment

**Validation**

- Lazy-load map module

**Acceptance Criteria**

- [ ] Map uses Leaflet+OSM only

---
#### FR-PROP-D-006: Agent contact card

| Field | Value |
|-------|-------|
| **Module** | MOD-AGENTS |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-PROP-D |

**Description**

Agent contact card. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Property has assigned agent

**Main Flow**

1. Show photo, name, phone, email

**Alternate Flow**

- Missing agent -> hide/placeholder

**Validation**

- Data from agent entity

**Acceptance Criteria**

- [ ] Card matches HTML

---
#### FR-PROP-D-007: Inquire CTA

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-PROP-D |

**Description**

Inquire CTA. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Property detail open

**Main Flow**

1. Click Inquire
2. Submit lead capture
3. Lead created with property interest

**Alternate Flow**

- Validation errors
- Auth optional per form design

**Validation**

- Required inquiry fields

**Acceptance Criteria**

- [ ] Lead created and listed for agents

---
#### FR-PROP-D-008: Contact agent / Schedule tour CTAs

| Field | Value |
|-------|-------|
| **Module** | MOD-TOUR |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-PROP-D, SCR-SCHED |

**Description**

Contact agent / Schedule tour CTAs. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Property detail open

**Main Flow**

1. Contact agent uses designed action
2. Schedule tour opens ScheduleVisitModal flow

**Alternate Flow**

- Scheduling validation failures

**Validation**

- Visit fields validated

**Acceptance Criteria**

- [ ] CTAs present per HTML; schedule creates visit request

---
#### FR-PROP-D-009: Favorite on detail

| Field | Value |
|-------|-------|
| **Module** | MOD-FAV |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+, Customer |
| **Screens** | SCR-PROP-D |

**Description**

Favorite on detail. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Detail open

**Main Flow**

1. Toggle favorite with auth gate for Guest

**Alternate Flow**

- Error toast on failure

**Validation**

- Auth for persist

**Acceptance Criteria**

- [ ] State persists for Customer

---
#### FR-PROP-D-010: Similar properties carousel

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-PUB |
| **Scope** | MVP |
| **Priority** | Should |
| **Actors** | Guest+ |
| **Screens** | SCR-PROP-D |

**Description**

Similar properties carousel. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Similar properties available

**Main Flow**

1. Render carousel
2. Navigate to similar detail

**Alternate Flow**

- None -> hide/empty

**Validation**

- Only published

**Acceptance Criteria**

- [ ] Carousel per HTML

---
#### FR-PROP-D-011: Nearby landmarks data support

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-PUB |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | System, Guest+ |
| **Screens** | SCR-PROP-D |

**Description**

Nearby landmarks data support. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Landmarks associated to property

**Main Flow**

1. Persist landmarks
2. Expose on detail/map

**Alternate Flow**

- Empty landmarks ok

**Validation**

- Schema relations valid

**Acceptance Criteria**

- [ ] Landmarks model supported end-to-end

---
### 4.5 Property Management

#### FR-PROP-M-001: Create property listing

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin, Super Admin |
| **Screens** | SCR-PROP-EDIT |

**Description**

Create property listing. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Actor authorized

**Main Flow**

1. Open editor
2. Enter required fields
3. Save draft or publish

**Alternate Flow**

- Validation blocks publish
- Unauthorized denied

**Validation**

- Title, price, beds, baths, area required per HTML

**Acceptance Criteria**

- [ ] Listing created in DB

---
#### FR-PROP-M-002: Edit property basic info

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent (own/assigned), Admin+ |
| **Screens** | SCR-PROP-EDIT |

**Description**

Edit property basic info. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Existing property
- Actor authorized

**Main Flow**

1. Edit fields per HTML editor
2. Save

**Alternate Flow**

- Concurrent update conflict handling if implemented
- 403 if not owner/admin

**Validation**

- Same required field rules

**Acceptance Criteria**

- [ ] Edits persist; UI matches listing editor HTML

---
#### FR-PROP-M-003: Save Draft and Publish actions

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-PROP-EDIT, SCR-PROP-INV |

**Description**

Save Draft and Publish actions. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Editor open with valid/partial data

**Main Flow**

1. Save Draft stores draft status
2. Publish requires valid required fields and sets published

**Alternate Flow**

- Publish blocked when invalid

**Validation**

- Status enum draft/published/archived

**Acceptance Criteria**

- [ ] Status badges reflect state; published visible publicly

---
#### FR-PROP-M-004: Amenities checklist and custom amenity

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-PROP-EDIT |

**Description**

Amenities checklist and custom amenity. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Editor open

**Main Flow**

1. Toggle amenities
2. Add custom amenity
3. Persist with property

**Alternate Flow**

- Duplicate custom ignored/merged

**Validation**

- Amenity strings sanitized

**Acceptance Criteria**

- [ ] Amenities show on detail

---
#### FR-PROP-M-005: Description and highlights editors

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-PROP-EDIT |

**Description**

Description and highlights editors. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Editor open

**Main Flow**

1. Edit description/highlights
2. Save

**Alternate Flow**

- Oversize content rejected

**Validation**

- Length limits

**Acceptance Criteria**

- [ ] Content appears on detail overview

---
#### FR-PROP-M-006: Photo and floorplan upload

| Field | Value |
|-------|-------|
| **Module** | MOD-MEDIA |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-PROP-EDIT |

**Description**

Photo and floorplan upload. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Editor open
- Local storage in development

**Main Flow**

1. Upload photos/floorplan
2. Store via media service
3. Associate to property

**Alternate Flow**

- Invalid MIME/size rejected

**Validation**

- Type/size validation

**Acceptance Criteria**

- [ ] Media appears in gallery/floorplan

---
#### FR-PROP-M-007: Video tour URL / virtual tour fields

| Field | Value |
|-------|-------|
| **Module** | MOD-VT |
| **Scope** | FUTURE / EXCLUDED-MVP |
| **Priority** | Won't (MVP) |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-PROP-EDIT (future) |

**Description**

Video tour URL / virtual tour fields. Scope `FUTURE / EXCLUDED-MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Constitution amendment activating virtual tours/video

**Main Flow**

1. Future: capture video/tour fields

**Alternate Flow**

- MVP: do not implement upload/tour product

**Validation**

- N/A in MVP

**Acceptance Criteria**

- [ ] MVP release has no video upload or virtual tour product

---
#### FR-PROP-M-008: Inventory grid search/filter/sort/pagination

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-PROP-INV |

**Description**

Inventory grid search/filter/sort/pagination. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Actor authorized

**Main Flow**

1. Open inventory
2. Search/filter/sort/page

**Alternate Flow**

- Empty filters -> empty state FR-PROP-M-014

**Validation**

- Server-side query params

**Acceptance Criteria**

- [ ] Matches SCR-PROP-INV HTML

---
#### FR-PROP-M-009: Status badges draft/published/archived

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-PROP-INV |

**Description**

Status badges draft/published/archived. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Inventory/detail admin views

**Main Flow**

1. Show color-coded badges per HTML

**Alternate Flow**

- Unknown status -> safe label

**Validation**

- Status from API

**Acceptance Criteria**

- [ ] Badges correct

---
#### FR-PROP-M-010: Row actions edit/duplicate/archive/delete

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-PROP-INV |

**Description**

Row actions edit/duplicate/archive/delete. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Inventory row exists
- Authorized

**Main Flow**

1. Edit opens editor
2. Duplicate clones
3. Archive sets archived
4. Delete removes/soft-deletes per policy

**Alternate Flow**

- Confirm destructive actions if designed

**Validation**

- AuthZ enforced

**Acceptance Criteria**

- [ ] Actions work and persist

---
#### FR-PROP-M-011: Bulk select status/export/delete

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-PROP-INV |

**Description**

Bulk select status/export/delete. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Rows selected

**Main Flow**

1. Bulk change status
2. Bulk export
3. Bulk delete

**Alternate Flow**

- Partial failure reports errors

**Validation**

- Selection required

**Acceptance Criteria**

- [ ] Bulk toolbar per HTML

---
#### FR-PROP-M-012: Column customization

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Should |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-PROP-INV |

**Description**

Column customization. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Inventory open

**Main Flow**

1. Show/hide columns

**Alternate Flow**

- Reset columns

**Validation**

- Preference local or persisted

**Acceptance Criteria**

- [ ] Customization matches HTML capability

---
#### FR-PROP-M-013: Export CSV

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Should |
| **Actors** | Admin+ |
| **Screens** | SCR-PROP-INV |

**Description**

Export CSV. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Inventory open

**Main Flow**

1. Export current filtered set to CSV

**Alternate Flow**

- Empty export allowed

**Validation**

- AuthZ

**Acceptance Criteria**

- [ ] CSV downloads

---
#### FR-PROP-M-014: Inventory empty state

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-PROP-INV |

**Description**

Inventory empty state. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- No properties match filters

**Main Flow**

1. Show empty message per HTML

**Alternate Flow**

- Clear filters recovery

**Validation**

- N/A

**Acceptance Criteria**

- [ ] Empty state shown

---
#### FR-PROP-M-015: Views/saves count columns

| Field | Value |
|-------|-------|
| **Module** | MOD-PROP-ADM |
| **Scope** | MVP |
| **Priority** | Should |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-PROP-INV |

**Description**

Views/saves count columns. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Metrics available

**Main Flow**

1. Show views/saves columns where designed

**Alternate Flow**

- Missing metrics show zero

**Validation**

- Counts non-negative

**Acceptance Criteria**

- [ ] Columns display when enabled

---
### 4.6 Bulk Upload

#### FR-BULK-001: Bulk upload validation results screen

| Field | Value |
|-------|-------|
| **Module** | MOD-BULK |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin, Super Admin |
| **Screens** | SCR-BULK |

**Description**

Bulk upload validation results screen. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Admin uploaded file

**Main Flow**

1. Navigate to validation results UI

**Alternate Flow**

- Upload parse failure -> error

**Validation**

- File type accepted

**Acceptance Criteria**

- [ ] SCR-BULK shown with results

---
#### FR-BULK-002: Validation summary counts

| Field | Value |
|-------|-------|
| **Module** | MOD-BULK |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-BULK |

**Description**

Validation summary counts. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Validation completed

**Main Flow**

1. Show total/valid/error/warning counts

**Alternate Flow**

- Zero categories show 0

**Validation**

- Counts consistent with tables

**Acceptance Criteria**

- [ ] Summary matches HTML

---
#### FR-BULK-003: Error details table

| Field | Value |
|-------|-------|
| **Module** | MOD-BULK |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-BULK |

**Description**

Error details table. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Errors exist

**Main Flow**

1. Show row, field, message, value, suggested fix

**Alternate Flow**

- No errors -> empty errors tab

**Validation**

- Messages actionable

**Acceptance Criteria**

- [ ] Error table complete

---
#### FR-BULK-004: Download error report CSV

| Field | Value |
|-------|-------|
| **Module** | MOD-BULK |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-BULK |

**Description**

Download error report CSV. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Validation session exists

**Main Flow**

1. Download CSV with errors

**Alternate Flow**

- No errors -> empty/minimal report

**Validation**

- AuthZ

**Acceptance Criteria**

- [ ] File downloads

---
#### FR-BULK-005: Import valid rows only

| Field | Value |
|-------|-------|
| **Module** | MOD-BULK |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-BULK |

**Description**

Import valid rows only. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Valid rows > 0

**Main Flow**

1. Import persists only valid rows
2. Skip invalid

**Alternate Flow**

- Idempotent re-import guarded

**Validation**

- Confirm action

**Acceptance Criteria**

- [ ] Inventory reflects imported rows only

---
#### FR-BULK-006: Fix and re-upload path

| Field | Value |
|-------|-------|
| **Module** | MOD-BULK |
| **Scope** | MVP |
| **Priority** | Should |
| **Actors** | Admin+ |
| **Screens** | SCR-BULK |

**Description**

Fix and re-upload path. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Errors exist

**Main Flow**

1. User fixes file and re-uploads
2. New validation session

**Alternate Flow**

- Cancel aborts

**Validation**

- Same schema validation

**Acceptance Criteria**

- [ ] Re-upload produces new results

---
### 4.7 Customer Portal

#### FR-CUS-001: Customer dashboard profile and stats

| Field | Value |
|-------|-------|
| **Module** | MOD-CUS |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Customer |
| **Screens** | SCR-CUS-DASH |

**Description**

Customer dashboard profile and stats. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Authenticated Customer

**Main Flow**

1. Show profile, saved count, inquiries, requirements %

**Alternate Flow**

- Zero stats ok

**Validation**

- AuthZ Customer

**Acceptance Criteria**

- [ ] Matches SCR-CUS-DASH HTML for stats/profile

---
#### FR-CUS-002: Saved properties grid with remove

| Field | Value |
|-------|-------|
| **Module** | MOD-FAV |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Customer |
| **Screens** | SCR-CUS-DASH |

**Description**

Saved properties grid with remove. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Customer has favorites possibly empty

**Main Flow**

1. List saved properties
2. Remove unfavorites

**Alternate Flow**

- Empty grid empty state

**Validation**

- Own favorites only

**Acceptance Criteria**

- [ ] Grid matches HTML; remove persists

---
#### FR-CUS-003: Requirement profile editor

| Field | Value |
|-------|-------|
| **Module** | MOD-CUS |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Customer |
| **Screens** | SCR-CUS-DASH |

**Description**

Requirement profile editor. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Customer authenticated

**Main Flow**

1. Edit budget, type, bedrooms, location preferences
2. Save
3. Completion % updates

**Alternate Flow**

- Validation on ranges

**Validation**

- Field constraints

**Acceptance Criteria**

- [ ] Profile persists and affects completion %

---
#### FR-CUS-004: Inquiry history/status

| Field | Value |
|-------|-------|
| **Module** | MOD-CUS / MOD-CRM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Customer |
| **Screens** | SCR-CUS-DASH |

**Description**

Inquiry history/status. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Customer authenticated

**Main Flow**

1. List inquiries with status

**Alternate Flow**

- None -> empty

**Validation**

- Own inquiries only

**Acceptance Criteria**

- [ ] History visible without shipping excluded timeline product

---
#### FR-CUS-005: Notifications bell unread indicator

| Field | Value |
|-------|-------|
| **Module** | MOD-NTF |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Customer (and roles with bell) |
| **Screens** | SCR-CUS-DASH, SCR-NOTIF |

**Description**

Notifications bell unread indicator. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- In-app notifications exist possibly

**Main Flow**

1. Bell shows unread
2. Open dropdown list

**Alternate Flow**

- Mark read

**Validation**

- Auth required

**Acceptance Criteria**

- [ ] Bell/dropdown per HTML/NotificationsDropdown

---
#### FR-CUS-006: Quick actions New search / Edit profile / Saved searches

| Field | Value |
|-------|-------|
| **Module** | MOD-CUS |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Customer |
| **Screens** | SCR-CUS-DASH |

**Description**

Quick actions New search / Edit profile / Saved searches. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Dashboard open

**Main Flow**

1. Actions navigate/open designed flows

**Alternate Flow**

- Saved searches empty state

**Validation**

- Labels match HTML

**Acceptance Criteria**

- [ ] Actions functional

---
#### FR-CUS-007: Rich activity/inquiry timeline product

| Field | Value |
|-------|-------|
| **Module** | MOD-TIMELINE |
| **Scope** | FUTURE / EXCLUDED-MVP |
| **Priority** | Won't (MVP) |
| **Actors** | Customer |
| **Screens** | SCR-CUS-DASH |

**Description**

Rich activity/inquiry timeline product. Scope `FUTURE / EXCLUDED-MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Constitution activates timeline

**Main Flow**

1. Future timeline UX

**Alternate Flow**

- MVP uses inquiry list only

**Validation**

- N/A MVP

**Acceptance Criteria**

- [ ] MVP does not ship activity timeline system

---
### 4.8 CRM and Leads

#### FR-CRM-001: Lead capture forms

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+, Customer |
| **Screens** | SCR-PROP-D, SCR-HOME |

**Description**

Lead capture forms. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Capture form on property/public surfaces

**Main Flow**

1. Submit lead with source + property interest when applicable

**Alternate Flow**

- Validation errors
- Idempotent retry

**Validation**

- Required contact fields
- Idempotency-Key supported

**Acceptance Criteria**

- [ ] Lead stored and notifiable

---
#### FR-CRM-002: Lead list view

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin, Super Admin |
| **Screens** | SCR-CLIENTS |

**Description**

Lead list view. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Authorized actor

**Main Flow**

1. List leads (ClientsView non-Kanban)
2. Open detail

**Alternate Flow**

- Empty list empty state
- Filters if designed

**Validation**

- Role scoping: agent sees assigned/own as rules define

**Acceptance Criteria**

- [ ] List works; Kanban not required

---
#### FR-CRM-003: Add lead modal/flow

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-ADD-LEAD |

**Description**

Add lead modal/flow. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Authorized

**Main Flow**

1. Open AddLeadModal
2. Enter fields
3. Create lead

**Alternate Flow**

- Validation errors

**Validation**

- Required fields

**Acceptance Criteria**

- [ ] Lead appears in list

---
#### FR-CRM-004: Lead detail header (name, stage, source, score)

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-LEAD-D |

**Description**

Lead detail header (name, stage, source, score). Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Lead exists
- Authorized

**Main Flow**

1. Open detail
2. Show header fields

**Alternate Flow**

- Missing score -> hide/zero

**Validation**

- AuthZ

**Acceptance Criteria**

- [ ] Matches lead detail HTML header

---
#### FR-CRM-005: Lead contact panel

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-LEAD-D |

**Description**

Lead contact panel. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Lead detail open

**Main Flow**

1. Show phone, email, preferred time

**Alternate Flow**

- Missing optional fields ok

**Validation**

- Data accuracy

**Acceptance Criteria**

- [ ] Panel matches HTML

---
#### FR-CRM-006: Property interests on lead

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-LEAD-D |

**Description**

Property interests on lead. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Lead may have interests

**Main Flow**

1. Show related properties/inquiries

**Alternate Flow**

- None -> empty

**Validation**

- Links to properties

**Acceptance Criteria**

- [ ] Interests visible

---
#### FR-CRM-007: Timestamped notes

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-LEAD-D |

**Description**

Timestamped notes. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Lead detail open

**Main Flow**

1. Add note
2. List notes with timestamps

**Alternate Flow**

- Empty notes ok

**Validation**

- Note text required

**Acceptance Criteria**

- [ ] Notes persist

---
#### FR-CRM-008: Change lead stage

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-LEAD-D, SCR-CLIENTS |

**Description**

Change lead stage. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Lead detail/list

**Main Flow**

1. Change stage
2. Persist
3. Badge updates

**Alternate Flow**

- Invalid stage rejected

**Validation**

- Allowed stage set

**Acceptance Criteria**

- [ ] Stage update via API persists

---
#### FR-CRM-009: Schedule visit

| Field | Value |
|-------|-------|
| **Module** | MOD-TOUR |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Agent, Admin+, Customer/Guest via CTA |
| **Screens** | SCR-SCHED, SCR-LEAD-D, SCR-PROP-D |

**Description**

Schedule visit. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- ScheduleVisitModal available

**Main Flow**

1. Enter visit details
2. Confirm
3. Create visit request

**Alternate Flow**

- Validation errors

**Validation**

- Date/time/contact validation

**Acceptance Criteria**

- [ ] Visit recorded; modal UX works

---
#### FR-CRM-010: Call/email action buttons

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | MVP |
| **Priority** | Should |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-LEAD-D |

**Description**

Call/email action buttons. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Lead has phone/email

**Main Flow**

1. tel:/mailto: or equivalent actions

**Alternate Flow**

- Missing contact disables action

**Validation**

- N/A

**Acceptance Criteria**

- [ ] Buttons present per HTML

---
#### FR-CRM-011: Communication timeline / call logs product

| Field | Value |
|-------|-------|
| **Module** | MOD-TIMELINE |
| **Scope** | FUTURE / EXCLUDED-MVP |
| **Priority** | Won't (MVP) |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-LEAD-D |

**Description**

Communication timeline / call logs product. Scope `FUTURE / EXCLUDED-MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Future activation

**Main Flow**

1. Future timeline

**Alternate Flow**

- MVP omitted

**Validation**

- N/A

**Acceptance Criteria**

- [ ] Not in MVP

---
#### FR-CRM-012: Follow-up tasks / reminders

| Field | Value |
|-------|-------|
| **Module** | MOD-REMIND |
| **Scope** | FUTURE / EXCLUDED-MVP |
| **Priority** | Won't (MVP) |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-LEAD-D |

**Description**

Follow-up tasks / reminders. Scope `FUTURE / EXCLUDED-MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Future activation

**Main Flow**

1. Future reminders

**Alternate Flow**

- MVP omitted

**Validation**

- N/A

**Acceptance Criteria**

- [ ] Not in MVP

---
#### FR-CRM-013: Convert to opportunity

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | FUTURE |
| **Priority** | Could |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-LEAD-D |

**Description**

Convert to opportunity. Scope `FUTURE` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Future CRM enhancement

**Main Flow**

1. Future convert action

**Alternate Flow**

- MVP omitted

**Validation**

- N/A

**Acceptance Criteria**

- [ ] Documented future only

---
#### FR-CRM-014: Kanban pipeline

| Field | Value |
|-------|-------|
| **Module** | MOD-KANBAN |
| **Scope** | FUTURE / EXCLUDED-MVP |
| **Priority** | Won't (MVP) |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-LEAD-KANBAN |

**Description**

Kanban pipeline. Scope `FUTURE / EXCLUDED-MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Constitution amendment

**Main Flow**

1. Future Kanban DnD/WIP/bulk

**Alternate Flow**

- MVP: no nav entry

**Validation**

- N/A

**Acceptance Criteria**

- [ ] SCR-LEAD-KANBAN not shipped in MVP

---
#### FR-CRM-015: Contact management module beyond leads

| Field | Value |
|-------|-------|
| **Module** | MOD-CRM |
| **Scope** | FUTURE |
| **Priority** | Won't (MVP) |
| **Actors** | Admin+ |
| **Screens** | N/A |

**Description**

Contact management module beyond leads. Scope `FUTURE` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Future CRM-004

**Main Flow**

1. Future contacts module

**Alternate Flow**

- MVP uses lead fields only

**Validation**

- N/A

**Acceptance Criteria**

- [ ] Not in MVP

---
### 4.9 Admin Analytics and Reporting

#### FR-ADM-001: Command center KPI cards

| Field | Value |
|-------|-------|
| **Module** | MOD-RPT |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin, Super Admin (Agent limited if designed) |
| **Screens** | SCR-CMD |

**Description**

Command center KPI cards. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Authorized

**Main Flow**

1. Show listings, leads, conversion, sessions with trends

**Alternate Flow**

- Metrics unavailable -> zeros/error

**Validation**

- Date range applied

**Acceptance Criteria**

- [ ] Matches SCR-CMD KPI row

---
#### FR-ADM-002: Lead source funnel chart

| Field | Value |
|-------|-------|
| **Module** | MOD-RPT |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-CMD |

**Description**

Lead source funnel chart. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Command center open

**Main Flow**

1. Render source funnel/donut

**Alternate Flow**

- No data empty chart

**Validation**

- Date range

**Acceptance Criteria**

- [ ] Chart present per HTML

---
#### FR-ADM-003: Property views over time chart

| Field | Value |
|-------|-------|
| **Module** | MOD-RPT |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-CMD |

**Description**

Property views over time chart. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Command center open

**Main Flow**

1. Render views line chart

**Alternate Flow**

- No data empty

**Validation**

- Date range

**Acceptance Criteria**

- [ ] Chart present

---
#### FR-ADM-004: Lead stage distribution chart

| Field | Value |
|-------|-------|
| **Module** | MOD-RPT |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-CMD |

**Description**

Lead stage distribution chart. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Command center open

**Main Flow**

1. Render stage distribution

**Alternate Flow**

- No data empty

**Validation**

- Date range

**Acceptance Criteria**

- [ ] Chart present

---
#### FR-ADM-005: Recent activity feed with filters

| Field | Value |
|-------|-------|
| **Module** | MOD-RPT |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-CMD |

**Description**

Recent activity feed with filters. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Command center open

**Main Flow**

1. Show feed
2. Filter by type
3. View all if designed

**Alternate Flow**

- Empty feed ok

**Validation**

- Distinct from excluded CRM timeline product

**Acceptance Criteria**

- [ ] Feed matches HTML

---
#### FR-ADM-006: Date range picker

| Field | Value |
|-------|-------|
| **Module** | MOD-RPT |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-CMD |

**Description**

Date range picker. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Command center open

**Main Flow**

1. Change range
2. Charts/feed refresh

**Alternate Flow**

- Invalid range rejected

**Validation**

- From <= To

**Acceptance Criteria**

- [ ] Range controls metrics

---
#### FR-ADM-007: Reports view

| Field | Value |
|-------|-------|
| **Module** | MOD-RPT |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-REPORTS |

**Description**

Reports view. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Authorized

**Main Flow**

1. Open AdminReportsView
2. View reports content

**Alternate Flow**

- Empty reports

**Validation**

- AuthZ

**Acceptance Criteria**

- [ ] Reports accessible

---
#### FR-ADM-008: Tasks view

| Field | Value |
|-------|-------|
| **Module** | MOD-RPT |
| **Scope** | FUTURE |
| **Priority** | Could |
| **Actors** | Agent, Admin+ |
| **Screens** | SCR-TASKS |

**Description**

Tasks view. Scope `FUTURE` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Future activation

**Main Flow**

1. TasksView product

**Alternate Flow**

- MVP omitted unless required elsewhere

**Validation**

- N/A

**Acceptance Criteria**

- [ ] Not MVP matrix item

---
### 4.10 AI Features

#### FR-AI-001: Conversational AI chatbot Gemini

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-CHAT |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Guest+ |
| **Screens** | SCR-HOME |

**Description**

Conversational AI chatbot Gemini. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Chat widget available

**Main Flow**

1. Send/receive messages via Gemini

**Alternate Flow**

- Failure user-safe error
- Escalation if configured

**Validation**

- No client Gemini key
- Rate limit

**Acceptance Criteria**

- [ ] Gemini only; no alternate LLM

---
#### FR-AI-002: Configurable chat greeting

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-CFG |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin configures; users consume |
| **Screens** | SCR-AI-CFG, SCR-HOME |

**Description**

Configurable chat greeting. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- AI config saved

**Main Flow**

1. Widget shows configured greeting

**Alternate Flow**

- Missing config -> default greeting

**Validation**

- Greeting length limits

**Acceptance Criteria**

- [ ] Greeting updates without redeploy

---
#### FR-AI-003: FAQ library management

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-CFG |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-AI-CFG |

**Description**

FAQ library management. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- AI config UI

**Main Flow**

1. Add/edit/delete FAQs
2. Persist
3. Chat uses FAQs

**Alternate Flow**

- Empty FAQ library ok

**Validation**

- Q/A required

**Acceptance Criteria**

- [ ] FAQ CRUD works

---
#### FR-AI-004: Escalation rules and working hours

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-CFG |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-AI-CFG |

**Description**

Escalation rules and working hours. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- AI config UI

**Main Flow**

1. Configure escalation conditions/hours
2. Chat respects rules

**Alternate Flow**

- Invalid schedule rejected

**Validation**

- Rule schema valid

**Acceptance Criteria**

- [ ] Rules persist and apply

---
#### FR-AI-005: Tone/prompt parameters Gemini-only

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-CFG |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-AI-CFG |

**Description**

Tone/prompt parameters Gemini-only. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- AI config UI

**Main Flow**

1. Set tone/parameters
2. Apply to Gemini

**Alternate Flow**

- HTML vendor labels constrained to Gemini

**Validation**

- No Bedrock/other providers

**Acceptance Criteria**

- [ ] Parameters affect Gemini responses

---
#### FR-AI-006: Preview chat in config

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-CFG |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-AI-CFG |

**Description**

Preview chat in config. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- AI config UI

**Main Flow**

1. Preview uses current unsaved/saved config per design
2. Test greeting/FAQ

**Alternate Flow**

- Preview AI errors shown

**Validation**

- Admin only

**Acceptance Criteria**

- [ ] Preview works per HTML

---
#### FR-AI-007: Loan analysis Gemini + formula fallback

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-LOAN |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Customer+ |
| **Screens** | SCR-LOAN, SCR-PROP-D |

**Description**

Loan analysis Gemini + formula fallback. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Property context
- Loan modal

**Main Flow**

1. Submit inputs
2. Gemini analysis
3. On failure use formula fallback if available

**Alternate Flow**

- Validation errors
- Total AI failure error state

**Validation**

- Numeric inputs valid

**Acceptance Criteria**

- [ ] Modal works; no non-Gemini LLM

---
#### FR-AI-008: Health endpoint

| Field | Value |
|-------|-------|
| **Module** | MOD-AI-SEARCH |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Ops |
| **Screens** | N/A |

**Description**

Health endpoint. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Backend running

**Main Flow**

1. GET health returns liveness

**Alternate Flow**

- Dependency degradation signaled if designed

**Validation**

- Unauthenticated ok for health

**Acceptance Criteria**

- [ ] Health endpoint available

---
### 4.11 Notifications and CMS Platform

#### FR-PLT-001: In-app notifications list/dropdown

| Field | Value |
|-------|-------|
| **Module** | MOD-NTF |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Authenticated users |
| **Screens** | SCR-NOTIF |

**Description**

In-app notifications list/dropdown. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- User authenticated

**Main Flow**

1. Open notifications
2. List items
3. Mark read

**Alternate Flow**

- Empty list

**Validation**

- Own notifications only

**Acceptance Criteria**

- [ ] In-app channel works

---
#### FR-PLT-002: Email notifications for key events

| Field | Value |
|-------|-------|
| **Module** | MOD-NTF |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | System -> Users |
| **Screens** | N/A |

**Description**

Email notifications for key events. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Notification rules enable email
- Event occurs e.g. new lead

**Main Flow**

1. Send email to recipients

**Alternate Flow**

- Email provider failure logged; in-app may still succeed

**Validation**

- Valid recipient emails

**Acceptance Criteria**

- [ ] Email sent for configured events; no SMS/WhatsApp/push

---
#### FR-PLT-003: Admin notification rules UI

| Field | Value |
|-------|-------|
| **Module** | MOD-NTF |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+ |
| **Screens** | SCR-NTF-RULES |

**Description**

Admin notification rules UI. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Admin authorized

**Main Flow**

1. Configure rules in AdminNotificationRulesView
2. Persist

**Alternate Flow**

- Invalid rule rejected

**Validation**

- Rule fields validated

**Acceptance Criteria**

- [ ] Rules affect notification dispatch

---
#### FR-PLT-004: CMS page management and public pages

| Field | Value |
|-------|-------|
| **Module** | MOD-CMS |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | Admin+; Guest public |
| **Screens** | SCR-CMS |

**Description**

CMS page management and public pages. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Admin for manage; public for read

**Main Flow**

1. CRUD pages
2. Publish
3. Public route renders

**Alternate Flow**

- Unpublished not public

**Validation**

- Slug unique

**Acceptance Criteria**

- [ ] CMS works admin+public

---
#### FR-PLT-005: SMS / WhatsApp / Push channels

| Field | Value |
|-------|-------|
| **Module** | MOD-SMS |
| **Scope** | EXCLUDED-MVP |
| **Priority** | Won't (MVP) |
| **Actors** | System |
| **Screens** | N/A |

**Description**

SMS / WhatsApp / Push channels. Scope `EXCLUDED-MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Future amendment

**Main Flow**

1. Future channels

**Alternate Flow**

- MVP forbidden

**Validation**

- N/A

**Acceptance Criteria**

- [ ] Not implemented in MVP

---
### 4.12 Shared UX States

#### FR-UX-001: Loading skeletons/spinners per HTML

| Field | Value |
|-------|-------|
| **Module** | Shared |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | All |
| **Screens** | All MVP screens |

**Description**

Loading skeletons/spinners per HTML. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Async load

**Main Flow**

1. Show designed loading

**Alternate Flow**

- N/A

**Validation**

- Visual fidelity

**Acceptance Criteria**

- [ ] Loading states present on MVP screens

---
#### FR-UX-002: Empty states per HTML

| Field | Value |
|-------|-------|
| **Module** | Shared |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | All |
| **Screens** | All MVP screens |

**Description**

Empty states per HTML. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Empty data

**Main Flow**

1. Show designed empty

**Alternate Flow**

- N/A

**Validation**

- Visual fidelity

**Acceptance Criteria**

- [ ] Empty states present

---
#### FR-UX-003: Error states/toasts/inline validation per HTML

| Field | Value |
|-------|-------|
| **Module** | Shared |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | All |
| **Screens** | All MVP screens |

**Description**

Error states/toasts/inline validation per HTML. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Error/validation condition

**Main Flow**

1. Show designed error UX

**Alternate Flow**

- N/A

**Validation**

- Messages safe (no secrets)

**Acceptance Criteria**

- [ ] Error UX present

---
#### FR-UX-004: Hover/active/focus states match HTML

| Field | Value |
|-------|-------|
| **Module** | Shared |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | All |
| **Screens** | All MVP screens |

**Description**

Hover/active/focus states match HTML. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Interactive elements

**Main Flow**

1. States match HTML

**Alternate Flow**

- N/A

**Validation**

- No redesign

**Acceptance Criteria**

- [ ] Screenshot/HTML verification passes

---
#### FR-UX-005: Responsive behavior matches HTML

| Field | Value |
|-------|-------|
| **Module** | Shared |
| **Scope** | MVP |
| **Priority** | Must |
| **Actors** | All |
| **Screens** | All MVP screens |

**Description**

Responsive behavior matches HTML. Scope `MVP` as defined in the Product Requirements Document and Project Constitution.

**Preconditions**

- Viewport mobile/tablet/desktop

**Main Flow**

1. Layout adapts per HTML

**Alternate Flow**

- N/A

**Validation**

- Breakpoints honored

**Acceptance Criteria**

- [ ] Responsive verification passes

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
| ID | Requirement | Target | Acceptance |
|----|-------------|--------|------------|
| NFR-P-001 | Average page load primary routes | < 2 seconds | Measured on staging reference broadband |
| NFR-P-002 | List endpoints paginated | No unbounded lists | API review |
| NFR-P-003 | AI non-blocking + timeout/fallback | Designed loading; fallback on timeout | E2E fallback test |
| NFR-P-004 | Lazy-load maps | Leaflet only on map pages | Bundle/network check |

### 5.2 Availability and Reliability
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-A-001 | Uptime | 99.5%+ |
| NFR-A-002 | AI outage UX | Fallback/empty never blank dead-end |
| NFR-A-003 | Health checks | `/api/v1/health` (or equivalent) |

### 5.3 Security Requirements
See Section 9. Summary: email/password; hashed passwords; JWT; server RBAC; validation; no browser Gemini keys; rate limits; OWASP basics.

### 5.4 Usability and UI Fidelity
| ID | Requirement |
|----|-------------|
| NFR-U-001 | Visually indistinguishable from HTML for in-scope screens |
| NFR-U-002 | Responsive per HTML |
| NFR-U-003 | Accessibility baseline without visual redesign |
| NFR-U-004 | No redesign / no creative UI interpretation |

### 5.5 Maintainability
Clean Architecture; strict TypeScript; centralized API; >80% unit coverage core logic; no ESLint warnings on completed screens.

### 5.6 Compatibility and Deployment
Modern evergreen browsers; frontend on Vercel; Constitution stack mandatory.

---

## 6. Module Requirements

| Module | Responsibilities | Key FRs | MVP |
|--------|------------------|---------|-----|
| MOD-AUTH | Register/login/logout/tokens/guards | FR-AUTH-001..004,007 | Yes |
| MOD-USERS | User admin | FR-AUTH-005 | Yes |
| MOD-AGENTS | Agent profiles | FR-AUTH-006, FR-PROP-D-006 | Yes |
| MOD-HOME | Homepage marketing + entries | FR-HOME-* | Yes |
| MOD-SEARCH | Filters, states, pagination | FR-SEARCH-* | Yes |
| MOD-AI-SEARCH | Gemini ranking/fallback | FR-SEARCH-001/003/004/011, FR-AI-008 | Yes |
| MOD-PROP-PUB | Public details | FR-PROP-D-* | Yes |
| MOD-PROP-ADM | Inventory/editor | FR-PROP-M-* (except excluded) | Yes |
| MOD-MEDIA | Photo/floorplan storage | FR-PROP-M-006, FR-PROP-D-002/003 | Yes |
| MOD-MAP | Leaflet+OSM | FR-PROP-D-005 | Yes |
| MOD-BULK | Validate/import | FR-BULK-* | Yes |
| MOD-FAV | Favorites | FR-SEARCH-010, FR-PROP-D-009, FR-CUS-002 | Yes |
| MOD-CUS | Customer dashboard | FR-CUS-* (MVP) | Yes |
| MOD-CRM | Leads | FR-CRM-* (MVP) | Yes |
| MOD-TOUR | Schedule visit | FR-CRM-009, FR-PROP-D-008 | Yes |
| MOD-AI-CHAT | Chat widget | FR-AI-001, FR-HOME-005 | Yes |
| MOD-AI-CFG | Admin AI config | FR-AI-002..006 | Yes |
| MOD-AI-LOAN | Loan analysis | FR-AI-007 | Yes |
| MOD-NTF | Email + in-app + rules | FR-PLT-001..003, FR-CUS-005 | Yes |
| MOD-CMS | Pages + homepage CMS | FR-PLT-004, FR-HOME-007 | Yes |
| MOD-RPT | Command center + reports | FR-ADM-* (MVP) | Yes |
| MOD-KANBAN | Kanban | FR-CRM-014 | No |
| MOD-TIMELINE | Timeline | FR-CRM-011, FR-CUS-007 | No |
| MOD-REMIND | Reminders | FR-CRM-012 | No |
| MOD-AUTO | Automation | — | No |
| MOD-VT | Virtual tours/video | FR-PROP-M-007 | No |
| MOD-SMS | SMS/WA/Push | FR-PLT-005 | No |
| MOD-TXN | Transactions | Roadmap | No |

Each MVP module shall expose services behind Express routes, Prisma persistence where applicable, and frontend feature hooks using the centralized API client.

---

## 7. Screen Requirements

### 7.1 General Screen Rules
For every MVP screen: Default, Loading, Empty (as applicable), Error, Hover/Active/Focus, Responsive. Visual match to `design_reference` HTML + screenshot. Search also requires Standard AI, Fallback, Empty variants.

### 7.2 Screen Catalog and Requirements

| Screen ID | HTML / Component | Roles | Must Satisfy |
|-----------|------------------|-------|--------------|
| SCR-HOME | propvista_crm_homepage | Guest+ | FR-HOME-*, FR-AUTH-007, chat |
| SCR-SEARCH-STD | search_results_standard_view | Guest+ | FR-SEARCH-001..010 |
| SCR-SEARCH-FB | search_results_filter_fallback_view | Guest+ | FR-SEARCH-011,013 |
| SCR-SEARCH-EMPTY | search_results_empty_state | Guest+ | FR-SEARCH-012 |
| SCR-PROP-D | property_details_premium_view | Guest+ | FR-PROP-D-* |
| SCR-CUS-DASH | customer_account_dashboard | Customer | FR-CUS-001..006 |
| SCR-LEAD-KANBAN | lead_pipeline_kanban_view | — | Not MVP |
| SCR-LEAD-D | lead_detail_sarah_jenkins | Agent/Admin | FR-CRM-004..010 (MVP subset) |
| SCR-PROP-EDIT | listing_editor_basic_info | Agent/Admin | FR-PROP-M-001..006 |
| SCR-PROP-INV | property_inventory_admin_view | Agent/Admin | FR-PROP-M-008..015 |
| SCR-BULK | bulk_upload_validation_results | Admin | FR-BULK-* |
| SCR-AI-CFG | ai_chatbot_configuration | Admin | FR-AI-002..006 |
| SCR-CMD | admin_agent_command_center | Admin | FR-ADM-001..006 |
| SCR-LOGIN | LoginPage | All | FR-AUTH-002 |
| SCR-REGISTER | Register | Guest | FR-AUTH-001 |
| SCR-ADMIN-SIDE | AdminSidebar | Agent/Admin | Nav without Kanban |
| SCR-CLIENTS | ClientsView | Agent/Admin | FR-CRM-002 |
| SCR-ADD-LEAD | AddLeadModal | Agent/Admin | FR-CRM-003 |
| SCR-AGENTS | AdminAgentsView | Admin | FR-AUTH-006 |
| SCR-USERS | AdminUsersView | Admin | FR-AUTH-005 |
| SCR-CMS | AdminCMSView | Admin | FR-PLT-004 |
| SCR-REPORTS | AdminReportsView | Admin | FR-ADM-007 |
| SCR-NTF-RULES | AdminNotificationRulesView | Admin | FR-PLT-003 |
| SCR-LOAN | AILoanAnalysisModal | Customer+ | FR-AI-007 |
| SCR-SCHED | ScheduleVisitModal | Mixed | FR-CRM-009 |
| SCR-NOTIF | NotificationsDropdown | Auth | FR-PLT-001 |

### 7.3 Screen Acceptance (Constitution Screen Completion)
A screen is complete only when pixel-perfect HTML match, screenshot comparison, responsive, interactions, validation, loading/empty/error, API integrated, no console/TS/ESLint issues, reviewed, QA approved.

---

## 8. API Requirements

### 8.1 General API Rules
- Base prefix `/api/v1`
- JSON request/response
- Consistent error envelope: `{ "error": { "code", "message", "details": [] } }`
- Auth bearer/cookie tokens
- Pagination meta for lists
- Idempotency-Key on lead create when specified
- Centralized frontend API client only

### 8.2 Endpoint Capabilities (Normative)

#### Auth
- `POST /auth/register`
- `POST /auth/token` (login)
- `POST /auth/refresh`
- `POST /auth/logout` (if applicable)
- `GET /auth/me`

#### Users / Agents
- Admin users CRUD/deactivate
- Agents CRUD

#### Properties
- `GET/POST /properties`
- `GET/PATCH/DELETE /properties/{id}`
- `GET /properties/featured`
- Amenities, landmarks, images sub-resources
- Status transitions draft/publish/archive
- Export CSV
- Bulk validate + import

#### Search / AI
- `POST /ai/search` (Gemini; returns matches, scores, reasons, or fallback)
- `GET /search/suggest`
- `POST /ai/chat`
- `POST /ai/loan-analysis`
- `GET /health`

#### Favorites
- `GET/POST/DELETE /favorites`

#### Leads
- `POST /leads` (Idempotency-Key)
- `GET /leads`, `GET /leads/{id}`
- `PATCH /leads/{id}`, `PATCH /leads/{id}/stage`
- Notes create/list
- Schedule visit create

#### Notifications / CMS / Metrics / AI Config
- Notifications list/mark-read
- Notification rules CRUD
- CMS pages CRUD + public get + homepage get
- Metrics dashboard
- AI configuration get/update

### 8.3 API Non-Functional
Rate limit auth and AI; validate all writes; never expose secrets; 401/403 correctly.

---

## 9. Security Requirements

| ID | Requirement |
|----|-------------|
| SEC-001 | Email + password only for MVP identity |
| SEC-002 | Password hashing (bcrypt/argon2) |
| SEC-003 | JWT access + refresh; secure storage strategy |
| SEC-004 | Server-side role checks on every protected mutation/query |
| SEC-005 | Input validation/sanitization |
| SEC-006 | Prisma parameterized access only |
| SEC-007 | CORS allowlist |
| SEC-008 | Rate limit auth + AI |
| SEC-009 | Gemini API keys server-only |
| SEC-010 | No secrets in git |
| SEC-011 | Upload MIME/size validation |
| SEC-012 | Soft-deleted/inactive users cannot auth |
| SEC-013 | OWASP baseline (injection, XSS, CSRF as applicable) |

---

## 10. Performance Requirements
Covered in Section 5.1. Additional: index common filters; avoid N+1 Prisma queries; paginate inventories; AI timeouts mandatory.

---

## 11. Database Requirements

### 11.1 Technology
PostgreSQL via Prisma migrations. No manual prod schema drift.

### 11.2 Core Entities
| Entity | Key Fields |
|--------|------------|
| User | email, password_hash, role, is_active, soft delete |
| Agent | name, email, phone, profile_image |
| Property | title, price, address, beds, baths, sqft, type, status, agent_id |
| PropertyAmenity | property_id, amenity |
| NearbyLandmark | property_id, landmark fields |
| PropertyImage | property_id, url, kind (photo/floorplan) |
| Favorite | user_id, property_id |
| Lead | contact fields, source, stage, score, property_id nullable |
| LeadNote | lead_id, body, created_at, author_id |
| VisitRequest | lead/property, schedule fields |
| Notification | user_id, type, read_at, payload |
| NotificationRule | event, channel (email/in-app), enabled |
| CmsPage | slug, title, body, published |
| AiConfig | greeting, faqs JSON, escalation, tone/prompts |
| Metrics events/snapshots | as needed for command center |

### 11.3 Rules
- Price stored/presented as numeric string-safe approach
- Published-only for public search
- Indexes on status, price, location fields, lead stage, user email unique
- Future-excluded entities (Kanban WIP, reminders, push tokens) not required for MVP

---

## 12. Validation Rules

### 12.1 Cross-Cutting
- Client validation mirrors HTML required markers; server is authoritative
- API returns 400/422 with field details
- File uploads: allowlist MIME + max size
- Email format RFC-like practical validation
- Role values constrained to enum

### 12.2 Domain Highlights
| Domain | Rules |
|--------|-------|
| Auth | unique email; password policy; active user |
| Property | required title/price/beds/baths/area; status enum |
| Search | accept empty filters; price min<=max |
| Lead | required contact; idempotency key replay returns same |
| Bulk | row-level schema validation before import |
| AI Config | greeting/FAQ non-empty when saved entries exist |
| Loan | numeric income/loan inputs |

---

## 13. Error Handling

| Layer | Behavior |
|-------|----------|
| UI | Designed error/empty/toast states (FR-UX-003) |
| API | Standard error envelope + proper status codes |
| AI Search | Timeout/error -> fallback mode (FR-SEARCH-011) |
| AI Chat/Loan | User-safe message; loan may formula-fallback |
| Auth | 401/403 without leaking whether email exists beyond policy |
| Bulk | Per-row errors retained for CSV |
| Logging | Server logs with request id; no secrets/PII overload |

Unhandled errors shall not crash the UX into an undirected blank page for primary journeys.

---

## 14. Logging Requirements

| ID | Requirement |
|----|-------------|
| LOG-001 | Structured server logs (JSON preferred) |
| LOG-002 | Include request id, route, user id (if any), role |
| LOG-003 | Log auth failures, AI failures, bulk import summaries |
| LOG-004 | Never log passwords, tokens, Gemini keys |
| LOG-005 | Frontend production builds minimize noisy logs |
| LOG-006 | Correlate AI fallback events for monitoring |

---

## 15. Auditing (Future)

| ID | Requirement | Scope |
|----|-------------|-------|
| AUD-001 | Super Admin action audit trail (config, user role changes) | Future / when Requirements demand depth |
| AUD-002 | Immutable audit log store | Future |
| AUD-003 | Audit query UI for Super Admin | Future |

MVP shall still enforce RBAC and basic logging. Full audit productization is future unless Super Admin audit is explicitly scheduled.

---

## 16. RBAC Requirements

### 16.1 Model
Single organization. Roles only: Guest, Customer, Agent, Admin, Super Admin. No module-level permissions.

### 16.2 Enforcement
| Rule | Requirement |
|------|-------------|
| RBAC-001 | Role persisted on user |
| RBAC-002 | Server checks on all protected endpoints |
| RBAC-003 | UI hiding is not security |
| RBAC-004 | Agent scoped to own/assigned properties and leads per rules |
| RBAC-005 | Admin org-level operations |
| RBAC-006 | Super Admin full data/config/audit-ready access |
| RBAC-007 | Guest limited to public surfaces + registration |

Capability matrix: see PRD Section 7.2 (normative for product).

---

## 17. AI Requirements

| ID | Requirement |
|----|-------------|
| AI-REQ-001 | Google Gemini is the only LLM |
| AI-REQ-002 | Features: AI Search, AI Chat, Loan Analysis |
| AI-REQ-003 | Admin-configurable prompts/greeting/FAQ/escalation/tone |
| AI-REQ-004 | Search success may include scores + reasons |
| AI-REQ-005 | Search failure/timeout -> filter fallback + visible banner |
| AI-REQ-006 | Must not fabricate inventory not returned by APIs |
| AI-REQ-007 | Keys never in browser |
| AI-REQ-008 | HTML non-Gemini vendor labels constrained to Gemini |
| AI-REQ-009 | Timeouts and monitoring required |
| AI-REQ-010 | Loan analysis supports formula fallback per Requirements |

Trace to FR-AI-* and FR-SEARCH-001/003/004/011.

---

## 18. Reporting Requirements

| ID | Requirement |
|----|-------------|
| RPT-001 | KPI cards: active listings, active leads, conversion, sessions |
| RPT-002 | Lead source funnel |
| RPT-003 | Property views over time |
| RPT-004 | Lead stage distribution |
| RPT-005 | Activity feed with type filter (command center; not CRM timeline product) |
| RPT-006 | Date range applies to charts/feed |
| RPT-007 | AdminReportsView available |
| RPT-008 | Metrics from backend metrics service (single source) |

Screens: SCR-CMD, SCR-REPORTS. FRs: FR-ADM-001..007.

---

## 19. Notification Requirements

| ID | Requirement |
|----|-------------|
| NTF-001 | In-app notifications list/dropdown + unread |
| NTF-002 | Email notifications for key events (e.g., new lead) |
| NTF-003 | Admin notification rules UI |
| NTF-004 | Channels limited to email + in-app in MVP |
| NTF-005 | SMS/WhatsApp/Push shall not be implemented (FR-PLT-005) |

---

## 20. Search Requirements

Normative FRs: FR-SEARCH-001 through FR-SEARCH-013 plus AI orchestration rules in Section 17.

Shall support: NLP query, loading, scores/reasons, suggestions, filters, clear, grid/list, pagination, favorites on cards, fallback banner path, empty path, reset/refine.

---

## 21. Property Management Requirements

Normative FRs: FR-PROP-D-*, FR-PROP-M-* (excluding FR-PROP-M-007 in MVP), FR-BULK-*.

Shall support: public premium detail; create/edit; draft/publish/archive; amenities; description; photo/floorplan; inventory grid; bulk actions; CSV export; bulk validation import; landmarks; similar carousel.

Shall not support in MVP: video upload, virtual tours.

---

## 22. CRM Requirements

Normative FRs: FR-CRM-001..010 (MVP), FR-CRM-011..015 (Future/Excluded as tagged).

Shall support: capture, list (non-Kanban), add lead, detail header/contact/interests/notes, stage change, schedule visit, call/email actions.

Shall not support in MVP: Kanban, communication timeline product, reminder system, convert-to-opportunity (future), separate contacts module.

---

## 23. CMS Requirements

| ID | Requirement |
|----|-------------|
| CMS-001 | Admin CRUD for pages |
| CMS-002 | Publish/unpublish controls |
| CMS-003 | Public page rendering by slug |
| CMS-004 | Homepage content endpoint influences SCR-HOME |
| CMS-005 | Only published content publicly visible |

FR trace: FR-PLT-004, FR-HOME-007.

---

## 24. Traceability

| Artifact | Relationship |
|----------|--------------|
| PRD FR-IDs | 1:1 with Section 4 FRs |
| design_reference screens | Section 7 |
| Constitution exclusions | Sections 2.4, 4 FUTURE/EXCLUDED FRs |
| Requirements MVP matrix | AUTH/PROP/AI/CRM/ADM IDs mapped in PRD/SRS |
| E2E journeys | PRD Section 15; verify corresponding FRs |

---

## 25. Acceptance of This SRS

This SRS is accepted when Product Owner and Technical Lead confirm:
1. All PRD FRs appear in Section 4 with required fields.
2. MVP exclusions remain Won't/Excluded.
3. Stack/RBAC/AI constraints match Constitution.
4. Screen list matches design_reference + required prototype screens.

---

## Appendix A — FR Index

| ID | Title | Scope | Priority |
|----|-------|-------|----------|
| FR-AUTH-001 | Email/password registration | MVP | Must |
| FR-AUTH-002 | Login / logout with JWT access and refresh | MVP | Must |
| FR-AUTH-003 | Protected routes require authentication | MVP | Must |
| FR-AUTH-004 | Role stored and enforced server-side | MVP | Must |
| FR-AUTH-005 | Admin user management | MVP | Must |
| FR-AUTH-006 | Agent profile management | MVP | Must |
| FR-AUTH-007 | Homepage Sign In and Join AI Pro CTAs | MVP | Must |
| FR-HOME-001 | Homepage hero branding, nav, AI search, suggestion chips | MVP | Must |
| FR-HOME-002 | Featured/curated property cards | MVP | Must |
| FR-HOME-003 | How-it-works journey section | MVP | Must |
| FR-HOME-004 | Testimonials section | MVP | Must |
| FR-HOME-005 | AI chat widget on homepage | MVP | Must |
| FR-HOME-006 | Public contact/lead capture on homepage surfaces | MVP | Must |
| FR-HOME-007 | CMS-influenced homepage content | MVP | Must |
| FR-SEARCH-001 | Natural-language property search | MVP | Must |
| FR-SEARCH-002 | Search loading state | MVP | Must |
| FR-SEARCH-003 | Match score percentage on AI success | MVP | Must |
| FR-SEARCH-004 | Match reasons check/cross | MVP | Must |
| FR-SEARCH-005 | Search auto-suggestions | MVP | Should |
| FR-SEARCH-006 | Filter panel (type, price, beds, amenities, location) | MVP | Must |
| FR-SEARCH-007 | Clear/reset filters | MVP | Must |
| FR-SEARCH-008 | Grid/list view toggle | MVP | Should |
| FR-SEARCH-009 | Search results pagination | MVP | Must |
| FR-SEARCH-010 | Favorite control on result cards | MVP | Must |
| FR-SEARCH-011 | AI failure filter-only fallback with banner | MVP | Must |
| FR-SEARCH-012 | Empty search state | MVP | Must |
| FR-SEARCH-013 | Fallback reset/refine controls | MVP | Must |
| FR-PROP-D-001 | Load property details core fields | MVP | Must |
| FR-PROP-D-002 | Image gallery/carousel | MVP | Must |
| FR-PROP-D-003 | Floorplan section | MVP | Must |
| FR-PROP-D-004 | Overview/details/amenities/price breakdown | MVP | Must |
| FR-PROP-D-005 | Map with Leaflet + OSM and landmarks | MVP | Must |
| FR-PROP-D-006 | Agent contact card | MVP | Must |
| FR-PROP-D-007 | Inquire CTA | MVP | Must |
| FR-PROP-D-008 | Contact agent / Schedule tour CTAs | MVP | Must |
| FR-PROP-D-009 | Favorite on detail | MVP | Must |
| FR-PROP-D-010 | Similar properties carousel | MVP | Should |
| FR-PROP-D-011 | Nearby landmarks data support | MVP | Must |
| FR-PROP-M-001 | Create property listing | MVP | Must |
| FR-PROP-M-002 | Edit property basic info | MVP | Must |
| FR-PROP-M-003 | Save Draft and Publish actions | MVP | Must |
| FR-PROP-M-004 | Amenities checklist and custom amenity | MVP | Must |
| FR-PROP-M-005 | Description and highlights editors | MVP | Must |
| FR-PROP-M-006 | Photo and floorplan upload | MVP | Must |
| FR-PROP-M-007 | Video tour URL / virtual tour fields | FUTURE / EXCLUDED-MVP | Won't (MVP) |
| FR-PROP-M-008 | Inventory grid search/filter/sort/pagination | MVP | Must |
| FR-PROP-M-009 | Status badges draft/published/archived | MVP | Must |
| FR-PROP-M-010 | Row actions edit/duplicate/archive/delete | MVP | Must |
| FR-PROP-M-011 | Bulk select status/export/delete | MVP | Must |
| FR-PROP-M-012 | Column customization | MVP | Should |
| FR-PROP-M-013 | Export CSV | MVP | Should |
| FR-PROP-M-014 | Inventory empty state | MVP | Must |
| FR-PROP-M-015 | Views/saves count columns | MVP | Should |
| FR-BULK-001 | Bulk upload validation results screen | MVP | Must |
| FR-BULK-002 | Validation summary counts | MVP | Must |
| FR-BULK-003 | Error details table | MVP | Must |
| FR-BULK-004 | Download error report CSV | MVP | Must |
| FR-BULK-005 | Import valid rows only | MVP | Must |
| FR-BULK-006 | Fix and re-upload path | MVP | Should |
| FR-CUS-001 | Customer dashboard profile and stats | MVP | Must |
| FR-CUS-002 | Saved properties grid with remove | MVP | Must |
| FR-CUS-003 | Requirement profile editor | MVP | Must |
| FR-CUS-004 | Inquiry history/status | MVP | Must |
| FR-CUS-005 | Notifications bell unread indicator | MVP | Must |
| FR-CUS-006 | Quick actions New search / Edit profile / Saved searches | MVP | Must |
| FR-CUS-007 | Rich activity/inquiry timeline product | FUTURE / EXCLUDED-MVP | Won't (MVP) |
| FR-CRM-001 | Lead capture forms | MVP | Must |
| FR-CRM-002 | Lead list view | MVP | Must |
| FR-CRM-003 | Add lead modal/flow | MVP | Must |
| FR-CRM-004 | Lead detail header (name, stage, source, score) | MVP | Must |
| FR-CRM-005 | Lead contact panel | MVP | Must |
| FR-CRM-006 | Property interests on lead | MVP | Must |
| FR-CRM-007 | Timestamped notes | MVP | Must |
| FR-CRM-008 | Change lead stage | MVP | Must |
| FR-CRM-009 | Schedule visit | MVP | Must |
| FR-CRM-010 | Call/email action buttons | MVP | Should |
| FR-CRM-011 | Communication timeline / call logs product | FUTURE / EXCLUDED-MVP | Won't (MVP) |
| FR-CRM-012 | Follow-up tasks / reminders | FUTURE / EXCLUDED-MVP | Won't (MVP) |
| FR-CRM-013 | Convert to opportunity | FUTURE | Could |
| FR-CRM-014 | Kanban pipeline | FUTURE / EXCLUDED-MVP | Won't (MVP) |
| FR-CRM-015 | Contact management module beyond leads | FUTURE | Won't (MVP) |
| FR-ADM-001 | Command center KPI cards | MVP | Must |
| FR-ADM-002 | Lead source funnel chart | MVP | Must |
| FR-ADM-003 | Property views over time chart | MVP | Must |
| FR-ADM-004 | Lead stage distribution chart | MVP | Must |
| FR-ADM-005 | Recent activity feed with filters | MVP | Must |
| FR-ADM-006 | Date range picker | MVP | Must |
| FR-ADM-007 | Reports view | MVP | Must |
| FR-ADM-008 | Tasks view | FUTURE | Could |
| FR-AI-001 | Conversational AI chatbot Gemini | MVP | Must |
| FR-AI-002 | Configurable chat greeting | MVP | Must |
| FR-AI-003 | FAQ library management | MVP | Must |
| FR-AI-004 | Escalation rules and working hours | MVP | Must |
| FR-AI-005 | Tone/prompt parameters Gemini-only | MVP | Must |
| FR-AI-006 | Preview chat in config | MVP | Must |
| FR-AI-007 | Loan analysis Gemini + formula fallback | MVP | Must |
| FR-AI-008 | Health endpoint | MVP | Must |
| FR-PLT-001 | In-app notifications list/dropdown | MVP | Must |
| FR-PLT-002 | Email notifications for key events | MVP | Must |
| FR-PLT-003 | Admin notification rules UI | MVP | Must |
| FR-PLT-004 | CMS page management and public pages | MVP | Must |
| FR-PLT-005 | SMS / WhatsApp / Push channels | EXCLUDED-MVP | Won't (MVP) |
| FR-UX-001 | Loading skeletons/spinners per HTML | MVP | Must |
| FR-UX-002 | Empty states per HTML | MVP | Must |
| FR-UX-003 | Error states/toasts/inline validation per HTML | MVP | Must |
| FR-UX-004 | Hover/active/focus states match HTML | MVP | Must |
| FR-UX-005 | Responsive behavior matches HTML | MVP | Must |


## Appendix B — Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Initial IEEE-style SRS generated from Constitution, PRD, Requirements, design_reference |

---

# Property AI Studio / PropVista CRM -- IEEE SRS Supplementary Appendices

| Field | Value |
|-------|--------|
| Product | Property AI Studio (UI brand: PropVista CRM) |
| Document Role | Append to primary IEEE SRS (`docs/02_SOFTWARE_REQUIREMENTS_SPECIFICATION.md`) |
| Version | 1.0.0-supplement |
| Effective Date | 2026-07-30 |
| Encoding | ASCII-only (use `--` not em dash) |
| AI Provider | Google Gemini only |
| Stack | Next.js 15, React 19, TypeScript, Tailwind, Express, Prisma, PostgreSQL, Leaflet + OSM |
| Auth | Email + password (JWT access + refresh) |
| Notifications (MVP) | Email + in-app only |
| Organization Model | Single organization; role-based access (Guest, Customer, Agent, Admin, Super Admin) |

This supplement dense-pack operational detail for implementers, QA, and auditors. It does **not** introduce product modules beyond the MVP scope defined in `docs/00_PROJECT_CONSTITUTION.md`, `docs/REQUIREMENTS_AND_PROPOSAL.md`, and `docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md`.

### MVP Scope Boundary (Binding Exclusions)

The following capabilities appear in design references or post-MVP roadmaps but **must not ship** in MVP production navigation or backend behavior:

| Excluded Capability | Rationale Source |
|---------------------|------------------|
| Kanban lead pipeline (SCR-LEAD-KANBAN) | Constitution Out-of-MVP; FR-CRM-014 deferred |
| Activity timeline product | Constitution; FR-CRM-011, FR-CUS-007 subset excluded |
| Reminder system | Constitution; FR-CRM-012 excluded |
| Automation engines | Constitution |
| Virtual tours | Constitution; FR-PROP-M-007 excluded |
| Video upload | Constitution; FR-PROP-M-007 excluded |
| SMS notifications | Constitution; FR-PLT-005 excluded |
| WhatsApp notifications | Constitution; FR-PLT-005 excluded |
| Push notifications | Constitution; FR-PLT-005 excluded |

MVP CRM lead handling uses **list + detail + stage update + notes + schedule visit** only. Command center "recent activity feed" (FR-ADM-005) reflects operational events within MVP bounds; it is not a substitute for the excluded full activity timeline product.

---

## Appendix C -- Detailed Data Dictionary

The logical data model below aligns with Prisma persistence in PostgreSQL. Physical table names may differ if Prisma maps camelCase models; API JSON uses stable camelCase field names unless noted. All timestamps are ISO-8601 UTC strings in API responses. Primary keys are UUID strings unless seed fixtures use deterministic ids in development only.
#### User

Platform account for authentication and role enforcement. One user belongs to the single organization.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | Primary key; never exposed in logs with password hash. |
| email | string (email) | Yes | Unique within org; normalized lowercase. |
| passwordHash | string | Yes | Bcrypt or Argon2; never returned on read APIs. |
| role | enum | Yes | GUEST is implicit for unauthenticated requests; stored roles: CUSTOMER, AGENT, ADMIN, SUPER_ADMIN. |
| firstName | string | Cond | Required for Customer registration; optional for some admin-created users per UI. |
| lastName | string | Cond | Same as firstName. |
| phone | string | No | E.164 or local format validated server-side. |
| avatarUrl | string | No | Local path in dev; CDN URL in prod. |
| isActive | boolean | Yes | Default true; inactive users fail BR-AUTH-4. |
| deletedAt | datetime | No | Soft delete; null when active. |
| createdAt | datetime | Yes | Audit baseline. |
| updatedAt | datetime | Yes | Audit baseline. |
| lastLoginAt | datetime | No | Optional analytics for admin users view. |

#### Agent

Agent profile extension linked to User with role AGENT (or Admin acting as agent on listings).

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | Primary key. |
| userId | UUID | Yes | FK User.id; unique. |
| displayName | string | Yes | Shown on property detail agent card. |
| email | string | Yes | May mirror User.email; used in mailto links. |
| phone | string | Yes | Shown on detail; tel link in UI. |
| photoUrl | string | No | Agent headshot. |
| bio | string | No | Short description if HTML provides field. |
| isActive | boolean | Yes | Inactive agents not assignable to new published listings. |
| createdAt | datetime | Yes |  |
| updatedAt | datetime | Yes |  |

#### Property

Listing record with lifecycle draft/published/archived per BR-PROP-1.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | Public detail route key. |
| slug | string | No | SEO-friendly slug if routing uses it; else id-only. |
| title | string | Yes | BR-PROP-2 required field. |
| description | text | Yes | Rich text or markdown subset per editor. |
| highlights | string[] | No | Bullet highlights section on detail. |
| status | enum | Yes | DRAFT | PUBLISHED | ARCHIVED. |
| propertyType | enum | Yes | Apartment, Villa, Plot, etc. per filter enums. |
| priceAmount | decimal string | Yes | BR-PROP-3 numeric string convention in API. |
| priceCurrency | string | Yes | Default INR for demo org. |
| bedrooms | integer | Yes | Non-negative. |
| bathrooms | number | Yes | Allows 0.5 increments if UI supports. |
| areaSqFt | number | Yes | BR-PROP-2. |
| addressLine1 | string | Yes | Display address. |
| city | string | Yes | Search filter dimension. |
| state | string | No |  |
| postalCode | string | No |  |
| latitude | number | Cond | Required for map when published and coords expected by HTML. |
| longitude | number | Cond | Pair with latitude. |
| assignedAgentId | UUID | Cond | Required for published listings with agent card. |
| viewCount | integer | Yes | Default 0; incremented on detail views. |
| saveCount | integer | Yes | Denormalized favorite count optional. |
| publishedAt | datetime | No | Set on transition to PUBLISHED. |
| createdByUserId | UUID | Yes | Creator agent/admin. |
| createdAt | datetime | Yes |  |
| updatedAt | datetime | Yes |  |

#### Amenity

Normalized amenity tag attachable to properties.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes |  |
| code | string | Yes | Stable key e.g. POOL, GYM. |
| label | string | Yes | Display label in checklist. |
| isCustom | boolean | Yes | True when created via custom amenity input FR-PROP-M-004. |

#### PropertyAmenity

Join table Property <-> Amenity.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| propertyId | UUID | Yes | FK Property. |
| amenityId | UUID | Yes | FK Amenity. |

#### Landmark

Nearby point of interest for map and detail list FR-PROP-D-011.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes |  |
| propertyId | UUID | Yes | FK Property. |
| name | string | Yes | e.g. Tech Park, Metro Station. |
| category | string | No | School, Transit, Shopping. |
| distanceKm | number | No | Precomputed distance. |
| latitude | number | No | Optional pin. |
| longitude | number | No | Optional pin. |

#### Image

Property media (gallery + floorplan). Video excluded from MVP.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes |  |
| propertyId | UUID | Yes | FK Property. |
| url | string | Yes | Local filesystem path or CDN URL. |
| kind | enum | Yes | GALLERY | FLOORPLAN. |
| sortOrder | integer | Yes | Carousel ordering. |
| altText | string | No | Accessibility AA baseline. |
| createdAt | datetime | Yes |  |

#### Favorite

Customer saved property per BR-CUS-1.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes |  |
| userId | UUID | Yes | FK User (Customer). |
| propertyId | UUID | Yes | FK Property published only. |
| createdAt | datetime | Yes | Unique (userId, propertyId). |

#### Lead

CRM lead from forms, chat, or inquiry CTAs BR-LEAD-1.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes |  |
| fullName | string | Yes |  |
| email | string | Cond | Email or phone required minimum one contact path. |
| phone | string | Cond |  |
| source | enum | Yes | WEB_FORM | PROPERTY_INQUIRY | CHAT | MANUAL | OTHER. |
| stage | enum | Yes | Pipeline stage without Kanban UI; see Appendix X. |
| score | integer | No | 0-100 if shown on detail header. |
| temperature | enum | No | HOT | WARM | COLD if HTML badge used. |
| preferredContactTime | string | No | Free text or slot. |
| assignedAgentId | UUID | No | Optional assignment. |
| propertyId | UUID | No | Primary property interest. |
| idempotencyKey | string | No | Stored hash of client Idempotency-Key for dedup BR-LEAD-2. |
| createdAt | datetime | Yes |  |
| updatedAt | datetime | Yes |  |

#### LeadNote

Timestamped notes FR-CRM-007; not full activity timeline product.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes |  |
| leadId | UUID | Yes | FK Lead. |
| authorUserId | UUID | Yes | Agent/Admin author. |
| body | text | Yes | Plain text. |
| createdAt | datetime | Yes | Displayed chronologically on lead detail. |

#### VisitRequest

Schedule visit capture FR-CRM-009 / SCR-SCHED.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes |  |
| leadId | UUID | No | Linked when created from lead detail. |
| propertyId | UUID | Yes | FK Property. |
| requesterUserId | UUID | No | Customer if authenticated. |
| requestedDate | date | Yes | Preferred visit date. |
| requestedTimeSlot | string | Yes | Morning/Afternoon or HH:mm range. |
| message | text | No | Additional notes. |
| status | enum | Yes | REQUESTED | CONFIRMED | CANCELLED | COMPLETED. |
| createdAt | datetime | Yes |  |

#### Notification

In-app notification FR-PLT-001.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes |  |
| userId | UUID | Yes | Recipient. |
| eventType | string | Yes | Catalog Appendix Y. |
| title | string | Yes | Short headline. |
| body | text | Yes | Message body. |
| readAt | datetime | No | Null = unread. |
| relatedEntityType | string | No | LEAD | PROPERTY | VISIT. |
| relatedEntityId | UUID | No | Deep link target. |
| createdAt | datetime | Yes |  |

#### NotificationRule

Admin-configured rule FR-PLT-003; email + in-app channels only.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes |  |
| eventType | string | Yes | Must match engine event catalog. |
| channelEmail | boolean | Yes | Default per rule. |
| channelInApp | boolean | Yes | Default per rule. |
| recipientRole | enum | No | ADMIN | AGENT | CUSTOMER. |
| isEnabled | boolean | Yes |  |
| updatedByUserId | UUID | Yes |  |
| updatedAt | datetime | Yes |  |

#### CmsPage

CMS managed content FR-PLT-004.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes |  |
| slug | string | Yes | Unique e.g. homepage, about. |
| title | string | Yes |  |
| sectionsJson | JSON | Yes | Structured blocks for homepage hero, testimonials, featured ids. |
| isPublished | boolean | Yes | Draft CMS not public. |
| updatedByUserId | UUID | Yes |  |
| updatedAt | datetime | Yes |  |

#### AiConfig

Hot-reload chatbot configuration FR-AI-002 through FR-AI-006.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | Singleton row or versioned document. |
| greetingMessage | text | Yes | Chat welcome string. |
| systemPrompt | text | Yes | Gemini system instruction; Gemini-only BR-AI-1. |
| tonePreset | string | Yes | Friendly | Professional | Concise per HTML. |
| escalationEnabled | boolean | Yes | FR-AI-004. |
| escalationEmail | string | No | Human handoff target. |
| workingHoursJson | JSON | No | Escalation window. |
| faqJson | JSON | Yes | Array of {question, answer, order}. |
| updatedByUserId | UUID | Yes |  |
| updatedAt | datetime | Yes | Applied without code deploy BR-AI-6. |


### C.1 Cross-Entity Integrity Rules

| Rule ID | Entities | Requirement |
|---------|----------|-------------|
| DD-INT-01 | Property, Image | At least one GALLERY image required before PUBLISHED transition unless HTML explicitly allows placeholder in dev seeds only. |
| DD-INT-02 | Property, Favorite | Favorites reference PUBLISHED properties only; archived listings removed from customer saved grid or marked unavailable per UX. |
| DD-INT-03 | Lead, Property | propertyId on lead must reference existing property when source is PROPERTY_INQUIRY. |
| DD-INT-04 | User, Agent | Every Agent.userId must reference User with role AGENT or elevated admin role if dual-purpose accounts allowed by seed. |
| DD-INT-05 | AiConfig | FAQ entries must survive partial update PATCH without dropping unrelated keys. |
| DD-INT-06 | NotificationRule | channelSms, channelWhatsapp, channelPush fields must not exist in MVP schema or must be hard-disabled read-only false. |



## Appendix D -- API Request and Response Example Shapes

Base URL prefix: `/api/v1`. All write endpoints return standard error envelope on failure (see D.5). Authentication uses `Authorization: Bearer <accessToken>` except public routes noted in OpenAPI.



### D.1 POST /auth/register

**Request**

```json
{
  "email": "buyer@example.com",
  "password": "Str0ngPass!word",
  "firstName": "Priya",
  "lastName": "Sharma",
  "phone": "+919876543210"
}
```

**Response 201**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "buyer@example.com",
    "role": "CUSTOMER",
    "firstName": "Priya",
    "lastName": "Sharma"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

### D.2 POST /auth/login

**Request**

```json
{
  "email": "buyer@example.com",
  "password": "Str0ngPass!word"
}
```

**Response 200**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "buyer@example.com",
    "role": "CUSTOMER"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

### D.3 POST /ai/search -- AI success

**Request**

```json
{
  "query": "3BHK under 80 lakhs near tech park with gym",
  "filters": {
    "propertyType": "APARTMENT",
    "minPrice": null,
    "maxPrice": 8000000,
    "bedrooms": 3
  },
  "page": 1,
  "pageSize": 12
}
```

**Response 200 (mode: AI)**

```json
{
  "mode": "AI",
  "queryInterpretation": "3 bedroom apartments under INR 80 lakh near tech parks with gym amenity",
  "results": [
    {
      "propertyId": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Skyline Residency 3BHK",
      "priceAmount": "7850000",
      "priceCurrency": "INR",
      "bedrooms": 3,
      "bathrooms": 2,
      "city": "Bengaluru",
      "thumbnailUrl": "/media/properties/660e.../1.jpg",
      "matchScorePercent": 92,
      "matchReasons": [
        { "label": "Within budget", "matched": true },
        { "label": "Near tech park", "matched": true },
        { "label": "Gym amenity", "matched": true }
      ]
    }
  ],
  "pagination": { "page": 1, "pageSize": 12, "total": 24 }
}
```

### D.4 POST /ai/search -- filter fallback

**Response 200 (mode: FILTER_FALLBACK)**

```json
{
  "mode": "FILTER_FALLBACK",
  "fallbackReason": "AI_TIMEOUT",
  "bannerMessage": "AI ranking is temporarily unavailable. Showing filter-matched listings.",
  "results": [
    {
      "propertyId": "660e8400-e29b-41d4-a716-446655440002",
      "title": "Green Park Apartments",
      "priceAmount": "7500000",
      "bedrooms": 3,
      "matchScorePercent": null,
      "matchReasons": []
    }
  ],
  "pagination": { "page": 1, "pageSize": 12, "total": 8 }
}
```

### D.5 Standard error envelope

**Response 422 example**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Email already registered" }
    ]
  }
}
```

### D.6 POST /leads with Idempotency-Key

**Headers**

```
Idempotency-Key: 7c9e6679-7425-40de-944b-e07fc1f90ae7
Content-Type: application/json
```

**Request**

```json
{
  "fullName": "Alex Rivera",
  "email": "alex@example.com",
  "phone": "+15551234567",
  "source": "PROPERTY_INQUIRY",
  "propertyId": "660e8400-e29b-41d4-a716-446655440001",
  "message": "Interested in weekend viewing"
}
```

**Response 201 (first call)**

```json
{
  "lead": {
    "id": "770e8400-e29b-41d4-a716-446655440010",
    "fullName": "Alex Rivera",
    "stage": "NEW",
    "source": "PROPERTY_INQUIRY",
    "propertyId": "660e8400-e29b-41d4-a716-446655440001"
  }
}
```

**Response 200 (replay same Idempotency-Key)** returns identical lead body without duplicate insert.

### D.7 POST /properties (create listing)

**Request**

```json
{
  "title": "Lakeside Villa 4BHK",
  "description": "Spacious villa with private garden.",
  "propertyType": "VILLA",
  "priceAmount": "12500000",
  "priceCurrency": "INR",
  "bedrooms": 4,
  "bathrooms": 4,
  "areaSqFt": 3200,
  "addressLine1": "12 Lake View Road",
  "city": "Hyderabad",
  "latitude": 17.385,
  "longitude": 78.486,
  "status": "DRAFT",
  "amenityCodes": ["POOL", "GYM", "PARKING"]
}
```

**Response 201**

```json
{
  "property": {
    "id": "880e8400-e29b-41d4-a716-446655440020",
    "status": "DRAFT",
    "title": "Lakeside Villa 4BHK"
  }
}
```

### D.8 POST /properties/bulk/validate

**Request** multipart CSV file field `file`.

**Response 200**

```json
{
  "summary": {
    "totalRows": 150,
    "validRows": 132,
    "errorRows": 15,
    "warningRows": 3
  },
  "errors": [
    {
      "row": 14,
      "field": "priceAmount",
      "message": "Must be positive numeric string",
      "value": "-100",
      "suggestedFix": "Enter price without currency symbols"
    }
  ],
  "warnings": [
    {
      "row": 2,
      "field": "latitude",
      "message": "Missing coordinates; map will not render until geocoded"
    }
  ],
  "importToken": "bulk-import-token-abc123"
}
```

### D.9 POST /ai/chat

**Request**

```json
{
  "sessionId": "chat-session-001",
  "message": "What documents do I need for home loan pre-approval?"
}
```

**Response 200**

```json
{
  "sessionId": "chat-session-001",
  "reply": "Typically lenders ask for identity proof, income statements, and bank statements...",
  "sources": ["FAQ:HOME_LOAN_DOCS"],
  "escalated": false
}
```

### D.10 POST /ai/loan-analysis

**Request**

```json
{
  "propertyPrice": 8000000,
  "downPayment": 1600000,
  "annualIncome": 2400000,
  "existingEmi": 15000,
  "interestRatePercent": 8.5,
  "tenureYears": 20
}
```

**Response 200**

```json
{
  "provider": "GEMINI",
  "eligible": true,
  "recommendedEmi": 52840,
  "affordabilitySummary": "Estimated EMI is within common affordability guidelines for stated income.",
  "formulaFallbackUsed": false,
  "disclaimer": "Informational only; not a loan offer."
}
```

### D.11 PUT /admin/ai-config

**Request**

```json
{
  "greetingMessage": "Welcome to PropVista. How can I help you find a home?",
  "tonePreset": "PROFESSIONAL",
  "systemPrompt": "You are PropVista assistant. Use only verified listing data...",
  "faqJson": [
    { "question": "Do you charge buyers?", "answer": "No buyer commission for this org.", "order": 1 }
  ],
  "escalationEnabled": true,
  "escalationEmail": "agents@propvista.example",
  "workingHoursJson": { "timezone": "Asia/Kolkata", "days": ["Mon", "Tue", "Wed", "Thu", "Fri"], "start": "09:00", "end": "18:00" }
}
```

**Response 200** returns full AiConfig object with updatedAt timestamp.


## Appendix E -- Per-Screen State Matrix


Kanban screen SCR-LEAD-KANBAN is **excluded from MVP**; lead workflow uses SCR-CLIENTS and SCR-LEAD-D only.


| Screen ID | Purpose | Default | Loading | Empty | Error | Hover | Responsive | Extra |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-HOME | Homepage AI landing | Hero, featured cards, chat closed | Skeleton hero/cards | N/A for featured strip | Retry banner on CMS fail | Card/chip/button hovers per HTML | Stack sections mobile | Chat widget overlay |
| SCR-SEARCH-STD | AI search results | Results grid with scores | Spinner/skeleton cards | Use SCR-SEARCH-EMPTY | Fallback banner if mode switch | Favorite heart hover | Filter drawer collapses | Grid/list toggle |
| SCR-SEARCH-FB | Filter fallback results | Banner + filter results | Loading as STD | Empty -> SCR-SEARCH-EMPTY | Hard error toast | Reset search hover | Banner full width mobile | No match scores shown |
| SCR-SEARCH-EMPTY | Zero results | Guidance + chips | Brief loading prior | Illustration + CTAs | Error if search API down | Chip hover | Centered stack | Suggested locations |
| SCR-PROP-D | Property detail | Gallery, map, CTAs | Skeleton gallery | 404 not found page | Map load error inline | Gallery nav hover | Stack sidebar below | Similar properties carousel |
| SCR-CUS-DASH | Customer dashboard | Stats, saves, inquiries | Dashboard skeleton | Empty saves CTA | Section-level error | Card hover | Single column stats | Notifications bell |
| SCR-LEAD-D | Lead detail | Header, notes, interests | Detail skeleton | Rare empty notes list | 403/404 lead | Action button hover | Panels stack | Schedule visit modal; NO Kanban |
| SCR-PROP-EDIT | Listing editor | Form populated | Saving indicator | New draft defaults | Validation inline | Field focus rings | Single column form | Publish/draft actions |
| SCR-PROP-INV | Inventory grid | Rows with badges | Table skeleton | Empty inventory state | Load failure toast | Row action menu hover | Horizontal scroll table | Bulk select bar |
| SCR-BULK | Bulk validation | Summary + tables | Processing spinner | No file yet upload CTA | Parse failure | Row highlight errors | Tabs stack | Import valid only |
| SCR-AI-CFG | AI chatbot config | FAQ list, preview | Loading config | Empty FAQ allowed | Save failure toast | Toggle hover | Preview below form | Preview chat pane |
| SCR-CMD | Command center | KPIs + charts | Chart placeholders | Zero metrics zeros | Partial chart error | Date picker hover | Charts stack | Activity feed filters |
| SCR-LOGIN | Login | Empty form | Submit loading | N/A | Invalid creds inline | Button hover | Centered card | Link to register |
| SCR-REGISTER | Register | Empty form | Submit loading | N/A | Duplicate email | Field focus | Centered card | Password rules hint |
| SCR-CLIENTS | Lead list (no Kanban) | Table/list of leads | List skeleton | No leads empty | Fetch error | Row hover | Card list mobile | Kanban nav excluded MVP |
| SCR-ADD-LEAD | Add lead modal | Blank modal | Creating spinner | N/A | Validation inline | Primary button hover | Full screen mobile | Idempotency on submit |
| SCR-AGENTS | Agents admin | Agent table | Loading | Empty agents | Error state | Row actions hover | Responsive table | Photo upload |
| SCR-USERS | Users admin | User table | Loading | Empty users | Error state | Row hover | Responsive table | Deactivate user |
| SCR-CMS | CMS admin | Section editors | Loading page | New page draft | Save error | Control hover | Stack blocks | Homepage sections |
| SCR-REPORTS | Reports | Charts/tables | Loading | No data range | Error banner | Export hover if present | Scroll charts | Date range |
| SCR-NTF-RULES | Notification rules | Rules list | Loading | No rules defaults | Save error | Toggle hover | Stack rows | Email+in-app only |
| SCR-LOAN | Loan analysis modal | Form defaults | Analyzing spinner | N/A | AI error + formula fallback | Slider hover | Full width mobile | Gemini + formula |
| SCR-SCHED | Schedule visit modal | Date/time pickers | Submitting | N/A | Validation errors | Calendar hover | Full screen mobile | Links to lead/property |
| SCR-NOTIF | Notifications dropdown | Unread list | Loading items | No notifications | Fetch error | Item hover | Dropdown width mobile | Mark read on open optional |


## Appendix F -- End-to-End Sequence Specifications

Each sequence lists actors, preconditions, main steps, postconditions, and FR trace IDs. Timings are logical, not performance guarantees (see Appendix Z).

### F.1 E2E-01 Search to inquiry

| Step | Actor | Action | System Response | FR Trace |
|------|-------|--------|-----------------|----------|
| 1 | Guest | Opens SCR-HOME | Renders CMS-driven hero and featured listings | FR-HOME-001, FR-HOME-002 |
| 2 | Guest | Submits NLP query | POST /ai/search; loading on SCR-SEARCH-STD | FR-SEARCH-001, FR-SEARCH-002 |
| 3 | System | AI success | Shows match scores and reasons | FR-SEARCH-003, FR-SEARCH-004 |
| 4 | Guest | Opens property card | Navigates SCR-PROP-D | FR-PROP-D-001 |
| 5 | Guest | Clicks Inquire CTA | Lead capture form/modal | FR-PROP-D-007, FR-CRM-001 |
| 6 | Guest | Submits inquiry with Idempotency-Key | Creates Lead; notifications per rules | FR-CRM-001, FR-PLT-002 |
| 7 | Agent | Opens SCR-CLIENTS | Sees new lead | FR-CRM-002 |

### F.2 E2E-02 AI fallback search

| Step | Actor | Action | System Response | FR Trace |
|------|-------|--------|-----------------|----------|
| 1 | Guest | Submits NLP query | Gemini timeout or error | NFR-P-003, BR-AI-4 |
| 2 | System | Fallback | SCR-SEARCH-FB with visible banner | FR-SEARCH-011, FR-SEARCH-013 |
| 3 | Guest | Applies filters | Filter-only results paginate | FR-SEARCH-006, FR-SEARCH-009 |
| 4 | Guest | Reset search | Clears query/filters | FR-SEARCH-007 |

### F.3 E2E-03 Publish listing

| Step | Actor | Action | System Response | FR Trace |
|------|-------|--------|-----------------|----------|
| 1 | Agent | Creates draft SCR-PROP-EDIT | Property status DRAFT | FR-PROP-M-001, FR-PROP-M-003 |
| 2 | Agent | Uploads images | Image records GALLERY | FR-PROP-M-006 |
| 3 | Agent | Publish | Status PUBLISHED; publishedAt set | BR-PROP-4, FR-PROP-M-003 |
| 4 | Guest | Search | Listing appears in public search | FR-SEARCH-*, BR-PROP-4 |
| 5 | Admin | SCR-PROP-INV | Row shows published badge | FR-PROP-M-009 |

### F.4 E2E-04 AI config hot update

| Step | Actor | Action | System Response | FR Trace |
|------|-------|--------|-----------------|----------|
| 1 | Admin | Edits greeting/FAQ SCR-AI-CFG | Local form state | FR-AI-003, FR-AI-005 |
| 2 | Admin | Saves | PUT /admin/ai-config persists | BR-AI-6 |
| 3 | Admin | Preview chat | Uses latest config without redeploy | FR-AI-006 |
| 4 | Guest | Opens homepage chat | New greeting visible | FR-HOME-005, FR-AI-002 |

### F.5 E2E-05 Bulk import

| Step | Actor | Action | System Response | FR Trace |
|------|-------|--------|-----------------|----------|
| 1 | Admin | Upload CSV | POST validate returns summary | FR-BULK-001, FR-BULK-002 |
| 2 | Admin | Reviews errors | Error table with fixes | FR-BULK-003 |
| 3 | Admin | Downloads error CSV | FR-BULK-004 | |
| 4 | Admin | Import valid rows only | Creates/updates properties | FR-BULK-005, BR-PROP-7 |
| 5 | Admin | Re-upload fixed file | FR-BULK-006 | |

### F.6 E2E-06 Customer favorite

| Step | Actor | Action | System Response | FR Trace |
|------|-------|--------|-----------------|----------|
| 1 | Customer | Logs in | JWT issued | FR-AUTH-002 |
| 2 | Customer | Saves property on SCR-PROP-D | POST favorite | FR-PROP-D-009, BR-CUS-1 |
| 3 | Customer | Opens SCR-CUS-DASH | Property in saved grid | FR-CUS-002 |
| 4 | Customer | Removes save | DELETE favorite | FR-CUS-002 |

### F.7 E2E-07 Schedule visit

| Step | Actor | Action | System Response | FR Trace |
|------|-------|--------|-----------------|----------|
| 1 | Customer/Agent | Opens SCR-SCHED from detail or lead | Modal with date/time | FR-CRM-009, FR-PROP-D-008 |
| 2 | User | Submits visit request | VisitRequest REQUESTED | FR-CRM-009 |
| 3 | System | Notifies agent/admin | Email + in-app per rules | FR-PLT-001, FR-PLT-002, Appendix Y |
| 4 | Agent | Views lead detail | Visit linked on lead | FR-CRM-006 |

### F.8 E2E-08 Loan analysis

| Step | Actor | Action | System Response | FR Trace |
|------|-------|--------|-----------------|----------|
| 1 | Customer | Opens SCR-LOAN | Modal form | FR-AI-007, BR-CUS-4 |
| 2 | Customer | Submits financial inputs | POST /ai/loan-analysis | FR-AI-007 |
| 3 | System | Gemini analysis | Summary + EMI estimate | FR-AI-007 |
| 4 | System | Gemini failure | Formula fallback flagged | FR-AI-007, NFR-A-002 |



## Appendix G -- External Interfaces

| Interface ID | Name | Direction | Protocol | Purpose | MVP Notes |
|--------------|------|-----------|----------|---------|-----------|
| EXT-01 | Google Gemini API | Outbound | HTTPS REST/SDK | NLP search ranking, chat, loan narrative | Only LLM; keys server-side NFR-S-004 |
| EXT-02 | SMTP / Email provider | Outbound | SMTP or provider API | Transactional email notifications | New lead, inquiry updates |
| EXT-03 | OpenStreetMap tile servers | Outbound | HTTPS | Leaflet map tiles on SCR-PROP-D | Lazy load NFR-P-004 |
| EXT-04 | PostgreSQL | Bidirectional | TCP/SQL via Prisma | System of record BR-DATA-1 | |
| EXT-05 | Local filesystem (dev) | Bidirectional | OS I/O | Property image storage BR-DATA-2 | |
| EXT-06 | Vercel hosting | Inbound/Outbound | HTTPS | Frontend deployment NFR-C-001 | |
| EXT-07 | Browser client | Inbound | HTTPS | Next.js UI | Modern evergreen NFR-C-002 |

Excluded external interfaces for MVP: SMS gateways, WhatsApp Business API, FCM/APNs push, video CDN for tours, alternate LLM vendors.


## Appendix H -- Test Requirements by Functional Requirement Group


Each row is a minimum verification case for MVP release gating. Automated tests should cover happy path; QA executes UI parity per Constitution Section 15.


| Test Case ID | Group | FR ID | Objective | Method |
| --- | --- | --- | --- | --- |
| TC-AUTH-001 | AUTH | FR-AUTH-001 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-AUTH-001-N | AUTH | FR-AUTH-001 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-AUTH-002 | AUTH | FR-AUTH-002 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-AUTH-002-N | AUTH | FR-AUTH-002 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-AUTH-003 | AUTH | FR-AUTH-003 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-AUTH-003-N | AUTH | FR-AUTH-003 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-AUTH-004 | AUTH | FR-AUTH-004 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-AUTH-004-N | AUTH | FR-AUTH-004 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-AUTH-005 | AUTH | FR-AUTH-005 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-AUTH-005-N | AUTH | FR-AUTH-005 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-AUTH-006 | AUTH | FR-AUTH-006 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-AUTH-006-N | AUTH | FR-AUTH-006 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-AUTH-007 | AUTH | FR-AUTH-007 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-AUTH-007-N | AUTH | FR-AUTH-007 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-AUTH-REG | AUTH | Cross-FR | Regression suite after defect fix | CI pipeline |
| TC-SEARCH-008 | SEARCH | FR-SEARCH-001 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-008-N | SEARCH | FR-SEARCH-001 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-009 | SEARCH | FR-SEARCH-002 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-009-N | SEARCH | FR-SEARCH-002 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-010 | SEARCH | FR-SEARCH-003 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-010-N | SEARCH | FR-SEARCH-003 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-011 | SEARCH | FR-SEARCH-004 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-011-N | SEARCH | FR-SEARCH-004 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-012 | SEARCH | FR-SEARCH-005 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-012-N | SEARCH | FR-SEARCH-005 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-013 | SEARCH | FR-SEARCH-006 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-013-N | SEARCH | FR-SEARCH-006 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-014 | SEARCH | FR-SEARCH-007 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-014-N | SEARCH | FR-SEARCH-007 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-015 | SEARCH | FR-SEARCH-008 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-015-N | SEARCH | FR-SEARCH-008 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-016 | SEARCH | FR-SEARCH-009 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-016-N | SEARCH | FR-SEARCH-009 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-017 | SEARCH | FR-SEARCH-010 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-017-N | SEARCH | FR-SEARCH-010 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-018 | SEARCH | FR-SEARCH-011 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-018-N | SEARCH | FR-SEARCH-011 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-019 | SEARCH | FR-SEARCH-012 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-019-N | SEARCH | FR-SEARCH-012 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-020 | SEARCH | FR-SEARCH-013 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-SEARCH-020-N | SEARCH | FR-SEARCH-013 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-SEARCH-REG | SEARCH | Cross-FR | Regression suite after defect fix | CI pipeline |
| TC-PROPERTY-021 | PROPERTY | FR-PROP-D-001 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-021-N | PROPERTY | FR-PROP-D-001 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-022 | PROPERTY | FR-PROP-D-002 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-022-N | PROPERTY | FR-PROP-D-002 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-023 | PROPERTY | FR-PROP-D-003 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-023-N | PROPERTY | FR-PROP-D-003 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-024 | PROPERTY | FR-PROP-D-004 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-024-N | PROPERTY | FR-PROP-D-004 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-025 | PROPERTY | FR-PROP-D-005 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-025-N | PROPERTY | FR-PROP-D-005 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-026 | PROPERTY | FR-PROP-D-006 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-026-N | PROPERTY | FR-PROP-D-006 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-027 | PROPERTY | FR-PROP-D-007 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-027-N | PROPERTY | FR-PROP-D-007 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-028 | PROPERTY | FR-PROP-D-008 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-028-N | PROPERTY | FR-PROP-D-008 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-029 | PROPERTY | FR-PROP-D-009 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-029-N | PROPERTY | FR-PROP-D-009 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-030 | PROPERTY | FR-PROP-D-010 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-030-N | PROPERTY | FR-PROP-D-010 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-031 | PROPERTY | FR-PROP-D-011 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-031-N | PROPERTY | FR-PROP-D-011 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-032 | PROPERTY | FR-PROP-M-001 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-032-N | PROPERTY | FR-PROP-M-001 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-033 | PROPERTY | FR-PROP-M-002 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-033-N | PROPERTY | FR-PROP-M-002 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-034 | PROPERTY | FR-PROP-M-003 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-034-N | PROPERTY | FR-PROP-M-003 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-035 | PROPERTY | FR-PROP-M-004 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-035-N | PROPERTY | FR-PROP-M-004 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-036 | PROPERTY | FR-PROP-M-005 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-036-N | PROPERTY | FR-PROP-M-005 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-037 | PROPERTY | FR-PROP-M-006 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-037-N | PROPERTY | FR-PROP-M-006 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-038 | PROPERTY | FR-PROP-M-008 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-038-N | PROPERTY | FR-PROP-M-008 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-039 | PROPERTY | FR-PROP-M-009 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-039-N | PROPERTY | FR-PROP-M-009 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-040 | PROPERTY | FR-PROP-M-010 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-040-N | PROPERTY | FR-PROP-M-010 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-041 | PROPERTY | FR-PROP-M-011 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-041-N | PROPERTY | FR-PROP-M-011 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-042 | PROPERTY | FR-PROP-M-012 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-042-N | PROPERTY | FR-PROP-M-012 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-043 | PROPERTY | FR-PROP-M-013 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-043-N | PROPERTY | FR-PROP-M-013 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-044 | PROPERTY | FR-PROP-M-014 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-044-N | PROPERTY | FR-PROP-M-014 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-045 | PROPERTY | FR-PROP-M-015 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-PROPERTY-045-N | PROPERTY | FR-PROP-M-015 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-PROPERTY-REG | PROPERTY | Cross-FR | Regression suite after defect fix | CI pipeline |
| TC-BULK-046 | BULK | FR-BULK-001 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-BULK-046-N | BULK | FR-BULK-001 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-BULK-047 | BULK | FR-BULK-002 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-BULK-047-N | BULK | FR-BULK-002 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-BULK-048 | BULK | FR-BULK-003 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-BULK-048-N | BULK | FR-BULK-003 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-BULK-049 | BULK | FR-BULK-004 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-BULK-049-N | BULK | FR-BULK-004 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-BULK-050 | BULK | FR-BULK-005 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-BULK-050-N | BULK | FR-BULK-005 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-BULK-051 | BULK | FR-BULK-006 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-BULK-051-N | BULK | FR-BULK-006 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-BULK-REG | BULK | Cross-FR | Regression suite after defect fix | CI pipeline |
| TC-CUSTOMER-052 | CUSTOMER | FR-CUS-001 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-CUSTOMER-052-N | CUSTOMER | FR-CUS-001 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-CUSTOMER-053 | CUSTOMER | FR-CUS-002 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-CUSTOMER-053-N | CUSTOMER | FR-CUS-002 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-CUSTOMER-054 | CUSTOMER | FR-CUS-003 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-CUSTOMER-054-N | CUSTOMER | FR-CUS-003 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-CUSTOMER-055 | CUSTOMER | FR-CUS-004 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-CUSTOMER-055-N | CUSTOMER | FR-CUS-004 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-CUSTOMER-056 | CUSTOMER | FR-CUS-005 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-CUSTOMER-056-N | CUSTOMER | FR-CUS-005 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-CUSTOMER-057 | CUSTOMER | FR-CUS-006 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |
| TC-CUSTOMER-057-N | CUSTOMER | FR-CUS-006 | Role denial for unauthorized role | API expects 403; UI route guard |
| TC-CUSTOMER-REG | CUSTOMER | Cross-FR | Regression suite after defect fix | CI pipeline |
| TC-CRM-058 | CRM | FR-CRM-001 | Happy path acceptance from PRD section 23 | Automated integration + manual UI compare to HTML |


(Additional negative-path cases for validation errors, pagination boundaries, and idempotent lead replay shall mirror Appendix W field rules.)


## Appendix I -- Business Rules Restatement


| Rule ID | Statement |
| --- | --- |
| BR-ORG-1 | Single organization; no tenant_id routing in MVP APIs. |
| BR-ORG-2 | Authorization by role only; no module permission matrix. |
| BR-ORG-3 | Roles: Guest, Customer, Agent, Admin, Super Admin. |
| BR-AUTH-1 | Email + password authentication. |
| BR-AUTH-2 | Passwords stored hashed. |
| BR-AUTH-3 | JWT access + refresh token strategy. |
| BR-AUTH-4 | Inactive/deleted users cannot authenticate. |
| BR-PROP-1 | Listing statuses: draft, published, archived. |
| BR-PROP-2 | Required editor fields: title, price, bedrooms, bathrooms, area. |
| BR-PROP-3 | Price as numeric string in API/UI convention. |
| BR-PROP-4 | Only published listings on public search/featured. |
| BR-PROP-5 | Agents manage assigned inventory; Admins org-wide. |
| BR-PROP-6 | Photos + floorplan yes; video/virtual tour no. |
| BR-PROP-7 | Bulk import validates; import valid rows only. |
| BR-AI-1 | Gemini only LLM provider. |
| BR-AI-2 | MVP AI features: search, chat, loan analysis. |
| BR-AI-3 | AI search may expose match score and reasons. |
| BR-AI-4 | AI search failure must filter fallback with visible indicator. |
| BR-AI-5 | AI must not invent listings not from property APIs. |
| BR-AI-6 | Admin AI config hot reload without deploy. |
| BR-AI-7 | Non-Gemini labels in HTML map to Gemini-only implementation. |
| BR-LEAD-1 | Leads from forms, chat, property CTAs. |
| BR-LEAD-2 | Source tracking; idempotency on create when keyed. |
| BR-LEAD-3 | Agents/Admins list and detail leads. |
| BR-LEAD-4 | Stage updates yes; Kanban board no. |
| BR-LEAD-5 | No activity timeline product, reminders, automation. |
| BR-LEAD-6 | Schedule visit flows in MVP. |
| BR-CUS-1 | Favorites save/unsave. |
| BR-CUS-2 | Requirement profile fields per dashboard HTML. |
| BR-CUS-3 | Inquiry history/status visible to customer. |
| BR-CUS-4 | Loan analysis for authenticated customer. |
| BR-NTF-1 | Channels: email + in-app only. |
| BR-NTF-2 | No SMS, WhatsApp, push. |
| BR-NTF-3 | CMS drives public homepage content sections. |
| BR-NTF-4 | Admin notification rules UI present. |
| BR-DATA-1 | PostgreSQL via Prisma. |
| BR-DATA-2 | Dev storage local filesystem. |
| BR-DATA-3 | Leaflet + OSM maps on detail. |


## Appendix J -- Priority Counts (MoSCoW Placeholders)

| Priority | Count Placeholder | Notes |
|----------|-------------------|-------|
| Must | 90 | MVP blocking requirements across FR-AUTH through FR-UX |
| Should | 8 | Important but deferrable within MVP if schedule risk |
| Could | 2 | Nice-to-have polish not blocking release |
| Wont | 7 | Explicit exclusions: Kanban, SMS, push, virtual tours, etc. |

Population rule: Product Owner fills placeholders from PRD priority column during baseline release planning; engineering shall not reinterpret Wont items as stretch goals without Constitution amendment.


## Appendix K -- Screen-to-FR Trace Matrix


| Screen ID | FR Coverage | Trace Type | Verification Source |
| --- | --- | --- | --- |
| SCR-HOME | FR-HOME-001..007, FR-AI-001, FR-CRM-001 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-SEARCH-STD | FR-SEARCH-001..010 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-SEARCH-FB | FR-SEARCH-011, FR-SEARCH-013 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-SEARCH-EMPTY | FR-SEARCH-012 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-PROP-D | FR-PROP-D-001..011 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-CUS-DASH | FR-CUS-001..006 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-LEAD-D | FR-CRM-004..010 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-PROP-EDIT | FR-PROP-M-001..006 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-PROP-INV | FR-PROP-M-008..015 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-BULK | FR-BULK-001..006 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-AI-CFG | FR-AI-002..006 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-CMD | FR-ADM-001..006 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-LOGIN | FR-AUTH-002, FR-AUTH-003 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-REGISTER | FR-AUTH-001 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-CLIENTS | FR-CRM-002 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-ADD-LEAD | FR-CRM-003 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-AGENTS | FR-AUTH-006 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-USERS | FR-AUTH-005 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-CMS | FR-PLT-004 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-REPORTS | FR-ADM-007 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-NTF-RULES | FR-PLT-003 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-LOAN | FR-AI-007 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-SCHED | FR-CRM-009 | Primary | HTML design_reference + PRD traceability matrix |
| SCR-NOTIF | FR-PLT-001 | Primary | HTML design_reference + PRD traceability matrix |


## Appendix L -- NFR Verification Methods


| NFR ID | Verification Activity | Pass Criteria |
| --- | --- | --- |
| NFR-P-001 | Lighthouse/mWeb vitals on SCR-HOME, SCR-SEARCH-STD, SCR-PROP-D | Median LCP < 2s on reference broadband |
| NFR-P-002 | API list endpoints | pageSize max enforced; total count returned |
| NFR-P-003 | AI search timeout injection test | Fallback mode within SLA; UI banner visible |
| NFR-P-004 | Property detail map | Leaflet bundle lazy loaded; no map on login |
| NFR-A-001 | Uptime monitoring | 99.5% monthly target on production |
| NFR-A-002 | Gemini outage simulation | Filter fallback; chat/loan graceful errors |
| NFR-A-003 | GET /api/v1/health | 200 OK with dependency flags |
| NFR-S-001 | Auth penetration basics | Hashed passwords; token expiry enforced |
| NFR-S-002 | RBAC matrix tests | Appendix O operations denied per role |
| NFR-S-003 | Validation fuzz | Malformed JSON rejected with envelope |
| NFR-S-004 | Secret scanning CI | No GEMINI_API_KEY in client bundle |
| NFR-S-005 | OWASP spot checks | Appendix AB mapping executed |
| NFR-S-006 | Rate limit load test | Auth and AI endpoints throttle abusive clients |
| NFR-U-001 | Pixel diff vs HTML | Constitution Section 17 checklist |
| NFR-U-002 | Responsive snapshots | Mobile/tablet/desktop breakpoints |
| NFR-U-003 | axe-core baseline | Appendix AA WCAG targets |
| NFR-U-004 | Design review gate | No unsolicited visual changes |
| NFR-M-001 | Architecture review | No business logic in React leaf components |
| NFR-M-002 | tsc --noEmit | Strict mode clean |
| NFR-M-003 | API client audit | Single module imports for fetch |
| NFR-M-004 | Coverage report | >80% on core business services |
| NFR-M-005 | eslint . | Zero warnings on completed screens |
| NFR-C-001 | Vercel preview deploy | Smoke E2E on preview URL |
| NFR-C-002 | Browser matrix | Chrome, Firefox, Safari, Edge latest |
| NFR-C-003 | Stack fingerprint | package.json matches Constitution Section 5 |


## Appendix M -- Migration and Seed Requirements

| Seed ID | Entity | Purpose | Constraints |
|---------|--------|---------|-------------|
| SEED-01 | Super Admin user | Bootstrap admin login in dev/staging | Must change password on first login in non-dev |
| SEED-02 | Sample agents | Agent cards on property details | Linked User+Agent rows |
| SEED-03 | Published properties | Demo search and homepage featured | Mix of types, prices, amenities |
| SEED-04 | Landmarks | Map pins FR-PROP-D-011 | At least 3 landmarks on flagship property |
| SEED-05 | Amenity dictionary | Checklist in editor | POOL, GYM, PARKING, SECURITY |
| SEED-06 | CMS homepage | SCR-HOME content | sectionsJson matches design intent |
| SEED-07 | AiConfig default | Chat greeting + FAQs | Gemini prompts safe and org-specific |
| SEED-08 | Notification rules | Default new lead email+in-app | Admin can edit in SCR-NTF-RULES |
| SEED-09 | Leads (optional dev) | CRM list demos | Stages across NEW..NEGOTIATION without Kanban |

Migrations must be forward-only in MVP CI; destructive resets allowed locally only. Prisma migrate deploy runs on release pipeline before app boot.



## Appendix N -- Configuration and Environment Requirements

| Variable | Required | Scope | Description |
|----------|----------|-------|-------------|
| DATABASE_URL | Yes | Server | PostgreSQL connection string for Prisma |
| JWT_ACCESS_SECRET | Yes | Server | Signs short-lived access tokens |
| JWT_REFRESH_SECRET | Yes | Server | Signs refresh tokens |
| JWT_ACCESS_TTL_SECONDS | Yes | Server | Default 900 |
| JWT_REFRESH_TTL_DAYS | Yes | Server | Default 7 |
| GEMINI_API_KEY | Yes | Server | Google Gemini credentials; never expose to browser |
| GEMINI_MODEL_SEARCH | Yes | Server | Model id for search ranking |
| GEMINI_MODEL_CHAT | Yes | Server | Model id for chatbot |
| GEMINI_MODEL_LOAN | Yes | Server | Model id for loan narrative |
| AI_SEARCH_TIMEOUT_MS | Yes | Server | Triggers filter fallback when exceeded |
| SMTP_HOST | Cond | Server | Required if email notifications enabled |
| SMTP_PORT | Cond | Server | |
| SMTP_USER | Cond | Server | |
| SMTP_PASS | Cond | Server | Secret store in production |
| EMAIL_FROM | Cond | Server | From address for transactional mail |
| MEDIA_STORAGE_PATH | Yes (dev) | Server | Local upload root BR-DATA-2 |
| NEXT_PUBLIC_API_BASE_URL | Yes | Client | Points to Express /api/v1 |
| NODE_ENV | Yes | Both | development | production |
| CORS_ORIGIN | Yes | Server | Vercel frontend origin |

Forbidden in client env: any Gemini key, SMTP password, JWT secrets.


## Appendix O -- Full RBAC Operations Matrix

Canonical definitions for Agent **Limited** cells and Super Admin customer-dashboard access: Constitution Appendix A.1. Cells marked Y for Agent on favorites / inventory / command center mean that Limited scope—not org-wide Admin.

| Operation | Guest | Customer | Agent | Admin | Super Admin |
| --- | --- | --- | --- | --- | --- |
| View public homepage/search/detail | Y | Y | Y | Y | Y |
| Register/login | Y | Y | Y | Y | Y |
| AI search/chat (guest) | Y | Y | Y | Y | Y |
| Save favorite | N | Y | Y | Y | Y |
| Customer dashboard | N | Y | N | N | Y |
| Loan analysis | N | Y | Y | Y | Y |
| Create property draft | N | N | Y | Y | Y |
| Publish property | N | N | Y | Y | Y |
| Property inventory | N | N | Y | Y | Y |
| Bulk upload | N | N | N | Y | Y |
| Lead list/detail | N | N | Y | Y | Y |
| Add lead manual | N | N | Y | Y | Y |
| Change lead stage | N | N | Y | Y | Y |
| Schedule visit | N | Y | Y | Y | Y |
| Lead notes write | N | N | Y | Y | Y |
| Admin users/agents | N | N | N | Y | Y |
| CMS edit | N | N | N | Y | Y |
| AI config edit | N | N | N | Y | Y |
| Notification rules | N | N | N | Y | Y |
| Command center/reports | N | N | Y | Y | Y |
| View in-app notifications | N | Y | Y | Y | Y |


## Appendix P -- Error Code Catalog


| Code | HTTP | Meaning | UI Handling |
| --- | --- | --- | --- |
| AUTH_INVALID_CREDENTIALS | 401 | Login failed | Show generic invalid credentials message |
| AUTH_TOKEN_EXPIRED | 401 | Access token expired | Silent refresh or redirect login |
| AUTH_FORBIDDEN | 403 | Role not permitted | 403 page or toast |
| VALIDATION_ERROR | 422 | Field validation failed | Inline field errors from details[] |
| RESOURCE_NOT_FOUND | 404 | Entity missing | Designed 404 states |
| CONFLICT_DUPLICATE_EMAIL | 409 | Email exists | Register form error |
| LEAD_IDEMPOTENCY_REPLAY | 200 | Duplicate Idempotency-Key | Return original lead |
| AI_UNAVAILABLE | 503 | Gemini unreachable | Search: fallback; chat: user-safe error |
| AI_TIMEOUT | 504 | Gemini timeout | Search: FILTER_FALLBACK mode |
| BULK_PARSE_ERROR | 400 | CSV unreadable | SCR-BULK error state |
| BULK_VALIDATION_FAILED | 422 | Row errors present | Block import until review |
| PROPERTY_PUBLISH_BLOCKED | 422 | Missing required media/fields | Inline editor errors |
| RATE_LIMITED | 429 | Too many requests | Retry-after messaging |
| INTERNAL_ERROR | 500 | Unexpected server fault | Generic error UX; log correlation id |


## Appendix Q -- Logging Event Catalog


| Event Key | Level | Fields | PII Policy |
| --- | --- | --- | --- |
| auth.login.success | INFO | userId, role | No password, no tokens |
| auth.login.failure | WARN | email hash prefix | No password |
| auth.register | INFO | userId |  |
| property.publish | INFO | propertyId, actorUserId |  |
| property.archive | INFO | propertyId |  |
| lead.create | INFO | leadId, source | PII minimized in prod |
| lead.stage_change | INFO | leadId, from, to |  |
| ai.search | INFO | mode, latencyMs | No full query in prod if policy restricts |
| ai.search.fallback | WARN | reason |  |
| ai.chat | INFO | sessionId | Truncate message bodies in logs |
| ai.loan_analysis | INFO | formulaFallbackUsed |  |
| bulk.validate | INFO | counts |  |
| bulk.import | INFO | rowsImported |  |
| notification.sent | INFO | eventType, channel |  |
| cms.update | INFO | slug |  |
| http.error | ERROR | code, route | Include correlationId |

## Appendix R -- Future Auditing Detail (Post-MVP)

MVP implements baseline createdAt/updatedAt and actor ids on configurable entities. Full immutable audit ledger is deferred.

| Audit Capability | MVP | Future |
|------------------|-----|--------|
| User login history export | Partial lastLoginAt | Full audit trail |
| Property field-level history | No | Yes |
| Lead stage change log | Application logs only | Queryable audit table |
| AI prompt version history | Single current AiConfig | Versioned snapshots |
| CMS content versions | Latest published | Rollback |
| Notification delivery receipts | Basic sent log | Provider webhooks |
| GDPR data subject export | Manual | Automated |


## Appendix S -- Constitution Compliance Mapping


| Constitution Topic | Section | SRS Supplement Anchors |
| --- | --- | --- |
| HTML fidelity mandate | Section 3.3 | Appendix E, L NFR-U-001, AD DoD |
| Gemini only | Section 5.3 | BR-AI-1, EXT-01 |
| No Kanban MVP | Section 3.4 / Out-of-MVP | Appendix E note, J Wont |
| Centralized API client | Section 4.5 | NFR-M-003, AC mock policy |
| Replace mocks | Section 2 principle 10 | Appendix AC |
| Definition of Done | Section 14 | Appendix AD |
| QA checklist | Section 15 | Appendix H |
| Role-based only | Section 2 principle 11 | Appendix O |
| Email+in-app notifications | Section 5.3 | BR-NTF-1, Appendix Y |


## Appendix T -- Extended Glossary


| Term | Definition |
| --- | --- |
| AI Search | Gemini-powered natural language property search with explainable ranking. |
| Filter Fallback | Filter-only search results when AI fails; SCR-SEARCH-FB. |
| PropVista CRM | UI brand name for Property AI Studio. |
| Idempotency-Key | HTTP header preventing duplicate lead creation on retries. |
| Published Listing | Property status visible on public discovery surfaces. |
| Lead Stage | CRM pipeline phase without Kanban UI in MVP. |
| Match Score | Percentage indicating AI ranking confidence on SCR-SEARCH-STD. |
| Match Reasons | Check/cross indicators explaining AI ranking. |
| AiConfig | Administrative chatbot settings hot-reloaded to Gemini prompts. |
| Notification Rule | Admin mapping from event type to email/in-app channels. |
| VisitRequest | Scheduled tour capture from property or lead contexts. |
| Requirement Profile | Customer budget/type/bedroom/location preferences. |
| Command Center | SCR-CMD KPI dashboard for agents and admins. |
| Bulk Validate | CSV validation pass before partial import. |
| Guest | Unauthenticated browser user with public access only. |
| Super Admin | Highest role; includes all Admin capabilities. |
| Leaflet | Client map library paired with OpenStreetMap tiles. |
| Prisma | ORM accessing PostgreSQL schema. |
| JWT | JSON Web Token used for access and refresh sessions. |
| Formula Fallback | Deterministic loan EMI math when Gemini unavailable. |


## Appendix U -- Document Control RACI

| Activity | Product Owner | Technical Lead | Engineering | QA | Admin Stakeholder |
|----------|---------------|----------------|-------------|-----|-------------------|
| Approve SRS supplement | A | C | I | C | I |
| Maintain FR traceability | A | R | C | C | I |
| Verify MVP exclusions | A | R | R | R | C |
| HTML fidelity sign-off | A | C | R | R | I |
| API contract changes | C | A | R | C | I |
| Release go/no-go | A | C | C | R | C |

Legend: R = Responsible, A = Accountable, C = Consulted, I = Informed.


## Appendix V -- FR Presence Confirmation


Confirms each PRD functional requirement identifier is acknowledged in the authoritative requirement set.


| FR ID | Disposition | Reference |
| --- | --- | --- |
| FR-HOME-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-HOME-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-HOME-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-HOME-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-HOME-005 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-HOME-006 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-HOME-007 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AUTH-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AUTH-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AUTH-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AUTH-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AUTH-005 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AUTH-006 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AUTH-007 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-005 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-006 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-007 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-008 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-009 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-010 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-011 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-012 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-SEARCH-013 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-D-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-D-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-D-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-D-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-D-005 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-D-006 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-D-007 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-D-008 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-D-009 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-D-010 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-D-011 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-005 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-006 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-007 | EXCLUDED-MVP | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-008 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-009 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-010 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-011 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-012 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-013 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-014 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PROP-M-015 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-BULK-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-BULK-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-BULK-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-BULK-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-BULK-005 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-BULK-006 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CUS-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CUS-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CUS-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CUS-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CUS-005 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CUS-006 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CUS-007 | EXCLUDED-MVP | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-005 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-006 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-007 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-008 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-009 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-010 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-011 | EXCLUDED-MVP | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-012 | EXCLUDED-MVP | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-013 | EXCLUDED-MVP | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-014 | EXCLUDED-MVP | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-CRM-015 | EXCLUDED-MVP | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-ADM-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-ADM-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-ADM-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-ADM-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-ADM-005 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-ADM-006 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-ADM-007 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-ADM-008 | EXCLUDED-MVP | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AI-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AI-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AI-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AI-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AI-005 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AI-006 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AI-007 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-AI-008 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PLT-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PLT-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PLT-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PLT-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-PLT-005 | EXCLUDED-MVP | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-UX-001 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-UX-002 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-UX-003 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-UX-004 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |
| FR-UX-005 | PRESENT-IN-SRS-SUPPLEMENT | Cross-ref PRD Section 10 and primary SRS Section 4 |


## Appendix W -- Detailed Field Validation Tables

### W.1 Register (FR-AUTH-001)

| Field | Rules | Error Code |
|-------|-------|------------|
| email | Required; RFC5322 subset; unique | VALIDATION_ERROR |
| password | Min 8 chars; complexity per HTML hint | VALIDATION_ERROR |
| firstName | Required; max 80 | VALIDATION_ERROR |
| lastName | Required; max 80 | VALIDATION_ERROR |
| phone | Optional; E.164 or local pattern | VALIDATION_ERROR |

### W.2 Login (FR-AUTH-002)

| Field | Rules | Error Code |
|-------|-------|------------|
| email | Required | VALIDATION_ERROR |
| password | Required | AUTH_INVALID_CREDENTIALS on mismatch |

### W.3 Property Editor (FR-PROP-M-002)

| Field | Rules | Error Code |
|-------|-------|------------|
| title | Required; max 200 | VALIDATION_ERROR |
| priceAmount | Required; positive numeric string BR-PROP-3 | VALIDATION_ERROR |
| bedrooms | Required; integer >= 0 | VALIDATION_ERROR |
| bathrooms | Required; number >= 0 | VALIDATION_ERROR |
| areaSqFt | Required; number > 0 | VALIDATION_ERROR |
| description | Required before publish | PROPERTY_PUBLISH_BLOCKED |
| gallery | >=1 image before publish | PROPERTY_PUBLISH_BLOCKED |

### W.4 Lead Capture (FR-CRM-001)

| Field | Rules | Error Code |
|-------|-------|------------|
| fullName | Required | VALIDATION_ERROR |
| email | Required if phone empty | VALIDATION_ERROR |
| phone | Required if email empty | VALIDATION_ERROR |
| propertyId | Required when source PROPERTY_INQUIRY | VALIDATION_ERROR |
| Idempotency-Key | Optional header; UUID format | VALIDATION_ERROR |

### W.5 Schedule Visit (FR-CRM-009)

| Field | Rules | Error Code |
|-------|-------|------------|
| propertyId | Required | VALIDATION_ERROR |
| requestedDate | Required; not in past | VALIDATION_ERROR |
| requestedTimeSlot | Required | VALIDATION_ERROR |
| message | Optional; max 1000 | VALIDATION_ERROR |

### W.6 Loan Analysis (FR-AI-007)

| Field | Rules | Error Code |
|-------|-------|------------|
| propertyPrice | Required; number > 0 | VALIDATION_ERROR |
| downPayment | Required; >= 0; <= propertyPrice | VALIDATION_ERROR |
| annualIncome | Required; > 0 | VALIDATION_ERROR |
| existingEmi | Optional; >= 0 | VALIDATION_ERROR |
| interestRatePercent | Required; 0.1-30 | VALIDATION_ERROR |
| tenureYears | Required; 1-40 integer | VALIDATION_ERROR |

### W.7 Bulk Upload (FR-BULK-001)

| Column | Rules | Error Code |
|--------|-------|------------|
| title | Required | BULK_VALIDATION_FAILED row |
| priceAmount | Positive numeric string | BULK_VALIDATION_FAILED row |
| bedrooms | Non-negative integer | BULK_VALIDATION_FAILED row |
| status | DRAFT or PUBLISHED only on import | BULK_VALIDATION_FAILED row |
| latitude/longitude | Optional pair | warning row |

### W.8 AI Config FAQ (FR-AI-003)

| Field | Rules | Error Code |
|-------|-------|------------|
| question | Required; max 500 | VALIDATION_ERROR |
| answer | Required; max 5000 | VALIDATION_ERROR |
| order | Required; unique integer | VALIDATION_ERROR |
| systemPrompt | Required on save | VALIDATION_ERROR |
| greetingMessage | Required on save | VALIDATION_ERROR |



## Appendix X -- Status Transition Tables

### X.1 Property Status (BR-PROP-1)

| From \ To | DRAFT | PUBLISHED | ARCHIVED |
|------------|-------|-----------|----------|
| DRAFT | - | Allowed when required fields + media satisfied | Allowed |
| PUBLISHED | Allowed (unpublish) | - | Allowed |
| ARCHIVED | Allowed (restore draft) | Allowed (republish) | - |

Public search index includes PUBLISHED only. ARCHIVED hidden from public; visible in admin inventory with badge FR-PROP-M-009.

### X.2 Lead Stage (BR-LEAD-4; list/detail only, no Kanban)

| From \ To | NEW | CONTACTED | SITE_VISIT | NEGOTIATION | CLOSED_WON | CLOSED_LOST |
|------------|-----|-----------|------------|-------------|------------|-------------|
| NEW | - | Allowed | Allowed | Allowed | Allowed | Allowed |
| CONTACTED | Allowed | - | Allowed | Allowed | Allowed | Allowed |
| SITE_VISIT | Allowed | Allowed | - | Allowed | Allowed | Allowed |
| NEGOTIATION | Allowed | Allowed | Allowed | - | Allowed | Allowed |
| CLOSED_WON | Terminal | Terminal | Terminal | Terminal | - | N/A |
| CLOSED_LOST | Terminal | Terminal | Terminal | Terminal | N/A | - |

Stage changes use PATCH /leads/{id}/stage per design-details; UI action on SCR-LEAD-D FR-CRM-008.



## Appendix Y -- Notification Event Catalog (Email + In-App Only)

| Event Key | Trigger | Email | In-App | Typical Recipients |
|-----------|---------|-------|--------|--------------------|
| lead.created | New lead captured | Yes | Yes | Assigned agent, Admin |
| lead.inquiry_update | Customer inquiry status change | Yes | Yes | Customer |
| property.published | Listing published | Optional | Yes | Admin, creating Agent |
| visit.requested | Schedule visit submitted | Yes | Yes | Agent, Admin |
| visit.confirmed | Agent confirms visit | Yes | Yes | Customer |
| auth.password_reset | Future if implemented | Yes | No | User |

SMS, WhatsApp, and push columns are intentionally absent per BR-NTF-2.



## Appendix Z -- Performance Budgets per Route Class

| Route Class | Examples | Budget (p75) | Notes |
|-------------|----------|--------------|-------|
| Public static marketing | SCR-HOME | LCP < 2.0s | NFR-P-001 |
| Search results | SCR-SEARCH-* | TTFB + render < 2.5s | AI may add async ranking overlay |
| Property detail | SCR-PROP-D | LCP < 2.5s | Map lazy loaded NFR-P-004 |
| Authenticated dashboard | SCR-CUS-DASH, SCR-CMD | LCP < 2.5s | Chart data paginated |
| Admin tables | SCR-PROP-INV, SCR-CLIENTS | Interaction < 100ms after data | Server pagination NFR-P-002 |
| AI endpoints | /ai/search, /ai/chat | Timeout AI_SEARCH_TIMEOUT_MS | Fallback required for search |
| Bulk validate | /properties/bulk/validate | Progress UI for >5s jobs | Admin-only |



## Appendix AA -- Accessibility Requirements Baseline (NFR-U-003)

| Requirement | Application |
|-------------|-------------|
| Form labels | All inputs in REGISTER, LOGIN, editors associate label/aria-label |
| Keyboard navigation | Modals (ADD-LEAD, SCHED, LOAN) trap focus and restore |
| Color contrast | Use design tokens from propvista_crm/DESIGN.md |
| Alt text | Image entity altText surfaced on property gallery |
| Error announcements | aria-live for toast and inline validation FR-UX-003 |
| Map accessibility | Textual address + landmarks list not map-only |
| Skip links | Optional on marketing homepage if HTML includes |



## Appendix AB -- Threat Model Notes (OWASP Mapping Brief)

| OWASP Top 10 Risk | Mitigation in MVP |
|-------------------|-------------------|
| A01 Broken Access Control | Appendix O RBAC; server-side role checks NFR-S-002 |
| A02 Cryptographic Failures | TLS in transit; password hashing BR-AUTH-2 |
| A03 Injection | Prisma parameterized queries; input validation NFR-S-003 |
| A04 Insecure Design | Idempotency on leads; AI fallback UX |
| A05 Security Misconfiguration | Env secrets Appendix N; no keys in client |
| A06 Vulnerable Components | Dependency scanning in CI |
| A07 Auth failures | Rate limit auth NFR-S-006; refresh rotation |
| A08 Data integrity failures | Bulk validation before import |
| A09 Logging failures | Appendix Q structured events |
| A10 SSRF | Restrict server outbound URLs for Gemini/SMTP/OSM only |



## Appendix AC -- Mock API Replacement Policy

Temporary client mocks are permitted only until Express endpoints exist for a screen's FR set. When backend merges:

1. Remove mock adapters from centralized API client.
2. Wire hooks to real /api/v1 routes.
3. Update integration tests to hit test database or httptest server.
4. QA verifies Appendix AD DoD "Real API integrated".

Mocks must not ship to production builds. Feature flags for mock mode forbidden in production environment.



## Appendix AD -- Definition of Done Checklist (Mirrored from Constitution Section 14)

A task or feature is Done only if all boxes apply:

- [ ] HTML matches exactly (UI work)
- [ ] Screenshot matches exactly (UI work)
- [ ] Responsive verified
- [ ] Accessibility basics implemented (Appendix AA)
- [ ] Real API integrated (Appendix AC)
- [ ] No console errors
- [ ] No lint errors
- [ ] No TypeScript errors
- [ ] Code reviewed
- [ ] QA approved

Partial completion is not Done.



## Appendix AE -- Open Questions Already Resolved by Governing Sources

These items are recorded as decisions to prevent re-litigation during implementation.

| Topic | Decision | Source |
|-------|----------|--------|
| LLM vendor | Google Gemini only for search, chat, loan | Constitution Section 5.3, BR-AI-1 |
| Auth method | Email + password with JWT access/refresh | Requirements Phase 2, BR-AUTH-3 |
| Multi-tenancy | Single organization; no tenant switcher | BR-ORG-1 |
| Permission model | Role-based only; no module ACL matrix | BR-ORG-2, Constitution Section 2 |
| Kanban leads | Out of MVP; use list + detail | Constitution, FR-CRM-014 EXCLUDED |
| Notification channels | Email + in-app only | BR-NTF-1, FR-PLT-005 EXCLUDED |
| Maps | Leaflet + OpenStreetMap | BR-DATA-3, Constitution Section 5 |
| UI conflicts | HTML wins presentation | Constitution Section 3.2 |
| Functional conflicts | Requirements win except HTML-only behaviors to include | Constitution Section 3.2 |
| AI search failure | Mandatory filter fallback with banner | BR-AI-4, FR-SEARCH-011 |
| Stack | Next.js 15, React 19, Express, Prisma, PostgreSQL, Vercel | Constitution Section 5 |
| Activity timeline | Excluded as product; minimal notes on lead detail only | BR-LEAD-5 |
| Virtual tours / video | Excluded from MVP property editor | BR-PROP-6, FR-PROP-M-007 |
| Deploy target | Vercel for frontend | NFR-C-001 |
| Coverage target | >80% unit on core business logic | NFR-M-004 |




## Supplementary Implementation Notes (Traceability Narrative)

This narrative section increases requirement density for engineering onboarding without adding new product scope. Each paragraph restates binding constraints from the Product Requirements Document and Project Constitution so that contractors unfamiliar with prior meetings can still implement correctly.

### Authentication and session lifecycle

Registration creates a Customer role by default unless an Admin provisions another role through SCR-USERS. Login returns access and refresh token pair; the Next.js application stores tokens according to the secure cookie or memory strategy defined in the technical architecture document, but tokens must never be logged. Protected routes in the App Router enforce FR-AUTH-003 using server and client guards that call the same authorization primitives as Express middleware. Password reset flows may arrive post-MVP; until then, Admin user management handles account recovery operationally. Guest users browse SCR-HOME, SCR-SEARCH-*, and SCR-PROP-D without tokens but cannot persist favorites until FR-AUTH-002 completes.

### Search module integration

The search module orchestrates three presentation screens that are not three separate products but three states of one module. SCR-SEARCH-STD renders when POST /ai/search returns mode AI. SCR-SEARCH-FB renders when mode FILTER_FALLBACK. SCR-SEARCH-EMPTY renders when the result set is empty regardless of mode. Auto-suggestions FR-SEARCH-005 debounce input and must not block manual submit. Pagination FR-SEARCH-009 is server-driven; client page state syncs to query parameters for shareable URLs if HTML demonstrates share behavior. Favorite controls FR-SEARCH-010 call the same favorite service as property detail to avoid duplicate business rules.

### Property management and media

Property editor validates BR-PROP-2 fields before enabling Publish. Photo upload FR-PROP-M-006 writes Image rows with kind GALLERY; floorplan uploads use kind FLOORPLAN. Development uses MEDIA_STORAGE_PATH; production storage adapter must preserve public URL shape expected by HTML img tags. Inventory grid FR-PROP-M-008 through FR-PROP-M-015 includes bulk row actions; destructive delete requires confirmation modal matching HTML. Export CSV FR-PROP-M-013 includes visible columns only after column customization FR-PROP-M-012.

### CRM without Kanban

Lead list SCR-CLIENTS replaces Kanban navigation entry removed from MVP shell. Agents sort and filter leads using table controls present in Requirements components. Lead detail SCR-LEAD-D shows stage badge FR-CRM-004 and change stage action FR-CRM-008 without drag-and-drop. Notes FR-CRM-007 append-only list satisfies collaboration minimum without shipping excluded timeline product FR-CRM-011. Call and email buttons FR-CRM-010 use tel: and mailto: or equivalent UX without integrating excluded SMS/WhatsApp.

### AI configuration and chat

AiConfig updates apply to subsequent chat sessions and preview pane FR-AI-006. FAQ entries FR-AI-003 inject into Gemini context within token limits; truncation strategy must prefer highest order FAQs. Escalation FR-AI-004 sends email to escalationEmail during workingHoursJson only; outside hours message returned in chat is user-safe. Health endpoint FR-AI-008 reports Gemini connectivity for ops dashboards without exposing secrets.

### Admin command center and reports

SCR-CMD charts FR-ADM-001 through FR-ADM-006 consume aggregated queries; date range picker recalculates all widgets consistently. Recent activity feed FR-ADM-005 shows publish events, new leads, and stage changes but does not replicate excluded automation or reminder tasks. SCR-REPORTS FR-ADM-007 may overlap metrics; implementers deduplicate data sources rather than duplicate business definitions.

### Customer dashboard

SCR-CUS-DASH surfaces saves FR-CUS-002, requirement profile FR-CUS-003, inquiries FR-CUS-004, and notification bell FR-CUS-005. Quick actions FR-CUS-006 route to search and profile editors. Excluded FR-CUS-007 full activity timeline must not appear; inquiry list satisfies history requirement.

### Notifications and CMS

Notification rules SCR-NTF-RULES edit Appendix Y events with toggles for email and in-app channels only. CMS SCR-CMS edits CmsPage sectionsJson driving homepage hero FR-HOME-007 and featured property ids FR-HOME-002. Unpublished CMS drafts must not leak to public SSR routes.

### Quality engineering expectations

Test cases Appendix H map to FR groups for sprint planning. NFR verification Appendix L runs in CI and release checklist. Error codes Appendix P must be handled in UI components with FR-UX-003 patterns. Logging Appendix Q feeds future observability; correlation ids join browser error reports with server logs.



### Implementation note 1

Data dictionary entities enforce referential integrity at service layer before Prisma commits. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 2

API envelopes remain stable when Prisma schema evolves; use DTO mappers. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 3

Screen state matrix Appendix E is acceptance input for UX QA walkthroughs. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 4

Sequence specs Appendix F convert to Gherkin features for E2E automation. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 5

RBAC Appendix O tests run as table-driven Jest/Pytest cases against Express routes. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 6

Bulk import never bypasses validation even for Admin Super User. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 7

Gemini prompts include organization name from CMS or env ORG_DISPLAY_NAME. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 8

Leaflet map initializes only when latitude/longitude present on property. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 9

Favorite toggles are optimistic UI with server reconciliation on failure. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 10

Lead idempotency stores key hash 24 hours minimum to absorb client retries. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 11

Published property unpublish returns to draft and removes from search index immediately. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 12

Archived properties remain in CRM property interest history with archived badge. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 13

Loan analysis disclaimer always shown; not financial advice. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 14

Chat widget on homepage respects AiConfig greeting on every open. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 15

Command center conversion rate defines numerator/denominator in metrics service README. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 16

Reports export if present must respect same date filters as SCR-CMD. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 17

Register form password rules displayed match server validation exactly. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 18

Inventory search filters combine with AND semantics unless HTML shows OR. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 19

Image sortOrder determines carousel sequence on SCR-PROP-D. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 20

Landmarks list renders when map fails loading per SCR-PROP-D error column. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 21

VisitRequest links to notifications visit.requested and visit.confirmed events. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 22

Admin deactivating user invalidates refresh tokens on next use BR-AUTH-4. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 23

Super Admin differs from Admin only where explicitly coded; default same matrix Appendix O. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 24

SEO meta tags on public pages may use CmsPage title fields. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 25

Express rate limit returns RATE_LIMITED Appendix P with Retry-After header. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 26

Prisma migrations run before seed scripts in deployment pipeline Appendix M. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 27

Environment variables validated at boot; missing GEMINI_API_KEY fails fast in production. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 28

CORS allows only NEXT_PUBLIC frontend origin in production. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 29

File upload size limits protect bulk and image endpoints. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 30

CSV injection mitigation escapes formula characters in bulk error export. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 31

Accessibility focus order on modals matches visual order Appendix AA. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 32

Hover states never replace focus indicators for keyboard users. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 33

Empty states include primary CTA per HTML FR-UX-002. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 34

Loading skeletons match card geometry FR-UX-001. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 35

Error toasts auto-dismiss timing matches design tokens if specified. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 36

Responsive breakpoints use Tailwind config aligned to design_reference HTML. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 37

Customer requirement profile percentage FR-CUS-001 calculates from filled fields weights. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 38

Inquiry status values enumerated in API contract mirror customer dashboard labels. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 39

Agent assignment on lead optional; defaults round-robin only if Requirements specify--otherwise manual. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 40

Property duplicate action clones draft with new id FR-PROP-M-010. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 41

Bulk warning rows importable if business accepts partial coords. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 42

AI search does not return draft or archived property ids BR-PROP-4. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 43

Chat sessions expire after inactivity timeout configured server-side. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 44

Preview chat in AI config uses same backend path as production chat with preview flag. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 45

Notification read state syncs across tabs via refetch on focus optional. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 46

Email templates plain + HTML multipart for deliverability. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 47

Health check includes database ping NFR-A-003. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 48

Constitution compliance Appendix S audited each release milestone. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.


### Implementation note 49

Mock removal Appendix AC verified by grep for mock keywords in API client before tag. Detailed verification belongs to the FR IDs referenced in Appendix K for the screen under test.

**End of Software Requirements Specification**

*Appendices C-V expand supporting specs. Total functional requirements specified: 107. No PRD FR omitted.*
