# PropVista CRM / Property AI Studio — UI Implementation Guide

| Field | Value |
|-------|--------|
| **Document** | UI Implementation Guide (Developer Checklist) |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **UI SOT** | `docs/design_reference/**` (HTML always wins) |
| **Related** | Constitution, PRD, SRS, OpenAPI, Architecture |

## 1. Purpose

This guide is the **mandatory implementation checklist** for every screen in `design_reference`. Developers and AI assistants must complete each section before marking a screen Done (Constitution Screen Completion Policy).

## 2. Global Rules

1. Open `code.html` before coding; keep `screen.png` open for comparison.
2. No redesign, no visual "improvements," no creative interpretation.
3. Tailwind tokens from `docs/design_reference/propvista_crm/DESIGN.md`.
4. Business logic stays out of UI; use feature hooks + centralized API client.
5. Search uses one route with **state variants** (standard / fallback / empty) matching three HTML references.
6. **Kanban** screen is documented but **Out of MVP** — do not ship in MVP navigation.
7. Lead detail: implement MVP subset (contact, stage, notes, schedule); timeline/reminders are Future — preserve layout fidelity without shipping excluded backends where Constitution forbids.

## 3. Screen Inventory (Complete — none skipped)

| # | ID | Directory | HTML | Screenshot | MVP |
|---|----|-----------|------|------------|-----|
| 1 | SCR-HOME | propvista_crm_homepage | yes | screen.png | Yes |
| 2 | SCR-SEARCH-STD | search_results_standard_view | yes | screen.png | Yes |
| 3 | SCR-SEARCH-FB | search_results_filter_fallback_view | yes | screen.png | Yes |
| 4 | SCR-SEARCH-EMPTY | search_results_empty_state | yes | screen.png | Yes |
| 5 | SCR-PROP-D | property_details_premium_view | yes | screen.png | Yes |
| 6 | SCR-CUS-DASH | customer_account_dashboard | yes | screen.png | Yes |
| 7 | SCR-LEAD-KANBAN | lead_pipeline_kanban_view | yes | screen.png | **No** |
| 8 | SCR-LEAD-D | lead_detail_sarah_jenkins | yes | screen.png | Yes* |
| 9 | SCR-PROP-EDIT | listing_editor_basic_info | yes | screen.png | Yes |
| 10 | SCR-PROP-INV | property_inventory_admin_view | yes | screen.png | Yes |
| 11 | SCR-BULK | bulk_upload_validation_results | yes | screen.png | Yes |
| 12 | SCR-AI-CFG | ai_chatbot_configuration | yes | screen.png | Yes |
| 13 | SCR-CMD | admin_agent_command_center | yes | screen.png | Yes |
| 14 | SCR-SHELL-TOKENS | propvista_crm | DESIGN.md | n/a | Yes |
| 15 | AST-SEARCH-ICON | a_clean_modern_minimal_flat_line_illustration... | n/a | screen.png | Yes |

\* MVP without excluded timeline/reminder product backends.

## 4. Suggested App Routes

| Screen | Next.js App Router route |
|--------|--------------------------|
| SCR-HOME | `/` |
| SCR-SEARCH-* | `/search` (query + `mode`/`status` drives STD/FB/EMPTY) |
| SCR-PROP-D | `/properties/[id]` |
| SCR-LOGIN | `/login` (functional only — no design_reference HTML) |
| SCR-REGISTER | `/register` (functional only — no design_reference HTML) |
| SCR-CUS-DASH | `/customer` |
| SCR-CLIENTS | `/admin/leads` (lead list; functional / ClientsView — no design_reference HTML) |
| SCR-LEAD-KANBAN | `/admin/leads/pipeline` (Future only) |
| SCR-LEAD-D | `/admin/leads/[id]` |
| SCR-PROP-EDIT | `/admin/properties/new`, `/admin/properties/[id]/edit` |
| SCR-PROP-INV | `/admin/properties` |
| SCR-BULK | `/admin/properties/bulk` |
| SCR-AI-CFG | `/admin/ai-config` |
| SCR-CMD | `/admin` |
| SCR-USERS | `/admin/users` (functional only) |
| SCR-AGENTS | `/admin/agents` (functional only) |
| SCR-CMS | `/admin/cms` (functional only) |
| SCR-NTF-RULES | `/admin/notification-rules` (functional only) |
| SCR-REPORTS | `/admin/reports` (functional only) |

---

## SCR-LOGIN / SCR-REGISTER: Auth (functional only)

