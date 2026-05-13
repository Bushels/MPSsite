# MPS Site Audit Improvement Plan

Date: 2026-05-13
Status: Phase 1/2 deployed and committed; WellFi route review pending

## Purpose

Audit and improve `mpsgroup.energy` before building the AI site guide.

The priority is to make the public site match the real MPS business:

- Canonical public domain: `https://mpsgroup.energy/`
- Primary business: heavy-oil and SAGD surface facilities, fabrication, piping, supports, mechanical execution, and QC turnover
- Emerging business: WellFi and future downhole technology
- Future concept: Pipe Vault / yard storage
- Side flow: automotive
- Public brand line: `We make heavy oil flow.`

## Evidence Sources

- `C:\Users\kyle\MPS Welding Inc\MPS Group - Bid`
- `C:\Users\kyle\MPS\mps-corporate-site`
- `C:\Users\kyle\MPS\wellfi-marketing\site`
- Live production checks for `https://mpsgroup.energy/`

## Accepted Service Model

### Surface Facilities

This is the main MPS public identity.

Use language around:

- SAGD and heavy-oil surface facilities
- CPF / ORF / plant modification work
- PSV discharge, produced-water, pump, and re-rate packages
- Piping, structural steel, pipe supports, pipe shoes, clamps, racks, and spool work
- Field/shop execution, QC, turnover, MTRs, NDE, traceability, and as-built packages

### Fabrication and Plant Execution

Treat this as a capability layer under Surface Facilities, not a competing division.

Use it to explain how MPS executes the work:

- shop fabrication
- field installation support
- structural and piping packages
- mechanical packages
- support steel and pipe-support fabrication

### WellFi / Downhole Technology

Treat this as emerging.

Approved framing:

- WellFi is the first public downhole technology product.
- MPS is building from WellFi into future sand-control and flow-control opportunities.

Do not imply:

- a mature downhole division
- a broad current sand-control product catalog
- a broad current flow-control product catalog

### Pipe Vault / Yard Storage

Treat this as parked for now.

Allowed framing:

- future yard/storage concept
- possible future revenue stream

Do not present it as:

- an active service line
- a proven product
- a major current MPS division

### Automotive

Treat this as a separate side flow.

It can remain available, but it should not drive homepage positioning, site metadata, or the future AI guide's primary routing.

## Branding Decision

- Current public line: `We make heavy oil flow.`
- Older line found during cleanup: `Surface fabrication. Downhole innovation.`
- Retired temporary line: `Surface facilities. WellFi downhole technology.`

Use `We make heavy oil flow.` as the primary brand/motto because it is marketable, operationally true, and broad enough for surface facilities plus emerging WellFi/downhole work. Use service copy and metadata to carry the specific information.

## Guardrails

- No pricing promises.
- No engineering design advice.
- No safety or compliance claims beyond approved company copy.
- No invented certifications, capacities, customer names, or job outcomes.
- No claim that Pipe Vault is already operating as a productized service.
- No claim that sand control or flow control are mature current product lines.
- Keep public copy tied to site content, bid-folder evidence, or approved company facts.

## Improvement Backlog

### Phase 1 - Canonical and Discovery Surface

- Confirm `index.html` canonical, Open Graph, Twitter, and JSON-LD point to `https://mpsgroup.energy/`.
- Confirm `public/robots.txt` points to `https://mpsgroup.energy/sitemap.xml`.
- Confirm `public/sitemap.xml` lists canonical `mpsgroup.energy` URLs only.
- Confirm `public/llms.txt` exists and reflects the corrected service model.
- Confirm `vercel.json` redirects old domains to `mpsgroup.energy`.
- Build, deploy, and verify live metadata.

### Phase 2 - Public Service Taxonomy

- Rewrite service cards and supporting copy so Surface Facilities leads.
- Demote or remove Pipe Storage / Pipe Vault as an active service.
- Reframe Downhole Tools as WellFi / Downhole Technology.
- Update contact and inquiry routing to match the accepted service model.
- Update JSON-LD service lists and AI-readable copy to match the page.

### Phase 3 - Visible UX Polish

- Fix mobile hero service-label compression around the FLOW hero.
- Review the WellFi route for stale or overbroad claims.
- Decide whether the old automotive chat widget is removed, disabled, or rewritten before any AI guide work.
- Browser-check desktop and mobile after visual changes.

### Phase 4 - AI Site Guide Prep

- Build a content map from approved site sections only.
- Define allowed answer boundaries and fallback handoff language.
- Route visitors to Surface Facilities, WellFi, Careers, Automotive, or General Contact.
- Wire email/lead handoff only after the content map is stable.

## Agent and Skill Routing

Use these repo-local agents as checklists or subagents when the work fits:

- `mps-section-builder`: service-section rewrites, new sections, major React/CSS changes.
- `mps-design-reviewer`: visual hierarchy, spacing, mobile polish, content structure.
- `mps-accessibility-reviewer`: headings, focus, ARIA, reduced motion, touch targets.
- `mps-performance-auditor`: animation, filters, listeners, GPU risk, bundle risk.
- `mps-booking-system`: only for automotive booking/chat files.
- `wix-headless-agent` / `mps-wix-sdk`: only if Wix CMS, OAuth, Bookings, or CRM plumbing becomes relevant. Do not use these to move the public React site into Wix.

Current agent/skill status:

- Active: `mps-section-builder`, `mps-design-reviewer`, `mps-accessibility-reviewer`, `mps-performance-auditor`.
- Active but narrow: `mps-booking-system` for automotive booking/chat only.
- Active but optional-backend only: `wix-headless-agent`, `mps-wix-sdk`.
- Deprecated behavior: old automotive-first chat assistant. See `docs/archive/2026-05-13-legacy-feature-archive.md`.

Gemini CLI should be used narrowly:

- Genuine upgrade: independent public-copy critique, screenshot-based page critique, competitive positioning pass.
- Nice-to-have: second opinion on content hierarchy after local implementation.
- Token burn: broad repo audit or vague "look through everything" tasks.

## Regression Gates

Before claiming this phase is done:

- `git status --short`
- focused diff review of changed files
- `npm run lint`
- `npm run build`
- browser check on desktop and mobile
- live verification after deploy:
  - `https://mpsgroup.energy/`
  - `https://mpsgroup.energy/robots.txt`
  - `https://mpsgroup.energy/sitemap.xml`
  - `https://mpsgroup.energy/llms.txt`

## Tracking Rules

- This file is the active checklist for the site-audit phase.
- `PROJECT_STATE.md` records current task, blockers, and next action.
- `docs/journal/2026-05.md` records meaningful session history after work is done.
- Do not put ongoing activity notes in `AGENTS.md`.
- Do not edit old plan docs; append new plans when scope changes.
