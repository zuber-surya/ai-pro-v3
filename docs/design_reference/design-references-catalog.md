# PropVista CRM Design References Catalog

## Overview
This document catalogs all UI/UX design references located in the `docs/design/` directory. Each design reference consists of:
- `code.html`: Semantic HTML markup representing the screen structure
- `screen.png`: Visual mockup/screenshot of the screen
- Exception: Asset-only directories contain only `screen.png` (no HTML)

These designs serve as the **source of truth for UI implementation** and are directly traceable to functional requirements (FRxx) in the SRS/BRD documents.

## Design Reference Inventory

### 1. Public-Facing Pages (Anonymous Access)
*First touchpoints for visitors showcasing AI-first value proposition*

| Directory | Screen Title (from HTML) | Purpose | Related FRs | Suggested User Story Mapping |
|-----------|--------------------------|---------|-------------|------------------------------|
| `propvista_crm_homepage` | PropVista CRM | Main landing page: AI search bar, featured properties, chatbot, value proposition, contact form | FR1.1-FR1.7, FR2.1-FR2.8, FR6.1-FR6.4, FR13.1-FR13.7 | US-HOMEPAGE-001: "As a website visitor, I want to view the homepage so I can understand the service, search for properties using AI, and express interest without needing to navigate away" |
| `search_results_standard_view` | [Inferred: Search Results] | Standard AI-powered search results with match scores (%) and explainable match reasons (✓/✗) | FR2.1-FR2.3 | US-SEARCH-001: "As a visitor, I want to see AI-ranked property results with explainable match scores so I can understand why properties match my query" |
| `search_results_filter_fallback_view` | [Inferred: Search Results - Fallback] | Fallback view when AI search fails/times out - shows traditional filter-based results with visible fallback_mode indicator | FR2.6 | US-SEARCH-002: "As a visitor, I want to see filtered results with a fallback notice when AI is unavailable so I can still browse properties" |
| `search_results_empty_state` | [Inferred: No Results Found] | State shown when search returns zero results - includes guidance to refine search terms or filters | FR2.1-FR2.6 | US-SEARCH-003: "As a visitor, I want helpful feedback when my search returns no results so I can adjust my query effectively" |
| `property_details_premium_view` | PropVista CRM - Property Details | Detailed property view: gallery, floorplan, amenities, price breakdown, map, and primary/secondary CTAs (inquire, save, contact agent) | FR5.1-FR5.5 | US-PROPERTY-001: "As a visitor, I want to see comprehensive property details so I can make an informed inquiry decision" |

### 2. Customer Portal (Authenticated - Customer Role)
*Personalized experience for registered property seekers*

| Directory | Screen Title (from HTML) | Purpose | Related FRs | Suggested User Story Mapping |
|-----------|--------------------------|---------|-------------|------------------------------|
| `customer_account_dashboard` | [Inferred: Customer Dashboard] | Personalized dashboard: saved properties, requirement profile, inquiry history, notifications, and quick actions | FR7.1-FR7.3 | US-CUSTOMER-001: "As a registered customer, I want a dashboard showing my saved items, requirements, and inquiry history so I can manage my property search effectively" |

### 3. Lead Management & CRM Pipeline (Authenticated - Agent/Admin Role)
*Core sales process functionality*

| Directory | Screen Title (from HTML) | Purpose | Related FRs | Suggested User Story Mapping |
|-----------|--------------------------|---------|-------------|------------------------------|
| `lead_pipeline_kanban_view` | PropVista CRM - Lead Pipeline | Kanban board visualization: New → Contacted → Site Visit → Negotiation → Closed Won/Lost stages with WIP limits, filtering, and bulk actions | FR10.1, FR10.2, FR10.5 | US-LEAD-001: "As an agent, I want to visualize leads in a Kanban board by stage so I can efficiently manage my pipeline and prioritize follow-ups" |
| `lead_detail_sarah_jenkins` | PropVista CRM - Lead Detail: Sarah Jenkins | Detailed lead view: contact info, source, lead score, notes timeline, call logs, stage history, follow-up tasks, and property interests | FR10.3, FR10.4 | US-LEAD-002: "As an agent, I want to see complete lead details including communication history so I can effectively follow up and convert opportunities" |

### 4. Property Management (Authenticated - Agent/Admin Role)
*Listing creation, editing, and inventory management*

| Directory | Screen Title (from HTML) | Purpose | Related FRs | Suggested User Story Mapping |
|-----------|--------------------------|---------|-------------|------------------------------|
| `listing_editor_basic_info` | PropVista CRM - Edit Property | Form for creating/editing: title, price, bedrooms/bathrooms, area, location pin, basic amenities (parking, balcony, etc.) | FR9.1 | US-PROPERTY-002: "As an admin/agent, I want to create and edit property listings with accurate core information so I can maintain accurate inventory" |
| `property_inventory_admin_view` | PropVista CRM - Property Management | Administrative grid/view: property cards with status badges, multi-select, bulk actions ( publish/archive/delete), sorting, and column customization | FR9.1, FR9.2 | US-PROPERTY-003: "As an admin, I want to view, filter, and manage all property listings in a searchable inventory so I can maintain data quality and perform bulk operations" |