| Field | Value |
|-------|--------|
| **Screen ID** | SCR-LOGIN, SCR-REGISTER |
| **Route** | `/login`, `/register` |
| **HTML Reference** | None under `design_reference/` — implement clean functional forms using shared tokens (`SCR-SHELL-TOKENS`) |
| **MVP** | Yes |
| **Roles** | Guest |

### APIs
- `POST /api/v1/auth/token` (login)
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh` (session shell)

### Validation
- Email format required; password min length 8 (OpenAPI / SRS)

### Loading / Empty / Error / Success
- Loading on submit; inline validation errors; `AUTH_INVALID_CREDENTIALS` / `CONFLICT_DUPLICATE_EMAIL` mapped to form errors; success → redirect per role

### Acceptance Criteria
- [ ] Guest can register and obtain session
- [ ] Guest can login via `POST /auth/token` and reach role home
- [ ] Invalid credentials show generic message (no user enumeration)

---

## SCR-CLIENTS: Lead List (functional only)

| Field | Value |
|-------|--------|
| **Screen ID** | SCR-CLIENTS |
| **Route** | `/admin/leads` |
| **HTML Reference** | None under `design_reference/` — list UI per PRD/SRS (`ClientsView` intent); **not** Kanban |
| **MVP** | Yes |
| **Roles** | Agent, Admin, Super Admin |

### APIs
- `GET /api/v1/leads` (filters, pagination)
- Navigate to `SCR-LEAD-D` at `/admin/leads/[id]`

### Acceptance Criteria
- [ ] Authenticated Agent/Admin/Super Admin can list leads
- [ ] Row opens lead detail
- [ ] No Kanban board in MVP nav

---

## SCR-HOME: Homepage — AI-Powered Real Estate Intelligence

| Field | Value |
|-------|--------|
| **Screen Name** | Homepage — AI-Powered Real Estate Intelligence |
| **Screen ID** | SCR-HOME |
| **Route** | `/` |
| **HTML Reference** | `docs/design_reference/propvista_crm_homepage/code.html` |
| **Screenshot Reference** | `docs/design_reference/propvista_crm_homepage/screen.png` |
| **MVP** | Yes |
| **Roles** | Guest+ |

### Components
- `SiteHeader` (Buy, Rent, Agents, About, Sign In, Join AI Pro)
- `HeroSearch` (NLP input, mic, Get matched, suggestion chips)
- `FeaturedPropertyGrid` / property cards + favorite
- `HowItWorksSection` (journey)
- `TestimonialsSection`
- `AIChatWidget` (FAB, panel, close, send)
- `SiteFooter`
- Optional contact/lead capture if present in HTML

### APIs
- `GET /cms/homepage`
- `GET /properties/featured`
- `POST /ai/search` (on Get matched / chip)
- `POST /ai/chat`
- `POST /leads` (contact/chat capture)
- Auth navigation to login/register

### State
- `idle | loadingFeatured | ready | errorFeatured`
- Chat: `closed | open`, messages[], sending
- Search submit navigates to `/search`

### Validation
- Chat message non-empty before send
- Lead/contact fields if form present (name/email validation)
- NLP query may be empty only if HTML allows

### Buttons
- Sign In, Join AI Pro
- Get matched, suggestion chips, View all
- Favorite on cards
- Chat open/close/send
- Mic (if interactive in HTML — match behavior)

### Forms
- Chat composer
- Contact/lead form if in HTML

### Tables
None (card grid, not data table)

### Search
- Hero NLP search placeholder: Try '3BHK under 80 lakhs near tech park'
- Chips: Pet-friendly in Indiranagar; Villas with garden; Modern lofts downtown

### Filters
N/A on homepage (filters on search results)

### Loading State
- Skeleton for featured cards; chat send spinner per design

### Empty State
- Featured empty: hide or empty treatment without breaking hero

### Error State
- CMS/featured/chat API failures: designed toast/inline; chat user-safe error

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Mobile: stacked hero, chat FAB; desktop: full marketing composition per HTML

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `propvista_crm_homepage/code.html`
- [ ] Screenshot comparison vs `propvista_crm_homepage/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved
- [ ] Chat greeting comes from AI config when available

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Primary acquisition surface. Brand/hero must match HTML.


---

## SCR-SEARCH-STD: Search Results — AI Standard View

| Field | Value |
|-------|--------|
| **Screen Name** | Search Results — AI Standard View |
| **Screen ID** | SCR-SEARCH-STD |
| **Route** | `/search` |
| **HTML Reference** | `docs/design_reference/search_results_standard_view/code.html` |
| **Screenshot Reference** | `docs/design_reference/search_results_standard_view/screen.png` |
| **MVP** | Yes |
| **Roles** | Guest+ |

