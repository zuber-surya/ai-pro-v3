# API Specification Index

Property AI Studio (PropVista CRM) -- OpenAPI **3.1**.

| Artifact | Path |
|----------|------|
| OpenAPI JSON | [openapi.json](./openapi.json) |
| OpenAPI YAML | [openapi.yaml](./openapi.yaml) |

## Overview

- **Base path:** `/api/v1`
- **Auth:** JWT Bearer
- **Login path:** `POST /auth/token` (canonical; there is no separate `/auth/login`)
- **AI provider:** Gemini only
- **Roles:** `customer`, `agent`, `admin`, `super_admin` -- **Guest** = no auth
- **Error envelope:** `{"error":{"code","message","details[]"}}` — `code` values from SRS Appendix P (see Error codes below)
- **Pagination:** `meta` on list responses
- **Prices:** decimal strings
- **Notification channels:** `email`, `in_app` only

## Mock API policy

MVP uses **real OpenAPI contracts** as the single API SOT. Temporary frontend mocks are allowed only until the matching backend operation is ready; mocks **must** match `openapi.yaml` request/response shapes and error codes. There is **no** separate approved-mock catalog. Remove mocks when the Express endpoint ships.

## Servers

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:4001/api/v1` |
| Staging | `https://staging-api.propvista.example/api/v1` |
| Production | `https://api.propvista.example/api/v1` |

## Statistics

- **Path templates:** 55
- **Operations:** 77

## Operations by tag

Primary FR linkage is summarized per tag. Exact FEAT→FR map: `08_EPICS_AND_FEATURES.md` §8.

### Health

| Method | Path | Summary | FR (primary) |
|--------|------|---------|--------------|
| GET | `/health` | Health check | FR-AI-008 / ops |

### Auth

| Method | Path | Summary | FR (primary) |
|--------|------|---------|--------------|
| POST | `/auth/logout` | Logout | FR-AUTH-002 |
| GET | `/auth/me` | Current user profile | FR-AUTH-003 |
| POST | `/auth/refresh` | Refresh access token | FR-AUTH-002 |
| POST | `/auth/register` | Register customer | FR-AUTH-001 |
| POST | `/auth/token` | Obtain tokens (login) | FR-AUTH-002 |

### Users

| Method | Path | Summary |
|--------|------|---------|
| GET | `/users` | List users |
| POST | `/users` | Create user |
| GET | `/users/{id}` | Get user |
| PATCH | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |

### Agents

| Method | Path | Summary |
|--------|------|---------|
| GET | `/agents` | List agents |
| POST | `/agents` | Create agent |
| GET | `/agents/{id}` | Get agent |
| PATCH | `/agents/{id}` | Update agent |
| DELETE | `/agents/{id}` | Delete agent |
| POST | `/agents/{id}/image` | Upload agent profile image |

### Properties

| Method | Path | Summary |
|--------|------|---------|
| GET | `/properties` | List properties |
| POST | `/properties` | Create property |
| POST | `/properties/bulk/status` | Bulk update property status |
| GET | `/properties/export` | Export properties |
| GET | `/properties/featured` | Featured properties |
| GET | `/properties/{id}` | Get property |
| PATCH | `/properties/{id}` | Update property |
| DELETE | `/properties/{id}` | Delete property |
| POST | `/properties/{id}/archive` | Archive property |
| POST | `/properties/{id}/duplicate` | Duplicate property |
| GET | `/properties/{id}/similar` | Similar properties |
| PATCH | `/properties/{id}/status` | Update property status |

### Media

| Method | Path | Summary |
|--------|------|---------|
| PUT | `/properties/{id}/amenities` | Replace amenities |
| GET | `/properties/{id}/images` | List property images |
| POST | `/properties/{id}/images` | Add property image |
| DELETE | `/properties/{id}/images/{imageId}` | Delete property image |
| PUT | `/properties/{id}/landmarks` | Replace landmarks |

### Search

| Method | Path | Summary |
|--------|------|---------|
| GET | `/search/suggest` | Search suggestions |

### AI

| Method | Path | Summary |
|--------|------|---------|
| POST | `/ai/chat` | AI chat assistant |
| POST | `/ai/loan-analysis` | AI loan analysis |
| POST | `/ai/search` | AI property search |

### Favorites

| Method | Path | Summary |
|--------|------|---------|
| GET | `/favorites` | List favorites |
| POST | `/favorites` | Add favorite |
| DELETE | `/favorites/{propertyId}` | Remove favorite |

### Customer

| Method | Path | Summary |
|--------|------|---------|
| GET | `/customer/dashboard` | Customer dashboard |
| GET | `/customer/inquiries` | List customer inquiries |
| GET | `/customer/profile` | Get customer profile |
| PUT | `/customer/profile` | Update customer profile |
| GET | `/customer/saved-searches` | List saved searches |
| POST | `/customer/saved-searches` | Create saved search |
| DELETE | `/customer/saved-searches/{id}` | Delete saved search |

### Leads

| Method | Path | Summary |
|--------|------|---------|
| GET | `/leads` | List leads |
| POST | `/leads` | Create lead |
| GET | `/leads/{id}` | Get lead |
| PATCH | `/leads/{id}` | Update lead |
| GET | `/leads/{id}/notes` | List lead notes |
| POST | `/leads/{id}/notes` | Add lead note |
| PATCH | `/leads/{id}/stage` | Update lead stage |

### Visits

| Method | Path | Summary |
|--------|------|---------|
| POST | `/visits` | Schedule visit |

### Notifications

