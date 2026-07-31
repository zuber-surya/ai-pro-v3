# PropVista CRM — Backend

Express · TypeScript · Prisma · PostgreSQL

## Setup

```bash
cp .env.example .env
# Start PostgreSQL and set DATABASE_URL
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Health: http://localhost:4001/api/v1/health

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server (tsx watch) |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest |
| `npm run prisma:migrate` | Dev migrations |
| `npm run prisma:deploy` | Deploy migrations |

Stack and layers: `docs/00_PROJECT_CONSTITUTION.md`, `docs/03_SYSTEM_ARCHITECTURE_DOCUMENT.md`.  
API contract: `docs/openapi.yaml`. Gemini keys server-only.
