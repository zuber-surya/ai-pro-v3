# PropVista CRM — Business Requirements Document

| Field | Value |
|-------|--------|
| **Document** | Business Requirements Document (BRD) |
| **Product** | PropVista CRM (Property AI Studio) |
| **Version** | 1.0.0 |
| **Date** | 2026-08-05 |
| **Audience** | Business owners, product, sales, operations, partners (non-technical) |
| **Purpose** | Describe what the product does, who uses it, and how work flows |

---

## 1. Executive summary

PropVista CRM is an **AI-powered real estate platform** that helps people find properties with everyday language, and helps agents and admins manage listings, leads, and customer relationships in one place.

**In simple terms:** buyers search and inquire; customers track saved homes and visits; agents and admins run inventory, leads, and reporting — with an AI assistant that understands natural language (for example: “3BHK near metro under 1 crore”).

---

## 2. Business problem

| Today’s pain | Impact |
|--------------|--------|
| Listings, leads, and reporting live in separate tools | Slow handoffs, lost follow-ups |
| Search relies on rigid filters only | Buyers struggle to describe what they want |
| No single view for agents and managers | Hard to see pipeline health and performance |

---

## 3. Business solution

One web application that:

1. Lets visitors **search properties in plain language** (and with filters).  
2. Shows **clear match explanations** when AI search is used.  
3. Captures **leads and inquiries** from the website.  
4. Gives **customers** a personal area for saved homes, requirements, and history.  
5. Gives **agents and admins** tools for listings, leads, visits, content, and reports.  
6. Sends **email and in-app notifications** (not SMS/WhatsApp in this release).

---

## 4. Who uses the product

| Role | Who they are | What they do |
|------|--------------|--------------|
| **Visitor (Guest)** | Not logged in | Browse home page, search, view property details, start chat, register |
| **Customer** | Registered buyer/seeker | Save properties, manage requirements, track inquiries, schedule visits, use loan helper |
| **Agent** | Sales consultant | Work assigned listings and leads, update notes/stages, schedule visits |
| **Admin** | Operations manager | Manage users, listings, leads, website content, reports, AI assistant settings |
| **Super Admin** | System owner | Full control, including elevated user and system settings |

---

## 5. What is included in this release (MVP)

### For the public

- Attractive home page with AI search and featured properties  
- Property search with results, empty state, and “try again / broaden search” guidance  
- Property detail pages (photos, amenities, map, contact / inquire / schedule)  
- Public information pages (for example privacy / terms)  
- Website chat assistant  

### For customers (after login)

- Personal dashboard  
- Saved / favourite properties  
- Requirement profile (what they are looking for)  
- Inquiry history  
- Saved searches and alerts (in-app)  
- Loan / affordability helper on property pages  

### For agents and admins

- Command center (overview of activity and performance)  
- Property inventory (create, edit, publish, archive)  
- Bulk upload of listings from a spreadsheet file (CSV)  
- Lead list and lead detail (contact info, stage, notes, site visit)  
- User and agent management  
- Website content (CMS) management  
- Reports  
- AI assistant configuration (greeting, FAQs, tone, escalation rules)  
- Notification rules (email + in-app)  

### Explicitly **not** in this release

- Kanban drag-and-drop lead board  
- Full communication timeline product  
- Automated reminder engines  
- Virtual tours / video uploads  
- SMS, WhatsApp, or mobile push notifications  
- Multi-company / multi-tenant setups  

These may be considered in later phases.

---

## 6. End-to-end business flows

### 6.1 Visitor finds a home

```text
Visit website
    → Enter a natural-language search (or use filters)
    → Review matching properties (with match reasons when AI is used)
    → Open a property detail page
    → Inquire, request callback, or schedule a visit
    → Optionally register / sign in to save favourites
```

**If AI search cannot run:** the system still returns filter-based results so the visitor is never stuck with a blank page.

### 6.2 Visitor becomes a customer

```text
Register with email and password
    → Sign in
    → Land on customer home
    → Save properties, set requirements, review inquiries
    → Get in-app notifications for important updates
```

### 6.3 Lead capture and follow-up

```text
Visitor submits inquiry / contact / visit request
    → Lead appears for agents/admins
    → Agent opens lead detail
    → Updates stage and adds notes
    → Schedules a site visit when a property is linked
    → Continues follow-up until closed or handed off
```

### 6.4 Listing lifecycle (agent / admin)

```text
Create listing (or bulk-upload CSV)
    → Add photos and details
    → Save as draft or publish
    → Listing appears in public search when published
    → Update, archive, mark sold/rented as needed
```

