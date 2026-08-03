# PropVista CRM / Property AI Studio — Production Release Checklist

| Field | Value |
|-------|--------|
| **Document** | `18_RELEASE_CHECKLIST.md` |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
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
| **Release name / version** | `v0.1.0-rc` (MVP hardening — FEAT-18-02 packet started) |
| **Release type** | Minor · Patch |
| **Target environment** | Staging first → Production |
| **Git commit SHA** | _(fill at freeze)_ |
| **Git tag** | _(fill at freeze)_ |
| **Release manager** | |
| **Tech lead** | |
| **QA lead** | |
| **Product Owner** | |
| **Planned deploy window (UTC)** | |
| **Related sprint(s)** | Sprint 13 |
| **Epic/Feature scope** | FEAT-18-01 UX/a11y · FEAT-18-02 health/Vercel · prior MVP features |
| **Out of scope / deferred** | FEAT-09/10 leads & visits (end of backlog) |

---

## 1. Sprint Completion

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| SC1 | All in-scope sprint/release Feature AC accepted or explicitly deferred with ticket | ☐ | |
| SC2 | No open **Blocking** defects for in-scope features | ☐ | |
| SC3 | All Majors fixed or PO/TL waived with ticket ID | ☐ | |
| SC4 | Constitution lifecycle followed (no silent FE-only invent) | ☐ | |
| SC5 | Out-of-MVP items **absent** from nav/APIs (Kanban, timeline product, reminders, virtual tours/video, SMS/WhatsApp/push, alternate LLMs) | ☐ | |
| SC6 | Screen Complete for all in-scope SCR-* (Pixel Perfect manual) | ☐ | |
| SC7 | API Complete for all in-scope endpoints (API checklist) | ☐ | |
| SC8 | Sprint Plan DoD items for included sprints satisfied | ☐ | |

---

## 2. Feature Freeze

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| FF1 | Feature freeze declared (date/time recorded) | ☐ | |
| FF2 | Only bugfixes / release blockers allowed after freeze | ☐ | |
| FF3 | No new features merged without PO exception | ☐ | |
| FF4 | Release branch / `main` candidate identified and protected | ☐ | |
| FF5 | Changelog draft frozen for included commits | ☐ | |

---

## 3. Bug Verification

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| BV1 | All S1/S2 defects for release scope verified fixed on staging | ☐ | |
| BV2 | Regression of fixed bugs retested | ☐ | |
| BV3 | Known S3/S4 issues listed in release notes | ☐ | |
| BV4 | No “fix later” fidelity gaps on in-scope screens | ☐ | |
| BV5 | Mock APIs removed for completed features | ☐ | |

---

## 4. Regression Testing

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| RT1 | CI green on release SHA (lint, typecheck, unit, integration) | ☐ | |
| RT2 | Smoke pack Pass (auth, health, property detail, AI search, lead capture, admin login) | ☐ | |
| RT3 | Core regression pack Pass (Test Strategy §11) | ☐ | |
| RT4 | Full regression / UAT packs Pass for major/MVP releases | ☐ | |
| RT5 | AI pack Pass (search happy + fallback, chat, loan fallback, config preview) | ☐ | |
| RT6 | Role pack Pass (Guest/Customer/Agent/Admin/Super Admin) | ☐ | |
| RT7 | Out-of-MVP absence tests Pass | ☐ | |

---

## 5. Security Review

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| SR1 | AuthN/AuthZ matrix reviewed for new/changed endpoints | ☐ | |
| SR2 | No secrets in repo, client bundle, or logs | ☐ | |
| SR3 | Gemini key server-only verified | ☐ | |
| SR4 | Rate limits enabled for auth + AI in prod config | ☐ | |
| SR5 | Upload / bulk hardening verified | ☐ | |
| SR6 | IDOR spot-checks on properties/leads | ☐ | |
| SR7 | Dependency audit (known critical CVEs addressed or waived) | ☐ | |
| SR8 | Security checklist from Test Strategy / Code Review signed | ☐ | |
| SR9 | HTTPS + secure cookie flags (if cookies) confirmed | ☐ | |

---

