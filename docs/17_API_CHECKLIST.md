# PropVista CRM / Property AI Studio — API Development & Verification Checklist

| Field | Value |
|-------|--------|
| **Document** | `17_API_CHECKLIST.md` |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **Type** | Reusable engineering checklist (dev + review + QA) |
| **Base path** | `/api/v1` |
| **Contract SOT** | `docs/openapi.yaml` / `docs/openapi.json` |
| **Index** | `docs/05_API_SPECIFICATION.md` |

### Governing references

| Doc | Use |
|-----|-----|
| `00_PROJECT_CONSTITUTION.md` §8–9, §18, §20, §22 | Auth, envelope, validation, mocks, security, tests |
| `03_SYSTEM_ARCHITECTURE_DOCUMENT.md` | Middleware order, Gemini, layers |
| `04_DATABASE_DESIGN_DOCUMENT.md` | Persistence, naming, integrity |
| `openapi.yaml` | Paths, schemas, status codes |
| `14_CODING_STANDARDS.md` | Naming, services, repositories |
| `11_TEST_STRATEGY.md` | API/integration test expectations |
| `15_CODE_REVIEW_CHECKLIST.md` | PR gates |

---

## 1. How to use

1. **Design:** Complete Technical Design + AuthZ matrix before coding (Constitution lifecycle).  
2. **Implement:** Routes thin → validate → service → repository; update OpenAPI in the same PR.  
3. **Verify:** Run this checklist per endpoint (or per PR touching APIs).  
4. **Done:** All applicable items Pass → Definition of API Complete.  

Mark: ☐ Pass · ☐ Fail · ☐ N/A — **Fail on required item = not complete.**

---

## 2. Global API Rules (binding)

| Rule | Requirement |
|------|-------------|
| Versioning | All product APIs under `/api/v1` |
| Format | JSON request/response |
| Auth | JWT Bearer (access + refresh); email/password only |
| Roles | `guest` (unauthenticated), `customer`, `agent`, `admin`, `super_admin` — **no module permissions** |
| AI | Gemini **only**; keys server-side |
| Notifications | `email`, `in_app` only in contracts |
| Prices | Decimal **strings** in JSON (per API Spec) |
| Errors | Envelope `{ "error": { "code", "message", "details" } }` |
| Lists | Paginated; never unbounded dumps |
| Client | Frontend calls only via centralized `lib/api` |
| Mocks | Contract-compatible; tracked; removed before feature Done |

---

## 3. Endpoint Checklist

Use one row set per operation (`METHOD /path`).

| # | Check | Pass |
|---|-------|------|
| E1 | Path uses `/api/v1` + plural resource nouns (or documented action) | ☐ |
| E2 | HTTP method correct (GET read, POST create/action, PATCH partial, DELETE remove) | ☐ |
| E3 | Operation documented in `openapi.yaml` with summary + tags | ☐ |
| E4 | Auth requirement declared (`security` / public explicitly) | ☐ |
| E5 | AuthZ roles listed (who may call) | ☐ |
| E6 | Request schema defined (body/query/path) | ☐ |
| E7 | Success response schema + status code defined | ☐ |
| E8 | Error responses documented (401/403/400/404/409/429/5xx as applicable) | ☐ |
| E9 | Route handler is thin; business logic in service | ☐ |
| E10 | Repository used for DB access (no Prisma in route) | ☐ |
| E11 | DTO mapper hides internal fields (`password_hash`, secrets) | ☐ |
| E12 | Idempotency considered (esp. lead create if Requirements specify) | ☐ |
| E13 | Out-of-MVP capabilities not exposed (SMS, Kanban engine, etc.) | ☐ |
| E14 | Integration tests: happy + auth fail + validation fail | ☐ |
| E15 | Correlation/request id available for logs | ☐ |

**Endpoint ID:** _____________ **Owner:** _____________ **PR:** _____________

---

## 4. Authentication

| # | Check | Pass |
|---|-------|------|
| AU1 | Register/login use email + password only | ☐ |
| AU2 | Passwords hashed (bcrypt/argon2); never returned | ☐ |
| AU3 | Access + refresh token issuance matches OpenAPI (`/auth/token` or documented paths) | ☐ |
| AU4 | Refresh rotates/validates against stored refresh tokens | ☐ |
| AU5 | Logout revokes refresh token | ☐ |
| AU6 | `Authorization: Bearer <access>` accepted on protected routes | ☐ |
| AU7 | Missing/invalid/expired token → **401** + envelope | ☐ |
| AU8 | `/auth/me` returns current user without secrets | ☐ |
| AU9 | Tokens not logged; not embedded in error messages | ☐ |
| AU10 | Cookie strategy (if used): httpOnly/Secure/SameSite + CSRF plan | ☐ |

