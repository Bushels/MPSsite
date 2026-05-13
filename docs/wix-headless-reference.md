# Wix Headless Reference

> **Last verified:** 2026-05-01. The facts in this document — plan tier, item limits, prices, dashboard URLs — are time-sensitive. Re-verify against the Wix dashboard before quoting any of them externally or making a purchase decision.

Volatile reference data for the MPS Group Wix headless integration. The decision-making rules live in [`.claude/agents/wix-headless-agent.md`](../.claude/agents/wix-headless-agent.md). The SDK code patterns live in [`.claude/skills/mps-wix-sdk/SKILL.md`](../.claude/skills/mps-wix-sdk/SKILL.md).

## Current architecture boundary

- `mpsgroup.energy` is the canonical public website and should remain the Vercel-hosted React site.
- Wix is optional backend plumbing for CMS, Bookings, OAuth, or CRM workflows; it is not the public website builder for the canonical site.
- `mpsgroup.ca` is legacy until redirected or retired.
- Porkbun can remain registrar/DNS owner for `mpsgroup.energy`; point its DNS records to Vercel when domain work resumes. Do not point the canonical public site to Wix unless a specific Wix feature justifies changing the architecture.

## Account context

- **Account**: kylegronning2 (Owner), Wix Studio
- **Site**: mps-group
- **Site ID**: `d2a3c86a-3c4f-470f-9c71-7f9844ab5c5a`
- **Domain**: mpsgroup.ca (published)
- **Current plan**: Core (PREMIUM)
- **Pending upgrade**: Business plan (~$32/mo as of 2026-05). See [`docs/wix-upgrade-proposal.md`](./wix-upgrade-proposal.md) for the rationale.
- **CMS status**: Empty — 0 collections, 0/4,000 items (awaiting Business plan)
- **Headless status**: Blocked until the Business plan upgrade unlocks OAuth settings

## Dashboard navigation

Base URL: `https://manage.wix.com/dashboard/d2a3c86a-3c4f-470f-9c71-7f9844ab5c5a/`

| Page | URL Path | Notes |
|------|----------|-------|
| Home | `/home` | |
| CMS Collections | `/database` | |
| Headless / OAuth Settings | `/oauth-apps-settings` | Returns "You can't access this page" on Core plan |
| Developer Tools | `/developer-tools/logging-tools/wix-logs` | |
| Settings | `/settings` | |
| Apps | `/manage-installed-apps` | |

## Plan-tier constraints

| Constraint | Core (current) | Business (pending) |
|---|---|---|
| OAuth headless apps | Blocked | Unlocked |
| CMS collection items | 4,000 max | Higher (verify in dashboard) |
| Wix Bookings live payments | Not available | Available |

## Planned CMS collection schemas

These are the seven collections planned for the Business-plan rollout. None are created yet. Item counts here are MPS's intent, not Wix limits.

### `SiteSettings` (single-item)
Global site content: company name, tagline, contact info (phone, fax, email, addresses), coordinates, acreage, established year, copyright year.

### `Services` (7 items)
Service cards: title, subtitle, description, statValue, statLabel, visualKey (maps to React component), orderId.

### `Clients` (6 items)
Partner logos: name, logoUrl, size (`"lg"` / `"md"`), orderId.

### `Stats` (3 items)
Animated counters: value, decimals, suffix, label, sublabel, orderId.

### `Certifications` (4 items)
Shared between AboutMPS and Certifications sections: shortName, fullName, description, logoUrl, orderId.

### `CompanyValues` (4 items)
Value pillars: title, description, iconKey (maps to SVG), orderId.

### `AboutContent` (single-item)
About section: sectionTitle, introText (rich text), storyText (rich text).

## Update protocol

When facts in this document change:

1. Update the value here.
2. Bump the **Last verified** date at the top.
3. If the change affects a decision rule (e.g. plan upgrade lands), also update the persona at `.claude/agents/wix-headless-agent.md`.
4. If the change is in dashboard URLs or behaviour, also update the navigation table in this file.

Do not embed these facts in the persona file or in the SDK skill — they belong here so the rate-of-change profiles stay separate.
