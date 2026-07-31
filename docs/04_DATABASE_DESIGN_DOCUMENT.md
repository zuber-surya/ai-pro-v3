# Property AI Studio — Database Design

| Field | Value |
|-------|--------|
| **Document** | Complete Database Design |
| **Product** | Property AI Studio (UI: PropVista CRM) |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **RDBMS** | PostgreSQL |
| **ORM** | Prisma |
| **Sources** | Constitution, PRD, SRS, Production Architecture |

---

## 1. Design Goals

1. Persist all MVP entities required by SRS/PRD without implementing excluded products (Kanban WIP, reminder jobs, push tokens, multi-tenant `org_id`, video/VT assets).
2. Enforce integrity in the database where practical; enforce remaining rules in services.
3. Support role-based single-organization access patterns via `users.role` and ownership FKs.
4. Optimize common filters: property status/price/location, lead stage, favorites, notifications.
5. Provide audit fields on mutable business tables; soft-delete users.

---

## 2. Naming Standards

| Concern | Standard | Example |
|---------|----------|---------|
| Table names | `snake_case`, plural | `properties`, `lead_notes` |
| Column names | `snake_case` | `password_hash`, `created_at` |
| Primary key | `id` UUID | `id uuid PK` |
| Foreign key | `<table_singular>_id` | `property_id`, `agent_id` |
| Unique constraints | `uq_<table>_<cols>` | `uq_users_email` |
| Indexes | `ix_<table>_<cols>` | `ix_properties_status_price` |
| Check constraints | `ck_<table>_<rule>` | `ck_properties_status` |
| Enum types | `snake_case` PostgreSQL enums or Prisma enums | `user_role`, `property_status` |
| Prisma models | `PascalCase` singular | `model Property` |
| Join tables | descriptive plural | `favorites` (not `user_properties`) |
| JSON columns | suffix `_json` when opaque | `faqs_json`, `payload_json` |
| Booleans | `is_` / `has_` prefix | `is_active`, `is_published` |
| Timestamps | `*_at` timestamptz | `created_at`, `read_at` |
| Soft delete | `deleted_at` timestamptz null | users |

**Do not** invent `org_id` until multi-tenancy is Constitution-approved.

---

## 3. ER Diagram (DBML)