## 6. Performance Review

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| PR1 | Primary routes meet &lt;2s target on reference broadband (or gaps documented) | ☐ | |
| PR2 | List endpoints paginated; no unbounded payloads | ☐ | |
| PR3 | No known N+1 on hot admin/public lists | ☐ | |
| PR4 | AI timeouts + non-blocking chrome verified | ☐ | |
| PR5 | Leaflet lazy-load on property detail | ☐ | |
| PR6 | Export/bulk paths capped or async-safe | ☐ | |

---

## 7. Accessibility Review

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| AR1 | A11y baseline Pass on primary journeys (labels, focus, alt) | ☐ | |
| AR2 | Keyboard navigation Pass (auth, search, detail CTAs, modals) | ☐ | |
| AR3 | No visual redesign under guise of a11y without PO | ☐ | |
| AR4 | Critical axe issues resolved or waived with ticket | ☐ | |

---

## 8. Responsive Verification

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| RV1 | Desktop (~1280) vs `screen.png` for in-scope screens | ☐ | |
| RV2 | Tablet (~768) verified | ☐ | |
| RV3 | Mobile (~375) verified | ☐ | |
| RV4 | Evidence attached (screenshots / QA sign-offs) | ☐ | |

---

## 9. API Verification

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| AV1 | `openapi.yaml` matches deployed API | ☐ | |
| AV2 | Error envelope consistent | ☐ | |
| AV3 | Auth 401/403 correct | ☐ | |
| AV4 | Pagination/sort/filter on list resources | ☐ | |
| AV5 | AI failure contract supports FE fallback | ☐ | |
| AV6 | Notification channels limited to email + in_app | ☐ | |
| AV7 | API Completeness for release-scoped endpoints | ☐ | |

---

## 10. Database Migration

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| DM1 | All Prisma migrations listed for this release | ☐ | |
| DM2 | Migrations tested on staging clone of prod-like data | ☐ | |
| DM3 | Migration **apply order** documented; run **before** app traffic needing new schema | ☐ | |
| DM4 | No destructive migration without backup + approved plan | ☐ | |
| DM5 | Rollback / forward-fix strategy documented | ☐ | |
| DM6 | Seed/data backfill scripts (if any) tested | ☐ | |
| DM7 | Indexes for new hot queries present | ☐ | |

---

## 11. Environment Variables

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| EV1 | Prod env var inventory complete (FE + BE) | ☐ | |
| EV2 | `DATABASE_URL` points to production DB | ☐ | |
| EV3 | API public URL / CORS origins correct | ☐ | |
| EV4 | Vercel FE env set (`NEXT_PUBLIC_*` only for non-secrets) | ☐ | |
| EV5 | No leftover staging URLs in prod config | ☐ | |
| EV6 | Feature flags (if any) default safe | ☐ | |

**Env inventory template**

| Variable | Service | Secret? | Set in prod? |
|----------|---------|---------|--------------|
| `DATABASE_URL` | backend | Yes | ☐ |
| `JWT_ACCESS_SECRET` / refresh secrets | backend | Yes | ☐ |
| `GEMINI_API_KEY` | backend | Yes | ☐ |
| Email provider keys | backend | Yes | ☐ |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | No | ☐ |
| … | | | ☐ |

---

## 12. Secrets

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| SE1 | Secrets stored in platform secret manager (not git) | ☐ | |
| SE2 | Prod secrets distinct from staging/dev | ☐ | |
| SE3 | Rotation owners identified | ☐ | |
| SE4 | Access limited to release/ops roles | ☐ | |
| SE5 | `.env` / key files absent from release artifacts | ☐ | |
| SE6 | Client bundle scanned for accidental secrets | ☐ | |

---

## 13. Backups

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| BK1 | Pre-deploy DB backup taken / snapshot verified restorable | ☐ | |
| BK2 | Backup retention meets ops policy | ☐ | |
| BK3 | Media/storage backup considered if prod storage in use | ☐ | |
| BK4 | Backup timestamp recorded in Release Record | ☐ | |

---

## 14. Rollback Plan

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| RB1 | Previous app version/image/tag identified | ☐ | |
| RB2 | FE rollback steps (Vercel previous deployment) documented | ☐ | |
| RB3 | BE rollback steps documented | ☐ | |
| RB4 | DB rollback: restore snapshot **or** forward-fix migration path (no untested down migrations) | ☐ | |
| RB5 | Rollback owner + communication channel assigned | ☐ | |
| RB6 | Rollback decision criteria defined (e.g. smoke fail, S1 spike) | ☐ | |
| RB7 | Dry-run reviewed with Tech Lead | ☐ | |

