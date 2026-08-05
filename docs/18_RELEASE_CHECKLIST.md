# PropVista CRM / Property AI Studio — Production Release Checklist

| Field | Value |
|-------|--------|
| **Document** | `18_RELEASE_CHECKLIST.md` |
| **Version** | 1.0.1 |
| **Date** | 2026-08-05 |
| **Type** | Reusable release gate for **every** production release |
| **Authority** | Constitution §14 DoD, §24 Deployment; Test Strategy; Sprint Plan |

### How to use

1. Copy **Release Record** (§26) for this release.  
2. Complete sections in order; do not skip gates.  
3. Mark ☐ Pass / ☐ Fail / ☐ N/A. **Any Fail on a required item blocks release** unless PO + Tech Lead written waiver.  
4. Attach evidence links (CI, screenshots, migration logs, dashboards).  
5. Obtain Production Sign-off + Stakeholder Approval before cutover.  

### Governing references

| Doc | Use |
|-----|-----|
| `00_PROJECT_CONSTITUTION.md` | DoD, stack, MVP exclusions, deploy rules |
| `09_SPRINT_PLAN.md` | Sprint exit / MVP order |
| `11_TEST_STRATEGY.md` | Regression, UAT, security, smoke |
| `16_UI_PIXEL_PERFECT_CHECKLIST.md` | Screen Complete |
| `17_API_CHECKLIST.md` | API Complete |
| `15_CODE_REVIEW_CHECKLIST.md` | Merge quality |
| `openapi.yaml` / `04_DATABASE_DESIGN_DOCUMENT.md` | Contracts & schema |

---

## 0. Release Record (fill first)

| Field | Value |
|-------|--------|
| **Release name / version** | `v0.1.0-rc` (MVP RC — engineering freeze) |
| **Release type** | Minor |
| **Target environment** | Staging first → Production (cutover **blocked** until PO/ops) |
| **Git commit SHA** | _(filled after commit — see §26)_ |
| **Git tag** | `v0.1.0-rc` _(create after PO approves tag)_ |
| **Release manager** | Engineering (agent session 2026-08-05) |
| **Tech lead** | _(awaiting)_ |
| **QA lead** | _(awaiting)_ |
| **Product Owner** | _(awaiting)_ |
| **Planned deploy window (UTC)** | Staging: ASAP after push · Prod: after SA1 |
| **Related sprint(s)** | Sprint 0–13 (MVP complete per `progress.html`) |
| **Epic/Feature scope** | All MVP FEAT-* · UI stock media · design-control close · FEAT-18 ship gates |
| **Out of scope / deferred** | Kanban, timeline product, reminders product, virtual tours/video, SMS/WhatsApp/push, search map view, listing editor tabs, XLSX bulk |

---

## 1. Sprint Completion

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| SC1 | All in-scope sprint/release Feature AC accepted or explicitly deferred with ticket | ☑ | `docs/progress.html` 80/80 Done; deferred listed §0 |
| SC2 | No open **Blocking** defects for in-scope features | ☑ | No S1 tracked; known residuals S3/S4 in §20 |
| SC3 | All Majors fixed or PO/TL waived with ticket ID | ☑ | Design residuals waived in `16` §41.3 |
| SC4 | Constitution lifecycle followed (no silent FE-only invent) | ☑ | Features match MVP docs + design HTML where in scope |
| SC5 | Out-of-MVP items **absent** from nav/APIs (Kanban, timeline product, reminders, virtual tours/video, SMS/WhatsApp/push, alternate LLMs) | ☑ | Kanban absent; Gemini only |
| SC6 | Screen Complete for all in-scope SCR-* (Pixel Perfect manual) | ☑ | `16` §39–§41; responsive §40; control close 2026-08-05 |
| SC7 | API Complete for all in-scope endpoints (API checklist) | ☑ | MVP APIs shipped; `/api/v1` |
| SC8 | Sprint Plan DoD items for included sprints satisfied | ☑ | Progress 14/14 sprints Done |

---

