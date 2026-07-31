# PropVista CRM / Property AI Studio — Coding Standards Manual

| Field | Value |
|-------|--------|
| **Document** | `14_CODING_STANDARDS.md` — Engineering Handbook |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **Status** | Binding for MVP implementation |
| **Audience** | Developers, AI coding assistants, reviewers, QA (for fidelity gates) |

### Governing References (in force order on conflict)

1. `docs/00_PROJECT_CONSTITUTION.md` — stack, architecture, DoD, UI fidelity, process  
2. `docs/design_reference/**` — UI presentation (HTML wins)  
3. `docs/REQUIREMENTS_AND_PROPOSAL.md` — functional scope  
4. `docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md` / `docs/02_SOFTWARE_REQUIREMENTS_SPECIFICATION.md`  
5. `docs/03_SYSTEM_ARCHITECTURE_DOCUMENT.md`, `docs/04_DATABASE_DESIGN_DOCUMENT.md`, `docs/openapi.yaml`  
6. `docs/07_UI_IMPLEMENTATION_GUIDE.md`, `docs/08_EPICS_AND_FEATURES.md`, `docs/09_SPRINT_PLAN.md`, `docs/11_TEST_STRATEGY.md`  

This manual **implements** those documents as day-to-day coding rules. It does not invent product features or redesign UI.

---

## Table of Contents

