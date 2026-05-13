# PROJECT_STATE.md

Current truth about this project. Updated at the start and end of any meaningful working session.

> Append-only history goes in `docs/journal/YYYY-MM.md`. Persistent rules go in `AGENTS.md` / `CLAUDE.md`.

## Last verified release

- Production deploy: `https://mps-group-cff8kxlj8-kyles-projects-d3ab6818.vercel.app`
- Canonical URL: `https://mpsgroup.energy/`
- Verification date: 2026-05-13
- Previous committed baseline: `f55ef8d` - refactor(wix): split persona, reference, and SDK skill

## Active task

**MPS public-site audit wrap-up.** The current production site is aligned around Surface Facilities first, WellFi/downhole as emerging, and the restored hero motto `Surface fabrication. Downhole innovation.` Tracking plan: `docs/plans/2026-05-13-site-audit-improvement-plan.md`.

## Known blockers / open decisions

- **Legacy domain ownership** - `mpsgroup.ca` and `www.mpsgroup.ca` still resolve to Wix. Vercel config includes redirects, but they cannot apply until those hosts point at the Vercel project or are redirected at the registrar/Wix layer.
- **Service taxonomy correction** - Surface Facilities is the primary public identity; WellFi/downhole is emerging; Pipe Vault / yard storage is a future concept; automotive is separate.
- **Wix architecture boundary** - Wix is optional backend plumbing only. `mpsgroup.energy` should stay on Vercel unless a specific Wix feature justifies changing the architecture.

## Next action

1. **Review WellFi production route.** Confirm `/wellfi` copy, metadata, route behavior, and stale claims.
2. **Decide legacy-domain handling later.** Keep Porkbun as registrar/DNS owner for `mpsgroup.energy` and point DNS to Vercel when ready; redirect `mpsgroup.ca` from Wix/registrar to `https://mpsgroup.energy/`.
3. **Prepare the AI guide content map.** Use approved site sections only, then wire lead/email handoff.

## Recent context (rolling, not history)

- The 5 MPS subagents and 1 skill (`mps-booking-system`) are already at canonical `.claude/` paths and pass `npm run audit:agents` cleanly.
- The current site-audit plan uses the MPS agents as checklists: section-builder for UI edits, design/accessibility/performance reviewers for regression passes, booking-system only for automotive/chat files, and Wix only for optional backend plumbing.
- 2026-05-13 local patch: homepage metadata, JSON-LD, `llms.txt`, Services section, hero descriptor, About copy, nav label, inquiry routing, and `/api/chat` are aligned to Surface Facilities first and WellFi as emerging downhole technology. `npm run lint` and `npm run build` pass.
- 2026-05-13 production deploy: deployment `https://mps-group-cff8kxlj8-kyles-projects-d3ab6818.vercel.app` is live on `https://mpsgroup.energy/`. Live checks passed for homepage title/canonical/OG URL/description, `robots.txt`, `sitemap.xml`, `llms.txt`, and the restored hero motto.
- 2026-05-13 wrap-up: archived old chat/automotive/Pipe Vault/custom-cursor behavior in `docs/archive/2026-05-13-legacy-feature-archive.md`; tightened Wix agent/skill boundary; restored hero motto to `Surface fabrication. Downhole innovation.`
- The legacy stitch scaffold left behind 60+ unrelated Flutter/Lit/Dart skills under `.agent/skills/` (already gitignored). All 133 audit warnings come from this directory; deleting it would zero out audit noise.
- `vercel.json` contains the `/wellfi` rewrite. Vercel CLI is available through `npx vercel` in this environment.

## Follow-up plans

All six follow-ups from the 2026-05-01 Codex second-opinion pass have been landed in the 2026-05-01 (continued) round:

1. ~~`scripts/audit-agent-files.mjs` default targets~~ — fixed in `08cf597`. Surfaced a latent bug: `.claude/skills/mps-booking-system/SKILL.md` was missing YAML frontmatter (also fixed in the same commit).
2. ~~`mps-design-reviewer.md` output spec~~ — tightened in `e1a656f`. Now demands `file:line` and forbids "approximate location" phrasing. Spacing and motion rules made concrete with token references.
3. ~~`wix-headless-agent.md` over-stuffing~~ — split into persona + `docs/wix-headless-reference.md` + `.claude/skills/mps-wix-sdk/SKILL.md` in `f55ef8d`.
4. ~~`.claude/launch.json` placement~~ — moved to `.vscode/launch.json` (gitignored under `.vscode/*` rule) in `08cf597`.
5. **`.codex/config.toml`** — still deferred. Skip until Codex becomes a regular collaborator on this repo.
6. ~~CRLF/LF consistency~~ — `.gitattributes` added in `08cf597` enforcing `text=auto eol=lf`. Deliberate decision NOT to run `git add --renormalize .` in the same change set; that's a separate, larger commit if desired.

The audit baseline is now **0 errors, 0 warnings** for the first time since the audit script was introduced.
