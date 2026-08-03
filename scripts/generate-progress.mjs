/**
 * Generates docs/progress.html from backlog docs + status map.
 * Run: node scripts/generate-progress.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const md = fs.readFileSync(path.join(root, "docs/08_EPICS_AND_FEATURES.md"), "utf8");

/** @typedef {'done'|'partial'|'todo'|'deferred'|'future'} Status */

/** Feature completion as of 2026-08-03 (shipped code + PO deferrals). */
const FEATURE_STATUS = /** @type {Record<string, Status>} */ ({
  "FEAT-00-01": "done",
  "FEAT-00-02": "done",
  "FEAT-00-03": "done",
  "FEAT-01-01": "done",
  "FEAT-01-02": "done",
  "FEAT-02-01": "done",
  "FEAT-02-02": "done",
  "FEAT-03-01": "done",
  "FEAT-03-02": "done",
  "FEAT-04-01": "done",
  "FEAT-04-02": "done",
  "FEAT-04-03": "done",
  "FEAT-05-01": "done",
  "FEAT-05-02": "done",
  "FEAT-06-01": "done",
  "FEAT-06-02": "done",
  "FEAT-07-01": "done",
  "FEAT-07-02": "done",
  "FEAT-07-03": "done",
  "FEAT-08-01": "done",
  "FEAT-09-01": "done",
  "FEAT-09-02": "done",
  "FEAT-10-01": "done",
  "FEAT-11-01": "done",
  "FEAT-12-01": "done",
  "FEAT-12-02": "done",
  "FEAT-13-01": "done",
  "FEAT-14-01": "done",
  "FEAT-14-02": "done",
  "FEAT-15-01": "done",
  "FEAT-16-01": "done",
  "FEAT-16-02": "done",
  "FEAT-17-01": "done",
  "FEAT-18-01": "done",
  "FEAT-18-02": "done",
  "FEAT-F01-01": "future",
  "FEAT-F02-01": "future",
  "FEAT-F03-01": "future",
  "FEAT-F04-01": "future",
  "FEAT-F05-01": "future",
  "FEAT-F06-01": "future",
});

const STORY_OVERRIDES = /** @type {Record<string, Status>} */ ({
  "STORY-05-02-02": "done",
  "STORY-09-01-01": "done",
  "STORY-09-01-02": "done",
  "STORY-09-02-01": "done",
  "STORY-09-02-02": "done",
  "STORY-09-02-03": "done",
  "STORY-10-01-01": "done",
  "STORY-10-01-02": "done",
  "STORY-16-02-01": "done",
  "STORY-18-01-01": "done",
  "STORY-18-01-02": "done",
  "STORY-18-02-01": "done",
  "STORY-18-02-02": "done",
});

const SPRINTS = [
  { id: 0, theme: "Foundation", epics: ["EPIC-00"], features: ["FEAT-00-01", "FEAT-00-02", "FEAT-00-03"] },
  { id: 1, theme: "Auth", epics: ["EPIC-01"], features: ["FEAT-01-01", "FEAT-01-02"] },
  { id: 2, theme: "Users & Agents", epics: ["EPIC-02"], features: ["FEAT-02-01", "FEAT-02-02"] },
  { id: 3, theme: "Property Admin", epics: ["EPIC-07"], features: ["FEAT-07-01", "FEAT-07-02", "FEAT-07-03"] },
  { id: 4, theme: "Property Public + Maps", epics: ["EPIC-05", "EPIC-17"], features: ["FEAT-05-01", "FEAT-17-01", "FEAT-05-02"] },
  { id: 5, theme: "AI Search", epics: ["EPIC-04"], features: ["FEAT-04-01", "FEAT-04-02", "FEAT-04-03"] },
  { id: 6, theme: "Homepage", epics: ["EPIC-03"], features: ["FEAT-03-01", "FEAT-03-02"] },
  { id: 7, theme: "CRM + Visits", epics: ["EPIC-09", "EPIC-10"], features: ["FEAT-09-01", "FEAT-09-02", "FEAT-10-01"] },
  { id: 8, theme: "Customer + Favorites", epics: ["EPIC-06", "EPIC-11"], features: ["FEAT-06-01", "FEAT-06-02", "FEAT-11-01"] },
  { id: 9, theme: "AI Chat + Config", epics: ["EPIC-12", "EPIC-13"], features: ["FEAT-12-01", "FEAT-12-02", "FEAT-13-01"] },
  { id: 10, theme: "Notifications + CMS", epics: ["EPIC-14", "EPIC-15"], features: ["FEAT-14-01", "FEAT-14-02", "FEAT-15-01"] },
  { id: 11, theme: "Bulk Upload", epics: ["EPIC-08"], features: ["FEAT-08-01"] },
  { id: 12, theme: "Command Center", epics: ["EPIC-16"], features: ["FEAT-16-01", "FEAT-16-02"] },
  { id: 13, theme: "Harden & Ship MVP", epics: ["EPIC-18"], features: ["FEAT-18-01", "FEAT-18-02"] },
];

