# PropVista CRM / Property AI Studio — Bug Tracking Guide

| Field | Value |
|-------|--------|
| **Document** | `19_BUG_TRACKING_GUIDE.md` |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **Type** | Complete QA handbook for defect management |
| **Tooling** | GitHub Issues (primary); labels defined below |
| **Authority** | Constitution DoD/QA; Test Strategy; Release Checklist; Pixel Perfect / API checklists |

---

## 1. Purpose

This guide standardizes how bugs are **found, reported, triaged, fixed, verified, and closed** for PropVista CRM / Property AI Studio.

### Goals

- Make defects reproducible and actionable  
- Protect MVP honesty (no Out-of-MVP “bugs” that are actually future scope)  
- Treat **HTML / `screen.png` fidelity gaps** as first-class defects  
- Ensure release-blocking issues never ship  
- Provide reusable templates for GitHub and QA sign-off  

### Non-goals

- Redesign debates (“looks better”) — fidelity SOT wins  
- Tracking enhancements as bugs without labeling them correctly  
- Replacing Product backlog (Epics/Features/Stories)  

### Related documents

| Doc | Use |
|-----|-----|
| `11_TEST_STRATEGY.md` | Severity SLA, regression packs |
| `18_RELEASE_CHECKLIST.md` | Release blockers, Go/No-Go |
| `16_UI_PIXEL_PERFECT_CHECKLIST.md` | Visual/state defects |
| `17_API_CHECKLIST.md` | Contract/AuthZ defects |
| `15_CODE_REVIEW_CHECKLIST.md` | Blocking vs major vs minor |
| `08_EPICS_AND_FEATURES.md` | Scope / AC source |

---

## 2. Bug Lifecycle

```text
New
  → Triaged (severity/priority/category/owner)
    → Accepted | Duplicate | Not a Bug | Deferred (Known Issue)
      → In Progress (developer)
        → In Review (PR linked)
          → Fixed (deployed to QA/staging env)
            → QA Verification
              → Verified (Pass) → Closed
              → Reopened (Fail) → In Progress
```

| Stage | Owner | Exit criteria |
|-------|-------|---------------|
| New | Reporter (QA/Dev/PO) | Template complete enough to triage |
| Triaged | QA lead / Tech lead | Severity, priority, labels, assignee or backlog |
| Accepted | Triage | Valid defect in scope |
| Duplicate | Triage | Linked to canonical issue |
| Not a Bug | Triage + PO if disputed | Working as designed / Out-of-MVP / enhancement |
| Deferred | PO + TL | Known issue logged; not release-blocking (or waived) |
| In Progress | Developer | Fix branch started; linked Epic/Feature if relevant |
| In Review | Reviewer | PR open; CI running |
| Fixed | Developer | Merged/deployed to verification env |
| QA Verification | QA | Retest + regression of fix |
| Closed | QA | Acceptance criteria Pass; regression Pass |
| Reopened | QA | Fail verification; return to In Progress |

**Rule:** Developers do not close bugs—**QA closes** after verification (except clear duplicates/invalid closed by triage).

---

## 3. Severity Levels

Severity = **impact on users/system** (independent of schedule).

| Severity | Name | Definition | Examples | Release impact |
|----------|------|------------|----------|----------------|
| **S1** | Blocker | System unusable for primary journey; data loss; security hole; blank critical page | Cannot login; search always blank; AuthZ bypass; secrets exposed | **Blocks release** |
| **S2** | Major | Primary feature broken or HTML fidelity clearly wrong on in-scope screen; no reasonable workaround | AI fallback missing; publish fails; lead not created; wrong role access; major layout break vs HTML | **Blocks release** unless PO+TL waiver |
| **S3** | Minor | Secondary path broken; small fidelity delta; workaround exists | Sort wrong on rare column; minor spacing off; non-critical validation copy | Does not block unless freeze policy says otherwise |
| **S4** | Trivial / Cosmetic | Tiny visual nit within tolerance; typo in non-HTML-owned dynamic area; polish | 1px anti-alias variance; seed data oddity | Never blocks alone |

### Fidelity rule

In-scope screen visual divergence from `design_reference` HTML / `screen.png` is **at least S2** (often S1 if primary marketing/admin shell is broken). “Looks better” is not a fix.

