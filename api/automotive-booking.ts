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
  if (!isRecord(value)) {
    return null;
  }

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

const createHandoffPayload = (
  requestBody: AutomotiveBookingSubmissionRequest,
  booking: SubmittedAutomotiveBooking,
) => ({
  company: companyProfile.name,
  booking,
  intake: requestBody,
});

const getWebhookHeaders = () => {
  const webhookSecret = process.env.AUTOMOTIVE_BOOKING_WEBHOOK_SECRET;

  return webhookSecret
    ? {
        'x-mps-booking-secret': webhookSecret,
      }
    : {};
};

export async function GET() {
  const webhookUrl = process.env.AUTOMOTIVE_BOOKING_WEBHOOK_URL;
  const vercelEnv = process.env.VERCEL_ENV ?? 'development';

  return json({
    ok: true,
    endpoint: '/api/automotive-booking',
    mode: webhookUrl ? 'forwarded' : vercelEnv === 'production' ? 'unconfigured' : 'preview',
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
      {
        error: error instanceof Error ? error.message : 'Booking validation failed.',
      },
      { status: 400 },
    );
  }

  const booking: SubmittedAutomotiveBooking = {
    confirmationCode: createConfirmationCode(),
    submittedAt: new Date().toISOString(),
    deliveryMode: 'preview',
    summary: validationResult.summary,
  };

  const webhookUrl = process.env.AUTOMOTIVE_BOOKING_WEBHOOK_URL;
  const vercelEnv = process.env.VERCEL_ENV ?? 'development';

  if (!webhookUrl) {
    if (vercelEnv === 'production') {
      return json(
        {
          error:
            'Booking handoff is not configured yet. Call the shop while the live integration is finished.',
        },
        { status: 503 },
      );
    }

    return json(booking, { status: 201 });
  }

  const forwardedBooking: SubmittedAutomotiveBooking = {
    ...booking,
    deliveryMode: 'forwarded',
  };

  const webhookResponse = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getWebhookHeaders(),
    },
    body: JSON.stringify(createHandoffPayload(requestBody, forwardedBooking)),
  });

  if (!webhookResponse.ok) {
    return json(
      {
        error:
          'Booking handoff failed upstream. Call the shop while the integration is finished.',
      },
      { status: 502 },
    );
  }

  return json(forwardedBooking, { status: 201 });
}
