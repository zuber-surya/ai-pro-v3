# API Specification Index

Property AI Studio (PropVista CRM) -- OpenAPI **3.1**.

| Artifact | Path |
|----------|------|
| OpenAPI JSON | [openapi.json](./openapi.json) |
| OpenAPI YAML | [openapi.yaml](./openapi.yaml) |

## Overview

- **Base path:** `/api/v1`
- **Auth:** JWT Bearer
- **AI provider:** Gemini only
- **Roles:** `customer`, `agent`, `admin`, `super_admin` -- **Guest** = no auth
- **Error envelope:** `{"error":{"code","message","details[]"}}`
- **Pagination:** `meta` on list responses
- **Prices:** decimal strings
- **Notification channels:** `email`, `in_app` only

## Servers

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:4000/api/v1` |
| Staging | `https://staging-api.propvista.example/api/v1` |
| Production | `https://api.propvista.example/api/v1` |

## Statistics

- **Path templates:** 55
- **Operations:** 77

## Operations by tag

### Health

| Method | Path | Summary |
|--------|------|---------|
| GET | `/health` | Health check |

### Auth

| Method | Path | Summary |
|--------|------|---------|
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Current user profile |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/register` | Register customer |
| POST | `/auth/token` | Obtain tokens |

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

## Core schemas

See [openapi.json](./openapi.json) `components.schemas`: Error, Meta, UserPublic, Agent, Property, Lead, TokenResponse, AiSearchRequest, AiSearchResponse, AiConfig, enums.

## Validation

```bash
python -c "import json; json.load(open('docs/openapi.json'))"
```
