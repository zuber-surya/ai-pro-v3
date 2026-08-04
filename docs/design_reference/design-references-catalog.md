# PropVista CRM Design References Catalog

| Field | Value |
|-------|--------|
| **Path** | `docs/design_reference/` |
| **UI SOT** | `code.html` wins; `screen.png` is visual baseline |
| **Tokens** | `propvista_crm/DESIGN.md` |
| **Updated** | 2026-08-04 (implementation status sync) |
| **Frozen product docs** | Tag `docs-v1.0` — do not redesign HTML to match the app |

## Overview

Each screen folder typically has:

- `code.html` — structure, copy, classes, interactions (authoritative)
- `screen.png` — composition baseline
- Exception: `propvista_crm/` is tokens only (`DESIGN.md`); magnifying-glass folder is asset-only (`screen.png`)

These designs are the **UI source of truth**. Implementation must match HTML; do not edit HTML to fit a divergent UI.

---

## Implementation status matrix (live app)

| Directory | SCR | Live route | MVP | Status | Notes |
|-----------|-----|------------|-----|--------|-------|
| `propvista_crm_homepage` | SCR-HOME | `/` | Yes | **Done** | AI search, curated, journey, testimonials, lead form, chat |
| `search_results_standard_view` | SCR-SEARCH-STD | `/search` | Yes | **Done** | Match scores / reasons when AI mode |
| `search_results_filter_fallback_view` | SCR-SEARCH-FB | `/search?mode=fallback` | Yes | **Done** | Same route, fallback state |
| `search_results_empty_state` | SCR-SEARCH-EMPTY | `/search` (zero results) | Yes | **Done** | Same route, empty state |
| `property_details_premium_view` | SCR-PROP-D | `/properties/[id]` | Yes | **Done** | Gallery, map, CTAs, schedule/inquire |
| `customer_account_dashboard` | SCR-CUS-DASH | `/customer` | Yes | **Done** | Saved, requirements, inquiries, searches |
| `lead_pipeline_kanban_view` | SCR-LEAD-KANBAN | — | **No** | **Out of MVP** | Absent from nav (Constitution) |
| `lead_detail_sarah_jenkins` | SCR-LEAD-D | `/admin/leads/[id]` | Yes* | **Done** | MVP: contact, stage, notes, visit; no reminder product |
| `listing_editor_basic_info` | SCR-PROP-EDIT | `/properties/[id]/edit` | Yes | **Done** | Create via inventory / new listing flows |
| `property_inventory_admin_view` | SCR-PROP-INV | `/properties` | Yes | **Done** | Admin/agent inventory (not `/admin/properties`) |
| `bulk_upload_validation_results` | SCR-BULK | `/properties/bulk` | Yes | **Done** | CSV validate + import |
| `ai_chatbot_configuration` | SCR-AI-CFG | `/admin/ai-config` | Yes | **Done** | Gemini only (not Bedrock) |
| `admin_agent_command_center` | SCR-CMD | `/admin` | Yes | **Done** | KPIs, charts, activity, leaderboard |
| `propvista_crm` | SCR-SHELL-TOKENS | (global theme) | Yes | **Done** | `DESIGN.md` tokens in Tailwind/CSS |
| `a_clean_modern_minimal_flat_line_illustration_of_a_magnifying_glass_over_a` | AST-SEARCH-ICON | (asset) | Yes | **Done** | Empty-search / marketing asset |

\* Lead detail: layout fidelity for MVP panels; timeline/reminder **product** backends remain Future.

### Functional screens (no `design_reference` HTML)

| SCR | Route | Status |
|-----|-------|--------|
| SCR-LOGIN | `/login` | **Done** — role home + safe `?next=` |
| SCR-REGISTER | `/register` | **Done** — preserves `?next=` |
| SCR-CLIENTS | `/admin/leads` | **Done** — list (not Kanban) |
| SCR-USERS | `/admin/users` | **Done** |
| SCR-AGENTS | `/admin/agents` | **Done** |
| SCR-CMS | `/admin/cms` | **Done** |
| SCR-NTF-RULES | `/admin/notification-rules` | **Done** |
| SCR-REPORTS | `/admin/reports` | **Done** |
| Public CMS page | `/pages/[slug]` | **Done** |

