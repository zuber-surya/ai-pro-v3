# Design Details: PropVista CRM Screens

This document provides detailed information about each UI/UX design reference in the `docs/design/` directory. Each entry includes the screen title (from HTML), purpose, key UI elements, related functional requirements, and implementation notes.

---

## 1. `propvista_crm_homepage`
**Title:** PropVista CRM  
**Purpose:** Main landing page showcasing the AI-first value proposition, enabling visitors to search properties, learn about the service, and express interest without navigating away.  
**Key Elements:**  
- Company branding and navigation (top)  
- Prominent AI-powered search bar (natural language input)  
- Featured properties section (3-6 cards with image, price, beds/baths, location)  
- "How it works" section (search → match → connect process with icons)  
- Customer testimonials (quotes with photos)  
- Chat widget (bottom-right corner)  
- Contact form (name, phone, email, message/callback)  
- Footer (legal, resources, company links)  
**Related FRs:**  
- FR1.1-FR1.7 (Chatbot: welcome, FAQs, lead capture, history, escalation)  
- FR2.1-FR2.8 (Search: natural language, match scores, reasons, auto-suggest, fallback indicator, loading state)  
- FR6.1-FR6.4 (Lead creation: Idempotency-Key, source tracking, validation, duplicate prevention)  
- FR13.1-FR13.7 (AI behavior: visible fallback, tool-only responses, weight renormalization)  
**Notes:**  
- Primary conversion touchpoint for visitor → lead  
- Must leverage CMS content via GET /cms/homepage for banners/sections  
- Featured properties use GET /properties/featured endpoint  
- Implements responsive design for mobile/viewport compatibility  

---

## 2. `search_results_standard_view`
**Title:** [Inferred: Search Results]  
**Purpose:** Displays AI-ranked property results with explainable match scores and reasons when AI search is successful.  
**Key Elements:**  
- Search bar (retained at top) with current query  
-Results grid/list: property cards showing:  
  - Property image  
  - Price, beds/baths, area  
  - Location  
  - Match score as percentage (prominent)  
  - Match reasons (✓/✗ icons for criteria like price, beds, location)  
- Loading state indicator during API call  
- Fallback mode indicator (hidden in standard view)  
- Pagination controls  
**Related FRs:**  
- FR2.1: Natural language search queries  
- FR2.2: Results display match score as percentage  
- FR2.3: Results show match reasons (✓/✗) when available  
- FR2.4: Auto-suggestions as user types  
- FR13.1: AI search failure/timeout falls back to filter-only with visible indicator  
**Notes:**  
- Directly calls POST /search endpoint  
- Match score and reasons come from AI orchestration layer  
- Implements visible fallback mechanism (FR2.6) when AI fails/times out  

---

## 3. `search_results_filter_fallback_view`
**Title:** [Inferred: Search Results - Fallback]  
**Purpose:** Shows traditional filter-based results when AI search fails or times out, with a visible indicator that AI is unavailable.  
**Key Elements:**  
- Search bar (retained at top) with current query  
- Prominent "AI temporarily using filter-only results" banner  
- Results grid/list: property cards showing:  
  - Property image  
  - Price, beds/baths, area  
  - Location  
  - [NO match score or match reasons]  
- Filter chips/applied filters display  
- "Refine search" call-to-action  
**Related FRs:**  
- FR2.6: Search falls back to filter-only with visible indicator if AI fails/timouts  
- FR2.1-FR2.5 (other search aspects still apply)  
**Notes:**  
- Uses same search results UI structure as standard view but without AI-specific elements  
- Fallback mode flag visible in response/UI  
- Maintains auto-suggest and loading states  

---

## 4. `search_results_empty_state`
**Title:** [Inferred: No Results Found]  
**Purpose:** Provides helpful guidance when search returns zero results, encouraging query refinement.  
**Key Elements:**  
- Search bar (retained at top) with current query  
- Illustrative graphic/empty state visual  
- Primary message: "No properties found matching your search"  
- Suggestions:  
  - Try different keywords  
  - Adjust filters (price, beds, location)  
  - Check spelling  
- Secondary call-to-action: "Browse featured properties" or "Save this search"  
- Optional: Recent/popular searches  
**Related FRs:**  
- FR2.1-FR2.6 (all search FRs apply - handles zero results case)  
**Notes:**  
- Important for user experience - prevents dead ends  
- Should appear for both AI and filter-only search paths  
- Maintains search bar state for easy refinement  