**Rollback summary (required)**

```text
Trigger: ________________________________
FE rollback: ____________________________
BE rollback: ____________________________
DB action: ______________________________
Owner: __________________________________
ETA: ____________________________________
```

---

## 15. Monitoring

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| MN1 | Health endpoint monitored / uptime check configured | ☐ | |
| MN2 | Error rate / 5xx alerts configured or on-call watch agreed | ☐ | |
| MN3 | Auth failure spike awareness (credential stuffing) | ☐ | |
| MN4 | AI latency / fallback observability available | ☐ | |
| MN5 | On-call / escalation contact listed for window | ☐ | |

---

## 16. Logging

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| LG1 | Structured logs reachable for prod BE | ☐ | |
| LG2 | Request ids present | ☐ | |
| LG3 | No secrets/PII over-logging verified on sample | ☐ | |
| LG4 | Log retention acceptable for incident response | ☐ | |
| LG5 | FE error reporting path known (if any) | ☐ | |

---

## 17. Deployment

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| DP1 | Deploy order: backup → migrate → backend → frontend (or documented equivalent) | ☐ | |
| DP2 | Frontend deploy target **Vercel** | ☐ | |
| DP3 | Backend Node/Express + PostgreSQL prod topology confirmed | ☐ | |
| DP4 | Migrations applied successfully (log attached) | ☐ | |
| DP5 | Zero-downtime or maintained window communicated | ☐ | |
| DP6 | CDN/cache purge if required | ☐ | |
| DP7 | Deploy executed from tagged release SHA only | ☐ | |

### FEAT-18-02 — Frontend Vercel path (started)

| Item | Guidance |
|------|----------|
| Vercel root directory | `frontend` (monorepo) |
| Config file | `frontend/vercel.json` |
| Framework | Next.js (auto-detected) |
| Staging | Vercel **Preview** deployments on PRs / branch |
| Production | Vercel **Production** from `main` (or release tag promote) |
| Required FE env | `NEXT_PUBLIC_API_BASE_URL` → public API `/api/v1` base (no trailing secrets) |
| Forbidden on FE | `DATABASE_URL`, JWT secrets, `GEMINI_API_KEY`, email provider keys |
| CORS | Backend `CORS_ORIGIN` must include the Vercel FE origin(s) |
| FE rollback | Vercel → Deployments → select prior Production → Promote |
| Health monitor | `GET {API}/health` → `status=ok`, `checks.database=up` |

**Local / staging smoke pack (post-deploy)**

| # | Check | Pass | Evidence |
|---|-------|------|----------|
| SP1 | `GET /api/v1/health` → 200 `status=ok` | ☐ | |
| SP2 | Login (customer + admin) | ☐ | |
| SP3 | Property list/detail | ☐ | |
| SP4 | AI search or fallback UI | ☐ | |
| SP5 | Lead capture CTA | ☐ | |
| SP6 | Admin command center loads | ☐ | |

---

## 18. Smoke Testing

Constitution minimum smoke (post-deploy staging final + production):

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| SM1 | Health OK | ☐ | |
| SM2 | Register/login (or login) works | ☐ | |
| SM3 | Property list/detail loads | ☐ | |
| SM4 | AI search returns results **or** correct fallback UI | ☐ | |
| SM5 | Lead capture creates lead | ☐ | |
| SM6 | Admin login works | ☐ | |
| SM7 | No console errors on smoke paths | ☐ | |

---

## 19. Post Deployment Verification

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| PD1 | Smoke Pass in **production** | ☐ | |
| PD2 | Critical role journeys spot-checked | ☐ | |
| PD3 | Email notification path verified (or staged equivalent + prod config confirmed) | ☐ | |
| PD4 | In-app notifications path verified if in scope | ☐ | |
| PD5 | Metrics/command center loads if in scope | ☐ | |
| PD6 | Error rates normal for 30–60 minutes (or agreed soak) | ☐ | |
| PD7 | Rollback not required; release marked stable | ☐ | |
| PD8 | Known issues updated in release notes | ☐ | |

---