---

## 5. Authorization

| # | Check | Pass |
|---|-------|------|
| AZ1 | Role check on **server** for every protected operation | ☐ |
| AZ2 | Wrong role → **403** (not 404 camouflage unless anti-enumeration policy documented) | ☐ |
| AZ3 | Default deny: unspecified role cannot access | ☐ |
| AZ4 | Agent scoping: own/assigned properties & leads enforced (no IDOR) | ☐ |
| AZ5 | Customer cannot hit Admin/user-management/bulk/AI-config writes | ☐ |
| AZ6 | Guest only on documented public endpoints (featured, public property, search, capture, health) | ☐ |
| AZ7 | Super Admin ⊇ Admin capabilities where Requirements say so | ☐ |
| AZ8 | No module-permission engine introduced | ☐ |
| AZ9 | AuthZ matrix attached for new endpoints (Tech Design) | ☐ |

### AuthZ matrix template (copy per feature)

| Endpoint | Guest | Customer | Agent | Admin | Super Admin |
|----------|-------|----------|-------|-------|-------------|
| GET /example | | | | | |

---

## 6. Validation

| # | Check | Pass |
|---|-------|------|
| V1 | All write endpoints validate body with schema (Zod/equivalent) | ☐ |
| V2 | Path/query params validated (UUID/format/enums) | ☐ |
| V3 | Length, range, enum, email, URL constraints enforced | ☐ |
| V4 | Unknown/forbidden fields rejected or stripped per policy (documented) | ☐ |
| V5 | File uploads: MIME + size limits | ☐ |
| V6 | Bulk rows validated per-field with actionable messages | ☐ |
| V7 | Client validation never trusted alone | ☐ |
| V8 | Validation failure → **400** (or **422** if OpenAPI standardizes) + `details[]` | ☐ |

---

## 7. Request Models

| # | Check | Pass |
|---|-------|------|
| RQ1 | JSON fields `camelCase` at API boundary | ☐ |
| RQ2 | Schema matches OpenAPI component | ☐ |
| RQ3 | Required vs optional fields correct | ☐ |
| RQ4 | Nested objects explicit (amenities, filters) | ☐ |
| RQ5 | No Prisma entities accepted as raw request bodies | ☐ |
| RQ6 | Prices sent/received as decimal strings where applicable | ☐ |
| RQ7 | Role values limited to five allowed strings | ☐ |

---

## 8. Response Models

| # | Check | Pass |
|---|-------|------|
| RS1 | Success body matches OpenAPI schema | ☐ |
| RS2 | `camelCase` JSON fields | ☐ |
| RS3 | No `passwordHash` / refresh token hashes / Gemini keys | ☐ |
| RS4 | Dates ISO-8601 strings | ☐ |
| RS5 | Enums stable strings aligned with DB/API Spec | ☐ |
| RS6 | Resource ids stable for UI | ☐ |
| RS7 | Media URLs usable by UI (local-dev paths OK if contract-stable) | ☐ |
| RS8 | Empty list is `200` + empty `items` (not `404`) unless OpenAPI says otherwise | ☐ |

---

## 9. Error Responses