```dbml
Project property_ai_studio {
  database_type: 'PostgreSQL'
  Note: 'MVP schema — single organization, role-based RBAC'
}

Enum user_role {
  customer
  agent
  admin
  super_admin
}

Enum property_status {
  draft
  published
  archived
}

Enum property_image_kind {
  photo
  floorplan
}

Enum lead_stage {
  new
  contacted
  site_visit
  negotiation
  closed_won
  closed_lost
}

Enum notification_channel {
  email
  in_app
}

Enum visit_status {
  requested
  confirmed
  cancelled
  completed
}

Table users {
  id uuid [pk, default: `gen_random_uuid()`]
  email varchar(320) [not null, unique]
  password_hash varchar(255) [not null]
  role user_role [not null, default: 'customer']
  full_name varchar(200)
  avatar_url text
  is_active boolean [not null, default: true]
  deleted_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  created_by uuid
  updated_by uuid

  Note: 'Auth identity; Guest is unauthenticated (no row)'
}

Table refresh_tokens {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > users.id]
  token_hash varchar(255) [not null, unique]
  expires_at timestamptz [not null]
  revoked_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table agents {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [unique, ref: > users.id]
  name varchar(200) [not null]
  email varchar(320) [not null]
  phone varchar(40)
  profile_image_url text
  is_active boolean [not null, default: true]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  created_by uuid
  updated_by uuid
}

Table properties {
  id uuid [pk, default: `gen_random_uuid()`]
  title varchar(300) [not null]
  price numeric(14,2) [not null]
  currency char(3) [not null, default: 'INR']
  address_line varchar(500) [not null]
  city varchar(120)
  region varchar(120)
  postal_code varchar(32)
  country varchar(120)
  beds int [not null]
  baths numeric(4,1) [not null]
  sqft numeric(12,2) [not null]
  property_type varchar(80) [not null]
  year_built int
  description text
  highlights_json jsonb
  status property_status [not null, default: 'draft']
  agent_id uuid [ref: > agents.id]
  lat double
  lng double
  views_count int [not null, default: 0]
  saves_count int [not null, default: 0]
  published_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  created_by uuid
  updated_by uuid
}

Table property_amenities {
  id uuid [pk, default: `gen_random_uuid()`]
  property_id uuid [not null, ref: > properties.id]
  name varchar(120) [not null]
  is_custom boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table nearby_landmarks {
  id uuid [pk, default: `gen_random_uuid()`]
  property_id uuid [not null, ref: > properties.id]
  name varchar(200) [not null]
  category varchar(80)
  distance_m int
  lat double
  lng double
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table property_images {
  id uuid [pk, default: `gen_random_uuid()`]
  property_id uuid [not null, ref: > properties.id]
  url text [not null]
  kind property_image_kind [not null, default: 'photo']
  sort_order int [not null, default: 0]
  alt_text varchar(300)
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  created_by uuid
}

Table favorites {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > users.id]
  property_id uuid [not null, ref: > properties.id]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (user_id, property_id) [unique]
  }
}

Table customer_profiles {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, unique, ref: > users.id]
  budget_min numeric(14,2)
  budget_max numeric(14,2)
  property_types_json jsonb
  beds_min int
  location_preferences_json jsonb
  completion_pct int [not null, default: 0]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table leads {
  id uuid [pk, default: `gen_random_uuid()`]
  name varchar(200) [not null]
  email varchar(320) [not null]
  phone varchar(40)
  preferred_contact_time varchar(120)
  message text
  source varchar(80) [not null]
  stage lead_stage [not null, default: 'new']
  score numeric(5,2)
  property_id uuid [ref: > properties.id]
  assignee_agent_id uuid [ref: > agents.id]
  customer_user_id uuid [ref: > users.id]
  idempotency_key varchar(100) [unique]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  created_by uuid
  updated_by uuid
}

Table lead_notes {
  id uuid [pk, default: `gen_random_uuid()`]
  lead_id uuid [not null, ref: > leads.id]
  author_id uuid [ref: > users.id]
  body text [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table visit_requests {
  id uuid [pk, default: `gen_random_uuid()`]
  lead_id uuid [ref: > leads.id]
  property_id uuid [ref: > properties.id]
  requester_name varchar(200)
  requester_email varchar(320)
  requester_phone varchar(40)
  scheduled_at timestamptz [not null]
  notes text
  status visit_status [not null, default: 'requested']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  created_by uuid
  updated_by uuid
}

Table notifications {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > users.id]
  type varchar(80) [not null]
  title varchar(300) [not null]
  body text
  payload_json jsonb
  read_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table notification_rules {
  id uuid [pk, default: `gen_random_uuid()`]
  event_type varchar(80) [not null]
  channel notification_channel [not null]
  is_enabled boolean [not null, default: true]
  template_key varchar(120)
  config_json jsonb
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  created_by uuid
  updated_by uuid

  indexes {
    (event_type, channel) [unique]
  }
}

Table cms_pages {
  id uuid [pk, default: `gen_random_uuid()`]
  slug varchar(160) [not null, unique]
  title varchar(300) [not null]
  body_json jsonb [not null]
  is_published boolean [not null, default: false]
  published_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  created_by uuid
  updated_by uuid
}

Table ai_configs {
  id uuid [pk, default: `gen_random_uuid()`]
  key varchar(80) [not null, unique, default: 'default']
  greeting text [not null]
  faqs_json jsonb [not null, default: '[]']
  escalation_json jsonb [not null, default: '{}']
  tone varchar(40)
  prompts_json jsonb [not null, default: '{}']
  model_label varchar(80) [not null, default: 'gemini']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  created_by uuid
  updated_by uuid
}

Table property_view_events {
  id uuid [pk, default: `gen_random_uuid()`]
  property_id uuid [not null, ref: > properties.id]
  viewer_user_id uuid [ref: > users.id]
  session_id varchar(100)
  viewed_at timestamptz [not null, default: `now()`]
  created_at timestamptz [not null, default: `now()`]
}

Table metrics_daily_snapshots {
  id uuid [pk, default: `gen_random_uuid()`]
  snapshot_date date [not null, unique]
  active_listings int [not null, default: 0]
  active_leads int [not null, default: 0]
  conversion_rate numeric(7,4) [not null, default: 0]
  sessions_count int [not null, default: 0]
  lead_sources_json jsonb
  stage_distribution_json jsonb
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table bulk_upload_sessions {
  id uuid [pk, default: `gen_random_uuid()`]
  uploaded_by uuid [not null, ref: > users.id]
  file_name varchar(300) [not null]
  total_rows int [not null, default: 0]
  valid_rows int [not null, default: 0]
  error_rows int [not null, default: 0]
  warning_rows int [not null, default: 0]
  status varchar(40) [not null, default: 'validated']
  idempotency_key varchar(100) [unique]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table bulk_upload_row_errors {
  id uuid [pk, default: `gen_random_uuid()`]
  session_id uuid [not null, ref: > bulk_upload_sessions.id]
  row_number int [not null]
  field_name varchar(120)
  message text [not null]
  original_value text
  suggestion text
  severity varchar(20) [not null, default: 'error']
  created_at timestamptz [not null, default: `now()`]
}

Table saved_searches {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > users.id]
  name varchar(200)
  query_text text
  filters_json jsonb
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}
```

