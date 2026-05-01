# PROJECT_STATE.md

Current truth about this project. Updated at the start and end of any meaningful working session.

> Append-only history goes in `docs/journal/YYYY-MM.md`. Persistent rules go in `AGENTS.md` / `CLAUDE.md`.

## Last verified commit

`f55ef8d` — refactor(wix): split persona, reference, and SDK skill

## Active task

**No active task.** The two-round portfolio cleanup is complete; ready to move on to the next piece of work. WIP changes in the working tree are unrelated and unowned by this cleanup.

## Known blockers / open decisions

- **In-flight WIP** — 14 modified + 3 untracked files in the working tree are unrelated to the cleanup work. They include `ChatWidget.tsx` (deletion in progress), `HeroUltimate.tsx` motion edits, the new `src/context/talkToUs.ts` extraction, and `.vercelignore` / `public/llms.txt` additions. These were never touched by cleanup commits; landing or shelving them is the next decision.
- **`.codex/config.toml`** — still not scaffolded. The portfolio-cleanup prompt suggests scaffolding one with `model = "gpt-5.5"` / `reasoning_effort = "medium"` when the project actively uses Codex. Skip until that point.

## Next action

1. **Decide what to do about the in-flight WIP.** Options: stage and commit (probably as several focused commits); reset the affected files back to HEAD; or leave them open for the next session.
2. **Pick the next feature/task.** Cleanup is closed out; future agents starting here should read `AGENTS.md`, this file, and the most recent journal month, then pick up from whatever the user names.

## Recent context (rolling, not history)

- The 5 MPS subagents and 1 skill (`mps-booking-system`) are already at canonical `.claude/` paths and pass `npm run audit:agents` cleanly.
- The legacy stitch scaffold left behind 60+ unrelated Flutter/Lit/Dart skills under `.agent/skills/` (already gitignored). All 133 audit warnings come from this directory; deleting it would zero out audit noise.
- `vercel.json` contains the `/wellfi` rewrite (most recent commit). No Vercel CLI is installed locally — `vercel deploy`, `vercel env pull`, and `vercel logs` are unavailable from this session.

## Follow-up plans

All six follow-ups from the 2026-05-01 Codex second-opinion pass have been landed in the 2026-05-01 (continued) round:

1. ~~`scripts/audit-agent-files.mjs` default targets~~ — fixed in `08cf597`. Surfaced a latent bug: `.claude/skills/mps-booking-system/SKILL.md` was missing YAML frontmatter (also fixed in the same commit).
2. ~~`mps-design-reviewer.md` output spec~~ — tightened in `e1a656f`. Now demands `file:line` and forbids "approximate location" phrasing. Spacing and motion rules made concrete with token references.
3. ~~`wix-headless-agent.md` over-stuffing~~ — split into persona + `docs/wix-headless-reference.md` + `.claude/skills/mps-wix-sdk/SKILL.md` in `f55ef8d`.
4. ~~`.claude/launch.json` placement~~ — moved to `.vscode/launch.json` (gitignored under `.vscode/*` rule) in `08cf597`.
5. **`.codex/config.toml`** — still deferred. Skip until Codex becomes a regular collaborator on this repo.
6. ~~CRLF/LF consistency~~ — `.gitattributes` added in `08cf597` enforcing `text=auto eol=lf`. Deliberate decision NOT to run `git add --renormalize .` in the same change set; that's a separate, larger commit if desired.

The audit baseline is now **0 errors, 0 warnings** for the first time since the audit script was introduced.
