# Autorecorder

Automated screen-recording suite for CopilotKit framework integrations. It
produces one narrated-looking demo video per documentation page: read the doc,
switch to VS Code and show the code that implements it, switch to the browser and
drive the live feature.

Currently configured for **Claude Agent SDK (Python) + React** — the 26 routes of
this repo that have a chrome-free `demo-chat` page. The remaining doc routes are
reference pages with nothing to drive; see *Scope* below.

> **Porting this to another framework?** Read **[ADAPT.md](ADAPT.md)** first. It
> is written for the person or agent doing the port, and it is the contract the
> `doctor` command enforces.

---

## Run it

Both services must be up first — the recorder refuses to start otherwise, because
a video of a dead page is worse than no video.

```bash
cd backend && uv run python src/agent_server.py     # http://localhost:8000
cd frontend && npm run dev                           # :3000
```

Both default ports are assumed. If something else already owns them, start this
stack elsewhere and point the recorder at it — every URL derives from these:

```bash
# start the agent server on a spare port, and the app on another
PORT=3001 npm run dev

FRONTEND_URL=http://localhost:3001 BACKEND_URL=http://localhost:8001 npm run doctor:online
```

Then:

```bash
cd autorecorder
npm install
npx playwright install chromium

npm run doctor            # is the configuration sane?
npm run record -- --list  # what will be recorded
npm run record -- --quickstart
npm run record            # all pages, in order
```

| Flag | Effect |
|---|---|
| `--list`, `--help` | Print every registered route and exit |
| `--doctor` | Validate the configuration; exits 1 on error |
| `--doctor --online` | Also probe every doc/demo URL and the selectors |
| `--<page-id>` | Record one page — `--quickstart`, `--slots` |
| `--page=<id>` | Same thing, explicit form |
| `--filter=<query>` | Record every page whose id or name contains the query |
| `--force` | Record even if the pre-flight health check fails |