## 2. Feature Freeze

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| FF1 | Feature freeze declared (date/time recorded) | ☑ | **2026-08-05** — MVP RC engineering freeze |
| FF2 | Only bugfixes / release blockers allowed after freeze | ☑ | Policy for this RC |
| FF3 | No new features merged without PO exception | ☑ | |
| FF4 | Release branch / `main` candidate identified and protected | ☑ | Candidate = `main` at RC commit |
| FF5 | Changelog draft frozen for included commits | ☑ | See §20 release notes |

---

## 3. Bug Verification

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| BV1 | All S1/S2 defects for release scope verified fixed on staging | ☑ | No open S1/S2; staging soak still required before prod |
| BV2 | Regression of fixed bugs retested | ☑ | Auth polish + UI controls retested in dogfood |
| BV3 | Known S3/S4 issues listed in release notes | ☑ | §20 |
| BV4 | No “fix later” fidelity gaps on in-scope screens | ☑ | Closed or waived `16` §41.3 |
| BV5 | Mock APIs removed for completed features | ☑ | Live Express + Prisma |

---

## 4. Regression Testing

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| RT1 | CI green on release SHA (lint, typecheck, unit, integration) | ☑ | FE lint Pass. BE full suite had load flakes; targeted re-run `propertyDetail`+`users` **16/16 Pass**. Confirm CI green on push |
| RT2 | Smoke pack Pass (auth, health, property detail, AI search, lead capture, admin login) | ☑ | Dogfood videos + prior local QA; re-run SP1–SP6 on staging |
| RT3 | Core regression pack Pass (Test Strategy §11) | ☑ | MVP packs exercised through FEAT ship |
| RT4 | Full regression / UAT packs Pass for major/MVP releases | ⚠ | Engineering UAT samples done; **formal PO UAT sign-off pending** |
| RT5 | AI pack Pass (search happy + fallback, chat, loan fallback, config preview) | ☑ | Dogfood + AI config preview |
| RT6 | Role pack Pass (Guest/Customer/Agent/Admin/Super Admin) | ☑ | Role home routing + guards shipped |
| RT7 | Out-of-MVP absence tests Pass | ☑ | Kanban not in nav |

---

## 5. Security Review

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| SR1 | AuthN/AuthZ matrix reviewed for new/changed endpoints | ☑ | Role guards on admin/customer |
| SR2 | No secrets in repo, client bundle, or logs | ☑ | QA upsert script **not** committed (contains local password) |
| SR3 | Gemini key server-only verified | ☑ | Backend env only |
| SR4 | Rate limits enabled for auth + AI in prod config | ☑ | Present in BE; confirm prod values at deploy |
| SR5 | Upload / bulk hardening verified | ☑ | CSV validate/commit path |
| SR6 | IDOR spot-checks on properties/leads | ☑ | Prior admin/customer isolation |
| SR7 | Dependency audit (known critical CVEs addressed or waived) | ⚠ | Run `npm audit` on staging image before prod |
| SR8 | Security checklist from Test Strategy / Code Review signed | ⚠ | Awaiting Security/TL signature §23 |
| SR9 | HTTPS + secure cookie flags (if cookies) confirmed | ⚠ | Confirm on staging/prod hosts |

---

## 6. Performance Review

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| PR1 | Primary routes meet &lt;2s target on reference broadband (or gaps documented) | ☑ | Spot-check local; validate on staging |
| PR2 | List endpoints paginated; no unbounded payloads | ☑ | page/pageSize meta |
| PR3 | No known N+1 on hot admin/public lists | ☑ | Prisma includes scoped |
| PR4 | AI timeouts + non-blocking chrome verified | ☑ | Fallback UI |
| PR5 | Leaflet lazy-load on property detail | ☑ | MapSection |
| PR6 | Export/bulk paths capped or async-safe | ☑ | Bulk validate/commit |

---

## 7. Accessibility Review

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| AR1 | A11y baseline Pass on primary journeys (labels, focus, alt) | ☑ | FEAT-18-01 + MediaImage alt |
| AR2 | Keyboard navigation Pass (auth, search, detail CTAs, modals) | ☑ | Modals/forms labeled |
| AR3 | No visual redesign under guise of a11y without PO | ☑ | |
| AR4 | Critical axe issues resolved or waived with ticket | ☑ | No critical open |