### Components
- Admin/agent chrome if HTML shows (Properties/Clients nav) OR public chrome — **match this HTML shell exactly**
- Search field, notifications, Add Lead (as in HTML)
- Filters sidebar: price, type, beds (1+/3+/5+), amenities, Clear all
- Results header (e.g. Properties in Miami, FL)
- Grid/list/map view toggles
- Property cards with match %, reasons, favorite
- Pagination

### APIs
- `POST /ai/search` (expect `mode=ai`)
- `GET /search/suggest`
- Favorites `POST/DELETE /favorites/{id}` (auth gate)
- Optional `POST /leads` from Add Lead

### State
- `loading | aiSuccess |` (if mode fallback → render SCR-SEARCH-FB; if zero → EMPTY)
- viewMode: grid | list | map
- filters object; page

### Validation
- Price min/max coherent; beds selection exclusive per HTML UX

### Buttons
- Clear all; bed chips; grid/list/map; favorite; pagination; Add Lead; notifications

### Forms
Filter controls (not a classic form submit — apply on change or per HTML)

### Tables
N/A (card/list results)

### Search
- Top search + suggest; retains query

### Filters
- Price range, property type checkboxes, bedrooms, amenities

### Loading State
- Full-page/results skeleton while AI search pending

### Empty State
- Handled by SCR-SEARCH-EMPTY route state

### Error State
- API error → prefer fallback path; else error banner

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Sidebar collapses on mobile; filters drawer if HTML implies

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `search_results_standard_view/code.html`
- [ ] Screenshot comparison vs `search_results_standard_view/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Match scores/reasons required. Do not show fallback banner on this variant.


---

## SCR-SEARCH-FB: Search Results — AI Fallback View

| Field | Value |
|-------|--------|
| **Screen Name** | Search Results — AI Fallback View |
| **Screen ID** | SCR-SEARCH-FB |
| **Route** | `/search?mode=fallback` |
| **HTML Reference** | `docs/design_reference/search_results_filter_fallback_view/code.html` |
| **Screenshot Reference** | `docs/design_reference/search_results_filter_fallback_view/screen.png` |
| **MVP** | Yes |
| **Roles** | Guest+ |

### Components
- Same shell family as search HTML
- **Visible fallback banner** (AI temporarily filter-only)
- Filters panel + Clear all / Reset Search
- Results cards **without** match scores/reasons
- Refine AI Search CTA
- Favorite controls; mobile chat FAB if in HTML

### APIs
- `POST /ai/search` returning `mode=fallback` OR client rendering when orchestrator falls back
- Filter-only property list query params via same endpoint results payload

### State
- `mode=fallback` required; filters; page

### Validation
- Min/Max price numeric

### Buttons
- Reset Search; Clear all; bed chips; Refine AI Search; Add Lead; favorite

### Forms
Filter fields Min/Max price, type, beds, amenities

### Tables
N/A

### Search
- Search properties... retained

### Filters
- Property type, price min/max, bedrooms, amenities

### Loading State
- Loading skeleton then banner+results

### Empty State
- May transition to EMPTY if zero filter results

### Error State
- Banner must remain visible on error-driven fallback

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Mobile filter sheet; FAB per HTML

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `search_results_filter_fallback_view/code.html`
- [ ] Screenshot comparison vs `search_results_filter_fallback_view/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved
- [ ] No match score % or reason ticks on cards

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Banner visibility is acceptance-critical (FR-SEARCH-011).


---

## SCR-SEARCH-EMPTY: Search Results — Empty State

| Field | Value |
|-------|--------|
| **Screen Name** | Search Results — Empty State |
| **Screen ID** | SCR-SEARCH-EMPTY |
| **Route** | `/search (zero results)` |
| **HTML Reference** | `docs/design_reference/search_results_empty_state/code.html` |
| **Screenshot Reference** | `docs/design_reference/search_results_empty_state/screen.png` |
| **MVP** | Yes |
| **Roles** | Guest+ |

### Components
- Filters sidebar + Reset all
- Empty illustration + H2: No properties match your filters
- CTAs: Broaden your search; Try guided matching instead
- Suggestion chips (Palo Alto, Mountain View, Under $2M, Recently Added)
- View suggestions
- Grid/list toggles still present per HTML

### APIs
- Prior `POST /ai/search` or filter search with total=0
- Chip clicks re-query

### State
- `empty` state with preserved query/filters