Videos land in `videos/` as `CLAUDESDK-PY-react-<NN>-<name>.webm`, 1920×1080, ~25fps
(Playwright's capture rate; it is not configurable).

**`videos/` is gitignored on purpose.** Recordings are build output — reproducible
from this folder plus `npm run record` — and committing them is expensive: 17 clips
at ~5MB, rewritten on every re-record, took one repo's `.git` to 348MB before its
history had to be rewritten. Publish them as release assets or to a bucket. Keep
this policy when you copy the folder into another repo.

---

## Scope in this repo

A page is recordable only if it has something to drive, and the recorder reaches
every demo at `<route>/demo-chat`. `nav-config.ts` declares **31 routes, 29 of
them with a demo**. This suite registers **26**. The five that are not registered
break down as:

| Not registered | Why |
|---|---|
| `/` (Introduction), `/doc-sync` | No `demo-chat` page — reference material, nothing to drive. |
| `/prebuilt-components/copilot-threads-drawer`, `/headless-threads`, `/threads-lifecycle` | All three need CopilotKit Intelligence. Without `INTELLIGENCE_API_KEY` the runtime falls back to SSE and the thread list has nothing to show; without `COPILOTKIT_LICENSE_TOKEN` the drawer renders its locked view. This repo's `.env.example` carries neither, so registering them would record three videos of an empty or locked panel. |

Registering a route with no demo would fail `doctor --online`, because `demoUrl`
is always `route + demoSuffix` and there is no per-page way to say "this one has
no demo". That is a gap in `core/`, not something to work around here — see
ADAPT.md.

**This list is derived, not hand-written.** `config/pages.config.ts` is generated
from `frontend/src/lib/nav-config.ts` — the app's own source of truth for route →
doc-page mapping — so the recorder cannot drift from the nav. Re-derive it when the
nav changes, then re-check the line ranges.

**Sixteen pages use the default action; ten have a handler.** The dividing line
is whether the reply *is* the evidence. Where it is — the prebuilt surfaces, CSS,
sidebar, popup, sub-agents — a prompt and a wait is the whole demonstration.
Where a page can answer fluently while demonstrating nothing — a tool call that
should render a card, a browser-side handler that should repaint the page, a run
that should suspend on an approval, state that should land on a canvas — it gets
a handler, and the handler asserts the thing the page is actually about. See the
note at the top of `actions/index.ts`.


---

## Tracking recordings

Clips are **not** in git, and every run overwrites the same 16 filenames in place
— so nothing about the files themselves says which are fresh. `npm run manifest`
is what closes that gap:

```bash
npm run record            # produces the clips
npm run manifest          # records their state — run this straight after
```

It writes two committed files next to the (uncommitted) videos:

| File | For |
|---|---|
| `videos/manifest.json` | source of truth — per clip: mtime, size, sha256, the source files it shows, and a hash of those files plus the page definition |
| `videos/MANIFEST.md` | the same thing as a table, readable on GitHub |

Commit both. **The diff on those files is the record of what a run changed** —
that is the whole mechanism. Together they are ~12KB, against ~84MB of video.

| Status | Means |
|---|---|
| ✅ current | clip matches the code it shows |
| 🆕 new | the clip changed since the last manifest — this run re-recorded it |
| ⚠️ stale | a source file was modified *after* the clip was recorded |
| ⚠️ drifted | mtimes look fine but the source content hash moved (mtimes all reset on a fresh clone, which hides staleness — this catches it) |
| ❌ missing | a registered page with no clip on disk |

A clip is judged against the files it actually puts on screen — its `ideFile` and
any `extraTabs` — plus its own page definition, so changing a prompt or a
highlighted line range marks it stale exactly as an edit to the code does.

`npm run manifest:check` prints without writing and exits 1 if anything is stale
or missing, which is the form to put in CI.

**What it does not tell you: whether the run passed.** Playwright saves the video
even when a page fails, so a clip from a failed run still looks current. Freshness
and correctness are different questions — the run summary answers the second one.

---

## Reading the summary

```
   ✅ [PASS]  (44.2s) Headless UI -> CLAUDESDK-PY-react-08-HeadlessUI.webm
   ⚠️  [PASS*] (31.7s) Slots -> CLAUDESDK-PY-react-07-Slots.webm
        · Doc page (…/slots): Timeout 25000ms exceeded
   ❌ [FAIL]  (19.4s) A2UI · Fixed Schema -> CLAUDESDK-PY-react-17-A2UIFixedSchema.webm
        · Demo step failed: Agent run failed after 1.2s — the demo surfaced an
          error: "Claude Code not found at: …/_bundled/claude.exe"
```

- **PASS** — every step completed, *and* the page proved it did the thing the doc
  page is about. On the ten routes with a handler that is a specific claim: a card
  rendered, a background repainted, a picker resolved a suspended run, a canvas
  received state.
- **PASS\*** — recorded, but the external doc page misbehaved. The intro footage
  is degraded; the feature under test is not implicated.
- **FAIL** — the demo route 404'd, never rendered a chat surface, the agent never
  answered or failed, or the feature under test did not happen. The process exits
  1, so this is safe to gate CI on.

A failure names which of those it was — see *Troubleshooting* below. The one thing
a green run still cannot tell you is whether the footage is any good: the cursor
resting somewhere useless and the IDE highlighting the wrong function both pass.
Watch the video.

---

## Layout

The split between what you edit and what you don't is the point of this folder.

```
autorecorder/
├── ADAPT.md                    ← how to port this; read before editing
├── cli.ts                      ← entrypoint, arg parsing, summary
│
├── config/                     ← ★ THE ADAPTATION SURFACE
│   ├── project.config.ts         framework slug, doc root, URLs, start commands
│   ├── pages.config.ts           one entry per doc page
│   └── selectors.config.ts       how to find the chat surface
│
├── actions/                    ← ★ what to DO on each page
│   ├── index.ts                  page id → handler registry
│   └── *.action.ts               per-page interaction scripts
│
├── core/                       ← ✖ DO NOT EDIT — no framework knowledge here
│   ├── engine.ts                 browser lifecycle, the 3-step sequence, pass/fail
│   ├── actions.ts                sendPrompt, response detection, standard action
│   ├── doctor.ts                 the adaptation contract, as a command
│   ├── diagnostics.ts            pre-flight health check
│   ├── types.ts                  PageDefinition → PageRecordConfig
│   ├── ide/generator.ts          VS Code simulator, Shiki-highlighted from disk
│   └── overlays/                 Windows 11 taskbar + virtual cursor
│
└── videos/                     ← output
```

Every framework-specific value lives in `config/`. If something in `core/` needs
to change for a port, that is a bug in this folder — see ADAPT.md.

---

## What a recording actually does

1. **Doc page** — opens the real documentation URL, waits for hydration, then
   scrolls at reading pace and rests the cursor on a code block. Clicks VS Code
   on the simulated taskbar.
2. **IDE** — renders the project's own source, read from disk and highlighted
   with Shiki, with the page's line range selected. Multi-tab pages switch tabs.
   Served from the frontend's origin via an intercepted route, so the doc page is
   fully unloaded rather than painted over. Clicks Chrome on the taskbar.
3. **Demo** — opens the chrome-free demo route, waits for it to be genuinely
   ready, drives the page, waits out the agent's turn, and pauses for reading.
   "Drives the page" is per-route: sixteen routes send a prompt, and ten do
   something first or check something after — attach a file, change a config,
   click an approval, prove a card rendered. See `actions/index.ts`.

A word on how the turn is timed, because it decides what a green run means:
CopilotKit v2 renders `data-copilot-running="true"` on the chat root for exactly
as long as a run is in flight, and a `copilot-error-banner` carrying the
backend's own message when one fails. `actions/agent-run.ts` watches both. So the
wait ends when the run ends rather than when the text stops changing, a slow
first token is not mistaken for a dead agent — which matters on the two routes
that budget extended thinking — and a backend error is reported in about a second,
quoting the backend, instead of thirty seconds later as "no response".

Three details worth knowing, because all three were bugs once:

- Overlays are injected as children of `<html>`, which React owns on any App
  Router page. `ensureOverlays` installs a MutationObserver that re-attaches them
  if a render pass deletes them, and step 1 waits for hydration before scrolling
  so a remount cannot snap the page back to the top.
- Playwright starts recording when the page is created, so the first navigation
  is dead footage. The doc URL is warmed in a throwaway page first, which cuts
  it roughly in half; removing the rest would need an ffmpeg trim in post.
- A dev server serves markup before it serves behaviour. "The route responded"
  and "the chat works" are different claims: client chunks compile lazily, and
  API routes compile on their *first request* — which would otherwise be the
  prompt. `actions/page-ready.ts` waits for the document to finish, the DOM to
  stop changing, the input to be genuinely enabled, and `runtimeWarmPath` to be
  built, before any handler types anything. Without it a cold route produces a
  video of a prompt that was never really sent.

---

## Troubleshooting

**`Aborting before launching a browser`** — a service is down. The message names
which one and the command to start it. `--force` overrides.

**A page fails with `Agent run failed: "…"`** — the run reached the backend and
died there, and the quoted text is the backend's own message, lifted off
CopilotKit's error banner. Start from that, not from the recorder: it is the same
string the browser console shows. This shape of failure arrives in about a
second, because the banner is checked on every poll.

**A page fails with `Agent never started a run within 75s`** — nothing came back
at all: no run flag, no message, no error. Either the demo is genuinely dead, or
the message selector does not match this app's replies. `npm run doctor --online`
tells the two apart. If the page is one that renders its own chat, check it
passes a `messageSelector` — and that the selector is **plain CSS** (see ADAPT.md;
Playwright-only syntax cannot match here, and the recorder now says so by name).

**A page fails with `The run completed but produced nothing`** — the agent
answered, but nothing the handler was watching for appeared: the tool rendered no
card, the canvas stayed empty, the browser-side handler never fired. This is the
interesting failure, and usually a real one — the page looked fine and did
nothing.

**The IDE highlights the wrong lines** — the line range drifted. `npm run doctor`
names the file and where its markers actually are now. It cannot tell you the
range points at *uninteresting* code; only reading it can.

**A page fails only on the first run after starting the dev server** — it was
still compiling. The readiness gate absorbs this (it will log
`agent endpoint compiled in Ns` when it did real work), and the *agent's* cold
start is covered too: the start window is 75s, and 90s on the two thinking
routes, against a first-call cost of roughly 60s. Three routes mount a second
runtime of their own (`/api/copilotkit-voice`,
`/api/copilotkit-declarative-gen-ui`); their handlers warm it explicitly, because
`runtimeWarmPath` only covers the app-wide one.

**A control at the very bottom of the page does nothing** — the simulated taskbar
owns the bottom 48px and swallows pointer events. If the app pins its composer
there, nothing can be typed at all. `actions/taskbar-passthrough.ts` turns the bar
click-through for the duration of an interaction; `isUnderTaskbar()` says whether
a control needs it.

**A recording passes but the video is wrong** — the doctor cannot see cursor
placement or highlight correctness. Watch it.