### 6.5 Admin operations

```text
Sign in as Admin / Super Admin
    → Review command center (KPIs and activity)
    → Manage users and agents
    → Configure AI assistant behaviour
    → Publish CMS pages
    → Review reports and notification rules
```

### 6.6 AI assistant (website chat)

```text
Visitor opens chat
    → Asks property or process questions
    → Receives guided answers (configured by Admin)
    → Can be escalated to a human when rules say so
```

---

## 7. Functional requirements (business view)

### 7.1 Discovery & marketing

| ID | Requirement |
|----|-------------|
| BR-01 | Home page must present brand, AI search, featured properties, and clear calls to action |
| BR-02 | Visitors must search by natural language and/or filters (price, type, bedrooms, amenities, location) |
| BR-03 | Search results must show property cards with key facts; AI mode should show match strength and reasons |
| BR-04 | Empty or failed AI search must offer clear next steps (broaden, guided match, suggestions) |
| BR-05 | Property detail must show gallery, key specs, amenities, location map, and contact actions |
| BR-06 | Visitors may use an on-site chat assistant |

### 7.2 Customer account

| ID | Requirement |
|----|-------------|
| BR-07 | Customers can save/favourite properties |
| BR-08 | Customers can maintain a requirement profile |
| BR-09 | Customers can view inquiry history |
| BR-10 | Customers can save searches and see related notifications |
| BR-11 | Customers can use affordability / loan analysis on a property |

### 7.3 CRM & visits

| ID | Requirement |
|----|-------------|
| BR-12 | Inquiries and contact forms create actionable leads |
| BR-13 | Agents/admins can list leads and open lead detail |
| BR-14 | Agents/admins can change lead stage and add notes |
| BR-15 | Site visits can be scheduled when a property is associated |
| BR-16 | Kanban board is **out of scope** for this release |

### 7.4 Inventory & content

| ID | Requirement |
|----|-------------|
| BR-17 | Agents/admins can create and edit listings with media |
| BR-18 | Admins can bulk-upload listings via CSV with validation before import |
| BR-19 | Admins can manage public content pages (CMS) |
| BR-20 | Only published listings appear in public discovery |

### 7.5 Administration & insights

| ID | Requirement |
|----|-------------|
| BR-21 | Admins see a command center with key metrics and recent activity |
| BR-22 | Admins can view reports |
| BR-23 | Admins can manage users and agents by role |
| BR-24 | Admins can configure AI assistant greeting, FAQs, tone, and escalation |
| BR-25 | Notifications in this release are email and in-app only |

### 7.6 Access & trust

| ID | Requirement |
|----|-------------|
| BR-26 | Users sign in with email and password |
| BR-27 | Each role only sees functions appropriate to that role |
| BR-28 | After login, customers go to the customer area; agents/admins go to the admin area |

---

## 8. Success measures (business)

| Goal | How we know |
|------|-------------|
| Easier discovery | Visitors complete searches and open property details |
| Better conversion | Inquiries and visit requests are created from the site |
| Operational control | Admins manage listings, leads, and content without separate tools |
| Trustworthy AI | Search either returns explained matches or a clear fallback |
| Scope honesty | Out-of-scope items (Kanban, SMS, etc.) are not presented as available |

---

## 9. Assumptions & constraints

- One organisation operates the system (not a multi-company marketplace).  
- Design look-and-feel follows the approved PropVista visual references.  
- AI answers depend on configured behaviour and available listing data.  
- Formal production go-live still follows the organisation’s release and approval process.  

---

## 10. Technology stack (reference only)

*For IT / implementation partners. Business readers can skip this section.*

| Area | Choice |
|------|--------|
| Web application (user interface) | Next.js, React, TypeScript, Tailwind |
| Hosting (website) | Vercel |
| Application server (API) | Node.js, Express, TypeScript |
| Database | PostgreSQL (Prisma) |
| AI provider | Google Gemini only |
| Maps | Leaflet + OpenStreetMap |
| Sign-in | Email/password with secure tokens |
| Alerts (this release) | Email + in-app |

---

## 11. Related documents

| Document | Use |
|----------|-----|
| `docs/REQUIREMENTS_AND_PROPOSAL.md` | Full functional source of truth |
| `docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md` | Detailed product requirements |
| `docs/design_reference/` | Approved screen designs |
| `docs/18_RELEASE_CHECKLIST.md` | Release readiness |
| `docs/REQUIREMENTS_DOCUMENTATION.md` | Technical team overview (modules, routes, stack detail) |

---

## 12. Revision history

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-08-05 | Initial business requirements document for non-technical sharing |
