# CLAUDE.md

Claude-specific guidance for this repo. Read alongside `AGENTS.md` (shared rules) and `PROJECT_STATE.md` (current status).

> **Rules-only.** No activity logs, no recent-changes lists. Append history to `docs/journal/YYYY-MM.md`.

## Read order at session start

1. `AGENTS.md` — shared project rules
2. `PROJECT_STATE.md` — current task, blockers, next action
3. `docs/journal/` — only the most recent month if the prior session was inconclusive
4. `.claude/agents/` — read the persona of any subagent before dispatching it

## Subagent dispatch routing

When a task fits one of these triggers, use the dedicated subagent rather than working solo:

| Trigger | Subagent |
|---|---|
| New section, replacement section, substantial UI change | `mps-section-builder` |
| Visual or UX review, premium-feel regression check | `mps-design-reviewer` |
| WCAG check, focus-trap audit, reduced-motion review | `mps-accessibility-reviewer` |
| GPU/render performance audit, listener churn, animation cost | `mps-performance-auditor` |
| Wix dashboard, CMS collections, Bookings, OAuth, headless SDK | `wix-headless-agent` |

Read the persona at `.claude/agents/<name>.md` before invoking — each one has explicit working rules and known gotchas.

## Skills in this repo

- `mps-booking-system` (`.claude/skills/mps-booking-system/SKILL.md`) — Supabase-backed automotive booking flow, OpenRouter chat widget. Reference this when touching `api/automotive-booking.ts`, `api/chat.ts`, `src/services/availabilityApi.ts`, or the `bookings` table.
- `mps-wix-sdk` (`.claude/skills/mps-wix-sdk/SKILL.md`) — SDK cookbook for the Wix headless integration: package installs, OAuth client init, querying CMS collections, querying Bookings services. Reference this when writing code that imports from `@wix/sdk`, `@wix/data`, `@wix/bookings`, `@wix/calendar`, or `@wix/redirects`. Decision rules for *whether* to use Wix at all live in the `wix-headless-agent` persona; volatile facts (plan tier, prices, dashboard URLs) live in `docs/wix-headless-reference.md`.

Do not load skill files with `Read` — invoke them through the `Skill` tool so the runtime resolves them correctly.

## Tooling preferences

- **File search** — use `Glob`, never `find` or `ls` for path lookups.
- **Content search** — use `Grep`, never `rg` or `grep` directly via Bash.
- **File reads** — use `Read`. Never `cat`, `head`, or `tail` via Bash.
- **Edits** — `Edit` for surgical changes, `Write` only for new files or full rewrites.
- **Concurrent independent work** — batch tool calls in a single message. The repo's audit, build, and lint scripts can run in parallel.

## Working tree etiquette

- **Stage specific paths.** WIP changes are common in this repo; `git add -A` will sweep them into your commit. Use `git add <path>` per file.
- **Untracked files starting with `.agents/`, `.agent/`, `output/`, or any `*.tsbuildinfo`** are gitignored. Do not try to add them.
- **`.claude/settings.local.json`** is per-user and gitignored. Local permission edits do not belong in commits.

## Performance guardrails (Claude-specific reminders)

The `mps-performance-auditor` persona has the full list. Three that have been violated by past Claude sessions:

1. **`backdrop-filter` budget**: 4–6 simultaneous max. Audit the visible viewport, not just the file you're editing.
2. **`useTransform` placement**: top of component, never inside JSX. The compiler will not catch this.
3. **`cursor: none`**: scope it to `body`, never `body *`.

## Session shutdown

- Update `PROJECT_STATE.md` with the new "Last verified commit" and "Next action" fields if your work changed them.
- If you completed a meaningful chunk of work that future agents should know about, append a dated entry to `docs/journal/<YYYY-MM>.md`.
- Do not edit prior journal entries.