## 20. Release Notes

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| RN1 | Release notes drafted for stakeholders | ☐ | |
| RN2 | New features / fixes / breaking changes listed | ☐ | |
| RN3 | Known issues + workarounds listed | ☐ | |
| RN4 | Out-of-MVP explicitly called out as not included | ☐ | |
| RN5 | Notes published (repo release / Confluence / email) | ☐ | |

**Release notes template**

```markdown
# Release <version> — <date>

## Highlights
-

## Features
-

## Fixes
-

## Database / API
-

## Known issues
-

## Not in this release (MVP exclusions / deferred)
- Kanban, activity timeline product, reminders, virtual tours/video, SMS/WhatsApp/push, …
```

---

## 21. Versioning

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| VS1 | SemVer (or project scheme) applied correctly | ☐ | |
| VS2 | App/package versions bumped if required | ☐ | |
| VS3 | API remains `/api/v1` unless planned version bump | ☐ | |
| VS4 | Version visible to ops (health, about, or release tag) | ☐ | |

**Scheme guidance:** `MAJOR.MINOR.PATCH` — MVP first prod = `1.0.0`; hotfixes `1.0.x`; compatible features `1.x.0`.

---

## 22. Git Tagging

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| GT1 | Annotated tag created on release SHA (`vX.Y.Z`) | ☐ | |
| GT2 | Tag pushed to origin | ☐ | |
| GT3 | GitHub Release (optional) created with notes | ☐ | |
| GT4 | Tag matches deployed artifact | ☐ | |
| GT5 | Hotfix tags from prod branch policy followed | ☐ | |

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## 23. Production Sign-off

| Role | Name | Date | Signature / approval link |
|------|------|------|---------------------------|
| Release manager | | | |
| Tech lead | | | |
| QA lead | | | |
| Security (if required) | | | |
| Ops / on-call | | | |

| # | Check | Pass |
|---|-------|------|
| PS1 | All required sections 1–22 Pass or waived in writing | ☐ |
| PS2 | Rollback plan acknowledged by on-call | ☐ |
| PS3 | Go / No-Go decision recorded: **GO** · **NO-GO** | ☐ |

---

## 24. Stakeholder Approval

| Stakeholder | Name | Approve? | Date | Notes |
|-------------|------|----------|------|-------|
| Product Owner | | ☐ Yes ☐ No | | |
| Business owner (if any) | | ☐ Yes ☐ No | | |
| Other | | ☐ Yes ☐ No | | |

| # | Check | Pass | Evidence / Notes |
|---|-------|------|------------------|
| SA1 | PO accepts release scope & known issues | ☐ | |
| SA2 | UAT / acceptance evidence linked for major releases | ☐ | |
| SA3 | Communication to users/support sent if needed | ☐ | |

**Release is unauthorized without PO approval for production cutover.**

---

## 25. Go / No-Go Gate

Release may proceed only if:

- [ ] Feature freeze respected  
- [ ] No open S1; S2 waived or fixed  
- [ ] Regression + smoke Pass on staging  
- [ ] Security / secrets / migrations / backups Pass  
- [ ] Rollback plan documented  
- [ ] Production Sign-off complete  
- [ ] Stakeholder (PO) Approval complete  

**Decision:** ☐ GO ☐ NO-GO  

**Decision by:** _______________ **Date/time:** _______________

---

## 26. Copy-Paste Release Packet

```markdown
# Release Packet — <version>

**SHA:** 
**Tag:** 
**Window:** 
**RM / TL / QA / PO:** 

## Status
| Gate | Result |
|------|--------|
| Sprint completion | |
| Feature freeze | |
| Bugs | |
| Regression | |
| Security | |
| Performance | |
| Accessibility | |
| Responsive | |
| API | |
| Migrations | |
| Env / secrets | |
| Backups | |
| Rollback plan | |
| Monitoring / logging | |
| Deploy | |
| Smoke (staging) | |
| Smoke (prod) | |
| Post-deploy | |
| Release notes | |
| Version / tag | |
| Prod sign-off | |
| Stakeholder approval | |

## Links
- CI:
- OpenAPI:
- Migration log:
- Backup id:
- Pixel/QA sign-offs:
- Rollback doc:

## Go/No-Go
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

---

**End of Release Checklist**

*No production release without Go decision, Production Sign-off, and Stakeholder Approval.*
