# PropVista CRM / Property AI Studio — Deployment Guide

| Field | Value |
|-------|--------|
| **Document** | `12_DEPLOYMENT_GUIDE.md` |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **Governance** | `00_PROJECT_CONSTITUTION.md` §24 |
| **Release gates** | `18_RELEASE_CHECKLIST.md` |
| **Architecture** | `03_SYSTEM_ARCHITECTURE_DOCUMENT.md` |

---

## 1. Purpose

Operational guide to deploy Property AI Studio / PropVista CRM across Local, Staging, and Production. Binding stack and rules come from the Constitution; release Go/No-Go uses the Release Checklist.

---

## 2. Deployment Targets

| Component | Technology | Host |
|-----------|------------|------|
| Frontend | Next.js 15 | **Vercel** |
| Backend | Node.js + Express | Process host paired with PostgreSQL (platform per ops) |
| Database | PostgreSQL | Managed or self-hosted |
| AI | Google Gemini | Google Cloud / AI Studio keys (server-only) |
| Email | Provider SMTP/API | Secrets vault |
| Media (dev) | Local filesystem | Backend disk |
| Media (prod) | Object storage (ops-defined) | Must preserve same API URL shapes |

---

## 3. Environments

| Environment | Purpose | Gemini | Notes |
|-------------|---------|--------|-------|
| Local | Developer machines | Mock or limited key | Local Postgres + local media |
| Staging | Pre-prod QA / UAT | Real key, rate-limited | Prod-like config |
| Production | Live users | Real key | Secrets in platform vault only |

---

## 4. Prerequisites

- Node.js LTS compatible with Next 15 / Express  
- PostgreSQL reachable via `DATABASE_URL`  
- Vercel project linked to `frontend/`  
- Backend host with Node process manager (or container)  
- Secret store access (Vercel env + server secrets)  
- `GEMINI_API_KEY`, JWT secrets, email credentials  

---

## 5. Environment Variables

### Backend (typical)

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Postgres connection |
| `JWT_ACCESS_SECRET` | Yes | Access token signing |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing |
| `GEMINI_API_KEY` | Yes | Server-only |
| `PORT` | Yes | e.g. 4000 |
| `CORS_ORIGIN` | Yes | FE origin(s) |
| `EMAIL_*` | Yes (staging/prod) | Provider-specific |
| `STORAGE_ROOT` | Dev | Local media path |

### Frontend

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Must point to `/api/v1` base (non-secret) |

**Never** put Gemini keys or JWT secrets in `NEXT_PUBLIC_*` or git.

---

## 6. Database Migrations

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

**Rules**

1. Take DB backup before production migrate.  
2. Apply migrations **before** serving app versions that need the new schema.  
3. Prefer forward-fix over untested down migrations.  
4. Record migration log in the release packet.  

Seed (non-prod):

```bash
npx prisma db seed
```

---

## 7. Backend Deploy

1. Set secrets on the host.  
2. Install deps (`npm ci`).  
3. `prisma migrate deploy` + `generate`.  
4. Build if applicable (`npm run build`).  
5. Start process (`node dist/server.js` or `npm start`).  
6. Verify `GET /api/v1/health`.  
7. Confirm CORS allows the FE origin.  

Rate limits for `/auth` and AI routes must be enabled in staging/prod.

---

## 8. Frontend Deploy (Vercel)

1. Root directory: `frontend/` (or monorepo filter).  
2. Set `NEXT_PUBLIC_API_BASE_URL` to staging/prod API.  
3. Deploy via Vercel Git integration or CLI.  
4. Confirm build succeeds (lint/typecheck in CI preferred before merge).  
5. Smoke homepage + login against the correct API.  

---

## 9. Recommended Deploy Order

```text
1. Backup DB (+ media if needed)
2. prisma migrate deploy
3. Deploy backend
4. Health check backend
5. Deploy frontend (Vercel)
6. Smoke tests
7. Post-deploy soak / monitoring watch
```

Full checklist: `18_RELEASE_CHECKLIST.md`.

---

## 10. CI/CD Outline

```text
PR → lint → typecheck → unit → integration (test DB) → build
main → deploy staging → smoke
git tag vX.Y.Z → production per Release Checklist
```

Merge requires CI green, code review, QA for user-facing, Constitution DoD, no permanent mocks.

---

## 11. Smoke Tests (mandatory)

After every staging/prod deploy:

1. Health OK  
2. Login (or register/login)  
3. Property list/detail  
4. AI search (success **or** correct fallback UI)  
5. Lead capture  
6. Admin login  

No console errors on smoke paths.

---

## 12. Rollback

| Layer | Action |
|-------|--------|
| Frontend | Revert to previous Vercel deployment |
| Backend | Redeploy previous image/tag/commit |
| Database | Restore pre-deploy snapshot **or** forward-fix migration |

Rollback owner and triggers are recorded in the release packet before Go.

---

## 13. Storage

- **Development:** local filesystem.  
- **Production:** object/storage strategy as ops defines.  
- **Contract rule:** API response shapes for media URLs must remain stable for the UI.  

---

## 14. Security Deploy Checks

- [ ] Secrets only in vault / platform env  
- [ ] Gemini key not in FE bundle  
- [ ] HTTPS on public endpoints  
- [ ] CORS locked to known origins  
- [ ] Out-of-MVP features not exposed via flags/nav  

---

## 15. Monitoring After Deploy

- Health/uptime check  
- 5xx rate  
- Auth failure spikes  
- AI latency / fallback rate  

See Handover Guide §28 and Release Checklist monitoring section.

---

## 16. Related Documents

| Doc | Use |
|-----|-----|
| `00_PROJECT_CONSTITUTION.md` §24 | Binding deploy standards |
| `03_SYSTEM_ARCHITECTURE_DOCUMENT.md` | Topology |
| `18_RELEASE_CHECKLIST.md` | Go/No-Go gates |
| `20_PROJECT_HANDOVER_GUIDE.md` | Ops onboarding |
| `17_API_CHECKLIST.md` | API deploy verification |

---

## 17. Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Initial Deployment Guide |

---

**End of Deployment Guide**