### SLA guidance (staging / active sprint)

| Severity | Triage | Fix target |
|----------|--------|------------|
| S1 | &lt; 4 business hours | Immediate / same day |
| S2 | &lt; 1 business day | Within sprint / before release |
| S3 | &lt; 2 business days | Backlog or same sprint if fidelity |
| S4 | Weekly triage | Backlog |

---

## 4. Priority Levels

Priority = **order of work** (business urgency). Severity ≠ priority, but they often correlate.

| Priority | Name | When to use |
|----------|------|-------------|
| **P0** | Release-critical | Must fix before next production deploy |
| **P1** | High | Fix this sprint; blocks Feature Complete / Screen Complete |
| **P2** | Medium | Scheduled soon; workaround exists |
| **P3** | Low | Nice to clear; backlog |

| Mapping hint | Typical priority |
|--------------|------------------|
| S1 | P0 |
| S2 on release path | P0 or P1 |
| S3 | P2 |
| S4 | P3 |
| S2 with solid workaround mid-sprint | P1 |

PO may raise priority without changing severity (e.g. demo tomorrow).

---

## 5. Bug Categories

Use GitHub labels: `bug` + category label.

| Category | Label | Includes |
|----------|-------|----------|
| UI / Visual | `cat:ui` | Layout, spacing, type, color, icons vs HTML |
| Functional | `cat:functional` | Wrong behavior vs Requirements/AC |
| API / Contract | `cat:api` | Status codes, envelope, OpenAPI drift |
| Auth / Security | `cat:security` | AuthN/AuthZ, secrets, IDOR, XSS |
| Data / DB | `cat:data` | Persistence, migrations, corruption |
| AI / Gemini | `cat:ai` | Search/chat/loan/config; fallback |
| Performance | `cat:performance` | Slow load, N+1, timeouts |
| Accessibility | `cat:a11y` | Keyboard, labels, focus, alt |
| Responsive | `cat:responsive` | Breakpoint/layout issues |
| Integration | `cat:integration` | FE↔BE, email, media storage |
| Regression | `cat:regression` | Previously Pass, now Fail |
| Environment | `cat:env` | Config, secrets, deploy-only |
| Documentation | `cat:docs` | Spec wrong (if tracked as defect) |

Also tag: `mvp`, `out-of-mvp` (if someone reported Future scope), `release-blocker`, `known-issue`, `duplicate`.

---

## 6. Bug Status

| Status | GitHub | Meaning |
|--------|--------|---------|
| New | `status:new` / open | Untriaged |
| Triaged | `status:triaged` | Classified |
| Accepted | `status:accepted` | Will fix |
| In Progress | `status:in-progress` | Being fixed |
| In Review | `status:in-review` | PR open |
| Fixed | `status:fixed` | Awaiting QA |
| Verified | `status:verified` | QA Pass |
| Closed | closed | Done |
| Reopened | `status:reopened` + open | QA Fail |
| Duplicate | `status:duplicate` + closed | Points to canonical |
| Not a Bug | `status:not-a-bug` + closed | Invalid / by design |
| Deferred | `status:deferred` + `known-issue` | Known issue list |

Keep **one canonical open issue** per defect.

---

## 7. Reproduction Steps

Required for all S1–S3. Format:

1. Preconditions (role, data, feature flags)  
2. Numbered steps (exact clicks/URLs/inputs)  
3. Observed result  

**Quality bar:** Another engineer can reproduce in ≤15 minutes on staging/local with seed data.

Bad: “Search broken.”  
Good: “As Guest, open `/`, enter `3 bed under 500k near downtown`, Submit → blank main with console TypeError…”

---

## 8. Expected Behaviour

State the **correct** outcome from:

1. `design_reference/.../code.html` + `screen.png` (UI)  
2. Feature AC / PRD FR / SRS (functional)  
3. `openapi.yaml` (API)  
4. Constitution (AuthZ, MVP exclusions, Gemini-only)  

Cite source: e.g. `SCR-SEARCH-FB`, `FR-SEARCH-011`, `API POST /search`.

---

## 9. Actual Behaviour

Describe what happens now—including:

