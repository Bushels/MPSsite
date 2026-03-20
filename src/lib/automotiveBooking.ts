import {
  automotiveServices,
  buildAppointmentDays,
  formatDurationRange,
  formatMoneyRange,
  formatReadyWindow,
  type AppointmentDay,
  type AppointmentSlot,
  type AutomotiveService,
} from '../data/automotive.js';
import { companyProfile } from '../data/company.js';

const DAY_FORMAT = new Intl.DateTimeFormat('en-CA', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: companyProfile.bookingTimeZone,
});

const TIME_FORMAT = new Intl.DateTimeFormat('en-CA', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: companyProfile.bookingTimeZone,
});

export interface AutomotiveBookingFormData {
  selectedServiceIds: readonly string[];
  issueDescription: string;
  year: string;
  make: string;
  model: string;
  vehicleSize: 'small' | 'large';
  notes: string;
  appointmentDayId: string;
  appointmentSlotId: string;
  appointmentSlotIsoStart: string;
  fullName: string;
  phone: string;
  email: string;
  mailingAddress: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface AutomotiveBookingSubmissionRequest extends AutomotiveBookingFormData {
  source: string;
  pagePath: string;
}

export interface AutomotiveBookingSummary {
  serviceLabel: string;
  priceLabel: string;
  durationLabel: string;
  slotLabel: string;
  readyLabel: string;
  vehicleLabel: string;
}

export type AutomotiveBookingDeliveryMode = 'preview' | 'forwarded';

export interface SubmittedAutomotiveBooking {
  confirmationCode: string;
  submittedAt: string;
  deliveryMode: AutomotiveBookingDeliveryMode;
  summary: AutomotiveBookingSummary;
}

export interface AutomotiveBookingValidationResult {
  requiresMailingAddress: boolean;
  selectedServices: readonly AutomotiveService[];
  summary: AutomotiveBookingSummary;
}

export const INITIAL_AUTOMOTIVE_BOOKING_FORM: AutomotiveBookingFormData = {
  selectedServiceIds: [],
  issueDescription: '',
  year: '',
  make: '',
  model: '',
  vehicleSize: 'small',
  notes: '',
  appointmentDayId: '',
  appointmentSlotId: '',
  appointmentSlotIsoStart: '',
  fullName: '',
  phone: '',
  email: '',
  mailingAddress: '',
  city: '',
  province: '',
  postalCode: '',
};

const SERVICE_INDEX = new Map(automotiveServices.map((service) => [service.id, service]));

const formatVehicleLabel = (form: AutomotiveBookingFormData) =>
  [form.year, form.make, form.model].filter(Boolean).join(' ') || 'Vehicle details pending';

const formatFallbackSlotLabel = (isoStart: string) => {
  const slotDate = new Date(isoStart);
  if (Number.isNaN(slotDate.getTime())) {
    return 'Select a date and time';
  }

  return `${DAY_FORMAT.format(slotDate)} at ${TIME_FORMAT.format(slotDate)}`;
};

export const getSelectedAutomotiveServices = (
  selectedServiceIds: readonly string[],
): readonly AutomotiveService[] =>
  selectedServiceIds
    .map((id) => SERVICE_INDEX.get(id))
    .filter((service): service is AutomotiveService => Boolean(service));

export const getAutomotiveAppointmentSelection = (
  appointmentDays: readonly AppointmentDay[],
  appointmentDayId: string,
  appointmentSlotId: string,
): {
  appointmentDay: AppointmentDay | null;
  appointmentSlot: AppointmentSlot | null;
} => {
  const appointmentDay = appointmentDays.find((day) => day.id === appointmentDayId) ?? null;
  const appointmentSlot =
    appointmentDay?.slots.find((slot) => slot.id === appointmentSlotId) ?? null;

  return {
    appointmentDay,
    appointmentSlot: appointmentSlot ?? null,
  };
};

export const getAutomotiveServiceDurationTotals = (
  selectedServices: readonly AutomotiveService[],
  vehicleSize: AutomotiveBookingFormData['vehicleSize'],
) => {
  if (selectedServices.length === 0) {
    return { minMinutes: 60, maxMinutes: 90 };
  }

  return selectedServices.reduce(
    (totals, service) => {
      if (service.id === 'sgi-inspection') {
        const inspectionMinutes = vehicleSize === 'large' ? 120 : 90;
        return {
          minMinutes: totals.minMinutes + inspectionMinutes,
          maxMinutes: totals.maxMinutes + inspectionMinutes,
        };
      }

      return {
        minMinutes: totals.minMinutes + service.durationRange.minMinutes,
        maxMinutes: totals.maxMinutes + service.durationRange.maxMinutes,
      };
    },
    { minMinutes: 0, maxMinutes: 0 },
  );
};

export const getAutomotiveServicePriceTotals = (
  selectedServices: readonly AutomotiveService[],
) => {
  if (selectedServices.length === 0) {
    return { min: 100, max: 300 };
  }

  return selectedServices.reduce(
    (totals, service) => ({
      min: totals.min + service.priceRange.min,
      max: totals.max + service.priceRange.max,
    }),
    { min: 0, max: 0 },
  );
};

export const getRequiresMailingAddress = (selectedServices: readonly AutomotiveService[]) =>
  selectedServices.some((service) => service.sgiRelated);

export const validateAutomotiveBookingStep = (
  step: number,
  form: AutomotiveBookingFormData,
  requiresMailingAddress: boolean,
): string | null => {
  if (step === 1) {
    if (form.selectedServiceIds.length === 0 && form.issueDescription.trim().length === 0) {
      return 'Pick at least one service or describe the issue so the shop knows what to stage.';
    }
    return null;
  }

  if (step === 2) {
    if (!form.year || !form.make || !form.model) {
      return 'Vehicle year, make, and model are all required before scheduling.';
    }
    return null;
  }

  if (step === 3) {
    if (!form.appointmentDayId || !form.appointmentSlotId || !form.appointmentSlotIsoStart) {
      return 'Choose both a date and a time slot to continue.';
    }

    if (Number.isNaN(new Date(form.appointmentSlotIsoStart).getTime())) {
      return 'The selected booking slot is invalid. Choose a different time to continue.';
    }

    return null;
  }

  if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim()) {
    return 'Name, phone number, and email are required to confirm the booking summary.';
  }

