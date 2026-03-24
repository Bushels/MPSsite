/**
 * Vercel Serverless Function: POST /api/automotive-booking
 *
 * Writes bookings to Supabase using the service-role key (server-side only).
 * Sends a branded confirmation email via Resend.
 *
 * Environment variables required:
 *   SUPABASE_URL              – https://goxndhubxmthtkcrhxey.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY – (from Supabase dashboard → Settings → API)
 *   RESEND_API_KEY            – (from resend.com, free tier = 3,000 emails/mo)
 *   MPS_NOTIFICATION_EMAIL    – where the shop gets notified (e.g. info@mpsgroup.ca)
 */

import { companyProfile } from '../src/data/company.js';
import {
  type AutomotiveBookingSubmissionRequest,
  type SubmittedAutomotiveBooking,
  validateAutomotiveBookingSubmission,
} from '../src/lib/automotiveBooking.js';

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readString = (value: unknown) => (typeof value === 'string' ? value : '');

const readStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const parseSubmissionRequest = (value: unknown): AutomotiveBookingSubmissionRequest | null => {
  if (!isRecord(value)) return null;

  return {
    selectedServiceIds: readStringArray(value.selectedServiceIds),
    issueDescription: readString(value.issueDescription),
    year: readString(value.year),
    make: readString(value.make),
    model: readString(value.model),
    vehicleSize: value.vehicleSize === 'large' ? 'large' : 'small',
    notes: readString(value.notes),
    appointmentDayId: readString(value.appointmentDayId),
    appointmentSlotId: readString(value.appointmentSlotId),
    appointmentSlotIsoStart: readString(value.appointmentSlotIsoStart),
    fullName: readString(value.fullName),
    phone: readString(value.phone),
    email: readString(value.email),
    mailingAddress: readString(value.mailingAddress),
    city: readString(value.city),
    province: readString(value.province),
    postalCode: readString(value.postalCode),
    source: readString(value.source) || 'automotive-web',
    pagePath: readString(value.pagePath) || '/automotive/',
  };
};

const createConfirmationCode = () =>
  `MPS-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;

/** Extract the slot template ID (e.g. "0900") from "2026-03-24-0900" */
const extractSlotId = (appointmentSlotId: string): string => {
  const parts = appointmentSlotId.split('-');
  return parts[parts.length - 1] ?? appointmentSlotId;
};

// ── Supabase insert ──────────────────────────────────────────────────────

interface SupabaseInsertResult {
  ok: boolean;
  error?: string;
  duplicate?: boolean;
}

const insertBooking = async (
  requestBody: AutomotiveBookingSubmissionRequest,
  confirmationCode: string,
  summaryJson: Record<string, unknown>,
): Promise<SupabaseInsertResult> => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false, error: 'Supabase is not configured.' };
  }

  const row = {
    confirmation_code: confirmationCode,
    status: 'pending',
    service_ids: requestBody.selectedServiceIds,
    issue_description: requestBody.issueDescription,
    vehicle_year: requestBody.year,
    vehicle_make: requestBody.make,
    vehicle_model: requestBody.model,
    vehicle_size: requestBody.vehicleSize,
    notes: requestBody.notes,
    appointment_date: requestBody.appointmentDayId,           // YYYY-MM-DD
    appointment_slot: extractSlotId(requestBody.appointmentSlotId),  // e.g. "0900"
    appointment_start: requestBody.appointmentSlotIsoStart,
    full_name: requestBody.fullName,
    phone: requestBody.phone,
    email: requestBody.email,
    mailing_address: requestBody.mailingAddress,
    city: requestBody.city,
    province: requestBody.province,
    postal_code: requestBody.postalCode,
    summary_json: summaryJson,
    source: requestBody.source,
    page_path: requestBody.pagePath,
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/bookings`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');

    // Unique constraint violation = slot already taken
    if (response.status === 409 || errorBody.includes('unique_slot_per_day')) {
      return { ok: false, duplicate: true, error: 'That time slot was just booked. Please pick another.' };
    }

    return { ok: false, error: `Database error: ${response.status}` };
  }

  return { ok: true };
};