- UI state (blank, spinner forever, wrong layout)  
- API status/body (if known)  
- Console/network errors  
- Frequency (always / intermittent)  

Attach evidence (§11–13).

---

## 10. Environment

Always record:

| Field | Example |
|-------|---------|
| App URL | `https://staging...` / `localhost:3000` |
| API URL | `http://localhost:4001/api/v1` |
| Build / Git SHA | `abc1234` |
| Role | Customer / Agent / Admin / Guest |
| Browser + version | Chrome 127 |
| OS | Windows 11 |
| Viewport | 1440×900 / 375×812 |
| Seed/dataset | `seed-v3` |
| Feature flags | none |
| Gemini | mock / real sandbox |

Intermittent bugs: note time, timezone, and retry count.

---

## 11. Screenshots

Required for UI/visual/responsive bugs.

| Requirement | Detail |
|-------------|--------|
| Actual | App screenshot |
| Expected | `screen.png` or HTML capture |
| Annotate | Highlight mismatch |
| Viewport | Match comparison width |
| Privacy | Redact PII |

Name files: `BUG-123-actual-desktop.png`, `BUG-123-expected-screen.png`.

---

## 12. Videos

Use when:

- Timing/animation/transition defects  
- Intermittent races  
- Multi-step flows hard to describe  

Prefer &lt;60s, with cursor visible. Link in issue (GitHub upload or shared drive).

---

## 13. Logs

Attach when functional/API/AI/security:

| Source | What to paste |
|--------|----------------|
| Browser console | Errors/stack (no tokens) |
| Network | Request method/URL/status + response envelope (redact secrets) |
| Backend logs | `requestId`, error code, stack **if local/staging** |
| AI | Timeout/fallback markers (never API keys) |

Do **not** paste production secrets, JWTs, or password hashes.

---

## 14. Developer Notes

Developers add on the issue or PR:

- Suspected component/service/endpoint  
- Root cause hypothesis  
- Fix approach  
- Risk / side effects  
- Tests added  
- Feature/Epic ID  
- Mock removal notes  

---

## 15. QA Notes

QA adds during verification:

- Build/SHA tested  
- Environments tested  
- Exact retest steps + result  
- Regression areas checked  
- Residual risk  
- Close / reopen decision  

---

## 16. Acceptance Criteria

Every bug must define **verification AC** (testable). Template:

```text
Given <precondition>
When <action>
Then <expected>
And <no console errors>
And <HTML/screenshot match if UI>
```

Fix is not Done until AC Pass on verification env (Constitution DoD: real API, no console errors, fidelity if UI).

---

## 17. Regression Verification

Before closing:

| Check | Required |
|-------|----------|
| Original AC Pass | Always |
| Related screen/API smoke | Always for S1–S2 |
| Category regression (e.g. all search states) | S1–S2 UI/AI |
| Role checks if AuthZ | Security bugs |
| Mobile/desktop if responsive/visual | UI bugs |

Link to Test Strategy packs when closing release blockers.

---

## 18. Root Cause Analysis

### When required

- All **S1**  
- All **release blockers**  
- Recurring regressions (`cat:regression`)  
- Security defects  

### RCA minimum fields

| Field | Content |
|-------|---------|
| Symptom | What users saw |
| Root cause | Why (code/process/config) |
| Trigger | How it got to prod/staging |
| Fix | What changed |
| Prevention | Test, lint, checklist, monitor |
| Linked tests | New/updated cases |

Keep RCA short (½ page). Store in issue for S1; optional doc link for incidents.

---

## 19. Duplicate Bugs

1. Search open issues by screen, endpoint, error text.  
2. If duplicate: comment link, apply `status:duplicate`, close.  
3. Move unique evidence to the **canonical** issue.  
4. Do not fix the same defect on two tickets.

Canonical title should be the clearest; duplicates reference `Duplicate of #N`.

---

## 20. Known Issues

Deferred defects live on a **Known Issues** list for the release.

| Field | Required |
|-------|----------|
| Issue # | |
| Severity/Priority | |
| Summary | |
| Workaround | |
| Why deferred | |
| Target release/sprint | |
| PO waiver (if would be blocker) | |

