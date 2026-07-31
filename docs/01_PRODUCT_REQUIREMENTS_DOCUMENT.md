# Property AI Studio — Product Requirements Document (PRD)

| Field | Value |
|-------|--------|
| **Product Name** | Property AI Studio (UI brand: **PropVista CRM**) |
| **Document Type** | Product Requirements Document |
| **Version** | 1.0.0 |
| **Effective Date** | 2026-07-30 |
| **Status** | Authoritative Product PRD |
| **Audience** | Product Owners, Engineering, Design, QA, AI coding assistants |

---

## Document Control

### Governing Sources

| Priority | Document | Role |
|----------|----------|------|
| 1 | `docs/00_PROJECT_CONSTITUTION.md` | Engineering governance, MVP exclusions, stack, process |
| 2 | `docs/REQUIREMENTS_AND_PROPOSAL.md` | Functional source of truth (features, roles, workflows, scope) |
| 3 | `docs/design_reference/**` | UI source of truth (HTML + screenshots) |

### Conflict Rules (Binding)

1. **UI:** If HTML and Requirements conflict on presentation or interaction, **HTML wins**.
2. **Function:** Requirements define business rules, roles, modules, and workflows.
3. **HTML-only behavior:** If functionality appears in HTML but not in Requirements, **it is included in this PRD**.
4. **MVP exclusions:** Constitution Out-of-MVP items are **not** in MVP even if HTML exists; they are cataloged under Future Scope.
5. **Stack:** Constitution stack overrides older stack notes in Requirements (Next.js 15, React 19, TypeScript, Tailwind, Node/Express, PostgreSQL, Prisma, Google Gemini only, Leaflet + OSM, email+password auth, email + in-app notifications, Vercel).

### Related Artifacts