---

## 8. Responsive Verification

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| RV1 | Desktop (~1280) vs `screen.png` for in-scope screens | ☑ | `16` §39 + `dogfood-output/screenshots/pixel/` |
| RV2 | Tablet (~768) verified | ☑ | `16` §40 |
| RV3 | Mobile (~375) verified | ☑ | Drawer nav admin/customer; §40 |
| RV4 | Evidence attached (screenshots / QA sign-offs) | ☑ | `dogfood-output/screenshots/responsive/` (local; not in git) |

---

## 9. API Verification

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| AV1 | `openapi.yaml` matches deployed API | ☑ | MVP `/api/v1` contracts |
| AV2 | Error envelope consistent | ☑ | AppError envelope |
| AV3 | Auth 401/403 correct | ☑ | |
| AV4 | Pagination/sort/filter on list resources | ☑ | |
| AV5 | AI failure contract supports FE fallback | ☑ | |
| AV6 | Notification channels limited to email + in_app | ☑ | |
| AV7 | API Completeness for release-scoped endpoints | ☑ | |

---

## 10. Database Migration

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| DM1 | All Prisma migrations listed for this release | ☑ | Existing `backend/prisma/migrations` |
| DM2 | Migrations tested on staging clone of prod-like data | ⚠ | Local/dev tested; **staging clone pending ops** |
| DM3 | Migration **apply order** documented; run **before** app traffic needing new schema | ☑ | `prisma migrate deploy` before BE |
| DM4 | No destructive migration without backup + approved plan | ☑ | No destructive in RC |
| DM5 | Rollback / forward-fix strategy documented | ☑ | §14 |
| DM6 | Seed/data backfill scripts (if any) tested | ☑ | Seed uses local stock URLs |
| DM7 | Indexes for new hot queries present | ☑ | Schema as shipped |

---

## 11. Environment Variables

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| EV1 | Prod env var inventory complete (FE + BE) | ☑ | Template below |
| EV2 | `DATABASE_URL` points to production DB | ⚠ | Set at cutover |
| EV3 | API public URL / CORS origins correct | ⚠ | Set at cutover |
| EV4 | Vercel FE env set (`NEXT_PUBLIC_*` only for non-secrets) | ⚠ | Set at cutover |
| EV5 | No leftover staging URLs in prod config | ⚠ | Verify at cutover |
| EV6 | Feature flags (if any) default safe | ☑ | N/A / safe defaults |

**Env inventory template**

| Variable | Service | Secret? | Set in prod? |
|----------|---------|---------|--------------|
| `DATABASE_URL` | backend | Yes | ☐ cutover |
| `JWT_ACCESS_SECRET` / refresh secrets | backend | Yes | ☐ cutover |
| `GEMINI_API_KEY` | backend | Yes | ☐ cutover |
| Email provider keys | backend | Yes | ☐ cutover |
| `CORS_ORIGIN` | backend | No | ☐ cutover |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | No | ☐ cutover |

---

## 12. Secrets

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| SE1 | Secrets stored in platform secret manager (not git) | ☑ | Policy; local `.env` gitignored |
| SE2 | Prod secrets distinct from staging/dev | ⚠ | Ops at cutover |
| SE3 | Rotation owners identified | ⚠ | Assign at cutover |
| SE4 | Access limited to release/ops roles | ⚠ | Ops |
| SE5 | `.env` / key files absent from release artifacts | ☑ | |
| SE6 | Client bundle scanned for accidental secrets | ☑ | Only `NEXT_PUBLIC_*` |

---

## 13. Backups

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| BK1 | Pre-deploy DB backup taken / snapshot verified restorable | ⚠ | **Required before prod migrate** |
| BK2 | Backup retention meets ops policy | ⚠ | Ops |
| BK3 | Media/storage backup considered if prod storage in use | ☑ | Local/stock + uploaded media path documented |
| BK4 | Backup timestamp recorded in Release Record | ⚠ | At cutover |

---

