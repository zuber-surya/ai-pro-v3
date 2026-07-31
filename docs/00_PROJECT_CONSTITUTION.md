# Property AI Studio — Project Constitution

> **Document Status:** Governing Constitution (Permanent Source of Truth for Engineering Process)  
> **Version:** 1.0.0  
> **Effective Date:** 2026-07-30  
> **Audience:** AI coding assistants (Claude Code, ChatGPT, Cursor, Codex, Gemini, Windsurf, and equivalents) and all software developers  
> **Authority:** Binding. Every future prompt, pull request, design decision, and implementation must comply with this document.

---

## Document Control

| Field | Value |
|-------|--------|
| Product Name | Property AI Studio (UI brand: PropVista CRM) |
| Document Type | Project Constitution / Engineering Operating System |
| Functional SOT | `docs/REQUIREMENTS_AND_PROPOSAL.md` |
| UI SOT | `docs/design_reference/**` (HTML + screenshots) |
| Change Control | Amendments require Product Owner + Technical Lead approval; version bump required |
| Precedence | See §3 Sources of Truth |

**How to use this document**

1. Read this Constitution before any Epic, Feature, or code change.
2. Resolve conflicts using the precedence rules in §3.
3. Do not invent UI, features, or stack substitutions.
4. Treat every checklist in §§14–17 as gates, not guidelines.

---

## 1. Project Vision

Property AI Studio is an AI-powered real estate platform for buyers, sellers, agents, and administrators. It unifies property discovery, listing management, CRM lead handling, role-based dashboards, AI-assisted search and chat, loan analysis, notifications, and administration into a single-organization web product.

**Core differentiation:** Google Gemini–powered natural language property search and conversational assistance, with explainable match results and admin-configurable AI behavior.

**Engineering mission:** Deliver a production system that is **functionally faithful** to `REQUIREMENTS_AND_PROPOSAL.md` and **visually indistinguishable** from the HTML design references—without redesign, reinterpretation, or unsolicited “improvements.”

**Success for MVP means:**

- Guests and customers can discover properties via filters and Gemini NLP search.
- Customers can manage favorites, inquiries, profile, and loan analysis within designed screens.
- Agents and Admins can manage properties, leads, users/agents, CMS, reports, and AI configuration as specified for MVP.
- The UI matches `design_reference` HTML and screenshots for every in-scope screen.
- Backend APIs are real (no leftover mocks), secure, typed, and role-aware.
- Quality gates (lint, TypeScript, tests, QA, review) pass before merge.

---

## 2. Guiding Principles

These principles govern every decision. When two options seem equal, choose the one that better satisfies this list—in order.

1. **Fidelity over creativity** — Match the HTML. Do not redesign.
2. **Requirements over assumptions** — Implement defined scope; do not invent features.
3. **HTML wins UI conflicts** — Layout, visual, and interaction disputes resolve to HTML.
4. **Requirements win functional conflicts** — Business rules, roles, and workflows resolve to requirements (except where HTML exposes additional UI behavior that must still be implemented).
5. **MVP honesty** — Explicitly out-of-scope items must not ship, even if HTML exists for them.
6. **Clean Architecture** — Domain and application logic stay outside UI components.
7. **SOLID, DRY, KISS, YAGNI** — Prefer simple, reusable, necessary code.
8. **Single source of API truth** — One centralized API layer; no ad-hoc fetches in components.
9. **Strict TypeScript** — No `any` escapes without documented justification and review approval.
10. **Replace mocks** — Temporary mocks are allowed only until backend readiness; then remove completely.
11. **Role-based access only** — Single organization; five roles; no module-level permission matrix.
12. **Gemini only** — No alternate LLM providers in MVP or configuration.
13. **Process integrity** — Epic → … → Approval → Merge. No skipped stages.
14. **Internal quality welcome; visual change forbidden** — Refactor freely; never alter designed UI.

---

## 3. Sources of Truth

### 3.1 Authoritative Inputs

| Concern | Authoritative Source | Path |
|---------|----------------------|------|
| Features, business rules, roles, scope, modules, workflows | Functional SOT | `docs/REQUIREMENTS_AND_PROPOSAL.md` |
| Layout, typography, colors, icons, images, animations, hover/active states, responsive behavior, loading/empty/error states | UI SOT | `docs/design_reference/` (per-screen `code.html` + screenshots) |
| Design inventory & screen mapping | Supporting (non-overriding) | `docs/design_reference/design-references-catalog.md`, `design-details.md`, `propvista_crm/DESIGN.md` |
| Engineering process, stack, DoD, non-negotiables | This Constitution | `docs/00_PROJECT_CONSTITUTION.md` |

No other document, chat message, or prior prototype may override these without a formal Constitution amendment.

### 3.2 Conflict Resolution (Mandatory)

| Conflict Type | Winner | Rule |
|---------------|--------|------|
| HTML visual/interaction vs Requirements description of UI | **HTML** | HTML ALWAYS WINS for UI. |
| HTML visual/interaction vs any developer or AI preference | **HTML** | No redesign. No “improvement.” |
| Functional behavior described in Requirements vs informal assumption | **Requirements** | |
| Behavior present in HTML but absent from Requirements | **Include the behavior** | Implement the interaction/state as shown in HTML, unless the feature is listed as **Out of MVP** in this Constitution. |
| HTML screen exists for an Out-of-MVP feature | **MVP exclusion wins** | Do not implement Out-of-MVP screens/features in the production MVP path. Keep reference HTML for later phases only. |
| Tech stack in older docs vs this Constitution | **This Constitution** | Stack in §5 is binding. |
| Temporary mock vs real API availability | **Real API** | Mocks must be removed when backend is ready. |

### 3.3 UI Fidelity Mandate

The generated application must visually match the HTML for:

- Layout and spacing  
- Typography (families, sizes, weights, line heights, letter spacing)  
- Colors and surfaces (including tokens from design references)  
- Icons and imagery  
- Animations and transitions  
- Hover effects and active/focus states  
- Responsive breakpoints and behavior  
- Loading states  
- Empty states  
- Error states  

**No redesign. No UI improvements. No creative interpretation.**  
The final UI must be **visually indistinguishable** from the HTML.

### 3.4 Design Reference Inventory (UI SOT Screens)

Implementers must treat the following directories under `docs/design_reference/` as the screen-level UI SOT (each with `code.html` and/or screenshot as provided):

