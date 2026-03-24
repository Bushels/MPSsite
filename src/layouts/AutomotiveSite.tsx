import { useCallback, useEffect, useMemo, useState } from 'react';
import { AutomotiveNav } from '../components/AutomotiveNav';
import { buildAppointmentDays, type AppointmentDay } from '../data/automotive';
import { companyProfile } from '../data/company';
import { AutomotiveFooter } from '../sections/automotive/AutomotiveFooter';
import { AutomotiveHero } from '../sections/automotive/AutomotiveHero';
import { BookingWizard } from '../sections/automotive/BookingWizard';
import { InStoreProducts } from '../sections/automotive/InStoreProducts';
import { ServiceCatalog } from '../sections/automotive/ServiceCatalog';
import { TrustInfo } from '../sections/automotive/TrustInfo';
import { ChatWidget } from '../components/ChatWidget';
import { trackEvent, trackLeadEvent } from '../services/analytics';
import { fetchAvailableAppointmentDays } from '../services/availabilityApi';
import styles from './AutomotiveSite.module.css';

export const AutomotiveSite = () => {
  const [selectedServiceIds, setSelectedServiceIds] = useState<readonly string[]>([]);

  // Start with static slots (instant render), then swap in live availability
  const staticDays = useMemo(() => buildAppointmentDays(), []);
  const [appointmentDays, setAppointmentDays] = useState<readonly AppointmentDay[]>(staticDays);

  // Fetch real availability from Supabase on mount
  const refreshAvailability = useCallback(async () => {
    try {
      const liveDays = await fetchAvailableAppointmentDays();
      setAppointmentDays(liveDays);
    } catch {
      // Fall back to static days if Supabase is unreachable
      console.warn('Live availability unavailable — using static slots');
    }
  }, []);

  useEffect(() => {
    refreshAvailability();
  }, [refreshAvailability]);

  const focusBookingHeading = () => {
    const bookingTitle = document.getElementById('booking-title');
    if (bookingTitle instanceof HTMLElement) {
      bookingTitle.focus({ preventScroll: true });
    }
  };

  const nextAvailableLabel = useMemo(() => {
    const firstDay = appointmentDays[0];
    const firstSlot = firstDay?.slots[0];

    if (!firstDay || !firstSlot) {
      return 'Call for the first opening';
    }

    return `${firstDay.fullLabel} at ${firstSlot.label}`;
  }, [appointmentDays]);

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceIds((currentIds) => {
      const nextIds = currentIds.includes(serviceId)
        ? currentIds.filter((id) => id !== serviceId)
        : [...currentIds, serviceId];

      return nextIds;
    });

    const shouldJumpToBooking = window.matchMedia('(max-width: 780px)').matches;
    if (shouldJumpToBooking) {
      const bookingSection = document.getElementById('booking');
      bookingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(focusBookingHeading, 180);
    }
  };

  const handleServiceSelectionChange = (serviceIds: readonly string[]) => {
    setSelectedServiceIds(serviceIds);
  };

  useEffect(() => {
    trackEvent('auto_page_view', {
      source: document.referrer || 'direct',
    });
  }, []);

  return (
    <div className={styles.page}>
      <AutomotiveNav bookingHref="#booking" />

      <main className={styles.main}>
        <AutomotiveHero
          bookingHref="#booking"
          nextAvailableLabel={nextAvailableLabel}
          productsHref="#products"
        />

        <ServiceCatalog
          bookingHref="#booking"
          selectedServiceIds={selectedServiceIds}
          onSelectService={handleSelectService}
        />

        <BookingWizard
          selectedServiceIds={selectedServiceIds}
          onSelectedServiceIdsChange={handleServiceSelectionChange}
        />

        <InStoreProducts bookingHref="#booking" />

        <TrustInfo />
      </main>

      <div className={styles.mobileBar}>
        <a
          href={companyProfile.primaryPhoneHref}
          className={styles.mobileCall}
          onClick={() => trackLeadEvent('auto_call_click', { location: 'mobile_bar' })}
        >
          Call
        </a>
        <a href="#booking" className={styles.mobileBook}>
          Book now
        </a>
      </div>

      <AutomotiveFooter />
      <ChatWidget />
    </div>
  );
};
