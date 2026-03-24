import {
  buildAutomotiveBookingSummary,
  type AutomotiveBookingSubmissionRequest,
  type AutomotiveBookingFormData,
  type SubmittedAutomotiveBooking,
} from '../lib/automotiveBooking';

const AUTOMOTIVE_BOOKING_API_PATH = '/api/automotive-booking';

interface AutomotiveBookingErrorPayload {
  error?: string;
}

export class AutomotiveBookingApiError extends Error {
  readonly status: number;
  readonly isSlotTaken: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AutomotiveBookingApiError';
    this.status = status;
    this.isSlotTaken = status === 409;
  }
}

const isLocalPreviewEnvironment = () =>
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const buildLocalPreviewBooking = (
  form: AutomotiveBookingFormData,
): SubmittedAutomotiveBooking => ({
  confirmationCode: `MPS-LOCAL-${Date.now().toString(36).slice(-6).toUpperCase()}`,
  submittedAt: new Date().toISOString(),
  deliveryMode: 'preview',
  summary: buildAutomotiveBookingSummary(form),
});

const isSubmittedAutomotiveBooking = (
  value: unknown,
): value is SubmittedAutomotiveBooking => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'confirmationCode' in value &&
    'submittedAt' in value &&
    'summary' in value &&
    'deliveryMode' in value
  );
};

export const submitAutomotiveBooking = async (
  form: AutomotiveBookingFormData,
): Promise<SubmittedAutomotiveBooking> => {
  const requestBody: AutomotiveBookingSubmissionRequest = {
    ...form,
    source: 'automotive-web',
    pagePath: typeof window !== 'undefined' ? window.location.pathname : '/automotive/',
  };

  if (isLocalPreviewEnvironment()) {
    return buildLocalPreviewBooking(form);
  }

  try {
    const response = await fetch(AUTOMOTIVE_BOOKING_API_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseBody = (await response
      .json()
      .catch(() => null)) as SubmittedAutomotiveBooking | AutomotiveBookingErrorPayload | null;

    if (!response.ok) {
      const errorMessage =
        responseBody && 'error' in responseBody && typeof responseBody.error === 'string'
          ? responseBody.error
          : 'Booking failed. Call the shop while the integration is finished.';

      throw new AutomotiveBookingApiError(errorMessage, response.status);
    }

    if (!isSubmittedAutomotiveBooking(responseBody)) {
      throw new AutomotiveBookingApiError(
        'Booking returned an invalid response.',
        response.status,
      );
    }

    return responseBody;
  } catch (error) {
    if (error instanceof AutomotiveBookingApiError) {
      throw error;
    }

    throw new AutomotiveBookingApiError(
      'Booking failed. Call the shop while the integration is finished.',
      500,
    );
  }
};
