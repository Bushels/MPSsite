import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { automotiveServices } from '../../data/automotive';
import { companyProfile } from '../../data/company';
import { useBookingWizard } from '../../hooks/useBookingWizard';
import { trackEvent, trackLeadEvent } from '../../services/analytics';
import styles from './BookingWizard.module.css';

const STEP_LABELS = ['Service', 'Vehicle', 'Date & Time', 'Confirm'] as const;

export interface BookingWizardProps {
  selectedServiceIds: readonly string[];
  onSelectedServiceIdsChange: (serviceIds: readonly string[]) => void;
}

const arraysMatch = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length && left.every((value) => right.includes(value));

export const BookingWizard = ({
  selectedServiceIds,
  onSelectedServiceIdsChange,
}: Readonly<BookingWizardProps>) => {
  const {
    appointmentDay,
    appointmentDays,
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
    setFormField,
    step,
    stepError,
    submitBooking,
    submittedBooking,
    summary,
    years,
  } = useBookingWizard();

  useEffect(() => {
    if (!arraysMatch(form.selectedServiceIds, selectedServiceIds)) {
      setFormField('selectedServiceIds', [...selectedServiceIds]);
    }
  }, [form.selectedServiceIds, selectedServiceIds, setFormField]);

  useEffect(() => {
    trackEvent('auto_booking_step', {
      step,
      service: selectedServices[0]?.id ?? 'unscoped',
    });
  }, [selectedServices, step]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (step > 1 && !submittedBooking) {
        trackEvent('auto_booking_abandoned', {
          step,
          service: selectedServices[0]?.id ?? 'unscoped',
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedServices, step, submittedBooking]);

  const handleServiceToggle = (serviceId: string) => {
    const service = automotiveServices.find((item) => item.id === serviceId);
    const nextServiceIds = form.selectedServiceIds.includes(serviceId)
      ? form.selectedServiceIds.filter((id) => id !== serviceId)
      : [...form.selectedServiceIds, serviceId];

    setFormField('selectedServiceIds', nextServiceIds);
    onSelectedServiceIdsChange(nextServiceIds);

    if (service) {
      trackEvent('auto_service_selected', {
        service: service.id,
        price: service.priceLabel,
        sgi: service.sgiRelated,
      });
    }
  };

  const handleSubmit = async () => {
    const result = await submitBooking();
    if (!result) {
      return;
    }

    trackLeadEvent('auto_booking_submitted', {
      service: result.summary.serviceLabel,
      vehicle: result.summary.vehicleLabel,
      date: result.summary.slotLabel,
      delivery_mode: result.deliveryMode,
    });
  };

  return (
    <section id="booking" className={styles.section} aria-labelledby="booking-title">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Booking flow</span>
        <h2 id="booking-title" className={styles.title} tabIndex={-1}>
          Four quick steps to get the work on the calendar.
        </h2>
        <p className={styles.copy}>
          Choose the service, add the vehicle, pick a time, and leave the shop the details it
          needs before you arrive.
        </p>
      </div>

      <div className={styles.layout}>
        <div className={styles.primaryPanel}>
          <div className={styles.progress}>
            {STEP_LABELS.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === step;
              const isComplete = stepNumber < step || Boolean(submittedBooking);

              return (
                <button
                  key={label}
                  type="button"
                  className={`${styles.progressStep} ${isActive ? styles.progressStepActive : ''}`}
                  onClick={() => goToStep(stepNumber)}
                >
                  <span
                    className={`${styles.progressIndex} ${isComplete ? styles.progressIndexComplete : ''}`}
                  >
                    {stepNumber}
                  </span>
                  <span className={styles.progressLabel}>{label}</span>
                </button>
              );
            })}

            <div className={styles.progressBar} aria-hidden="true">
              <div
                className={styles.progressFill}
                style={{ transform: `scaleX(${submittedBooking ? 1 : step / 4})` }}
              />
            </div>
          </div>

          {!submittedBooking ? (
            <motion.div
              key={`step-${step}`}
              className={styles.stepPanel}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 1 ? (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepEyebrow}>Step 1 of 4</span>
                    <h3>Select service scope</h3>
                    <p>Choose at least one service, or describe the issue if the request is broader.</p>
                  </div>

                  <div className={styles.serviceGrid}>
                    {automotiveServices.map((service) => {
                      const isSelected = form.selectedServiceIds.includes(service.id);

                      return (
                        <button
                          key={service.id}
                          type="button"
                          className={`${styles.serviceOption} ${isSelected ? styles.serviceOptionActive : ''}`}
                          onClick={() => handleServiceToggle(service.id)}
                          aria-pressed={isSelected}
                        >
                          <span className={styles.serviceOptionTitle}>{service.shortName}</span>
                          <span className={styles.serviceOptionMeta}>
                            {service.durationLabel} / {service.priceLabel}
                          </span>
                          <p>{service.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  <label className={styles.field} htmlFor="booking-issue-description">
                    <span>Not sure? Describe the issue</span>
                    <p id="booking-issue-description-help" className={styles.fieldHint}>
                      Describe the symptom or request so the bay can be staged properly before the
                      vehicle lands.
                    </p>
                    <textarea
                      id="booking-issue-description"
                      value={form.issueDescription}
                      onChange={(event) => setFormField('issueDescription', event.target.value)}
                      aria-describedby="booking-issue-description-help"
                      placeholder="Brake pulse, fleet check, spring inspection, no-start issue, or any other note that helps the shop stage the bay."
                      rows={5}
                    />
                  </label>
                </div>
              ) : null}

              {step === 2 ? (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepEyebrow}>Step 2 of 4</span>
                    <h3>Vehicle information</h3>
                    <p>Year, make, model, then any technician notes that would change scheduling.</p>
                  </div>

                  <div className={styles.formGrid}>
                    <label className={styles.field} htmlFor="booking-year">
                      <span>Year</span>
                      <select
                        id="booking-year"
                        value={form.year}
                        onChange={(event) => setFormField('year', event.target.value)}
                      >
                        <option value="">Select year</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={styles.field} htmlFor="booking-make">
                      <span>Make</span>
                      <select
                        id="booking-make"
                        value={form.make}
                        onChange={(event) => setFormField('make', event.target.value)}
                      >
                        <option value="">Select make</option>
                        {makes.map((make) => (
                          <option key={make} value={make}>
                            {make}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={styles.field} htmlFor="booking-model">
                      <span>Model</span>
                      <select
                        id="booking-model"
                        value={form.model}
                        onChange={(event) => setFormField('model', event.target.value)}
                        disabled={!form.make}
                      >
                        <option value="">Select model</option>
                        {models.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {requiresMailingAddress ? (
                    <fieldset className={styles.sizeSelector}>
                      <legend>Help us time the SGI inspection</legend>
                      <label
                        className={
                          form.vehicleSize === 'small' ? styles.sizeOptionActive : styles.sizeOption
                        }
                      >
                        <input
                          type="radio"
                          name="booking-vehicle-size"
                          value="small"
                          checked={form.vehicleSize === 'small'}
                          onChange={() => setFormField('vehicleSize', 'small')}
                          className={styles.sizeInput}
                        />
                        <span className={styles.sizeOptionTitle}>Small to half-ton</span>
                        <span className={styles.sizeOptionCopy}>
                          Standard timing for cars, SUVs, and light pickups.
                        </span>
                      </label>
                      <label
                        className={
                          form.vehicleSize === 'large' ? styles.sizeOptionActive : styles.sizeOption
                        }
                      >
                        <input
                          type="radio"
                          name="booking-vehicle-size"
                          value="large"
                          checked={form.vehicleSize === 'large'}
                          onChange={() => setFormField('vehicleSize', 'large')}
                          className={styles.sizeInput}
                        />
                        <span className={styles.sizeOptionTitle}>Large / heavy-duty</span>
                        <span className={styles.sizeOptionCopy}>
                          Gives the shop more room for heavier trucks and a larger inspection scope.
                        </span>
                      </label>
                    </fieldset>
                  ) : null}

                  <label className={styles.field} htmlFor="booking-notes">
                    <span>Additional notes</span>
                    <p id="booking-notes-help" className={styles.fieldHint}>
                      Add tire, brake, or fleet context that changes technician prep.
                    </p>
                    <textarea
                      id="booking-notes"
                      value={form.notes}
                      onChange={(event) => setFormField('notes', event.target.value)}
                      aria-describedby="booking-notes-help"
                      placeholder="Tire set on rims, vibration under braking, PO note, or anything the tech should know before the vehicle lands."
                      rows={5}
                    />
                  </label>
                </div>
              ) : null}

              {step === 3 ? (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepEyebrow}>Step 3 of 4</span>
                    <h3>Date and time</h3>
                    <p>Choose an opening. If nothing fits, the visible phone line becomes the manual override.</p>
                  </div>

                  <div className={styles.dayPicker}>
                    {appointmentDays.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        className={day.id === form.appointmentDayId ? styles.dayOptionActive : styles.dayOption}
                        onClick={() => setFormField('appointmentDayId', day.id)}
                      >
                        <span>{day.shortLabel}</span>
                        <strong>{day.fullLabel}</strong>
                      </button>
                    ))}
                  </div>

                  <div className={styles.slotPanel}>
                    <div className={styles.slotHeader}>
                      <h4>{appointmentDay?.fullLabel ?? 'Select a booking day'}</h4>
                      <p>{appointmentDay?.note}</p>
                    </div>

                    <div className={styles.slotGrid}>
                      {appointmentDay?.slots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          className={slot.id === form.appointmentSlotId ? styles.slotOptionActive : styles.slotOption}
                          onClick={() => setAppointmentSlot(slot)}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepEyebrow}>Step 4 of 4</span>
                    <h3>Contact and confirm</h3>
                    <p>Get the callback details right. SGI bookings also ask for mailing details for paperwork.</p>
                  </div>

                  <div className={styles.formGrid}>
                    <label className={styles.field} htmlFor="booking-full-name">
                      <span>Full name</span>
                      <input
                        id="booking-full-name"
                        type="text"
                        autoComplete="name"
                        value={form.fullName}
                        onChange={(event) => setFormField('fullName', event.target.value)}
                      />
                    </label>

                    <label className={styles.field} htmlFor="booking-phone">
                      <span>Phone number</span>
                      <input
                        id="booking-phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(event) => setFormField('phone', event.target.value)}
                      />
                    </label>

                    <label className={styles.field} htmlFor="booking-email">
                      <span>Email</span>
                      <input
                        id="booking-email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(event) => setFormField('email', event.target.value)}
                      />
                    </label>
                  </div>

                  {requiresMailingAddress ? (
                    <div className={styles.formGrid}>
                      <label className={`${styles.field} ${styles.fieldWide}`} htmlFor="booking-mailing-address">
                        <span>Mailing address</span>
                        <input
                          id="booking-mailing-address"
                          type="text"
                          autoComplete="address-line1"
                          value={form.mailingAddress}
                          onChange={(event) => setFormField('mailingAddress', event.target.value)}
                        />
                      </label>

                      <label className={styles.field} htmlFor="booking-city">
                        <span>City</span>
                        <input
                          id="booking-city"
                          type="text"
                          autoComplete="address-level2"
                          value={form.city}
                          onChange={(event) => setFormField('city', event.target.value)}
                        />
                      </label>

                      <label className={styles.field} htmlFor="booking-province">
                        <span>Province</span>
                        <input
                          id="booking-province"
                          type="text"
                          autoComplete="address-level1"
                          value={form.province}
                          onChange={(event) => setFormField('province', event.target.value)}
                        />
                      </label>

                      <label className={styles.field} htmlFor="booking-postal-code">
                        <span>Postal code</span>
                        <input
                          id="booking-postal-code"
                          type="text"
                          autoComplete="postal-code"
                          value={form.postalCode}
                          onChange={(event) => setFormField('postalCode', event.target.value)}
                        />
                      </label>
                    </div>
                  ) : null}

                  <div className={styles.notice}>
                    Reminder texts, final slot locking, and online payment are future upgrades.
                    The booking intake itself is already structured and ready to use.
                  </div>
                </div>
              ) : null}

              {stepError ? <p className={styles.error}>{stepError}</p> : null}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={step === 1 ? undefined : goToPreviousStep}
                  disabled={step === 1}
                >
                  Back
                </button>

                {step < 4 ? (
                  <button type="button" className={styles.primaryAction} onClick={goToNextStep}>
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.primaryAction}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Confirm booking'}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              className={styles.successPanel}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className={styles.successEyebrow}>Booking summary created</span>
              <h3>{submittedBooking.confirmationCode}</h3>
              <p>
                {submittedBooking.deliveryMode === 'forwarded'
                  ? 'The booking handoff reached the configured backend destination.'
                  : 'Preview mode stored the booking payload locally. Add the webhook env vars before a production launch.'}
              </p>

              <dl className={styles.successSummary}>
                <div>
                  <dt>Service</dt>
                  <dd>{submittedBooking.summary.serviceLabel}</dd>
                </div>
                <div>
                  <dt>Vehicle</dt>
                  <dd>{submittedBooking.summary.vehicleLabel}</dd>
                </div>
                <div>
                  <dt>Slot</dt>
                  <dd>{submittedBooking.summary.slotLabel}</dd>
                </div>
                <div>
                  <dt>Ready window</dt>
                  <dd>{submittedBooking.summary.readyLabel}</dd>
                </div>
              </dl>

              <div className={styles.successActions}>
                <a
                  href={companyProfile.primaryPhoneHref}
                  className={styles.secondaryAction}
                  onClick={() => trackLeadEvent('auto_call_click', { location: 'confirmation' })}
                >
                  Call the shop
                </a>
                <a href="/" className={styles.primaryAction}>
                  Back to MPS Group
                </a>
              </div>
            </motion.div>
          )}
        </div>

        <aside className={styles.summaryPanel}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Booking summary</span>
            <h3>{summary.serviceLabel}</h3>

            <div className={styles.summaryRows}>
              <div>
                <span>Estimated price</span>
                <strong>{summary.priceLabel}</strong>
              </div>
              <div>
                <span>Estimated duration</span>
                <strong>{summary.durationLabel}</strong>
              </div>
              <div>
                <span>Selected slot</span>
                <strong>{summary.slotLabel}</strong>
              </div>
              <div>
                <span>Completion</span>
                <strong>{summary.readyLabel}</strong>
              </div>
            </div>

            <div className={styles.summaryMeta}>
              <span>Inspection paperwork</span>
              <strong>
                {requiresMailingAddress
                  ? 'Mailing address required'
                  : 'No SGI mailing fields needed'}
              </strong>
            </div>

            <a
              href={companyProfile.primaryPhoneHref}
              className={styles.callLink}
              onClick={() => trackLeadEvent('auto_call_click', { location: 'booking_sidebar' })}
            >
              Prefer to call? {companyProfile.primaryPhoneDisplay}
            </a>
          </div>

          <div className={styles.sidebarNote}>
            <span className={styles.sidebarLabel}>Need help instead?</span>
            <p>
              If the request is unusual, the vehicle is oversized, or the timing is tight, call
              the shop and we can handle it the old-fashioned way.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};
