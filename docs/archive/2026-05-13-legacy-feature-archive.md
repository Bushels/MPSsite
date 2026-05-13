# 2026-05-13 Legacy Feature Archive

Status: archived / disabled to prevent regression

## Public-site boundary

- Canonical public site: `https://mpsgroup.energy/`
- Hosting model: Vercel-hosted React site
- Legacy/Wix domain: `mpsgroup.ca`
- Wix role: optional backend plumbing for CMS, Bookings, OAuth, or CRM only
- DNS preference: keep Porkbun as registrar/DNS owner for `mpsgroup.energy`, then point DNS records to Vercel when domain work resumes

## Archived or parked surfaces

### Automotive-first chat

- Previous behavior: floating chat widget and `/api/chat` acted like an automotive assistant with stale service/pricing assumptions.
- Current behavior: `/api/chat` returns `410` until the approved site guide is designed.
- Regression rule: do not re-enable the old chat as-is. The next AI feature must be a site guide grounded in approved MPS site content.

### Automotive as homepage identity

- Previous risk: automotive booking and service copy could read as a primary MPS business line.
- Current rule: automotive is a side flow, not homepage identity or SEO focus.
- Regression rule: automotive can remain available, but should not drive metadata, hero copy, primary nav, or future AI guide routing.

### Pipe Vault / yard storage

- Previous risk: Pipe Storage / Pipe Vault could read as an active service line.
- Current rule: future concept only.
- Regression rule: do not present Pipe Vault, yard storage, or pipe storage as an operating public service until Kyle approves that business line.

### Broad downhole catalog language

- Previous risk: copy could imply MPS already has a mature downhole division.
- Current rule: WellFi is the first public downhole technology product; future sand-control and flow-control work is emerging.
- Regression rule: no broad product-catalog claims for sand control or flow control until those offerings exist.

### Custom cursor / magnetic interaction layer

- Previous risk: custom cursor and broad magnetic effects added interaction friction and performance risk.
- Current behavior: custom cursor files are removed; magnetic wrapper is neutralized.
- Regression rule: do not restore cursor-hiding or global magnetic behavior without a design/performance review.

## Branding note

- Retired temporary hero line: `Surface facilities. WellFi downhole technology.`
- Retired interim line: `We make heavy oil flow.`
- Current preferred public line: `Surface fabrication. Downhole innovation.`

`Surface fabrication. Downhole innovation.` is the current preferred hero motto because it is sharper, more marketable, and clearly carries both the established surface-facilities business and the emerging WellFi/downhole direction.