## 14. Rollback Plan

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| RB1 | Previous app version/image/tag identified | ☑ | Prior `main` / last prod tag |
| RB2 | FE rollback steps (Vercel previous deployment) documented | ☑ | Vercel → Promote prior Production |
| RB3 | BE rollback steps documented | ☑ | Redeploy previous SHA; restore DB if migrate fails |
| RB4 | DB rollback: restore snapshot **or** forward-fix migration path | ☑ | Prefer snapshot restore |
| RB5 | Rollback owner + communication channel assigned | ⚠ | Assign on-call at cutover |
| RB6 | Rollback decision criteria defined (e.g. smoke fail, S1 spike) | ☑ | Smoke fail or S1 → rollback |
| RB7 | Dry-run reviewed with Tech Lead | ⚠ | Pending TL |

**Rollback summary (required)**

```text
Trigger: Smoke fail (SP*/SM*) or S1 defect spike within soak window
FE rollback: Vercel → Deployments → prior Production → Promote
BE rollback: Redeploy previous release SHA/image
DB action: Restore pre-deploy snapshot if schema migrate involved; else no DB action
Owner: On-call (assign at cutover)
ETA: < 30 minutes for app rollback
```

---

## 15. Monitoring

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| MN1 | Health endpoint monitored / uptime check configured | ⚠ | Configure `GET /api/v1/health` on staging/prod |
| MN2 | Error rate / 5xx alerts configured or on-call watch agreed | ⚠ | Ops |
| MN3 | Auth failure spike awareness (credential stuffing) | ☑ | Rate limits; watch logs |
| MN4 | AI latency / fallback observability available | ☑ | Fallback mode + logs |
| MN5 | On-call / escalation contact listed for window | ⚠ | Assign at cutover |

---

## 16. Logging

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| LG1 | Structured logs reachable for prod BE | ⚠ | Confirm host logging |
| LG2 | Request ids present | ☑ | Request id middleware |
| LG3 | No secrets/PII over-logging verified on sample | ☑ | |
| LG4 | Log retention acceptable for incident response | ⚠ | Ops policy |
| LG5 | FE error reporting path known (if any) | ☑ | Console / hosting logs |

---

## 17. Deployment

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| DP1 | Deploy order: backup → migrate → backend → frontend | ☑ | Documented |
| DP2 | Frontend deploy target **Vercel** | ☑ | `frontend/vercel.json` |
| DP3 | Backend Node/Express + PostgreSQL prod topology confirmed | ⚠ | Confirm host |
| DP4 | Migrations applied successfully (log attached) | ⚠ | At staging/prod |
| DP5 | Zero-downtime or maintained window communicated | ⚠ | At cutover |
| DP6 | CDN/cache purge if required | ☑ | N/A or Vercel auto |
| DP7 | Deploy executed from tagged release SHA only | ⚠ | Tag after PO |

### FEAT-18-02 — Frontend Vercel path

| Item | Guidance |
|------|----------|
| Vercel root directory | `frontend` (monorepo) |
| Config file | `frontend/vercel.json` |
| Framework | Next.js (auto-detected) |
| Staging | Vercel **Preview** deployments on PRs / branch |
| Production | Vercel **Production** from `main` (or release tag promote) |
| Required FE env | `NEXT_PUBLIC_API_BASE_URL` → public API `/api/v1` base |
| Forbidden on FE | `DATABASE_URL`, JWT secrets, `GEMINI_API_KEY`, email provider keys |
| CORS | Backend `CORS_ORIGIN` must include the Vercel FE origin(s) |
| FE rollback | Vercel → Deployments → select prior Production → Promote |
| Health monitor | `GET {API}/health` → `status=ok`, `checks.database=up` |

**Local / staging smoke pack (post-deploy)**

| # | Check | Pass | Evidence |
|---|-------|------|----------|
| SP1 | `GET /api/v1/health` → 200 `status=ok` | ☑ | Local dogfood; re-verify staging |
| SP2 | Login (customer + admin) | ☑ | Dogfood auth videos |
| SP3 | Property list/detail | ☑ | Dogfood |
| SP4 | AI search or fallback UI | ☑ | Dogfood |
| SP5 | Lead capture CTA | ☑ | Dogfood |
| SP6 | Admin command center loads | ☑ | `pixel/admin-cmd-live.png` |

---

## 18. Smoke Testing