---

## 4. Table Specifications

### 4.1 `users`

**Purpose:** Authenticated identities and RBAC role assignment. Guests have no row.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, default `gen_random_uuid()` | |
| email | VARCHAR(320) | NOT NULL, UNIQUE `uq_users_email` | Login id |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt/argon2 |
| role | `user_role` | NOT NULL, default `customer` | No guest enum |
| full_name | VARCHAR(200) | NULL | Profile |
| avatar_url | TEXT | NULL | |
| is_active | BOOLEAN | NOT NULL, default true | |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Audit |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Audit |
| created_by | UUID | NULL | Actor |
| updated_by | UUID | NULL | Actor |

**Indexes:** `uq_users_email`; `ix_users_role`; `ix_users_deleted_at` (partial where null for active lookups optional).

**Relationships:** 1:N refresh_tokens, favorites, notifications, lead_notes; 1:1 agents?, customer_profiles?; optional lead.customer_user_id.

**Foreign Keys:** none required (self-audit refs optional, not FK-enforced to avoid cycles).

**Seed Data:**
- Super Admin: `admin@propvista.local` / hashed password / `super_admin`
- Admin sample, Agent-linked user, Customer sample

**Validation:** email format; unique email among non-deleted; role enum; password never stored plaintext; inactive or `deleted_at` set cannot auth.

**Audit Fields:** `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`.

---

### 4.2 `refresh_tokens`

**Purpose:** Persist refresh token hashes for session rotation/revocation.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK → users.id ON DELETE CASCADE |
| token_hash | VARCHAR(255) | NOT NULL, UNIQUE |
| expires_at | TIMESTAMPTZ | NOT NULL |
| revoked_at | TIMESTAMPTZ | NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

**Indexes:** `uq_refresh_tokens_token_hash`; `ix_refresh_tokens_user_id`; `ix_refresh_tokens_expires_at`.

**Relationships:** N:1 users.

**Seed:** none (runtime).

**Validation:** expires_at > created_at; revoked tokens rejected.

**Audit Fields:** `created_at`, `updated_at`.

---

### 4.3 `agents`

**Purpose:** Agent profile cards and listing ownership.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NULL, UNIQUE, FK → users.id ON DELETE SET NULL |
| name | VARCHAR(200) | NOT NULL |
| email | VARCHAR(320) | NOT NULL |
| phone | VARCHAR(40) | NULL |
| profile_image_url | TEXT | NULL |
| is_active | BOOLEAN | NOT NULL default true |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |
| created_by / updated_by | UUID | NULL |

**Indexes:** `uq_agents_user_id`; `ix_agents_email`; `ix_agents_is_active`.

**Relationships:** 1:N properties; 1:N leads (assignee); optional 1:1 users.

**FK:** `user_id` → `users.id`.

**Seed:** 2–3 agents with images/names matching demo HTML personas where useful.

**Validation:** name/email required; if `user_id` set, user.role should be `agent` (service-enforced).

**Audit Fields:** `created_at`, `updated_at`, `created_by`, `updated_by`.

---

### 4.4 `properties`