// ── Email notifications (Resend) ─────────────────────────────────────────

const sendConfirmationEmail = async (
  requestBody: AutomotiveBookingSubmissionRequest,
  confirmationCode: string,
  summary: Record<string, string>,
) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const shopEmail = process.env.MPS_NOTIFICATION_EMAIL || 'info@mpsgroup.ca';

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not set — skipping confirmation email');
    return;
  }

  const customerHtml = `
    <div style="font-family: -apple-system, sans-serif; max-width: 520px;">
      <h2 style="color: #1a1a1a;">Booking Confirmed — ${confirmationCode}</h2>
      <p>Hi ${requestBody.fullName},</p>
      <p>Your appointment at <strong>${companyProfile.automotiveName}</strong> is set:</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr><td style="padding: 6px 0; color: #666;">Service</td><td style="padding: 6px 0;">${summary.serviceLabel}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Vehicle</td><td style="padding: 6px 0;">${summary.vehicleLabel}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">When</td><td style="padding: 6px 0;">${summary.slotLabel}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Estimate</td><td style="padding: 6px 0;">${summary.priceLabel} · ${summary.durationLabel}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Confirmation</td><td style="padding: 6px 0; font-weight: 600;">${confirmationCode}</td></tr>
      </table>
      <p style="color: #666; font-size: 14px;">
        ${companyProfile.automotiveLocationLabel}<br />
        ${companyProfile.primaryPhoneDisplay}
      </p>
    </div>
  `;

  const shopHtml = `
    <div style="font-family: monospace; max-width: 520px;">
      <h2>New Booking: ${confirmationCode}</h2>
      <pre>${JSON.stringify({ ...summary, contact: { name: requestBody.fullName, phone: requestBody.phone, email: requestBody.email }, vehicle: `${requestBody.year} ${requestBody.make} ${requestBody.model}`, notes: requestBody.notes || '(none)' }, null, 2)}</pre>
    </div>
  `;

  // Send both emails concurrently
  const sendEmail = (to: string, subject: string, html: string) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${companyProfile.automotiveName} <bookings@mpsgroup.ca>`,
        to,
        subject,
        html,
      }),
    });

  await Promise.allSettled([
    sendEmail(requestBody.email, `Booking Confirmed — ${confirmationCode}`, customerHtml),
    sendEmail(shopEmail, `New Booking: ${confirmationCode} — ${requestBody.fullName}`, shopHtml),
  ]);
};

// ── Route handlers ───────────────────────────────────────────────────────

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const vercelEnv = process.env.VERCEL_ENV ?? 'development';

  return json({
    ok: true,
    endpoint: '/api/automotive-booking',
    backend: supabaseUrl ? 'supabase' : 'unconfigured',
    environment: vercelEnv,
  });
}

export async function POST(request: Request) {
  const requestJson = await request.json().catch(() => null);
  const requestBody = parseSubmissionRequest(requestJson);

  if (!requestBody) {
    return json({ error: 'Invalid booking request body.' }, { status: 400 });
  }

  let validationResult;
  try {
    validationResult = validateAutomotiveBookingSubmission(requestBody);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Booking validation failed.' },
      { status: 400 },
    );
  }

  const confirmationCode = createConfirmationCode();
  const summaryJson = validationResult.summary as unknown as Record<string, unknown>;

  // Insert into Supabase
  const insertResult = await insertBooking(requestBody, confirmationCode, summaryJson);

  if (!insertResult.ok) {
    const status = insertResult.duplicate ? 409 : 503;
    return json({ error: insertResult.error }, { status });
  }

  // Send branded emails (fire-and-forget — don't block the response)
  sendConfirmationEmail(
    requestBody,
    confirmationCode,
    validationResult.summary as unknown as Record<string, string>,
  ).catch((err) => console.error('Email send failed:', err));

  const booking: SubmittedAutomotiveBooking = {
    confirmationCode,
    submittedAt: new Date().toISOString(),
    deliveryMode: 'forwarded',
    summary: validationResult.summary,
  };

  return json(booking, { status: 201 });
}
