# PropVista CRM / Property AI Studio — Task Breakdown

| Field | Value |
|-------|--------|
| **Document** | `10_TASK_BREAKDOWN.md` |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **Rule** | No task exceeds **one working day (8 hours)** |
| **Backlog** | `08_EPICS_AND_FEATURES.md` |
| **Sprints** | `09_SPRINT_PLAN.md` |
| **Governance** | `00_PROJECT_CONSTITUTION.md` |

## 1. How to use

1. Pick tasks by Sprint / Feature ID.
2. Respect **Dependencies** before starting.
3. Layers: **Backend**, **Frontend**, **Testing**, **Documentation**.
4. Done = task Acceptance Criteria + Constitution DoD for the slice.
5. Files listed are primary touch targets (create if missing).

## 2. Task ID scheme

`TASK-{epicFeat}-{LAYER}-{nn}` — e.g. `TASK-04-02-FE-01` (Feature 04-02, Frontend, #01).

Layers: `BE` Backend · `FE` Frontend · `QA` Testing · `DOC` Documentation.

## 3. Summary counts

| Scope | Features | Tasks | Est. Hours (MVP) |
|-------|----------|-------|------------------|
| MVP | 35 | 143 | 641 |
| Future (doc-only) | 6 | 6 | — |
| **Total** | 41 | 149 | — |

| Layer (MVP) | Task count |
|-------------|------------|
| Backend | 43 |
| Frontend | 57 |
| Testing | 35 |
| Documentation | 8 |

---
## 4. Feature → Task Index

| Feature | Sprint | Tasks | Hours |
|---------|--------|-------|-------|
| FEAT-00-01 Repo & Stack Scaffold | 0 | 6 | 19 |
| FEAT-00-02 Design Tokens & Shared UI Primitives | 0 | 5 | 18 |
| FEAT-00-03 Centralized API Client & Auth Shell | 0 | 5 | 16 |
| FEAT-01-01 Register & Login | 1 | 6 | 28 |
| FEAT-01-02 Session, Logout & Route Guards | 1 | 6 | 23 |
| FEAT-02-01 User Administration | 2 | 4 | 17 |
| FEAT-02-02 Agent Profiles | 2 | 3 | 14 |
| FEAT-07-01 Property Inventory Admin View | 3 | 8 | 41 |
| FEAT-07-02 Listing Editor Basic Info | 3 | 5 | 26 |
| FEAT-07-03 Property Media Photos + Floorplan | 3 | 3 | 14 |
| FEAT-05-01 Property Detail Page | 4 | 4 | 23 |
| FEAT-17-01 Property Map & Landmarks | 4 | 3 | 11 |
| FEAT-05-02 Detail CTAs | 4 | 4 | 14 |
| FEAT-04-01 NLP Search API Gemini | 5 | 5 | 24 |
| FEAT-04-02 Search Results Standard UI | 5 | 4 | 23 |
| FEAT-04-03 Search Fallback & Empty States | 5 | 3 | 14 |
| FEAT-03-01 Homepage Shell & Marketing | 6 | 4 | 21 |
| FEAT-03-02 Homepage Lead Capture | 6 | 2 | 5 |
| FEAT-09-01 Lead Capture & List | 7 | 3 | 14 |
| FEAT-09-02 Lead Detail MVP Subset | 7 | 5 | 27 |
| FEAT-10-01 Schedule Visit | 7 | 3 | 12 |
| FEAT-06-01 Favorites | 8 | 3 | 10 |
| FEAT-06-02 Saved Searches | 8 | 3 | 11 |
| FEAT-11-01 Customer Dashboard | 8 | 4 | 20 |
| FEAT-12-01 AI Chatbot Widget | 9 | 3 | 16 |
| FEAT-12-02 Loan Analysis | 9 | 3 | 14 |
| FEAT-13-01 AI Config Admin UI | 9 | 3 | 16 |
| FEAT-14-01 In-App Notifications | 10 | 4 | 14 |
| FEAT-14-02 Email Notifications & Rules | 10 | 4 | 20 |
| FEAT-15-01 CMS Pages Admin & Public | 10 | 4 | 16 |
| FEAT-08-01 Bulk Upload Validate & Import | 11 | 6 | 29 |
| FEAT-16-01 Command Center Dashboard | 12 | 5 | 28 |
| FEAT-16-02 Admin Reports View | 12 | 3 | 9 |
| FEAT-18-01 Shared UX States & A11y Baseline | 13 | 3 | 22 |
| FEAT-18-02 Health Observability & Frontend Deploy | 13 | 4 | 12 |

---

## FEAT-00-01: Repo & Stack Scaffold

| Field | Value |
|-------|--------|
| **Feature** | FEAT-00-01 |
| **Epic** | EPIC-00 |
| **Sprint** | 0 |
| **Task count** | 6 |
| **Total hours** | 19 |

### Backend Tasks

#### TASK-00-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-01-BE-01` |
| **Description** | Initialize Express+TS backend package with health route stub |
| **Layer** | Backend |
| **Dependencies** | None |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/package.json`, `backend/src/app.ts`, `backend/src/routes/health.routes.ts` |

**Acceptance Criteria**
  - [ ] Backend boots with `npm run dev`
  - [ ] GET /api/v1/health returns 200

#### TASK-00-01-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-01-BE-02` |
| **Description** | Add Prisma + PostgreSQL connection and baseline migrate script |
| **Layer** | Backend |
| **Dependencies** | TASK-00-01-BE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/prisma/schema.prisma`, `backend/.env.example` |

**Acceptance Criteria**
  - [ ] prisma migrate works on empty DB
  - [ ] Prisma Client generates

### Frontend Tasks

#### TASK-00-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-01-FE-01` |
| **Description** | Initialize Next.js 15 App Router + TS strict + Tailwind |
| **Layer** | Frontend |
| **Dependencies** | None |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/package.json`, `frontend/tsconfig.json`, `frontend/tailwind.config.ts` |

**Acceptance Criteria**
  - [ ] Frontend boots
  - [ ] strict TS + ESLint configured

#### TASK-00-01-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-01-FE-02` |
| **Description** | Create feature-based folder skeleton per Constitution |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-01-FE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** | `frontend/src/**`, `frontend/README.md` |

**Acceptance Criteria**
  - [ ] features/, components/, lib/api/, app/ groups exist
  - [ ] README run instructions

### Testing Tasks

#### TASK-00-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-01-QA-01` |
| **Description** | Smoke: both apps boot; document env vars |
| **Layer** | Testing |
| **Dependencies** | TASK-00-01-BE-02, TASK-00-01-FE-02 |
| **Estimated Hours** | 2 |
| **Files to Modify** | `docs/20_PROJECT_HANDOVER_GUIDE.md` |

**Acceptance Criteria**
  - [ ] Health smoke recorded
  - [ ] .env.example complete without secrets

### Documentation Tasks

#### TASK-00-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-01-DOC-01` |
| **Description** | Document local run commands in README |
| **Layer** | Documentation |
| **Dependencies** | TASK-00-01-FE-02 |
| **Estimated Hours** | 1 |
| **Files to Modify** | `README.md` |

**Acceptance Criteria**
  - [ ] Clone-run steps accurate


## FEAT-00-02: Design Tokens & Shared UI Primitives

| Field | Value |
|-------|--------|
| **Feature** | FEAT-00-02 |
| **Epic** | EPIC-00 |
| **Sprint** | 0 |
| **Task count** | 5 |
| **Total hours** | 18 |

### Frontend Tasks

#### TASK-00-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-02-FE-01` |
| **Description** | Port DESIGN.md tokens into Tailwind/CSS variables |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-01-FE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `frontend/src/styles/tokens.css`, `frontend/tailwind.config.ts`, `docs/design_reference/propvista_crm/DESIGN.md` |

**Acceptance Criteria**
  - [ ] Tokens match DESIGN.md colors/type/radii

#### TASK-00-02-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-02-FE-02` |
| **Description** | Build Button, Input, Modal primitives matching HTML patterns |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-02-FE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `frontend/src/components/ui/Button.tsx`, `Input.tsx`, `Modal.tsx` |

**Acceptance Criteria**
  - [ ] Primitives reusable
  - [ ] No redesign vs HTML patterns

#### TASK-00-02-FE-03

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-02-FE-03` |
| **Description** | Build Loader, Skeleton, Empty, Error state components |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-02-FE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/components/states/**` |

**Acceptance Criteria**
  - [ ] State components usable across screens

#### TASK-00-02-FE-04

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-02-FE-04` |
| **Description** | Add search magnifying-glass asset to public/ |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-02-FE-01 |
| **Estimated Hours** | 1 |
| **Files to Modify** | `frontend/public/**` |

**Acceptance Criteria**
  - [ ] Asset available where HTML uses it

### Testing Tasks

#### TASK-00-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-02-QA-01` |
| **Description** | Visual spot-check primitives vs DESIGN.md |
| **Layer** | Testing |
| **Dependencies** | TASK-00-02-FE-02, TASK-00-02-FE-03 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] No token drift noted


## FEAT-00-03: Centralized API Client & Auth Shell

| Field | Value |
|-------|--------|
| **Feature** | FEAT-00-03 |
| **Epic** | EPIC-00 |
| **Sprint** | 0 |
| **Task count** | 5 |
| **Total hours** | 16 |

### Backend Tasks

#### TASK-00-03-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-03-BE-01` |
| **Description** | Add requestId middleware + centralized errorHandler envelope |
| **Layer** | Backend |
| **Dependencies** | TASK-00-01-BE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/middleware/errorHandler.ts`, `requestId.middleware.ts` |

**Acceptance Criteria**
  - [ ] Errors return {error:{code,message,details}}
  - [ ] requestId on logs

### Frontend Tasks

#### TASK-00-03-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-03-FE-01` |
| **Description** | Implement lib/api/client with baseURL + error envelope parse |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-01-FE-02 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/lib/api/client.ts`, `frontend/src/types/api.ts` |

**Acceptance Criteria**
  - [ ] Envelope mapped to AppError
  - [ ] No fetch outside client

#### TASK-00-03-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-03-FE-02` |
| **Description** | Add refresh interceptor stub and resource module pattern |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-03-FE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `frontend/src/lib/api/client.ts`, `frontend/src/lib/api/health.ts` |

**Acceptance Criteria**
  - [ ] 401 triggers refresh contract stub
  - [ ] Sample health module works

### Testing Tasks

#### TASK-00-03-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-03-QA-01` |
| **Description** | Integration smoke health via FE client |
| **Layer** | Testing |
| **Dependencies** | TASK-00-03-FE-02, TASK-00-03-BE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] FE can call health through lib/api

### Documentation Tasks

#### TASK-00-03-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-00-03-DOC-01` |
| **Description** | Note API client rules in FE architecture cross-link |
| **Layer** | Documentation |
| **Dependencies** | TASK-00-03-FE-01 |
| **Estimated Hours** | 1 |
| **Files to Modify** | `docs/06_FRONTEND_ARCHITECTURE.md` |

**Acceptance Criteria**
  - [ ] Handover/FE arch paths valid


## FEAT-01-01: Register & Login

| Field | Value |
|-------|--------|
| **Feature** | FEAT-01-01 |
| **Epic** | EPIC-01 |
| **Sprint** | 1 |
| **Task count** | 6 |
| **Total hours** | 28 |

### Backend Tasks

#### TASK-01-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-01-BE-01` |
| **Description** | Prisma User + password_hash; register endpoint + validation |
| **Layer** | Backend |
| **Dependencies** | TASK-00-01-BE-02 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/prisma/schema.prisma`, `backend/src/services/auth.service.ts`, `backend/src/routes/auth.routes.ts` |

**Acceptance Criteria**
  - [ ] Register creates user
  - [ ] Duplicate email 409
  - [ ] Password hashed

#### TASK-01-01-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-01-BE-02` |
| **Description** | Login issues access+refresh tokens; store refresh |
| **Layer** | Backend |
| **Dependencies** | TASK-01-01-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `backend/src/services/auth.service.ts`, `backend/src/repositories/refreshToken.repository.ts` |

**Acceptance Criteria**
  - [ ] Login returns tokens
  - [ ] Invalid credentials safe 401

### Frontend Tasks

#### TASK-01-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-01-FE-01` |
| **Description** | Login page UI matching prototype/HTML patterns |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-02-FE-02 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `frontend/src/app/(auth)/login/page.tsx`, `frontend/src/features/auth/**` |

**Acceptance Criteria**
  - [ ] Form validation inline
  - [ ] Calls lib/api/auth

#### TASK-01-01-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-01-FE-02` |
| **Description** | Register page + auth API module |
| **Layer** | Frontend |
| **Dependencies** | TASK-01-01-FE-01, TASK-01-01-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/app/(auth)/register/page.tsx`, `frontend/src/lib/api/auth.ts` |

**Acceptance Criteria**
  - [ ] Register success navigates appropriately

### Testing Tasks

#### TASK-01-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-01-QA-01` |
| **Description** | Integration tests register/login happy + validation |
| **Layer** | Testing |
| **Dependencies** | TASK-01-01-BE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/**/*.test.ts` |

**Acceptance Criteria**
  - [ ] Tests green in CI

### Documentation Tasks

#### TASK-01-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-01-DOC-01` |
| **Description** | OpenAPI auth paths verified/updated |
| **Layer** | Documentation |
| **Dependencies** | TASK-01-01-BE-02 |
| **Estimated Hours** | 2 |
| **Files to Modify** | `docs/openapi.yaml` |

**Acceptance Criteria**
  - [ ] openapi.yaml matches


## FEAT-01-02: Session, Logout & Route Guards

| Field | Value |
|-------|--------|
| **Feature** | FEAT-01-02 |
| **Epic** | EPIC-01 |
| **Sprint** | 1 |
| **Task count** | 6 |
| **Total hours** | 23 |

### Backend Tasks

#### TASK-01-02-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-02-BE-01` |
| **Description** | Refresh + logout revoke endpoints |
| **Layer** | Backend |
| **Dependencies** | TASK-01-01-BE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/routes/auth.routes.ts`, `backend/src/middleware/requireAuth.middleware.ts` |

**Acceptance Criteria**
  - [ ] Refresh works
  - [ ] Logout invalidates refresh

#### TASK-01-02-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-02-BE-02` |
| **Description** | requireAuth + requireRole middleware |
| **Layer** | Backend |
| **Dependencies** | TASK-01-02-BE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/middleware/requireRole.middleware.ts` |

**Acceptance Criteria**
  - [ ] 401/403 correct

### Frontend Tasks

#### TASK-01-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-02-FE-01` |
| **Description** | Auth store + client refresh wiring |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-03-FE-02, TASK-01-02-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/lib/auth/**`, `frontend/src/lib/api/client.ts` |

**Acceptance Criteria**
  - [ ] Session hydrates
  - [ ] 401 refresh once

#### TASK-01-02-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-02-FE-02` |
| **Description** | RequireAuth / RequireRole layouts for customer/admin |
| **Layer** | Frontend |
| **Dependencies** | TASK-01-02-FE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/app/(customer)/layout.tsx`, `frontend/src/app/(admin)/layout.tsx` |

**Acceptance Criteria**
  - [ ] Customer cannot open admin
  - [ ] Guest redirected

#### TASK-01-02-FE-03

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-02-FE-03` |
| **Description** | Wire homepage Sign In / Join AI Pro CTAs |
| **Layer** | Frontend |
| **Dependencies** | TASK-01-01-FE-02 |
| **Estimated Hours** | 2 |
| **Files to Modify** | `frontend/src/features/home/**` |

**Acceptance Criteria**
  - [ ] CTAs navigate correctly

### Testing Tasks

#### TASK-01-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-01-02-QA-01` |
| **Description** | Role matrix smoke Guest/Customer/Admin |
| **Layer** | Testing |
| **Dependencies** | TASK-01-02-FE-02 |
| **Estimated Hours** | 3 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] 403/redirect verified


## FEAT-02-01: User Administration

| Field | Value |
|-------|--------|
| **Feature** | FEAT-02-01 |
| **Epic** | EPIC-02 |
| **Sprint** | 2 |
| **Task count** | 4 |
| **Total hours** | 17 |

### Backend Tasks

#### TASK-02-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-02-01-BE-01` |
| **Description** | Users CRUD APIs with Admin role gate + pagination |
| **Layer** | Backend |
| **Dependencies** | TASK-01-02-BE-02 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/src/routes/users.routes.ts`, `backend/src/services/user.service.ts` |

**Acceptance Criteria**
  - [ ] Non-admin 403
  - [ ] List paginated
  - [ ] Deactivate works

### Frontend Tasks

#### TASK-02-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-02-01-FE-01` |
| **Description** | Admin users list/create/edit UI |
| **Layer** | Frontend |
| **Dependencies** | TASK-02-01-BE-01, TASK-00-02-FE-02 |
| **Estimated Hours** | 7 |
| **Files to Modify** | `frontend/src/features/admin/users/**`, `frontend/src/lib/api/users.ts` |

**Acceptance Criteria**
  - [ ] Role assign limited to five roles
  - [ ] Loading/empty/error

### Testing Tasks

#### TASK-02-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-02-01-QA-01` |
| **Description** | API tests 401/403/400 + admin happy path |
| **Layer** | Testing |
| **Dependencies** | TASK-02-01-BE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** | `backend/**/*.test.ts` |

**Acceptance Criteria**
  - [ ] CI green

### Documentation Tasks

#### TASK-02-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-02-01-DOC-01` |
| **Description** | OpenAPI users tag sync |
| **Layer** | Documentation |
| **Dependencies** | TASK-02-01-BE-01 |
| **Estimated Hours** | 1 |
| **Files to Modify** | `docs/openapi.yaml` |

**Acceptance Criteria**
  - [ ] Spec matches


## FEAT-02-02: Agent Profiles

| Field | Value |
|-------|--------|
| **Feature** | FEAT-02-02 |
| **Epic** | EPIC-02 |
| **Sprint** | 2 |
| **Task count** | 3 |
| **Total hours** | 14 |

### Backend Tasks

#### TASK-02-02-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-02-02-BE-01` |
| **Description** | Agents CRUD + image upload local storage |
| **Layer** | Backend |
| **Dependencies** | TASK-02-01-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/src/routes/agents.routes.ts`, `backend/src/integrations/storage/**` |

**Acceptance Criteria**
  - [ ] CRUD works
  - [ ] Image stored locally in dev

### Frontend Tasks

#### TASK-02-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-02-02-FE-01` |
| **Description** | Admin agents UI |
| **Layer** | Frontend |
| **Dependencies** | TASK-02-02-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `frontend/src/features/admin/agents/**`, `frontend/src/lib/api/agents.ts` |

**Acceptance Criteria**
  - [ ] Create/edit name/email/phone/image

### Testing Tasks

#### TASK-02-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-02-02-QA-01` |
| **Description** | Upload type/size rejection tests |
| **Layer** | Testing |
| **Dependencies** | TASK-02-02-BE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Invalid file rejected


## FEAT-07-01: Property Inventory Admin View

| Field | Value |
|-------|--------|
| **Feature** | FEAT-07-01 |
| **Epic** | EPIC-07 |
| **Sprint** | 3 |
| **Task count** | 8 |
| **Total hours** | 41 |

### Backend Tasks

#### TASK-07-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-01-BE-01` |
| **Description** | Property Prisma models + list API with filters/sort/page |
| **Layer** | Backend |
| **Dependencies** | TASK-01-02-BE-02 |
| **Estimated Hours** | 7 |
| **Files to Modify** | `backend/prisma/schema.prisma`, `backend/src/repositories/property.repository.ts`, `backend/src/routes/properties.routes.ts` |

**Acceptance Criteria**
  - [ ] Paginated list
  - [ ] Status filter
  - [ ] Agent scope

#### TASK-07-01-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-01-BE-02` |
| **Description** | Row actions APIs: archive/delete/duplicate + bulk status |
| **Layer** | Backend |
| **Dependencies** | TASK-07-01-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/src/services/property.service.ts` |

**Acceptance Criteria**
  - [ ] Duplicate creates draft copy
  - [ ] Bulk status updates

#### TASK-07-01-BE-03

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-01-BE-03` |
| **Description** | CSV export endpoint capped/paginated safely |
| **Layer** | Backend |
| **Dependencies** | TASK-07-01-BE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/routes/properties.routes.ts` |

**Acceptance Criteria**
  - [ ] Export downloads
  - [ ] Admin/Agent authorized

### Frontend Tasks

#### TASK-07-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-01-FE-01` |
| **Description** | SCR-PROP-INV table shell + search/filter/sort UI |
| **Layer** | Frontend |
| **Dependencies** | TASK-07-01-BE-01, TASK-00-02-FE-02 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/properties/inventory/**`, `frontend/src/app/(admin)/properties/page.tsx` |

**Acceptance Criteria**
  - [ ] Matches inventory HTML layout
  - [ ] Loading state

#### TASK-07-01-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-01-FE-02` |
| **Description** | Row actions + bulk bar + column toggle + empty state |
| **Layer** | Frontend |
| **Dependencies** | TASK-07-01-FE-01, TASK-07-01-BE-02 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/properties/inventory/**` |

**Acceptance Criteria**
  - [ ] Pixel checklist inventory interactions
  - [ ] Empty state

#### TASK-07-01-FE-03

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-01-FE-03` |
| **Description** | Wire CSV export control |
| **Layer** | Frontend |
| **Dependencies** | TASK-07-01-FE-01, TASK-07-01-BE-03 |
| **Estimated Hours** | 2 |
| **Files to Modify** | `frontend/src/lib/api/properties.ts` |

**Acceptance Criteria**
  - [ ] Export triggers download

### Testing Tasks

#### TASK-07-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-01-QA-01` |
| **Description** | UI fidelity pass SCR-PROP-INV desktop |
| **Layer** | Testing |
| **Dependencies** | TASK-07-01-FE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Pixel checklist Pass or defects filed

### Documentation Tasks

#### TASK-07-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-01-DOC-01` |
| **Description** | Update OpenAPI properties list/export |
| **Layer** | Documentation |
| **Dependencies** | TASK-07-01-BE-03 |
| **Estimated Hours** | 2 |
| **Files to Modify** | `docs/openapi.yaml` |

**Acceptance Criteria**
  - [ ] Spec synced


## FEAT-07-02: Listing Editor Basic Info

| Field | Value |
|-------|--------|
| **Feature** | FEAT-07-02 |
| **Epic** | EPIC-07 |
| **Sprint** | 3 |
| **Task count** | 5 |
| **Total hours** | 26 |

### Backend Tasks

#### TASK-07-02-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-02-BE-01` |
| **Description** | Create/update property + draft/publish transitions |
| **Layer** | Backend |
| **Dependencies** | TASK-07-01-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/src/services/property.service.ts`, `backend/src/validators/property.schema.ts` |

**Acceptance Criteria**
  - [ ] Draft/Publish persist
  - [ ] Validation 400

#### TASK-07-02-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-02-BE-02` |
| **Description** | Amenities + custom amenity persistence |
| **Layer** | Backend |
| **Dependencies** | TASK-07-02-BE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/prisma/schema.prisma`, `backend/src/repositories/property.repository.ts` |

**Acceptance Criteria**
  - [ ] Amenities saved/reloaded

### Frontend Tasks

#### TASK-07-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-02-FE-01` |
| **Description** | SCR-PROP-EDIT form fields + amenities UI (no video/tour) |
| **Layer** | Frontend |
| **Dependencies** | TASK-07-02-BE-02, TASK-00-02-FE-02 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/properties/editor/**`, `frontend/src/app/(admin)/properties/**/edit/**` |

**Acceptance Criteria**
  - [ ] Matches listing editor HTML
  - [ ] Video/tour controls absent

#### TASK-07-02-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-02-FE-02` |
| **Description** | Wire Save Draft / Publish actions + validation UX |
| **Layer** | Frontend |
| **Dependencies** | TASK-07-02-FE-01, TASK-07-02-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/features/properties/editor/**` |

**Acceptance Criteria**
  - [ ] Draft/Publish work
  - [ ] Inline errors

### Testing Tasks

#### TASK-07-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-02-QA-01` |
| **Description** | API + UI tests draft/publish |
| **Layer** | Testing |
| **Dependencies** | TASK-07-02-FE-02 |
| **Estimated Hours** | 3 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] AC Pass


## FEAT-07-03: Property Media Photos + Floorplan

| Field | Value |
|-------|--------|
| **Feature** | FEAT-07-03 |
| **Epic** | EPIC-07 |
| **Sprint** | 3 |
| **Task count** | 3 |
| **Total hours** | 14 |

### Backend Tasks

#### TASK-07-03-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-03-BE-01` |
| **Description** | Media upload endpoints local FS + metadata |
| **Layer** | Backend |
| **Dependencies** | TASK-07-02-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/src/routes/properties.routes.ts`, `backend/src/integrations/storage/**` |

**Acceptance Criteria**
  - [ ] Photo/floorplan upload
  - [ ] Type/size checks

### Frontend Tasks

#### TASK-07-03-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-03-FE-01` |
| **Description** | Editor media upload UI sections |
| **Layer** | Frontend |
| **Dependencies** | TASK-07-03-BE-01, TASK-07-02-FE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `frontend/src/features/properties/editor/media/**` |

**Acceptance Criteria**
  - [ ] Upload shows in editor
  - [ ] Errors surfaced

### Testing Tasks

#### TASK-07-03-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-07-03-QA-01` |
| **Description** | Upload rejection + happy path tests |
| **Layer** | Testing |
| **Dependencies** | TASK-07-03-BE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Tests green


## FEAT-05-01: Property Detail Page

| Field | Value |
|-------|--------|
| **Feature** | FEAT-05-01 |
| **Epic** | EPIC-05 |
| **Sprint** | 4 |
| **Task count** | 4 |
| **Total hours** | 23 |

### Backend Tasks

#### TASK-05-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-05-01-BE-01` |
| **Description** | GET property detail DTO with amenities/images/agent/similar |
| **Layer** | Backend |
| **Dependencies** | TASK-07-03-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/src/services/property.service.ts`, `backend/src/mappers/property.mapper.ts` |

**Acceptance Criteria**
  - [ ] Published detail 200
  - [ ] 404 envelope

### Frontend Tasks

#### TASK-05-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-05-01-FE-01` |
| **Description** | SCR-PROP-D layout: gallery, overview, amenities, price, agent |
| **Layer** | Frontend |
| **Dependencies** | TASK-05-01-BE-01, TASK-00-02-FE-02 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/properties/detail/**`, `frontend/src/app/(public)/properties/[id]/page.tsx` |

**Acceptance Criteria**
  - [ ] Sections match HTML
  - [ ] Loading/404

#### TASK-05-01-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-05-01-FE-02` |
| **Description** | Floorplan + similar properties carousel |
| **Layer** | Frontend |
| **Dependencies** | TASK-05-01-FE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/features/properties/detail/**` |

**Acceptance Criteria**
  - [ ] Floorplan section
  - [ ] Similar carousel

### Testing Tasks

#### TASK-05-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-05-01-QA-01` |
| **Description** | Pixel pass SCR-PROP-D desktop core sections |
| **Layer** | Testing |
| **Dependencies** | TASK-05-01-FE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Checklist Pass or bugs filed


## FEAT-17-01: Property Map & Landmarks

| Field | Value |
|-------|--------|
| **Feature** | FEAT-17-01 |
| **Epic** | EPIC-17 |
| **Sprint** | 4 |
| **Task count** | 3 |
| **Total hours** | 11 |

### Backend Tasks

#### TASK-17-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-17-01-BE-01` |
| **Description** | Landmarks on property detail payload |
| **Layer** | Backend |
| **Dependencies** | TASK-05-01-BE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** | `backend/prisma/schema.prisma`, `backend/src/mappers/property.mapper.ts` |

**Acceptance Criteria**
  - [ ] Landmarks array when present

### Frontend Tasks

#### TASK-17-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-17-01-FE-01` |
| **Description** | Lazy-load Leaflet map client island + markers |
| **Layer** | Frontend |
| **Dependencies** | TASK-05-01-FE-01, TASK-17-01-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `frontend/src/features/properties/detail/MapSection.tsx` |

**Acceptance Criteria**
  - [ ] Leaflet+OSM only
  - [ ] SSR-safe dynamic import
  - [ ] Failure does not blank page

### Testing Tasks

#### TASK-17-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-17-01-QA-01` |
| **Description** | Map smoke on detail mobile/desktop |
| **Layer** | Testing |
| **Dependencies** | TASK-17-01-FE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Map chrome matches HTML


## FEAT-05-02: Detail CTAs

| Field | Value |
|-------|--------|
| **Feature** | FEAT-05-02 |
| **Epic** | EPIC-05 |
| **Sprint** | 4 |
| **Task count** | 4 |
| **Total hours** | 14 |

### Backend Tasks

#### TASK-05-02-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-05-02-BE-01` |
| **Description** | Minimal POST /leads from property inquire |
| **Layer** | Backend |
| **Dependencies** | TASK-01-02-BE-02, TASK-05-01-BE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/routes/leads.routes.ts`, `backend/src/services/lead.service.ts` |

**Acceptance Criteria**
  - [ ] Lead created with source/property

### Frontend Tasks

#### TASK-05-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-05-02-FE-01` |
| **Description** | Wire Inquire + Contact tel/mailto CTAs |
| **Layer** | Frontend |
| **Dependencies** | TASK-05-01-FE-01, TASK-05-02-BE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `frontend/src/features/properties/detail/Ctas.tsx` |

**Acceptance Criteria**
  - [ ] Inquire success UX
  - [ ] Contact actions present

#### TASK-05-02-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-05-02-FE-02` |
| **Description** | Wire Favorite + Schedule entry points (hooks may stub until later) |
| **Layer** | Frontend |
| **Dependencies** | TASK-05-01-FE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `frontend/src/features/properties/detail/**`, `frontend/src/features/favorites/**` |

**Acceptance Criteria**
  - [ ] Favorite prompts login if guest
  - [ ] Schedule opens modal when ready

### Testing Tasks

#### TASK-05-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-05-02-QA-01` |
| **Description** | Inquire creates lead integration test |
| **Layer** | Testing |
| **Dependencies** | TASK-05-02-BE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Lead visible via API


## FEAT-04-01: NLP Search API Gemini

| Field | Value |
|-------|--------|
| **Feature** | FEAT-04-01 |
| **Epic** | EPIC-04 |
| **Sprint** | 5 |
| **Task count** | 5 |
| **Total hours** | 24 |

### Backend Tasks

#### TASK-04-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-01-BE-01` |
| **Description** | Gemini adapter + timeout + rate limit for search |
| **Layer** | Backend |
| **Dependencies** | TASK-00-01-BE-02 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/src/integrations/gemini/**`, `backend/src/middleware/rateLimit.ts` |

**Acceptance Criteria**
  - [ ] Key server-only
  - [ ] Timeout returns structured error
  - [ ] Rate limit 429

#### TASK-04-01-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-01-BE-02` |
| **Description** | Search service: NL parse → ranked properties + scores/reasons |
| **Layer** | Backend |
| **Dependencies** | TASK-04-01-BE-01, TASK-07-01-BE-01 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `backend/src/services/search.service.ts`, `backend/src/routes/search.routes.ts` |

**Acceptance Criteria**
  - [ ] Success payload with scores
  - [ ] Does not invent inventory

#### TASK-04-01-BE-03

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-01-BE-03` |
| **Description** | Filter-only search path for fallback |
| **Layer** | Backend |
| **Dependencies** | TASK-04-01-BE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/services/search.service.ts` |

**Acceptance Criteria**
  - [ ] Filter search works without Gemini

### Testing Tasks

#### TASK-04-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-01-QA-01` |
| **Description** | Unit/integration tests with mocked Gemini success/fail |
| **Layer** | Testing |
| **Dependencies** | TASK-04-01-BE-03 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/**/*.test.ts` |

**Acceptance Criteria**
  - [ ] Mocked CI tests green

### Documentation Tasks

#### TASK-04-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-01-DOC-01` |
| **Description** | OpenAPI search operations sync |
| **Layer** | Documentation |
| **Dependencies** | TASK-04-01-BE-02 |
| **Estimated Hours** | 2 |
| **Files to Modify** | `docs/openapi.yaml` |

**Acceptance Criteria**
  - [ ] Spec accurate


## FEAT-04-02: Search Results Standard UI

| Field | Value |
|-------|--------|
| **Feature** | FEAT-04-02 |
| **Epic** | EPIC-04 |
| **Sprint** | 5 |
| **Task count** | 4 |
| **Total hours** | 23 |

### Frontend Tasks

#### TASK-04-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-02-FE-01` |
| **Description** | SCR-SEARCH-STD shell: results grid, scores, reasons |
| **Layer** | Frontend |
| **Dependencies** | TASK-04-01-BE-02, TASK-00-02-FE-03 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/search/**`, `frontend/src/app/(public)/search/page.tsx` |

**Acceptance Criteria**
  - [ ] Match % and reasons render
  - [ ] Loading state

#### TASK-04-02-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-02-FE-02` |
| **Description** | Filters panel + clear/reset + pagination + grid/list |
| **Layer** | Frontend |
| **Dependencies** | TASK-04-02-FE-01 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/search/**` |

**Acceptance Criteria**
  - [ ] Filters work
  - [ ] Pagination
  - [ ] Grid/list toggle

#### TASK-04-02-FE-03

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-02-FE-03` |
| **Description** | Favorite control on result cards |
| **Layer** | Frontend |
| **Dependencies** | TASK-04-02-FE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** | `frontend/src/features/search/**` |

**Acceptance Criteria**
  - [ ] Favorite wired or login prompt

### Testing Tasks

#### TASK-04-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-02-QA-01` |
| **Description** | Pixel pass SCR-SEARCH-STD |
| **Layer** | Testing |
| **Dependencies** | TASK-04-02-FE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Checklist Pass or bugs


## FEAT-04-03: Search Fallback & Empty States

| Field | Value |
|-------|--------|
| **Feature** | FEAT-04-03 |
| **Epic** | EPIC-04 |
| **Sprint** | 5 |
| **Task count** | 3 |
| **Total hours** | 14 |

### Frontend Tasks

#### TASK-04-03-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-03-FE-01` |
| **Description** | Wire AI fail → SCR-SEARCH-FB banner + filter results |
| **Layer** | Frontend |
| **Dependencies** | TASK-04-02-FE-01, TASK-04-01-BE-03 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `frontend/src/features/search/fallback/**` |

**Acceptance Criteria**
  - [ ] Fallback banner visible
  - [ ] Reset Search works

#### TASK-04-03-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-03-FE-02` |
| **Description** | Wire zero results → SCR-SEARCH-EMPTY |
| **Layer** | Frontend |
| **Dependencies** | TASK-04-02-FE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/features/search/empty/**` |

**Acceptance Criteria**
  - [ ] Empty guidance + chips match HTML

### Testing Tasks

#### TASK-04-03-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-04-03-QA-01` |
| **Description** | E2E/manual: force AI fail + empty paths |
| **Layer** | Testing |
| **Dependencies** | TASK-04-03-FE-01, TASK-04-03-FE-02 |
| **Estimated Hours** | 3 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] No blank dead-end


## FEAT-03-01: Homepage Shell & Marketing

| Field | Value |
|-------|--------|
| **Feature** | FEAT-03-01 |
| **Epic** | EPIC-03 |
| **Sprint** | 6 |
| **Task count** | 4 |
| **Total hours** | 21 |

### Frontend Tasks

#### TASK-03-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-03-01-FE-01` |
| **Description** | SCR-HOME header/hero/chips/footer fidelity |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-02-FE-02 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/home/**`, `frontend/src/app/(public)/page.tsx` |

**Acceptance Criteria**
  - [ ] Desktop matches screen.png hero/header

#### TASK-03-01-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-03-01-FE-02` |
| **Description** | Featured cards + journey + testimonials sections |
| **Layer** | Frontend |
| **Dependencies** | TASK-03-01-FE-01, TASK-07-01-BE-01 |
| **Estimated Hours** | 7 |
| **Files to Modify** | `frontend/src/features/home/**` |

**Acceptance Criteria**
  - [ ] Featured from API/seed
  - [ ] Sections match HTML

#### TASK-03-01-FE-03

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-03-01-FE-03` |
| **Description** | Wire chips/submit to /search |
| **Layer** | Frontend |
| **Dependencies** | TASK-03-01-FE-01, TASK-04-02-FE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** | `frontend/src/features/home/**` |

**Acceptance Criteria**
  - [ ] Navigation carries query

### Testing Tasks

#### TASK-03-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-03-01-QA-01` |
| **Description** | Pixel pass SCR-HOME desktop + mobile spot |
| **Layer** | Testing |
| **Dependencies** | TASK-03-01-FE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Checklist Pass or bugs


## FEAT-03-02: Homepage Lead Capture

| Field | Value |
|-------|--------|
| **Feature** | FEAT-03-02 |
| **Epic** | EPIC-03 |
| **Sprint** | 6 |
| **Task count** | 2 |
| **Total hours** | 5 |

### Frontend Tasks

#### TASK-03-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-03-02-FE-01` |
| **Description** | Public lead/contact form wired to POST /leads |
| **Layer** | Frontend |
| **Dependencies** | TASK-05-02-BE-01, TASK-03-01-FE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `frontend/src/features/home/**` |

**Acceptance Criteria**
  - [ ] Validation + success confirmation

### Testing Tasks

#### TASK-03-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-03-02-QA-01` |
| **Description** | Submit creates lead |
| **Layer** | Testing |
| **Dependencies** | TASK-03-02-FE-01 |
| **Estimated Hours** | 1 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Lead in API


## FEAT-09-01: Lead Capture & List

| Field | Value |
|-------|--------|
| **Feature** | FEAT-09-01 |
| **Epic** | EPIC-09 |
| **Sprint** | 7 |
| **Task count** | 3 |
| **Total hours** | 14 |

### Backend Tasks

#### TASK-09-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-09-01-BE-01` |
| **Description** | Leads list API pagination + Add lead create |
| **Layer** | Backend |
| **Dependencies** | TASK-05-02-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `backend/src/routes/leads.routes.ts`, `backend/src/services/lead.service.ts` |

**Acceptance Criteria**
  - [ ] Agent/Admin list
  - [ ] Add lead works

### Frontend Tasks

#### TASK-09-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-09-01-FE-01` |
| **Description** | Admin/Agent lead list + AddLeadModal |
| **Layer** | Frontend |
| **Dependencies** | TASK-09-01-BE-01 |
| **Estimated Hours** | 7 |
| **Files to Modify** | `frontend/src/features/leads/list/**` |

**Acceptance Criteria**
  - [ ] No Kanban link
  - [ ] List usable

### Testing Tasks

#### TASK-09-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-09-01-QA-01` |
| **Description** | API tests + absence of Kanban nav |
| **Layer** | Testing |
| **Dependencies** | TASK-09-01-FE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Tests + nav check


## FEAT-09-02: Lead Detail MVP Subset

| Field | Value |
|-------|--------|
| **Feature** | FEAT-09-02 |
| **Epic** | EPIC-09 |
| **Sprint** | 7 |
| **Task count** | 5 |
| **Total hours** | 27 |

### Backend Tasks

#### TASK-09-02-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-09-02-BE-01` |
| **Description** | GET/PATCH lead + stage change |
| **Layer** | Backend |
| **Dependencies** | TASK-09-01-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `backend/src/services/lead.service.ts` |

**Acceptance Criteria**
  - [ ] Stage persists
  - [ ] AuthZ scoped

#### TASK-09-02-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-09-02-BE-02` |
| **Description** | Lead notes create/list timestamped |
| **Layer** | Backend |
| **Dependencies** | TASK-09-02-BE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/routes/leads.routes.ts`, `backend/prisma/schema.prisma` |

**Acceptance Criteria**
  - [ ] Notes CRUD subset

### Frontend Tasks

#### TASK-09-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-09-02-FE-01` |
| **Description** | SCR-LEAD-D header/contact/interests/stage UI (MVP) |
| **Layer** | Frontend |
| **Dependencies** | TASK-09-02-BE-01 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/leads/detail/**`, `frontend/src/app/(admin)/leads/[id]/page.tsx` |

**Acceptance Criteria**
  - [ ] Layout fidelity MVP fields
  - [ ] No reminder/timeline product wired

#### TASK-09-02-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-09-02-FE-02` |
| **Description** | Notes panel + call/email actions + schedule entry |
| **Layer** | Frontend |
| **Dependencies** | TASK-09-02-FE-01, TASK-09-02-BE-02 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `frontend/src/features/leads/detail/**` |

**Acceptance Criteria**
  - [ ] Notes work
  - [ ] tel/mailto present

### Testing Tasks

#### TASK-09-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-09-02-QA-01` |
| **Description** | Pixel + functional MVP lead detail |
| **Layer** | Testing |
| **Dependencies** | TASK-09-02-FE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] AC Pass
  - [ ] Excluded products absent


## FEAT-10-01: Schedule Visit

| Field | Value |
|-------|--------|
| **Feature** | FEAT-10-01 |
| **Epic** | EPIC-10 |
| **Sprint** | 7 |
| **Task count** | 3 |
| **Total hours** | 12 |

### Backend Tasks

#### TASK-10-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-10-01-BE-01` |
| **Description** | POST /visits visit_request create + validation |
| **Layer** | Backend |
| **Dependencies** | TASK-01-02-BE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/routes/visits.routes.ts`, `backend/src/services/visit.service.ts` |

**Acceptance Criteria**
  - [ ] Visit persisted

### Frontend Tasks

#### TASK-10-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-10-01-FE-01` |
| **Description** | ScheduleVisitModal + wire property & lead CTAs |
| **Layer** | Frontend |
| **Dependencies** | TASK-10-01-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `frontend/src/features/scheduling/**` |

**Acceptance Criteria**
  - [ ] Modal validation
  - [ ] Success/error states

### Testing Tasks

#### TASK-10-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-10-01-QA-01` |
| **Description** | Integration + UI smoke schedule |
| **Layer** | Testing |
| **Dependencies** | TASK-10-01-FE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Visit created


## FEAT-06-01: Favorites

| Field | Value |
|-------|--------|
| **Feature** | FEAT-06-01 |
| **Epic** | EPIC-06 |
| **Sprint** | 8 |
| **Task count** | 3 |
| **Total hours** | 10 |

### Backend Tasks

#### TASK-06-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-06-01-BE-01` |
| **Description** | Favorites toggle + list APIs |
| **Layer** | Backend |
| **Dependencies** | TASK-01-02-BE-02, TASK-07-01-BE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/routes/favorites.routes.ts` |

**Acceptance Criteria**
  - [ ] Idempotent toggle
  - [ ] Customer only writes

### Frontend Tasks

#### TASK-06-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-06-01-FE-01` |
| **Description** | Favorite hooks on search/detail + login prompt |
| **Layer** | Frontend |
| **Dependencies** | TASK-06-01-BE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `frontend/src/features/favorites/**`, `frontend/src/lib/api/favorites.ts` |

**Acceptance Criteria**
  - [ ] Guest prompted
  - [ ] Customer toggles

### Testing Tasks

#### TASK-06-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-06-01-QA-01` |
| **Description** | API tests favorites |
| **Layer** | Testing |
| **Dependencies** | TASK-06-01-BE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Green


## FEAT-06-02: Saved Searches

| Field | Value |
|-------|--------|
| **Feature** | FEAT-06-02 |
| **Epic** | EPIC-06 |
| **Sprint** | 8 |
| **Task count** | 3 |
| **Total hours** | 11 |

### Backend Tasks

#### TASK-06-02-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-06-02-BE-01` |
| **Description** | Saved searches CRUD APIs |
| **Layer** | Backend |
| **Dependencies** | TASK-04-02-FE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/routes/savedSearches.routes.ts` |

**Acceptance Criteria**
  - [ ] Save/list/delete

### Frontend Tasks

#### TASK-06-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-06-02-FE-01` |
| **Description** | Save/reopen search from customer quick actions |
| **Layer** | Frontend |
| **Dependencies** | TASK-06-02-BE-01, TASK-11-01-FE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/features/customer/**`, `frontend/src/features/search/**` |

**Acceptance Criteria**
  - [ ] Reopens /search with criteria

### Testing Tasks

#### TASK-06-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-06-02-QA-01` |
| **Description** | Smoke saved search round-trip |
| **Layer** | Testing |
| **Dependencies** | TASK-06-02-FE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Works


## FEAT-11-01: Customer Dashboard

| Field | Value |
|-------|--------|
| **Feature** | FEAT-11-01 |
| **Epic** | EPIC-11 |
| **Sprint** | 8 |
| **Task count** | 4 |
| **Total hours** | 20 |

### Backend Tasks

#### TASK-11-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-11-01-BE-01` |
| **Description** | Customer profile + stats + inquiry list endpoints |
| **Layer** | Backend |
| **Dependencies** | TASK-06-01-BE-01, TASK-05-02-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/src/routes/customer.routes.ts` |

**Acceptance Criteria**
  - [ ] Stats accurate
  - [ ] Inquiry list not timeline product

#### TASK-11-01-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-11-01-BE-02` |
| **Description** | Requirement profile update API |
| **Layer** | Backend |
| **Dependencies** | TASK-11-01-BE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** | `backend/src/services/customer.service.ts` |

**Acceptance Criteria**
  - [ ] Budget/type/beds/location persist

### Frontend Tasks

#### TASK-11-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-11-01-FE-01` |
| **Description** | SCR-CUS-DASH layout: stats, saves, requirements, inquiries, actions |
| **Layer** | Frontend |
| **Dependencies** | TASK-11-01-BE-02, TASK-06-01-FE-01 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/customer/**`, `frontend/src/app/(customer)/customer/page.tsx` |

**Acceptance Criteria**
  - [ ] Matches HTML
  - [ ] No rich timeline product

### Testing Tasks

#### TASK-11-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-11-01-QA-01` |
| **Description** | Pixel + role gate customer dashboard |
| **Layer** | Testing |
| **Dependencies** | TASK-11-01-FE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Pass


## FEAT-12-01: AI Chatbot Widget

| Field | Value |
|-------|--------|
| **Feature** | FEAT-12-01 |
| **Epic** | EPIC-12 |
| **Sprint** | 9 |
| **Task count** | 3 |
| **Total hours** | 16 |

### Backend Tasks

#### TASK-12-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-12-01-BE-01` |
| **Description** | POST /chat Gemini adapter + config greeting |
| **Layer** | Backend |
| **Dependencies** | TASK-04-01-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/src/routes/ai.routes.ts`, `backend/src/services/chat.service.ts` |

**Acceptance Criteria**
  - [ ] Chat round-trip
  - [ ] Key server-only
  - [ ] Rate limited

### Frontend Tasks

#### TASK-12-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-12-01-FE-01` |
| **Description** | Homepage chat widget open/close/send + loading/error |
| **Layer** | Frontend |
| **Dependencies** | TASK-12-01-BE-01, TASK-03-01-FE-01 |
| **Estimated Hours** | 7 |
| **Files to Modify** | `frontend/src/features/ai/chat/**` |

**Acceptance Criteria**
  - [ ] Matches homepage chat HTML behavior

### Testing Tasks

#### TASK-12-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-12-01-QA-01` |
| **Description** | Mocked chat integration + UI smoke |
| **Layer** | Testing |
| **Dependencies** | TASK-12-01-FE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Green


## FEAT-12-02: Loan Analysis

| Field | Value |
|-------|--------|
| **Feature** | FEAT-12-02 |
| **Epic** | EPIC-12 |
| **Sprint** | 9 |
| **Task count** | 3 |
| **Total hours** | 14 |

### Backend Tasks

#### TASK-12-02-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-12-02-BE-01` |
| **Description** | POST /loan-analysis Gemini + formula fallback |
| **Layer** | Backend |
| **Dependencies** | TASK-04-01-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/src/services/loan.service.ts` |

**Acceptance Criteria**
  - [ ] Fallback on AI fail
  - [ ] Validation 400

### Frontend Tasks

#### TASK-12-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-12-02-FE-01` |
| **Description** | Loan analysis modal UI + wire API |
| **Layer** | Frontend |
| **Dependencies** | TASK-12-02-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/features/ai/loan/**` |

**Acceptance Criteria**
  - [ ] Fallback UX shown when needed

### Testing Tasks

#### TASK-12-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-12-02-QA-01` |
| **Description** | Unit test formula fallback + UI smoke |
| **Layer** | Testing |
| **Dependencies** | TASK-12-02-BE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Green


## FEAT-13-01: AI Config Admin UI

| Field | Value |
|-------|--------|
| **Feature** | FEAT-13-01 |
| **Epic** | EPIC-13 |
| **Sprint** | 9 |
| **Task count** | 3 |
| **Total hours** | 16 |

### Backend Tasks

#### TASK-13-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-13-01-BE-01` |
| **Description** | GET/PUT ai_configs persistence |
| **Layer** | Backend |
| **Dependencies** | TASK-12-01-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `backend/src/routes/aiConfig.routes.ts` |

**Acceptance Criteria**
  - [ ] Admin only
  - [ ] No provider switch field

### Frontend Tasks

#### TASK-13-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-13-01-FE-01` |
| **Description** | SCR-AI-CFG form: FAQ, escalation, tone, preview |
| **Layer** | Frontend |
| **Dependencies** | TASK-13-01-BE-01 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/ai/config/**`, `frontend/src/app/(admin)/ai-config/page.tsx` |

**Acceptance Criteria**
  - [ ] Matches HTML
  - [ ] Preview uses config
  - [ ] No LLM switcher

### Testing Tasks

#### TASK-13-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-13-01-QA-01` |
| **Description** | Pixel + authz tests AI config |
| **Layer** | Testing |
| **Dependencies** | TASK-13-01-FE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Pass


## FEAT-14-01: In-App Notifications

| Field | Value |
|-------|--------|
| **Feature** | FEAT-14-01 |
| **Epic** | EPIC-14 |
| **Sprint** | 10 |
| **Task count** | 4 |
| **Total hours** | 14 |

### Backend Tasks

#### TASK-14-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-14-01-BE-01` |
| **Description** | Notifications list + mark read APIs |
| **Layer** | Backend |
| **Dependencies** | TASK-01-02-BE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/routes/notifications.routes.ts` |

**Acceptance Criteria**
  - [ ] Unread counts
  - [ ] Mark read

#### TASK-14-01-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-14-01-BE-02` |
| **Description** | Emit in-app notification on new lead |
| **Layer** | Backend |
| **Dependencies** | TASK-14-01-BE-01, TASK-05-02-BE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** | `backend/src/services/notification.service.ts` |

**Acceptance Criteria**
  - [ ] Agent receives notification row

### Frontend Tasks

#### TASK-14-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-14-01-FE-01` |
| **Description** | Notifications bell dropdown UI |
| **Layer** | Frontend |
| **Dependencies** | TASK-14-01-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/features/notifications/**` |

**Acceptance Criteria**
  - [ ] Unread indicator
  - [ ] No SMS/push UI

### Testing Tasks

#### TASK-14-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-14-01-QA-01` |
| **Description** | API + UI smoke notifications |
| **Layer** | Testing |
| **Dependencies** | TASK-14-01-FE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Pass


## FEAT-14-02: Email Notifications & Rules

| Field | Value |
|-------|--------|
| **Feature** | FEAT-14-02 |
| **Epic** | EPIC-14 |
| **Sprint** | 10 |
| **Task count** | 4 |
| **Total hours** | 20 |

### Backend Tasks

#### TASK-14-02-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-14-02-BE-01` |
| **Description** | Email sender integration + new-lead email |
| **Layer** | Backend |
| **Dependencies** | TASK-14-01-BE-02 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `backend/src/integrations/email/**` |

**Acceptance Criteria**
  - [ ] Email sent in staging/dev catcher
  - [ ] No alternate channels

#### TASK-14-02-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-14-02-BE-02` |
| **Description** | Notification rules CRUD email|in_app only |
| **Layer** | Backend |
| **Dependencies** | TASK-14-02-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `backend/src/routes/notificationRules.routes.ts` |

**Acceptance Criteria**
  - [ ] Admin only
  - [ ] Channels constrained

### Frontend Tasks

#### TASK-14-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-14-02-FE-01` |
| **Description** | Admin notification rules UI |
| **Layer** | Frontend |
| **Dependencies** | TASK-14-02-BE-02 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `frontend/src/features/admin/notificationRules/**` |

**Acceptance Criteria**
  - [ ] No SMS/WhatsApp/Push controls

### Testing Tasks

#### TASK-14-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-14-02-QA-01` |
| **Description** | Rules + email path smoke |
| **Layer** | Testing |
| **Dependencies** | TASK-14-02-FE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Pass


## FEAT-15-01: CMS Pages Admin & Public

| Field | Value |
|-------|--------|
| **Feature** | FEAT-15-01 |
| **Epic** | EPIC-15 |
| **Sprint** | 10 |
| **Task count** | 4 |
| **Total hours** | 16 |

### Backend Tasks

#### TASK-15-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-15-01-BE-01` |
| **Description** | CMS pages CRUD + public published GET |
| **Layer** | Backend |
| **Dependencies** | TASK-01-02-BE-02 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `backend/src/routes/cms.routes.ts` |

**Acceptance Criteria**
  - [ ] Public returns published only

### Frontend Tasks

#### TASK-15-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-15-01-FE-01` |
| **Description** | Admin CMS editor UI |
| **Layer** | Frontend |
| **Dependencies** | TASK-15-01-BE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `frontend/src/features/cms/**` |

**Acceptance Criteria**
  - [ ] Edit/save homepage content blocks

#### TASK-15-01-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-15-01-FE-02` |
| **Description** | Homepage consumes CMS where designed |
| **Layer** | Frontend |
| **Dependencies** | TASK-15-01-FE-01, TASK-03-01-FE-02 |
| **Estimated Hours** | 3 |
| **Files to Modify** | `frontend/src/features/home/**` |

**Acceptance Criteria**
  - [ ] FR-HOME-007 satisfied

### Testing Tasks

#### TASK-15-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-15-01-QA-01` |
| **Description** | CMS round-trip smoke |
| **Layer** | Testing |
| **Dependencies** | TASK-15-01-FE-02 |
| **Estimated Hours** | 2 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Pass


## FEAT-08-01: Bulk Upload Validate & Import

| Field | Value |
|-------|--------|
| **Feature** | FEAT-08-01 |
| **Epic** | EPIC-08 |
| **Sprint** | 11 |
| **Task count** | 6 |
| **Total hours** | 29 |

### Backend Tasks

#### TASK-08-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-08-01-BE-01` |
| **Description** | Bulk upload session create + row validation |
| **Layer** | Backend |
| **Dependencies** | TASK-07-01-BE-01 |
| **Estimated Hours** | 7 |
| **Files to Modify** | `backend/src/services/bulk.service.ts`, `backend/prisma/schema.prisma` |

**Acceptance Criteria**
  - [ ] Summary counts
  - [ ] Row errors persisted

#### TASK-08-01-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-08-01-BE-02` |
| **Description** | Import valid rows only + error CSV download |
| **Layer** | Backend |
| **Dependencies** | TASK-08-01-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `backend/src/routes/bulk.routes.ts` |

**Acceptance Criteria**
  - [ ] Valid imported
  - [ ] Error report downloads

### Frontend Tasks

#### TASK-08-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-08-01-FE-01` |
| **Description** | SCR-BULK results UI summary + error table |
| **Layer** | Frontend |
| **Dependencies** | TASK-08-01-BE-01 |
| **Estimated Hours** | 7 |
| **Files to Modify** | `frontend/src/features/properties/bulk/**`, `frontend/src/app/(admin)/properties/bulk/page.tsx` |

**Acceptance Criteria**
  - [ ] Matches HTML

#### TASK-08-01-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-08-01-FE-02` |
| **Description** | Wire import + re-upload + download report actions |
| **Layer** | Frontend |
| **Dependencies** | TASK-08-01-FE-01, TASK-08-01-BE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `frontend/src/features/properties/bulk/**` |

**Acceptance Criteria**
  - [ ] Actions work

### Testing Tasks

#### TASK-08-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-08-01-QA-01` |
| **Description** | Bulk fixture CSV tests + pixel spot |
| **Layer** | Testing |
| **Dependencies** | TASK-08-01-FE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Pass

### Documentation Tasks

#### TASK-08-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-08-01-DOC-01` |
| **Description** | Document CSV template fields |
| **Layer** | Documentation |
| **Dependencies** | TASK-08-01-BE-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** | `docs/05_API_SPECIFICATION.md` |

**Acceptance Criteria**
  - [ ] Template documented


## FEAT-16-01: Command Center Dashboard

| Field | Value |
|-------|--------|
| **Feature** | FEAT-16-01 |
| **Epic** | EPIC-16 |
| **Sprint** | 12 |
| **Task count** | 5 |
| **Total hours** | 28 |

### Backend Tasks

#### TASK-16-01-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-16-01-BE-01` |
| **Description** | Metrics KPIs + charts data endpoints + date range |
| **Layer** | Backend |
| **Dependencies** | TASK-07-01-BE-01, TASK-09-01-BE-01 |
| **Estimated Hours** | 7 |
| **Files to Modify** | `backend/src/routes/metrics.routes.ts`, `backend/src/services/metrics.service.ts` |

**Acceptance Criteria**
  - [ ] KPIs return
  - [ ] Date range filters

#### TASK-16-01-BE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-16-01-BE-02` |
| **Description** | Command-center activity feed endpoint (not CRM timeline product) |
| **Layer** | Backend |
| **Dependencies** | TASK-16-01-BE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `backend/src/services/metrics.service.ts` |

**Acceptance Criteria**
  - [ ] Feed filterable

### Frontend Tasks

#### TASK-16-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-16-01-FE-01` |
| **Description** | SCR-CMD KPI cards + charts + date picker |
| **Layer** | Frontend |
| **Dependencies** | TASK-16-01-BE-01 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/admin/commandCenter/**`, `frontend/src/app/(admin)/page.tsx` |

**Acceptance Criteria**
  - [ ] Matches HTML charts/KPIs

#### TASK-16-01-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-16-01-FE-02` |
| **Description** | Activity feed UI + filters |
| **Layer** | Frontend |
| **Dependencies** | TASK-16-01-FE-01, TASK-16-01-BE-02 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/features/admin/commandCenter/**` |

**Acceptance Criteria**
  - [ ] Feed matches HTML
  - [ ] Not CRM timeline product

### Testing Tasks

#### TASK-16-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-16-01-QA-01` |
| **Description** | Pixel + role gate command center |
| **Layer** | Testing |
| **Dependencies** | TASK-16-01-FE-02 |
| **Estimated Hours** | 4 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Pass


## FEAT-16-02: Admin Reports View

| Field | Value |
|-------|--------|
| **Feature** | FEAT-16-02 |
| **Epic** | EPIC-16 |
| **Sprint** | 12 |
| **Task count** | 3 |
| **Total hours** | 9 |

### Backend Tasks

#### TASK-16-02-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-16-02-BE-01` |
| **Description** | Reports summary endpoint reusing metrics |
| **Layer** | Backend |
| **Dependencies** | TASK-16-01-BE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** | `backend/src/routes/metrics.routes.ts` |

**Acceptance Criteria**
  - [ ] Admin authorized

### Frontend Tasks

#### TASK-16-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-16-02-FE-01` |
| **Description** | AdminReportsView UI with states |
| **Layer** | Frontend |
| **Dependencies** | TASK-16-02-BE-01 |
| **Estimated Hours** | 5 |
| **Files to Modify** | `frontend/src/features/reports/**` |

**Acceptance Criteria**
  - [ ] Loading/empty/error

### Testing Tasks

#### TASK-16-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-16-02-QA-01` |
| **Description** | Smoke reports view |
| **Layer** | Testing |
| **Dependencies** | TASK-16-02-FE-01 |
| **Estimated Hours** | 1 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Pass


## FEAT-18-01: Shared UX States & A11y Baseline

| Field | Value |
|-------|--------|
| **Feature** | FEAT-18-01 |
| **Epic** | EPIC-18 |
| **Sprint** | 13 |
| **Task count** | 3 |
| **Total hours** | 22 |

### Frontend Tasks

#### TASK-18-01-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-18-01-FE-01` |
| **Description** | Audit MVP screens for loading/empty/error gaps; fix top offenders |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-02-FE-03 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `frontend/src/features/**`, `frontend/src/components/states/**` |

**Acceptance Criteria**
  - [ ] Critical gaps closed
  - [ ] Defects filed for residuals

#### TASK-18-01-FE-02

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-18-01-FE-02` |
| **Description** | Keyboard focus + labels pass on primary journeys |
| **Layer** | Frontend |
| **Dependencies** | TASK-18-01-FE-01 |
| **Estimated Hours** | 6 |
| **Files to Modify** | `frontend/src/features/**` |

**Acceptance Criteria**
  - [ ] Auth/search/detail/modals keyboard operable

### Testing Tasks

#### TASK-18-01-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-18-01-QA-01` |
| **Description** | Run Pixel Perfect + a11y baseline checklist sample set |
| **Layer** | Testing |
| **Dependencies** | TASK-18-01-FE-02 |
| **Estimated Hours** | 8 |
| **Files to Modify** | `docs/16_UI_PIXEL_PERFECT_CHECKLIST.md` |

**Acceptance Criteria**
  - [ ] Evidence attached
  - [ ] Blockers filed


## FEAT-18-02: Health Observability & Frontend Deploy

| Field | Value |
|-------|--------|
| **Feature** | FEAT-18-02 |
| **Epic** | EPIC-18 |
| **Sprint** | 13 |
| **Task count** | 4 |
| **Total hours** | 12 |

### Backend Tasks

#### TASK-18-02-BE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-18-02-BE-01` |
| **Description** | Harden health endpoint + basic structured logging review |
| **Layer** | Backend |
| **Dependencies** | TASK-00-03-BE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** | `backend/src/routes/health.routes.ts` |

**Acceptance Criteria**
  - [ ] Health OK
  - [ ] No secrets in logs

### Frontend Tasks

#### TASK-18-02-FE-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-18-02-FE-01` |
| **Description** | Vercel project config + env documentation |
| **Layer** | Frontend |
| **Dependencies** | TASK-00-01-FE-01 |
| **Estimated Hours** | 4 |
| **Files to Modify** | `frontend/vercel.json`, `docs/18_RELEASE_CHECKLIST.md` |

**Acceptance Criteria**
  - [ ] FE deploys to Vercel staging/prod path

### Testing Tasks

#### TASK-18-02-QA-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-18-02-QA-01` |
| **Description** | Post-deploy smoke pack |
| **Layer** | Testing |
| **Dependencies** | TASK-18-02-FE-01, TASK-18-02-BE-01 |
| **Estimated Hours** | 3 |
| **Files to Modify** |  |

**Acceptance Criteria**
  - [ ] Smoke Pass

### Documentation Tasks

#### TASK-18-02-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-18-02-DOC-01` |
| **Description** | Fill release packet template for RC |
| **Layer** | Documentation |
| **Dependencies** | TASK-18-02-QA-01 |
| **Estimated Hours** | 2 |
| **Files to Modify** | `docs/18_RELEASE_CHECKLIST.md` |

**Acceptance Criteria**
  - [ ] Release checklist sections started


---

## Future / Excluded (documentation tasks only — not MVP)

### FEAT-F01-01: Kanban Board (post-MVP)

#### TASK-F01-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-F01-01-DOC-01` |
| **Description** | Spike Tech Design only — do not implement in MVP |
| **Layer** | Documentation |
| **Dependencies** | EPIC-09 complete |
| **Estimated Hours** | 4 |
| **Files to Modify** | `docs/08_EPICS_AND_FEATURES.md` |

**Acceptance Criteria**
  - [ ] Design noted under Future
  - [ ] No MVP nav

### FEAT-F02-01: CRM Communication Timeline (post-MVP)

#### TASK-F02-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-F02-01-DOC-01` |
| **Description** | Document future timeline vs command-center feed boundary |
| **Layer** | Documentation |
| **Dependencies** | None |
| **Estimated Hours** | 2 |
| **Files to Modify** | `docs/08_EPICS_AND_FEATURES.md` |

**Acceptance Criteria**
  - [ ] Boundary clear in docs

### FEAT-F03-01: Reminders & Automation (post-MVP)

#### TASK-F03-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-F03-01-DOC-01` |
| **Description** | Placeholder backlog note only |
| **Layer** | Documentation |
| **Dependencies** | None |
| **Estimated Hours** | 1 |
| **Files to Modify** | `docs/08_EPICS_AND_FEATURES.md` |

**Acceptance Criteria**
  - [ ] Not scheduled MVP

### FEAT-F04-01: Video & Virtual Tour (post-MVP)

#### TASK-F04-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-F04-01-DOC-01` |
| **Description** | Confirm MVP editor omits controls |
| **Layer** | Documentation |
| **Dependencies** | FEAT-07-02 |
| **Estimated Hours** | 1 |
| **Files to Modify** | `docs/07_UI_IMPLEMENTATION_GUIDE.md` |

**Acceptance Criteria**
  - [ ] Omission verified in AC

### FEAT-F05-01: SMS/WhatsApp/Push (post-MVP)

#### TASK-F05-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-F05-01-DOC-01` |
| **Description** | Confirm channels absent from rules UI |
| **Layer** | Documentation |
| **Dependencies** | FEAT-14-02 |
| **Estimated Hours** | 1 |
| **Files to Modify** | `docs/17_API_CHECKLIST.md` |

**Acceptance Criteria**
  - [ ] Absence verified

### FEAT-F06-01: Contacts & Opportunity (post-MVP)

#### TASK-F06-01-DOC-01

| Field | Value |
|-------|--------|
| **Task ID** | `TASK-F06-01-DOC-01` |
| **Description** | Future epic note only |
| **Layer** | Documentation |
| **Dependencies** | None |
| **Estimated Hours** | 1 |
| **Files to Modify** | `docs/08_EPICS_AND_FEATURES.md` |

**Acceptance Criteria**
  - [ ] Not MVP


---

## 5. Working agreement

- Split further if a task threatens to exceed 8 hours mid-flight.
- Prefer completing BE contract before FE for the same feature when blocked.
- Testing tasks may start once AC-testable builds exist on the branch.
- Documentation tasks update OpenAPI / checklists in the **same PR** when contracts change.

## 6. Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Full MVP feature task breakdown; max 8h/task |

---

**End of Task Breakdown**