**Purpose:** Core listing inventory for search, detail, admin editor.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| title | VARCHAR(300) | NOT NULL |
| price | NUMERIC(14,2) | NOT NULL, CHECK `price >= 0` |
| currency | CHAR(3) | NOT NULL default `INR` |
| address_line | VARCHAR(500) | NOT NULL |
| city / region / postal_code / country | VARCHAR | NULL |
| beds | INT | NOT NULL, CHECK `beds >= 0` |
| baths | NUMERIC(4,1) | NOT NULL, CHECK `baths >= 0` |
| sqft | NUMERIC(12,2) | NOT NULL, CHECK `sqft > 0` for publish (service may allow draft 0—prefer `sqft >= 0` DB + service publish rule) |
| property_type | VARCHAR(80) | NOT NULL |
| year_built | INT | NULL, CHECK year reasonable |
| description | TEXT | NULL |
| highlights_json | JSONB | NULL |
| status | `property_status` | NOT NULL default `draft` |
| agent_id | UUID | NULL, FK → agents.id ON DELETE SET NULL |
| lat / lng | DOUBLE PRECISION | NULL |
| views_count / saves_count | INT | NOT NULL default 0, CHECK >= 0 |
| published_at | TIMESTAMPTZ | NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |
| created_by / updated_by | UUID | NULL |

**Indexes:**
- `ix_properties_status`
- `ix_properties_price`
- `ix_properties_city`
- `ix_properties_type`
- `ix_properties_agent_id`
- `ix_properties_status_price` (composite)
- `ix_properties_published_at`

**Relationships:** amenities, landmarks, images, favorites, leads, visit_requests, view_events.

**FK:** `agent_id` → `agents.id`.

**Seed:** 8–12 published properties with varied price/beds/city for AI search demos; 1–2 drafts.

**Validation (DB + service):**
- Publish requires title, price, beds, baths, sqft, address, type (SRS)
- Public queries `status = published` only
- Price displayed as numeric string in API mappers

**Audit Fields:** `created_at`, `updated_at`, `created_by`, `updated_by`, `published_at`.

---

### 4.5 `property_amenities`

**Purpose:** Amenity checklist + custom amenities on listings.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| property_id | UUID | NOT NULL, FK → properties.id ON DELETE CASCADE |
| name | VARCHAR(120) | NOT NULL |
| is_custom | BOOLEAN | NOT NULL default false |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

**Indexes:** `ix_property_amenities_property_id`; UNIQUE `(property_id, lower(name))` recommended.

**Relationships:** N:1 properties.

**Seed:** parking, balcony, etc. on seeded properties.

**Validation:** non-empty name; sanitize length.

**Audit Fields:** `created_at`, `updated_at`.

---

### 4.6 `nearby_landmarks`

**Purpose:** Neighborhood landmarks for detail/map (FR-PROP-D-011).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| property_id | UUID | NOT NULL, FK CASCADE |
| name | VARCHAR(200) | NOT NULL |
| category | VARCHAR(80) | NULL |
| distance_m | INT | NULL, CHECK >= 0 |
| lat / lng | DOUBLE PRECISION | NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

**Indexes:** `ix_nearby_landmarks_property_id`.

**Seed:** 2–4 landmarks per featured property.

**Validation:** name required.

**Audit Fields:** `created_at`, `updated_at`.

---

### 4.7 `property_images`

**Purpose:** Gallery photos and floorplans (no video kind in MVP).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| property_id | UUID | NOT NULL, FK CASCADE |
| url | TEXT | NOT NULL |
| kind | `property_image_kind` | NOT NULL default `photo` |
| sort_order | INT | NOT NULL default 0 |
| alt_text | VARCHAR(300) | NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |
| created_by | UUID | NULL |

**Indexes:** `ix_property_images_property_id_sort` `(property_id, sort_order)`.

**Seed:** multiple photos + optional floorplan URLs (local/seed assets).

**Validation:** kind ∈ {photo, floorplan}; MIME validated at upload; **no video**.

**Audit Fields:** `created_at`, `updated_at`, `created_by`.

---

### 4.8 `favorites`

**Purpose:** Customer saved properties; maintains `properties.saves_count` via service.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK CASCADE |
| property_id | UUID | NOT NULL, FK CASCADE |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