### 5. Bulk Operations (Authenticated - Admin Role)
*Data import/export functionality*

| Directory | Screen Title (from HTML) | Purpose | Related FRs | Suggested User Story Mapping |
|-----------|--------------------------|---------|-------------|------------------------------|
| `bulk_upload_validation_results` | PropVista CRM - Bulk Upload Results | Results screen: success/failure counts, detailed error messages per row, downloadable error report, and confirmation to proceed with valid records | FR9.2 | US-BULK-001: "As an admin, I want to see validation results after a bulk upload so I can correct errors before finalizing the import" |

### 6. AI Configuration & Settings (Authenticated - Admin Role)
*Administrative controls for tuning AI behavior*

| Directory | Screen Title (from HTML) | Purpose | Related FRs | Suggested User Story Mapping |
|-----------|--------------------------|---------|-------------|------------------------------|
| `ai_chatbot_configuration` | PropVista CRM - AI Chatbot Configuration | Admin interface: greeting script editor, FAQ library management, escalation rules (to human agent), model selection (Bedrock), and response tone configuration | FR13.1, FR13.3, FR13.4 | US-AI-SETUP-001: "As an admin, I want to configure the chatbot's responses and behavior without requiring a code deployment so I can adapt to business needs quickly" |

### 7. Admin Command Center (Authenticated - Admin Role)
*Primary administrative dashboard and system oversight*

| Directory | Screen Title (from HTML) | Purpose | Related FRs | Suggested User Story Mapping |
|-----------|--------------------------|---------|-------------|------------------------------|
| `admin_agent_command_center` | PropVista CRM | Admin Dashboard | Main dashboard: KPI cards (listings, leads, conversion rate, sessions), lead source breakdown funnel chart, property views over time line graph, and recent activity feed | FR8.1-FR8.4 | US-ADMIN-001: "As an admin, I want to see key performance metrics and activity trends at a glance so I can monitor business health and make data-driven decisions" |

### 8. Design Assets (Non-Screen Elements)
*Reusable visual components, not full screens*

| Directory | Type | Purpose | Notes |
|-----------|------|---------|-------|
| `a_clean_modern_minimal_flat_line_illustration_of_a_magnifying_glass_over_a` | Illustration/Icon | Magnifying glass icon (used in search bar UI) | Asset-only: contains only `screen.png` (the image); no `code.html` as it's not a standalone screen |
| `propvista_crm` | [Likely: App Shell/Layout] | Probable application layout container (header, footer, navigation structure) | **Needs verification** - may represent the base layout used across multiple screens. Recommend checking contents to confirm if it contains shared UI components (nav, footer, etc.) |

## Traceability Matrix to Functional Requirements

| Design Reference | Primary FRs Covered | Secondary FRs Covered | User Story Count (Suggested) |
|------------------|---------------------|------------------------|------------------------------|
| propvista_crm_homepage | FR1.1-FR1.7, FR6.1-FR6.4 | FR2.1-FR2.8, FR13.1-FR13.7 | 1 (umbrella story with multiple ACs) |
| search_results_standard_view | FR2.1-FR2.3 | FR13.1 | 1 |
| search_results_filter_fallback_view | FR2.6 | FR13.1 | 1 |
| search_results_empty_state | FR2.1-FR2.6 | FR13.1 | 1 |
| property_details_premium_view | FR5.1-FR5.5 | FR13.1 | 1 |
| customer_account_dashboard | FR7.1-FR7.3 | FR8.1-FR8.4 | 1 |
| lead_pipeline_kanban_view | FR10.1, FR10.2, FR10.5 | FR10.3, FR10.4 | 1 |
| lead_detail_sarah_jenkins | FR10.3, FR10.4 | FR10.1, FR10.2 | 1 |
| listing_editor_basic_info | FR9.1 | FR9.2 | 1 |
| property_inventory_admin_view | FR9.1, FR9.2 | FR9.3 | 1 |
| bulk_upload_validation_results | FR9.2 | FR9.1, FR9.3 | 1 |
| ai_chatbot_configuration | FR13.1, FR13.3, FR13.4 | FR13.2, FR13.5 | 1 |
| admin_agent_command_center | FR8.1-FR8.4 | FR2.1-FR2.8, FR10.1-FR10.5 | 1 |

## Implementation Phase Guidance (Per Development Operating System)

### Phase 0: Foundation
- **Prerequisite for all UI work**: Auth system, React shells, API skeleton
- *No direct design implementation, but enables all authenticated views*

### Phase 1: Property Core (Non-AI Spine)
- **Directly implements**: 
  - `property_inventory_admin_view` (US-PROPERTY-003)
  - `listing_editor_basic_info` (US-PROPERTY-002)
  - `property_details_premium_view` (US-PROPERTY-001)
- **Enables**: Bulk operations foundation