---

## 5. `property_details_premium_view`
**Title:** PropVista CRM - Property Details  
**Purpose:** Comprehensive property detail view enabling informed inquiry decisions through rich media and structured information.  
**Key Elements:**  
- Property gallery (carousel/slider of images)  
- Property header:  
  - Title  
  - Price (formatted as currency string)  
  - Beds/Baths/Area badges  
  - Favorite/save button  
- Primary CTA button: "Inquire about this property"  
- Secondary CTA: "Contact agent" or "Schedule tour"  
- Tabs/sections:  
  - Overview: description, highlights, property type  
  - Details: exact beds/baths, year built, parking, amenities list  
  - Floorplan: image or interactive view  
  - Map: property location with neighborhood highlights  
  - Amenities: detailed icons/lists  
  - Price breakdown: base price, taxes, fees (if applicable)  
  - Similar properties carousel  
- Agent contact card (photo, name, phone, email)  
**Related FRs:**  
- FR5.1: Property details load successfully  
- FR5.2: Displays property media (gallery, floorplan)  
- FR5.3: Shows structured property details (specs, amenities)  
- FR5.4: Includes location map and neighborhood info  
- FR5.5: Provides clear CTAs for inquiry/contact  
**Notes:**  
- Data sourced from property service endpoints  
- Implements responsive design for gallery and tabs  
- Accessible media controls (gallery navigation)  
- Price displayed as numeric string (never float) per API conventions  

---

## 6. `customer_account_dashboard`
**Title:** [Inferred: Customer Dashboard]  
**Purpose:** Personalized dashboard for registered customers to manage their property search journey, saved items, and inquiries.  
**Key Elements:**  
- User profile section (name, avatar, role badge)  
- Quick stats cards:  
  - Saved properties count  
  - Active inquiries  
  - Requirement profile completion %  
- Saved properties grid (cards with remove/save actions)  
- Requirement profile editor (wizard-like interface for: budget, property type, bedrooms, location preferences)  
- Recent activity/inquiry timeline  
- Notifications bell (unread indicator)  
- Quick actions: "New search", "Edit profile", "Saved searches"  
**Related FRs:**  
- FR7.1: Customer can save properties for later review  
- FR7.2: Customer can create and manage requirement profile  
- FR7.3: Customer can view inquiry history and status  
- FR8.1-FR8.4 (Admin dashboard metrics - customer sees personalized subset)  
**Notes:**  
- Requires authentication (customer role)  
- Integrates with lead service for inquiry history  
- Personalization based on user's saved items and requirements  
- Implements role-based access control (no admin/agent data visible)  

---

## 7. `lead_pipeline_kanban_view`
**Title:** PropVista CRM - Lead Pipeline  
**Purpose:** Visual Kanban board for agents to manage leads across sales stages with filtering, bulk actions, and WIP limits.  
**Key Elements:**  
- Stage columns: New → Contacted → Site Visit → Negotiation → Closed Won → Closed Lost  
- Lead cards in each column showing:  
  - Lead name/initals  
  - Property interest (if any)  
  - Contact recency  
  - Lead score/temperature indicator  
  - Assigned agent avatar  
- Column headers:  
  - Stage name  
  - WIP limit (e.g., "10/15")  
  - Lead count  
- Controls:  
  - Filter bar (by source, date assigned, agent, tags)  
  - Bulk actions: change stage, assign agent, add tag, export  
  - "+ New Lead" button (opens lead creation form)  
- Drag-and-drop functionality for stage transitions  
**Related FRs:**  
- FR10.1: Lead pipeline visualization (Kanban view)  
- FR10.2: Bulk lead operations (stage change, assignment)  
- FR10.5: Lead filtering and sorting capabilities  
- FR10.3-FR10.4 (Lead detail view - accessed by clicking lead card)  
**Notes:**  
- Implements atomic lead claim via single conditional UPDATE (FR10.2)  
- Stage transitions use PATCH /leads/{id}/stage endpoint  
- WIP limits enforced per FR10.2  
- Supports touch-friendly drag-and-drop for mobile/tablet  

---

## 8. `lead_detail_sarah_jenkins`
**Title:** PropVista CRM - Lead Detail: Sarah Jenkins  
**Purpose:** Detailed view of an individual lead showing contact information, source, communication history, and follow-up tasks.  
**Key Elements:**  
- Lead header:  
  - Name  
  - Current stage badge  
  - Source icon/label (e.g., "Website", "Referral", "Chatbot")  
  - Lead score/temperature  
