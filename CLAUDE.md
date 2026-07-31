# Claude Code / AI Assistant Instructions — Property AI Studio

## Read first

1. `docs/00_PROJECT_CONSTITUTION.md` (binding)
2. `docs/REQUIREMENTS_AND_PROPOSAL.md` (functional SOT, v2)
3. `docs/design_reference/**` for any UI work (HTML wins)
4. `docs/openapi.yaml` for APIs
5. `docs/13_AI_DEVELOPMENT_RULES.md` + `docs/14_CODING_STANDARDS.md`

Frozen docs tag: **`docs-v1.0`**.

## Non-negotiables

- Stack: Next.js 15, React 19, Express, Prisma, PostgreSQL, **Gemini only**, Leaflet+OSM, Vercel FE
- Auth: email + password; JWT; five roles; **no** permission tables
- Notifications MVP: email + in-app only
- Out of MVP: Kanban, activity timeline product, reminders/automation, virtual tours/video, SMS/WhatsApp/push, alternate LLMs
- No redesign — match HTML/`screen.png`
- No business logic in UI components; centralized `frontend/src/lib/api`
- One task at a time; DoR → implement → tests → pixel check → review → merge

## Layout

```
frontend/src/app/          # thin routes
frontend/src/features/     # feature modules
frontend/src/lib/api/      # only HTTP client
backend/src/routes|services|repositories|integrations
docs/                      # SOT — do not "fix" HTML to match bad code
```

## Commands

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
npm run lint && npm run typecheck && npm test && npm run build
```

## When unsure

Ask. Do not invent features, stack substitutions, or UI. Prefer smallest change that satisfies AC.