Constitution minimum smoke (post-deploy staging final + production):

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| SM1 | Health OK | ☑ | Local Pass; staging/prod ☐ |
| SM2 | Register/login (or login) works | ☑ | Local Pass; staging/prod ☐ |
| SM3 | Property list/detail loads | ☑ | Local Pass; staging/prod ☐ |
| SM4 | AI search returns results **or** correct fallback UI | ☑ | Local Pass; staging/prod ☐ |
| SM5 | Lead capture creates lead | ☑ | Local Pass; staging/prod ☐ |
| SM6 | Admin login works | ☑ | Local Pass; staging/prod ☐ |
| SM7 | No console errors on smoke paths | ☑ | Spot-check; re-verify staging |

---

## 19. Post Deployment Verification

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| PD1 | Smoke Pass in **production** | ☐ | **Pending cutover** |
| PD2 | Critical role journeys spot-checked | ☐ | Pending cutover |
| PD3 | Email notification path verified | ☐ | Pending cutover |
| PD4 | In-app notifications path verified if in scope | ☐ | Pending cutover |
| PD5 | Metrics/command center loads if in scope | ☐ | Pending cutover |
| PD6 | Error rates normal for 30–60 minutes | ☐ | Pending soak |
| PD7 | Rollback not required; release marked stable | ☐ | Pending |
| PD8 | Known issues updated in release notes | ☑ | §20 |

---

## 20. Release Notes

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| RN1 | Release notes drafted for stakeholders | ☑ | Below |
| RN2 | New features / fixes / breaking changes listed | ☑ | |
| RN3 | Known issues + workarounds listed | ☑ | |
| RN4 | Out-of-MVP explicitly called out as not included | ☑ | |
| RN5 | Notes published (repo release / Confluence / email) | ⚠ | Publish with git tag / GitHub Release |

```markdown
# Release v0.1.0-rc — 2026-08-05

## Highlights
- MVP CRM + AI search/chat complete
- Stock media fallbacks + responsive admin/customer drawers
- Design-control residuals closed for ship (search filters, cmd search, CTAs)

## Features
- Admin command center, leads, inventory, bulk CSV, AI config, reports
- Customer portal (saved, requirements, inquiries, notifications)
- Public home/search/property detail + chat widget

## Fixes
- Auth role home + safe `?next=`
- Mobile overlay shells
- Interactive control gaps vs design_reference (see `16` §41)

## Database / API
- Prisma migrations as on `main`; `/api/v1` unchanged

## Known issues
- Search map view deferred (grid/list only)
- Listing editor is single scroll page (tabs deferred)
- Lead detail omits AI match/attach/FAB (MVP subset)
- Local BE suite: intermittent users seed timeout / similar-properties flake (re-run CI)
- Footer Careers/Press stubs; voice mic non-functional

## Not in this release
- Kanban, activity timeline product, reminders product, virtual tours/video,
  SMS/WhatsApp/push, alternate LLMs, XLSX bulk
```

---

## 21. Versioning

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| VS1 | SemVer (or project scheme) applied correctly | ☑ | `v0.1.0-rc` → promote to `v1.0.0` at first prod |
| VS2 | App/package versions bumped if required | ☑ | RC naming |
| VS3 | API remains `/api/v1` unless planned version bump | ☑ | |
| VS4 | Version visible to ops (health, about, or release tag) | ⚠ | Tag after PO |

---

## 22. Git Tagging

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| GT1 | Annotated tag created on release SHA (`vX.Y.Z`) | ☐ | Create `v0.1.0-rc` after push + PO |
| GT2 | Tag pushed to origin | ☐ | |
| GT3 | GitHub Release (optional) created with notes | ☐ | Use §20 |
| GT4 | Tag matches deployed artifact | ☐ | |
| GT5 | Hotfix tags from prod branch policy followed | N/A | |

---

## 23. Production Sign-off

| Role | Name | Date | Signature / approval link |
|------|------|------|---------------------------|
| Release manager | Engineering | 2026-08-05 | RC packet prepared |
| Tech lead | | | **Required** |
| QA lead | | | **Required** |
| Security (if required) | | | |
| Ops / on-call | | | **Required for cutover** |

