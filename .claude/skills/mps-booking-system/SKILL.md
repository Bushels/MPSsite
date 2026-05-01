---
name: mps-booking-system
description: Reference for the MPS Group automotive booking system — Supabase-backed bookings table, Vercel Functions handlers, OpenRouter chat widget, and Resend email confirmations. Use when troubleshooting booking flow failures, modifying slot availability, updating the service catalog, editing the chat widget system prompt, or touching api/automotive-booking.ts, api/chat.ts, src/services/availabilityApi.ts, src/lib/supabaseClient.ts, or the bookings table.
---

# MPS Automotive Booking System

Reference skill for the MPS Group automotive booking system. Use this when troubleshooting bookings, modifying availability, updating services, or working with the chat widget.

## Architecture Overview

```
Customer Browser                Vercel Serverless              Supabase (free)
┌─────────────────┐            ┌──────────────────┐           ┌──────────────┐
│ BookingWizard    │──POST──▶  │ api/automotive-   │──INSERT─▶ │ bookings     │
│ (4-step form)    │           │ booking.ts        │           │ table        │
└─────────────────┘            │                   │──email──▶ │              │
                               │ (service-role key)│           └──────────────┘
┌─────────────────┐            └──────────────────┘
│ availabilityApi  │──SELECT─▶  Supabase PostgREST (anon key)
│ (slot query)     │            Filters booked slots from template
└─────────────────┘

┌─────────────────┐            ┌──────────────────┐
│ ChatWidget       │──POST──▶  │ api/chat.ts       │──▶ OpenRouter API
│ (floating bubble)│           │ (SSE streaming)   │    (free tier: 50 req/day)
└─────────────────┘            └──────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20260324_create_bookings.sql` | Database schema |
| `src/lib/supabaseClient.ts` | Lightweight PostgREST client (no SDK) |
| `src/services/availabilityApi.ts` | Real-time slot availability from Supabase |
| `src/services/automotiveBookingApi.ts` | Frontend booking submission service |
| `api/automotive-booking.ts` | Server: validates, inserts to Supabase, emails via Resend |
| `api/chat.ts` | Server: proxies to OpenRouter with MPS system prompt |
| `src/components/ChatWidget.tsx` | Floating chat bubble + message panel |
| `src/data/automotive.ts` | Service catalog, slot templates, vehicle catalog |
| `src/lib/automotiveBooking.ts` | Validation logic, summary builder |

## Supabase Project

- **Project ID:** `goxndhubxmthtkcrhxey`
- **URL:** `https://goxndhubxmthtkcrhxey.supabase.co`
- **Account:** Kyle's free Supabase account (not the premium org)
- **Region:** Check dashboard

## Environment Variables

### Browser-safe (VITE_ prefix, shipped in bundle)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Publishable anon key

### Server-side only (Vercel env vars, never VITE_ prefixed)
- `SUPABASE_URL` — Same Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` — From Supabase dashboard → Settings → API
- `RESEND_API_KEY` — From resend.com (free: 3,000 emails/mo)
- `MPS_NOTIFICATION_EMAIL` — Shop notification email (default: info@mpsgroup.ca)
- `OPENROUTER_API_KEY` — From openrouter.ai
- `OPENROUTER_MODEL` — Optional, defaults to `meta-llama/llama-3.1-8b-instruct:free`

## Booking Flow

1. Customer picks services (Step 1) → vehicle info (Step 2) → appointment slot (Step 3) → contact info (Step 4)
2. Frontend calls `POST /api/automotive-booking` with full form data
3. Server validates all 4 steps, generates confirmation code (`MPS-XXXXXXXX`)
4. Server inserts into `bookings` table (unique constraint on `appointment_date + appointment_slot` prevents double-booking)
5. If slot taken → 409 response → frontend shows "slot taken" and refreshes availability
6. Server sends branded confirmation email to customer + notification to shop via Resend
7. Frontend shows confirmation code

## Availability System

- **Template slots:** 9:00 AM, 11:30 AM, 2:30 PM — Monday through Friday
- `fetchAvailableAppointmentDays()` generates 5 weekdays of template slots
- Queries Supabase for `pending` or `confirmed` bookings in that date range
- Removes booked slots and past-time slots for today
- Falls back to static template slots if Supabase is unreachable (fail-open)

## Services Catalog

| ID | Service | Price | Duration | SGI |
|----|---------|-------|----------|-----|
| `sgi-inspection` | SGI Safety Inspection | $129-$270 | 1.5-2.0 hr | Yes |
| `oil-conventional` | Conventional Oil Change | $60-$90 | 30-45 min | No |
| `oil-synthetic` | Full Synthetic Oil Change | $90-$120 | 30-45 min | No |
| `tire-service` | Tire Change / Rotation | $40-$100 | 30-60 min | No |
| `brake-inspection` | Brake Inspection | Free | 30-45 min | No |
| `general-maintenance` | General Maintenance | $100-$300 | 1.0-2.0 hr | No |
| `fleet-pretrip` | Fleet / Pre-Trip Inspection | $80-$150 | 45-60 min | Yes |

## Chat Widget

- OpenRouter-powered, streams via SSE
- System prompt contains all MPS service info, pricing, location, hours
- Falls back to "call us" message on API errors
- Keeps last 10 messages in context (free model token limits)
- Glassmorphic UI matching the deep-blue metallic MPS design system

## Common Troubleshooting

### Bookings not saving
1. Check `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel env vars (not VITE_ prefixed)
2. Check Supabase project isn't paused (free projects pause after inactivity)
3. Check RLS policies exist: `service_full_access`, `anon_insert`, `anon_read_own`

### Availability showing all slots (not filtering booked)
1. Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are in `.env.local`
2. Check the `anon_read_own` RLS policy allows SELECT for anon role
3. Check browser console for PostgREST errors

### Chat not responding
1. Check `OPENROUTER_API_KEY` is set in Vercel env vars
2. Check daily free tier limit (50 req/day) hasn't been exceeded
3. Try switching `OPENROUTER_MODEL` to a different free model

### Double-booking 409 errors
Working as intended — the `unique_slot_per_day` constraint prevents two bookings at the same date+slot. Frontend should catch 409 and refresh availability.

### Emails not sending
1. Check `RESEND_API_KEY` is set
2. Check the sending domain (`mpsgroup.ca`) is verified in Resend dashboard
3. Email sending is fire-and-forget — check Vercel function logs for errors
