# MPS Group — Automotive Booking Page Design Brief

> **Last verified:** 2026-03-19. Competitive pricing and SGI requirements should be re-checked periodically.

## Overview

MPS Group offers SGI-accredited vehicle maintenance as a bonus service alongside their core industrial fabrication business. This page lives at `/automotive` as a dedicated experience — separate from the main industrial site but sharing the MPS brand and design system.

**Goal:** Make booking a vehicle service appointment as frictionless as possible. Most Saskatchewan SGI shops still use phone-only booking — online booking is an immediate competitive advantage.

---

## Target Audience

**Primary:** Local vehicle owners in the Pierceland, SK area and surrounding communities (Cold Lake, AB corridor)
- Searching on mobile (60%+ of local service searches)
- Want to book quickly without calling
- Care about SGI accreditation and transparent pricing
- May be MPS employees or family members using the service as a perk

**Secondary:** Fleet operators / B2B clients
- Pre-trip inspections for work vehicles
- Volume scheduling
- Invoice/PO workflow (future phase)

---

## Competitive Landscape

### National Chains

| Chain | Booking Model | Steps | Shows Price? | Account Required? |
|-------|--------------|-------|-------------|-------------------|
| Canadian Tire | Online wizard + app | 4 | No | Optional |
| Jiffy Lube | Online + phone | 4 | Yes (varies by location) | No |
| Midas | Online wizard | 4 | Separate estimator tool | No |
| Mr. Lube | Walk-in only | N/A | N/A | N/A |
| Great Canadian Oil Change | Walk-in only | N/A | N/A | N/A |
| Kal Tire | Online + text alerts | 4 | Yes (products) | No |

### Saskatchewan SGI Inspection Shops

| Shop | Location | Booking | Price | Online? |
|------|----------|---------|-------|---------|
| Performance Plus | Saskatoon | Online + phone | $129 + $30 decal | Yes — benchmark competitor |
| Guest Auto | Saskatoon | Phone/text + PickTime | $187.50 + tax | Basic scheduler |
| Saskatoon Auto Connection | Saskatoon | Phone only | Not listed | No |
| Faithfull Tirecraft | Saskatoon | Phone only | Not listed | No |
| Ward Tirecraft | Saskatoon | Phone only | Not listed | No |

**Key insight:** Performance Plus is the only SK competitor with real online booking. Their offering: $129 SGI inspection + free reinspection within 30 days if repairs done in-house. This is the bar to clear.

**Walk-in competitors (Mr. Lube, GCOC)** don't do appointments — MPS's online booking must feel *easier* than driving to a walk-in shop.

---

## SGI Inspection Requirements

- **93-point safety checklist** supplied by SGI
- Covers: brakes (pads, rotors, hydraulics), tires (tread depth, inflation), lights/signals, steering/suspension, exhaust, windshield/mirrors, fluid levels, battery/electrical, driveline, glass, wipers, defrosters
- Does NOT evaluate: engine performance, transmission, AC, or other non-safety systems
- **Duration:** ~1.5 hours (small vehicles up to half-ton), ~2 hours (large vehicles)
- **Customer prep:** Vehicle must arrive washed, interior emptied, registration available
- **Inspection types:** Out-of-province, total loss re-inspection, periodic (flagged vehicles)
- **Cost formula:** Shop rate × 1.5h (small) or × 2h (large)

---

## Services to Offer for Online Booking

| Service | Est. Duration | Price Range | SGI Related | Notes |
|---------|--------------|-------------|-------------|-------|
| SGI Safety Inspection | 1.5–2h | $129–270 | Yes | Key differentiator — most SK shops are phone-only |
| Oil Change (Conventional) | 30–45 min | $60–90 | No | Bread and butter service |
| Oil Change (Full Synthetic) | 30–45 min | $90–120 | No | Higher margin |
| Tire Change / Rotation | 30–60 min | $40–100 | No | Seasonal demand spikes (spring/fall) |
| Brake Inspection | 30–45 min | Free | No | Free inspection → upsell to brake service |
| General Maintenance | 60–120 min | $100–300 | No | Catch-all with "describe your issue" text field |
| Pre-Trip / Fleet Inspection | 45–60 min | $80–150 | Yes | B2B opportunity — fleet operators |

*Prices and services must be verified with MPS staff before launch.*

---

## Booking Flow — The 4-Step Rule

