# MPS Group — Wix Plan Upgrade Proposal

> **See also:** `.claude/agents/wix-headless-agent.md` for technical integration details.

## Summary

We're requesting an upgrade of the MPS Group Wix site (**mpsgroup.ca**) from the **Core plan** to the **Business plan** to enable headless CMS and online booking capabilities.

---

## What We Need

**Upgrade the mps-group Wix site from Core → Business plan.**

---

## Why

### 1. Headless CMS — Editable Website Content
Our new React website (hosted on Vercel) currently has all text content hardcoded in source code. Any change — a phone number, a service description, a stat — requires a developer to edit code and redeploy.

With the Business plan, we can connect the React site to **Wix CMS** as a headless backend, allowing non-technical team members to update website content (services, contact info, stats, certifications, about text) directly from the Wix dashboard. No code changes needed.

**The Core plan blocks this.** The headless API settings page returns "You don't have the necessary permissions" on our current plan.

### 2. Wix Bookings — Automotive Service Appointments
MPS offers SGI-accredited vehicle maintenance as a bonus service. Currently, appointment requests come through the Wix inbox (50+ unprocessed messages). There's no structured booking system.

With the Business plan + Wix Bookings:
- Customers can book appointments online (service selection, time slots, confirmations)
- Staff calendars sync with Google Calendar / Outlook
- Automated confirmation and reminder emails
- Payment processing for services
- Dedicated automotive section on the website

### 3. AI Chatbot — Smart Inquiry Routing (Future Phase)
We're planning a custom AI chatbot for the "Let's Talk" button that will:
- Route quote requests to operations
- Route career inquiries to HR
- Route automotive bookings to the booking system
- Answer general questions about MPS services

This is a future enhancement that benefits from CMS data being accessible via API. It can proceed independently of the upgrade but is significantly more powerful with headless access.

---

## Cost

| Plan | Monthly | Annual (saves ~25%) |
|------|---------|-------------------|
| Current: Core | ~$17/mo | ~$204/yr |
| Proposed: Business | ~$32/mo | ~$384/yr |
| **Difference** | **+$15/mo** | **+$180/yr** |

*Note: Wix Bookings is available as an add-on app (free to install, payment processing included with Business plan). No additional subscription cost.*

---

## Business Impact

- **Content updates go from ~1 hour (code change + deploy) to ~2 minutes (dashboard edit)**
- **Automotive bookings go from unprocessed inbox messages (50+) to structured, automated scheduling**
- **No additional developer time needed** for routine content changes (phone numbers, service descriptions, stats)

---

## What It Unlocks

| Feature | Core (Current) | Business (Proposed) |
|---------|---------------|-------------------|
| Headless CMS API access | Blocked | Enabled |
| OAuth app creation | Blocked | Enabled |
| Wix Bookings (payments) | N/A | Enabled |
| CMS item limit | 4,000 | Higher |
| Storage | 50 GB | 100 GB |
| Advanced analytics | Limited | Full |

---

## Alternative If Declined

If the upgrade is not approved, we can use **Sanity.io** (free tier, 100k API calls/month) as the CMS instead of Wix. This would work but means:
- Content managed in a separate system (not the Wix dashboard)
- Two logins for site management
- No Wix Bookings integration (would need a separate booking solution)

---

## Timeline

Once approved:
1. **Day 1**: Upgrade plan, configure headless settings, create OAuth credentials
2. **Week 1**: Set up CMS collections, populate with current site content
3. **Week 2**: Connect React site to Wix CMS, test content updates
4. **Week 3**: Set up Wix Bookings for automotive services
5. **Week 4**: Deploy AI chatbot, final testing

---

## Decision Requested

Approve the upgrade from Wix Core → Business plan ($32/mo) to enable headless CMS, Wix Bookings, and API access for the MPS Group website.