- Contact information panel:  
  - Phone number (with click-to-call)  
  - Email address  
  - Preferred contact time  
- Property interests section (if any):  
  - Saved property cards/thumbnails  
  - Inquiry history per property  
- Communication timeline:  
  - Inbound/outbound messages (chat, email, call logs)  
  - Timestamps and direction indicators  
  - Attachments/icons for message type  
- Follow-up tasks section:  
  - Due date  
  - Task description  
  - Completion checkbox  
  - Priority indicator  
- Notes field (free-text, timestamped entries)  
- Activity buttons:  
  - "Call lead"  
  - "Send email"  
  - "Schedule visit"  
  - "Change stage"  
  - "Convert to opportunity"  
**Related FRs:**  
- FR10.3: Lead detail view with contact information  
- FR10.4: Lead communication history and notes  
- FR10.1-FR10.2 (Pipeline and bulk ops - context for this view)  
- FR6.1-FR6.4 (Lead creation/source tracking)  
**Notes:**  
- Implements atomic lead claim pattern (FR10.2)  
- Communication history stored in dedicated table/collection  
- Follow-up tasks integrated with jobs/service layer  
- Source tracking via Utm parameters or explicit selection  

---

## 9. `listing_editor_basic_info`
**Title:** PropVista CRM - Edit Property  
**Purpose:** Form for creating or editing core property details ensuring accurate inventory data.  
**Key Elements:**  
- Form fields (organized in sections):  
  - Basic Info:  
    - Property title *  
    - Price * (numeric string input)  
    - Property type dropdown  
    - Bedrooms * (number input)  
    - Bathrooms * (number input)  
    - Area (sq ft/m²) *  
    - Location pin + address search  
    - Year built  
  - Amenities:  
    - Checklist of standard amenities (parking, balcony, garage, etc.)  
    - Custom amenity input (free-text with suggestions)  
  - Description:  
    - Rich text editor for property description  
    - Highlights/bullits editor  
  - Media:  
    - Photo upload (drag-and-drop or browse)  
    - Floorplan upload  
    - Video tour URL  
- Form actions:  
  - "Save as Draft"  
  - "Publish Listing" (primary CTA)  
  - "Cancel"  
- Validation:  
  - Inline field-level validation  
  - Submit button disabled until required fields valid  
  - Success/error toasts  
**Related FRs:**  
- FR9.1: Create and edit property listings with accurate core information  
- FR9.2: Bulk upload validation results (foundation for this form)  
- FR9.3: Property media management  
**Notes:**  
- Implements dependency injection for form services  
- Uses parameterized SQL/ORM for data validation (never string-built)  
- Required fields marked with asterisk (*)  
- Price input validates as numeric string (no commas/currency symbols)  
- Media uploads go through storage service (Supabase)  

---

## 10. `property_inventory_admin_view`
**Title:** PropVista CRM - Property Management  
**Purpose:** Administrative grid/view for managing all property listings with filtering, bulk actions, and sorting capabilities.  
**Key Elements:**  
- Toolbar:  
  - Search bar (search by title, ID, address)  
  - Filter dropdowns: status (draft/published/archived), property type, price range, date listed  
  - Column customization (show/hide fields)  
  - "Export CSV" button  
  - "New Property" button (opens listing editor)  
- Data grid:  
  - Column headers with sort indicators  
  - Row selection checkboxes  
  - Property data columns:  
    - Thumbnail preview  
    - Property title  
    - Price  
    - Beds/Baths  
    - Area  
    - Location (city)  
    - Status badge (draft/published/archived)  
    - Date listed  
    - Views/saves count  
  - Row actions menu (⋮): edit, duplicate, archive, delete  
- Bulk action toolbar (appears when rows selected):  
  - Change status  
  - Change property type  
  - Bulk export  
  - Delete selected  
- Pagination controls  
- Empty state: "No properties match your filters"  
**Related FRs:**  
- FR9.1: Property listing creation and editing  
- FR9.2: View, filter, and manage property inventory  
- FR9.3: Bulk operations foundation  
**Notes:**  
- Implements server-side sorting/filtering/pagination  
- Uses GET /properties/ endpoint with cursor pagination  
- Status badges color-coded (draft=gray, published=green, archived=red)  
- Implements batch notifications for bulk actions (FR9.2)  
- Responsive grid layout (cards on mobile, table on desktop)  