Every successful automotive booking site uses 4 steps max. More than that and abandonment spikes.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 1. SERVICE  │ →  │ 2. VEHICLE  │ →  │ 3. DATE &   │ →  │ 4. CONFIRM  │
│             │    │             │    │    TIME      │    │             │
│ Pick what   │    │ Year, Make, │    │ Calendar +   │    │ Name, phone,│
│ you need    │    │ Model       │    │ time slots   │    │ email, done │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     ↑ Progress bar visible at all times ──────────────────────────→
```

### Step 1: Service Selection
- Cards or list showing each service
- Each card shows: name, estimated duration, price (or "Free" for inspections)
- SGI services get a badge/icon
- Multi-select allowed (e.g., oil change + tire rotation)
- "Not sure? Describe your issue" option at the bottom

### Step 2: Vehicle Information
- Three cascading dropdowns: Year → Make → Model
- Keep it simple — no VIN required
- For SGI inspections: note vehicle size affects duration (small vs large)
- Optional: "Additional notes" text area (describe issue, special requests)

### Step 3: Date & Time
- Calendar view showing available dates
- Available time slots for selected date (morning / afternoon blocks, or specific times)
- Show estimated service completion time ("Drop off 9:00 AM → Ready by ~10:30 AM")
- Seasonal messaging: "Book early — spring inspection season fills fast"

### Step 4: Contact & Confirm
- Name, phone number, email (all required)
- For SGI inspections: mailing address (required by SGI)
- Summary card: service(s), vehicle, date/time, estimated cost, estimated duration
- "Confirm Booking" button
- After confirm: success screen with confirmation number + "Add to Calendar" links

### Post-Booking Automated Communication
1. **Immediately:** Email/SMS confirmation with booking details + confirmation number
2. **For SGI bookings:** Prep instructions (wash vehicle, empty interior, bring registration)
3. **24 hours before:** Reminder with reschedule/cancel link
4. **2 hours before:** Final reminder
5. **When done:** "Your vehicle is ready for pickup" text (future phase)

---

## UX Principles — Non-Negotiable

1. **No account required** — never gate booking behind registration
2. **Show pricing upfront** — builds trust, reduces "call for quote" friction, differentiates from phone-only competitors
3. **Show estimated duration** — customers need to plan their day
4. **Progress indicator** — always show which step you're on (1 of 4, 2 of 4, etc.)
5. **Mobile-first design** — 60%+ of local service searches are from mobile devices
6. **"Call to Book" always visible** — prominent phone number as fallback for people who prefer calling
7. **Easy reschedule** — confirmation number + email, no login required
8. **No hidden fees** — if there are shop supply charges or taxes, note it clearly

---

## Page Structure — Sections

### Section 1: Hero
- MPS Group logo + "Automotive Services" subtitle
- SGI accreditation badge — prominent, above the fold (this is the #1 trust signal)
- Tagline: something that communicates convenience + accreditation
- Location and hours
- Primary CTA: "Book an Appointment" → scrolls to booking section
- Secondary CTA: "Call Us" → `tel:` link
- Compact hero — not as dramatic as the main industrial site. Get to the point fast.

### Section 2: Service Catalog
- Grid of service cards (see services table above)
- Each card: service name, duration, price, SGI badge if applicable
- Clicking a card either expands for detail or pre-selects that service and scrolls to booking
- Cards should use `LiteCard` component pattern (lightweight, good for 6-8 items)

### Section 3: Booking Flow
- The 4-step wizard described above
- Embedded directly in the page — no redirect, no popup, no new tab
- Sticky "Book Now" bar on mobile (like the main site's "Let's Talk" beacon)

### Section 4: Trust & Info
- SGI accreditation details — what it means, what the 93-point inspection covers
- Location map or address
- Hours of operation (automotive-specific, may differ from fabrication shop)
- "Questions?" — phone number and email
- Link back to main MPS Group site

### Footer
- Simplified footer matching main site style
- Privacy / Terms links (shared LegalModal)
- "← Back to MPS Group" link
- Copyright

---

## Design Identity

The automotive page shares the MPS design system but has a more approachable tone:

| Aspect | Main Industrial Site | Automotive Page |
|--------|---------------------|-----------------|
| Audience | Oil & gas decision-makers | Local vehicle owners |
| Tone | Enterprise, prestige | Approachable, local, trustworthy |
| Hero | Dramatic 1.8s entrance | Compact, get-to-the-point |
| Trust signals | COR, ISO, CWB certifications | SGI accreditation badge |
| Primary action | "Let's Talk" (inquiry) | "Book an Appointment" (conversion) |
| Animations | Full fadeUpBlur, parallax | Lighter — fast reveals, functional |
| Colors | Same CSS variables (cyan-metal accent) | Same, with optional warmer accent for CTAs |
| Typography | Same fonts (Bebas Neue, Manrope) | Same |
| Glass effects | Full adaptive glass | Lighter — booking form needs clarity over atmosphere |

**Key design rule:** The booking form itself should prioritize clarity and readability over atmospheric effects. Glass/blur on cards and hero is fine, but form inputs need high contrast and zero visual noise.

---

## Conversion Features to Consider

### Immediate (MVP)
- [x] Online booking (vs phone-only competitors)
- [x] Upfront pricing
- [x] Duration estimates
- [x] Mobile-first responsive design
- [x] Email confirmation with booking details
- [x] SGI prep instructions in confirmation

### Post-Launch Enhancements
- [ ] Free reinspection within 30 days if repairs done in-house (matches Performance Plus)
- [ ] SMS reminders (24h + 2h before appointment)
- [ ] "Vehicle ready" text notification
- [ ] Google Business Profile booking integration (book from Google Maps)
- [ ] Add-to-calendar links in confirmation (Google, Apple, Outlook)
- [ ] Returning customer auto-fill (match by phone/email, pre-populate vehicle)
- [ ] Seasonal promotions ("Book Early and Save" for spring/fall inspection rush)
- [ ] Fleet/B2B portal with volume pricing and invoicing

---

## Technical Architecture

### Routing
- React Router (`react-router-dom`)
- `/` = main MPS industrial site (unchanged)
- `/automotive` = dedicated automotive booking experience
- Vercel rewrite: `/(.*) → /index.html` for SPA routing

### File Structure
```
src/
├── layouts/
│   ├── MainSite.tsx              ← Current App.tsx content extracted
│   └── AutomotiveSite.tsx        ← Automotive layout
├── sections/automotive/
│   ├── AutomotiveHero.tsx
│   ├── AutomotiveHero.module.css
│   ├── ServiceCatalog.tsx
│   ├── ServiceCatalog.module.css
│   ├── BookingWizard.tsx         ← 4-step booking flow
│   ├── BookingWizard.module.css
│   ├── TrustInfo.tsx             ← SGI details, map, hours
│   ├── TrustInfo.module.css
│   ├── AutomotiveFooter.tsx
│   └── AutomotiveFooter.module.css
├── components/
│   ├── AutomotiveNav.tsx
│   └── AutomotiveNav.module.css
```

### Booking Backend — Phased

**Phase 1 (MVP, no Wix dependency):**
- Booking form submits to Vercel Edge Function
- Edge function sends notification email to automotive team
- Confirmation displayed in-browser
- Booking data optionally stored in Supabase for tracking

**Phase 2 (after Wix Business plan upgrade):**
- Replace form with Wix Bookings SDK integration
- `@wix/bookings` queries live services
- `@wix/calendar` queries real-time availability
- `@wix/redirects` handles Wix checkout for payment
- Automated Wix confirmation emails
- Google Calendar sync for staff

### Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `auto_page_view` | Page load | `{ source: referrer }` |
| `auto_service_selected` | Service card click | `{ service, price, sgi }` |
| `auto_booking_step` | Each wizard step | `{ step: 1-4, service }` |
| `auto_booking_submitted` | Form submit | `{ service, vehicle, date }` |
| `auto_booking_abandoned` | Leave mid-flow | `{ step, service }` |
| `auto_call_click` | Phone number tap | `{ location: 'hero'|'footer' }` |
| `auto_back_to_main` | "← MPS Group" click | `{}` |

### SEO
- `<title>`: "MPS Group Automotive | SGI-Accredited Vehicle Maintenance | Pierceland SK"
- Meta description focused on online booking + SGI accreditation
- Own Open Graph tags (separate og:title, og:description, og:image)
- Shareable URL: `mpsgroup.ca/automotive`
- Can be linked from Google Business Profile

---

## Open Questions (Verify with MPS Staff)

1. **Pricing** — What are the actual prices for each service? The ranges above are estimates from competitor research.
2. **Hours** — What are the automotive shop hours? Same as fabrication or different?
3. **Capacity** — How many bays / how many appointments per day?
4. **Staff** — Who manages automotive bookings? Who gets the notification emails?
5. **Payment** — Accept payment at booking or at pickup? Online payment or in-person only?
6. **Reinspection policy** — Does MPS offer free SGI reinspection within 30 days if repairs done in-house?
7. **Fleet services** — Is there demand for fleet/B2B booking with volume pricing?
8. **Seasonal patterns** — When are peak booking periods? (Spring inspection rush?)

---

## References

- [Canadian Tire Auto Appointments](https://www.canadiantire.ca/en/auto-appointment.html)
- [Jiffy Lube Scheduling](https://www.jiffylube.com/resource-center/oil-change-schedule)
- [Midas Book Appointment](https://www.midas.com/bookappointment.aspx)
- [Kal Tire Online Booking](https://www.kaltire.com/en/book-your-vehicle-maintenance-online.html)
- [Performance Plus SGI Inspections](https://www.performanceplus.com/sgi-inspections) — benchmark competitor
- [SGI Vehicle Inspection Programs](https://sgi.sk.ca/vehicle-inspection-programs)
- [Shopmonkey Scheduling](https://www.shopmonkey.io/product/automotive-marketing/scheduling)
- [UX Case Study: Vehicle Service Booking](https://medium.com/design-bootcamp/case-study-wheels-app-ux-design-for-online-vehicle-service-booking-ac7070bfe970)
