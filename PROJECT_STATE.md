# PROJECT_STATE.md

Current truth about this project. Updated at the start and end of any meaningful working session.

> Append-only history goes in `docs/journal/YYYY-MM.md`. Persistent rules go in `AGENTS.md` / `CLAUDE.md`.

## Last verified commit

`abef399` — feat: serve WellFi at /wellfi via Vercel rewrites

## Active task

**Portfolio cleanup workflow** per `MPS/docs/templates/portfolio-cleanup-prompt.md`. Bringing the repo into the standard MPS portfolio layout: rules-only top-level docs (`AGENTS.md`, `CLAUDE.md`, `PROJECT_STATE.md`), gitignore correctness, and a journal seed.

## Known blockers / open decisions

- **In-flight WIP** — 14 modified + 3 untracked files in the working tree are unrelated to this cleanup. They include `ChatWidget.tsx` (deletion in progress), `HeroUltimate.tsx` motion edits, the new `src/context/talkToUs.ts` extraction, and `.vercelignore` / `public/llms.txt` additions. Cleanup commits must stage cleanup-only paths to avoid sweeping those in.
- **`.claude/launch.json`** — currently tracked, contains a Vite Node-debug launch config. Doesn't really belong under `.claude/`. Kept as-is for now; flag for a future move to `.vscode/launch.json` (which would then become gitignored under the existing `.vscode/*` rule).
- **`.codex/config.toml`** — not present. The portfolio-cleanup prompt suggests scaffolding one with `model = "gpt-5.5"` / `reasoning_effort = "medium"`, but this project does not currently use Codex. Skip until Codex is actively used here.
- **`.agents/` (plural, untracked)** and **`.agent/` (singular, gitignored, ~60 unrelated Flutter/Lit/Dart skills)** are local-only cruft. Both proposed for deletion; awaiting sign-off.
- **`.claude/settings.local.json`** — was tracked, just untracked via `git rm --cached` and added to `.gitignore`. The file remains on disk for local use.

## Next action

1. Review the cleanup diff (`AGENTS.md`, `CLAUDE.md`, `PROJECT_STATE.md`, `.gitignore`, `.claude/settings.local.json` removal).
2. Receive Codex second opinion on the doc bodies and cruft list.
3. Approve staged commits in this order: (a) gitignore + settings untrack, (b) AGENTS.md + CLAUDE.md + PROJECT_STATE.md, (c) journal entry.
4. **Separately**, decide whether to land or shelve the in-flight WIP (CustomCursor removal, ChatWidget edits, talkToUs extraction).

## Recent context (rolling, not history)

- The 5 MPS subagents and 1 skill (`mps-booking-system`) are already at canonical `.claude/` paths and pass `npm run audit:agents` cleanly.
- The legacy stitch scaffold left behind 60+ unrelated Flutter/Lit/Dart skills under `.agent/skills/` (already gitignored). All 133 audit warnings come from this directory; deleting it would zero out audit noise.
- `vercel.json` contains the `/wellfi` rewrite (most recent commit). No Vercel CLI is installed locally — `vercel deploy`, `vercel env pull`, and `vercel logs` are unavailable from this session.

## Follow-up plans (out of scope for this cleanup pass)

These came out of the Codex second-opinion pass on the existing agent personas. They are not blockers for shipping the rules-doc cleanup. Each deserves its own change set when picked up:

1. **`.claude/agents/mps-design-reviewer.md`** — output spec is vague at lines 53–58 ("approximate location"). Tighten to demand exact `file:line` references like the accessibility/performance personas do.
2. **`.claude/agents/wix-headless-agent.md`** (152 lines) — doing too much. Split into:
   - The persona itself (decision rules, escalation, fallback strategy) — stays in `.claude/agents/`.
   - A dated Wix reference doc (account ID, plan tier, item limits, dollar amounts, dashboard navigation, planned CMS schemas) — move to `docs/wix-headless-reference.md` or similar. Volatile facts like the `$32/mo` Business plan price and the "OAuth blocked on Core plan" status do not belong in a persona file.
   - The SDK cookbook (snippets, query patterns) — move to a `mps-wix-sdk` skill at `.claude/skills/mps-wix-sdk/SKILL.md` so it's reusable by any agent without re-reading the persona.
3. **`.claude/launch.json`** — Vite Node-debug launch config does not belong under `.claude/`. Move to `.vscode/launch.json` (which is gitignored under the existing `.vscode/*` rule), or delete if no one is using it.
