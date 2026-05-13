---
name: mps-wix-sdk
description: SDK cookbook for the MPS Group Wix headless integration — package install commands, client init with OAuth, querying CMS collections, querying bookings services, and Wix Bookings integration patterns. Use when writing or modifying code that imports from @wix/sdk, @wix/data, @wix/bookings, @wix/calendar, or @wix/redirects, or when building the automotive booking UI on top of Wix Bookings.
---

# MPS Wix SDK Cookbook

Code-level patterns for working with the Wix headless SDK in the MPS Group site. Decision rules and escalation live in `.claude/agents/wix-headless-agent.md`. Account context, plan tier, and dashboard URLs live in `docs/wix-headless-reference.md`.

## Scope boundary

This skill is for SDK plumbing only. Do not use it as justification to move the canonical `mpsgroup.energy` public site into Wix. The React site remains the public surface; Wix is optional CMS, Bookings, OAuth, or CRM infrastructure when those features justify it.

## Required packages

### Core SDK + CMS
```bash
npm install @wix/sdk @wix/data js-cookie
npm install -D @types/js-cookie
```

### Bookings (automotive section)
```bash
npm install @wix/bookings @wix/calendar @wix/redirects
```

## Client initialization

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

## Querying CMS collections

```typescript
const { items: results } = await wixClient.items
  .query('Services')
  .ascending('orderId')
  .find();
```

Collection schemas are defined in `docs/wix-headless-reference.md`. Always reference the schema doc rather than guessing field names.

## Querying bookings services

```typescript
const { items: bookingServices } = await wixClient.services
  .queryServices()
  .find();
```

## Authentication strategies

| Strategy | Use for | Package |
|----------|---------|---------|
| `OAuthStrategy` | Client-side (visitor / member access) | `@wix/sdk` |
| `ApiKeyStrategy` | Server-side (admin operations) | `@wix/sdk` |

For the MPS site: use **`OAuthStrategy`**. The React app runs client-side on Vercel; admin operations are not part of the current scope.

## Wix Bookings integration (automotive section)

Wix Bookings can manage:
- Service catalog (oil changes, inspections, etc.)
- Staff / bay availability calendars
- Online booking from the React site
- Calendar sync (Google Calendar, Outlook)
- Automated confirmations and reminders

### Implementation flow
1. Enable Bookings in the Wix dashboard (Apps section).
2. Create services and set availability.
3. Use `@wix/bookings` SDK to fetch services and availability.
4. Build the custom booking UI in React.
5. Redirect to Wix checkout for payment, or use the eCommerce SDK for custom checkout.

### Today's reality
The active automotive booking system is not on Wix — it uses Supabase + Resend + a Vercel Function. See the `mps-booking-system` skill for that flow. This SDK skill is the path forward when the Business plan unlocks OAuth and Wix Bookings becomes preferable.

## Common SDK gotchas

1. **V1 vs V2 APIs** — Wix is transitioning to V2. Use V2 packages (`@wix/bookings` not `wix-bookings-backend`). Anything documented under the legacy `wix-*-backend` namespace is not the right path.
2. **CORS** — OAuth tokens handle CORS. No manual CORS configuration is needed on the client side.
3. **Session cookies** — Use `js-cookie` to persist visitor tokens across page refreshes. The OAuth strategy expects a cookie-style token store.
4. **Collection permissions** — In the dashboard, set collection permissions to allow read access for visitors, not just admin. A common cause of "the API returns nothing" is collection permissions silently filtering everything out.
5. **Plan-gated features** — Some features (live payments, headless OAuth settings, higher item limits) require the Business plan. See `docs/wix-headless-reference.md` for current plan-tier constraints.

## References

- [Wix Headless docs](https://dev.wix.com/docs/go-headless)
- [Data quick start](https://dev.wix.com/docs/go-headless/tutorials-templates/java-script-sdk-tutorials/data-quick-start)
- [Bookings quick start](https://dev.wix.com/docs/go-headless/tutorials-templates/java-script-sdk-tutorials/bookings-quick-start)
- [SDK React](https://dev.wix.com/docs/sdk/core-modules/sdk-react/introduction)
- [Self-managed setup](https://dev.wix.com/docs/go-headless/getting-started/setup/general-setup/overview)