| Method | Path | Summary |
|--------|------|---------|
| GET | `/notification-rules` | List notification rules |
| POST | `/notification-rules` | Create notification rule |
| PATCH | `/notification-rules/{id}` | Update notification rule |
| DELETE | `/notification-rules/{id}` | Delete notification rule |
| GET | `/notifications` | List notifications |
| POST | `/notifications/read-all` | Mark all notifications read |
| POST | `/notifications/{id}/read` | Mark notification read |

### CMS

| Method | Path | Summary |
|--------|------|---------|
| GET | `/cms/homepage` | Get homepage CMS payload |
| GET | `/cms/pages` | List CMS pages |
| POST | `/cms/pages` | Create CMS page |
| GET | `/cms/pages/{id}` | Get CMS page |
| PATCH | `/cms/pages/{id}` | Update CMS page |
| DELETE | `/cms/pages/{id}` | Delete CMS page |
| GET | `/pages/{slug}` | Get published page by slug |

### Metrics

| Method | Path | Summary |
|--------|------|---------|
| GET | `/metrics/dashboard` | Metrics dashboard |
| GET | `/metrics/reports` | Metrics reports |

### AI Config

| Method | Path | Summary |
|--------|------|---------|
| GET | `/ai/config` | Get AI config |
| PUT | `/ai/config` | Update AI config |
| POST | `/ai/config/preview` | Preview AI config |

### Bulk

| Method | Path | Summary |
|--------|------|---------|
| GET | `/bulk/properties/sessions/{id}` | Get bulk import session |
| GET | `/bulk/properties/sessions/{id}/errors.csv` | Download bulk validation errors |
| POST | `/bulk/properties/sessions/{id}/import` | Import validated bulk session |
| POST | `/bulk/properties/validate` | Validate bulk property import |

**CSV template (FE parses → `POST /bulk/properties/validate` `records[]`):**

| Column | Required | Notes |
|--------|----------|-------|
| `title` | Yes | Max 300 |
| `price` or `priceAmount` | Yes | Positive number |
| `propertyType` | Yes | e.g. Apartment, Villa |
| `bedrooms` | Yes | Integer ≥ 0 |
| `bathrooms` | Yes | Number ≥ 0 |
| `areaSqFt` | Yes | Number ≥ 0 ( > 0 to publish) |
| `addressLine` | Yes | Street / locality |
| `city`, `region`, `postalCode`, `country` | No | |
| `description` | No | |
| `status` | No | `draft` or `published` (case-insensitive); default draft |
| `agentId` | No | UUID |
| `featured` | No | true/false |
| `lat` / `lng` or `latitude` / `longitude` | No | Both recommended; missing pair → warning |

Import commits **valid rows only**. Download `errors.csv` for row/field/message/suggestion.

## Core schemas

See [openapi.json](./openapi.json) `components.schemas`: Error, Meta, UserPublic, Agent, Property, Lead, TokenResponse, AiSearchRequest, AiSearchResponse, AiConfig, enums.

Request/response models, field `required` / `minLength` / `format`, and HTTP status families live in OpenAPI. Implementers must not invent parallel DTOs.

## Error codes (SRS Appendix P)

| Code | HTTP | Meaning |
|------|------|---------|
| AUTH_INVALID_CREDENTIALS | 401 | Login failed |
| AUTH_TOKEN_EXPIRED | 401 | Access token expired |
| AUTH_FORBIDDEN | 403 | Role not permitted |
| VALIDATION_ERROR | 400/422 | Field validation failed |
| RESOURCE_NOT_FOUND | 404 | Entity missing |
| CONFLICT_DUPLICATE_EMAIL | 409 | Email exists |
| LEAD_IDEMPOTENCY_REPLAY | 200 | Duplicate Idempotency-Key |
| AI_UNAVAILABLE | 503 | Gemini unreachable |
| AI_TIMEOUT | 504 | Gemini timeout |
| BULK_PARSE_ERROR | 400 | CSV unreadable |
| BULK_VALIDATION_FAILED | 422 | Row errors present |
| PROPERTY_PUBLISH_BLOCKED | 422 | Missing required media/fields |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Unexpected server fault |

OpenAPI `components.schemas.Error.error.code` enum matches this catalog. UI handling: SRS Appendix P.

## Tag → UI / DB (traceability)

| Tag | Primary UI | Primary tables |
|-----|------------|----------------|
| Auth | SCR-LOGIN/REGISTER | `users`, `refresh_tokens` |
| Users / Agents | SCR-USERS, SCR-AGENTS | `users`, `agents` |
| Properties / Media | SCR-PROP-* | `properties`, amenities, landmarks, images |
| Search / AI | SCR-HOME, SCR-SEARCH-*, SCR-PROP-D | `properties` + Gemini |
| Favorites / Customer | SCR-CUS-DASH | `favorites`, `customer_profiles`, `saved_searches` |
| Leads / Visits | SCR-CLIENTS, SCR-LEAD-D | `leads`, `lead_notes`, `visit_requests` |
| Notifications | Bell / SCR-NTF-RULES | `notifications`, `notification_rules` |
| CMS | SCR-HOME, SCR-CMS | `cms_pages` |
| Metrics | SCR-CMD, SCR-REPORTS | `metrics_daily_snapshots`, `property_view_events` |
| AI Config | SCR-AI-CFG | `ai_configs` |
| Bulk | SCR-BULK | `bulk_upload_*` |

## Validation

Field-level rules: OpenAPI schemas + SRS FR Validation blocks. Index-level check:

```bash
python -c "import json; json.load(open('docs/openapi.json'))"
```