### Validation
- N/A beyond filter inputs

### Buttons
- Reset all; bed chips; Broaden; guided matching; location/price chips; More Filters

### Forms
Filters form controls

### Tables
N/A

### Search
- Search bar keeps query (e.g. Silicon Valley)

### Filters
- Type, price, beds, location as in HTML

### Loading State
- Brief loading then empty panel

### Empty State
- **This screen IS the empty state**

### Error State
- If search errors without fallback data, show error + recovery CTAs

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Stack empty message and CTAs on mobile

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `search_results_empty_state/code.html`
- [ ] Screenshot comparison vs `search_results_empty_state/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Prevent dead-end UX; always allow refine.


---

## SCR-PROP-D: Property Details — Premium View

| Field | Value |
|-------|--------|
| **Screen Name** | Property Details — Premium View |
| **Screen ID** | SCR-PROP-D |
| **Route** | `/properties/[id]` |
| **HTML Reference** | `docs/design_reference/property_details_premium_view/code.html` |
| **Screenshot Reference** | `docs/design_reference/property_details_premium_view/screen.png` |
| **MVP** | Yes |
| **Roles** | Guest+ |

### Components
- Gallery carousel (prev/next)
- Title, price, beds/baths/area, favorite
- Sections: Description, Amenities, Floor Plan, Location & Nearby (map), Affordability Calculator
- CTAs: Schedule Visit, Request Callback, Message Agent, Get AI Loan Analysis
- Similar matches / View all matches
- Agent contact actions

### APIs
- `GET /properties/{id}`
- `GET /properties/{id}/similar`
- `POST /favorites`
- `POST /leads` (inquire/callback)
- `POST /visits`
- `POST /ai/loan-analysis`
- Optional chat to agent

### State
- `loading | ready | notFound | error`
- galleryIndex; loanModal open/closed
- favorite boolean

### Validation
- Loan modal numeric fields; visit schedule datetime; lead contact fields

### Buttons
- Gallery chevrons; Read more; Request Plan; Get AI Loan Analysis; Message Agent; Schedule Visit; Request Callback; View all matches

### Forms
- Implicit inquiry/callback forms/modals
- Loan analysis inputs in Affordability section/modal
- Schedule visit modal fields

### Tables
N/A

### Search
- Optional admin search in chrome if HTML includes — match HTML

### Filters
N/A

### Loading State
- Detail skeleton for gallery+body

### Empty State
- Missing optional sections hidden gracefully

### Error State
- 404 page/state; API error banner

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Gallery full-bleed on mobile; stacked sections; map height per HTML

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `property_details_premium_view/code.html`
- [ ] Screenshot comparison vs `property_details_premium_view/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved
- [ ] Map uses Leaflet + OpenStreetMap
- [ ] Loan analysis uses Gemini/formula fallback

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Leaflet + OSM for map. No virtual tour/video player in MVP.


---

## SCR-CUS-DASH: Customer Account Dashboard

| Field | Value |
|-------|--------|
| **Screen Name** | Customer Account Dashboard |
| **Screen ID** | SCR-CUS-DASH |
| **Route** | `/customer` |
| **HTML Reference** | `docs/design_reference/customer_account_dashboard/code.html` |
| **Screenshot Reference** | `docs/design_reference/customer_account_dashboard/screen.png` |
| **MVP** | Yes |
| **Roles** | Customer |

### Components
- Welcome header (e.g. Welcome back, Sarah)
- Side nav: Dashboard, Saved Properties, Requirement Profile, Inquiry History, Notification Preferences
- Stats / saved properties gallery
- CTAs: New Inquiry, View All, Review Matches
- Settings/help icons per HTML

### APIs
- `GET /customer/dashboard`
- `GET /favorites` / DELETE favorite
- `GET/PUT /customer/profile`
- `GET /customer/inquiries`
- `GET /notifications`
- Navigate to `/search`

### State
- Auth required; redirect guest to login
- `loading | ready | error`
- activeTab/section

### Validation
- Requirement profile field ranges (budget min<=max)

### Buttons
- New Inquiry; View All; Review Matches; help; settings

### Forms
- Requirement profile editor fields when that section active

### Tables
N/A (cards/lists)

### Search
- Via New Inquiry / Review Matches → search

### Filters
N/A primary

### Loading State
- Dashboard skeleton

### Empty State
- Empty saved properties / empty inquiries panels per HTML

