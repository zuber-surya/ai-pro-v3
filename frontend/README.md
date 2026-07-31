# PropVista CRM — Frontend

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3000  
API base: `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:4000/api/v1`)

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Folder layout

See Constitution §10 / `docs/06_FRONTEND_ARCHITECTURE.md`:

- `src/app/` — thin routes only
- `src/features/` — feature UI + hooks
- `src/components/` — shared primitives
- `src/lib/api/` — **only** place for HTTP to backend

UI SOT: `docs/design_reference/**` (HTML wins). No redesign.
