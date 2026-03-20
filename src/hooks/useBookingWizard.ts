import { useMemo, useState } from 'react';
import { buildAppointmentDays, buildVehicleYears, type AppointmentSlot, vehicleCatalog } from '../data/automotive';
import {
  INITIAL_AUTOMOTIVE_BOOKING_FORM,
  buildAutomotiveBookingSummary,
  getAutomotiveAppointmentSelection,
  getRequiresMailingAddress,
  getSelectedAutomotiveServices,
  type AutomotiveBookingFormData,
  type AutomotiveBookingSummary,
  type SubmittedAutomotiveBooking,
  validateAutomotiveBookingStep,
} from '../lib/automotiveBooking';
import { submitAutomotiveBooking } from '../services/automotiveBookingApi';

export type BookingWizardFormState = AutomotiveBookingFormData;
export type BookingSummary = AutomotiveBookingSummary;
export type SubmittedBooking = SubmittedAutomotiveBooking;

export const useBookingWizard = () => {
  const appointmentDays = useMemo(() => buildAppointmentDays(), []);
  const years = useMemo(() => buildVehicleYears(), []);
  const makes = useMemo(() => Object.keys(vehicleCatalog), []);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BookingWizardFormState>({
    ...INITIAL_AUTOMOTIVE_BOOKING_FORM,
    appointmentDayId: appointmentDays[0]?.id ?? '',
  });
  const [stepError, setStepError] = useState<string | null>(null);
  const [submittedBooking, setSubmittedBooking] = useState<SubmittedBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedServices = useMemo(
    () => getSelectedAutomotiveServices(form.selectedServiceIds),
    [form.selectedServiceIds],
  );

  const models = useMemo(() => (form.make ? vehicleCatalog[form.make] ?? [] : []), [form.make]);

  const requiresMailingAddress = getRequiresMailingAddress(selectedServices);

  const { appointmentDay, appointmentSlot } = useMemo(
    () =>
      getAutomotiveAppointmentSelection(
        appointmentDays,
        form.appointmentDayId,
        form.appointmentSlotId,
      ),
    [appointmentDays, form.appointmentDayId, form.appointmentSlotId],
  );

  const summary = useMemo<BookingSummary>(
    () => buildAutomotiveBookingSummary(form, appointmentDays),
    [appointmentDays, form],
  );

  const updateField = <K extends keyof BookingWizardFormState>(
    field: K,
    value: BookingWizardFormState[K],
  ) => {
    setStepError(null);

    setForm((currentForm) => {
      if (field === 'make') {
        return {
          ...currentForm,
          make: value as BookingWizardFormState['make'],
          model: '',
        };
      }

      if (field === 'appointmentDayId') {
        return {
          ...currentForm,
          appointmentDayId: value as BookingWizardFormState['appointmentDayId'],
          appointmentSlotId: '',
          appointmentSlotIsoStart: '',
        };
      }

      return {
        ...currentForm,
        [field]: value,
      };
    });
  };

  const setAppointmentSlot = (slot: AppointmentSlot) => {
    setStepError(null);
    setForm((currentForm) => ({
      ...currentForm,
      appointmentSlotId: slot.id,
      appointmentSlotIsoStart: slot.isoStart,
    }));
  };

  const goToStep = (nextStep: number) => {
    if (nextStep < 1 || nextStep > 4) {
      return false;
    }

    if (nextStep > step) {
      for (let currentStep = step; currentStep < nextStep; currentStep += 1) {
        const validationMessage = validateAutomotiveBookingStep(
          currentStep,
          form,
          requiresMailingAddress,
        );
        if (validationMessage) {
          setStepError(validationMessage);
          return false;
        }
      }
    }

    setStepError(null);
    setStep(nextStep);
    return true;
  };

  const goToNextStep = () => goToStep(step + 1);

  const goToPreviousStep = () => {
    setStepError(null);
    setStep((currentStep) => Math.max(1, currentStep - 1));
  };

  const submitBooking = async () => {
    for (let currentStep = 1; currentStep <= 4; currentStep += 1) {
      const validationMessage = validateAutomotiveBookingStep(
        currentStep,
        form,
        requiresMailingAddress,
      );
      if (validationMessage) {
        setStepError(validationMessage);
        return null;
      }
    }

    setIsSubmitting(true);
    setStepError(null);

    try {
      const nextSubmittedBooking = await submitAutomotiveBooking(form);
      setSubmittedBooking(nextSubmittedBooking);
      return nextSubmittedBooking;
    } catch (error) {
      setStepError(
        error instanceof Error
          ? error.message
          : 'Booking handoff failed. Call the shop while the integration is finished.',
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    appointmentDays,
    appointmentDay,
    appointmentSlot,
    form,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    isSubmitting,
    makes,
    models,
    requiresMailingAddress,
    selectedServices,
    setAppointmentSlot,
    setFormField: updateField,
    step,
    stepError,
    submitBooking,
    submittedBooking,
    summary,
    years,
  };
};
