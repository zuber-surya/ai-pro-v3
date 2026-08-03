# PropVista CRM / Property AI Studio — Pixel Perfect UI Verification Manual

| Field | Value |
|-------|--------|
| **Document** | `16_UI_PIXEL_PERFECT_CHECKLIST.md` |
| **Version** | 1.0.0 |
| **Date** | 2026-07-30 |
| **UI SOT** | `docs/design_reference/**` — **HTML is definitive**; `screen.png` is the visual baseline |
| **Tokens** | `docs/design_reference/propvista_crm/DESIGN.md` |
| **Governance** | Constitution §7 Screen Completion, §17 UI Verification |
| **Companion** | `docs/07_UI_IMPLEMENTATION_GUIDE.md` |

---

## 1. Purpose

This manual defines **exactly** how every screen must be verified before approval.

**Hard rule:** No screen may be marked complete until **every applicable checklist item in this document passes**. Fail any required item ⇒ screen incomplete (Constitution §17).

---

## 2. Source of Truth Hierarchy

| Priority | Artifact | Role |
|----------|----------|------|
| 1 | `docs/design_reference/<screen>/code.html` | Structure, copy, classes, states, interactions |
| 2 | `docs/design_reference/<screen>/screen.png` | Pixel / composition baseline at capture viewport |
| 3 | `DESIGN.md` tokens | Colors, type scale, radii, shadows |
| 4 | Implemented Next.js UI | Must match 1–3 — never the reverse |

**Conflict rules**

- HTML vs Requirements on UI → **HTML wins**.  
- HTML exists for Out-of-MVP (e.g. Kanban) → **do not ship in MVP**; do not verify as MVP-complete.  
- “Looks better” / redesign → **automatic fail**.  
- Do not edit HTML to match a bad implementation.

---

## 3. Definition of Pixel Perfect

A screen is **Pixel Perfect** when a trained reviewer comparing the running app to `code.html` (live or opened locally) and `screen.png` cannot identify meaningful visual differences in:

- Layout grid and section order  
- Spacing (margins, paddings, gaps)  
- Typography (family, size, weight, line-height, letter-spacing, color)  
- Colors and surfaces (backgrounds, borders, overlays)  
- Icons and images (asset, size, crop, position)  
- Component chrome (buttons, inputs, tables, cards, dialogs)  
- Shadows, radii, borders as in reference  
- Motion (duration/easing/visibility) where HTML specifies  

**Tolerances (only)**

| Allowed | Not allowed |
|---------|-------------|
| ±1px anti-aliasing / subpixel rounding across browsers | Deliberate spacing/color/type changes |
| Dynamic data text length wrapping **as HTML would** with same CSS | Different breakpoints or stacking than HTML |
| Map tiles differing (OSM live tiles) if chrome/markers match | Different map library or chrome layout |
| Timestamp/user-generated content differing in **copy** only | Different control placement or missing controls |

If unsure: **fail and match HTML**.

---

## 4. Definition of Screen Complete

A screen is **Screen Complete** only when **all** are true:

### 4.1 Visual

- [ ] Pixel Perfect (this manual §3 + all visual sections Pass)  
- [ ] Screenshot comparison process completed and evidence attached  
- [ ] Desktop + tablet + mobile verified as applicable  

### 4.2 Interaction & States

- [ ] All interactions from HTML implemented  
- [ ] Hover / active / selected / focus match  
- [ ] Loading + skeletons match  
- [ ] Empty states match  
- [ ] Error states + form validation UX match  
- [ ] Success / ready states match (post-load content; post-submit toast only if HTML shows)  
- [ ] Animations / transitions match  

### 4.3 Engineering gates (Constitution §7.2)

- [ ] API integrated (real API, or temporary mock with tracked replacement ticket — **not Done** until real for completed features)  
- [ ] No console errors during walkthrough  
- [ ] No TypeScript errors  
- [ ] No ESLint warnings  
- [ ] Code reviewed  
- [ ] QA approved (sign-off template below)  