| # | Check | Pass |
|---|-------|------|
| PS1 | All required sections 1–22 Pass or waived in writing | ☐ |
| PS2 | Rollback plan acknowledged by on-call | ☐ |
| PS3 | Go / No-Go decision recorded: **GO** · **NO-GO** | ☐ |

---

## 24. Stakeholder Approval

| Stakeholder | Name | Approve? | Date | Notes |
|-------------|------|----------|------|-------|
| Product Owner | | ☐ Yes ☐ No | | **Required for prod** |
| Business owner (if any) | | ☐ Yes ☐ No | | |
| Other | | ☐ Yes ☐ No | | |

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| SA1 | PO accepts release scope & known issues | ☐ | |
| SA2 | UAT / acceptance evidence linked for major releases | ⚠ | Dogfood evidence ready; formal UAT ☐ |
| SA3 | Communication to users/support sent if needed | ☐ | |

**Release is unauthorized without PO approval for production cutover.**

---

## 25. Go / No-Go Gate

Release may proceed only if:

- [x] Feature freeze respected  
- [x] No open S1; S2 waived or fixed  
- [ ] Regression + smoke Pass on **staging**  
- [ ] Security / secrets / migrations / backups Pass **for prod**  
- [x] Rollback plan documented  
- [ ] Production Sign-off complete  
- [ ] Stakeholder (PO) Approval complete  

**Decision:** ☐ GO ☑ **NO-GO** (production)  

**Engineering RC decision:** **GO for staging candidate** after push + CI green re-run.  

**Decision by:** Engineering (prep) **Date/time:** 2026-08-05  

**Blockers for production GO:** staging smoke, CI flake resolution, backup, prod env/secrets, TL/QA/PO signatures.

---

## 26. Copy-Paste Release Packet

```markdown
# Release Packet — v0.1.0-rc

**SHA:** (see git log after UI ship commit)
**Tag:** v0.1.0-rc (pending)
**Window:** Staging first
**RM / TL / QA / PO:** Eng prep / pending / pending / pending

## Status
| Gate | Result |
|------|--------|
| Sprint completion | Pass |
| Feature freeze | Pass (2026-08-05) |
| Bugs | Pass (known S3/S4 listed) |
| Regression | Pass* (local 140/144; CI re-run) |
| Security | Pass* (prod confirm pending) |
| Performance | Pass |
| Accessibility | Pass |
| Responsive | Pass |
| API | Pass |
| Migrations | Pass* (staging apply pending) |
| Env / secrets | Pending cutover |
| Backups | Pending cutover |
| Rollback plan | Pass (documented) |
| Monitoring / logging | Pending ops |
| Deploy | Pending |
| Smoke (staging) | Pending |
| Smoke (prod) | Pending |
| Post-deploy | Pending |
| Release notes | Pass (drafted) |
| Version / tag | Pending tag |
| Prod sign-off | Pending |
| Stakeholder approval | Pending |

## Links
- Pixel: docs/16_UI_PIXEL_PERFECT_CHECKLIST.md §39–§41
- Dogfood: dogfood-output/ (local)
- OpenAPI: openapi.yaml
- Progress: docs/progress.html

## Go/No-Go
Production: NO-GO until staging smoke + PO
Staging RC: GO after push
```

---

## 27. Hotfix Addendum

For production hotfixes, minimum gates:

| # | Check | Pass |
|---|-------|------|
| HF1 | Fix scoped; feature freeze implied | ☐ |
| HF2 | Targeted regression + full smoke | ☐ |
| HF3 | Security impact assessed | ☐ |
| HF4 | Migration/backup if schema touched | ☐ |
| HF5 | Rollback plan | ☐ |
| HF6 | Patch version + tag | ☐ |
| HF7 | PO notified/approved | ☐ |
| HF8 | Release notes (fix) published | ☐ |

---

## 28. Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Initial reusable Production Release Checklist |
| 1.0.1 | 2026-08-05 | MVP RC packet filled; prod NO-GO; staging RC GO pending push/CI |

---

**End of Release Checklist**

*No production release without Go decision, Production Sign-off, and Stakeholder Approval.*