---

## 11. `bulk_upload_validation_results`
**Title:** PropVista CRM - Bulk Upload Results  
**Purpose:** Displays validation results after a bulk property/lead upload attempt, enabling error correction before finalizing.  
**Key Elements:**  
- Summary banner:  
  - Total rows processed  
  - Valid rows count  
  - Error rows count  
  - Warning rows count (if applicable)  
- Tabs:  
  - Summary (overview metrics)  
  - Errors (detailed error list)  
  - Warnings (if any)  
  - Valid rows (preview)  
- Error details table:  
  - Row number  
  - Field/column with error  
  - Error message (specific, actionable)  
  - Original value  
  - Suggested fix (when possible)  
- Actions:  
  - "Download error report" (CSV)  
  - "Fix and re-upload" (opens template with current data)  
  - "Import valid rows only" (primary CTA if valid rows exist)  
  - "Cancel"  
- Valid rows preview:  
  - Limited view of valid property data  
  - Option to select columns to view  
**Related FRs:**  
- FR9.2: Bulk upload validation results screen  
- FR9.1: Property listing creation/editing (foundation)  
- FR9.3: Bulk operations (import/export)  
**Notes:**  
- Validates against property schema and business rules  
- Provides row-level error details for efficient correction  
- Maintains uploaded data in session for re-upload attempts  
- Implements Idempotency-Key for upload sessions  
- Downloadable error report includes original data + error columns  

---

## 12. `ai_chatbot_configuration`
**Title:** PropVista CRM - AI Chatbot Configuration  
**Purpose:** Administrative interface for configuring chatbot behavior without code deployment, enabling rapid adaptation to business needs.  
**Key Elements:**  
- Configuration sections:  
  - Greeting:  
    - Text editor for welcome message  
    - Preview of how greeting appears in chat widget  
  - FAQ Library:  
    - List of FAQ entries (question + answer)  
    - "+ Add FAQ" button  
    - Inline editing for existing FAQs  
    - Categories/tags for FAQ organization  
  - Escalation Rules:  
    - Conditions for human agent transfer (keywords, sentiment, lead score threshold)  
    - Escalation message/tool configuration  
    - Working hours schedule  
  - AI Behavior:  
    - Model selection (Bedrock Claude version)  
    - Temperature/response tone configuration (formal/friendly/professional)  
    - Context window size (how much history to consider)  
- Save/Cancel buttons at bottom  
- Status indicator: "Last saved: [time]"  
- Preview chat window:  
  - Simulates chatbot interaction with current configuration  
  - Allows testing greeting, FAQ responses, escalation  
**Related FRs:**  
- FR13.1: Configure chatbot greeting and fallback behavior  
- FR13.2: Manage chatbot FAQ library  
- FR13.3: Set escalation rules to human agents  
- FR13.4: Adjust AI model and response parameters  
- FR13.5: Preview and test chatbot behavior  
- FR13.6: Working hours configuration for escalation  
**Notes:**  
- Changes take effect immediately without deployment  
- Stores configuration in CMS/content service  
- Uses structured data format (JSON) for FAQs and rules  
- Implements role-based access (admin only)  
- Preview uses actual Bedrock API (with rate limiting safeguards)  

---

## 13. `admin_agent_command_center`
**Title:** PropVista CRM | Admin Dashboard  
**Purpose:** Primary administrative dashboard showing KPIs, trends, and activity feed for monitoring business health at a glance.  
**Key Elements:**  
- Top navigation:  
  - App logo  
  - User profile/menu  
  - Search (global admin search)  
- KPI Cards Row (4 cards):  
  - Active Listings: [number] (↑/↓ trend sparkline)  
  - Active Leads: [number] (↑/↓ trend sparkline)  
  - Conversion Rate: [percentage] (↑/↓ trend sparkline)  
  - Today's Sessions: [number] (↑/↓ trend sparkline)  
- Charts Section:  
  - Lead Source Funnel: pie/donut chart (website, referral, chatbot, etc.)  
  - Property Views Over Time: line graph (last 30 days)  
  - Lead Stage Distribution: bar chart (by pipeline stage)  
- Activity Feed:  
  - Reverse chronological list of:  
    - New leads  
    - Published properties  
    - Stage changes  
    - Inquiries received  
    - System events  
  - Each item: icon, timestamp, brief description  
  - Filter dropdown: by type (lead, property, system)  
  - "View All" link  