  if (
    requiresMailingAddress &&
    (!form.mailingAddress.trim() ||
      !form.city.trim() ||
      !form.province.trim() ||
      !form.postalCode.trim())
  ) {
    return 'SGI-related bookings need a mailing address for inspection paperwork.';
  }

  return null;
};

export const buildAutomotiveBookingSummary = (
  form: AutomotiveBookingFormData,
  appointmentDays: readonly AppointmentDay[] = buildAppointmentDays(),
): AutomotiveBookingSummary => {
  const selectedServices = getSelectedAutomotiveServices(form.selectedServiceIds);
  const durationTotals = getAutomotiveServiceDurationTotals(selectedServices, form.vehicleSize);
  const priceTotals = getAutomotiveServicePriceTotals(selectedServices);
  const { appointmentDay, appointmentSlot } = getAutomotiveAppointmentSelection(
    appointmentDays,
    form.appointmentDayId,
    form.appointmentSlotId,
  );

  const serviceLabel =
    selectedServices.length > 0
      ? selectedServices.map((service) => service.shortName).join(' + ')
      : 'General assessment';

  const slotLabel =
    appointmentDay && appointmentSlot
      ? `${appointmentDay.fullLabel} at ${appointmentSlot.label}`
      : form.appointmentSlotIsoStart
        ? formatFallbackSlotLabel(form.appointmentSlotIsoStart)
        : 'Select a date and time';

  const readyLabel = form.appointmentSlotIsoStart
    ? formatReadyWindow(
        form.appointmentSlotIsoStart,
        durationTotals.minMinutes,
        durationTotals.maxMinutes,
      )
    : 'Ready window appears after slot selection';

  return {
    serviceLabel,
    priceLabel: formatMoneyRange(priceTotals.min, priceTotals.max),
    durationLabel: formatDurationRange(durationTotals.minMinutes, durationTotals.maxMinutes),
    slotLabel,
    readyLabel,
    vehicleLabel: formatVehicleLabel(form),
  };
};

export const validateAutomotiveBookingSubmission = (
  form: AutomotiveBookingFormData,
): AutomotiveBookingValidationResult => {
  const selectedServices = getSelectedAutomotiveServices(form.selectedServiceIds);
  const requiresMailingAddress = getRequiresMailingAddress(selectedServices);

  for (let step = 1; step <= 4; step += 1) {
    const validationMessage = validateAutomotiveBookingStep(
      step,
      form,
      requiresMailingAddress,
    );

    if (validationMessage) {
      throw new Error(validationMessage);
    }
  }

  return {
    requiresMailingAddress,
    selectedServices,
    summary: buildAutomotiveBookingSummary(form),
  };
};