### Error State
- API error toasts; auth 401 → login

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Side nav becomes top/bottom tabs on mobile if HTML implies

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `customer_account_dashboard/code.html`
- [ ] Screenshot comparison vs `customer_account_dashboard/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Do not ship excluded rich activity timeline product; inquiry list satisfies history.


---

## SCR-LEAD-KANBAN: Lead Pipeline — Kanban View

| Field | Value |
|-------|--------|
| **Screen Name** | Lead Pipeline — Kanban View |
| **Screen ID** | SCR-LEAD-KANBAN |
| **Route** | `/admin/leads/pipeline` |
| **HTML Reference** | `docs/design_reference/lead_pipeline_kanban_view/code.html` |
| **Screenshot Reference** | `docs/design_reference/lead_pipeline_kanban_view/screen.png` |
| **MVP** | NO — Out of MVP |
| **Roles** | Agent/Admin (Future) |

### Components
- Kanban columns (New → Contacted → Site Visit → Negotiation → Closed Won/Lost per HTML)
- Lead cards, WIP indicators, Filter, New Lead
- View toggle Kanban/Table
- Admin shell nav

### APIs
- Future: leads list + PATCH stage
- **MVP: do not implement or link in nav**

### State
- N/A for MVP shipping

### Validation
- N/A for MVP

### Buttons
- New Lead; Filter; Kanban/Table toggles; Dismiss; more menus

### Forms
Lead create modal (future)

### Tables
Table alternate view in HTML

### Search
- Search leads, addresses, or tags...

### Filters
- Filter control

### Loading State
- Column skeletons (future)

### Empty State
- Empty column states (future)

### Error State
- Error toast (future)

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Horizontal scroll columns on mobile (future)

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `lead_pipeline_kanban_view/code.html`
- [ ] Screenshot comparison vs `lead_pipeline_kanban_view/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved
- [ ] MVP release contains zero Kanban routes in production navigation

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
CONSTITUTION EXCLUSION. Keep HTML as reference only until post-MVP activation.


---

## SCR-LEAD-D: Lead Detail — Sarah Jenkins (template)

| Field | Value |
|-------|--------|
| **Screen Name** | Lead Detail — Sarah Jenkins (template) |
| **Screen ID** | SCR-LEAD-D |
| **Route** | `/admin/leads/[id]` |
| **HTML Reference** | `docs/design_reference/lead_detail_sarah_jenkins/code.html` |
| **Screenshot Reference** | `docs/design_reference/lead_detail_sarah_jenkins/screen.png` |
| **MVP** | Yes (MVP subset) |
| **Roles** | Agent, Admin, Super Admin |

### Components
- Lead header: name, stage badge, source, score
- Contact actions: Send Email, call patterns, edit
- Notes composer + list (Notes & Call Logs heading may exist — MVP implements notes)
- Stage history / requirement profile panels as visual
- Property match / View Full Match Analysis links
- Follow-up Reminders UI present in HTML → **Future product** (do not wire reminder engine)
- Admin chrome

### APIs
- `GET /leads/{id}`
- `PATCH /leads/{id}`
- `PATCH /leads/{id}/stage`
- `GET/POST /leads/{id}/notes`
- `POST /visits`
- Optional property GET for interests

### State
- `loading | ready | 404 | error`
- noteDraft; stageMenu

### Validation
- Note body required; stage enum

### Buttons
- New Lead; Send Email; Post Note; Schedule-related; edit; Add reminder (UI only/disabled until Future); View Full Match Analysis

### Forms
- Add note textarea; stage change control

### Tables
N/A

### Search
- Header search if in HTML

### Filters
- Filter icon if present

### Loading State
- Detail skeleton

### Empty State
- Empty notes list