Known issues **must** appear in Release Notes (`18_RELEASE_CHECKLIST.md`).  
S1 cannot be “known” for production without exceptional written PO+TL waiver.

---

## 21. Release Blocking Bugs

A bug is a **release blocker** when any apply:

- Severity **S1**  
- Severity **S2** on a journey in the release smoke/core pack  
- Screen Complete / API Complete / DoD fails for in-scope deliverable  
- Security AuthZ bypass or secret exposure  
- Out-of-MVP feature accidentally shipped  
- Data loss / corrupt migrations  

Label: `release-blocker` + `P0`.

**Release Checklist** cannot Go while open release blockers remain (unless written waiver).

---

## 22. Bug Templates

### 22.1 Fields (all reports)

| Field | Required |
|-------|----------|
| Title | Yes |
| Severity / Priority | Yes (triage may adjust) |
| Category | Yes |
| SCR / Route / Endpoint | As applicable |
| Environment | Yes |
| Steps to reproduce | Yes (S1–S3) |
| Expected | Yes |
| Actual | Yes |
| Screenshots/videos/logs | As applicable |
| Acceptance criteria | Yes |
| Workaround | If known |

### 22.2 Title convention

```text
[<Severity>][<Area>] Short symptom — SCR/API
```

Examples:

- `[S1][Auth] Login returns 500 — POST /auth/token`  
- `[S2][UI] Search fallback banner missing — SCR-SEARCH-FB`  
- `[S3][A11y] Schedule modal focus not trapped`

---

## 23. GitHub Issue Templates

Create under `.github/ISSUE_TEMPLATE/` (content below).

### 23.1 `bug_report.md`

```markdown
---
name: Bug report
about: Report a defect against Requirements, HTML, or API
title: "[S?][area] "
labels: ["bug", "status:new"]
---

## Summary
<!-- One sentence -->

## Severity / Priority (reporter estimate)
- Severity: S1 / S2 / S3 / S4
- Priority: P0 / P1 / P2 / P3

## Category
<!-- ui | functional | api | security | data | ai | performance | a11y | responsive | integration | regression | env -->

## Scope references
- Screen (SCR-*): 
- Route: 
- Feature / FR / AC: 
- API: `METHOD /api/v1/...`
- HTML path: `docs/design_reference/.../code.html`

## Environment
- URL:
- SHA / build:
- Role:
- Browser / OS:
- Viewport:
- Gemini: mock / real

## Steps to reproduce
1.
2.
3.

## Expected behaviour
<!-- Cite HTML / FR / OpenAPI -->

## Actual behaviour


## Evidence
- [ ] Screenshots (actual + expected)
- [ ] Video (if needed)
- [ ] Console / network / server logs (redacted)

## Acceptance criteria for fix
- [ ] 
- [ ] No console errors on path
- [ ] Regression: 

## Workaround


## Additional context
```

### 23.2 `bug_security.md` (optional)

```markdown
---
name: Security bug
about: AuthN/AuthZ, secrets, injection, IDOR
title: "[S1][security] "
labels: ["bug", "cat:security", "status:new"]
---

## Summary

## Impact
<!-- Who can exploit; data at risk -->

## Reproduction (least privilege account)


## Expected (Constitution AuthZ)


## Actual


## Evidence (redact secrets)


## Suggested severity
S1 / S2
```

### 23.3 Recommended labels

```text
bug
release-blocker
known-issue
mvp
out-of-mvp
status:new
status:triaged
status:accepted
status:in-progress
status:in-review
status:fixed
status:verified
status:reopened
status:duplicate
status:not-a-bug
status:deferred
cat:ui
cat:functional
cat:api
cat:security
cat:data
cat:ai
cat:performance
cat:a11y
cat:responsive
cat:integration
cat:regression
cat:env
severity:s1
severity:s2
severity:s3
severity:s4
priority:p0
priority:p1
priority:p2
priority:p3
```

---

## 24. Bug Report Examples

### Example A — UI fidelity (S2)

**Title:** `[S2][UI] Featured card gap and price weight wrong — SCR-HOME`

**Expected:** Per `propvista_crm_homepage/code.html` and `screen.png`, card grid gap and price typography match reference.  
**Actual:** Larger gap; price rendered regular weight.  
**Evidence:** side-by-side screenshots.  
**AC:** Pixel Perfect checklist Spacing + Typography Pass on SCR-HOME desktop.