**Indexes:** UNIQUE `uq_favorites_user_property` `(user_id, property_id)`; `ix_favorites_property_id`.

**Relationships:** N:1 users, properties.

**Seed:** a few favorites for demo customer.

**Validation:** user must be customer (or allowed roles); property should be published for public UX.

**Audit Fields:** `created_at`, `updated_at`.

---

### 4.9 `customer_profiles`

**Purpose:** Requirement profile editor (budget, type, beds, locations, completion %).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, UNIQUE, FK CASCADE |
| budget_min / budget_max | NUMERIC(14,2) | NULL, CHECK min/max >= 0; service ensures min<=max |
| property_types_json | JSONB | NULL |
| beds_min | INT | NULL, CHECK >= 0 |
| location_preferences_json | JSONB | NULL |
| completion_pct | INT | NOT NULL default 0, CHECK 0..100 |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

**Indexes:** `uq_customer_profiles_user_id`.

**Seed:** profile for demo customer partially complete.

**Validation:** completion_pct recomputed in service from filled fields.

**Audit Fields:** `created_at`, `updated_at`.

---

### 4.10 `leads`

**Purpose:** CRM lead capture and pipeline list/detail (non-Kanban).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(200) | NOT NULL |
| email | VARCHAR(320) | NOT NULL |
| phone | VARCHAR(40) | NULL |
| preferred_contact_time | VARCHAR(120) | NULL |
| message | TEXT | NULL |
| source | VARCHAR(80) | NOT NULL |
| stage | `lead_stage` | NOT NULL default `new` |
| score | NUMERIC(5,2) | NULL, CHECK 0..100 |
| property_id | UUID | NULL, FK SET NULL |
| assignee_agent_id | UUID | NULL, FK SET NULL |
| customer_user_id | UUID | NULL, FK SET NULL |
| idempotency_key | VARCHAR(100) | NULL, UNIQUE |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |
| created_by / updated_by | UUID | NULL |

**Indexes:** `ix_leads_stage`; `ix_leads_email`; `ix_leads_assignee`; `ix_leads_property_id`; `ix_leads_created_at`; `uq_leads_idempotency_key`.

**Relationships:** notes, visits; optional property/agent/customer.

**Seed:** include a “Sarah Jenkins”-style demo lead for detail HTML fidelity.

**Validation:** name+email required; source required; idempotent create; stage enum only.

**Audit Fields:** `created_at`, `updated_at`, `created_by`, `updated_by`.

**Explicitly not stored (MVP):** Kanban WIP limits, reminder schedules, communication timeline events.

---

### 4.11 `lead_notes`

**Purpose:** Timestamped notes on lead detail (MVP subset of HTML).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| lead_id | UUID | NOT NULL, FK CASCADE |
| author_id | UUID | NULL, FK SET NULL → users |
| body | TEXT | NOT NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

**Indexes:** `ix_lead_notes_lead_id_created_at`.

**Seed:** 2–3 notes on demo lead.

**Validation:** body non-empty.

**Audit Fields:** `created_at`, `updated_at` (immutable prefer: disallow updates in service).

---

### 4.12 `visit_requests`

**Purpose:** Schedule visit / tour requests from CTAs and lead actions.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| lead_id | UUID | NULL, FK SET NULL |
| property_id | UUID | NULL, FK SET NULL |
| requester_name / email / phone | VARCHAR | NULL/typed |
| scheduled_at | TIMESTAMPTZ | NOT NULL |
| notes | TEXT | NULL |
| status | `visit_status` | NOT NULL default `requested` |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |
| created_by / updated_by | UUID | NULL |

**Indexes:** `ix_visit_requests_scheduled_at`; `ix_visit_requests_property_id`; `ix_visit_requests_lead_id`.

**Check:** at least one of `lead_id` or `property_id` NOT NULL (enforce in service or CHECK).

**Seed:** one upcoming visit for demo.

**Validation:** scheduled_at required; contact fields as per modal.

**Audit Fields:** `created_at`, `updated_at`, `created_by`, `updated_by`.

---

### 4.13 `notifications`

**Purpose:** In-app notification bell/dropdown.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK CASCADE |
| type | VARCHAR(80) | NOT NULL |
| title | VARCHAR(300) | NOT NULL |
| body | TEXT | NULL |
| payload_json | JSONB | NULL |
| read_at | TIMESTAMPTZ | NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