### Error State
- 404/403 pages

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Stack panels on mobile

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `lead_detail_sarah_jenkins/code.html`
- [ ] Screenshot comparison vs `lead_detail_sarah_jenkins/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved
- [ ] Stage change persists
- [ ] Notes persist with timestamps
- [ ] Reminder engine not shipped

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Preserve HTML structure; reminders/timeline backends excluded from MVP.


---

## SCR-PROP-EDIT: Listing Editor — Basic Info

| Field | Value |
|-------|--------|
| **Screen Name** | Listing Editor — Basic Info |
| **Screen ID** | SCR-PROP-EDIT |
| **Route** | `/admin/properties/[id]/edit` |
| **HTML Reference** | `docs/design_reference/listing_editor_basic_info/code.html` |
| **Screenshot Reference** | `docs/design_reference/listing_editor_basic_info/screen.png` |
| **MVP** | Yes |
| **Roles** | Agent, Admin, Super Admin |

### Components
- Editor chrome: Draft/Pending/Published indicators
- Tabs/sections: Basic Info, Media, Amenities, Location, Status & Flags
- Fields: title, price, type, beds, baths, area, description, etc.
- Actions: Save Changes, Discard, Full Preview, Notify Leads
- AI Insights button (visual; wire only if API exists — do not invent)
- Side nav: Dashboard, Properties, Leads, Agents, Reports...

### APIs
- `POST /properties` or `PATCH /properties/{id}`
- `PATCH /properties/{id}/status`
- `POST /properties/{id}/images`
- `PUT` amenities/landmarks
- `GET /properties/{id}`

### State
- `loading | editing | saving | saved | error`
- dirty form flag
- activeTab

### Validation
- Required: title, price, beds, baths, sqft/area, address (publish)
- Price numeric string
- Inline field errors; disable publish until valid
- No video upload in MVP

### Buttons
- Save Changes; Discard; Full Preview; status chips; section tabs; New Listing; AI Insights

### Forms
- Primary listing form (basic info + related sections)
- Media upload controls (photo/floorplan only)

### Tables
N/A

### Search
- Search properties... in shell if present

### Filters
N/A

### Loading State
- Form skeleton on load; saving spinner on Save

### Empty State
- New listing blank defaults

### Error State
- Validation toasts/inline; 403 if unauthorized

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Single column form on mobile

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `listing_editor_basic_info/code.html`
- [ ] Screenshot comparison vs `listing_editor_basic_info/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Exclude virtual tour/video fields from MVP publish path.


---

## SCR-PROP-INV: Property Inventory — Admin View

| Field | Value |
|-------|--------|
| **Screen Name** | Property Inventory — Admin View |
| **Screen ID** | SCR-PROP-INV |
| **Route** | `/admin/properties` |
| **HTML Reference** | `docs/design_reference/property_inventory_admin_view/code.html` |
| **Screenshot Reference** | `docs/design_reference/property_inventory_admin_view/screen.png` |
| **MVP** | Yes |
| **Roles** | Agent, Admin, Super Admin |

### Components
- Properties header
- New Listing / Add Property / Bulk Upload
- Status chips: All, Draft, Pending Approval, Published, Rejected (map to domain statuses carefully — align HTML labels to draft/published/archived model without redesign)
- Search
- Grid/list toggle
- Table/cards with actions: edit, delete, visibility, etc.
- Pagination
- Admin sidebar

### APIs
- `GET /properties` (auth inventory)
- `POST /properties/bulk/status`
- `DELETE/PATCH` property
- Navigate bulk → `/admin/properties/bulk`
- Export `GET /properties/export` if button present

### State
- `loading | ready | empty | error`
- selectedIds[]; statusFilter; page; viewMode

### Validation
- Bulk actions require selection

### Buttons
- New Listing; Bulk Upload; Add Property; status filters; row edit/delete/view; pagination

### Forms
N/A (filters + search)

### Tables
- **Yes** — inventory table/grid per HTML

### Search
- Search properties, owners, or IDs...

### Filters
- Status filter chips; selects as in HTML

### Loading State
- Table skeleton rows

### Empty State
- Empty: No properties match your filters

### Error State
- Error banner + retry

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Cards on mobile / table on desktop per HTML

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `property_inventory_admin_view/code.html`
- [ ] Screenshot comparison vs `property_inventory_admin_view/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Wire Bulk Upload button to SCR-BULK flow.


---

## SCR-BULK: Bulk Property Upload — Validation Results

| Field | Value |
|-------|--------|
| **Screen Name** | Bulk Property Upload — Validation Results |
| **Screen ID** | SCR-BULK |
| **Route** | `/admin/properties/bulk` |
| **HTML Reference** | `docs/design_reference/bulk_upload_validation_results/code.html` |
| **Screenshot Reference** | `docs/design_reference/bulk_upload_validation_results/screen.png` |
| **MVP** | Yes |
| **Roles** | Admin, Super Admin |

### Components
- Bulk Property Upload header
- File select / Select Files
- Summary counts
- Results table (rows/errors)
- View all rows expand
- Cancel; Commit N Valid Rows
- Close

### APIs
- `POST /bulk/properties/validate`
- `GET /bulk/properties/sessions/{id}`
- `GET /bulk/properties/sessions/{id}/errors.csv`
- `POST /bulk/properties/sessions/{id}/import`

### State
- `idle | uploading | validated | importing | done | error`
- sessionId; counts; errors[]

### Validation
- Accept allowed file types only; show row-level errors

### Buttons
- Select Files; Cancel; Commit Valid Rows; View all rows; close

### Forms
- Upload picker

### Tables
- **Yes** — validation/error results table

### Search
- Shell search if present

### Filters
N/A beyond validation results filters/tabs if HTML has tabs

### Loading State
- Progress while validating/importing

### Empty State
- Zero errors tab empty

### Error State
- Parse failure message; import conflict

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Table horizontal scroll on mobile

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `bulk_upload_validation_results/code.html`
- [ ] Screenshot comparison vs `bulk_upload_validation_results/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved
- [ ] Error CSV download works
- [ ] Commit imports only valid count

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Import valid rows only; never silently import invalid.