- Design catalog: `docs/design_reference/design-references-catalog.md`
- Design details: `docs/design_reference/design-details.md`
- Design tokens: `docs/design_reference/propvista_crm/DESIGN.md`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)  
2. [Product Vision](#2-product-vision)  
3. [Business Goals](#3-business-goals)  
4. [Business Objectives](#4-business-objectives)  
5. [Stakeholders](#5-stakeholders)  
6. [User Personas](#6-user-personas)  
7. [User Roles](#7-user-roles)  
8. [User Journey](#8-user-journey)  
9. [Business Rules](#9-business-rules)  
10. [Functional Requirements](#10-functional-requirements)  
11. [Non-Functional Requirements](#11-non-functional-requirements)  
12. [Complete Module List](#12-complete-module-list)  
13. [Screen Inventory](#13-screen-inventory)  
14. [Navigation Flow](#14-navigation-flow)  
15. [End-to-End User Flows](#15-end-to-end-user-flows)  
16. [Feature Catalog](#16-feature-catalog)  
17. [MVP Scope](#17-mvp-scope)  
18. [Future Scope](#18-future-scope)  
19. [Success Metrics](#19-success-metrics)  
20. [Assumptions](#20-assumptions)  
21. [Constraints](#21-constraints)  
22. [Risks](#22-risks)  
23. [Acceptance Criteria](#23-acceptance-criteria)  
24. [Traceability Matrix](#24-traceability-matrix)  

---

## 1. Executive Summary

Property AI Studio is an AI-powered real estate web platform for a **single organization**. It unifies property discovery, listing management, CRM lead handling, role-based dashboards, Google Gemini-powered search and chat, loan analysis, CMS, notifications (email + in-app), and administration.

**Core differentiation:** Natural-language property search and conversational assistance powered exclusively by **Google Gemini**, with explainable match scores/reasons when AI succeeds, and a **visible filter-only fallback** when AI fails or times out.

**Problem:** Real estate professionals use fragmented tools for listings, search, lead capture, communication, and reporting. Buyers face rigid filters that do not match how people describe homes. Requirements state no single platform currently combines CRM, AI search, and modern UX for these workflows.

**Solution (from Requirements + HTML):**

- Public AI search landing, search results (standard / fallback / empty), and premium property details  
- Customer account dashboard (favorites, requirements, inquiries, notifications)  
- Agent/Admin property inventory, listing editor, bulk upload validation  
- Lead list/detail CRM (Kanban deferred per Constitution MVP exclusions)  
- Admin command center KPIs, AI chatbot configuration, CMS, users/agents, reports, notification rules  
- Auth via email + password; role-based access only  

**Product brand in UI:** PropVista CRM (per HTML titles and design references).  
**Engineering product name:** Property AI Studio.

This PRD defines **what** must be built. The Constitution defines **how** it must be built and verified. Design HTML defines **how it must look and behave visually**.

---

## 2. Product Vision

### 2.1 Vision Statement

Enable every buyer, agent, and administrator in one organization to discover, evaluate, inquire about, and manage properties through an AI-assisted experience that feels as precise as the designed PropVista CRM interfaces - and as reliable as traditional filter search when AI is unavailable.

### 2.2 Vision Pillars

| Pillar | Description |
|--------|-------------|
| AI-first discovery | Guests and customers search in natural language ('3BHK under 80 lakhs near tech park') via Gemini |
| Explainability | Match scores (%) and check/cross match reasons when AI ranking succeeds |
| Operational CRM | Agents and Admins capture, view, update, and work leads tied to properties |
| Inventory control | Create/edit/publish/archive listings; inventory grid; bulk validation |
| Configurable AI | Admins tune chatbot greeting, FAQs, escalation, tone/prompts without redeploy |
| Role clarity | Guest, Customer, Agent, Admin, Super Admin - role-based only, single org |
| Design fidelity | Shipped UI is visually indistinguishable from `design_reference` HTML |

### 2.3 Product Positioning

| Audience | Value |
|----------|--------|
| Property seekers | Faster, more natural search; rich details; inquire/save; loan analysis |
| Agents | Manage assigned inventory and leads; schedule visits; performance visibility |
| Admins / Super Admins | Org control: users, CMS, AI config, reports, notifications, bulk ops |

### 2.4 Explicit Non-Vision (MVP)

Per Constitution, MVP does **not** pursue: Kanban pipeline UI, activity timeline product, reminder system, automation engines, virtual tours, video upload, SMS, WhatsApp, or push notifications. Those may appear in HTML or post-MVP roadmap and are documented in �18 only.

---

## 3. Business Goals

G1. **Unify** property marketing, AI search, lead capture, and admin operations in one web product.  
G2. **Increase** qualified lead volume via homepage search, chatbot, contact/inquiry CTAs, and property detail CTAs.  
G3. **Reduce** time-to-match for seekers through NLP search with filter fallback.  
G4. **Improve** agent productivity with lead list/detail, property inventory, and scheduling entry points present in Requirements/HTML (non-excluded).  
G5. **Give** leadership visibility via admin command center KPIs and reports.  
G6. **Control** AI behavior operationally through Admin configuration (Gemini-only).  
G7. **Ship** an MVP that meets Constitution fidelity, security, and performance bars without scope creep into excluded channels/features.

---

## 4. Business Objectives

Measurable objectives aligned to Requirements success criteria and Constitution MVP outcomes:

| ID | Objective | Target (MVP) |
|----|-----------|--------------|
| BO-1 | Primary public journeys work end-to-end | Search -> detail -> inquiry validated |
| BO-2 | Agent inventory journey works | Create/edit -> publish -> visible in search/inventory |
| BO-3 | Agent/Admin lead journey works | Capture -> list -> detail -> status update |
| BO-4 | Admin operations work | Users, notifications visibility, CMS basics, AI config |
| BO-5 | Page performance | Average page load **&lt; 2 seconds** on reference broadband |
| BO-6 | Availability | **99.5%+** uptime target |
| BO-7 | Security baseline | No critical vulnerabilities; auth validated; inputs sanitized |
| BO-8 | Test coverage | **&gt;80%** unit coverage on core business logic |
| BO-9 | UI fidelity | In-scope screens pass HTML + screenshot verification |
| BO-10 | AI reliability UX | On Gemini failure/timeout, filter fallback shown with visible indicator |

---

## 5. Stakeholders

Derived from Requirements stakeholder intent and Constitution RACI:

| Stakeholder | Interest | Influence | Engagement |
|-------------|----------|-----------|------------|
| Product Owner | Scope, priorities, MVP honesty, HTML fidelity acceptance | High | Approves scope & Constitution amendments |
| Technical Lead | Architecture, API contracts, stack compliance | High | Accountable for technical decisions |
| Engineering Manager | Delivery process, staffing, merge governance | High | Enforces lifecycle & DoD |
| Frontend Engineers / AI Assistants | Pixel-faithful UI, hooks, API client | High | Implement screens per HTML |
| Backend Engineers / AI Assistants | Express/Prisma APIs, Gemini, authz | High | Implement services & contracts |
| QA | Functional, UI verification, regression | High | Gate approval |
| Agents (end users) | Leads, listings, tours scheduling | Medium | UAT participants |
| Customers / Buyers | Search, save, inquire, loan analysis | Medium | UAT participants |
| Admins / Super Admins | Config, users, CMS, reports, AI | Medium | UAT participants |
| Organization Leadership | Conversion, inventory health, ROI of AI | Medium | Sponsors goals |

---

## 6. User Personas

Personas are descriptive composites of the five roles in Requirements - not invented roles.

### 6.1 Guest Seeker - "Alex"

- **Role:** Guest  
- **Goals:** Understand the service; try AI search; browse featured properties; optionally chat; register later.  
- **Behaviors:** Uses homepage NLP bar and suggestion chips; opens property cards; may submit contact/inquiry without account depending on CTA.  
- **Pain:** Rigid portals; unclear why a listing matches.  
- **Success:** Finds relevant listings quickly; sees explainable matches or clear empty/fallback states.

### 6.2 Registered Buyer - "Jordan"

- **Role:** Customer  
- **Goals:** Save properties; manage requirement profile; track inquiries; use loan analysis; receive in-app/email notifications.  
- **Behaviors:** Signs in; uses customer dashboard; favorites from cards/detail; returns to refine search.  
- **Pain:** Lost inquiry history; no single place for saved homes.  
- **Success:** Dashboard shows saves, inquiry status, requirements completion, notifications.

### 6.3 Sales Agent - "Sam"

- **Role:** Agent  
- **Goals:** Maintain own/assigned listings; work assigned leads; schedule visits; see performance-relevant admin surfaces as allowed.  
- **Behaviors:** Uses inventory/editor; lead list + detail; schedule visit modal/actions present in product.  
- **Pain:** Switching tools for listings vs leads.  
- **Success:** Listing published; lead updated; visit scheduled confirmation path works.

### 6.4 Operations Admin - "Riley"

- **Role:** Admin  
- **Goals:** Manage users/agents; CMS; reports; AI chatbot config; notification rules; bulk upload validation; command center KPIs.  
- **Behaviors:** Lives in admin shell; configures Gemini chatbot; monitors funnel metrics.  
- **Pain:** AI behavior requiring engineering deploys.  
- **Success:** Config changes apply without redeploy; KPIs accurate; bulk validation actionable.

### 6.5 Super Admin - "Casey"

- **Role:** Super Admin  
- **Goals:** Full system configuration, audit, all data access.  
- **Behaviors:** Same surfaces as Admin plus system-wide controls/audit as Requirements specify.  
- **Success:** Can remediate org-wide issues and access all records.

---

## 7. User Roles

### 7.1 Role Definitions (Binding)

Single organization. **Role-based only. No module-level permissions.**

| Role | Access Summary (Requirements + Constitution) |
|------|-----------------------------------------------|
| **Guest** | Limited property browsing, public pages, registration |
| **Customer** | Search, favorites, inquiries, chat, loan analysis, profile |
| **Agent** | Own properties, assigned leads, tasks/tours, performance (as in scope) |
| **Admin** | Org-level - users, CMS, reports, AI config, settings, notifications |
| **Super Admin** | Full system - config, users, audit, all data |

### 7.2 Capability Matrix (Product)

| Capability | Guest | Customer | Agent | Admin | Super Admin |
|------------|:-----:|:--------:|:-----:|:-----:|:-----------:|
| Public homepage & featured properties | Yes | Yes | Yes | Yes | Yes |
| NLP + filter search & result states | Yes | Yes | Yes | Yes | Yes |
| Property details | Yes | Yes | Yes | Yes | Yes |
| AI chat widget (public surfaces) | Yes | Yes | Yes | Yes | Yes |
| Register / Sign in | Yes | - | - | - | - |
| Favorites / save | - | Yes | Limited* | Yes | Yes |
| Customer dashboard | - | Yes | - | - | Yes** |
| Loan analysis | - | Yes | Yes | Yes | Yes |
| Lead capture CTAs | Yes | Yes | Yes | Yes | Yes |
| Lead list (non-Kanban MVP) | - | - | Yes | Yes | Yes |
| Lead detail | - | - | Yes | Yes | Yes |
| Property inventory | - | - | Limited* | Yes | Yes |
| Listing editor | - | - | Yes | Yes | Yes |
| Bulk upload validation | - | - | - | Yes | Yes |
| Admin command center | - | - | Limited* | Yes | Yes |
| Users / agents management | - | - | - | Yes | Yes |
| CMS management | - | - | - | Yes | Yes |
| AI chatbot configuration | - | - | - | Yes | Yes |
| Notification rules / admin notifications | - | - | - | Yes | Yes |
| Reports | - | - | - | Yes | Yes |
| System-wide config / audit | - | - | - | - | Yes |
| Kanban pipeline | - | - | Future | Future | Future |

* Limited = only where Requirements and designed Agent surfaces allow.
** Super Admin may access all data; customer dashboard is a Customer-facing surface.

### 7.3 Authorization Rules

- Server-side enforcement mandatory; UI hiding is not security.  
- Unauthenticated users hitting protected routes are denied (401) and redirected to login.  
- Wrong role receives 403.  
- Soft-delete / inactive users cannot authenticate (per Requirements user model intent).

---

## 8. User Journey

### 8.1 Guest -> Customer Conversion Journey

```
Land on Homepage (HTML: propvista_crm_homepage)
  -> Try suggestion chip or NLP query
  -> Search Results (standard | fallback | empty)
  -> Open Property Details
  -> Favorite (prompts auth if required) / Inquire / Contact agent / Schedule tour
  -> Optional: Chat widget Q&A / lead capture
  -> Sign In or Join AI Pro (register)
  -> Customer Dashboard
```

### 8.2 Customer Ongoing Journey

```
Login
  -> Customer Dashboard (saves, requirements %, inquiries, notifications)
  -> New Search / Saved properties / Edit profile / Saved searches (as in HTML)
  -> Property Details -> Loan analysis modal
  -> Inquiry status updates via in-app + email notifications
```

### 8.3 Agent Journey

```
Login (Agent)
  -> Admin/Agent shell (sidebar)
  -> Property Inventory -> New/Edit Listing -> Save Draft / Publish
  -> Lead List -> Lead Detail -> Change stage / notes / Schedule visit
  -> (Future) Kanban pipeline
```

### 8.4 Admin Journey

```
Login (Admin / Super Admin)
  -> Command Center KPIs & charts
  -> Users / Agents
  -> CMS pages
  -> AI Chatbot Configuration (+ preview)
  -> Notification rules
  -> Reports
  -> Bulk upload -> Validation results -> Import valid rows
```

### 8.5 AI Failure Journey (Mandatory UX)

```
User submits NLP search
  -> Loading state (designed)
  -> Gemini timeout/error
  -> Filter-only results + visible fallback banner (HTML: search_results_filter_fallback_view)
  -> User may Reset/Refine search
```

---

## 9. Business Rules

### 9.1 Organization & Access

| ID | Rule |
|----|------|
| BR-ORG-1 | Product operates as a **single organization** (no multi-tenancy in scope). |
| BR-ORG-2 | Authorization is **role-based only**; no module-level permission matrix. |
| BR-ORG-3 | Roles are exactly: Guest, Customer, Agent, Admin, Super Admin. |

### 9.2 Authentication

| ID | Rule |
|----|------|
| BR-AUTH-1 | Authentication method is **email + password**. |
| BR-AUTH-2 | Passwords are stored hashed (never plaintext). |
| BR-AUTH-3 | Session uses secure token strategy (access + refresh as in Requirements auth design). |
| BR-AUTH-4 | Inactive or soft-deleted users cannot obtain valid sessions. |

### 9.3 Properties & Inventory

| ID | Rule |
|----|------|
| BR-PROP-1 | Listings have lifecycle statuses reflected in HTML inventory: **draft / published / archived** (and UI badges). |
| BR-PROP-2 | Required listing fields per HTML editor: title, price, bedrooms, bathrooms, area (and other required markers in HTML). |
| BR-PROP-3 | Price is handled as a **numeric string** display/input convention (not imprecise free float presentation). |
| BR-PROP-4 | Only published listings appear in public search/featured surfaces. |
| BR-PROP-5 | Agents manage own/assigned properties; Admins/Super Admins manage org inventory. |
| BR-PROP-6 | Media includes photo gallery and floorplan per property details HTML; **video upload / virtual tours are Out of MVP**. |
| BR-PROP-7 | Bulk upload must validate rows and allow importing **valid rows only** after review (HTML bulk results). |

### 9.4 Search & AI

| ID | Rule |
|----|------|
| BR-AI-1 | The only LLM provider is **Google Gemini**. |
| BR-AI-2 | AI Search, AI Chat, and Loan Analysis are the MVP AI product features. |
| BR-AI-3 | On AI search success, results may show **match score %** and **match reasons (check/cross)**. |
| BR-AI-4 | On AI search failure/timeout, system **must** fall back to filter-only results with a **visible** indicator. |
| BR-AI-5 | AI must not fabricate inventory not returned by property APIs. |
| BR-AI-6 | Admin prompt/chatbot configuration is persisted and applied without code deploy. |
| BR-AI-7 | HTML vendor labels that mention non-Gemini models are implemented as **Gemini-only** options/labels per Constitution. |

### 9.5 Leads & CRM

| ID | Rule |
|----|------|
| BR-LEAD-1 | Leads can be created from public/contact forms, chatbot, and property inquiry CTAs. |
| BR-LEAD-2 | Lead creation supports **source tracking** and validation; duplicate prevention / idempotency as specified in design-details FR6.x. |
| BR-LEAD-3 | Agents/Admins can list leads and open lead detail (contact, source, stage, notes, property interests). |
| BR-LEAD-4 | Lead stage workflow exists (basic status updates). **Kanban board is Out of MVP**. |
| BR-LEAD-5 | **Activity timeline product, reminder system, and automation are Out of MVP** (Constitution), even if HTML shows rich timeline/tasks–those UI elements are Future unless a minimal notes/status subset is required for MVP lead detail fidelity without shipping excluded systems. |
| BR-LEAD-6 | Schedule visit entry points present in Requirements (`ScheduleVisitModal`) and HTML CTAs are in product scope for MVP scheduling confirmation path. |

### 9.6 Customer

| ID | Rule |
|----|------|
| BR-CUS-1 | Customers can save/unsave favorites. |
| BR-CUS-2 | Customers can create/manage a requirement profile (budget, type, bedrooms, location preferences per HTML). |
| BR-CUS-3 | Customers can view inquiry history/status. |
| BR-CUS-4 | Loan analysis is available to authenticated Customer (and roles noted in matrix). |

### 9.7 Notifications & CMS

| ID | Rule |
|----|------|
| BR-NTF-1 | MVP notification channels are **Email** and **In-App** only. |
| BR-NTF-2 | SMS, WhatsApp, and Push are Out of MVP. |
| BR-NTF-3 | CMS manages public content such as homepage sections/pages per Requirements. |
| BR-NTF-4 | Admin notification rules UI exists (Requirements); engine completeness tracked against MVP matrix. |

### 9.8 Data & Platform

| ID | Rule |
|----|------|
| BR-DATA-1 | PostgreSQL is system of record via Prisma. |
| BR-DATA-2 | Development file storage is **local**; API shapes must remain stable for UI. |
| BR-DATA-3 | Maps use **Leaflet + OpenStreetMap** on property detail map sections. |

---

## 10. Functional Requirements

Requirements are numbered for traceability. Sources: Requirements MVP matrix, prototype feature set, and HTML/design-details FR groups.  
**Scope tags:** `MVP` | `FUTURE` | `HTML+REQ` | `HTML-ONLY` | `EXCLUDED-MVP`

### 10.1 Authentication & Users (AUTH)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-AUTH-001 | Users can register with email and password. | MVP | AUTH-001 |
| FR-AUTH-002 | Users can log in and log out; JWT access/refresh. | MVP | AUTH-002 |
| FR-AUTH-003 | Protected routes require authentication. | MVP | Requirements Phase 2 |
| FR-AUTH-004 | Role is stored on user and enforced server-side (Guest/Customer/Agent/Admin/Super Admin). | MVP | AUTH-005 + Constitution |
| FR-AUTH-005 | Admin/Super Admin can manage users (list/create/update/deactivate as designed). | MVP | ADM-001 |
| FR-AUTH-006 | Admin/Super Admin can manage agents (profile fields: name, email, phone, image). | MVP | Requirements agents |
| FR-AUTH-007 | Homepage provides Sign In and Join AI Pro CTAs. | MVP | HTML homepage |

### 10.2 Public Marketing & Homepage (HOME)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-HOME-001 | Homepage shows branding, navigation, AI search hero, suggestion chips. | MVP | HTML homepage |
| FR-HOME-002 | Homepage shows curated/featured property cards with image, price, beds/baths, location, save control. | MVP | HTML + CMS/featured |
| FR-HOME-003 | Homepage shows "Your journey to a better home" (how it works) section. | MVP | HTML |
| FR-HOME-004 | Homepage shows testimonials section. | MVP | HTML |
| FR-HOME-005 | Homepage includes AI chat widget (open/close, message input, send). | MVP | HTML + AI-002 |
| FR-HOME-006 | Homepage/public surfaces support contact/lead capture forms where present in HTML/design-details. | MVP | HTML + CRM-001 |
| FR-HOME-007 | Homepage content can be supplied/influenced by CMS (`/cms/homepage` intent). | MVP | design-details |

### 10.3 Search (SEARCH)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-SEARCH-001 | Users can submit natural-language search queries. | MVP | AI-001 / FR2.1 |
| FR-SEARCH-002 | Search supports loading state. | MVP | HTML / FR2.x |
| FR-SEARCH-003 | Successful AI results show match score as percentage. | MVP | HTML standard + FR2.2 |
| FR-SEARCH-004 | Successful AI results show match reasons with check/cross when available. | MVP | HTML + FR2.3 |
| FR-SEARCH-005 | Auto-suggestions as user types (where designed). | MVP | FR2.4 |
| FR-SEARCH-006 | Filter panel supports property type, price range, bedrooms, amenities (and location where HTML shows). | MVP | HTML search views |
| FR-SEARCH-007 | Users can clear/reset filters. | MVP | HTML |
| FR-SEARCH-008 | Results support grid/list view toggles where HTML provides. | MVP | HTML standard |
| FR-SEARCH-009 | Results support pagination. | MVP | HTML |
| FR-SEARCH-010 | Property cards on results support favorite/save control. | MVP | HTML |
| FR-SEARCH-011 | On AI failure/timeout, show filter-only results with visible fallback banner. | MVP | HTML fallback + FR2.6 |
| FR-SEARCH-012 | Empty state shows guidance, refine CTAs, and suggested chips/locations as in HTML. | MVP | HTML empty |
| FR-SEARCH-013 | Fallback view offers Reset Search / refine controls. | MVP | HTML fallback |

### 10.4 Property Details (PROP-D)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-PROP-D-001 | Property details load by id with title, price, beds/baths/area. | MVP | FR5.1 / PROP-003 |
| FR-PROP-D-002 | Gallery/carousel of images. | MVP | HTML / FR5.2 |
| FR-PROP-D-003 | Floorplan section/image. | MVP | HTML / FR5.2 |
| FR-PROP-D-004 | Overview, details, amenities, price breakdown sections as in HTML. | MVP | HTML / FR5.3 |
| FR-PROP-D-005 | Map with neighborhood/landmarks using Leaflet + OSM. | MVP | HTML / FR5.4 + Constitution |
| FR-PROP-D-006 | Agent contact card (photo, name, phone, email). | MVP | HTML |
| FR-PROP-D-007 | Primary CTA: Inquire about this property. | MVP | HTML / FR5.5 |
| FR-PROP-D-008 | Secondary CTAs: Contact agent / Schedule tour. | MVP | HTML |
| FR-PROP-D-009 | Favorite/save control on detail. | MVP | HTML / PROP-005 |
| FR-PROP-D-010 | Similar properties carousel. | MVP | HTML |
| FR-PROP-D-011 | Nearby landmarks data model support. | MVP | Requirements schema |

### 10.5 Property Inventory & Editor (PROP-M)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-PROP-M-001 | Create property listing (PROP-001). | MVP | Requirements |
| FR-PROP-M-002 | Edit property basic info per HTML listing editor. | MVP | HTML |
| FR-PROP-M-003 | Save as Draft and Publish Listing actions. | MVP | HTML |
| FR-PROP-M-004 | Amenities checklist + custom amenity input. | MVP | HTML |
| FR-PROP-M-005 | Description / highlights editors as in HTML. | MVP | HTML |
| FR-PROP-M-006 | Photo upload and floorplan upload. | MVP | HTML (local storage in dev) |
| FR-PROP-M-007 | Video tour URL / virtual tour fields. | FUTURE / EXCLUDED-MVP | HTML; Constitution bans virtual tours & video upload |
| FR-PROP-M-008 | Inventory grid with search, filters, sort, pagination. | MVP | HTML inventory |
| FR-PROP-M-009 | Status badges draft/published/archived. | MVP | HTML |
| FR-PROP-M-010 | Row actions: edit, duplicate, archive, delete. | MVP | HTML |
| FR-PROP-M-011 | Bulk select + bulk status/export/delete. | MVP | HTML |
| FR-PROP-M-012 | Column customization show/hide. | MVP | HTML |
| FR-PROP-M-013 | Export CSV. | MVP | HTML |
| FR-PROP-M-014 | Empty state when no properties match filters. | MVP | HTML |
| FR-PROP-M-015 | Views/saves counts columns where shown. | MVP | HTML |

### 10.6 Bulk Upload (BULK)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-BULK-001 | Admin can run bulk upload and see validation results screen. | MVP | HTML bulk |
| FR-BULK-002 | Summary of total/valid/error/warning counts. | MVP | HTML |
| FR-BULK-003 | Error table with row, field, message, value, suggested fix. | MVP | HTML |
| FR-BULK-004 | Download error report (CSV). | MVP | HTML |
| FR-BULK-005 | Import valid rows only. | MVP | HTML |
| FR-BULK-006 | Fix and re-upload path. | MVP | HTML |

### 10.7 Customer Portal (CUS)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-CUS-001 | Customer dashboard with profile, stats (saves, inquiries, requirements %). | MVP | HTML dashboard |
| FR-CUS-002 | Saved properties grid with remove. | MVP | HTML / PROP-005 |
| FR-CUS-003 | Requirement profile editor (budget, type, bedrooms, location). | MVP | HTML / FR7.2 |
| FR-CUS-004 | Inquiry history/status. | MVP | HTML / FR7.3 |
| FR-CUS-005 | Notifications bell with unread indicator. | MVP | HTML / ADM-004 |
| FR-CUS-006 | Quick actions: New search, Edit profile, Saved searches. | MVP | HTML |
| FR-CUS-007 | Recent activity/inquiry timeline on dashboard. | FUTURE / EXCLUDED-MVP* | HTML; Constitution excludes Activity timeline–implement inquiry list without shipping excluded timeline product |

\* MVP must still satisfy FR7.3 inquiry history; rich activity timeline system is Future.

### 10.8 CRM / Leads (CRM)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-CRM-001 | Lead capture form on property/public surfaces. | MVP | CRM-001 |
| FR-CRM-002 | Lead list view for Agent/Admin. | MVP | CRM-002 |
| FR-CRM-003 | Add lead modal/flow. | MVP | Requirements `AddLeadModal` |
| FR-CRM-004 | Lead detail: name, stage badge, source, score/temperature. | MVP | HTML lead detail |
| FR-CRM-005 | Lead detail contact panel (phone, email, preferred time). | MVP | HTML |
| FR-CRM-006 | Property interests / inquiry history on lead. | MVP | HTML |
| FR-CRM-007 | Notes (timestamped). | MVP | HTML / FR10.4 subset |
| FR-CRM-008 | Change stage action. | MVP | HTML + basic workflow |
| FR-CRM-009 | Schedule visit action. | MVP | HTML + ScheduleVisitModal |
| FR-CRM-010 | Call/email action buttons as presented in HTML (mailto/tel or equivalent UX). | MVP | HTML |
| FR-CRM-011 | Communication timeline / call logs product. | FUTURE / EXCLUDED-MVP | HTML; Activity timeline excluded |
| FR-CRM-012 | Follow-up tasks / reminder system. | FUTURE / EXCLUDED-MVP | HTML; Reminder excluded |
| FR-CRM-013 | Convert to opportunity. | FUTURE | HTML |
| FR-CRM-014 | Kanban pipeline with WIP limits, drag-drop, bulk ops. | FUTURE / EXCLUDED-MVP | HTML kanban |
| FR-CRM-015 | Contact management module beyond lead fields. | FUTURE | CRM-004 incomplete in Requirements |

### 10.9 Admin Analytics & Command Center (ADM)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-ADM-001 | KPI cards: active listings, active leads, conversion rate, today–s sessions (+ trends). | MVP | HTML command center / ADM-013 |
| FR-ADM-002 | Lead source funnel chart. | MVP | HTML / FR8.2 |
| FR-ADM-003 | Property views over time chart. | MVP | HTML / FR8.3 |
| FR-ADM-004 | Lead stage distribution chart. | MVP | HTML |
| FR-ADM-005 | Recent activity feed with filters. | MVP | HTML / FR8.4 |
| FR-ADM-006 | Date range picker affecting charts/feed. | MVP | HTML |
| FR-ADM-007 | Reports view (AdminReportsView). | MVP | Requirements |
| FR-ADM-008 | Tasks view. | FUTURE | Requirements Analytics/Tasks listed; not MVP matrix |

Note: Command-center feed is part of designed admin dashboard (FR8.4), distinct from excluded CRM activity-timeline product.

### 10.10 AI Chat & Configuration (AI)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-AI-001 | Conversational AI chatbot (Gemini). | MVP | AI-002 |
| FR-AI-002 | Chat welcome/greeting from configuration. | MVP | HTML AI config / FR13 |
| FR-AI-003 | FAQ library management. | MVP | HTML |
| FR-AI-004 | Escalation rules to human agent + working hours fields as in HTML. | MVP | HTML |
| FR-AI-005 | Response tone / prompt parameters (Gemini). | MVP | HTML + Constitution |
| FR-AI-006 | Preview chat for configuration testing. | MVP | HTML |
| FR-AI-007 | Loan analysis (Gemini + formula fallback as in Requirements). | MVP | Requirements Phase 7 |
| FR-AI-008 | Health endpoint for AI/service liveness. | MVP | Prototype `/api/health` |

### 10.11 Notifications & CMS (PLT)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-PLT-001 | In-app notifications list/dropdown. | MVP | ADM-004 |
| FR-PLT-002 | Email notifications for key events (e.g., new lead). | MVP | Constitution channels |
| FR-PLT-003 | Admin notification rules UI. | MVP | Requirements AdminNotificationRulesView |
| FR-PLT-004 | CMS page management + public pages. | MVP | ADM-005 |
| FR-PLT-005 | SMS / WhatsApp / Push channels. | EXCLUDED-MVP | Constitution |

### 10.12 Shared UX States (UX)

| ID | Requirement | Scope | Source |
|----|-------------|-------|--------|
| FR-UX-001 | Loading skeletons/spinners per HTML. | MVP | Constitution + HTML |
| FR-UX-002 | Empty states per HTML. | MVP | HTML |
| FR-UX-003 | Error states / toasts / inline validation per HTML. | MVP | HTML |
| FR-UX-004 | Hover/active/focus states match HTML. | MVP | Constitution |
| FR-UX-005 | Responsive behavior matches HTML. | MVP | Constitution |

---

## 11. Non-Functional Requirements

### 11.1 Performance

| ID | NFR | Target |
|----|-----|--------|
| NFR-P-001 | Average page load (primary routes) | &lt; 2s |
| NFR-P-002 | List endpoints | Paginated; no unbounded payloads |
| NFR-P-003 | AI calls | Non-blocking chrome; designed loading UI; timeouts + fallback |
| NFR-P-004 | Maps | Lazy-load Leaflet on pages that need maps |

### 11.2 Availability & Reliability

| ID | NFR | Target |
|----|-----|--------|
| NFR-A-001 | Uptime | 99.5%+ |
| NFR-A-002 | AI outage behavior | Filter fallback, never blank dead-end without empty/fallback UI |
| NFR-A-003 | Health checks | Available for ops smoke |

### 11.3 Security

| ID | NFR | Target |
|----|-----|--------|
| NFR-S-001 | Auth | Email/password; hashed passwords; validated tokens |
| NFR-S-002 | AuthZ | Server-side role checks |
| NFR-S-003 | Input validation | All write endpoints validated |
| NFR-S-004 | Secrets | Gemini keys never in browser/git |
| NFR-S-005 | OWASP basics | Injection, XSS, CSRF strategy as applicable |
| NFR-S-006 | Rate limiting | Auth + AI endpoints |

### 11.4 Usability & UI Fidelity

| ID | NFR | Target |
|----|-----|--------|
| NFR-U-001 | Visual parity | Indistinguishable from HTML for in-scope screens |
| NFR-U-002 | Responsive | Mobile/tablet/desktop per HTML |
| NFR-U-003 | Accessibility baseline | Labels, keyboard focus, alt text, contrast from tokens |
| NFR-U-004 | No redesign | Constitution absolute |

### 11.5 Maintainability

| ID | NFR | Target |
|----|-----|--------|
| NFR-M-001 | Architecture | Clean Architecture; no business logic in UI |
| NFR-M-002 | Typing | Strict TypeScript |
| NFR-M-003 | API layer | Centralized client |
| NFR-M-004 | Tests | &gt;80% unit coverage on core business logic |
| NFR-M-005 | Lint | No ESLint warnings on completed screens |

### 11.6 Compatibility & Deployment

| ID | NFR | Target |
|----|-----|--------|
| NFR-C-001 | Frontend deploy | Vercel |
| NFR-C-002 | Browsers | Modern evergreen browsers |
| NFR-C-003 | Stack | Constitution �5 mandatory technologies |

---

## 12. Complete Module List

| Module ID | Module Name | Description | MVP |
|-----------|-------------|-------------|------|
| MOD-AUTH | Authentication & Session | Register, login, logout, tokens, route guards | Yes |
| MOD-USERS | Users & Roles | User admin, role assignment (role string), Super Admin controls | Yes |
| MOD-AGENTS | Agents | Agent profiles CRUD | Yes |
| MOD-HOME | Public Homepage / Marketing | Hero search, featured, social proof, contact, chat entry | Yes |
| MOD-SEARCH | Search & Discovery | NLP search, filters, result states, pagination | Yes |
| MOD-PROP-PUB | Public Property Details | Gallery, map, CTAs, similar | Yes |
| MOD-PROP-ADM | Property Inventory & Editor | CRUD, statuses, media, bulk actions | Yes |
| MOD-BULK | Bulk Upload | Validate + import valid rows | Yes |
| MOD-FAV | Favorites | Save/unsave, customer grid | Yes |
| MOD-CUS | Customer Portal | Dashboard, requirements, inquiries | Yes |
| MOD-CRM | Leads CRM | Capture, list, detail, stage, schedule visit | Yes (non-Kanban) |
| MOD-KANBAN | Lead Kanban Pipeline | Board, WIP, DnD, bulk | **No - Future** |
| MOD-AI-SEARCH | AI Search Orchestration | Gemini ranking, scores, reasons, fallback | Yes |
| MOD-AI-CHAT | AI Chat | Gemini chat + widget | Yes |
| MOD-AI-LOAN | Loan Analysis | Gemini analysis modal | Yes |
| MOD-AI-CFG | AI Configuration | Admin prompts/FAQ/escalation/preview | Yes |
| MOD-NTF | Notifications | In-app + email; admin rules UI | Yes |
| MOD-CMS | CMS | Pages + homepage content | Yes |
| MOD-RPT | Reports & Command Center | KPIs, charts, reports | Yes |
| MOD-MAP | Maps | Leaflet + OSM | Yes |
| MOD-MEDIA | Media Storage | Local dev uploads; gallery/floorplan | Yes |
| MOD-TOUR | Visit Scheduling | Schedule visit modal/actions | Yes |
| MOD-TIMELINE | Activity Timeline System | CRM timeline product | **No - Future** |
| MOD-REMIND | Reminders | Reminder system | **No - Future** |
| MOD-AUTO | Automation | Automation engine | **No - Future** |
| MOD-VT | Virtual Tours / Video Upload | Tour/video products | **No - Future** |
| MOD-SMS | SMS / WhatsApp / Push | Alternate channels | **No - Future** |
| MOD-TXN | Transactions | Offers, escrow, e-sign (roadmap) | **No - Future** |

---

## 13. Screen Inventory

UI source of truth: `docs/design_reference/<directory>/code.html` (+ screenshots). Additional product screens referenced in Requirements prototype (`LoginPage`, admin subviews) must match their designed counterparts when HTML exists; where only prototype components exist, preserve those workflows under Constitution fidelity rules.

### 13.1 Design-Reference Screens

| Screen ID | Directory | HTML Title / Intent | Primary Roles | MVP |
|-----------|-----------|---------------------|---------------|-----|
| SCR-HOME | `propvista_crm_homepage` | PropVista CRM ? AI-Powered Real Estate Intelligence | Guest+ | Yes |
| SCR-SEARCH-STD | `search_results_standard_view` | Properties \| PropVista CRM (AI matches) | Guest+ | Yes |
| SCR-SEARCH-FB | `search_results_filter_fallback_view` | PropVista CRM \| Property Search (fallback) | Guest+ | Yes |
| SCR-SEARCH-EMPTY | `search_results_empty_state` | Property Search Results ? empty | Guest+ | Yes |
| SCR-PROP-D | `property_details_premium_view` | PropVista CRM ? Property Details | Guest+ | Yes |
| SCR-CUS-DASH | `customer_account_dashboard` | Customer Dashboard | Customer | Yes |
| SCR-LEAD-KANBAN | `lead_pipeline_kanban_view` | PropVista CRM ? Lead Pipeline | Agent/Admin | **No** |
| SCR-LEAD-D | `lead_detail_sarah_jenkins` | PropVista CRM ? Lead Detail | Agent/Admin | Yes* |
| SCR-PROP-EDIT | `listing_editor_basic_info` | PropVista CRM ? Edit Property | Agent/Admin | Yes? |
| SCR-PROP-INV | `property_inventory_admin_view` | PropVista CRM ? Property Management | Agent/Admin | Yes |
| SCR-BULK | `bulk_upload_validation_results` | PropVista CRM ? Bulk Upload Results | Admin | Yes |
| SCR-AI-CFG | `ai_chatbot_configuration` | PropVista CRM ? AI Chatbot Configuration | Admin | Yes? |
| SCR-CMD | `admin_agent_command_center` | PropVista CRM \| Admin Dashboard | Admin/Agent | Yes |

\* MVP implements lead detail without shipping excluded timeline/reminder subsystems; preserve visible structure per HTML where possible without enabling excluded backends.  
? Exclude virtual tour/video upload behaviors from MVP publish path.  
? Model vendor constrained to Gemini per Constitution.

### 13.2 Requirements Prototype Screens (Must Exist in Product)

| Screen ID | Prototype Component | Purpose | MVP |
|-----------|---------------------|---------|-----|
| SCR-LOGIN | `LoginPage` | Email/password login | Yes |
| SCR-REGISTER | Register page (Next.js) | Registration | Yes |
| SCR-ADMIN-SIDE | `AdminSidebar` | Admin navigation shell | Yes |
| SCR-CLIENTS | `ClientsView` | Lead list (non-Kanban MVP) | Yes |
| SCR-ADD-LEAD | `AddLeadModal` | Create lead | Yes |
| SCR-AGENTS | `AdminAgentsView` | Agents admin | Yes |
| SCR-USERS | `AdminUsersView` | Users admin | Yes |
| SCR-CMS | `AdminCMSView` | CMS admin | Yes |
| SCR-REPORTS | `AdminReportsView` | Reports | Yes |
| SCR-NTF-RULES | `AdminNotificationRulesView` | Notification rules | Yes |
| SCR-LOAN | `AILoanAnalysisModal` | Loan analysis | Yes |
| SCR-SCHED | `ScheduleVisitModal` | Schedule visit | Yes |
| SCR-NOTIF | `NotificationsDropdown` | In-app notifications | Yes |
| SCR-TASKS | `TasksView` | Tasks | Future |
| SCR-ANALYTICS | `AnalyticsView` | Analytics (if distinct from command center) | Align to SCR-CMD / reports |

### 13.3 Shared Shell & Assets

| ID | Reference | Notes |
|----|-----------|-------|
| SCR-SHELL | `propvista_crm/DESIGN.md` + HTML shells | Tokens, typography, colors |
| AST-SEARCH-ICON | magnifying glass illustration asset | Reuse in search UI |

### 13.4 Screen State Matrix (Mandatory for MVP Screens)

For each MVP screen: **Default**, **Loading**, **Empty**, **Error**, **Hover/Active**, **Responsive**. Search additionally requires **Standard AI**, **Fallback**, **Empty**.

---

## 14. Navigation Flow

### 14.1 Public Navigation

```
[Homepage]
  +- Sign In ? [Login] ? role home
  +- Join AI Pro ? [Register] ? Customer Dashboard
  +- AI Search submit ? [Search Results]
  ->     +- Property card ? [Property Details]
  ->     +- Filters refine ? [Search Results]
  ->     +- Empty CTAs ? Homepage featured / refine
  +- Featured property ? [Property Details]
  +- Chat widget ? conversational AI (overlay)
  +- Footer links ? CMS public pages (privacy/terms/etc.)
```

### 14.2 Customer Navigation

```
[Login as Customer]
  -> [Customer Dashboard]
       +- New search ? Homepage/Search
       +- Saved property ? Property Details
       +- Edit profile / requirements
       +- Inquiry history
       +- Notifications dropdown
       +- Loan analysis (from detail/dashboard entry)
```

### 14.3 Agent / Admin Navigation (Sidebar)

Aligned to Requirements admin surfaces (labels must match designed sidebar HTML where present):

```
[Command Center]
[Properties / Inventory] ? Editor
[Leads / Clients] ? Lead Detail
[Agents]
[Users] (Admin+)
[CMS] (Admin+)
[AI Config] (Admin+)
[Notifications Rules] (Admin+)
[Reports]
```

**Not in MVP nav:** Lead Kanban route must not be shipped as a primary navigation target.

### 14.4 Auth Gates

| From | To | Gate |
|------|----|------|
| Any public | Customer Dashboard | Customer+ auth |
| Any public | Inventory/Editor | Agent+ |
| Any public | Users/CMS/AI Config | Admin+ |
| Favorite while Guest | Login/Register then resume | Auth required |

---

## 15. End-to-End User Flows

### 15.1 E2E-01 ? Guest AI Search to Inquiry

1. Open Homepage.  
2. Enter NLP query or click suggestion chip.  
3. Observe loading state.  
4. Land on Search Standard view with scores/reasons **or** Fallback banner **or** Empty state.  
5. Open a property.  
6. Review gallery, amenities, map.  
7. Click **Inquire about this property**.  
8. Submit lead capture with validation.  
9. System stores lead with source; may notify Agent/Admin (email + in-app).  

**Pass:** Lead visible in Agent/Admin lead list; UI matched HTML for each step.

### 15.2 E2E-02 ? AI Outage Fallback

1. Trigger search with Gemini unavailable/timeout (test harness).  
2. User sees fallback banner and filter results without scores.  
3. User resets/refines filters.  

**Pass:** No blank page; banner visible; filters work.

### 15.3 E2E-03 ? Customer Favorite & Dashboard

1. Register/Login as Customer.  
2. Favorite property from results or detail.  
3. Open Customer Dashboard.  
4. Confirm saved card and stats.  
5. Remove favorite.  
6. Edit requirement profile and save.  

**Pass:** Persistence after reload; HTML dashboard fidelity.

### 15.4 E2E-04 ? Agent Publish Listing

1. Login as Agent/Admin.  
2. Open Property Inventory ? New Property.  
3. Fill required fields; upload photos/floorplan.  
4. Save Draft ? appears as draft.  
5. Publish ? appears in public search/featured eligibility.  

**Pass:** Status badges correct; public visibility rules held; no video/virtual tour required.

### 15.5 E2E-05 ? Bulk Upload Validation

1. Admin uploads file.  
2. Validation results screen shows counts and errors.  
3. Download error report.  
4. Import valid rows only.  
5. Inventory reflects imported published/draft rows per rules.  

**Pass:** Matches SCR-BULK HTML; invalid rows not silently imported.

### 15.6 E2E-06 ? Lead Management (Non-Kanban)

1. Lead created from E2E-01 or Add Lead modal.  
2. Agent opens lead list (ClientsView).  
3. Opens Lead Detail.  
4. Updates stage; adds note; schedules visit.  

**Pass:** Stage persisted; schedule modal confirms; Kanban not required.

### 15.7 E2E-07 ? Admin AI Configuration

1. Admin opens AI Chatbot Configuration.  
2. Edit greeting + FAQ.  
3. Save; preview chat reflects greeting.  
4. Public chat widget uses updated greeting.  

**Pass:** No redeploy; Gemini-only; layout matches HTML.

### 15.8 E2E-08 ? Loan Analysis

1. Customer opens property detail.  
2. Launch loan analysis modal.  
3. Submit inputs; receive Gemini analysis (or formula fallback).  

**Pass:** Modal UX per design; errors handled; no alternate LLM.

### 15.9 E2E-09 ? Admin Command Center

1. Admin opens command center.  
2. KPI cards and charts render.  
3. Date range changes data.  
4. Activity feed lists recent events.  

**Pass:** Matches SCR-CMD; roles enforced.

### 15.10 E2E-10 ? CMS Public Page

1. Admin edits CMS page.  
2. Guest opens public page route.  

**Pass:** Content reflects publish state.

---

## 16. Feature Catalog

Catalog merges Requirements feature IDs with HTML-derived features. Status column reflects Requirements matrix where available.

### 16.1 Authentication

| Feature ID | Name | Description | MVP |
|------------|------|-------------|-----|
| AUTH-001 | Registration | Email/password sign-up | Yes |
| AUTH-002 | Login/Logout | JWT session | Yes |
| AUTH-005 | Role-based access | Five roles, server enforced | Yes |
| AUTH-HTML-001 | Homepage auth CTAs | Sign In / Join AI Pro | Yes |

### 16.2 Properties

| Feature ID | Name | Description | MVP |
|------------|------|-------------|-----|
| PROP-001 | Listing creation | Editor create/publish/draft | Yes |
| PROP-002 | Search with filters | Sidebar filters + query | Yes |
| PROP-003 | Property details | Premium detail view | Yes |
| PROP-005 | Favorites | Save/unsave | Yes |
| PROP-HTML-001 | Inventory admin grid | Search/filter/bulk/export | Yes |
| PROP-HTML-002 | Amenities & media | Checklist, photos, floorplan | Yes |
| PROP-HTML-003 | Similar properties | Detail carousel | Yes |
| PROP-HTML-004 | Price breakdown | Detail section | Yes |
| PROP-FUT-001 | Video/virtual tour | Excluded MVP | No |

### 16.3 AI

| Feature ID | Name | Description | MVP |
|------------|------|-------------|-----|
| AI-001 | NLP search | Gemini search | Yes |
| AI-002 | AI chatbot | Gemini chat widget | Yes |
| AI-003 | Loan analysis | Gemini + fallback | Yes |
| AI-HTML-001 | Match scores/reasons | Explainability UI | Yes |
| AI-HTML-002 | Search fallback mode | Visible filter-only | Yes |
| AI-HTML-003 | Chatbot admin config | Greeting/FAQ/escalation/preview | Yes |
| AI-HTML-004 | Suggestion chips | Homepage examples | Yes |

### 16.4 CRM

| Feature ID | Name | Description | MVP |
|------------|------|-------------|-----|
| CRM-001 | Lead capture | Forms/CTAs/chat | Yes |
| CRM-002 | Lead list | Clients list | Yes |
| CRM-003 | Lead detail | Detail workspace | Yes |
| CRM-004 | Contact management | Broader contacts module | No (Future) |
| CRM-HTML-001 | Stage change | Status workflow | Yes |
| CRM-HTML-002 | Schedule visit | Modal/action | Yes |
| CRM-HTML-003 | Kanban pipeline | Board/WIP/DnD | No |
| CRM-HTML-004 | Timeline/reminders | Excluded systems | No |

### 16.5 Customer

| Feature ID | Name | Description | MVP |
|------------|------|-------------|-----|
| CUS-HTML-001 | Customer dashboard | Stats, saves, requirements | Yes |
| CUS-HTML-002 | Requirement profile | Preferences editor | Yes |
| CUS-HTML-003 | Inquiry history | Status list | Yes |
| CUS-HTML-004 | Saved searches quick action | Per HTML | Yes |

### 16.6 Admin & Platform

| Feature ID | Name | Description | MVP |
|------------|------|-------------|-----|
| ADM-001 | User management | Admin users UI | Yes |
| ADM-004 | Notifications | In-app + email | Yes |
| ADM-005 | CMS | Pages + homepage | Yes |
| ADM-013 | System/health dashboard | Command center KPIs | Yes |
| ADM-HTML-001 | Agents management | AdminAgentsView | Yes |
| ADM-HTML-002 | Reports | AdminReportsView | Yes |
| ADM-HTML-003 | Notification rules UI | Rules screen | Yes |
| ADM-HTML-004 | Bulk upload validation | Results screen | Yes |
| ADM-HTML-005 | Command center charts/feed | FR8.x | Yes |

---

## 17. MVP Scope

### 17.1 In Scope (Must Ship)

1. Email/password auth; five roles; protected routes.  
2. Homepage per HTML (search, featured, journey, testimonials, chat).  
3. Search standard, fallback, empty per HTML.  
4. Property details premium per HTML (excluding virtual tour/video upload productization).  
5. Favorites + customer dashboard (requirements, inquiries, notifications bell).  
6. Property inventory + listing editor (draft/publish; photos/floorplan).  
7. Bulk upload validation results.  
8. Lead capture, lead list, lead detail (stage, notes, schedule visit; no Kanban).  
9. Admin command center, users, agents, CMS, reports, notification rules.  
10. AI search, AI chat, loan analysis, AI config (Gemini only).  
11. Email + in-app notifications.  
12. Leaflet maps on detail.  
13. Local media storage in development.  
14. Pixel-faithful UI verification for all MVP screens.

### 17.2 Explicitly Out of MVP (Constitution)

| Excluded Item | Handling |
|---------------|----------|
| Kanban | Do not ship SCR-LEAD-KANBAN or nav entry |
| Activity timeline (CRM product) | No timeline subsystem; inquiry history list allowed |
| Reminder system | No reminder engine/tasks product |
| Automation | No automation engine |
| Virtual Tours | No virtual tour product |
| Video Upload | No video upload pipeline |
| SMS | No SMS channel |
| WhatsApp | No WhatsApp channel |
| Push Notifications | No push channel |

### 17.3 MVP Success Journeys (Requirements)

- Agent creates property ? published.  
- Buyer searches (text + NLP) ? views details ? submits inquiry.  
- Agent views/manages leads.  
- Admin manages users, views notifications.

### 17.4 MVP Non-Goals

- Multi-tenancy  
- Module-level permissions  
- Alternate LLM providers  
- Dark/light theme productization (Requirements notes dark/light ??do not invent)  
- UI redesign or ?improvements? beyond HTML

---

## 18. Future Scope

### 18.1 From Requirements Post-MVP Roadmap

| Release | Focus |
|---------|-------|
| 1.1 | Enhanced property features (comparison, bulk ops expansion, import/export, geolocation enhancements) |
| 1.2 | AI power-ups (lead scoring, recommendations, smart descriptions, image enhancement) |
| 1.3 | CRM enhancements (scoring engine, **activity timeline**, scheduling depth, messaging, segmentation) |
| 1.4 | Marketing (email campaigns, **SMS**, social sharing, landing pages, drip) |
| 2.0 | Transactions (offers, escrow, documents, e-signature, closing) |
| 2.x | Financial management, multi-tenancy, PWA/mobile, localization |

### 18.2 From HTML / Constitution Deferred

| Item | Design Reference |
|------|------------------|
| Lead Kanban pipeline | `lead_pipeline_kanban_view` |
| Rich communication timeline / call logs | `lead_detail_sarah_jenkins` |
| Follow-up tasks / reminders | Lead detail HTML |
| Convert to opportunity | Lead detail HTML |
| Video tour URL / virtual tours | Listing editor HTML |
| WhatsApp / Push / SMS | Constitution exclusions |
| Contact management module | CRM-004 |
| TasksView analytics extras | Requirements prototype |

### 18.3 Activation Rule

Future items require Epic + Constitution amendment or dated scope appendix before implementation. HTML becomes in-scope UI SOT only after activation.

---

## 19. Success Metrics

### 19.1 Product / Business Metrics

| Metric | Definition | MVP Intent |
|--------|------------|------------|
| Search success rate | % searches returning =1 result (AI or fallback) | Monitor quality |
| AI fallback rate | % searches served via filter fallback | Should be low but UX safe |
| Inquiry conversion | Inquiries / property detail views | Primary funnel |
| Chat engagement | Sessions with =1 chat message | Secondary capture |
| Publish throughput | Listings published / week | Agent adoption |
| Lead response hygiene | Leads updated from New within SLA (org-defined later) | CRM health |
| Registration conversion | Guest searchers ? registered customers | Growth |

### 19.2 Engineering / Quality Metrics

| Metric | Target |
|--------|--------|
| Avg page load | &lt; 2s |
| Uptime | 99.5%+ |
| Unit coverage (core logic) | &gt; 80% |
| Critical vulnerabilities | 0 |
| UI verification pass rate (MVP screens) | 100% before release |
| Console/lint/type errors on Done screens | 0 |

### 19.3 Validation Evidence

- Screenshot comparisons vs `design_reference`  
- E2E-01–E2E-10 executed on staging  
- Gemini sandbox check for search/chat/loan  

---

## 20. Assumptions

1. A single organization is the only tenancy model for this product generation.  
2. `docs/design_reference` HTML/screenshots remain the UI SOT unless formally amended.  
3. Google Gemini remains available with acceptable latency/cost for MVP volumes.  
4. Seed/demo data will exist for empty-DB demos (Requirements risk mitigation).  
5. Agents have email accounts and can receive email notifications.  
6. End users use modern evergreen browsers.  
7. Map coordinates/addresses are available for listings that show maps.  
8. CMS authors will maintain homepage/public content after launch.  
9. ?Bedrock?/non-Gemini labels in older HTML are not authority to integrate other providers.  
10. Phase progress tables in Requirements describe engineering status, not alternate scope.  
11. Lead list (`ClientsView`) is the MVP pipeline UX stand-in for deferred Kanban.  
12. Local disk storage is acceptable for development media; production storage will preserve API shapes.

---

## 21. Constraints

### 21.1 Technology Constraints (Constitution)

- Frontend: Next.js 15, React 19, TypeScript, Tailwind  
- Backend: Node.js, Express.js  
- DB/ORM: PostgreSQL, Prisma  
- AI: Google Gemini only  
- Maps: Leaflet + OpenStreetMap  
- Auth: Email + password  
- Notifications MVP: Email + In-App  
- Deploy frontend: Vercel  
- Dev storage: Local  

### 21.2 Process Constraints

- Feature lifecycle cannot skip stages (Epic ? ? ? Merge).  
- Screen Completion Policy and Definition of Done are binary gates.  
- Temporary mocks must be removed before feature Done.

### 21.3 Product Constraints

- No module-level permissions.  
- No MVP delivery of Constitution exclusions (?17.2).  
- No UI redesign; HTML fidelity mandatory.  
- No inventing features beyond Requirements + HTML.

### 21.4 Compliance / Quality Constraints

- Strict TypeScript; no lint warnings on completed work.  
- Business logic not in UI components.  
- Centralized API layer required.

---

## 22. Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|----|------|--------|------------|------------|
| R-1 | AI search quality insufficient | High | Medium | Prompt engineering, admin config, filter fallback, feedback loop |
| R-2 | Scope creep before MVP | High | High | Constitution exclusions + this PRD as gate |
| R-3 | HTML fidelity under-estimated | High | Medium | Screen completion + screenshot QA gates |
| R-4 | Gemini cost/availability | Medium | Low | Monitoring, timeouts, **filter** fallback (not alternate LLM) |
| R-5 | Empty DB / poor demo data | Medium | High | Seeds, bulk upload early |
| R-6 | Confusion between Kanban HTML and MVP list | Medium | High | Explicit nav ban; Future Scope labeling |
| R-7 | Lead detail HTML implies timeline/reminders | Medium | High | Implement MVP subset; defer excluded systems |
| R-8 | User adoption resistance | Medium | Medium | Focus lead capture + agent onboarding journeys |
| R-9 | AuthZ bugs (UI-only hiding) | High | Medium | Server role tests; QA matrix |
| R-10 | Mock APIs left in codebase | Medium | Medium | Mock removal checklist in DoD |
| R-11 | Older FastAPI docs confuse implementers | Low | Medium | Constitution stack precedence stated here |
| R-12 | Bulk upload data quality issues | Medium | Medium | Validation results UX + error CSV |

---

## 23. Acceptance Criteria

### 23.1 Global Acceptance (Any MVP Feature)

- [ ] Traced to PRD feature ID + Requirements and/or HTML path  
- [ ] Not an Out-of-MVP exclusion  
- [ ] Technical Design + API contract completed before UI (unless pure visual fix)  
- [ ] Real API integrated (no leftover mocks)  
- [ ] Role checks verified for Guest/Customer/Agent/Admin/Super Admin as applicable  
- [ ] Loading, empty, error states implemented per HTML  
- [ ] No console errors; no TS errors; no ESLint warnings  
- [ ] Code reviewed; QA approved  
- [ ] For UI: HTML match + screenshot comparison + responsive check passed  

### 23.2 Module Acceptance Highlights

**Auth:** Register, login, logout, refresh, role route guards.  
**Search:** NLP success with scores/reasons; fallback banner path; empty path; filters; pagination.  
**Property Detail:** Gallery, floorplan, map, inquire/contact/schedule CTAs, favorite.  
**Inventory/Editor:** Draft/publish, validation, media photos/floorplan, inventory bulk actions.  
**Bulk:** Counts, error table, download report, import valid only.  
**Customer:** Dashboard stats, saves, requirements, inquiries, notifications bell.  
**CRM:** Capture, list, detail, stage, notes, schedule visit; **no Kanban**.  
**AI Config:** Greeting/FAQ/escalation/tone saved; preview; Gemini-only.  
**Command Center:** KPIs, charts, feed, date range.  
**Notifications:** In-app + email only.  
**CMS:** Admin edit + public render.

### 23.3 Release Acceptance

- [ ] E2E-01 through E2E-10 passed on staging  
- [ ] Performance spot-check &lt; 2s on primary routes  
- [ ] Security smoke (authz, no secret leakage)  
- [ ] Constitution MVP exclusions absent from navigation and APIs  
- [ ] Product Owner accepts UI fidelity sample set  

---

## 24. Traceability Matrix

### 24.1 Screen ? Requirements ? Features ? Modules

| Screen | FR / Feature IDs | Modules | MVP |
|--------|------------------|---------|-----|
| SCR-HOME | FR-HOME-*, AI-001/002, CRM-001 | MOD-HOME, MOD-AI-SEARCH, MOD-AI-CHAT, MOD-CRM | Yes |
| SCR-SEARCH-STD | FR-SEARCH-001–010, AI-001 | MOD-SEARCH, MOD-AI-SEARCH, MOD-FAV | Yes |
| SCR-SEARCH-FB | FR-SEARCH-011,013 | MOD-SEARCH | Yes |
| SCR-SEARCH-EMPTY | FR-SEARCH-012 | MOD-SEARCH | Yes |
| SCR-PROP-D | FR-PROP-D-*, PROP-003/005, AI-003 entry | MOD-PROP-PUB, MOD-MAP, MOD-FAV, MOD-TOUR | Yes |
| SCR-CUS-DASH | FR-CUS-*, PROP-005, ADM-004 | MOD-CUS, MOD-FAV, MOD-NTF | Yes |
| SCR-LEAD-KANBAN | FR-CRM-014 | MOD-KANBAN | **No** |
| SCR-LEAD-D | FR-CRM-004–010 | MOD-CRM, MOD-TOUR | Yes |
| SCR-PROP-EDIT | FR-PROP-M-001–006 | MOD-PROP-ADM, MOD-MEDIA | Yes |
| SCR-PROP-INV | FR-PROP-M-008–015 | MOD-PROP-ADM | Yes |
| SCR-BULK | FR-BULK-* | MOD-BULK | Yes |
| SCR-AI-CFG | FR-AI-002–006 | MOD-AI-CFG | Yes |
| SCR-CMD | FR-ADM-001–006, ADM-013 | MOD-RPT | Yes |
| SCR-LOGIN/REGISTER | FR-AUTH-* | MOD-AUTH | Yes |
| SCR-CLIENTS | CRM-002 | MOD-CRM | Yes |
| SCR-USERS/AGENTS | ADM-001, agents | MOD-USERS, MOD-AGENTS | Yes |
| SCR-CMS | ADM-005 | MOD-CMS | Yes |
| SCR-REPORTS | FR-ADM-007 | MOD-RPT | Yes |
| SCR-NTF-RULES | ADM-004 | MOD-NTF | Yes |
| SCR-LOAN | FR-AI-007 | MOD-AI-LOAN | Yes |
| SCR-SCHED | FR-CRM-009 | MOD-TOUR | Yes |

### 24.2 Design-Details FR Groups ? PRD

| Design FR Group | PRD Coverage |
|-----------------|--------------|
| FR1.x Chatbot | FR-AI-001–006, FR-HOME-005 |
| FR2.x Search | FR-SEARCH-* |
| FR5.x Property details | FR-PROP-D-* |
| FR6.x Lead creation | FR-CRM-001, BR-LEAD-* |
| FR7.x Customer | FR-CUS-* |
| FR8.x Admin metrics | FR-ADM-* |
| FR9.x Property mgmt/bulk | FR-PROP-M-*, FR-BULK-* |
| FR10.x Lead pipeline | FR-CRM-*; Kanban ? Future |
| FR13.x AI behavior/config | FR-AI-*, BR-AI-* |

### 24.3 Constitution Exclusions ? PRD Mapping

| Exclusion | PRD Location |
|-----------|--------------|
| Kanban | ?12 MOD-KANBAN; ?17.2; SCR-LEAD-KANBAN MVP=No |
| Activity timeline | FR-CRM-011; FR-CUS-007 note; ?18 |
| Reminder system | FR-CRM-012; ?18 |
| Automation | ?12 MOD-AUTO; ?18 |
| Virtual Tours / Video Upload | FR-PROP-M-007; ?17.2 |
| SMS / WhatsApp / Push | FR-PLT-005; ?17.2 |

### 24.4 E2E ? Acceptance

| E2E | Primary Acceptance |
|-----|--------------------|
| E2E-01 | Search+Detail+Inquiry AC |
| E2E-02 | Fallback AC |
| E2E-03 | Customer/Favorites AC |
| E2E-04 | Publish listing AC |
| E2E-05 | Bulk AC |
| E2E-06 | Lead list/detail AC |
| E2E-07 | AI config AC |
| E2E-08 | Loan analysis AC |
| E2E-09 | Command center AC |
| E2E-10 | CMS AC |

---

## Appendix A — Glossary

| Term | Definition |
|------|------------|
| Property AI Studio | Engineering product name |
| PropVista CRM | UI brand name in design HTML |
| NLP Search | Natural language property search via Gemini |
| Fallback Mode | Filter-only results with visible AI-unavailable indicator |
| UI SOT | `docs/design_reference` HTML + screenshots |
| Functional SOT | `docs/REQUIREMENTS_AND_PROPOSAL.md` |
| Constitution | `docs/00_PROJECT_CONSTITUTION.md` |
| MVP | Minimum set defined in ?17 |
| Role-based only | AuthZ derived solely from user role |

---

## Appendix B — Document Revision History

| Version | Date | Summary |
|---------|------|---------|
| 1.0.0 | 2026-07-30 | Initial PRD compiled from Constitution, Requirements, and design_reference without inventing features |

---

## Appendix C — Compliance Checklist for Authors of Downstream Specs

When writing Epics, user stories, or Technical Designs:

1. Cite PRD feature IDs.  
2. Cite HTML paths for any UI.  
3. Mark MVP vs Future explicitly.  
4. Do not reintroduce Constitution exclusions.  
5. Do not change visual design.  
6. Preserve workflows in ?8, ?14, ?15.

---

## Appendix D -- Detailed Screen Element Inventory (from HTML / design-details)

This appendix enumerates UI elements present in design references. Implementers must preserve these elements for MVP screens. Items marked FUTURE are cataloged because they appear in HTML but are Constitution-excluded from MVP.

### D.1 Homepage (`propvista_crm_homepage`)

| Element | Behavior | MVP |
|---------|----------|-----|
| Top nav branding | PropVista CRM identity | Yes |
| Sign In button | Navigates to login | Yes |
| Join AI Pro button | Navigates to registration | Yes |
| Display headline | Find your next home with Intelligence | Yes |
| NLP search input | Placeholder example natural-language query | Yes |
| Search submit / AI affordance | Submits NLP search | Yes |
| Suggestion chips | Pet-friendly in Indiranagar; Villas with garden; Modern lofts downtown | Yes |
| Curated matches section | Featured property cards | Yes |
| Property card: image, price, beds/baths, location | Card content | Yes |
| Save/favorite control on cards | Heart/save | Yes |
| View all curated CTA | Navigate to browse/search | Yes |
| Journey section | Search -> match -> connect steps | Yes |
| Testimonials | Quotes with photos | Yes |
| Chat launcher FAB | Opens chat panel | Yes |
| Chat panel close | Toggles closed | Yes |
| Chat message input + send | Sends to AI chat API | Yes |
| Footer legal/resource/company links | CMS/public pages | Yes |
| Contact / lead capture fields (when present in HTML/design-details) | Creates lead | Yes |

### D.2 Search Standard (`search_results_standard_view`)

| Element | Behavior | MVP |
|---------|----------|-----|
| Persistent search field | Refine query | Yes |
| Header utilities (notifications/profile affordances as shown) | Per HTML | Yes |
| Filters: Price Range | Filter results | Yes |
| Filters: Property Type checkboxes | Filter results | Yes |
| Filters: Bedrooms (1+/3+/5+) | Filter results | Yes |
| Filters: Amenities | Filter results | Yes |
| Clear all filters | Resets filters | Yes |
| Results heading (location context) | Reflects query/location | Yes |
| Grid/List view toggles | Layout switch | Yes |
| Property cards with match % | AI explainability | Yes |
| Match reasons check/cross indicators | AI explainability | Yes |
| Favorite on cards | Save | Yes |
| Pagination controls | Page through results | Yes |

### D.3 Search Fallback (`search_results_filter_fallback_view`)

| Element | Behavior | MVP |
|---------|----------|-----|
| Visible AI fallback banner | States filter-only mode | Yes |
| Filters sidebar (type, price min/max, beds, amenities) | Filter-only path | Yes |
| Clear all / Reset Search | Recovery actions | Yes |
| Results without match scores | No AI chrome | Yes |
| Mobile chat FAB if present | Chat entry | Yes |

### D.4 Search Empty (`search_results_empty_state`)

| Element | Behavior | MVP |
|---------|----------|-----|
| Empty illustration/message | No properties match your filters | Yes |
| Guidance CTAs | Refine / browse alternatives | Yes |
| Suggestion chips (locations/price/recent) | Quick refine | Yes |
| Filters remain available | User can adjust | Yes |
| Reset all | Clears filters | Yes |

### D.5 Property Details (`property_details_premium_view`)

| Element | Behavior | MVP |
|---------|----------|-----|
| Image gallery/carousel | Media browse | Yes |
| Title, price, beds/baths/area badges | Specs | Yes |
| Favorite/save | Persist favorite | Yes |
| Inquire CTA | Lead capture | Yes |
| Contact agent / Schedule tour CTAs | Contact or schedule | Yes |
| Overview / Details / Floorplan / Map / Amenities / Price breakdown | Sections/tabs | Yes |
| Nearby/neighborhood map (Leaflet+OSM) | Location | Yes |
| Agent card | Contact info | Yes |
| Similar properties carousel | Discovery | Yes |

### D.6 Customer Dashboard (`customer_account_dashboard`)

| Element | Behavior | MVP |
|---------|----------|-----|
| Profile (name, avatar, role badge) | Identity | Yes |
| Stats: saved count, active inquiries, requirements % | KPIs | Yes |
| Saved properties grid + remove | Favorites mgmt | Yes |
| Requirement profile editor | Budget/type/beds/location | Yes |
| Inquiry history/status | CRM feedback | Yes |
| Notifications bell | In-app | Yes |
| Quick actions: New search, Edit profile, Saved searches | Navigation | Yes |
| Rich activity timeline product | Timeline system | FUTURE (excluded) |

### D.7 Lead Detail (`lead_detail_sarah_jenkins`)

| Element | Behavior | MVP |
|---------|----------|-----|
| Name, stage badge, source, score/temperature | Header | Yes |
| Phone, email, preferred contact time | Contact panel | Yes |
| Property interests | Linked listings | Yes |
| Notes | Timestamped notes | Yes |
| Change stage | Workflow | Yes |
| Schedule visit | Scheduling | Yes |
| Call / Send email actions | tel/mailto UX | Yes |
| Communication timeline / call logs | Timeline product | FUTURE |
| Follow-up tasks / reminders | Reminder product | FUTURE |
| Convert to opportunity | Advanced CRM | FUTURE |

### D.8 Lead Kanban (`lead_pipeline_kanban_view`) -- FUTURE ONLY

| Element | Notes |
|---------|-------|
| Columns New -> Contacted -> Site Visit -> Negotiation -> Closed Won/Lost | Out of MVP |
| WIP limits, DnD, bulk actions, filters | Out of MVP |

### D.9 Listing Editor (`listing_editor_basic_info`)

| Element | Behavior | MVP |
|---------|----------|-----|
| Title, price, type, beds, baths, area, year built | Core fields | Yes |
| Location pin + address | Geo | Yes |
| Amenities checklist + custom | Amenities | Yes |
| Description + highlights | Content | Yes |
| Photo upload, floorplan upload | Media | Yes |
| Save as Draft / Publish / Cancel | Lifecycle | Yes |
| Inline validation + toasts | UX | Yes |
| Video tour URL / virtual tour | Media extras | FUTURE |

### D.10 Property Inventory (`property_inventory_admin_view`)

| Element | Behavior | MVP |
|---------|----------|-----|
| Search by title/ID/address | Find | Yes |
| Filters: status, type, price, date | Filter | Yes |
| Column customization | Personalize grid | Yes |
| Export CSV | Export | Yes |
| New Property | Opens editor | Yes |
| Grid columns incl. thumbnail, status, views/saves | Inventory | Yes |
| Row actions: edit, duplicate, archive, delete | Ops | Yes |
| Bulk toolbar | Multi-select ops | Yes |
| Pagination + empty state | States | Yes |

### D.11 Bulk Upload Results (`bulk_upload_validation_results`)

| Element | Behavior | MVP |
|---------|----------|-----|
| Summary counts | Totals | Yes |
| Tabs: Summary/Errors/Warnings/Valid | Navigate results | Yes |
| Error table details | Remediation | Yes |
| Download error report | CSV | Yes |
| Import valid rows only | Partial import | Yes |
| Fix and re-upload / Cancel | Flow control | Yes |

### D.12 AI Chatbot Configuration (`ai_chatbot_configuration`)

| Element | Behavior | MVP |
|---------|----------|-----|
| Greeting editor + preview | Config | Yes |
| FAQ library CRUD | Config | Yes |
| Escalation rules + working hours | Config | Yes |
| Tone / parameters | Config | Yes |
| Model selection UI | Gemini-only options | Yes |
| Preview chat window | Test | Yes |
| Save/Cancel + last saved | Persistence | Yes |

### D.13 Admin Command Center (`admin_agent_command_center`)

| Element | Behavior | MVP |
|---------|----------|-----|
| KPI cards (listings, leads, conversion, sessions) | Metrics | Yes |
| Lead source funnel chart | Analytics | Yes |
| Property views over time | Analytics | Yes |
| Lead stage distribution | Analytics | Yes |
| Activity feed + type filter | Ops visibility | Yes |
| Date range + refresh | Controls | Yes |

---

## Appendix E -- Domain Data Entities (from Requirements schema + HTML fields)

| Entity | Key Fields / Relations | Used By |
|--------|------------------------|---------|
| User | email, password_hash, role, is_active, soft delete | Auth, Users |
| Agent | name, email, phone, profile image | Agents, Property, Detail card |
| Property | title, price, address, beds, baths, sqft, type, status, agent FK | Search, Detail, Inventory, Editor |
| PropertyAmenity | amenity linked to property | Editor, Detail |
| NearbyLandmark | landmark linked to property | Detail map/neighborhood |
| PropertyImage | images / floorplan media | Gallery, Editor |
| Favorite | user-property save | Customer, cards |
| Lead | contact fields, source, stage, score, property interest | CRM |
| LeadNote | timestamped notes | Lead detail MVP |
| Notification | in-app notification records | Bell, rules |
| NotificationRule | admin-configured rules | Admin rules UI |
| CMS Page | pages + homepage content | CMS, Homepage |
| AI Config | greeting, FAQs, escalation, tone/prompts | AI Config, Chat |
| Visit/Appointment | schedule visit request | Schedule modal |
| Metrics Snapshot | dashboard KPIs/series | Command center |

Excluded as MVP entities/systems: Kanban WIP store, Reminder jobs, Automation rules engine, Video asset pipeline, Push device tokens, SMS provider accounts.

---

## Appendix F -- API Capability Catalog (Requirements + design-details)

Capabilities the product must expose (paths illustrative; final paths in API spec):

### F.1 Auth
- Register, login (token), refresh, logout/session invalidate
- Current user profile

### F.2 Properties
- CRUD properties; list with filter/sort/pagination
- Featured properties
- Amenities, landmarks, images sub-resources
- Publish/draft/archive transitions
- Bulk import validate + commit valid rows
- Export CSV (inventory)

### F.3 Search / AI
- POST AI search (Gemini) returning matches, scores, reasons, or fallback flag
- Search suggest
- POST AI chat
- POST loan analysis
- Health

### F.4 Favorites
- List/add/remove favorites for Customer

### F.5 Leads
- Create lead (idempotency key support per design-details)
- List/filter leads
- Get lead detail
- Update lead / stage
- Add note
- Schedule visit

### F.6 Admin / Platform
- Users admin CRUD/deactivate
- Agents CRUD
- Notifications list + mark read
- Notification rules CRUD
- CMS pages CRUD + public get + homepage get
- Metrics dashboard
- AI configuration get/update

---

## Appendix G -- Prioritized Backlog Mapping (MoSCoW for MVP)

### Must Have
- AUTH-001, AUTH-002, AUTH-005
- PROP-001, PROP-002, PROP-003, PROP-005
- AI-001, AI-002, AI-003 + explainability + fallback UIs
- CRM-001, CRM-002, lead detail core, schedule visit
- ADM-001, ADM-004, ADM-005, ADM-013
- Homepage, inventory, editor, bulk validation, AI config, command center
- Customer dashboard essentials

### Should Have
- Column customization, CSV export, duplicate listing
- Chat escalation configuration
- Similar properties carousel
- Requirement profile completion %

### Could Have (still MVP if HTML requires for fidelity)
- Testimonials section content via CMS
- Saved searches quick action wiring
- Lead score display if API provides

### Will Not Have (MVP)
- Kanban, activity timeline system, reminders, automation
- Virtual tours, video upload
- SMS, WhatsApp, push
- Contact management module (CRM-004)
- Multi-tenancy, alternate LLMs

---

## Appendix H -- Role-Based Acceptance Suites

### H.1 Guest Suite
1. View homepage and run NLP search without auth.
2. See standard or fallback or empty states correctly.
3. Open property details and submit inquiry.
4. Open chat and send a message.
5. Navigate to Sign In / Join AI Pro.
6. Cannot access customer dashboard or admin routes.

### H.2 Customer Suite
1. Register/login.
2. Favorite/unfavorite; see dashboard stats.
3. Edit requirement profile.
4. View inquiry history.
5. Receive in-app notification when applicable.
6. Run loan analysis from property context.
7. Cannot access admin user management.

### H.3 Agent Suite
1. Login; open inventory limited to allowed listings.
2. Create draft and publish listing.
3. View assigned leads list and detail; change stage; add note; schedule visit.
4. Cannot manage org users (Admin-only) unless role elevated.

### H.4 Admin Suite
1. Command center KPIs load.
2. Manage users and agents.
3. Configure AI chatbot; verify public greeting update.
4. Edit CMS page; verify public render.
5. Run bulk upload validation and import valid rows.
6. Configure notification rules; observe in-app/email path for new lead.

### H.5 Super Admin Suite
1. All Admin capabilities.
2. Access all data / system config / audit surfaces specified for Super Admin.

---

## Appendix I -- UI Verification Traceability (Constitution Alignment)

Each MVP screen must attach evidence:

| Screen ID | HTML Path | Screenshot Path | Reviewer Sign-off |
|-----------|-----------|-----------------|-------------------|
| SCR-HOME | design_reference/propvista_crm_homepage/code.html | companion screenshot | |
| SCR-SEARCH-STD | design_reference/search_results_standard_view/code.html | companion screenshot | |
| SCR-SEARCH-FB | design_reference/search_results_filter_fallback_view/code.html | companion screenshot | |
| SCR-SEARCH-EMPTY | design_reference/search_results_empty_state/code.html | companion screenshot | |
| SCR-PROP-D | design_reference/property_details_premium_view/code.html | companion screenshot | |
| SCR-CUS-DASH | design_reference/customer_account_dashboard/code.html | companion screenshot | |
| SCR-LEAD-D | design_reference/lead_detail_sarah_jenkins/code.html | companion screenshot | |
| SCR-PROP-EDIT | design_reference/listing_editor_basic_info/code.html | companion screenshot | |
| SCR-PROP-INV | design_reference/property_inventory_admin_view/code.html | companion screenshot | |
| SCR-BULK | design_reference/bulk_upload_validation_results/code.html | companion screenshot | |
| SCR-AI-CFG | design_reference/ai_chatbot_configuration/code.html | companion screenshot | |
| SCR-CMD | design_reference/admin_agent_command_center/code.html | companion screenshot | |

SCR-LEAD-KANBAN is explicitly excluded from MVP verification packs.

---

## Appendix J -- Workflow Preservation Index

| Workflow | Defined In | Must Preserve |
|----------|------------|---------------|
| Guest search to inquiry | PRD 8.1, E2E-01 | Yes |
| AI fallback | PRD 8.5, E2E-02 | Yes |
| Customer favorites/dashboard | PRD 8.2, E2E-03 | Yes |
| Publish listing | PRD 8.3, E2E-04 | Yes |
| Bulk validate/import | E2E-05 | Yes |
| Lead list/detail ops | E2E-06 | Yes |
| AI config hot-update | E2E-07 | Yes |
| Loan analysis | E2E-08 | Yes |
| Admin KPIs | E2E-09 | Yes |
| CMS public page | E2E-10 | Yes |
| Kanban DnD pipeline | HTML only / Future | Not in MVP |

---

## Appendix K -- Non-Functional Detail Breakdown

### K.1 Performance Budgets (guidance)
- Homepage LCP optimized without changing designed imagery crops
- Search results first paint shows skeleton matching HTML loading treatment
- AI search request timeout triggers fallback path before user dead-ends
- Admin grids server-paginate

### K.2 Security Detail
- bcrypt/argon2 password hashing
- Role checks on every mutating admin/CRM endpoint
- Gemini key server-only
- Upload MIME/size validation
- Rate limits on /auth and /ai

### K.3 Accessibility Detail
- Form labels associated
- Icon buttons named
- Focus visible consistent with design
- Charts have text alternatives or summaries where feasible without visual redesign

### K.4 Reliability Detail
- Idempotent lead create when Idempotency-Key provided
- Soft delete users not authenticatable
- Health endpoint for uptime monitors

---

## Appendix L -- Open Product Decisions Already Resolved by Sources

| Topic | Decision | Source |
|-------|----------|--------|
| LLM vendor | Gemini only | Constitution |
| Kanban in MVP | No | Constitution |
| Notification channels MVP | Email + In-App | Constitution |
| UI conflicts | HTML wins | Constitution |
| HTML-only behaviors | Include unless excluded | Constitution |
| Maps | Leaflet + OSM | Constitution |
| Auth | Email + password | Constitution |
| Tenancy | Single org | Constitution |
| Permission model | Roles only | Constitution |
| Stack | Next15/React19/TS/Tailwind/Express/Prisma/Postgres | Constitution |

---

## Appendix M -- Sample User Stories (Traceable, Non-Invented)

Stories paraphrase catalog/Requirements/HTML purposes only.

1. **US-HOMEPAGE-001** -- As a visitor, I view homepage to understand service, AI-search, and express interest.
2. **US-SEARCH-001** -- As a visitor, I see AI-ranked results with match scores/reasons.
3. **US-SEARCH-002** -- As a visitor, I see filter-only results with fallback notice when AI unavailable.
4. **US-SEARCH-003** -- As a visitor, I get guidance when zero results.
5. **US-PROPERTY-001** -- As a visitor, I view comprehensive property details to inquire.
6. **US-PROPERTY-002** -- As admin/agent, I create/edit listings with core info.
7. **US-PROPERTY-003** -- As admin, I manage inventory with search/filter/bulk.
8. **US-BULK-001** -- As admin, I review bulk validation results before import.
9. **US-CUSTOMER-001** -- As customer, I use dashboard for saves, requirements, inquiries.
10. **US-LEAD-002** -- As agent, I open lead detail to follow up (MVP without Kanban).
11. **US-AI-SETUP-001** -- As admin, I configure chatbot without redeploy.
12. **US-ADMIN-001** -- As admin, I monitor KPIs and activity trends.

Deferred story: **US-LEAD-001** Kanban visualization -- Future only.

---

## Appendix N -- Dependency Map (Logical)

```
Auth/Users
  -> all authenticated modules
Properties + Media + Maps
  -> Search, Details, Inventory, Favorites, Featured
Gemini AI Config
  -> AI Chat, AI Search prompts
AI Search
  -> Search result states
Leads
  -> depends on Properties (interest), Auth (assignee), Notifications
Customer Dashboard
  -> Favorites, Leads/Inquiries, Notifications, Requirements profile
CMS
  -> Homepage content, public pages
Metrics
  -> Properties, Leads, Sessions events
Bulk Upload
  -> Properties validation rules
Schedule Visit
  -> Leads + Properties
Loan Analysis
  -> Property context + Gemini
```

Kanban, Reminders, Automation, Video/VT, SMS/WhatsApp/Push are non-dependencies for MVP.

---

## Appendix O -- Glossary Extensions

| Term | Meaning |
|------|---------|
| Join AI Pro | Homepage registration CTA label from HTML |
| Curated matches | Featured properties section on homepage |
| Fallback banner | Visible notice that AI is not ranking results |
| Command Center | Admin dashboard KPI screen |
| ClientsView | Requirements prototype lead list used for MVP pipeline |
| Numeric string price | Price handled/displayed without binary float presentation issues |
| Soft delete | User inactivated without hard row removal |

---

## Appendix P -- Functional Requirement Expanded Narratives

### P.1 Search Explainability Narrative
When Gemini successfully ranks properties, each card may present a percentage match score and criterion-level check/cross reasons (price, beds, location, and other criteria returned by the orchestration layer). This behavior is mandatory for the standard search HTML. When Gemini fails, the product must not invent scores; it must show the fallback HTML state.

### P.2 Lead Capture Narrative
Leads originate from homepage/contact forms, chatbot flows, and property inquire CTAs. Creation validates required contact fields, records source, and supports idempotency keys to prevent duplicates on retries. Agents see new leads in the list view and open detail for stage and notes. Email and in-app notifications may alert assignees/admins.

### P.3 Listing Lifecycle Narrative
Agents/Admins create listings as draft, attach photos/floorplan, then publish. Published listings become eligible for public search and featured modules subject to business rules. Inventory supports archive/delete/duplicate and bulk status changes. Bulk CSV/XLS upload validates before commit.

### P.4 Customer Continuity Narrative
After registration, customers consolidate favorites, requirement preferences, and inquiry statuses on the dashboard. Notifications keep them informed. Loan analysis helps evaluate affordability against a property context using Gemini with formula fallback as implemented in Requirements.

### P.5 Admin Control Narrative
Admins operate the command center for KPIs, manage users/agents, publish CMS content, tune chatbot configuration without redeploy, and maintain notification rules. Super Admins retain full-system authority including audit/config as specified.

---

## Appendix Q -- Screen-to-E2E Crosswalk

| Screen | E2E Coverage |
|--------|--------------|
| SCR-HOME | E2E-01, E2E-07 (chat greeting) |
| SCR-SEARCH-* | E2E-01, E2E-02 |
| SCR-PROP-D | E2E-01, E2E-03, E2E-08 |
| SCR-CUS-DASH | E2E-03 |
| SCR-PROP-INV / EDIT | E2E-04 |
| SCR-BULK | E2E-05 |
| SCR-CLIENTS / LEAD-D / SCHED | E2E-06 |
| SCR-AI-CFG | E2E-07 |
| SCR-CMD | E2E-09 |
| SCR-CMS | E2E-10 |

---

## Appendix R -- Quality Gates Referenced from Constitution

For every MVP feature exit:

1. Definition of Ready satisfied.
2. Lifecycle stages completed in order.
3. Real API integration (mocks removed).
4. UI verification checklist passed for touched screens.
5. QA checklist passed.
6. Code review checklist passed.
7. Definition of Done binary pass.

---



---

## Appendix S -- Requirements Phase Alignment (Informational)

Requirements document tracks engineering phases. This PRD does not redefine those statuses; it defines product scope independent of implementation completeness.

| Requirements Theme | PRD Modules |
|--------------------|-------------|
| Phase 2 Auth | MOD-AUTH, MOD-USERS |
| Phase 3-5 Properties APIs | MOD-PROP-PUB, MOD-PROP-ADM, MOD-MEDIA, MOD-MAP |
| Phase 6 Frontend migration | All MVP screens fidelity |
| Phase 7 AI | MOD-AI-SEARCH, MOD-AI-CHAT, MOD-AI-LOAN, MOD-AI-CFG |
| Phase 8 CRM | MOD-CRM, MOD-TOUR |
| Phase 9 Admin platform | MOD-RPT, MOD-CMS, MOD-NTF, MOD-AGENTS |
| Phase 10 QA/Deploy | NFR + Acceptance + Constitution gates |

Status markers in Requirements are progress indicators, not alternate scope statements.

---

## Appendix T -- Content and Copy Anchors from HTML (Non-Exhaustive)

These strings appear in design HTML and should not be casually rewritten:

- Homepage headline concept: Find your next home with Intelligence
- Search placeholder pattern: natural language example query
- Suggestion chips: Pet-friendly in Indiranagar; Villas with garden; Modern lofts downtown
- Curated matches heading
- Journey section heading: Your journey to a better home
- Testimonials heading: Trusted by thousands of owners
- Empty state: No properties match your filters
- Auth CTAs: Sign In; Join AI Pro
- Property inquire CTA: Inquire about this property
- Listing actions: Save as Draft; Publish Listing
- Bulk actions: Import valid rows only; Download error report

Exact typography and spacing remain governed by HTML, not this appendix.

---

## Appendix U -- Risk-to-Requirement Linkage

| Risk ID | Linked Controls |
|---------|-----------------|
| R-1 AI quality | BR-AI-*, FR-SEARCH-011, admin AI config |
| R-2 Scope creep | Section 17 exclusions, Appendix G Will Not Have |
| R-3 Fidelity | Sections 13, 23, Appendix I |
| R-4 Gemini availability | Fallback flows E2E-02, BR-AI-4 |
| R-5 Empty DB | Seeds + FR-BULK |
| R-6 Kanban confusion | SCR-LEAD-KANBAN MVP=No, nav ban |
| R-7 Timeline/reminders bleed | FR-CRM-011/012 Future |
| R-9 AuthZ | Section 7, Appendix H |
| R-10 Mocks | Section 23 + Constitution mock policy |

---

## Appendix V -- Document How-to for AI Assistants

Before implementing any story:

1. Open this PRD section for the feature.
2. Open Constitution for process/stack/exclusions.
3. Open the exact `design_reference/.../code.html`.
4. Confirm MVP tag is Yes.
5. Implement API before or with mocks per lifecycle, then remove mocks.
6. Verify against Appendix D elements and Appendix I evidence table.
7. Do not invent fields, routes, or visual variants.

Invalid requests include redesign, alternate LLM, or enabling excluded MVP items without formal amendment.

---

## Appendix W -- Acceptance Criteria by Epic Theme

### W.1 Discovery Epic
- Homepage matches HTML including chat widget and curated cards.
- Search supports standard, fallback, and empty states.
- Filters and pagination behave as designed.

### W.2 Property Epic
- Detail page exposes gallery, floorplan, map, CTAs, agent card, similar listings.
- Inventory and editor support draft/publish and required validations.
- Bulk validation blocks invalid rows and imports valid rows only.

### W.3 Customer Epic
- Favorites persist.
- Dashboard shows saves, requirements, inquiries, notifications bell.
- Loan analysis returns Gemini result or formula fallback.

### W.4 CRM Epic
- Lead capture creates sourced leads.
- List and detail support stage and notes.
- Schedule visit path works.
- Kanban absent from MVP navigation.

### W.5 Admin Epic
- Command center KPIs/charts/feed load.
- Users/agents/CMS/AI config/notification rules operable.
- Channels limited to email + in-app.





---

## Appendix X -- Detailed Business Rule Scenarios

### X.1 Published Listing Visibility
Given a listing in draft status, when a Guest runs search, then the listing does not appear in public results. When an Agent publishes the listing, then it becomes eligible for search and featured surfaces subject to featured selection rules.

### X.2 Favorite Auth Gate
Given a Guest on search results, when the Guest activates favorite, then the product requires authentication (login/register) before persisting the favorite, then returns the user to the property context where feasible.

### X.3 AI Search Timeout
Given Gemini exceeds timeout, when search completes via filter path, then the fallback banner is visible, match scores are absent, and filters remain interactive.

### X.4 Lead Idempotency
Given a client retries lead create with the same Idempotency-Key, when the server receives the duplicate request, then it returns the original lead resource without creating a second lead.

### X.5 Role Denial
Given a Customer token, when calling Admin user-management endpoints, then the API responds 403 and the UI does not expose Admin sidebar entries.

### X.6 AI Config Propagation
Given an Admin updates chatbot greeting and saves, when a Guest opens the chat widget, then the new greeting is shown without requiring a frontend redeploy.

### X.7 Bulk Partial Import
Given an upload with mixed valid and invalid rows, when Admin chooses Import valid rows only, then only valid rows are persisted and invalid rows remain reportable via error CSV.

### X.8 Notification Channels
Given a new lead event with rules enabled, when notifications dispatch, then only email and in-app channels are used in MVP (no SMS/WhatsApp/push).

### X.9 Map Rendering
Given a property with coordinates/address, when detail map section renders, then Leaflet with OpenStreetMap tiles is used.

### X.10 Loan Analysis Fallback
Given Gemini loan analysis fails, when formula fallback is available as implemented, then the modal still returns a user-safe analysis result or error state matching designed UX without calling a non-Gemini LLM.

---

## Appendix Y -- Screen Completion Criteria Mapping

| Screen | Pixel HTML | Screenshot | Responsive | Interactions | Validation | Loading | Empty | Error | API | Lint/TS/Console | Review/QA |
|--------|------------|------------|------------|--------------|------------|---------|-------|-------|-----|-----------------|-----------|
| SCR-HOME | Required | Required | Required | Required | As applicable | Required | As applicable | Required | Required | Required | Required |
| SCR-SEARCH-STD | Required | Required | Required | Required | Filters | Required | N/A (other screen) | Required | Required | Required | Required |
| SCR-SEARCH-FB | Required | Required | Required | Required | Filters | Required | N/A | Required | Required | Required | Required |
| SCR-SEARCH-EMPTY | Required | Required | Required | Required | Filters | Required | Required | Required | Required | Required | Required |
| SCR-PROP-D | Required | Required | Required | Required | Inquiry form | Required | As applicable | Required | Required | Required | Required |
| SCR-CUS-DASH | Required | Required | Required | Required | Profile forms | Required | Required | Required | Required | Required | Required |
| SCR-LEAD-D | Required | Required | Required | Required | Notes/stage | Required | As applicable | Required | Required | Required | Required |
| SCR-PROP-EDIT | Required | Required | Required | Required | Required fields | Required | N/A | Required | Required | Required | Required |
| SCR-PROP-INV | Required | Required | Required | Required | Filters | Required | Required | Required | Required | Required | Required |
| SCR-BULK | Required | Required | Required | Required | Row validation | Required | As applicable | Required | Required | Required | Required |
| SCR-AI-CFG | Required | Required | Required | Required | Config forms | Required | FAQ empty | Required | Required | Required | Required |
| SCR-CMD | Required | Required | Required | Required | Date range | Required | Feed empty | Required | Required | Required | Required |
| SCR-LEAD-KANBAN | Excluded from MVP pack | Excluded | Excluded | Excluded | Excluded | Excluded | Excluded | Excluded | Excluded | Excluded | Excluded |

---

## Appendix Z -- Final Scope Boundary Statement

This PRD is the product articulation of:

1. docs/00_PROJECT_CONSTITUTION.md (governance and MVP exclusions)
2. docs/REQUIREMENTS_AND_PROPOSAL.md (functional SOT)
3. docs/design_reference/** (UI SOT)

Anything not grounded in those sources is out of scope for implementation prompts.

HTML-only behaviors are included.
Constitution MVP exclusions remain excluded until formally activated.
No redesign. No alternate AI provider. No module-level permissions. Single organization only.





---

## Appendix AA -- Module Responsibility Statements

### AA.1 MOD-AUTH
Owns registration, login, logout, token refresh, password hashing verification path, and route protection contracts. Does not own profile preference editing beyond identity basics.

### AA.2 MOD-USERS / MOD-AGENTS
Owns admin management of users and agent profiles. Enforces role assignment within the five-role model only.

### AA.3 MOD-HOME / MOD-CMS
Homepage assembles CMS-driven content, featured properties, marketing sections, and entry points to search/chat/auth. CMS owns page CRUD and public rendering.

### AA.4 MOD-SEARCH / MOD-AI-SEARCH
Search UI owns filters, pagination, and state switching among standard/fallback/empty. AI Search owns Gemini orchestration, scoring/reasons payload, timeout handling, and fallback flag.

### AA.5 MOD-PROP-PUB / MOD-PROP-ADM / MOD-MEDIA / MOD-MAP
Public details consume published property aggregates including amenities, landmarks, images, agent card, and map. Admin inventory/editor own lifecycle and media uploads (photos/floorplan). Map module standardizes Leaflet+OSM.

### AA.6 MOD-FAV / MOD-CUS
Favorites persist user-property relationships. Customer portal aggregates favorites, requirements profile, inquiry history, and notification entry points.

### AA.7 MOD-CRM / MOD-TOUR
CRM owns lead capture, list, detail, stage updates, and notes. Tour module owns schedule-visit requests linked to leads/properties. Does not own Kanban, reminder engine, or automation.

### AA.8 MOD-AI-CHAT / MOD-AI-CFG / MOD-AI-LOAN
Chat widget uses configured greeting/FAQs/escalation via Gemini. Config UI persists settings. Loan analysis is a modal capability with Gemini and formula fallback.

### AA.9 MOD-NTF / MOD-RPT / MOD-BULK
Notifications are email + in-app. Reports/command center expose KPIs and charts. Bulk validates and imports property rows with explicit error reporting.

---

## Appendix AB -- Out-of-Scope Confirmation Checklist (Release Gate)

Before MVP release, confirm ALL are true:

- [ ] No Kanban route in production navigation
- [ ] No reminder scheduler jobs enabled
- [ ] No automation rules engine enabled
- [ ] No virtual tour player/product enabled
- [ ] No video upload pipeline enabled
- [ ] No SMS provider integration
- [ ] No WhatsApp provider integration
- [ ] No push notification service integration
- [ ] No non-Gemini LLM calls in AI modules
- [ ] No module-level permission tables required for authz decisions
- [ ] No multi-tenant org switcher

Any unchecked item blocks release or requires Constitution amendment.

---

## Appendix AC -- Traceability Quick Index (Feature ID -> Screen)

| Feature ID | Primary Screens |
|------------|-----------------|
| AUTH-001/002/005 | SCR-LOGIN, SCR-REGISTER, shells |
| PROP-001 | SCR-PROP-EDIT, SCR-PROP-INV |
| PROP-002 | SCR-SEARCH-*, SCR-HOME |
| PROP-003 | SCR-PROP-D |
| PROP-005 | SCR-SEARCH-*, SCR-PROP-D, SCR-CUS-DASH |
| AI-001 | SCR-HOME, SCR-SEARCH-* |
| AI-002 | SCR-HOME chat, SCR-AI-CFG |
| AI-003 | SCR-LOAN, SCR-PROP-D |
| CRM-001/002 | SCR-PROP-D, SCR-HOME, SCR-CLIENTS, SCR-LEAD-D |
| ADM-001/004/005/013 | SCR-USERS, SCR-NOTIF, SCR-CMS, SCR-CMD |
| BULK | SCR-BULK |
| AI Config HTML | SCR-AI-CFG |
| Inventory HTML | SCR-PROP-INV |



**PRD Volume Note:** Appendices D-AC expand screen-level, data, API, MoSCoW, role suites, verification, workflow, NFR, decisions, stories, dependencies, and narratives strictly from Constitution, Requirements, and design_reference -- no invented product features.

---

**End of Product Requirements Document (including appendices)**

*This PRD is binding for product scope. Engineering execution must also comply with `docs/00_PROJECT_CONSTITUTION.md`. UI implementation must comply with `docs/design_reference`.*