### 4.4 Scope

- [ ] Screen is in MVP scope **or** explicitly Future-only (Kanban: not MVP-complete)  
- [ ] Out-of-MVP controls not shipped (e.g. video/virtual tour, reminder product) per Constitution  

**Partial completion is not Screen Complete.**

---

## 5. Screen Inventory (verify every MVP screen)

| ID | `design_reference` directory | MVP verify? |
|----|------------------------------|-------------|
| SCR-HOME | `propvista_crm_homepage` | Yes |
| SCR-SEARCH-STD | `search_results_standard_view` | Yes |
| SCR-SEARCH-FB | `search_results_filter_fallback_view` | Yes |
| SCR-SEARCH-EMPTY | `search_results_empty_state` | Yes |
| SCR-PROP-D | `property_details_premium_view` | Yes |
| SCR-CUS-DASH | `customer_account_dashboard` | Yes |
| SCR-LEAD-KANBAN | `lead_pipeline_kanban_view` | **No (Out of MVP)** — absence from nav only |
| SCR-LEAD-D | `lead_detail_sarah_jenkins` | Yes* |
| SCR-PROP-EDIT | `listing_editor_basic_info` | Yes |
| SCR-PROP-INV | `property_inventory_admin_view` | Yes |
| SCR-BULK | `bulk_upload_validation_results` | Yes |
| SCR-AI-CFG | `ai_chatbot_configuration` | Yes |
| SCR-CMD | `admin_agent_command_center` | Yes |
| Tokens | `propvista_crm/DESIGN.md` | Yes (theme) |
| Search icon asset | magnifying-glass asset dir | Yes (asset match) |

\* MVP subset: layout fidelity for contact/stage/notes/schedule; do not require timeline/reminder **product** backends.

Also verify auth/login/register and modals referenced in Requirements (`ScheduleVisitModal`, loan modal, add lead) when those surfaces ship—against prototype/HTML where provided.

---

## 6. Pre-Verification Setup

1. Open `code.html` in a browser (same target width as `screen.png` when possible).  
2. Open `screen.png` beside the running app (split screen or second monitor).  
3. Run app against staging/local with seed data that approximates reference content density.  
4. Disable browser zoom (100%). OS display scaling noted if not 100%.  
5. Use a clean profile (no extension restyling).  
6. Record build SHA / URL / date on sign-off forms.

---

## 7. Pixel Comparison Process

### 7.1 Mandatory steps (every screen)

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | Open HTML reference | Structure and intended states understood |
| 2 | Capture app screenshot at **same viewport width** as `screen.png` | Comparable frames |
| 3 | Side-by-side: `screen.png` \| app capture \| HTML | Composition match |
| 4 | Overlay (optional): 50% opacity app over `screen.png` | Misaligned sections visible |
| 5 | Section walk: header → main → aside → footer / widgets | Each region Pass |
| 6 | State walk: default → hover → focus → loading → empty → error | Each state Pass |
| 7 | Responsive walk: desktop → tablet → mobile | Each breakpoint Pass |
| 8 | Attach evidence to PR / QA ticket | Screenshots + notes |

### 7.2 Recommended tools