---

## SCR-AI-CFG: AI Chatbot Configuration

| Field | Value |
|-------|--------|
| **Screen Name** | AI Chatbot Configuration |
| **Screen ID** | SCR-AI-CFG |
| **Route** | `/admin/ai-config` |
| **HTML Reference** | `docs/design_reference/ai_chatbot_configuration/code.html` |
| **Screenshot Reference** | `docs/design_reference/ai_chatbot_configuration/screen.png` |
| **MVP** | Yes |
| **Roles** | Admin, Super Admin |

### Components
- Configuration form: greeting textarea, FAQ list, escalation, tone/params
- Add FAQ; edit/delete FAQ
- Device preview toggles (phone/desktop/tablet)
- Preview chat panel
- Save Changes
- Admin nav including AI Configuration, CMS, Notification Rules, etc.

### APIs
- `GET /ai/config`
- `PUT /ai/config`
- `POST /ai/config/preview`
- Preview may call chat with override

### State
- `loading | editing | saving | saved | error`
- previewMessages[]; dirty

### Validation
- Greeting required on save
- FAQ q/a required when entry added
- modelLabel constrained to Gemini (UI may show model field — options Gemini only)

### Buttons
- Save Changes; Add FAQ; edit; close; preview send; device toggles

### Forms
- Greeting, FAQ fields, escalation, tone, preview composer

### Tables
N/A

### Search
- Admin shell search

### Filters
N/A

### Loading State
- Config skeleton; preview sending state

### Empty State
- Empty FAQ list state