| Directory | Screen Intent |
|-----------|---------------|
| `propvista_crm_homepage` | Public homepage / AI search landing |
| `search_results_standard_view` | AI search results with match scores/reasons |
| `search_results_filter_fallback_view` | Filter-only fallback when AI unavailable |
| `search_results_empty_state` | Zero-results guidance |
| `property_details_premium_view` | Property detail (gallery, map, CTAs) |
| `customer_account_dashboard` | Customer portal dashboard |
| `lead_pipeline_kanban_view` | Lead Kanban (**Out of MVP** — reference only until post-MVP) |
| `lead_detail_sarah_jenkins` | Lead detail |
| `listing_editor_basic_info` | Listing create/edit |
| `property_inventory_admin_view` | Property inventory admin |
| `bulk_upload_validation_results` | Bulk upload validation results |
| `ai_chatbot_configuration` | Admin AI chatbot configuration |
| `admin_agent_command_center` | Admin/agent command center dashboard |
| `propvista_crm` | Shared design tokens / shell guidance (`DESIGN.md`) |

Supporting assets (illustrations, icons) in design_reference must be reused as specified by HTML—do not substitute generic icons when the reference provides a specific asset.

---

## 4. Architecture Principles

### 4.1 Clean Architecture

Layers (dependency direction: inward only):

```
UI (Next.js pages/components)
    ↓
Application / Use-cases (hooks, orchestrators, services on client)
    ↓
API Client (centralized)
    ↓
Backend Transport (HTTP)
    ↓
API Controllers (Express routes)
    ↓
Application Services (backend)
    ↓
Domain / Business Rules
    ↓
Persistence (Prisma → PostgreSQL)
```

**Rules:**

- UI components render and dispatch; they do not own business rules.
- Domain validation and authorization live in backend services (and shared types/contracts where appropriate).
- Infrastructure (DB, Gemini, email, filesystem) is isolated behind interfaces/adapters.
- No circular dependencies between feature modules.

### 4.2 SOLID

- **S** — One reason to change per module/class/function.
- **O** — Extend via composition/new modules; avoid editing core contracts for every feature.
- **L** — Substitutable implementations (e.g., storage adapters) must honor contracts.
- **I** — Prefer narrow service interfaces over god-objects.
- **D** — Depend on abstractions (API contracts, repository interfaces), not concrete UI or DB details.

### 4.3 DRY / KISS / YAGNI

- **DRY:** Shared UI primitives, hooks, mappers, validators, and API clients—no copy-paste endpoints or duplicated role checks.
- **KISS:** Prefer straightforward feature folders and explicit code over clever abstractions.
- **YAGNI:** Do not build Out-of-MVP systems (Kanban engine, SMS, push, virtual tours, etc.).

### 4.4 Feature-Based Organization

Code is organized by **feature/domain**, not by technical type alone. Cross-cutting utilities live in shared folders. See §10.

### 4.5 Reuse Mandate

Mandatory reuse layers:

- Reusable UI components (buttons, inputs, modals, tables, states, loaders) matching HTML primitives  
- Reusable hooks (auth, queries, mutations, pagination, form state)  
- Reusable services (API modules, mappers, validators)  
- Centralized API layer  

Duplicated fetch logic, duplicated role gates, or one-off styled controls that already exist in the design system are **defects**.

### 4.6 Separation of Concerns

| Layer | Allowed | Forbidden |
|-------|---------|-----------|
| UI Component | Presentation, local UI state, calling hooks | Business rules, direct DB, raw Gemini calls, ad-hoc `fetch` |
| Hook | Orchestration, caching, mapping to view models | JSX markup, Prisma, Express specifics |
| Backend Route | Parse/validate request, call service, map response | Fat business logic inline |
| Service | Business rules, authorization checks, orchestration | HTTP/transport details, React |
| Prisma Repository/Data | Persistence queries | Business policy beyond data integrity |

---

## 5. Technology Stack

The stack below is **mandatory**. Substitutions require Constitution amendment.

### 5.1 Frontend

| Item | Technology |
|------|------------|
| Framework | Next.js 15 (App Router) |
| UI Library | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Maps | Leaflet + OpenStreetMap |
| Deployment target | Vercel |

### 5.2 Backend

| Item | Technology |
|------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript (preferred) or JS only if explicitly approved—default **TypeScript** |
| ORM | Prisma |
| Database | PostgreSQL |

### 5.3 Cross-Cutting

| Item | Technology / Policy |
|------|---------------------|
| AI | **Google Gemini ONLY** (`@google/genai` or official Google Gemini SDK) |
| Authentication | Email + Password |
| Notifications (MVP) | Email + In-App |
| File storage (development) | Local filesystem |
| File storage (production) | As defined in deployment docs later; must not change UI contracts |

### 5.4 Explicitly Forbidden (MVP)

- Alternate LLM providers (OpenAI, Anthropic Bedrock as product AI, etc.) as the AI engine  
- SMS, WhatsApp, Push notification channels  
- Non-Leaflet map stacks for primary map UX (unless HTML already specifies otherwise—HTML still wins for presentation)  
- Module-level permission engines beyond role checks  
- Multi-tenant / multi-organization architecture  

### 5.5 Historical Note

Older planning documents may mention FastAPI, SQLAlchemy, Alembic, or Vite prototypes. Those are **non-binding** relative to this Constitution. Implementation must follow §5.

---

## 6. Coding Standards

### 6.1 TypeScript

- `strict` mode enabled.
- No implicit `any`. Avoid `any`; if unavoidable, isolate with a typed boundary and a code-review note.
- Prefer `unknown` + narrowing over `any`.
- Export domain types from shared contracts; keep frontend/backend DTO alignment explicit.
- Prefer discriminated unions for UI states: `idle | loading | success | empty | error`.

### 6.2 Naming

| Kind | Convention |
|------|------------|
| React components | `PascalCase` |
| Hooks | `useCamelCase` |
| Functions / variables | `camelCase` |
| Types / Interfaces | `PascalCase` |
| Constants | `UPPER_SNAKE` or `as const` objects |
| Prisma models | `PascalCase` model names; `snake_case` DB columns if project convention dictates—be consistent |
| Files | Match primary export; feature-scoped |

### 6.3 React / Next.js

- Server Components by default where appropriate; Client Components only when interactivity/state requires it.
- No business logic in JSX beyond trivial conditional rendering.
- Prefer feature hooks for data loading and mutations.
- Do not introduce visual libraries that alter the designed look (e.g., swapping icon sets).
- Match HTML structure closely enough that screenshot comparison is meaningful.

### 6.4 Tailwind