### Phase 2: Lead & CRM Pipeline
- **Directly implements**:
  - `lead_pipeline_kanban_view` (US-LEAD-001)
  - `lead_detail_sarah_jenkins` (US-LEAD-002)
  - `bulk_upload_validation_results` (US-BULK-001)
- **Depends on**: Phase 1 (Property Core)

### Phase 3: Users, Roles, Agents
- **Directly implements**:
  - `customer_account_dashboard` (US-CUSTOMER-001)
- **Enables**: Personalized experiences post-login

### Phase 4: AI Search (Embeddings + Fallback)
- **Directly implements**:
  - `search_results_standard_view` (US-SEARCH-001)
  - `search_results_filter_fallback_view` (US-SEARCH-002)
  - `search_results_empty_state` (US-SEARCH-003)
  - Homepage search integration (part of US-HOMEPAGE-001)
- **Depends on**: Phase 1 (Property Core for data)

### Phase 5: AI Recommendation
- **No direct design references** (wizard flows likely in separate docs)
- **Enhances**: Search results and property recommendations

### Phase 6: AI Chatbot (Tool Calling + SSE)
- **Directly implements**:
  - `ai_chatbot_configuration` (US-AI-SETUP-001)
  - Chatbot integration on homepage (part of US-HOMEPAGE-001)
- **Depends on**: Phase 2 (Lead Service for lead capture)

### Phase 7: Customer Portal
- **Directly implements**:
  - `customer_account_dashboard` (US-CUSTOMER-001)
- **Depends on**: Phase 2 (Lead), Phase 4 (Search), Phase 5 (Recommendation)

### Phase 8: Dashboard, Metrics & Reports
- **Directly implements**:
  - `admin_agent_command_center` (US-ADMIN-001)
- **Depends on**: Phase 2 (Lead), Phase 3 (Users), Phase 4 (Search)

### Phase 9: AI Config, Notifications, CMS
- **Enhances**: 
  - `ai_chatbot_configuration` (advanced AI tuning)
  - Bulk operations (CSV template management)
- **Depends on**: Phase 4, 5, 6 (AI services)

### Phase 10: Hardening & Launch Prep
- **Applies to all**: Performance optimization, accessibility audits, security hardening, production readiness

## Implementation Notes & Recommendations

1. **Shared Layout**: The `propvista_crm` directory likely contains the base layout (header, footer, nav). Verify its contents to establish a shared layout component before implementing individual screens.

2. **Asset Reuse**: The magnifying glass illustration in `a_clean_modern_minimal_flat_line_illustration_of_a_magnifying_glass_over_a` should be extracted as a reusable SVG/icon component.

3. **State Variations**: 
   - The three search results views (standard, fallback, empty) likely share significant UI structure - consider implementing as state variants of a single search results component.
   - Property details view may have variations (standard/premium) based on property type or user role.

4. **State Management**: 
   - Lead pipeline (Kanban) and property inventory (grid) both benefit from robust state management (TanStack Query recommended per 03_coding_standards.md).
   - Consider implementing shared data tables/lists components for reuse.

5. **Accessibility**: All designs should be implemented per WCAG 2.1 AA standards (NFR-U4 per 01_project_rules.md). Pay special attention to:
   - Keyboard navigation in Kanban board drag-and-drop
   - Screen reader labels for property cards and lead status badges
   - Color contrast in status indicators and KPI cards

6. **Responsive Breakpoints**: Designs should be implemented with mobile-first approach (NFR-U1 per 01_project_rules.md). Verify mobile layouts in screen.png files.

7. **API Contract Alignment**: Ensure implementation aligns with api-specification.md endpoints:
   - Property endpoints: GET /properties/, GET /properties/{id}, POST /properties/, etc.
   - Lead endpoints: POST /leads, GET /leads/{id}, PATCH /leads/{id}/stage
   - Search endpoints: POST /search, GET /search/suggest
   - CMS endpoint: GET /cms/homepage (for homepage content)

## Next Steps for User Story Creation

1. **For each design reference above**:
   - Use the `.ai-devos/templates/user-story-template.md`
   - Map the "Purpose" column to the user story description
   - Map the "Related FRs" column to acceptance criteria
   - Use the "Suggested User Story Mapping" as the title/user story format
   - Mark as `[SAMPLE]` until approved for actual backlog

2. **Group related stories into epics/features**:
   - Example Epic: "Lead Management" (US-LEAD-001, US-LEAD-002, US-BULK-001)
   - Example Feature: "AI-Powered Search" (US-SEARCH-001, US-SEARCH-002, US-SEARCH-003, US-HOMEPAGE-001 search component)

3. **Estimate effort** using Planning Poker with team, considering:
   - API dependency readiness (per DoR in 01_project_rules.md)
   - Design complexity (interactivity, state management)
   - Accessibility and responsiveness requirements

4. **Sequence work** per phase dependencies outlined above.

---
*Document generated: 2026-07-21 based on analysis of docs/design/ directory contents*
*To create actual user stories: Use the `/create-user-story` skill with this document as reference*