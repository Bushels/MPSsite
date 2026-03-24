/**
 * Fetches real availability from Supabase by generating template slots
 * then removing any that already have a booking.
 *
 * This replaces the hardcoded `buildAppointmentDays()` function.
 */

import { companyProfile } from '../data/company';
import type { AppointmentDay, AppointmentSlot } from '../data/automotive';
import { supabaseRest } from '../lib/supabaseClient';

// Same 3 daily slot templates the shop uses today
const SERVICE_SLOT_TEMPLATES = [
  { id: '0900', hour: 9, minute: 0 },
  { id: '1130', hour: 11, minute: 30 },
  { id: '1430', hour: 14, minute: 30 },
] as const;

const DAY_LABEL_FORMAT = new Intl.DateTimeFormat('en-CA', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: companyProfile.bookingTimeZone,
});

const FULL_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {
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

const toLocalDateId = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface BookedSlotRow {
  appointment_date: string;
  appointment_slot: string;
}

/**
 * Fetch booked slots from Supabase for a date range.
 * Returns a Set of "YYYY-MM-DD|slotId" strings for fast lookup.
 */
const fetchBookedSlots = async (
  startDate: string,
  endDate: string,
): Promise<Set<string>> => {
  const { data, error } = await supabaseRest<BookedSlotRow[]>('bookings', {
    select: 'appointment_date,appointment_slot',
    appointment_date: `gte.${startDate}`,
    'appointment_date@2': `lte.${endDate}`,   // PostgREST range filter
    status: 'in.(pending,confirmed)',
  });

  if (error || !data) {
    // On error, show all slots (fail-open so customers can still book)
    console.warn('Failed to fetch booked slots:', error);
    return new Set();
  }

  return new Set(data.map((row) => `${row.appointment_date}|${row.appointment_slot}`));
};

/**
 * Build available appointment days by generating template slots
 * and filtering out any that are already booked in Supabase.
 *
 * Drop-in async replacement for the old `buildAppointmentDays()`.
 */
export const fetchAvailableAppointmentDays = async (
  count = 5,
  referenceDate = new Date(),
): Promise<readonly AppointmentDay[]> => {
  // Generate candidate weekdays
  const candidateDays: { date: Date; isoDate: string }[] = [];
  const cursor = new Date(referenceDate);
  cursor.setHours(0, 0, 0, 0);

  while (candidateDays.length < count) {
    const weekday = cursor.getDay();
    if (weekday !== 0 && weekday !== 6) {
      candidateDays.push({
        date: new Date(cursor),
        isoDate: toLocalDateId(cursor),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  // Fetch which slots are already taken
  const startDate = candidateDays[0]?.isoDate ?? '';
  const endDate = candidateDays[candidateDays.length - 1]?.isoDate ?? '';
  const bookedSlots = await fetchBookedSlots(startDate, endDate);

  // Build days with only available slots
  const days: AppointmentDay[] = [];

  for (const { date, isoDate } of candidateDays) {
    const availableSlots: AppointmentSlot[] = [];

    for (const { id, hour, minute } of SERVICE_SLOT_TEMPLATES) {
      const slotKey = `${isoDate}|${id}`;
      if (bookedSlots.has(slotKey)) continue; // Slot taken

      // Don't show past slots for today
      const slotDate = new Date(date);
      slotDate.setHours(hour, minute, 0, 0);
      if (slotDate.getTime() < Date.now()) continue;

      availableSlots.push({
        id: `${isoDate}-${id}`,
        isoStart: slotDate.toISOString(),
        label: TIME_FORMAT.format(slotDate),
      });
    }

    // Only show days that have at least one available slot
    if (availableSlots.length === 0) continue;

    days.push({
      id: isoDate,
      isoDate,
      shortLabel: DAY_LABEL_FORMAT.format(date),
      fullLabel: FULL_DATE_FORMAT.format(date),
      note:
        days.length === 0
          ? 'Earliest openings move fastest during inspection season.'
          : 'Need a different window? Call the shop and we can stage a manual hold.',
      slots: availableSlots,
    });
  }

  return days;
};
