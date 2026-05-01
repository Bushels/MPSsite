# AGENTS.md

Rules for any agent (Claude, Codex, or otherwise) working on the MPS Group corporate website.

> This file is **rules-only**. It does not record activity, recent changes, or session notes — those belong in `docs/journal/YYYY-MM.md`. Current task state lives in `PROJECT_STATE.md`.

## Project context

- **What this is** — Marketing site for **MPS Group**, an industrial-fabrication and oilfield-services company in Pierceland, Saskatchewan.
- **Brand line** — *"We make heavy oil flow."* The "FLOW" theme is intentional, not arbitrary.
- **Stack** — React 18, Vite 5, TypeScript 5, Framer Motion 11, CSS Modules, Lenis (smooth scroll). Pure SPA. No Next.js, no SSR.
- **Hosting** — Vercel. Routes are configured in `vercel.json` (rewrites only, no functions yet beyond `/api/automotive-booking` and `/api/chat`).
- **Backend touchpoints** — Supabase (free tier) for the automotive-bookings table, Resend for confirmation emails, OpenRouter for the chat widget. Wix headless is planned for CMS but blocked on a plan upgrade.

## Repository layout (project-specific paths)

| Path | Purpose |
|---|---|
| `.claude/agents/*.md` | Project-specific subagent personas. Five agents: design, accessibility, performance, section-builder, Wix. |
| `.claude/skills/<name>/SKILL.md` | Project-specific skills (currently: `mps-booking-system`). |
| `src/sections/` | Top-level page sections (Hero, Services, etc.). One file per section. |
| `src/components/` | Reusable UI primitives. |
| `src/styles/variables.css` | The single source of truth for design tokens. |
| `src/styles/global.css` | Global resets and base styles. |
| `src/hooks/useDeviceCapability.ts` | Performance tiering (high / medium / low). Required for any GPU-heavy effect. |
| `scripts/audit-agent-files.mjs` | Frontmatter audit for `.claude/agents/` and `.claude/skills/`. Run via `npm run audit:agents`. |
| `docs/plans/` | Design documents. Append-only — do not edit prior plans. |
| `docs/journal/YYYY-MM.md` | Append-only history of cleanup, refactors, and major work. |
| `PROJECT_STATE.md` | Current status: last verified commit, active task, blockers, next action. |

## Working rules

### Discovery before writing
1. Before adding a section, **grep for similar existing content first**. Certifications and the FLOW theme were duplicated across sections in the past because a builder skipped this check.
2. Before introducing a new abstraction, look for an existing primitive (`LiteCard`, `MagneticElement`, `fadeUpBlur`, etc.). Reuse over invent.
3. Read `src/styles/variables.css` before adding colors, font sizes, or spacing values.

### Performance constraints (non-negotiable)
1. **Maximum 4–6 simultaneous `backdrop-filter` elements** on screen. More than this tanks GPU on mid-tier devices. The piano-keys regression (~14 simultaneous) is the cautionary tale.
2. **`useTransform` and other Framer Motion hooks must be at the top level of a component.** Calling them inside JSX is a hooks-rules violation that React will not catch at compile time.
3. **`cursor: none` belongs on `body` only**, never on `body *`. The latter breaks every interactive element.
4. **Reduced-motion users**: every animation must short-circuit when `prefers-reduced-motion: reduce` is set. Use the existing helpers, not ad-hoc media queries.
5. **Device capability gating**: heavy effects (parallax, particles, complex SVG filters) must check `useDeviceCapability()` and degrade on `low`.

### Accessibility constraints (non-negotiable)
1. **Every modal needs a focus trap.** The reference pattern is in `src/sections/ServicesPrecision.tsx` — search for `focusable`. `LegalModal` and `TalkToUsWizard` already follow it.
2. **Heading hierarchy** must remain valid (no skipped levels) on every page.
3. **WCAG 2.1 AA contrast** is the minimum bar.
4. **Touch targets** are 44×44 px minimum, including hit-area padding.

### Project-specific personas (read as checklists)
The persona files in `.claude/agents/` encode past regressions and project-specific gotchas. Read them as checklists before working in the area they cover, regardless of whether you delegate the work to a subagent or do it yourself:

- **mps-section-builder** — new sections / replacement sections / substantial UI changes
- **mps-design-reviewer** — visual quality, hierarchy, premium-feel regressions
- **mps-accessibility-reviewer** — WCAG, focus traps, reduced motion, ARIA
- **mps-performance-auditor** — GPU effects, listener churn, render churn, bundle weight
- **wix-headless-agent** — Wix CMS, OAuth, Bookings, anything in the Wix dashboard

If you are Claude and the task fits one of these triggers, prefer dispatching the dedicated subagent. If you are Codex (or any other agent without subagent dispatch), treat the persona file as a hard checklist for your own work.

### Build, lint, audit
- `npm run dev` — local dev server (Vite, port 5173)
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint
- `npm run audit:agents` — repo metadata validation: confirms every `.claude/agents/*.md` and `.claude/skills/*/SKILL.md` has the right frontmatter shape (kebab-case names, descriptions with explicit "use when" triggers, body length, etc.)

### Verification contract (after any change)

| Change touches … | Verification before claiming done |
|---|---|
| `src/sections/` or `src/components/` (UI) | `npm run build` + load the route in the browser, confirm no regressions in the visible viewport |
| `src/styles/` (tokens, global) | `npm run build` + check at least one section that uses the affected token |
| `.claude/agents/*.md` or `.claude/skills/*/SKILL.md` | `npm run audit:agents` must exit 0 with no new warnings on the touched file |
| `api/*.ts` (Vercel functions) | `npm run build` + cross-reference the relevant skill (`mps-booking-system` for bookings/chat) |
| `vercel.json`, `.vercelignore` | Inspect built `dist/` is unaffected; production deploy preview if available |
| `index.html`, `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt` | Manual diff review — these are SEO surface area, not testable by build alone |

### Code conventions

- **TypeScript** — `strict: true` is set in `tsconfig.app.json`. Do not opt out of strictness with `any` casts; prefer narrowing or `unknown`.
- **Imports** — group order: (1) external packages, (2) `~/`-rooted internal, (3) relative `./`. Blank line between groups.
- **CSS Modules** — file-per-component, kebab-case selectors, never global. Tokens come from `variables.css`.
- **Environment variables** — browser-shipped values use the `VITE_` prefix; server-only values must NOT have `VITE_`. The `mps-booking-system` skill enumerates the canonical names.
- **Filenames** — components in `PascalCase.tsx`, hooks in `useCamelCase.ts`, services in `camelCase.ts`.

### Codex / Claude shared workflow

- **Read before editing.** Every file you touch must be read in this session first; the cache between sessions is not your friend on a repo with active WIP.
- **Preserve the dirty worktree.** This repo regularly has 10+ modified files in flight. Stage specific paths (`git add src/foo.ts` not `git add -A`) so your commits do not absorb unrelated edits.
- **Stage cleanup separately.** Cleanup commits (rules docs, gitignore, persona/skill updates) should never share a commit with feature work.
- **Use `apply_patch` style edits** when available — surgical hunks are easier to review than full file rewrites.
- **Run focused verification.** The Verification Contract above tells you which command matters per change type. Don't run all of them blindly.
- **Report blocked tests honestly.** If `npm run build` fails for a reason unrelated to your change (e.g., the WIP `talkToUs.ts` extraction has a transient type error), say so explicitly rather than skipping verification.

## What goes where

| Need to record … | Goes in |
|---|---|
| A persistent rule for future agents | `AGENTS.md` (this file) or `CLAUDE.md` for Claude-specific addenda |
| Current task / blocker / last commit | `PROJECT_STATE.md` |
| One-time history of a cleanup or migration | `docs/journal/YYYY-MM.md` |
| A design plan with diagrams and decisions | `docs/plans/YYYY-MM-DD-<slug>.md` |
| A reusable agent capability | `.claude/skills/<name>/SKILL.md` |
| A reusable agent persona | `.claude/agents/<name>.md` |

## Don't

- **Don't add activity logs to this file.** Use `docs/journal/`.
- **Don't write to `~/.claude/skills/`** (global) without explicit approval.
- **Don't `git add -A`** in this repo while WIP is in flight — stage specific paths to avoid sweeping in unrelated edits.
- **Don't skip `npm run audit:agents`** after editing anything under `.claude/agents/` or `.claude/skills/`.
- **Don't introduce a new design token** (color, spacing, font-size) without checking `variables.css` first.

## References

- `PROJECT_STATE.md` — current status
- `docs/plans/` — design plans
- `docs/journal/` — append-only history
- `.claude/agents/` — subagent personas
- `.claude/skills/` — project skills