### Error State
- Save failure toast

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Split pane stacks on mobile

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `ai_chatbot_configuration/code.html`
- [ ] Screenshot comparison vs `ai_chatbot_configuration/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Hot-apply config without redeploy. No Bedrock/other providers.


---

## SCR-CMD: Admin / Agent Command Center

| Field | Value |
|-------|--------|
| **Screen Name** | Admin / Agent Command Center |
| **Screen ID** | SCR-CMD |
| **Route** | `/admin` |
| **HTML Reference** | `docs/design_reference/admin_agent_command_center/code.html` |
| **Screenshot Reference** | `docs/design_reference/admin_agent_command_center/screen.png` |
| **MVP** | Yes |
| **Roles** | Admin, Super Admin (Agent limited if HTML allows) |

### Components
- Performance Overview
- KPI cards
- Charts (sources, views over time, rankings)
- Activity feed
- CTAs: New Listing, Download Report, AI Insights, Distribute Leads, etc.
- Full admin sidebar (Properties, Leads, Agents, Users, AI Configuration, CMS, Reports, Notification Rules)

### APIs
- `GET /metrics/dashboard?from&to`
- `GET /metrics/reports`
- Navigation only for other modules
- Notifications dropdown optional

### State
- `loading | ready | error`
- dateRange; feedFilter

### Validation
- Date range from <= to

### Buttons
- New Listing; Download Report; AI Insights; Distribute Leads Now; Connect New Source; View Profile; Assign Agent; Join Conversation; See All Activity; View All Rankings

### Forms
Date range controls if present

### Tables
N/A (cards/charts/feed)

### Search
- Search leads, properties, or tasks...

### Filters
- Activity type filter if in HTML

### Loading State
- KPI/chart skeletons

### Empty State
- Empty feed message

### Error State
- Metrics error with retry

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Chart stack on mobile; KPI wrap

### Accessibility

- Semantic landmarks / headings hierarchy
- Form labels associated with controls
- Icon-only buttons have accessible names
- Keyboard focus visible (match design)
- Meaningful image alt text
- Sufficient contrast from design tokens


### Acceptance Criteria
- [ ] Pixel-perfect match to `admin_agent_command_center/code.html`
- [ ] Screenshot comparison vs `admin_agent_command_center/screen.png`
- [ ] All interactions from HTML implemented
- [ ] Loading / empty / error states implemented
- [ ] APIs integrated (real; mocks removed if used)
- [ ] Responsive verified
- [ ] Accessibility baseline met
- [ ] QA + code review approved

### Pixel-perfect Checklist

| Check | Pass |
|-------|------|
| Layout / spacing vs HTML | [ ] |
| Typography (family, size, weight, line-height) | [ ] |
| Colors / surfaces / borders | [ ] |
| Icons / images / assets | [ ] |
| Hover / active / focus | [ ] |
| Animations / transitions | [ ] |
| Screenshot side-by-side match | [ ] |
| Mobile / tablet / desktop | [ ] |
| No console errors | [ ] |
| No TypeScript / ESLint issues | [ ] |


### Implementation Notes
Activity feed != excluded CRM timeline product.


---

## SCR-SHELL-TOKENS: Shared Design Tokens / Shell

| Field | Value |
|-------|--------|
| **Screen Name** | Shared PropVista design tokens / shell guidance |
| **Screen ID** | SCR-SHELL-TOKENS |
| **Route** | N/A (global) |
| **HTML Reference** | `docs/design_reference/propvista_crm/DESIGN.md` (no code.html) |
| **Screenshot Reference** | N/A |
| **MVP** | Yes |
| **Roles** | All |

### Components
- Global Tailwind theme extension (colors, typography, spacing, radii from DESIGN.md)
- Shared layout primitives used across admin/public shells

### APIs
- None

### State / Validation / Buttons / Forms / Tables / Search / Filters
- N/A

### Loading / Empty / Error / Responsive
- Provide shared Skeleton, Empty, Error primitives matching HTML patterns reused across screens

### Accessibility
- Base focus ring and contrast tokens from DESIGN.md

### Acceptance Criteria
- [ ] Tailwind theme tokens align to DESIGN.md
- [ ] Shared components reused (no one-off divergent palettes)

### Pixel-perfect Checklist
- [ ] Token values match DESIGN.md (primary, surfaces, type scale)

### Implementation Notes
- Apply before implementing individual screens to avoid drift.

---

## AST-SEARCH-ICON: Search Magnifying Glass Asset

| Field | Value |
|-------|--------|
| **Screen Name** | Magnifying glass illustration (search UI asset) |
| **Screen ID** | AST-SEARCH-ICON |
| **Route** | N/A (asset) |
| **HTML Reference** | N/A (asset-only directory) |
| **Screenshot Reference** | `docs/design_reference/a_clean_modern_minimal_flat_line_illustration_of_a_magnifying_glass_over_a/screen.png` |
| **MVP** | Yes |
| **Roles** | N/A |

### Components
- Reusable icon/image component for search bars (homepage + search)

### APIs
- None

### State / Validation / Buttons / Forms / Tables / Search / Filters / Loading / Empty / Error
- N/A (static asset)

### Success State
- Happy-path `ready`/`success` UI matches HTML after successful load or submit; show designed toast/banner only if HTML specifies

### Responsive Behaviour
- Serve appropriate resolution / SVG if extracted

### Accessibility
- Decorative: `alt=""` or aria-hidden; if meaningful, provide alt

### Acceptance Criteria
- [ ] Asset used where HTML search UI expects this illustration (not a random Lucide substitute when HTML uses this art)

### Pixel-perfect Checklist
- [ ] Visual matches `screen.png` asset

### Implementation Notes
- Extract to `public/` or SVG component; do not replace with generic icon if HTML uses this artwork.

---

## 5. Cross-Screen Definition of Done (UI)

A screen is **COMPLETE** only when:

1. HTML reference matched  
2. Screenshot comparison passed  
3. Responsive verified  
4. All interactions implemented  
5. Validation implemented  
6. Loading, empty, error, and success states done  
7. APIs integrated  
8. No console / TS / ESLint issues  
9. Code reviewed + QA approved  

(Constitution Screen Completion Policy)

## 6. Related Documents

| Doc | Use |
|-----|-----|
| `00_PROJECT_CONSTITUTION.md` | Fidelity + DoD gates |
| `01_PRODUCT_REQUIREMENTS_DOCUMENT.md` | Scope / MVP exclusions |
| `02_SOFTWARE_REQUIREMENTS_SPECIFICATION.md` | FR acceptance |
| `openapi.yaml` | API contracts |
| `03_SYSTEM_ARCHITECTURE_DOCUMENT.md` | Feature folder placement |

## 7. Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Full guide for all design_reference screens + tokens + search asset |

---

**End of UI Implementation Guide**

*No design_reference screen was skipped.*