const epicMeta = new Map();
const features = [];
let currentEpic = null;
let currentFeat = null;

for (const line of md.split(/\r?\n/)) {
  const em = line.match(/^## (EPIC-[0-9F]+):\s*(.+)$/);
  if (em) {
    currentEpic = { id: em[1], name: em[2].trim() };
    epicMeta.set(currentEpic.id, currentEpic.name);
    continue;
  }
  const fm = line.match(/^### (FEAT-[0-9F]+-[0-9]+):\s*(.+)$/);
  if (fm) {
    currentFeat = {
      id: fm[1],
      name: fm[2].trim(),
      epicId: currentEpic?.id ?? "UNKNOWN",
      epicName: currentEpic?.name ?? "",
      stories: [],
    };
    features.push(currentFeat);
    continue;
  }
  const sm = line.match(/^- (STORY-[0-9F]+-[0-9]+-[0-9]+)\s+(.+)$/);
  if (sm && currentFeat) {
    currentFeat.stories.push({ id: sm[1], text: sm[2].trim() });
  }
}

function featureStatus(id) {
  return FEATURE_STATUS[id] ?? "todo";
}

function storyStatus(storyId, featId) {
  if (STORY_OVERRIDES[storyId]) return STORY_OVERRIDES[storyId];
  const fs = featureStatus(featId);
  if (fs === "done") return "done";
  if (fs === "future") return "future";
  if (fs === "deferred") return "deferred";
  if (fs === "partial") return "partial";
  return "todo";
}

function epicStatus(epicId) {
  const feats = features.filter((f) => f.epicId === epicId);
  if (!feats.length) return "todo";
  if (feats.every((f) => featureStatus(f.id) === "future")) return "future";
  const statuses = feats.map((f) => featureStatus(f.id));
  if (statuses.every((s) => s === "done")) return "done";
  if (statuses.every((s) => s === "deferred" || s === "future")) return "deferred";
  if (statuses.some((s) => s === "done" || s === "partial")) return "partial";
  return "todo";
}

function sprintStatus(sprint) {
  const statuses = sprint.features.map(featureStatus);
  if (statuses.every((s) => s === "done")) return "done";
  if (statuses.every((s) => s === "deferred")) return "deferred";
  if (statuses.some((s) => s === "done" || s === "partial")) return "partial";
  return "todo";
}

function score(status) {
  if (status === "done") return 1;
  if (status === "partial") return 0.5;
  return 0;
}

const mvpFeatures = features.filter((f) => !f.id.includes("-F"));
const mvpDone = mvpFeatures.filter((f) => featureStatus(f.id) === "done").length;
const mvpPartial = mvpFeatures.filter((f) => featureStatus(f.id) === "partial").length;
const mvpDeferred = mvpFeatures.filter((f) => featureStatus(f.id) === "deferred").length;
const mvpTodo = mvpFeatures.filter((f) => featureStatus(f.id) === "todo").length;
const mvpPct = Math.round(
  (mvpFeatures.reduce((a, f) => a + score(featureStatus(f.id)), 0) / mvpFeatures.length) * 100,
);

const allStories = features.flatMap((f) =>
  f.stories.map((s) => ({ ...s, featId: f.id, status: storyStatus(s.id, f.id) })),
);
const mvpStories = allStories.filter((s) => !s.id.includes("-F"));
const storyPct = Math.round(
  (mvpStories.reduce((a, s) => a + score(s.status), 0) / Math.max(mvpStories.length, 1)) * 100,
);

const sprintDone = SPRINTS.filter((s) => sprintStatus(s) === "done").length;
const sprintPct = Math.round(
  (SPRINTS.reduce((a, s) => a + score(sprintStatus(s)), 0) / SPRINTS.length) * 100,
);

const label = {
  done: "Done",
  partial: "Partial",
  todo: "To do",
  deferred: "Deferred",
  future: "Future / Out of MVP",
};

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const epicIds = [...new Set(features.map((f) => f.epicId))];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>PropVista — Delivery Progress</title>
<style>
  :root {
    --bg: #faf8ff;
    --surface: #ffffff;
    --ink: #191b23;
    --muted: #434654;
    --outline: #c3c6d6;
    --primary: #003d9b;
    --primary-soft: #dae2ff;
    --done: #0f7b3a;
    --done-bg: #e6f6ec;
    --partial: #9a6700;
    --partial-bg: #fff4d6;
    --todo: #434654;
    --todo-bg: #ededf8;
    --deferred: #873da6;
    --deferred-bg: #f8d8ff;
    --future: #737685;
    --future-bg: #e1e2ec;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, Segoe UI, sans-serif;
    background: linear-gradient(180deg, #f3f3fd 0%, var(--bg) 220px);
    color: var(--ink);
    line-height: 1.45;
  }
  header {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px 16px;
  }
  header h1 {
    margin: 0 0 8px;
    font-size: 32px;
    letter-spacing: -0.01em;
    color: var(--primary);
  }
  header p { margin: 0; color: var(--muted); max-width: 70ch; }
  .meta { margin-top: 12px; font-size: 13px; color: var(--muted); }
  main { max-width: 1200px; margin: 0 auto; padding: 8px 24px 64px; }
  .kpis {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin: 24px 0 32px;
  }
  .kpi {
    background: var(--surface);
    border: 1px solid var(--outline);
    border-radius: 12px;
    padding: 16px 18px;
  }
  .kpi .label { font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
  .kpi .value { font-size: 36px; font-weight: 700; margin-top: 6px; color: var(--primary); }
  .kpi .sub { font-size: 13px; color: var(--muted); margin-top: 4px; }
  .bar {
    height: 10px;
    background: var(--todo-bg);
    border-radius: 999px;
    overflow: hidden;
    margin-top: 12px;
  }
  .bar > span { display: block; height: 100%; background: var(--primary); }
  .legend {
    display: flex; flex-wrap: wrap; gap: 10px 16px;
    margin-bottom: 28px; font-size: 13px;
  }
  .pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
  }
  .pill.done { background: var(--done-bg); color: var(--done); }
  .pill.partial { background: var(--partial-bg); color: var(--partial); }
  .pill.todo { background: var(--todo-bg); color: var(--todo); }
  .pill.deferred { background: var(--deferred-bg); color: var(--deferred); }
  .pill.future { background: var(--future-bg); color: var(--future); }
  section {
    background: var(--surface);
    border: 1px solid var(--outline);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }
  section h2 {
    margin: 0 0 14px;
    font-size: 22px;
  }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--outline); vertical-align: top; }
  th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
  tr:last-child td { border-bottom: none; }
  .sprint-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
  }
  .sprint-card {
    border: 1px solid var(--outline);
    border-radius: 10px;
    padding: 14px;
    background: #faf8ff;
  }
  .sprint-card h3 { margin: 0 0 6px; font-size: 16px; }
  .sprint-card .theme { color: var(--muted); font-size: 13px; margin-bottom: 10px; }
  details { margin-top: 8px; }
  details summary { cursor: pointer; color: var(--primary); font-weight: 600; font-size: 13px; }
  ul.stories { margin: 8px 0 0; padding-left: 18px; }
  ul.stories li { margin: 4px 0; color: var(--muted); }
  ul.stories li strong { color: var(--ink); font-weight: 600; }
  .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  .filters button {
    border: 1px solid var(--outline);
    background: #fff;
    border-radius: 8px;
    padding: 6px 12px;
    cursor: pointer;
    font: inherit;
    font-size: 13px;
  }
  .filters button.active { background: var(--primary); color: #fff; border-color: var(--primary); }
  @media (max-width: 800px) {
    .kpis { grid-template-columns: 1fr 1fr; }
  }
</style>
</head>
<body>
<header>
  <h1>PropVista delivery progress</h1>
  <p>Live tracker for Epics, Features, Stories, and Sprint Plan from <code>docs/08_EPICS_AND_FEATURES.md</code> + <code>docs/09_SPRINT_PLAN.md</code>. Status reflects shipped code as of generation date (leads admin work deferred by PO).</p>
  <p class="meta">Generated ${new Date().toISOString().slice(0, 10)} · Regenerate with <code>node scripts/generate-progress.mjs</code></p>
</header>
<main>
  <div class="kpis">
    <div class="kpi">
      <div class="label">MVP features</div>
      <div class="value">${mvpPct}%</div>
      <div class="sub">${mvpDone} done · ${mvpPartial} partial · ${mvpDeferred} deferred · ${mvpTodo} todo / ${mvpFeatures.length}</div>
      <div class="bar"><span style="width:${mvpPct}%"></span></div>
    </div>
    <div class="kpi">
      <div class="label">MVP stories</div>
      <div class="value">${storyPct}%</div>
      <div class="sub">${mvpStories.filter((s) => s.status === "done").length} done / ${mvpStories.length}</div>
      <div class="bar"><span style="width:${storyPct}%"></span></div>
    </div>
    <div class="kpi">
      <div class="label">Sprints</div>
      <div class="value">${sprintPct}%</div>
      <div class="sub">${sprintDone} complete / ${SPRINTS.length}</div>
      <div class="bar"><span style="width:${sprintPct}%"></span></div>
    </div>
    <div class="kpi">
      <div class="label">Next up</div>
      <div class="value" style="font-size:20px;line-height:1.3;margin-top:10px">MVP complete<br/>Ship / UAT</div>
      <div class="sub">Commit · push · release checklist · pixel/QA samples</div>
    </div>
  </div>

  <div class="legend">
    <span class="pill done">Done</span>
    <span class="pill partial">Partial</span>
    <span class="pill todo">To do</span>
    <span class="pill deferred">Deferred</span>
    <span class="pill future">Future / Out of MVP</span>
  </div>

  <section>
    <h2>Sprint plan</h2>
    <div class="sprint-grid">
      ${SPRINTS.map((s) => {
        const st = sprintStatus(s);
        return `<article class="sprint-card">
          <h3>Sprint ${s.id}</h3>
          <div class="theme">${esc(s.theme)}</div>
          <span class="pill ${st}">${label[st]}</span>
          <div style="margin-top:10px;font-size:13px;color:var(--muted)">${s.epics.join(", ")}</div>
          <ul class="stories">
            ${s.features
              .map((fid) => {
                const f = features.find((x) => x.id === fid);
                const fs = featureStatus(fid);
                return `<li><span class="pill ${fs}">${label[fs]}</span> <strong>${fid}</strong> ${esc(f?.name ?? "")}</li>`;
              })
              .join("")}
          </ul>
        </article>`;
      }).join("")}
    </div>
  </section>

  <section>
    <h2>Epics</h2>
    <table>
      <thead><tr><th>Epic</th><th>Name</th><th>Features</th><th>Status</th></tr></thead>
      <tbody>
        ${epicIds
          .map((id) => {
            const feats = features.filter((f) => f.epicId === id);
            const st = epicStatus(id);
            return `<tr>
              <td><strong>${id}</strong></td>
              <td>${esc(epicMeta.get(id) ?? "")}</td>
              <td>${feats.length}</td>
              <td><span class="pill ${st}">${label[st]}</span></td>
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Features &amp; stories</h2>
    <div class="filters" id="filters">
      <button type="button" data-filter="all" class="active">All</button>
      <button type="button" data-filter="done">Done</button>
      <button type="button" data-filter="partial">Partial</button>
      <button type="button" data-filter="todo">To do</button>
      <button type="button" data-filter="deferred">Deferred</button>
      <button type="button" data-filter="future">Future</button>
    </div>
    <table id="feature-table">
      <thead><tr><th>Feature</th><th>Epic</th><th>Status</th><th>Stories</th></tr></thead>
      <tbody>
        ${features
          .map((f) => {
            const fs = featureStatus(f.id);
            return `<tr data-status="${fs}">
              <td><strong>${f.id}</strong><br/><span style="color:var(--muted)">${esc(f.name)}</span></td>
              <td>${f.epicId}</td>
              <td><span class="pill ${fs}">${label[fs]}</span></td>
              <td>
                <details>
                  <summary>${f.stories.length} stories</summary>
                  <ul class="stories">
                    ${f.stories
                      .map((s) => {
                        const ss = storyStatus(s.id, f.id);
                        return `<li><span class="pill ${ss}">${label[ss]}</span> <strong>${s.id}</strong> — ${esc(s.text)}</li>`;
                      })
                      .join("")}
                  </ul>
                </details>
              </td>
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  </section>
</main>
<script>
  const buttons = document.querySelectorAll('#filters button');
  const rows = document.querySelectorAll('#feature-table tbody tr');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      rows.forEach((row) => {
        row.style.display = filter === 'all' || row.dataset.status === filter ? '' : 'none';
      });
    });
  });
</script>
</body>
</html>
`;

const out = path.join(root, "docs/progress.html");
fs.writeFileSync(out, html, "utf8");
console.log(`Wrote ${out}`);
console.log(`MVP features ${mvpPct}% · stories ${storyPct}% · sprints ${sprintPct}%`);