### Envelope (mandatory)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [
      { "field": "email", "message": "Invalid email" }
    ]
  }
}
```

| # | Check | Pass |
|---|-------|------|
| ER1 | All errors use envelope (no ad-hoc `{ "msg": ... }`) | ☐ |
| ER2 | `code` machine-stable; `message` safe for UI | ☐ |
| ER3 | `details` used for field errors | ☐ |
| ER4 | No stack traces in production responses | ☐ |
| ER5 | Status mapping correct (table below) | ☐ |
| ER6 | AI failures return structured error so FE can show fallback UI | ☐ |

| HTTP | Typical `code` | When |
|------|----------------|------|
| 400 | `VALIDATION_ERROR` | Bad input |
| 401 | `UNAUTHORIZED` | No/invalid auth |
| 403 | `FORBIDDEN` | Wrong role / scope |
| 404 | `NOT_FOUND` | Missing resource |
| 409 | `CONFLICT` | Duplicate email, invalid state transition |
| 429 | `RATE_LIMITED` | Auth/AI limits |
| 500 | `INTERNAL_ERROR` | Unexpected |
| 503 | `AI_UNAVAILABLE` | Gemini down/timeout (if distinguished) |

---

## 10. Pagination

| # | Check | Pass |
|---|-------|------|
| PG1 | List endpoints accept `page` + `pageSize` (or OpenAPI-equivalent cursor) | ☐ |
| PG2 | Default + max `pageSize` enforced (reject or clamp—document which) | ☐ |
| PG3 | Response includes pagination `meta` (total, page, pageSize, etc. per OpenAPI) | ☐ |
| PG4 | Stable ordering when paginating (tie-breaker `id`) | ☐ |
| PG5 | No “return all rows” escape hatch in production code | ☐ |

**Example meta (align with OpenAPI):**

```json
{
  "items": [],
  "meta": { "page": 1, "pageSize": 20, "total": 0, "totalPages": 0 }
}
```

---

## 11. Sorting

| # | Check | Pass |
|---|-------|------|
| SO1 | Sort fields allowlisted (no raw SQL column injection) | ☐ |
| SO2 | `sortBy` + `sortDir` (`asc`\|`desc`) documented in OpenAPI | ☐ |
| SO3 | Default sort documented and deterministic | ☐ |
| SO4 | Invalid sort → 400 | ☐ |

---

## 12. Filtering

| # | Check | Pass |
|---|-------|------|
| FI1 | Filters allowlisted and typed | ☐ |
| FI2 | Combined filters AND/OR semantics documented | ☐ |
| FI3 | Search NLP path separate from filter-only path (AI search) | ☐ |
| FI4 | Filter-only results available when Gemini fails | ☐ |
| FI5 | Empty filter set behavior documented | ☐ |
| FI6 | Indexes exist for hot filter columns (DB checklist) | ☐ |

---

## 13. Rate Limiting

| # | Check | Pass |
|---|-------|------|
| RL1 | Stricter limits on `/auth/*` | ☐ |
| RL2 | Stricter limits on AI (`/search` AI, `/chat`, `/loan-analysis`) | ☐ |
| RL3 | 429 + `RATE_LIMITED` envelope | ☐ |
| RL4 | `Retry-After` header when practical | ☐ |
| RL5 | Limits configurable per environment | ☐ |
| RL6 | Health check not overly restricted | ☐ |

---

## 14. Logging

| # | Check | Pass |
|---|-------|------|
| LG1 | Structured logs with `requestId` | ☐ |
| LG2 | Log method, path, status, latency, userId (if any) | ☐ |
| LG3 | Never log passwords, tokens, Gemini keys | ☐ |
| LG4 | AI failures logged server-side (timeout/parse) | ☐ |
| LG5 | Validation errors at warn/debug—not error spam | ☐ |
| LG6 | Unexpected errors logged with stack **server-side only** | ☐ |

---

## 15. Transactions

| # | Check | Pass |
|---|-------|------|
| TX1 | Multi-row writes use Prisma `$transaction` when atomicity required | ☐ |
| TX2 | Bulk import: valid rows commit policy matches Requirements (import valid only) | ☐ |
| TX3 | Publish/status transitions atomic with invariants | ☐ |
| TX4 | Partial failure does not leave corrupt half-states | ☐ |
| TX5 | Long transactions avoided under request timeouts | ☐ |

---

## 16. Security

| # | Check | Pass |
|---|-------|------|
| SE1 | OWASP basics: injection, authn, authz, XSS output safety | ☐ |
| SE2 | Parameterized Prisma queries only (no string-concat SQL) | ☐ |
| SE3 | CORS configured for known FE origins | ☐ |
| SE4 | Helmet/security headers as appropriate | ☐ |
| SE5 | Upload path traversal prevented | ☐ |
| SE6 | IDOR tests for `GET/PATCH` by id | ☐ |
| SE7 | Gemini key only in server env | ☐ |
| SE8 | Admin-only for bulk, user admin, AI config, notification rules | ☐ |
| SE9 | PII minimization in logs and error details | ☐ |

---

## 17. Performance

| # | Check | Pass |
|---|-------|------|
| PE1 | List queries use `select`/`include` deliberately (no accidental over-fetch) | ☐ |
| PE2 | No N+1 (verify with logging/tests) | ☐ |
| PE3 | Indexes for filter/sort columns | ☐ |
| PE4 | AI calls have timeouts | ☐ |
| PE5 | Pagination prevents huge payloads | ☐ |
| PE6 | Export endpoints streamed or capped | ☐ |
| PE7 | Hot paths measured on staging smoke | ☐ |

---

## 18. Caching (future)

MVP may ship without response caching. When introduced:

| # | Check | Pass |
|---|-------|------|
| CA1 | Cache keys include tenant/role/user where needed | ☐ |
| CA2 | TTL documented; invalidation on writes | ☐ |
| CA3 | Authenticated personalized data not shared in public CDN cache | ☐ |
| CA4 | `Cache-Control` headers explicit | ☐ |
| CA5 | AI responses cached only with safety review | ☐ |

Mark **N/A** for MVP if unused—do not invent Redis for YAGNI.

---

## 19. Swagger / OpenAPI

| # | Check | Pass |
|---|-------|------|
| SW1 | Spec is OpenAPI **3.1** | ☐ |
| SW2 | Every shipped operation present in `openapi.yaml` | ☐ |
| SW3 | Components for request/response reused | ☐ |
| SW4 | Examples provided for complex bodies (search, bulk) | ☐ |
| SW5 | Security schemes documented (Bearer) | ☐ |
| SW6 | Spec linted/validated in CI when possible | ☐ |
| SW7 | Swagger UI or Redoc optional for staging—must not expose prod secrets | ☐ |
| SW8 | Spec change and code change in same PR | ☐ |

---

## 20. Versioning

| # | Check | Pass |
|---|-------|------|
| VE1 | Current surface is `/api/v1` only | ☐ |
| VE2 | Breaking changes require `/api/v2` or negotiated migration plan | ☐ |
| VE3 | Additive fields preferred in MVP (backward compatible) | ☐ |
| VE4 | Deprecation notices documented before removal | ☐ |
| VE5 | Clients (FE `lib/api`) updated in lockstep | ☐ |

---

## 21. Testing

| # | Check | Pass |
|---|-------|------|
| TE1 | Unit tests for service rules / validators | ☐ |
| TE2 | Integration: happy path | ☐ |
| TE3 | Integration: 401 unauthenticated | ☐ |
| TE4 | Integration: 403 wrong role | ☐ |
| TE5 | Integration: 400 validation | ☐ |
| TE6 | Gemini mocked at adapter boundary | ☐ |
| TE7 | AI search failure envelope tested (fallback trigger) | ☐ |
| TE8 | Loan formula fallback tested | ☐ |
| TE9 | Coverage contribution toward &gt;80% core logic | ☐ |

---

## 22. Integration

| # | Check | Pass |
|---|-------|------|
| IN1 | FE uses centralized API module for this endpoint | ☐ |
| IN2 | Error envelope mapped to UI states (error/empty/fallback) | ☐ |
| IN3 | Loading state driven by pending request | ☐ |
| IN4 | Real API replaces mocks before feature Done | ☐ |
| IN5 | Contract fixtures shared or OpenAPI-generated types where adopted | ☐ |
| IN6 | Email/in-app side effects verified for events (e.g. new lead) | ☐ |
| IN7 | Media upload + GET URL works in local storage mode | ☐ |

---

## 23. Documentation

| # | Check | Pass |
|---|-------|------|
| DO1 | `05_API_SPECIFICATION.md` index still accurate if tags/paths added | ☐ |
| DO2 | OpenAPI descriptions clear for consumers | ☐ |
| DO3 | Env vars documented (`DATABASE_URL`, `GEMINI_API_KEY`, JWT secrets) | ☐ |
| DO4 | AuthZ matrix in Feature Tech Design | ☐ |
| DO5 | Changelog / PR notes for breaking or behavior changes | ☐ |

---

## 24. Backward Compatibility

| # | Check | Pass |
|---|-------|------|
| BC1 | Existing FE callers not broken by renamed/removed fields | ☐ |
| BC2 | Enum values only added, not renamed, without migration | ☐ |
| BC3 | Default query behavior unchanged unless versioned | ☐ |
| BC4 | Error `code` strings stable | ☐ |
| BC5 | Pagination meta shape stable | ☐ |

---

## 25. Monitoring

| # | Check | Pass |
|---|-------|------|
| MO1 | `GET /health` (or `/api/v1/health`) returns liveness | ☐ |
| MO2 | AI latency / fallback rate loggable or metric-hook ready | ☐ |
| MO3 | 5xx rate observable in staging/prod logs | ☐ |
| MO4 | Auth failure spikes detectable (credential stuffing) | ☐ |
| MO5 | Bulk job/session failures visible | ☐ |

---

## 26. Definition of API Complete

An API operation (or feature API slice) is **Complete** only when **all** apply:

- [ ] OpenAPI updated and accurate  
- [ ] AuthN/AuthZ correct (matrix verified)  
- [ ] Validation on writes  
- [ ] Success + error envelopes correct  
- [ ] Pagination/sort/filter per resource rules  
- [ ] Rate limits on auth/AI as applicable  
- [ ] Logging safe + useful  
- [ ] Transactions correct where needed  
- [ ] Security checks Pass  
- [ ] Performance basics Pass (no N+1 / unbounded lists)  
- [ ] Tests: unit + integration (happy/401/403/400) Pass in CI  
- [ ] FE integration via `lib/api` (or backend-only with documented consumer)  
- [ ] Mocks removed for completed feature scope  
- [ ] No Out-of-MVP surface area  
- [ ] Code reviewed (API section of Code Review Checklist)  
- [ ] Deploy checklist considered for this change  

**Partial = not Complete.**

---

## 27. Deployment Checklist (API)

| # | Check | Pass |
|---|-------|------|
| DP1 | Migrations applied **before** serving new schema-dependent code | ☐ |
| DP2 | Env secrets set (JWT, Gemini, DB, email) — not in git | ☐ |
| DP3 | Health green after deploy | ☐ |
| DP4 | Smoke: auth, property list/detail, AI search, lead capture, admin login | ☐ |
| DP5 | Rollback plan known (previous image; forward-only migrate discipline) | ☐ |
| DP6 | CORS origins correct for environment | ☐ |
| DP7 | Rate limits enabled in staging/prod | ☐ |
| DP8 | Swagger/OpenAPI staging URL not leaking prod secrets | ☐ |
| DP9 | Feature flags do not expose unfinished Out-of-MVP APIs publicly without auth | ☐ |

---

## 28. Examples

### 28.1 Good: validated create with AuthZ

```http
POST /api/v1/leads HTTP/1.1
Content-Type: application/json

{
  "name": "Jordan Lee",
  "email": "jordan@example.com",
  "propertyId": "uuid-...",
  "message": "Interested in a tour"
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "uuid-...",
  "name": "Jordan Lee",
  "email": "jordan@example.com",
  "stage": "new",
  "createdAt": "2026-07-30T10:00:00.000Z"
}
```

### 28.2 Good: validation error envelope

```http
HTTP/1.1 400 Bad Request

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Invalid email" }
    ]
  }
}
```

### 28.3 Good: paginated list

```http
GET /api/v1/properties?page=1&pageSize=20&status=published&sortBy=createdAt&sortDir=desc
Authorization: Bearer <token>
```

### 28.4 Good: AI failure signal (FE triggers fallback UI)

```http
HTTP/1.1 503 Service Unavailable

{
  "error": {
    "code": "AI_UNAVAILABLE",
    "message": "Search assistant temporarily unavailable",
    "details": []
  }
}
```

*(Alternate design: `200` with `{ "mode": "fallback", "items": [...] }` if OpenAPI defines that contract—**follow OpenAPI**, not this example over the spec.)*

---

## 29. Good vs Bad API Design

| Topic | Bad | Good |
|-------|-----|------|
| AuthZ | Hide Admin button only | Server `requireRole('admin')` |
| Errors | `res.send(err.stack)` | Envelope + log server-side |
| Lists | `findMany()` all rows | Paginated + max pageSize |
| Naming | `/api/getProperties` | `GET /api/v1/properties` |
| AI | Call OpenAI if Gemini fails | Filter fallback / structured AI error |
| Validation | Trust FE Zod only | Duplicate schema on server |
| Prisma | Return full user row | Mapper omits `passwordHash` |
| Versions | Break FE fields silently | Additive change or `/v2` |
| Fetch | `fetch` in React component | `propertiesApi.list()` |
| Permissions | New ACL module | Role checks only |
| Notifications | WhatsApp field in DTO | `email` \| `in_app` only |
| Docs | Code merged, OpenAPI later | Same PR |

---

## 30. Per-PR API Review Block (paste into PR)

```markdown
## API checklist
- [ ] OpenAPI updated
- [ ] AuthN/AuthZ matrix
- [ ] Validation on writes
- [ ] Error envelope
- [ ] Pagination/sort/filter (if list)
- [ ] Rate limit considered (auth/AI)
- [ ] Tests: happy + 401 + 403 + 400
- [ ] No secrets in responses/logs
- [ ] Mocks tracked/removed
- [ ] Out-of-MVP not exposed

**Endpoints in this PR:**
| Method | Path | Roles |
|--------|------|-------|
| | | |
```

---

## 31. Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Initial API Development & Verification Checklist |

---

**End of API Checklist**

*An endpoint is not done until Definition of API Complete passes.*
