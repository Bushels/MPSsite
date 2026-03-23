---
name: wix-headless-agent
description: Specialized agent for Wix headless CMS integration, OAuth setup, SDK configuration, CMS collection management, and Wix Bookings. Use when working with Wix dashboard, creating CMS collections, configuring headless SDK, setting up OAuth apps, or integrating Wix Bookings into the React site.
---

# Wix Headless Agent

Manage all Wix headless integration for the MPS Group site — CMS collections, SDK setup, OAuth configuration, Bookings, and dashboard navigation.

## MPS Wix Account Context

- **Account**: kylegronning2 (Owner), Wix Studio
- **Site**: mps-group (Site ID: `d2a3c86a-3c4f-470f-9c71-7f9844ab5c5a`)
- **Current plan**: Core (PREMIUM) — upgrade to Business pending approval (see `docs/wix-upgrade-proposal.md`)
- **Domain**: mpsgroup.ca (published)
- **CMS status**: Empty — 0 collections, 0/4,000 items (awaiting Business plan)
- **Headless status**: Blocked until Business plan upgrade ($32/mo) unlocks OAuth settings

## Dashboard Navigation

| Page | URL Path |
|------|----------|
| Home | `/home` |
| CMS Collections | `/database` |
| Headless/OAuth Settings | `/oauth-apps-settings` (blocked on Core plan) |
| Developer Tools | `/developer-tools/logging-tools/wix-logs` |
| Settings | `/settings` |
| Apps | `/manage-installed-apps` |

Base URL: `https://manage.wix.com/dashboard/d2a3c86a-3c4f-470f-9c71-7f9844ab5c5a/`

## SDK Integration Pattern

### Required packages
```bash
npm install @wix/sdk @wix/data js-cookie
npm install -D @types/js-cookie
```

### For Bookings (automotive section)
```bash
npm install @wix/bookings @wix/calendar @wix/redirects
```

### Client initialization
```typescript
import { createClient, OAuthStrategy } from "@wix/sdk";
import { items } from "@wix/data";
import { services, availabilityCalendar } from "@wix/bookings";
import { redirects } from "@wix/redirects";

export const wixClient = createClient({
  modules: { items, services, availabilityCalendar, redirects },
  auth: OAuthStrategy({
    clientId: import.meta.env.VITE_WIX_CLIENT_ID,
  }),
});
```

### Querying CMS collections
```typescript
const { items: results } = await wixClient.items
  .query('Services')
  .ascending('orderId')
  .find();
```

### Querying bookings services
```typescript
const { items: bookingServices } = await wixClient.services
  .queryServices()
  .find();
```

## Planned CMS Collection Schemas (not yet created — awaiting Business plan)

### SiteSettings (single-item)
Global site content: company name, tagline, contact info (phone, fax, email, addresses), coordinates, acreage, established year, copyright year.

### Services (7 items)
Service cards: title, subtitle, description, statValue, statLabel, visualKey (maps to React component), orderId.

### Clients (6 items)
Partner logos: name, logoUrl, size ("lg"/"md"), orderId.

### Stats (3 items)
Animated counters: value, decimals, suffix, label, sublabel, orderId.

### Certifications (4 items)
Shared between AboutMPS and Certifications sections: shortName, fullName, description, logoUrl, orderId.

### CompanyValues (4 items)
Value pillars: title, description, iconKey (maps to SVG), orderId.

### AboutContent (single-item)
About section: sectionTitle, introText (rich text), storyText (rich text).

## Authentication Strategies

| Strategy | Use for | Package |
|----------|---------|---------|
| OAuthStrategy | Client-side (visitor/member access) | `@wix/sdk` |
| ApiKeyStrategy | Server-side (admin operations) | `@wix/sdk` |

For the MPS site, use **OAuthStrategy** since the React app runs client-side on Vercel.

## Known Gotchas

1. **Core plan blocks headless settings** — `/oauth-apps-settings` returns "You can't access this page" on Core plan. Need Business plan ($32/mo).
2. **CMS item limit** — Core plan: 4,000 items. Business plan: higher limits.
3. **Collection permissions** — Must set collection permissions to allow read access for visitors (not just admin).
4. **V1 vs V2 APIs** — Wix is transitioning to V2. Use V2 APIs (`@wix/bookings` not `wix-bookings-backend`).
5. **CORS** — OAuth tokens handle CORS. No manual CORS configuration needed.
6. **Session cookies** — Use `js-cookie` to persist visitor tokens across page refreshes.
7. **Wix Bookings requires Business plan** for accepting live payments.

## Wix Bookings Integration (Automotive Section)

The automotive section handles appointment-based services. Wix Bookings can manage:
- Service catalog (oil changes, inspections, etc.)
- Staff/bay availability calendars
- Online booking from the React site
- Calendar sync (Google Calendar, Outlook)
- Automated confirmations and reminders

### Implementation flow
1. Enable Bookings in Wix dashboard (Apps section)
2. Create services and set availability
3. Use `@wix/bookings` SDK to fetch services and availability
4. Build custom booking UI in React
5. Redirect to Wix checkout for payment, or use eCommerce SDK for custom checkout

## Fallback Strategy

The MPS site must never break if Wix is unreachable:
- Every hook returns hardcoded defaults on error/timeout
- Data fetched once on app mount via CMSProvider context
- Optional localStorage caching with stale-while-revalidate

## Delivery sequencing

- Do not block an MVP launch on Wix plan upgrades when the immediate need is intake capture.
- For new booking flows, prefer shipping the UI first with a lightweight Vercel Function or webhook handoff.
- Move to Wix Bookings only when OAuth, service setup, and operational ownership are ready.

## References

- [Wix Headless Docs](https://dev.wix.com/docs/go-headless)
- [Data Quick Start](https://dev.wix.com/docs/go-headless/tutorials-templates/java-script-sdk-tutorials/data-quick-start)
- [Bookings Quick Start](https://dev.wix.com/docs/go-headless/tutorials-templates/java-script-sdk-tutorials/bookings-quick-start)
- [SDK React](https://dev.wix.com/docs/sdk/core-modules/sdk-react/introduction)
- [Self-Managed Setup](https://dev.wix.com/docs/go-headless/getting-started/setup/general-setup/overview)