- Browser DevTools device mode  
- Overlay: [PixelPerfect](https://chrome.google.com)-style extension, Figma/PNG overlay, or Playwright screenshot diff  
- Color picker for token verification  
- Accessibility: keyboard-only pass + axe optional  

### 7.3 Fail protocol

1. Log defect with SCR-ID, section, expected (HTML), actual (app), screenshot pair.  
2. Severity: visual fidelity gaps on in-scope screens are **Major/Blocking** for Screen Complete.  
3. Re-verify full screen after fix—not only the changed control.

---

# Checklists

Mark each item ☐ Pass / ☐ Fail / ☐ N/A. **Fail or skipped required item = incomplete.**

---

## 8. General UI Checklist

| # | Check | Pass |
|---|-------|------|
| G1 | Correct SCR folder HTML used as primary reference | ☐ |
| G2 | `screen.png` compared at desktop | ☐ |
| G3 | No redesign / “polish” / alternate layout | ☐ |
| G4 | Section order matches HTML | ☐ |
| G5 | All visible controls from HTML present (unless Constitution excludes) | ☐ |
| G6 | No extra marketing widgets not in HTML | ☐ |
| G7 | Shell (header/sidebar/footer) matches for that screen | ☐ |
| G8 | Chat/search widgets placement matches where applicable | ☐ |
| G9 | Copy/labels match HTML (unless Requirements mandate dynamic data only) | ☐ |
| G10 | No console errors during full walkthrough | ☐ |
| G11 | Broken images/icons: none | ☐ |
| G12 | Z-index / overlays (dropdowns, chat, modals) match stacking | ☐ |

---

## 9. Layout

| # | Check | Pass |
|---|-------|------|
| L1 | Grid/columns/flex structure matches HTML | ☐ |
| L2 | Max width / content centering matches | ☐ |
| L3 | Sticky/fixed regions behave as HTML | ☐ |
| L4 | Sidebar width and collapse behavior match (admin) | ☐ |
| L5 | Split panes / detail ratios match (lead detail, etc.) | ☐ |
| L6 | No unintended horizontal scroll at reference desktop width | ☐ |
| L7 | Alignment of columns (left/center/right edges) matches | ☐ |

---

## 10. Spacing

| # | Check | Pass |
|---|-------|------|
| SP1 | Padding inside sections/cards/inputs matches | ☐ |
| SP2 | Margins between sections match | ☐ |
| SP3 | Gap between sibling controls matches | ☐ |
| SP4 | List/grid item spacing matches | ☐ |
| SP5 | No “tightened” or “airy” reinterpretation | ☐ |
| SP6 | Form row spacing and label→field gaps match | ☐ |

---

## 11. Typography

| # | Check | Pass |
|---|-------|------|
| TY1 | Font families match reference / DESIGN.md (not Inter/system substitution unless HTML uses it) | ☐ |
| TY2 | Sizes match for headings, body, captions, overlines | ☐ |
| TY3 | Weights match (regular/medium/semibold/bold) | ☐ |
| TY4 | Line-height and letter-spacing match | ☐ |
| TY5 | Text colors match tokens | ☐ |
| TY6 | Truncation/ellipsis behavior matches where HTML truncates | ☐ |
| TY7 | Link underline/weight styles match | ☐ |

---

## 12. Icons

| # | Check | Pass |
|---|-------|------|
| I1 | Icon set/assets match reference (no Lucide↔other swaps if HTML uses specific assets) | ☐ |
| I2 | Icon size and stroke weight match | ☐ |
| I3 | Icon color/opacity match | ☐ |
| I4 | Icon alignment with labels matches | ☐ |
| I5 | Search magnifying-glass asset matches AST reference where used | ☐ |

---

## 13. Colors

| # | Check | Pass |
|---|-------|------|
| C1 | Backgrounds match (page, sections, elevated surfaces) | ☐ |
| C2 | Primary/accent/danger/success colors match DESIGN.md / HTML | ☐ |
| C3 | Borders and dividers match | ☐ |
| C4 | Overlays/scrims match | ☐ |
| C5 | Gradients/patterns match (no flat substitution if HTML has atmosphere) | ☐ |
| C6 | Status badge colors match | ☐ |
| C7 | Chart colors approximate HTML (command center) | ☐ |

---

## 14. Buttons

| # | Check | Pass |
|---|-------|------|
| B1 | Primary/secondary/tertiary/ghost variants match | ☐ |
| B2 | Size, padding, radius match | ☐ |
| B3 | Icon+label buttons match | ☐ |
| B4 | Disabled appearance matches | ☐ |
| B5 | Loading button state matches if HTML shows | ☐ |
| B6 | Button group spacing matches | ☐ |
| B7 | Destructive actions styled as HTML | ☐ |

---

## 15. Forms

| # | Check | Pass |
|---|-------|------|
| FO1 | Field order and grouping match | ☐ |
| FO2 | Label placement/style match | ☐ |
| FO3 | Input height, border, radius, placeholder match | ☐ |
| FO4 | Select/checkbox/radio/toggle match HTML | ☐ |
| FO5 | Helper text style/placement match | ☐ |
| FO6 | Inline validation messages match HTML UX | ☐ |
| FO7 | Required indicators match | ☐ |
| FO8 | Textarea sizing matches | ☐ |
| FO9 | Amenities checklist + custom amenity patterns match (editor) | ☐ |

---

## 16. Tables

| # | Check | Pass |
|---|-------|------|
| TB1 | Column order/headers match | ☐ |
| TB2 | Cell typography and padding match | ☐ |
| TB3 | Row height / zebra / hover row match | ☐ |
| TB4 | Sort indicators match | ☐ |
| TB5 | Checkbox / bulk select column match | ☐ |
| TB6 | Row action menus/icons match | ☐ |
| TB7 | Pagination control placement/style match | ☐ |
| TB8 | Column show/hide UI matches if present | ☐ |
| TB9 | Sticky header behavior matches if HTML has it | ☐ |

---

## 17. Cards

| # | Check | Pass |
|---|-------|------|
| CA1 | Card dimensions, radius, shadow, border match | ☐ |
| CA2 | Image aspect ratio and crop match | ☐ |
| CA3 | Price/meta row layout matches | ☐ |
| CA4 | Favorite/save control position matches | ☐ |
| CA5 | Match score / reason chips match (search) | ☐ |
| CA6 | Grid vs list density matches toggle states | ☐ |

---

## 18. Dialogs

| # | Check | Pass |
|---|-------|------|
| DI1 | Modal width, radius, shadow match | ☐ |
| DI2 | Overlay/scrim opacity matches | ☐ |
| DI3 | Header/body/footer structure matches | ☐ |
| DI4 | Close control position matches | ☐ |
| DI5 | Schedule visit / add lead / loan modals match references | ☐ |
| DI6 | Focus trap / Esc behavior acceptable without visual redesign | ☐ |

---

## 19. Animations

| # | Check | Pass |
|---|-------|------|
| AN1 | Entrance animations present where HTML/Framer-like motion exists | ☐ |
| AN2 | Duration/easing feel match (not snappier/slower redesign) | ☐ |
| AN3 | Chat open/close motion matches | ☐ |
| AN4 | No extra decorative motion not in HTML | ☐ |
| AN5 | Reduced-motion: if OS prefers reduced, avoid adding new motion beyond HTML | ☐ |

---

## 20. Transitions

| # | Check | Pass |
|---|-------|------|
| TR1 | Color/background transitions on controls match | ☐ |
| TR2 | Expand/collapse panels match | ☐ |
| TR3 | Route/section transitions do not introduce non-HTML page fades | ☐ |
| TR4 | Tab/underline transitions match | ☐ |

---

## 21. Hover States

| # | Check | Pass |
|---|-------|------|
| HV1 | Buttons hover match HTML | ☐ |
| HV2 | Links/nav items hover match | ☐ |
| HV3 | Cards/rows hover match | ☐ |
| HV4 | Icon buttons hover match | ☐ |
| HV5 | Table row hover match | ☐ |
| HV6 | Cursor changes match (pointer vs default) | ☐ |

---

## 22. Focus States

| # | Check | Pass |
|---|-------|------|
| FC1 | Focus ring/outline visible and consistent with design | ☐ |
| FC2 | Focus order matches visual order | ☐ |
| FC3 | Focus not removed via `outline: none` without replacement | ☐ |
| FC4 | Focused inputs match HTML border/ring | ☐ |
| FC5 | Modal initial focus lands on sensible control | ☐ |

---

## 23. Loading States

| # | Check | Pass |
|---|-------|------|
| LD1 | Initial page/section loading matches HTML pattern | ☐ |
| LD2 | Search loading matches SCR-SEARCH loading treatment | ☐ |
| LD3 | Button/spinner loading matches | ☐ |
| LD4 | AI chat waiting indicator matches | ☐ |
| LD5 | No blank white flash where HTML shows loader | ☐ |

---

## 24. Skeletons

| # | Check | Pass |
|---|-------|------|
| SK1 | Skeleton shapes approximate content layout (cards/table/detail) | ☐ |
| SK2 | Skeleton colors/pulse match reference if HTML provides | ☐ |
| SK3 | Skeleton → content swap does not layout-shift beyond HTML | ☐ |

---

## 25. Empty States

| # | Check | Pass |
|---|-------|------|
| EM1 | Empty illustration/icon matches (search empty, inventory empty, etc.) | ☐ |
| EM2 | Empty copy matches HTML | ☐ |
| EM3 | CTA buttons on empty match (refine, reset, create) | ☐ |
| EM4 | SCR-SEARCH-EMPTY chips/suggestions match | ☐ |
| EM5 | Empty ≠ error (correct state machine) | ☐ |

---

## 26. Error States

| # | Check | Pass |
|---|-------|------|
| ER1 | Inline field errors match style/placement | ☐ |
| ER2 | Page/section error panels match HTML if present | ☐ |
| ER3 | Toast/banner errors match if HTML uses them | ☐ |
| ER4 | SCR-SEARCH-FB fallback banner + filter results match | ☐ |
| ER5 | API failure does not produce undesigned blank page | ☐ |
| ER6 | Map failure does not break surrounding layout | ☐ |

---

## 26A. Success States

| # | Check | Pass |
|---|-------|------|
| SU1 | After successful load, screen shows designed ready content (not stuck on skeleton) | ☐ |
| SU2 | After successful submit, designed confirmation/toast/redirect matches HTML or functional spec | ☐ |
| SU3 | Success ≠ empty and success ≠ error in state machine | ☐ |
| SU4 | Search AI success path renders SCR-SEARCH-STD (not fallback) when API succeeds with results | ☐ |

---

## 27. Responsive Behaviour

### 27.1 Desktop

| # | Check (~1280px+, match `screen.png` width) | Pass |
|---|--------------------------------------------|------|
| DK1 | Matches `screen.png` composition | ☐ |
| DK2 | Multi-column layouts intact | ☐ |
| DK3 | Admin tables full columns as HTML | ☐ |

### 27.2 Tablet

| # | Check (~768px) | Pass |
|---|--------------|------|
| TBK1 | Stacking/reflow matches HTML at tablet | ☐ |
| TBK2 | Nav/sidebar behavior matches | ☐ |
| TBK3 | Touch-friendly primary CTAs remain | ☐ |

### 27.3 Mobile

| # | Check (~375px) | Pass |
|---|--------------|------|
| MB1 | Single-column / HTML mobile structure | ☐ |
| MB2 | Header/menu usable | ☐ |
| MB3 | No broken overflow hiding CTAs | ☐ |
| MB4 | Forms/modals fit viewport | ☐ |
| MB5 | Property gallery/map usable | ☐ |

---

## 28. Accessibility

| # | Check | Pass |
|---|-------|------|
| AX1 | Semantic elements compatible with reference structure | ☐ |
| AX2 | Inputs have associated labels | ☐ |
| AX3 | Meaningful images have alt text | ☐ |
| AX4 | Contrast follows design tokens (no lowering contrast) | ☐ |
| AX5 | Visual design unchanged by a11y fixes (or PO-approved) | ☐ |

### 28.1 Keyboard Navigation

| # | Check | Pass |
|---|-------|------|
| KB1 | All primary actions reachable via Tab | ☐ |
| KB2 | Enter/Space activate buttons | ☐ |
| KB3 | Esc closes dialogs/menus as expected | ☐ |
| KB4 | Focus visible at every stop | ☐ |
| KB5 | No keyboard trap except intentional modal trap | ☐ |

---

## 29. Image Verification

| # | Check | Pass |
|---|-------|------|
| IM1 | Hero / card / gallery images correct aspect and object-fit | ☐ |
| IM2 | Placeholders match HTML when image missing | ☐ |
| IM3 | Agent avatars size/crop match | ☐ |
| IM4 | Floorplan presentation matches | ☐ |
| IM5 | No stretched/distorted assets | ☐ |
| IM6 | Favicon/logo match brand assets | ☐ |

---

## 30. Browser Compatibility

Verify primary flows on:

| Browser | Desktop | Notes | Pass |
|---------|---------|-------|------|
| Chrome (latest) | Required | Primary | ☐ |
| Edge (latest) | Required | Chromium parity | ☐ |
| Firefox (latest) | Required | Spot visual | ☐ |
| Safari (latest) | Required if Mac available | WebKit | ☐ |

| # | Check | Pass |
|---|-------|------|
| BR1 | Layout not broken in required browsers | ☐ |
| BR2 | Fonts load (FOUT acceptable if final match) | ☐ |
| BR3 | Sticky/fixed and modals work | ☐ |

---

## 31. Performance (visual)

| # | Check | Pass |
|---|-------|------|
| PF1 | No long blank states where HTML shows skeleton/loader | ☐ |
| PF2 | Images do not visibly collapse layout after load beyond HTML | ☐ |
| PF3 | Leaflet lazy-load does not jump chrome unexpectedly | ☐ |
| PF4 | Animations do not jank interactions on reference hardware | ☐ |
| PF5 | Primary route feels within NFR (&lt;2s) without stripping fidelity | ☐ |

---

## 32. Visual Regression

| # | Check | Pass |
|---|-------|------|
| VR1 | Baseline screenshots stored per SCR-ID (CI or QA library) | ☐ |
| VR2 | PR includes before/after or diff for touched screens | ☐ |
| VR3 | Unintended diffs investigated (not “accepted” silently) | ☐ |
| VR4 | Search state variants (STD/FB/EMPTY) each baselined | ☐ |

Automated visual regression is **encouraged**; **manual** HTML + `screen.png` comparison remains mandatory for Screen Complete.

---

## 33. Acceptance Checklist (per screen)

Copy for each SCR-*:

```text
Screen ID: ___________
Route: ___________
HTML: docs/design_reference/___________/code.html
PNG:  docs/design_reference/___________/screen.png
Build/SHA: ___________
Date: ___________

[ ] General UI
[ ] Layout
[ ] Spacing
[ ] Typography
[ ] Icons
[ ] Colors
[ ] Buttons
[ ] Forms (if any)
[ ] Tables (if any)
[ ] Cards (if any)
[ ] Dialogs (if any)
[ ] Animations
[ ] Transitions
[ ] Hover
[ ] Focus
[ ] Loading
[ ] Skeletons
[ ] Empty
[ ] Error
[ ] Desktop
[ ] Tablet
[ ] Mobile
[ ] Accessibility + Keyboard
[ ] Images
[ ] Browsers (required set)
[ ] Performance (visual)
[ ] Visual regression evidence
[ ] Pixel comparison process complete
[ ] Engineering gates (API, lint, TS, review)
[ ] MVP scope correct / exclusions respected

RESULT: ☐ PIXEL PERFECT  ☐ SCREEN COMPLETE  ☐ REJECTED
```

**Rejected if any required box unchecked.**

---

## 34. QA Sign-off Template

```markdown
## QA UI Sign-off

| Field | Value |
|-------|--------|
| Screen ID (SCR-*) | |
| Feature / PR | |
| Environment URL | |
| Build SHA | |
| Reviewer | |
| Date | |

### Evidence attached
- [ ] App screenshot (desktop) vs `screen.png`
- [ ] Overlay or side-by-side notes
- [ ] Mobile screenshot
- [ ] Tablet screenshot (if applicable)
- [ ] State screenshots (loading / empty / error / hover as applicable)

### Results
| Area | Pass/Fail |
|------|-----------|
| Pixel Perfect | |
| Responsive | |
| States | |
| A11y baseline | |
| Console clean | |
| Out-of-MVP absent | |

### Defects filed
| ID | Severity | Description |
|----|----------|-------------|
| | | |

### Decision
- [ ] **Approved — Screen Complete**
- [ ] **Rejected — not complete**

QA signature: __________________
```

---

## 35. Developer Sign-off Template

```markdown
## Developer UI Sign-off

| Field | Value |
|-------|--------|
| Screen ID (SCR-*) | |
| Feature ID | |
| PR link | |
| Developer | |
| Date | |

### Self-verification
- [ ] Implemented from `code.html` (not from memory)
- [ ] Compared to `screen.png` at desktop
- [ ] Responsive checked (375 / 768 / 1280)
- [ ] Hover / focus / loading / empty / error verified
- [ ] Tokens from DESIGN.md
- [ ] No redesign
- [ ] Centralized API / hooks (no business logic in JSX)
- [ ] Real API or tracked mock ticket: __________
- [ ] Lint / TS clean; no console errors
- [ ] This manual’s Acceptance Checklist completed

### Known gaps (must be empty for Complete)
| Gap | Ticket |
|-----|--------|
| none | |

### FEAT-18-01 residual gaps (filed 2026-08-03)

| Gap | Severity | Ticket / note |
|-----|----------|---------------|
| SCR-CLIENTS / SCR-LEAD-D full CRM UI deferred | Medium | FEAT-09 / FEAT-10 (end of backlog) |
| Homepage featured card `alt=""` decorative only — titles in text | Low | Optional enrich when CMS media has captions |
| Pixel-perfect pass not re-run for every SCR-* after FEAT-16 | Medium | TASK-18-01-QA-01 sample set pending |
| Search filter drawer focus trap (if present) not audited | Low | Follow-up with SCR-SEARCH keyboard pass |

### Decision
- [ ] Ready for QA
- [ ] Not ready

Developer signature: __________________
```

---

## 36. Per-Screen Quick Matrix

| SCR | Extra focus |
|-----|-------------|
| SCR-HOME | Hero search, chips, featured cards, chat widget, journey, testimonials |
| SCR-SEARCH-STD | Scores %, reasons, filters, grid/list, pagination |
| SCR-SEARCH-FB | Fallback banner, filter-only results, reset |
| SCR-SEARCH-EMPTY | Empty art, refine CTAs, suggestion chips |
| SCR-PROP-D | Gallery, floorplan, map chrome, CTAs, similar, agent card |
| SCR-CUS-DASH | Stats, saved grid, requirements, inquiries, bell |
| SCR-LEAD-D | MVP panels only; no reminder/timeline product requirement |
| SCR-PROP-EDIT | Draft/Publish, amenities; **no** video/tour controls |
| SCR-PROP-INV | Table density, bulk bar, badges, empty |
| SCR-BULK | Summary counts, error table columns |
| SCR-AI-CFG | FAQ, escalation, preview chat, tone controls |
| SCR-CMD | KPI cards, charts, feed, date range |

---

## 37. Related Documents

| Doc | Use |
|-----|-----|
| `00_PROJECT_CONSTITUTION.md` §7, §17 | Binding completion/verification rules |
| `07_UI_IMPLEMENTATION_GUIDE.md` | Per-screen implementation checklist |
| `15_CODE_REVIEW_CHECKLIST.md` | PR review gates for UI evidence |
| `11_TEST_STRATEGY.md` | UI / responsive / a11y test strategy |
| `14_CODING_STANDARDS.md` | No-redesign engineering rules |

---

## 38. Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-30 | Initial Pixel Perfect UI Verification Manual |

---

**End of Pixel Perfect UI Verification Manual**

*No screen is complete until every applicable checklist item passes.*