- Utility classes must reproduce HTML/reference styling.
- Extract repeated class clusters into components—not into a parallel unofficial design system that diverges from HTML.
- Design tokens from `design_reference` (e.g., colors in `DESIGN.md`) must be reflected in Tailwind theme configuration where practical.
- Do not “normalize” or restyle to a generic AI aesthetic.

### 6.5 Error Handling

- User-facing errors must match designed error states when HTML provides them.
- API errors use consistent envelope (§9).
- Never swallow errors silently.
- Log server errors with correlation IDs; do not leak secrets or stack traces to clients in production.

### 6.6 Comments & Complexity

- Comment **why**, not what.
- No commented-out dead code in main.
- Prefer small pure functions for mappers and validators.

### 6.7 Allowed Internal Improvements

Allowed without Product Owner UI approval:

- Refactors for clarity, performance, or DRY  
- Test coverage  
- Typing improvements  
- Accessibility attributes that do not change visual design  
- Security hardening  

**Not allowed:** spacing tweaks, color changes, alternate layouts, “cleaner” cards, new animations, icon substitutions, copy rewrites unless Requirements/HTML demand them.

---

## 7. UI Development Rules

### 7.1 Absolute Rules

1. Open the relevant `docs/design_reference/<screen>/code.html` before implementing a screen.
2. Compare against the screenshot for that screen throughout development.
3. Implement all interactive states shown or reasonably implied by the HTML (hover, active, focus, disabled, loading, empty, error).
4. Do not skip empty/loading/error states.
5. Do not ship a “temporary ugly” UI intending to fix later—fidelity is part of Done.
6. Responsive behavior in HTML/screenshots is mandatory.
7. Icons/images must match references (asset reuse).
8. Chat widget, search bar, and admin shells must match HTML placement and behavior for in-scope screens.

### 7.2 Screen Completion Policy

A screen is **COMPLETE** only when **all** are true:

- [ ] Pixel-perfect match with HTML  
- [ ] Screenshot comparison passed  
- [ ] Responsive verified (mobile, tablet, desktop as applicable)  
- [ ] All interactions implemented  
- [ ] Validation implemented  
- [ ] Loading states implemented  
- [ ] Empty states implemented  
- [ ] Error states implemented  
- [ ] API integrated (real API, or temporary mock with tracked replacement ticket)  
- [ ] No console errors  
- [ ] No TypeScript errors  
- [ ] No ESLint warnings  
- [ ] Code reviewed  
- [ ] QA approved  

Only then may development proceed to the next screen/feature slice.

### 7.3 Out-of-MVP UI References

If HTML exists for Out-of-MVP features (e.g., Kanban pipeline), developers and AI assistants must:

- Not implement them in MVP branches as product features.  
- Not partially ship misleading navigation to unfinished Out-of-MVP screens.  
- Preserve references for post-MVP epics.

### 7.4 Accessibility Baseline

Without changing visual design:

- Semantic HTML elements where compatible with the reference structure  
- Label associations for inputs  
- Keyboard focus visibility consistent with design  
- Alt text for meaningful images  
- Sufficient contrast as provided by design tokens  

Accessibility fixes that require visual change need Product Owner confirmation against HTML.

### 7.5 Implementation Workflow for a Screen

1. Locate HTML + screenshot in `docs/design_reference`.  
2. Inventory sections, components, and states from HTML.  
3. Map each interactive element to an API/hook requirement.  
4. Confirm the screen is not Out-of-MVP.  
5. Implement layout structure to match HTML hierarchy closely.  
6. Apply tokens/Tailwind to match colors/type/spacing.  
7. Wire loading → empty → error → success states.  
8. Integrate API (mock only if blocked).  
9. Perform UI Verification Checklist (§17).  
10. Attach comparison evidence to PR.  

### 7.6 Screenshot Comparison Method

- Capture the running app at the same viewport width as the reference screenshot when possible.  
- Compare header, primary CTA, cards, spacing rhythm, and typography first—these catch most drift.  
- Fail the comparison if a reviewer can tell which image is “the mock” without reading labels.  
- Cosmetic anti-aliasing differences are acceptable; layout, color, icon, and content-structure differences are not.

### 7.7 Shared Shell Consistency

Header, footer, admin sidebar, and chat widget must remain consistent across screens as specified by HTML. Do not invent per-page shell variants unless the HTML for that page shows a variant.

---

## 8. Backend Development Rules

### 8.1 Structure

Express backend must follow layered Clean Architecture:

- `routes` / controllers — HTTP only  
- `services` — business logic  
- `repositories` or Prisma data access modules — persistence  
- `middleware` — auth, validation, error handling, logging  
- `validators` — request schema validation  
- `integrations` — Gemini, email, storage  

### 8.2 Prisma / PostgreSQL

- All schema changes via Prisma migrations.  
- No manual production schema drift.  
- Seed data allowed for local/demo; never rely on UI hardcoding as the source of inventory.  
- Soft deletes where Requirements imply retention; otherwise follow explicit models.

### 8.3 AuthN / AuthZ

- Email + password registration and login.  
- Passwords hashed with a modern algorithm (e.g., bcrypt/argon2)—never plaintext.  
- Session strategy: secure token-based auth suitable for Next.js + Express (access + refresh recommended).  
- Every protected route checks authentication.  
- Authorization is **role-based only** (§ roles below).  
- Super Admin and Admin capabilities must be enforced server-side—never UI-only hiding.

### 8.4 Roles (Binding)

Single organization. Roles:

| Role | Intent |
|------|--------|
| Guest | Unauthenticated; public browse/register limited surfaces |
| Customer | Authenticated seeker: search, favorites, inquiries, chat, loan analysis, profile |
| Agent | Own/assigned properties, leads, tasks/tours as in MVP scope |
| Admin | Org-level users, CMS, reports, AI config, settings |
| Super Admin | Full system configuration, audit, all data |

**No module-level permissions.** Capability is derived from role alone.

### 8.5 Notifications

MVP channels only:

- Email  
- In-App  

Do not implement SMS, WhatsApp, or Push.

### 8.6 Storage

- Development: local storage on disk.  
- Upload endpoints must validate type/size.  
- Paths returned to clients must be stable for UI consumption.

### 8.7 AI Backend

- Gemini only.  
- Prompt configuration readable from Admin-configured settings (persisted).  
- Features: AI Search, AI Chat, Loan Analysis.  
- On AI failure/timeout for search: fall back to filter-only results with **visible** fallback indicator per HTML/requirements.

---

## 9. API Standards

### 9.1 General

- Versioned prefix recommended: `/api/v1/...`.  
- JSON request/response.  
- Consistent error shape.  
- Idempotency for lead creation where Requirements specify.  
- Pagination, sorting, and filtering conventions documented per resource.

