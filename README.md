# Property AI Studio (PropVista CRM)

AI-powered real estate platform — docs frozen at tag **`docs-v1.0`**.

## Monorepo

| Path | Stack |
|------|--------|
| `docs/` | Constitution, PRD, SRS, OpenAPI, design_reference |
| `frontend/` | Next.js 15, React 19, TypeScript, Tailwind → Vercel |
| `backend/` | Express, Prisma, PostgreSQL, Gemini (server-only) |

## Prerequisites

- Node.js 20+
- PostgreSQL (for backend migrate)
- Copy env examples (never commit secrets):
  - `backend/.env.example` → `backend/.env`
  - `frontend/.env.example` → `frontend/.env.local`

## Local run

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
# → http://localhost:4001/api/v1/health

# Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
# → http://localhost:3001
```

From repo root:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Authority

1. `docs/00_PROJECT_CONSTITUTION.md`
2. `docs/REQUIREMENTS_AND_PROPOSAL.md` (v2)
3. `docs/design_reference/**` (HTML wins UI)
4. `docs/openapi.yaml`

Gemini only. Email + in-app notifications only. Five roles. No Kanban / SMS / WhatsApp / push in MVP.

## AI assistants

See `CLAUDE.md` and `docs/13_AI_DEVELOPMENT_RULES.md`.

## Local QA

- Frontend `http://localhost:3001` · API `http://localhost:4001/api/v1`
- Create a customer: `POST /api/v1/auth/register` (`email`, `password`, `fullName`)
- Create/reset admin: `node backend/scripts/upsert-cmd-admin.mjs` (local only; do not commit passwords)
- Screen → route status: `docs/design_reference/design-references-catalog.md`
- Pixel checklist: `docs/16_UI_PIXEL_PERFECT_CHECKLIST.md` (§39 verification log)
- Design references: `docs/design_reference/**` (HTML wins; do not edit to match the app)