Evidence: `dogfood-output/screenshots/pixel/`, walkthrough videos, checklist §39.

---

## Design reference inventory

### 1. Public-facing

| Directory | HTML title / intent | Purpose | Related FRs |
|-----------|---------------------|---------|-------------|
| `propvista_crm_homepage` | PropVista CRM | Landing: AI search, featured, chat, journey, contact | FR1, FR2, FR6, FR13 |
| `search_results_standard_view` | Search results (AI) | Ranked results with match % and reasons | FR2 |
| `search_results_filter_fallback_view` | Search fallback | Filter results when AI unavailable | FR2.6 |
| `search_results_empty_state` | No results | Empty guidance / refine CTAs | FR2 |
| `property_details_premium_view` | Property details | Gallery, floorplan, map, inquire/save/schedule | FR5 |

### 2. Customer portal

| Directory | Purpose | Related FRs |
|-----------|---------|-------------|
| `customer_account_dashboard` | Saved properties, requirements, inquiries, notifications, saved searches | FR7 |

### 3. Lead CRM

| Directory | Purpose | Related FRs | MVP |
|-----------|---------|-------------|-----|
| `lead_pipeline_kanban_view` | Kanban pipeline | FR10 | **Out of MVP** |
| `lead_detail_sarah_jenkins` | Lead detail / notes / stage | FR10 | Yes (subset) |

### 4. Property admin

| Directory | Purpose | Related FRs |
|-----------|---------|-------------|
| `listing_editor_basic_info` | Create/edit listing basics | FR9 |
| `property_inventory_admin_view` | Inventory table / bulk actions | FR9 |
| `bulk_upload_validation_results` | CSV validation results | FR9.2 |

### 5. AI & admin ops

| Directory | Purpose | Related FRs |
|-----------|---------|-------------|
| `ai_chatbot_configuration` | Greeting, FAQ, escalation, tone (**Gemini**) | FR13 |
| `admin_agent_command_center` | KPI dashboard, charts, activity, leaderboard | FR8 |

### 6. Tokens & assets

| Directory | Type | Purpose |
|-----------|------|---------|
| `propvista_crm` | Tokens | `DESIGN.md` — colors, type, radii, shadows |
| `a_clean_modern_minimal_…` | Illustration | Magnifying-glass asset (`screen.png` only) |

---

## Traceability (design → FR)

| Design reference | Primary FRs |
|------------------|-------------|
| propvista_crm_homepage | FR1, FR6, FR13 |
| search_results_* | FR2 |
| property_details_premium_view | FR5 |
| customer_account_dashboard | FR7 |
| lead_pipeline_kanban_view | FR10 (Future UI) |
| lead_detail_sarah_jenkins | FR10 |
| listing_editor_basic_info | FR9 |
| property_inventory_admin_view | FR9 |
| bulk_upload_validation_results | FR9.2 |
| ai_chatbot_configuration | FR13 |
| admin_agent_command_center | FR8 |

---

## Implementation notes (current stack)

1. **HTML wins** — match `code.html` / `screen.png`; no redesign.
2. **Search** — one route `/search` with STD / FB / EMPTY states.
3. **Kanban** — HTML kept for Future; do not add to MVP nav.
4. **LLM** — Gemini only (Constitution); ignore Bedrock labels in older notes.
5. **Property admin routes** — `/properties`, `/properties/[id]/edit`, `/properties/bulk` (not under `/admin/properties`).
6. **Auth return path** — `/login?next=` and `/register?next=` for gated actions.
7. **Pixel verification** — see `docs/16_UI_PIXEL_PERFECT_CHECKLIST.md` §39.

---

## Related docs

| Doc | Use |
|-----|-----|
| `07_UI_IMPLEMENTATION_GUIDE.md` | Per-screen build checklist + routes |
| `16_UI_PIXEL_PERFECT_CHECKLIST.md` | Verification + main-screen sign-off log |
| `00_PROJECT_CONSTITUTION.md` | Screen completion / UI fidelity rules |
| `DOCS_FREEZE_GATE.md` | Frozen product docs at `docs-v1.0` |

---

*Catalog refreshed 2026-08-04 against live Next.js routes and MVP ship status.*
*Do not treat older “docs/design/” path references as current — canonical path is `docs/design_reference/`.*