### 9.2 Suggested Error Envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  }
}
```

Use appropriate HTTP status codes: `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`.

### 9.3 Auth

- Authenticated endpoints require valid credentials/token.  
- `401` unauthenticated; `403` authenticated but wrong role.

### 9.4 Validation

- Validate all inputs server-side.  
- Mirror client validation rules where HTML/requirements define them.  
- Never trust client-only checks.

### 9.5 AI Endpoints (Minimum)

| Endpoint Purpose | Notes |
|------------------|-------|
| AI property search | Gemini NLP → ranked results + scores/reasons when available |
| AI chat | Conversational assistant; admin-configurable prompts/behavior |
| Loan analysis | Mortgage/affordability analysis via Gemini (+ safe fallbacks if defined) |
| Health | Liveness/readiness for ops |

Exact paths must be documented in API specs derived from Requirements; Constitution requires these capabilities exist and remain Gemini-backed.

---

## 10. Folder Organization Rules

### 10.1 Monorepo Expectations (Logical)

```
/
  docs/                          # Constitution, requirements, design_reference
  frontend/                      # Next.js 15 app
  backend/                       # Express + Prisma
```

Exact repo layout may vary slightly, but feature boundaries must remain clear.

### 10.2 Frontend (Feature-Based)

Recommended pattern:

```
frontend/src/
  app/                           # Next.js App Router routes only
  features/
    auth/
    properties/
    search/
    leads/
    admin/
    ai/
    customer/
    cms/
    notifications/
  components/                    # Truly shared presentational primitives
  hooks/                         # Shared hooks
  lib/
    api/                         # Centralized API client + resource modules
    auth/
    mappers/
  types/
  styles/
```

**Rules:**

- Route files stay thin.  
- Feature UI + feature hooks live under `features/<name>`.  
- No cross-feature deep imports that create cycles; export public API per feature if needed.

### 10.3 Backend

Recommended pattern:

```
backend/src/
  app.ts / server.ts
  routes/
  middleware/
  services/
  repositories/
  validators/
  integrations/
    gemini/
    email/
    storage/
  prisma/
  types/
  utils/
```

### 10.4 Design Reference Isolation

`docs/design_reference/` is **read-only SOT** for implementers. Do not “fix” HTML to match a divergent implementation; fix the implementation instead—unless Product Owner issues a formal design amendment and updates HTML + screenshots together.

---

## 11. Git Workflow

### 11.1 Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready; protected |
| `develop` (optional) | Integration branch if team uses GitFlow-style |
| `feature/<epic>-<short-name>` | Feature work |
| `fix/<issue>-<short-name>` | Bug fixes |
| `chore/<short-name>` | Tooling, deps, non-product |

### 11.2 Commits

- Atomic, purposeful commits.  
- Message focuses on **why**.  
- Do not commit secrets (`.env`, keys, dumps).  
- Do not commit leftover mock servers once real APIs land.

### 11.3 Pull Requests

- One feature/fix per PR when practical.  
- Must link Epic/Feature ID.  
- Must include UI verification evidence for UI changes (screenshots before/after vs reference).  
- Must pass CI (lint, typecheck, tests).  
- Requires code review approval + QA approval for user-facing changes.

### 11.4 Merge Policy

Merge only when Definition of Done (§14) is satisfied.  
No “merge now, fix UI later” for fidelity gaps.

---

## 12. Development Lifecycle

Every feature **MUST** follow this order. **Nothing may skip this process.**

```
Epic
  ↓
Feature
  ↓
Technical Design
  ↓
Database
  ↓
Backend APIs
  ↓
Mock API (temporary if backend not ready)
  ↓
Frontend
  ↓
Real API Integration
  ↓
Testing
  ↓
UI Verification
  ↓
Bug Fix
  ↓
Approval
  ↓