### Example B — Functional / AI (S1)

**Title:** `[S1][AI] AI search failure shows blank page — SCR-SEARCH-FB`

**Steps:** Force Gemini timeout on staging; run NL search.  
**Expected:** Fallback banner + filter results (FR-SEARCH-011, SCR-SEARCH-FB).  
**Actual:** Empty main; console error.  
**AC:** Fallback UI matches HTML; no console errors; integration test for AI failure envelope.

### Example C — Security (S1)

**Title:** `[S1][security] Customer can PATCH /users/{id} role to admin`

**Expected:** 403 for Customer (Constitution roles).  
**Actual:** 200; role changed.  
**AC:** Integration test 403; AuthZ middleware on route; regression role pack Pass.

### Example D — Not a bug

**Title:** Kanban drag-drop not available  
**Triage:** `out-of-mvp` + `status:not-a-bug` — Constitution excludes Kanban from MVP. Track under Future epic EPIC-F01 if needed as enhancement.

---

## 25. Bug Triage Process

### Cadence

- **Daily** (active sprint): S1/S2 + new issues  
- **Twice weekly:** full backlog triage  
- **Pre-release:** all open bugs vs Release Checklist  

### Participants

QA lead (facilitator), Tech lead, optional PO for priority disputes.

### Steps

1. Confirm template completeness → else request info (`status:new`).  
2. Reproduce or accept “credible + evidence”.  
3. Set severity, priority, category labels.  
4. Decide: Accept / Duplicate / Not a Bug / Defer.  
5. Assign owner or project board column.  
6. Mark `release-blocker` if applicable.  
7. Link Feature/Screen/API.  

### Triage outcomes

| Outcome | Action |
|---------|--------|
| Accept | `status:accepted` → backlog/sprint |
| Duplicate | Close with pointer |
| Not a Bug | Close; explain SOT |
| Enhancement | Convert/relabel; remove `bug` if pure feature ask |
| Deferred | `known-issue` + release notes |

---

## 26. Escalation Matrix

| Situation | Escalate to | Time |
|-----------|-------------|------|
| New S1 | Tech lead + on-call/RM | Immediate |
| S1 not fixed same day | Eng manager / PO | Same day EOD |
| Security S1 | Tech lead + PO (+ security owner if named) | Immediate |
| Release blocker within 48h of deploy | Release manager + PO + TL | Immediate |
| Severity dispute | Tech lead decides severity; PO decides priority | Within 1 business day |
| “Not a bug” dispute (fidelity) | HTML SOT; PO only if Requirements conflict | ASAP |
| Prod incident | On-call → RM → PO communication | Per incident process |
| Data loss / corrupt DB | TL + RM; stop deploy; backups | Immediate |

### Contacts (fill per project)

| Role | Name | Contact |
|------|------|---------|
| QA lead | | |
| Tech lead | | |
| Release manager | | |
| Product Owner | | |
| On-call | | |

---

## 27. Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Reporter | Quality report + evidence |
| QA | Triage support, verification, close, regression |
| Developer | Fix, tests, notes, RCA for S1 |
| Tech lead | Severity arbitration, architecture fixes |
| PO | Priority, waivers, known issues, scope calls |
| Release manager | Blocker enforcement at Go/No-Go |

---

## 28. Metrics (optional but recommended)

| Metric | Why |
|--------|-----|
| Open S1/S2 count | Health |
| Time to triage | Process |
| Time to verify | QA capacity |
| Reopen rate | Fix quality |
| Escape defects (prod) | Release quality |
| Fidelity bugs vs functional split | UI risk |

---

## 29. Quick Reference Card

| Question | Answer |
|----------|--------|
| UI mismatch vs HTML? | Bug ≥ S2 |
| Kanban missing in MVP? | Not a bug |
| Who closes? | QA |
| Release with S1? | No (unless written waiver) |
| Need RCA? | S1, blockers, security, regressions |
| Duplicate? | Close → canonical |

---

## 30. Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Initial complete Bug Tracking / QA handbook |

---

**End of Bug Tracking Guide**