1. [Coding Philosophy](#1-coding-philosophy)  
2. [SOLID Principles](#2-solid-principles)  
3. [Clean Code](#3-clean-code)  
4. [DRY](#4-dry)  
5. [KISS](#5-kiss)  
6. [YAGNI](#6-yagni)  
7. [Naming Conventions](#7-naming-conventions)  
8. [File Naming](#8-file-naming)  
9. [Folder Naming](#9-folder-naming)  
10. [Component Naming](#10-component-naming)  
11. [Hook Naming](#11-hook-naming)  
12. [Service Naming](#12-service-naming)  
13. [Repository Naming](#13-repository-naming)  
14. [API Naming](#14-api-naming)  
15. [Database Naming](#15-database-naming)  
16. [TypeScript Standards](#16-typescript-standards)  
17. [React Standards](#17-react-standards)  
18. [Next.js Standards](#18-nextjs-standards)  
19. [Express Standards](#19-express-standards)  
20. [Prisma Standards](#20-prisma-standards)  
21. [PostgreSQL Standards](#21-postgresql-standards)  
22. [Error Handling](#22-error-handling)  
23. [Logging](#23-logging)  
24. [Validation](#24-validation)  
25. [Security](#25-security)  
26. [Performance](#26-performance)  
27. [Accessibility](#27-accessibility)  
28. [Commenting](#28-commenting)  
29. [Documentation](#29-documentation)  
30. [Code Smells](#30-code-smells)  
31. [Anti-Patterns](#31-anti-patterns)  
32. [Refactoring Guidelines](#32-refactoring-guidelines)  
33. [Example Code](#33-example-code)  
34. [Good vs Bad Examples](#34-good-vs-bad-examples)  
35. [Checklist before Commit](#35-checklist-before-commit)  

---

## 1. Coding Philosophy

### 1.1 Mission

Ship an MVP that is **correct, secure, maintainable, and visually indistinguishable** from `design_reference` HTML—without scope creep into Constitution Out-of-MVP items.

### 1.2 Non-Negotiables

| Principle | Meaning |
|-----------|---------|
| Fidelity first | HTML + screenshots are UI SOT; no “improvements” |
| Clean Architecture | UI → hooks → API client → HTTP → routes → services → repositories → DB |
| Server authority | Business rules and AuthZ live on the backend |
| Centralized API | All HTTP through `lib/api` (or equivalent); no ad-hoc `fetch` in components |
| Gemini only | No alternate LLM providers |
| MVP honesty | Do not ship Kanban, timeline product, reminders, virtual tours/video, SMS/WhatsApp/push |
| Evidence | Tests, screenshots, and review > verbal claims |
| Process | Epic → Feature → Design → DB → API → FE → Real API → Test → UI Verification → Approval → Merge |

### 1.3 Roles of Code Layers

| Layer | Owns | Must not own |
|-------|------|--------------|
| UI | Presentation, local UI state | Business rules, Prisma, Gemini secrets |
| Hooks | Orchestration, cache, view-model mapping | JSX, DB, Express |
| API client | Transport, auth headers, error envelope parse | Domain policy |
| Routes | HTTP parse, call service, status codes | Fat business logic |
| Services | Rules, AuthZ, orchestration | React, raw SQL sprawl |
| Repositories | Persistence queries | Product policy beyond integrity |

### 1.4 Default Stance

Prefer **explicit, boring, feature-local code** that matches contracts and HTML over clever frameworks, premature abstractions, or redesigns.

---

## 2. SOLID Principles

Apply Constitution §4.2 literally.

### 2.1 Single Responsibility (S)

- One reason to change per module/function.  
- Split “parse request”, “authorize”, “apply rule”, “persist”, “map DTO”.  
- React components do not also compute loan affordability or lead scoring.

### 2.2 Open/Closed (O)

- Extend via new feature modules, adapters, and handlers.  
- Avoid editing shared core contracts for every feature; version or add endpoints carefully.  
- Gemini adapter is the extension point for AI—not a multi-provider switch.

### 2.3 Liskov Substitution (L)

- Storage adapters (local FS vs future prod storage) must honor the same interface.  
- Mock Gemini in tests must return the same envelope shapes as production adapter failures/success.

### 2.4 Interface Segregation (I)

- Prefer narrow interfaces: `PropertyReader`, `LeadWriter`, `GeminiSearchClient`.  
- Avoid god-services (`AdminService` that does users + CMS + metrics + AI).

### 2.5 Dependency Inversion (D)

- UI depends on hooks/API contracts, not Express.  
- Services depend on repository ports, not Prisma client scattered in routes.  
- Inject Gemini/email/storage behind integrations.

---

## 3. Clean Code

### 3.1 Rules

1. Names reveal intent; no cryptic abbreviations in domain code.  
2. Functions do one thing; keep them short enough to scan.  
3. Prefer pure functions for mappers and validators.  
4. Avoid deep nesting; use early returns.  
5. No dead code, no commented-out blocks on `main`.  
6. Handle errors deliberately; never empty `catch`.  
7. Keep feature public APIs small (`index.ts` barrels only when they reduce coupling).  
8. Match existing project patterns before inventing new ones.

### 3.2 Complexity Budget

- If a function needs a paragraph of explanation, split it.  
- If a component file mixes layout + three data flows, extract hooks/subcomponents.  
- Cyclomatic complexity: treat double-digit branching as a refactor signal.

### 3.3 UI Clean Code Special Rule

“Cleaner UI” that diverges from HTML is **not** clean code—it is a defect.

---

## 4. DRY

### 4.1 Mandatory Reuse (Constitution §4.5)

- Shared UI primitives (Button, Input, Modal, Table, Loader, Empty, Error) matching HTML  
- Shared hooks (auth, pagination, mutations)  
- Shared mappers/validators  
- Centralized API resource modules  
- Shared role-guard utilities (client route + server middleware)

### 4.2 DRY Correctly

| Do | Don't |
|----|-------|
| Extract identical fetch + error mapping into `lib/api` | Create a mega-hook used once “just in case” |
| Share Zod schemas between route and tests when identical | Share schemas that force FE to import backend Prisma |
| Reuse design tokens from `DESIGN.md` | Duplicate hex values that drift from tokens |

### 4.3 Accidental Duplication = Defect

Duplicated role checks, duplicated `fetch` calls, and one-off buttons that already exist in the design system fail code review.

---

## 5. KISS

- Feature folders over elaborate DDD ceremony for MVP.  
- Explicit `if (role !== 'Admin')` in one middleware helper beats a permission engine.  
- Prefer readable Prisma queries over clever query builders.  
- Prefer Tailwind utilities matching HTML over custom CSS frameworks.  
- Do not add state libraries beyond team-approved Zustand/React Query (or equivalent already chosen) without need.

**KISS does not mean** skipping loading/empty/error states or skipping types.

---

## 6. YAGNI

Do **not** build:

- Kanban engines, WIP limits, drag-drop pipeline  
- Activity timeline product, reminder/automation systems  
- Virtual tours / video upload pipelines  
- SMS / WhatsApp / Push channels  
- Multi-tenant org models  
- Module-level permission matrices  
- Alternate LLM provider abstractions  
- “Future-proof” config for excluded channels  

If HTML shows excluded UI, preserve reference only—do not ship product navigation or backends for it in MVP.

---

## 7. Naming Conventions

| Kind | Convention | Example |
|------|------------|---------|
| React components | `PascalCase` | `PropertyCard` |
| Hooks | `use` + `PascalCase` domain | `usePropertyDetail` |
| Functions / variables | `camelCase` | `mapPropertyToCard` |
| Types / Interfaces | `PascalCase` | `PropertyDto`, `LeadStage` |
| Type properties | `camelCase` in TS | `createdAt` |
| Constants | `UPPER_SNAKE` or `as const` | `MAX_UPLOAD_BYTES` |
| Enums (TS) | `PascalCase` enum + `PascalCase` / `UPPER` members consistently | `PropertyStatus.Published` |
| CSS variables / tokens | match DESIGN.md | `--color-primary` |
| Env vars | `UPPER_SNAKE` | `DATABASE_URL`, `GEMINI_API_KEY` |
| Test IDs (if used) | `kebab` or feature-scoped | prefer role/label a11y over opaque ids |

Boolean names: `isLoading`, `hasError`, `canPublish`—not `loadingFlag`.

Event handlers: `onSubmit`, `handlePublishClick`.

---

## 8. File Naming

| Area | Convention | Example |
|------|------------|---------|
| React component | `PascalCase.tsx` | `PropertyDetailsPage.tsx` |
| Hook | `useX.ts` | `useSearchResults.ts` |
| API module | `camelCase.ts` or resource name | `properties.ts` |
| Mapper | `*.mapper.ts` | `property.mapper.ts` |
| Validator | `*.schema.ts` / `*.validator.ts` | `lead.schema.ts` |
| Service | `*.service.ts` | `lead.service.ts` |
| Repository | `*.repository.ts` | `property.repository.ts` |
| Route | `*.routes.ts` | `auth.routes.ts` |
| Middleware | `*.middleware.ts` | `requireAuth.middleware.ts` |
| Test | `*.test.ts` / `*.spec.ts` | `lead.service.test.ts` |
| Next.js route | App Router conventions | `page.tsx`, `layout.tsx`, `loading.tsx` |
| Prisma schema | `schema.prisma` | — |

**Match primary export:** `PropertyCard.tsx` exports `PropertyCard`.

Do not use vague names: `helpers.ts`, `stuff.ts`, `newFile.ts`.

---

## 9. Folder Naming

### 9.1 Top Level

```
/
  docs/
  frontend/
  backend/
```

### 9.2 Frontend

```
frontend/src/
  app/                  # routes only (thin)
  features/             # kebab or camel domain folders — pick one; prefer kebab
    auth/
    properties/
    search/
    leads/
    admin/
    ai/
    customer/
    cms/
    notifications/
  components/           # shared presentational primitives
  hooks/                # shared hooks only
  lib/
    api/
    auth/
    mappers/
  types/
  styles/
```

Folder names: **`kebab-case`** for multi-word feature dirs (`property-inventory/`) **or** short single tokens (`leads/`). Stay consistent repo-wide.

### 9.3 Backend

```
backend/src/
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

### 9.4 Rules

- No circular imports across features.  
- Features export a small public surface.  
- `docs/design_reference/` is read-only SOT—do not “fix” HTML to match bad code.

---

## 10. Component Naming

| Pattern | Use |
|---------|-----|
| `Noun` / `NounAdjective` | `SiteHeader`, `PropertyCard` |
| `Feature` + `View`/`Page`/`Panel` | `CustomerDashboardView`, `LeadDetailPanel` |
| `Screen` alignment | Prefer names traceable to UI Guide SCR-* |
| State components | `SearchEmptyState`, `InventoryLoadingSkeleton` |
| Modals | `ScheduleVisitModal`, `AddLeadModal` |

**Avoid:** `Wrapper`, `Container` without meaning; `CommonButton2`; redesign-oriented names (`GlassCard`, `FancyHero`).

Client components: still `PascalCase`; mark with `'use client'` at top when required—do not encode `Client` in the name unless disambiguating duplicates.

---

## 11. Hook Naming

| Pattern | Example |
|---------|---------|
| Query | `usePropertyDetail`, `useLeadList` |
| Mutation | `usePublishProperty`, `useCreateLead` |
| UI state | `useDisclosure`, `useTabs` (shared) |
| Feature orchestration | `useSearchController` (returns discriminated state) |

Rules:

- Always start with `use`.  
- Return stable shapes; prefer discriminated unions: `{ status: 'loading' } | { status: 'success'; data } | …`.  
- Hooks call `lib/api`, not raw `fetch`.  
- No JSX inside hooks.

---

## 12. Service Naming

Backend application services:

| Pattern | Example |
|---------|---------|
| `<Domain>Service` | `AuthService`, `PropertyService`, `LeadService`, `SearchService`, `AiConfigService` |
| Method verbs | `createDraft`, `publish`, `addNote`, `searchWithAi` |

Services:

- Contain business rules and AuthZ checks.  
- Call repositories + integrations.  
- Do not import React or know about Tailwind.  
- Do not send raw Prisma entities to clients—map to DTOs.

---

## 13. Repository Naming

| Pattern | Example |
|---------|---------|
| `<Entity>Repository` | `PropertyRepository`, `UserRepository`, `BulkUploadRepository` |
| Methods | `findById`, `listForAdmin`, `create`, `updateStatus` |

Repositories:

- Own Prisma queries and transactions for persistence.  
- May enforce DB-level integrity only.  
- Must not send emails or call Gemini.  
- Accept/return domain or persistence models; mapping to API DTOs can live in service/mapper layer—be consistent per module.

---

## 14. API Naming

### 14.1 HTTP

| Rule | Example |
|------|---------|
| Base | `/api/v1` |
| Resources | plural nouns: `/properties`, `/leads`, `/users` |
| Nested | `/leads/:id/notes` |
| Actions (sparingly) | `POST /properties/:id/publish`, `POST /search` |
| Auth | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` |

### 14.2 JSON

- Request/response bodies: **`camelCase`** field names in JSON API (map from DB `snake_case` in mappers).  
- Error envelope: consistent shape (code, message, details, correlationId).  
- Lists: `{ items, page, pageSize, total }` (or OpenAPI-defined equivalent—match OpenAPI).

### 14.3 Client modules

```
lib/api/properties.ts → propertiesApi.list(), propertiesApi.get(id)
lib/api/leads.ts      → leadsApi.create(input)
```

Function names: verb + noun, aligned with service methods.

---

## 15. Database Naming

Per `04_DATABASE_DESIGN_DOCUMENT.md`:

| Object | Convention | Example |
|--------|------------|---------|
| Tables | `snake_case`, plural | `properties`, `lead_notes` |
| Columns | `snake_case` | `password_hash`, `created_at` |
| Primary keys | `id` (UUID or documented type) | `id` |
| Foreign keys | `<table_singular>_id` | `property_id`, `user_id` |
| Indexes | `idx_<table>_<cols>` | `idx_properties_status` |
| Unique | `uq_<table>_<cols>` | `uq_users_email` |
| Enums | `snake_case` | `property_status`, `user_role` |
| Prisma models | `PascalCase` singular | `model Property` |

Timestamps: `created_at`, `updated_at` (and soft-delete only if schema defines it).

Never expose `password_hash` in API responses.

---

## 16. TypeScript Standards

### 16.1 Compiler

- `strict: true`  
- No implicit `any`  
- Prefer `unknown` + narrowing over `any`  
- If `any` is unavoidable: isolate at boundary + review note  

### 16.2 Types

- Export shared domain/DTO types from agreed packages (`types/` or shared contracts).  
- Prefer `type` for unions/intersections; `interface` for object extension—be consistent.  
- Discriminated unions for UI and async state:

```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; error: AppError };
```

- Avoid `enum` numeric pitfalls when string unions suffice; Prisma enums are fine at boundary.

### 16.3 Imports

- Prefer path aliases (`@/`) configured in both apps.  
- No deep relative `../../../../` sprawl—fix folder placement.  
- Do not import backend Prisma into frontend.

### 16.4 Nullability

- Be explicit: `T | null` for intentional absence.  
- Avoid non-null assertions (`!`) except with justification.

---

## 17. React Standards

### 17.1 Components

- Presentational by default.  
- No business rules in JSX beyond trivial conditionals (`status === 'empty'`).  
- Extract repeated class clusters into primitives—**without** inventing a new visual system.  
- Keys: stable ids, not array index for dynamic lists.  
- Controlled inputs match HTML behavior.

### 17.2 State

- Server state via React Query (or project-standard) through hooks.  
- Local UI state (`useState`) for ephemeral UI only.  
- Prefer project-approved patterns (`useEffectEvent`, `startTransition`, `useDeferredValue` when appropriate).  
- Do **not** add `useMemo`/`useCallback` by default; follow React Compiler / team guidance.

### 17.3 Effects

- Data loading belongs in hooks, not random `useEffect` in page files when a query hook exists.  
- Clean up subscriptions/maps (Leaflet) on unmount.

### 17.4 Styling

- Tailwind only for product UI unless HTML requires otherwise.  
- Tokens from `DESIGN.md`.  
- No icon set swaps; no generic AI aesthetic restyle.

---

## 18. Next.js Standards

### 18.1 App Router

- Next.js **15** App Router mandatory.  
- `app/` routes stay thin: compose feature components + hooks.  
- **Server Components by default**; `'use client'` only when interactivity/browser APIs require it.  
- Colocate `loading.tsx` / error UI with routes when it helps match designed states—still fidelity-first.

### 18.2 Data

- Browser calls go through centralized client API to Express `/api/v1` (unless Architecture documents a BFF exception—default is Express API).  
- Never put `GEMINI_API_KEY` in Next public env.

### 18.3 Routing

Align with UI Guide:

| Screen | Route |
|--------|-------|
| Home | `/` |
| Search | `/search` |
| Property | `/properties/[id]` |
| Customer | `/customer` |
| Admin home | `/admin` |
| Properties admin | `/admin/properties` |
| … | per UI Implementation Guide |

Do not add MVP routes to Kanban.

### 18.4 Deploy

- Frontend target: **Vercel**.  
- Env via platform secrets.

---

## 19. Express Standards

### 19.1 Structure

- Thin routers → validators → services → repositories.  
- Middleware: auth, role guard, error handler, request id, rate limit (auth + AI).  
- TypeScript default.

### 19.2 Handlers

```ts
// Good shape
router.post('/leads', requireAuth, validate(createLeadSchema), async (req, res, next) => {
  try {
    const result = await leadService.create(req.user, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});
```

### 19.3 Cross-cutting

- Central `errorHandler` maps domain errors → HTTP + envelope.  
- No business logic in `app.ts` beyond wiring.  
- Integrations under `integrations/gemini|email|storage`.

### 19.4 Versioning

- Mount at `/api/v1`.  
- Breaking changes require explicit decision—prefer additive fields in MVP.

---

## 20. Prisma Standards

### 20.1 Schema

- Models `PascalCase`; `@@map("snake_plural")` and `@map("snake_case")` for DB names.  
- Relations explicit; onDelete policy documented.  
- Enums aligned with DB design.  
- No Prisma calls from React.

### 20.2 Usage

- Access Prisma from repositories (or a thin prisma module used by repositories).  
- Use transactions for multi-step writes (bulk import valid rows, publish with invariants).  
- Select only needed fields; never `select` password hashes into DTO mappers by accident.

### 20.3 Migrations

- Every schema change = migration.  
- Migrations applied before code that depends on them (Constitution deploy rules).  
- No hand-editing applied migration history without team process.

---

## 21. PostgreSQL Standards

- Engine of record for MVP data.  
- Prefer constraints (FK, unique, check) over application-only enforcement when practical.  
- Index filter/sort columns used by inventory and lead lists.  
- Use migrations (Prisma) as SOT for schema evolution.  
- Connection via env `DATABASE_URL`; never commit credentials.  
- Test DB separate from dev (`DATABASE_URL_TEST`).

---

## 22. Error Handling

### 22.1 Principles

- Never swallow errors.  
- User-facing errors match designed HTML states when provided.  
- Production clients: no stack traces, no secrets.  
- Server logs: include correlation/request id.

### 22.2 Domain Errors

Use typed errors, e.g.:

- `UnauthorizedError` → 401  
- `ForbiddenError` → 403  
- `NotFoundError` → 404  
- `ValidationError` → 400  
- `ConflictError` → 409  
- `AiProviderError` → mapped to search fallback trigger / safe message  

### 22.3 Frontend

- Map envelope → discriminated `error` state.  
- Show Empty vs Error correctly (zero results ≠ server failure).  
- AI search failure must drive **fallback UI**, not a blank page.

### 22.4 AI

- Timeouts mandatory.  
- Non-AI filter fallback for search—not alternate LLMs.  
- Loan analysis: formula fallback on Gemini failure.

---

## 23. Logging

### 23.1 Server

| Level | Use |
|-------|-----|
| error | Unexpected failures, integration failures |
| warn | Recoverable anomalies, fallbacks triggered |
| info | Boot, migration, significant business events (lead created) |
| debug | Local/dev only |

Include: `requestId`, route, user id (if any), latency for slow paths.  
Never log: passwords, tokens, Gemini API keys, raw card/PII beyond what ops policy allows.

### 23.2 Client

- No `console.log` in production paths for completed screens.  
- Prefer error reporting hook if introduced; until then, avoid noisy logs.  
- Constitution DoD: **no console errors** on verified flows.

---

## 24. Validation

### 24.1 Layers

1. **Client:** UX validation matching HTML (inline messages).  
2. **API:** Schema validation on all write endpoints (Zod or equivalent).  
3. **DB:** Constraints as backstop.

Server validation is authoritative—never trust the client.

### 24.2 Rules

- Validate types, ranges, enums, string lengths, email formats.  
- File uploads: type + size.  
- Bulk rows: per-row errors with field + message + suggested fix (SCR-BULK).  
- Reject unknown role values; only five roles.

---

## 25. Security

### 25.1 Mandatory

- Email + password auth; password hashed (bcrypt/argon2).  
- JWT access + refresh; refresh revoke on logout.  
- Server-side role checks on every protected route.  
- Rate limit auth + AI.  
- Gemini key server-only.  
- OWASP basics: injection, XSS, CSRF strategy for cookie auth.  
- Upload hardening; no path traversal.  
- HTTPS in deployed environments; secure cookie flags when cookies used.

### 25.2 AuthZ Matrix Mentality

Before adding an endpoint, document which of Guest / Customer / Agent / Admin / Super Admin may call it. Default deny.

### 25.3 Forbidden

- Client-side “hide admin button” as sole protection.  
- Role escalation via request body.  
- Committing `.env` or keys.

---

## 26. Performance

| Rule | Practice |
|------|----------|
| Page load | Target <2s primary routes on reference broadband |
| Lists | Always paginate; no unbounded payloads |
| AI | Non-blocking chrome; designed loading UI; timeouts |
| Maps | Lazy-load Leaflet on detail only |
| Images | Sensible sizes; don’t block LCP with admin charts on public pages |
| Queries | Index hot filters; avoid N+1 (Prisma `include` deliberately) |
| FE | Avoid shipping admin chart libs on public homepage |

Do not “optimize” by removing fidelity-required images/animations that HTML specifies—optimize delivery instead.

---

## 27. Accessibility

Baseline without visual redesign (Constitution §7.4):

- Semantic elements compatible with reference structure  
- Label associations for inputs  
- Visible keyboard focus consistent with design  
- Alt text for meaningful images  
- Contrast from design tokens  

If an a11y fix requires visual change conflicting with HTML → PO confirmation.

Automated axe checks encouraged; keyboard pass required on primary flows (see Test Strategy).

---

## 28. Commenting

### 28.1 Do

- Comment **why** (legal constraint, Constitution exclusion, Gemini timeout rationale).  
- Document non-obvious algorithms (loan formula fallback).  
- Mark temporary mocks with ticket id: `// MOCK: remove with FEAT-xx / TICKET-123`.

### 28.2 Don't

- Narrate what the next line does.  
- Leave commented-out code.  
- Use comments to excuse Out-of-MVP features in MVP branches.

### 28.3 JSDoc

Use on public shared utilities and service entrypoints when signatures are non-obvious; not required on every React prop if types suffice.

---

## 29. Documentation

| Change type | Update |
|-------------|--------|
| New endpoint | `openapi.yaml` + API notes |
| Schema change | Prisma migration + `DATABASE_DESIGN` if structural |
| New screen wiring | UI Implementation Guide checklist progress |
| Feature start | Epic/Feature IDs on PR |
| Architecture shift | Constitution amendment process |
| README | Run/env instructions only—do not duplicate SOT docs |

AI assistants must not invent requirements in code comments that contradict governing docs.

---

## 30. Code Smells

Watch for and fix:

| Smell | Signal |
|-------|--------|
| God component | Page file > ~300 lines with multiple data domains |
| God service | One service imports half the app |
| Business logic in JSX | Pricing, AuthZ, Gemini prompts in components |
| Prop drilling forests | Pass context/hooks instead at feature boundary |
| Magic numbers | Unnamed timeouts, limits |
| Feature envy | UI knows Prisma field quirks |
| Shotgun surgery | One change edits 15 unrelated files—boundary wrong |
| Dead feature flags | Out-of-MVP routes half-wired |
| Duplicate types | FE/BE DTOs drift without shared contract |
| Silent catch | Empty `catch (e) {}` |

---

## 31. Anti-Patterns

| Anti-pattern | Why banned |
|--------------|------------|
| Redesign “polish” | Violates UI SOT |
| Ad-hoc `fetch` in components | Breaks central API + auth |
| Alternate LLM “fallback” | Violates Gemini-only; use filter fallback |
| Module permission engine | Constitution: roles only |
| Shipping Kanban/timeline/reminders in MVP | Out-of-MVP |
| Mock left in production path | DoD violation |
| Business rules only on client | Security + consistency failure |
| Importing design_reference HTML as runtime | Reference only; re-implement in React |
| Copy-paste role checks with subtle drift | AuthZ bugs |
| `any` across codebase | TypeScript strict violation |
| Committing secrets | Security incident |
| Fixing HTML to match bad app | Invert: fix app |

---

## 32. Refactoring Guidelines

### 32.1 Allowed without PO UI approval (Constitution §6.7)

- Clarity, performance, DRY refactors  
- Tests, typing, a11y attributes that don’t change visuals  
- Security hardening  

### 32.2 Not allowed as “refactor”

- Spacing/color/layout/animation/icon/copy changes vs HTML  

### 32.3 Process

1. Green tests before structural refactor.  
2. Keep PRs refactor-only when possible (no behavior change).  
3. Preserve public API contracts.  
4. Update mappers/OpenAPI if DTO shapes change.  
5. Re-run UI verification if markup structure shifts (even if “same look”).  

### 32.4 When to refactor

- Before adding a third duplicate.  
- When a sprint touch already requires editing the messy module.  
- Not as drive-by unrelated churn in feature PRs (reviewer may reject).

---

## 33. Example Code

### 33.1 Feature hook + API (frontend)

```ts
// features/leads/hooks/useCreateLead.ts
'use client';

import { leadsApi } from '@/lib/api/leads';
import type { CreateLeadInput, LeadDto } from '@/types/leads';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: LeadDto }
  | { status: 'error'; message: string };

export function useCreateLead() {
  const [state, setState] = React.useState<State>({ status: 'idle' });

  async function create(input: CreateLeadInput) {
    setState({ status: 'loading' });
    try {
      const data = await leadsApi.create(input);
      setState({ status: 'success', data });
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Request failed';
      setState({ status: 'error', message });
      throw e;
    }
  }

  return { state, create };
}
```

### 33.2 Express route → service (backend)

```ts
// routes/leads.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createLeadSchema } from '../validators/lead.schema';
import { leadService } from '../services/lead.service';

export const leadsRouter = Router();

leadsRouter.post('/', validate(createLeadSchema), async (req, res, next) => {
  try {
    const lead = await leadService.createFromPublic(req.body);
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
});

leadsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const items = await leadService.listForUser(req.user!);
    res.json(items);
  } catch (err) {
    next(err);
  }
});
```

### 33.3 Repository + mapper

```ts
// repositories/property.repository.ts
export const propertyRepository = {
  async findPublishedById(id: string) {
    return prisma.property.findFirst({
      where: { id, status: 'published' },
      include: { amenities: true, images: true, agent: true, landmarks: true },
    });
  },
};

// mappers/property.mapper.ts
export function toPropertyDetailDto(row: PropertyWithRelations): PropertyDetailDto {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    bedrooms: row.bedrooms,
    // …map snake → camel; never include internal fields
  };
}
```

### 33.4 Discriminated UI render

```tsx
if (state.status === 'loading') return <SearchLoadingState />;
if (state.status === 'empty') return <SearchEmptyState />;
if (state.status === 'error') return <SearchFallbackState reason={state.message} />;
return <SearchResultsStandard data={state.data} />;
```

---

## 34. Good vs Bad Examples

### 34.1 Business logic placement

```tsx
// BAD — rule in UI
{user.role !== 'Admin' ? null : <DeleteButton onClick={() => fetch('/api/properties/'+id, { method:'DELETE' })} />}

// GOOD — UI calls hook; server enforces AuthZ
{canShowAdminActions && <DeleteButton onClick={() => removeProperty(id)} />}
// hook → propertiesApi.remove; API → requireRole('Admin'|'SuperAdmin') → service
```

### 34.2 Fetch discipline

```ts
// BAD
await fetch('/api/v1/properties/' + id);

// GOOD
await propertiesApi.get(id);
```

### 34.3 AI policy

```ts
// BAD
if (geminiFails) return await openAiSearch(query);

// GOOD
if (geminiFails) return { mode: 'fallback', results: await filterSearch(query) };
```

### 34.4 Naming

```ts
// BAD
function doIt(x: any) { return x.a + x.b; }

// GOOD
function formatListingPrice(amount: number, currency: string): string { … }
```

### 34.5 YAGNI / MVP honesty

```tsx
// BAD
<NavLink href="/admin/leads/pipeline">Kanban</NavLink>

// GOOD — omit from MVP nav entirely
```

### 34.6 Types

```ts
// BAD
const [data, setData] = useState<any>(null);

// GOOD
const [state, setState] = useState<AsyncState<PropertyDetailDto>>({ status: 'idle' });
```

### 34.7 Errors

```ts
// BAD
try { await publish(); } catch (e) {}

// GOOD
try {
  await publish();
} catch (e) {
  logger.error({ err: e, propertyId }, 'publish failed');
  setState({ status: 'error', message: toUserMessage(e) });
}
```

---

## 35. Checklist before Commit

Copy this into PR self-review. All applicable items must pass.

### 35.1 Scope & Process

- [ ] Linked Epic / Feature ID  
- [ ] In MVP scope (or explicit post-MVP approval)  
- [ ] No Out-of-MVP navigation or backends introduced  
- [ ] Lifecycle stage respected (no FE-only inventing without API contract for new behavior)

### 35.2 Architecture

- [ ] No business logic in UI components  
- [ ] Hooks orchestrate; `lib/api` used for HTTP  
- [ ] Backend logic in services; Prisma in repositories  
- [ ] No circular feature imports  
- [ ] Gemini only; keys not in client  

### 35.3 Quality

- [ ] TypeScript strict clean (no new `any` without note)  
- [ ] ESLint clean (no warnings on completed screens)  
- [ ] Unit tests for new business logic  
- [ ] Integration tests for new endpoints (happy + 401/403 + validation)  
- [ ] No `console` errors on touched flows  
- [ ] No secrets, `.env`, or dumps committed  

### 35.4 UI (if applicable)

- [ ] Compared to `design_reference/.../code.html` and `screen.png`  
- [ ] Loading / empty / error / hover / focus handled  
- [ ] Responsive checked (mobile/tablet/desktop as applicable)  
- [ ] A11y baseline (labels, focus, alt) without visual redesign  
- [ ] Real API integrated or mock ticket referenced and not left as Done  

### 35.5 Data & API

- [ ] OpenAPI updated if contract changed  
- [ ] Migrations included if schema changed  
- [ ] Naming matches DB/API conventions  
- [ ] Validation on writes  

### 35.6 Security & Ops

- [ ] AuthZ default deny considered  
- [ ] Errors safe for clients  
- [ ] Logging has no secrets  

### 35.7 Git

- [ ] Atomic commit; message explains **why**  
- [ ] Branch named `feature/<epic>-<short-name>` or `fix/...`  
- [ ] PR will include UI evidence for user-facing changes  

---

## Appendix A — Quick Reference Card

| Topic | Rule |
|-------|------|
| UI SOT | HTML wins |
| Stack | Next 15, React 19, Tailwind, Express, Prisma, PostgreSQL, Gemini |
| Architecture | Feature-based + Clean layers |
| AuthZ | Five roles only |
| Notifications | Email + in-app |
| Maps | Leaflet + OSM |
| Coverage | >80% unit on core logic |
| DoD | Constitution §14 |

## Appendix B — Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Initial Coding Standards Manual from governing project docs |

---

**End of Coding Standards Manual**

*When this manual conflicts with the Constitution, the Constitution wins—then amend this manual to match.*