**Indexes:** `ix_notifications_user_id_created_at`; `ix_notifications_user_unread` partial `(user_id) WHERE read_at IS NULL`.

**Seed:** unread + read samples for customer/admin.

**Validation:** type/title required.

**Audit Fields:** `created_at`, `updated_at`, `read_at`.

---

### 4.14 `notification_rules`

**Purpose:** Admin rules UI — email + in_app only.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| event_type | VARCHAR(80) | NOT NULL |
| channel | `notification_channel` | NOT NULL (`email` \| `in_app`) |
| is_enabled | BOOLEAN | NOT NULL default true |
| template_key | VARCHAR(120) | NULL |
| config_json | JSONB | NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |
| created_by / updated_by | UUID | NULL |

**Indexes:** UNIQUE `(event_type, channel)`.

**Seed:** `new_lead`→email, `new_lead`→in_app enabled.

**Validation:** channel cannot be sms/whatsapp/push (enum excludes them).

**Audit Fields:** `created_at`, `updated_at`, `created_by`, `updated_by`.

---

### 4.15 `cms_pages`

**Purpose:** CMS pages + homepage content (`slug = 'homepage'` or dedicated).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| slug | VARCHAR(160) | NOT NULL, UNIQUE |
| title | VARCHAR(300) | NOT NULL |
| body_json | JSONB | NOT NULL |
| is_published | BOOLEAN | NOT NULL default false |
| published_at | TIMESTAMPTZ | NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |
| created_by / updated_by | UUID | NULL |

**Indexes:** `uq_cms_pages_slug`; `ix_cms_pages_published`.

**Seed:** `homepage`, `privacy`, `terms` with JSON sections matching homepage needs.

**Validation:** slug URL-safe; public reads only `is_published = true`.

**Audit Fields:** `created_at`, `updated_at`, `created_by`, `updated_by`, `published_at`.

---

### 4.16 `ai_configs`

**Purpose:** Admin chatbot configuration (Gemini-only).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| key | VARCHAR(80) | NOT NULL, UNIQUE default `default` |
| greeting | TEXT | NOT NULL |
| faqs_json | JSONB | NOT NULL default `[]` |
| escalation_json | JSONB | NOT NULL default `{}` |
| tone | VARCHAR(40) | NULL |
| prompts_json | JSONB | NOT NULL default `{}` |
| model_label | VARCHAR(80) | NOT NULL default `gemini` |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |
| created_by / updated_by | UUID | NULL |

**Indexes:** `uq_ai_configs_key`.

**Seed:** default greeting + sample FAQs.

**Validation:** greeting non-empty; `model_label` must remain Gemini family; faqs array of `{q,a}`.

**Audit Fields:** `created_at`, `updated_at`, `created_by`, `updated_by`.

---

### 4.17 `property_view_events`

**Purpose:** Raw events for “property views over time” chart; optionally increments `properties.views_count`.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| property_id | UUID | NOT NULL, FK CASCADE |
| viewer_user_id | UUID | NULL, FK SET NULL |
| session_id | VARCHAR(100) | NULL |
| viewed_at | TIMESTAMPTZ | NOT NULL default now() |
| created_at | TIMESTAMPTZ | NOT NULL |

**Indexes:** `ix_property_view_events_property_viewed_at`; `ix_property_view_events_viewed_at`.

**Seed:** synthetic views across last 30 days for charts.

**Validation:** property_id required.

**Audit Fields:** `created_at`, `viewed_at`.

---

### 4.18 `metrics_daily_snapshots`

**Purpose:** Pre-aggregated command center KPIs (listings, leads, conversion, sessions, source/stage JSON).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| snapshot_date | DATE | NOT NULL, UNIQUE |
| active_listings | INT | NOT NULL default 0 |
| active_leads | INT | NOT NULL default 0 |
| conversion_rate | NUMERIC(7,4) | NOT NULL default 0 |
| sessions_count | INT | NOT NULL default 0 |
| lead_sources_json | JSONB | NULL |
| stage_distribution_json | JSONB | NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

**Indexes:** `uq_metrics_daily_snapshots_date`.

**Seed:** 30 days of snapshots for SCR-CMD.