Merge
```

### 12.1 Stage Definitions

| Stage | Exit Criteria |
|-------|---------------|
| Epic | Business outcome, in/out scope, roles impacted |
| Feature | User stories, acceptance criteria, linked HTML screens |
| Technical Design | API contracts, data model changes, sequence diagrams as needed, risks |
| Database | Prisma schema + migration reviewed |
| Backend APIs | Endpoints implemented, validated, role-checked, documented |
| Mock API | Only if backend blocked; contract-compatible; tracked for removal |
| Frontend | HTML-faithful UI wired to hooks/API client |
| Real API Integration | Mocks removed; real responses mapped; error paths verified |
| Testing | Unit/integration/UI checks per §22 |
| UI Verification | Screenshot + responsive + states checklist §17 |
| Bug Fix | Defects closed or waived in writing by PO |
| Approval | Code review + QA |
| Merge | Protected branch policies satisfied |

### 12.2 AI Assistant Obligations

AI coding assistants must not jump to Frontend before Technical Design and API contracts exist for the feature—except when explicitly fixing pure presentational bugs against HTML with no API impact.

### 12.3 Epic Template (Minimum Fields)

- Epic ID / name  
- Business outcome  
- In-scope features  
- Explicit out-of-scope (including MVP exclusions)  
- Roles impacted  
- Design references  
- Success metrics  
- Dependencies and risks  

### 12.4 Feature Template (Minimum Fields)

- Feature ID / parent Epic  
- User story statement(s)  
- Acceptance criteria (testable)  
- HTML paths  
- API endpoints touched  
- Data model impact  
- Mock necessity (yes/no + removal ticket)  
- Test notes  
- UI verification owner  

### 12.5 Technical Design Template (Minimum Fields)

- Overview & constraints  
- Sequence diagrams for multi-step flows (search, chat, lead capture)  
- Prisma model changes  
- Endpoint contracts (request/response examples)  
- AuthZ matrix by role for new endpoints  
- Error cases  
- Observability (logs/metrics)  
- Rollout / migration plan  
- Open questions (must be zero before Ready)

### 12.6 Parallelization Rules

- Frontend may proceed on mocks **only after** contracts are approved.  
- Database and Backend APIs may proceed in parallel after Technical Design approval.  
- UI Verification cannot start before Frontend claims visual completion.  
- Merge cannot occur before Real API Integration for that feature’s completed scope.

---

## 13. Definition of Ready

A Feature/Story is **Ready** for implementation only if:

- [ ] Epic linkage exists  
- [ ] Scope is in MVP (or explicitly approved post-MVP)  
- [ ] Acceptance criteria are testable  
- [ ] Roles affected are identified  
- [ ] UI references identified (`design_reference/...`) **or** justified as non-visual/API-only  
- [ ] Out-of-scope items explicitly listed  
- [ ] API contract draft exists (or reuse of existing contract confirmed)  
- [ ] Data model impact assessed  
- [ ] Dependencies (auth, properties, Gemini, etc.) identified  
- [ ] Test notes drafted  
- [ ] No open blocking questions to Product Owner  

If Ready is false, do not start coding.

---

## 14. Definition of Done

A task/feature is **Done** only if **all** apply:

- [ ] HTML matches exactly (for UI work)  
- [ ] Screenshot matches exactly (for UI work)  
- [ ] Responsive verified  
- [ ] Accessibility basics implemented  
- [ ] Real API integrated (no remaining mocks for the feature)  
- [ ] No console errors  
- [ ] No lint errors  
- [ ] No TypeScript errors  
- [ ] Code reviewed  
- [ ] QA approved  

Partial completion is **not Done**.

---

## 15. QA Checklist

QA must verify:

### Functional

- [ ] Acceptance criteria pass for the feature  
- [ ] Role-based access: Guest / Customer / Agent / Admin / Super Admin behave as specified  
- [ ] Business rules from Requirements enforced  
- [ ] Out-of-MVP features are absent from product navigation/flows  

### UI / UX

- [ ] Side-by-side HTML vs app comparison  
- [ ] Screenshot comparison  
- [ ] Hover/active/focus states  
- [ ] Loading / empty / error states  
- [ ] Responsive layouts  

### API / Data

- [ ] Real API used  
- [ ] Validation messages correct  
- [ ] Persistence correct after reload  
- [ ] Error codes handled in UI  

### Quality

- [ ] No console errors  
- [ ] No broken images/icons  
- [ ] No obvious performance regressions on critical flows  
- [ ] Email + in-app notifications (where applicable)  

### AI

- [ ] Gemini-powered search/chat/loan analysis behave per Requirements  
- [ ] Fallback UI visible when AI search fails  
- [ ] Admin prompt/config changes affect AI behavior without redeploy (where designed)  

---

## 16. Code Review Checklist

Reviewers must confirm:

### Correctness & Scope

- [ ] Implements Ready acceptance criteria only  
- [ ] No Out-of-MVP scope creep  
- [ ] No UI redesign or “polish” diverging from HTML  

### Architecture

- [ ] Business logic not in UI components  
- [ ] Centralized API client used  
- [ ] Feature-based placement correct  
- [ ] DRY/KISS/YAGNI respected  

### Security

- [ ] AuthN/AuthZ on new endpoints  
- [ ] Role checks server-side  
- [ ] Input validation  
- [ ] No secrets in code  
- [ ] No sensitive data in logs/client errors  

### Quality

- [ ] Strict TypeScript  
- [ ] Lint clean  
- [ ] Tests added/updated appropriately  
- [ ] Mocks removed or explicitly temporary with tracking  

### UI (if applicable)

- [ ] Evidence of HTML/screenshot comparison attached  
- [ ] States covered  

---

## 17. UI Verification Checklist

For every screen touched:

- [ ] `code.html` opened and used as primary reference  
- [ ] Screenshot compared at desktop  
- [ ] Mobile (and tablet if relevant) verified  
- [ ] Typography matches  
- [ ] Colors/surfaces match  
- [ ] Spacing/layout match  
- [ ] Icons/images match  
- [ ] Animations/transitions match  
- [ ] Hover states match  
- [ ] Active/selected states match  
- [ ] Loading state matches  
- [ ] Empty state matches  
- [ ] Error state matches  
- [ ] Forms validation UX matches  
- [ ] Map rendering matches (Leaflet/OSM) where applicable  
- [ ] No console errors during walkthrough  

**Fail any item ⇒ screen incomplete.**

---

## 18. API Integration Rules

### 18.1 Centralized Client

- All HTTP calls go through `lib/api` (or equivalent centralized module).  
- Components call hooks; hooks call API modules.  
- No scattered `fetch`/`axios` instances with divergent auth headers.

### 18.2 Mock Policy

- If backend is unavailable, temporary Mock APIs may be created.  
- Mocks must honor the **same contract** as the future real API.  
- Each mock must be tracked (ticket/checklist item): **Replace mock**.  
- Once backend is ready, Mock APIs **MUST** be replaced.  
- **No mock implementation may remain** in merged MVP code for completed features.

### 18.3 Mapping

- Keep API DTO → View Model mappers pure and tested.  
- Do not reshape UI to match convenient API shapes; adapt mappers to preserve HTML.

### 18.4 Resilience

- Timeouts for AI endpoints.  
- Explicit fallback mode for AI search.  
- Retry only when safe/idempotent.

---

## 19. Security Rules

1. Email/password auth only for MVP identity (no social login unless Requirements + HTML demand and PO amends).  
2. Hash passwords; never store plaintext.  
3. Protect tokens; use secure cookie or storage strategy appropriate to XSS risk; prefer httpOnly cookies when architecture allows.  
4. Enforce role checks on server.  
5. Validate/sanitize all inputs.  
6. Parameterized queries only (Prisma).  
7. CORS allowlist for known frontends.  
8. Rate-limit auth and AI endpoints.  
9. Do not expose Gemini API keys to the browser.  
10. Do not commit `.env` or credentials.  
11. Least privilege DB users in deployed environments.  
12. Audit Super Admin actions where Requirements specify.  
13. Upload scanning/validation for type and size.  
14. OWASP ASVS-inspired basics for MVP: injection, auth, XSS, CSRF strategy for cookie auth.

---

## 20. Performance Rules

1. Target: average page load **&lt; 2 seconds** on reference broadband for primary routes (MVP success criterion).  
2. Avoid unnecessary client bundles; use Next.js code splitting.  
3. Image optimization without changing designed crops/aspect where HTML defines them.  
4. Paginate list endpoints; do not load unbounded inventories.  
5. Cache public read-mostly data thoughtfully; invalidate on admin writes.  
6. AI calls must not block unrelated UI chrome; show designed loading states.  
7. Database indexes for common filters (price, location, status, role queries).  
8. No N+1 Prisma queries in list endpoints—use `include`/`select` deliberately.  
9. Leaflet maps: load only on pages that need maps.  
10. Lighthouse/performance budgets may be added in CI later; do not trade fidelity for vanity scores.

---

## 21. Documentation Standards

### 21.1 Required Living Docs

| Document | Purpose |
|----------|---------|
| `docs/00_PROJECT_CONSTITUTION.md` | Process & non-negotiables (this file) |
| `docs/REQUIREMENTS_AND_PROPOSAL.md` | Functional SOT |
| `docs/design_reference/**` | UI SOT |
| API specification (derived) | Endpoint contracts |
| Prisma schema | Data model SOT for persistence |
| README (frontend/backend) | Runbooks for local development |

### 21.2 Feature Documentation

Each Feature’s Technical Design must include:

- Problem statement  
- In/out of scope  
- Role impacts  
- HTML screen links  
- Data model changes  
- API contracts  
- Sequence for AI flows if applicable  
- Test plan  
- Mock removal plan if any  

### 21.3 AI Assistant Prompts

All significant AI coding prompts should reference:

1. This Constitution  
2. Relevant Requirements sections  
3. Exact `design_reference` paths  

Prompts that ask to “improve the UI” or “use a different LLM” are **invalid** under this Constitution.

---

## 22. Testing Standards

### 22.1 Levels

| Level | Responsibility |
|-------|----------------|
| Unit | Domain services, mappers, validators |
| Integration | API + DB (Prisma) |
| Component | Critical UI states (loading/empty/error) without claiming pixel proof |
| E2E (as introduced) | Critical user journeys: auth, search, inquiry, admin property CRUD |

### 22.2 Minimum Expectations for Done

- New business logic has unit tests.  
- New endpoints have integration tests for happy path + auth failure + validation failure.  
- UI changes include manual UI Verification Checklist completion (automated visual regression encouraged when available).  
- AI features tested with mocked Gemini at unit/integration boundaries **and** a recorded manual/Gemini sandbox check for release candidates.

### 22.3 Quality Gates

Before merge:

- Typecheck passes  
- ESLint passes (no warnings policy as stated in Screen Completion)  
- Test suite passes  
- No console errors in verified flows  

---

## 23. AI Development Rules

### 23.1 Provider

- **Only Google Gemini.**  
- No provider abstraction that enables silent switching in MVP.  
- No client-side Gemini secret usage.

### 23.2 Product AI Features (MVP)

1. **AI Search** — Natural language → property matches with scores/reasons when available; filter fallback with visible indicator.  
2. **AI Chat** — Conversational assistant per designed widget/flows.  
3. **Loan Analysis** — Affordability/mortgage analysis modal/flow per HTML/requirements.

### 23.3 Admin Configuration

- Prompt and chatbot behavior configuration from Admin UI (`ai_chatbot_configuration` reference).  
- Configuration persisted and applied by backend.  
- Model/provider fields in older HTML that mention non-Gemini vendors must be interpreted as **Gemini-only** in implementation (do not integrate Bedrock/other). If HTML shows a vendor dropdown, constrain options to Gemini or replace labels only with PO-approved copy that preserves layout.

### 23.4 Safety & UX

- Tool/allowlist behavior as Requirements specify.  
- Never fabricate property inventory not returned by APIs.  
- Show designed fallback and empty states.  
- Log AI failures server-side; show user-safe messages.

### 23.5 Cost & Reliability

- Monitor usage.  
- Timeouts and fallbacks mandatory for search.  
- Do not add “alternative LLM fallback” contrary to Gemini-only policy; use **non-AI filter fallback** instead.

---

## 24. Deployment Standards

### 24.1 Target

- Frontend deployment: **Vercel**.  
- Backend: Node/Express process as documented for the environment (paired with PostgreSQL).  
- Environment variables via secure platform secrets—never in git.

### 24.2 Environments

| Environment | Purpose |
|-------------|---------|
| Local | Dev with local storage + local PostgreSQL |
| Staging | Pre-prod verification, real Gemini keys with limits |
| Production | Live |

### 24.3 Release Rules

- Migrations applied before serving traffic that needs new schema.  
- Health checks green.  
- No feature flags that expose unfinished Out-of-MVP HTML accidentally.  
- Rollback plan for failed migrations/releases.  
- Smoke test: auth, property list/detail, AI search, lead capture, admin login.

### 24.4 Storage Note

Local disk storage is for development. Production storage strategy must preserve the same API response shapes used by the UI.

---

## 25. Engineering Principles (Summary Doctrine)

1. **Constitution > preference**  
2. **HTML > subjective UI taste**  
3. **Requirements > assumed functionality**  
4. **MVP exclusions > tempting HTML extras**  
5. **Real APIs > permanent mocks**  
6. **Server authority > client hiding**  
7. **Feature folders > technical spaghetti**  
8. **Reuse > duplication**  
9. **Strict types > convenience**  
10. **Process order > speed theater**  
11. **Refactor internals > change externals**  
12. **Gemini + filter fallback > multi-LLM complexity**  
13. **Role RBAC > permission matrices**  
14. **Evidence (screenshots, tests) > claims**  

---

## 26. Non-Negotiable Rules

The following are **absolute**. Violation requires stop-the-line correction before merge.

### 26.1 UI

1. HTML in `docs/design_reference` is the definitive UI.  
2. If HTML and Requirements conflict on UI, **HTML wins**.  
3. No redesign, no UI improvements, no creative interpretation.  
4. Final UI must be visually indistinguishable from HTML for in-scope screens.  
5. Screen Completion Policy is mandatory.  

### 26.2 Functional Scope

6. `REQUIREMENTS_AND_PROPOSAL.md` defines features, business rules, roles, scope, modules, workflows.  
7. Behavior in HTML but missing from Requirements must be included—**unless** banned by MVP exclusions below.  

### 26.3 Current MVP Exclusions (Do Not Build)

8. The MVP **must not** include:

- Kanban  
- Activity timeline  
- Reminder system  
- Automation  
- Virtual Tours  
- Video Upload  
- SMS  
- WhatsApp  
- Push Notifications  

### 26.4 Stack & AI

9. Stack must be Next.js 15, React 19, TypeScript, Tailwind, Node.js, Express, PostgreSQL, Prisma, Leaflet/OSM, Vercel.  
10. AI must be **Google Gemini only**.  
11. Auth must be email + password.  
12. Notifications limited to email + in-app for MVP.  
13. Development storage is local.  

### 26.5 Roles

14. Single organization; role-based only.  
15. Roles: Guest, Customer, Agent, Admin, Super Admin.  
16. No module-level permissions.  

### 26.6 Process & Quality

17. Every feature follows Epic → Feature → Technical Design → Database → Backend APIs → Mock (if needed) → Frontend → Real API Integration → Testing → UI Verification → Bug Fix → Approval → Merge.  
18. Nothing may skip this process.  
19. Temporary mocks must be replaced; none may remain.  
20. Definition of Done is binary—all boxes or not Done.  
21. Internal refactors allowed; visual changes prohibited.  
22. Business logic must not live in UI components.  
23. Centralized API layer is mandatory.  
24. Strict TypeScript; no lint/type/console debt on completed screens.  

### 26.7 Governance

25. This Constitution is binding on humans and AI assistants alike.  
26. Conflicting instructions in chats are void unless they amend this document through formal change control.  

---

## Appendix A — MVP Functional Emphasis (from Requirements)

Implementers should prioritize MVP capabilities aligned with Requirements, including (non-exhaustive):

- Auth: registration, login/logout, role-aware access  
- Properties: create/edit, inventory, details, favorites, search/filter  
- AI: NLP search, chatbot, loan analysis, admin AI config  
- CRM: lead capture, lead list/detail (non-Kanban for MVP), basic workflow  
- Admin: users/agents, CMS, reports/dashboard KPIs, notification rules/in-app + email  
- Scheduling touchpoints already in designed MVP-adjacent flows only if not excluded  

Exact status tables in `REQUIREMENTS_AND_PROPOSAL.md` track delivery progress; this Constitution governs **how** work is done and **what may not** be done.

### A.1 Role Capability Matrix (MVP)

| Capability | Guest | Customer | Agent | Admin | Super Admin |
|------------|-------|----------|-------|-------|-------------|
| Browse public properties | Yes | Yes | Yes | Yes | Yes |
| NLP / filter search | Yes | Yes | Yes | Yes | Yes |
| View property details | Yes | Yes | Yes | Yes | Yes |
| Register / login | Yes | — | — | — | — |
| Favorites | No | Yes | Limited* | Yes | Yes |
| Submit inquiry / lead | Yes† | Yes | Yes | Yes | Yes |
| AI chat (public/customer surfaces) | Yes‡ | Yes | Yes | Yes | Yes |
| Loan analysis | No | Yes | Yes | Yes | Yes |
| Customer dashboard | No | Yes | No | No | Yes |
| Manage own/assigned listings | No | No | Yes | Yes | Yes |
| Property inventory admin | No | No | Limited* | Yes | Yes |
| Bulk upload | No | No | No | Yes | Yes |
| Lead list / detail (non-Kanban) | No | No | Yes | Yes | Yes |
| Admin command center | No | No | Limited* | Yes | Yes |
| User / agent management | No | No | No | Yes | Yes |
| CMS management | No | No | No | Yes | Yes |
| AI configuration | No | No | No | Yes | Yes |
| System-wide config / audit | No | No | No | No | Yes |

\* “Limited” means only as Requirements and designed Agent surfaces allow—never by inventing a permission matrix.  
† Guest lead capture where HTML/Requirements provide public forms.  
‡ Guest chat only where the public HTML includes the widget.

Server-side enforcement is mandatory. UI hiding is not security.

### A.2 In-Scope Screen Priority (MVP)

| Priority | Screen Reference | Notes |
|----------|------------------|-------|
| P0 | `propvista_crm_homepage` | Primary acquisition surface |
| P0 | `search_results_standard_view` | AI success path |
| P0 | `search_results_filter_fallback_view` | AI failure path |
| P0 | `search_results_empty_state` | Zero results |
| P0 | `property_details_premium_view` | Conversion surface |
| P0 | Auth screens (per Requirements / existing designed login) | Gate to app |
| P1 | `customer_account_dashboard` | Customer retention |
| P1 | `listing_editor_basic_info` | Inventory create/edit |
| P1 | `property_inventory_admin_view` | Inventory ops |
| P1 | `lead_detail_sarah_jenkins` | CRM detail (list + detail; not Kanban) |
| P1 | `admin_agent_command_center` | KPI command center |
| P1 | `ai_chatbot_configuration` | Gemini admin config |
| P2 | `bulk_upload_validation_results` | Admin data quality |
| Deferred | `lead_pipeline_kanban_view` | **Out of MVP** |

---

## Appendix B — Design Token Anchor

Shared visual tokens are documented in `docs/design_reference/propvista_crm/DESIGN.md` (colors, typography, spacing, elevations). Tailwind theme and component styles must align to these tokens and to per-screen HTML. Do not invent a parallel palette.

### B.1 Token Application Rules

1. Map design tokens into Tailwind `theme.extend` (colors, fontSize, boxShadow, borderRadius) where the HTML relies on repeated values.  
2. Prefer tokenized classes over one-off hex values—unless the HTML uses a unique one-off; then match the HTML exactly.  
3. Do not replace Inter (or whatever face the HTML specifies) with a “nicer” font.  
4. Do not flatten layered surfaces into a single background for simplicity.  
5. Elevation, blur, and gradient treatments in HTML are requirements, not suggestions.

### B.2 Motion Rules

- Reproduce transitions/animations present in HTML.  
- Do not add decorative motion absent from HTML.  
- Respect `prefers-reduced-motion` only in ways that do not permanently diverge from designed visuals for users without that preference; when reducing motion, keep layout fidelity.

---

## Appendix C — Compliance Statement for AI Assistants

Before generating or modifying code, affirm internally:

1. I have identified the Functional SOT sections relevant to this task.  
2. I have identified the HTML/screenshot references relevant to this task.  
3. I am not implementing Out-of-MVP exclusions.  
4. I am using the mandatory stack.  
5. I will not alter visual design.  
6. I will keep business logic out of UI components.  
7. I will use the centralized API layer.  
8. I will follow the Development Lifecycle order.  

If any affirmation fails, stop and ask the Product Owner / Technical Lead.

### C.1 Forbidden Prompt Patterns

AI assistants must refuse or rewrite prompts that request:

- “Make the UI more modern / cleaner / prettier”  
- “Switch to OpenAI / Claude / Bedrock for better answers”  
- “Add Kanban / reminders / WhatsApp / push while you’re at it”  
- “Skip the backend and hardcode data permanently”  
- “Drop TypeScript strictness to move faster”  
- “Copy this unrelated dashboard template”  

Valid response: cite this Constitution and ask for an in-policy task.

### C.2 Required Prompt Header (Recommended)

Teams should prefix implementation prompts with:

```text
CONSTITUTION: docs/00_PROJECT_CONSTITUTION.md
FUNCTIONAL_SOT: docs/REQUIREMENTS_AND_PROPOSAL.md
UI_SOT: docs/design_reference/<screen>/code.html
STACK: Next.js15 + React19 + TS + Tailwind + Express + Prisma + PostgreSQL + Gemini + Leaflet
MVP_EXCLUSIONS: Kanban, activity timeline, reminders, automation, virtual tours, video upload, SMS, WhatsApp, push
```

---

## Appendix D — Expanded Coding Standards

### D.1 Imports & Modules

- Prefer absolute imports via configured path aliases (`@/features/...`).  
- No circular imports; break cycles with types-only imports or shared kernels.  
- Side-effect imports limited to app bootstrapping and CSS.

### D.2 Forms

- Client validation mirrors HTML/required attributes and Requirements.  
- Server validation is authoritative.  
- Disable submit during in-flight requests per designed loading behavior.  
- Preserve field values on validation errors unless HTML shows a reset.

### D.3 Dates, Money, Units

- Display currency and measurements exactly as HTML/Requirements formatting shows.  
- Prefer integer minor-units or decimal strings for money in APIs—never imprecise binary floats for persisted prices if avoidable.  
- Timezones: store UTC; display in org/local policy consistently.

### D.4 Logging

- Structured logs (JSON preferred in backend).  
- Include request ID, user id (if authenticated), role, route.  
- Never log passwords, tokens, or raw Gemini secrets.  
- Frontend: avoid noisy logs in production builds.

### D.5 Dependency Policy

- Add dependencies only when necessary and approved by Technical Lead for non-trivial libraries.  
- Prefer maintained, license-compatible packages.  
- Lockfiles committed.  
- No UI kit that overrides HTML fidelity (e.g., swapping to a generic component library look).

---

## Appendix E — Expanded API Conventions

### E.1 Resource Naming

- Plural nouns: `/api/v1/properties`, `/api/v1/leads`.  
- Actions as sub-resources when needed: `/api/v1/leads/:id/status`.  
- AI under `/api/v1/ai/...`.

### E.2 Pagination Envelope

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### E.3 Filtering

- Use explicit query params documented per resource (`status`, `minPrice`, `maxPrice`, `beds`, `city`, etc.).  
- Reject unknown critical params that could alter authorization scope.

### E.4 Idempotency

- Lead creation and other Requirements-specified writes support idempotency keys via header when documented.  
- Replays return the original resource rather than duplicates.

### E.5 File Uploads

- `multipart/form-data` for media.  
- Validate MIME + size.  
- Return canonical URL/path for UI galleries.  
- Local disk in development; abstract storage behind an interface.

### E.6 Contract-First Discipline

- Technical Design includes request/response examples before Frontend begins.  
- Breaking changes require version bump or coordinated release.  
- Frontend must not depend on undocumented fields.

---

## Appendix F — Anti-Patterns Catalog

| Anti-Pattern | Why Forbidden | Correct Approach |
|--------------|---------------|------------------|
| Redesigning a screen “slightly” | Breaks UI SOT | Match HTML |
| Business rules in React components | Unstestable; inconsistent | Move to services/hooks carefully; authoritative rules on server |
| Fetch inside deep child components | Duplication; auth drift | Central API + feature hooks |
| Permanent mocks | False Done | Replace with real API |
| Client-only role gates | Security hole | Server enforcement |
| Multi-LLM “just in case” | Violates AI policy | Gemini + filter fallback |
| Building Kanban “because HTML exists” | Violates MVP exclusions | Defer post-MVP |
| Copy-paste Prisma queries in routes | Violates Clean Architecture | Repository/service |
| Drive-by refactors mixed with features | Unreviewable risk | Separate PRs |
| Silent catch blocks | Hides defects | Handle or rethrow with context |
| Introducing new empty/error UI inventively | Visual drift | Use HTML states |
| WhatsApp/SMS “quick win” | Out of MVP | Email + in-app only |

---

## Appendix G — Local Development Standards

### G.1 Required Developer Setup

1. Node.js LTS compatible with Next.js 15 and the Express app.  
2. PostgreSQL local instance.  
3. `cp .env.example .env` for frontend and backend (never commit secrets).  
4. `prisma migrate` + seed as documented.  
5. Gemini API key in backend env only.  
6. Run frontend (Vercel-bound Next app) and backend concurrently.

### G.2 Seed & Fixtures

- Seeds must support demo of homepage, search, property detail, admin inventory, and lead detail.  
- Do not hardcode seed-only IDs into UI components.  
- Screenshot comparison may use stable seed personas (e.g., sample lead names) when HTML uses named fixtures.

### G.3 Definition of a Healthy Local Smoke

- [ ] Register/login works  
- [ ] Homepage renders per HTML  
- [ ] Search returns standard or fallback UI correctly  
- [ ] Property detail loads with map  
- [ ] Customer favorites round-trip  
- [ ] Admin can open inventory + AI config  
- [ ] No console errors on smoke path  

---

## Appendix H — Incident & Defect Severity

| Severity | Definition | Response |
|----------|------------|----------|
| S0 | Security breach, data loss, auth bypass | Stop feature work; patch immediately |
| S1 | Primary journey broken (search, login, inquire) | Block release; fix before merge/deploy |
| S2 | Secondary feature broken; workaround exists | Fix in current sprint |
| S3 | Minor functional issue | Scheduled |
| S4 | Non-visual polish that does not change HTML fidelity | Optional; must not alter UI SOT |

Visual mismatches against HTML for in-scope screens are treated as **S1/S2 defects**, not “nice to have.”

---

## Appendix I — Post-MVP Boundary

When MVP is accepted, post-MVP work may pick up excluded items **only** via new Epics that:

1. Amend MVP exclusions in this Constitution (version bump), or add a dated superseding MVP scope appendix.  
2. Re-activate HTML references (e.g., Kanban) as in-scope UI SOT.  
3. Restart the full Development Lifecycle—no “just enable the old branch.”

Until that happens, Out-of-MVP remains Out-of-MVP.

---

## Appendix J — RACI (Engineering Governance)

| Decision | Product Owner | Tech Lead | Eng Manager | Developer / AI | QA |
|----------|---------------|-----------|-------------|----------------|-----|
| Scope in/out | A | C | C | I | I |
| UI fidelity disputes | A | C | I | R | C |
| Stack changes | A | A | C | I | I |
| API contract | C | A | I | R | C |
| Merge to main | C | A | C | R | A |
| Constitution amendment | A | A | A | I | I |

R = Responsible, A = Accountable, C = Consulted, I = Informed.

---

## Appendix K — Change Log

| Version | Date | Summary |
|---------|------|---------|
| 1.0.0 | 2026-07-30 | Initial Project Constitution ratified from Requirements, design_reference, and governing engineering policies. |

---

**End of Constitution**

*All contributors—human and AI—are bound by this document for the life of the project unless formally amended.*