- Date range picker (top-right): applies to charts and feed  
- Refresh button (manual)  
**Related FRs:**  
- FR8.1: View key business metrics (listings, leads, conversion rate)  
- FR8.2: Monitor lead source effectiveness  
- FR8.3: Track property views and engagement trends  
- FR8.4: View recent activity and system events  
**Notes:**  
- Data sourced from metrics_service (single source of truth per FR8.1-FR8.4)  
- Implements real-time updates via WebSockets or polling (per NFR-P1)  
- Charts use charting library (Recharts/Victory recommended)  
- Date range affects all charts and activity feed  
- Export CSV functionality for reports  
- Implements role-based access (admin-only view)  

---

## 14. `a_clean_modern_minimal_flat_line_illustration_of_a_magnifying_glass_over_a`  
**Type:** Illustration/Icon Asset  
**Purpose:** Magnifying glass icon used in search bar UI across the application.  
**Key Elements:**  
- Simple line icon:  
  - Circular outline  
  - Handle extending from bottom-right  
  - Minimalist flat design  
- Format: PNG (transparent background)  
- Likely sizes: multiple dimensions for different densities (1x, 2x, 3x)  
**Notes:**  
- Asset-only directory (contains only screen.png, no code.html)  
- Should be extracted as reusable SVG/icon component  
- Used in:  
  - Homepage search bar  
  - Search results page search bar  
  - Customer dashboard search (if applicable)  
  - Property inventory search  
- Follows design system guidelines for icons (stroke weight, corner radius)  

---

## 15. `propvista_crm`  
**Type:** [Likely: App Shell/Layout]  
**Purpose:** Probable application layout container providing consistent header, footer, and navigation structure.  
**Key Elements:** *(To be confirmed upon inspection)*  
- Likely contains:  
  - Header:  
    - Logo/branding  
    - Navigation menu (links to: Home, Search, Dashboard, etc. - role-dependent)  
    - User avatar/menu (for authenticated views)  
    - Chat widget toggle button  
  - Footer:  
    - Legal links (privacy, terms)  
    - Resource links (blog, support)  
    - Company links (about, careers, contact)  
    - Social media icons  
- Possible:  
  - Main content outlet (where screen-specific content renders)  
  - Loading/spinner overlay  
  - Error boundary/message container  
**Notes:**  
- Directory name suggests base layout component  
- Critical for maintaining consistent UI across all screens  
- Should be verified to confirm if it contains shared layout code  
- If confirmed:  
  - Implement as React layout component  
  - Use React Router for nested routes  
  - Apply global CSS/theme variables  
- If not a layout: requires further investigation to determine purpose  

---

## Implementation Guidelines

### Shared Patterns Across Screens
1. **Search Bar**: Consistent appearance and behavior (placeholder, loading state, auto-suggest)  
2. **Property Cards**: Reusable component showing image, price, beds/baths, location  
3. **Status Badges**: Consistent color-coding (green=active/published, yellow=pending, red=archived/error)  
4. **Loading States**: Skeleton skeletons or spinners for asynchronous data  
5. **Error Handling**: Inline field-level validation + global error toasts  
6. **Accessibility**:  
   - ARIA labels for interactive elements  
   - Keyboard navigation (especially Kanban drag-and-drop)  
   - Screen reader labels for charts and data grids  
   - Sufficient color contrast (WCAG 2.1 AA)  
7. **Responsiveness**:  
   - Mobile-first breakpoints  
   - Touch-friendly controls (minimum 48x48px tap targets)  
   - Collapsible sections/sidebars on narrow viewports  

### API Endpoint Alignment
- **Property Endpoints**: GET /properties/, GET /properties/{id}, POST /properties/, PATCH /properties/{id}  
- **Lead Endpoints**: POST /leads, GET /leads/{id}, PATCH /leads/{id}, PATCH /leads/{id}/stage  
- **Search Endpoints**: POST /search, GET /search/suggest  
- **Chatbot Endpoints**: POST /chat/messages (with SSE streaming)  
- **CMS Endpoint**: GET /cms/homepage (for homepage content)  
- **Metrics Endpoints**: GET /metrics/dashboard (for admin command center)  

### Development Phases Reference
See `design-references-catalog.md` for detailed phase mapping (0-10) and dependencies.

---
*File generated: 2026-07-21 based on analysis of docs/design/ directory contents*  
*For creating user stories: Reference this document and use the `/create-user-story` skill*