**Validation:** non-negative counters; conversion_rate 0..1 or 0..100 (pick one—recommend 0..1).

**Audit Fields:** `created_at`, `updated_at`.

---

### 4.19 `bulk_upload_sessions` / `bulk_upload_row_errors`

**Purpose:** Bulk upload validation results screen persistence.

**Session columns:** id, uploaded_by FK users, file_name, total/valid/error/warning counts, status, idempotency_key UNIQUE, audit timestamps.

**Error columns:** id, session_id FK CASCADE, row_number, field_name, message, original_value, suggestion, severity (`error`|`warning`), created_at.

**Indexes:** session by uploader/created; errors by `(session_id, row_number)`.

**Seed:** optional completed session with mixed errors for UI demo.

**Validation:** counts consistent with error rows; Admin-only writes.

**Audit Fields:** session `created_at`/`updated_at`; error `created_at`.

---

### 4.20 `saved_searches`

**Purpose:** Customer “Saved searches” quick action persistence.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK CASCADE |
| name | VARCHAR(200) | NULL |
| query_text | TEXT | NULL |
| filters_json | JSONB | NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

**Indexes:** `ix_saved_searches_user_id`.

**Seed:** 1–2 for demo customer.

**Validation:** belongs to user.

**Audit Fields:** `created_at`, `updated_at`.

---

## 5. Relationship Summary

| From | To | Type | On Delete |
|------|----|------|-----------|
| refresh_tokens.user_id | users | N:1 | CASCADE |
| agents.user_id | users | 0..1:1 | SET NULL |
| properties.agent_id | agents | N:1 | SET NULL |
| property_* children | properties | N:1 | CASCADE |
| favorites | users, properties | N:1 | CASCADE |
| customer_profiles.user_id | users | 1:1 | CASCADE |
| leads.property_id | properties | N:1 | SET NULL |
| leads.assignee_agent_id | agents | N:1 | SET NULL |
| leads.customer_user_id | users | N:1 | SET NULL |
| lead_notes.lead_id | leads | N:1 | CASCADE |
| visit_requests | leads/properties | N:1 | SET NULL |
| notifications.user_id | users | N:1 | CASCADE |
| bulk_upload_* | users / sessions | N:1 | RESTRICT/CASCADE |
| property_view_events.property_id | properties | N:1 | CASCADE |
| saved_searches.user_id | users | N:1 | CASCADE |

---

## 6. Data Integrity Rules

1. **Auth integrity:** unique email; soft-deleted/inactive users rejected at service layer; refresh tokens hashed.
2. **Listing integrity:** status enum only; publish gate in PropertyService; public read filter `published`.
3. **Favorite integrity:** unique (user, property); update `saves_count` transactionally.
4. **Lead integrity:** idempotency_key unique; stage enum; source required.
5. **Notification integrity:** channels limited to email/in_app via enum.
6. **CMS integrity:** unique slug; unpublished hidden publicly.
7. **AI config integrity:** singleton/default key; model_label constrained to Gemini.
8. **Media integrity:** image kinds photo/floorplan only — no video rows.
9. **Referential:** prefer CASCADE for owned children; SET NULL for optional attributions.
10. **Metrics:** snapshots unique per date; view events append-only.

---

## 7. Migration Strategy

### 7.1 Tooling
- Prisma Migrate only (`prisma migrate dev` / `deploy`)
- No manual production DDL
- Enable `gen_random_uuid()` via `pgcrypto` or Postgres 13+ built-in

### 7.2 Suggested Migration Sequence

| Migration | Contents |
|-----------|----------|
| 001_init_enums_users_tokens | enums, users, refresh_tokens |
| 002_agents_properties_children | agents, properties, amenities, landmarks, images |
| 003_favorites_profiles_saved_searches | customer engagement |
| 004_leads_notes_visits | CRM MVP |
| 005_notifications_rules | ntf |
| 006_cms_ai_config | cms_pages, ai_configs |
| 007_metrics_views | property_view_events, metrics_daily_snapshots |
| 008_bulk_upload | bulk sessions/errors |

### 7.3 Practices
- Expand-contract for breaking changes
- Backfill then add NOT NULL
- Always backup before prod migrate
- Seed in non-prod via `prisma db seed`
- Architecture smoke after migrate: auth + property + lead

### 7.4 Future Tables (Not Migrated in MVP)
`lead_events` (timeline), `reminders`, `automation_rules`, `kanban_wip_limits`, `push_devices`, `video_assets`, `organizations` — require Constitution/PRD activation.

---

## 8. Performance Considerations

| Area | Approach |
|------|----------|
| Property search/filter | Indexes on status, price, city, type; composite status+price; paginate |
| AI search corpus | Query published subset with `select` of prompt fields only |
| Lead list | Index stage + created_at; assignee filter index |
| Notifications bell | Partial index unread by user |
| Command center | Read `metrics_daily_snapshots` + bounded view_events aggregates |
| Favorites | Unique composite index; counter on property |
| Images | Order by sort_order indexed |
| Connection pooling | PgBouncer / Prisma pool in staging/prod |
| N+1 prevention | Prisma `include`/`select` in repositories |
| Bulk | Persist errors; stream parse; do not load unbounded rows into API response without pagination/tabs |

**Avoid:** unbounded `SELECT *` for admin grids; synchronous full-table scans for KPIs (use snapshots).

---

## 9. Seed Data Plan (Summary)

| Entity | Seed intent |
|--------|-------------|
| users | super_admin, admin, agent user, customer |
| agents | 2–3 profiles with images |
| properties | 8–12 published + drafts; amenities, landmarks, images |
| favorites / profiles / saved_searches | customer demo |
| leads / notes / visits | Sarah Jenkins-style + others |
| notifications / rules | unread samples; new_lead rules |
| cms_pages | homepage, legal |
| ai_configs | default Gemini greeting/FAQs |
| metrics + view_events | 30-day chart data |
| bulk session | optional validation demo |

Passwords only as hashes in seed; document demo credentials in private runbook—not in git if production-like.

---

## 10. Prisma Model Mapping (Implementers)

| Table | Prisma model |
|-------|----------------|
| users | User |
| refresh_tokens | RefreshToken |
| agents | Agent |
| properties | Property |
| property_amenities | PropertyAmenity |
| nearby_landmarks | NearbyLandmark |
| property_images | PropertyImage |
| favorites | Favorite |
| customer_profiles | CustomerProfile |
| leads | Lead |
| lead_notes | LeadNote |
| visit_requests | VisitRequest |
| notifications | Notification |
| notification_rules | NotificationRule |
| cms_pages | CmsPage |
| ai_configs | AiConfig |
| property_view_events | PropertyViewEvent |
| metrics_daily_snapshots | MetricsDailySnapshot |
| bulk_upload_sessions | BulkUploadSession |
| bulk_upload_row_errors | BulkUploadRowError |
| saved_searches | SavedSearch |

---

## 11. Audit Field Standard

All mutable business tables include:

| Field | Required | Meaning |
|-------|----------|---------|
| created_at | Yes | Insert time (timestamptz) |
| updated_at | Yes | Last update (maintained by Prisma `@updatedAt` or trigger) |
| created_by | Where actor known | User id (UUID, soft reference) |
| updated_by | Where actor known | User id |
| deleted_at | Users (and later entities as needed) | Soft delete |
| published_at / read_at / revoked_at | Domain-specific | Lifecycle markers |

Append-only tables (`property_view_events`, `bulk_upload_row_errors`, ideally `lead_notes`) minimize updates.

---

## 12. Validation Matrix (DB vs Service)

| Rule | DB | Service |
|------|----|---------|
| Email unique | UNIQUE | + format |
| Role/status/stage enums | ENUM | + transition rules |
| Price >= 0 | CHECK | + publish required fields |
| Favorite uniqueness | UNIQUE | + authz |
| Idempotent leads | UNIQUE key | + replay semantics |
| Notification channels | ENUM email/in_app | + rules UI |
| No video kinds | ENUM photo/floorplan | + upload MIME |
| Soft-delete auth block | — | Yes |
| Agent owns property | FK only | Yes RBAC |
| Completion % | CHECK 0..100 | Yes recompute |

---

## 13. Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Initial complete DB design from Constitution, PRD, SRS, Architecture |

---

**End of Database Design**

*Implement via Prisma schema mirroring this document. Do not add excluded MVP tables without Constitution amendment.*
