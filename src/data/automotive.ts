import { companyProfile } from './company.js';

export interface AutomotiveService {
  id: string;
  name: string;
  shortName: string;
  description: string;
  priceLabel: string;
  durationLabel: string;
  sgiRelated: boolean;
  featured: boolean;
  priceRange: Readonly<{
    min: number;
    max: number;
  }>;
  durationRange: Readonly<{
    minMinutes: number;
    maxMinutes: number;
  }>;
}

export interface AppointmentSlot {
  id: string;
  isoStart: string;
  label: string;
}

export interface AppointmentDay {
  id: string;
  isoDate: string;
  shortLabel: string;
  fullLabel: string;
  note: string;
  slots: readonly AppointmentSlot[];
}

export interface TrustItem {
  title: string;
  description: string;
}

export interface ProductShowcase {
  id: string;
  title: string;
  description: string;
  availabilityLabel: string;
  brands: readonly string[];
  products: readonly string[];
}

export interface ContactDetail {
  label: string;
  value: string;
  href?: string;
}

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

export const automotiveServices: readonly AutomotiveService[] = [
  {
    id: 'sgi-inspection',
    name: 'SGI Safety Inspection',
    shortName: 'SGI Inspection',
    description:
      'Mandatory safety certification with a 93-point SGI checklist covering brakes, tires, steering, lights, glass, and core roadworthiness items.',
    priceLabel: '$129-$270',
    durationLabel: '1.5-2.0 hr',
    sgiRelated: true,
    featured: true,
    priceRange: { min: 129, max: 270 },
    durationRange: { minMinutes: 90, maxMinutes: 120 },
  },
  {
    id: 'oil-conventional',
    name: 'Oil Change (Conventional)',
    shortName: 'Conventional Oil',
    description:
      'Fast-turn maintenance for daily drivers and work trucks with fresh oil, filter service, and a quick underhood check.',
    priceLabel: '$60-$90',
    durationLabel: '30-45 min',
    sgiRelated: false,
    featured: false,
    priceRange: { min: 60, max: 90 },
    durationRange: { minMinutes: 30, maxMinutes: 45 },
  },
  {
    id: 'oil-synthetic',
    name: 'Oil Change (Full Synthetic)',
    shortName: 'Synthetic Oil',
    description:
      'Synthetic oil service for heavier-duty cycles, colder starts, and customers who want longer-life fluid performance.',
    priceLabel: '$90-$120',
    durationLabel: '30-45 min',
    sgiRelated: false,
    featured: false,
    priceRange: { min: 90, max: 120 },
    durationRange: { minMinutes: 30, maxMinutes: 45 },
  },
  {
    id: 'tire-service',
    name: 'Tire Change / Rotation',
    shortName: 'Tire Service',
    description:
      'Seasonal changeovers, rotations, and basic condition checks to keep tread wear even and downtime low.',
    priceLabel: '$40-$100',
    durationLabel: '30-60 min',
    sgiRelated: false,
    featured: false,
    priceRange: { min: 40, max: 100 },
    durationRange: { minMinutes: 30, maxMinutes: 60 },
  },
  {
    id: 'brake-inspection',
    name: 'Brake Inspection',
    shortName: 'Brake Inspection',
    description:
      'Free brake condition review covering pads, rotors, hydraulics, and wear patterns before you commit to repairs.',
    priceLabel: 'Free',
    durationLabel: '30-45 min',
    sgiRelated: false,
    featured: false,
    priceRange: { min: 0, max: 0 },
    durationRange: { minMinutes: 30, maxMinutes: 45 },
  },
  {
    id: 'general-maintenance',
    name: 'General Maintenance',
    shortName: 'General Maintenance',
    description:
      'Catch-all booking for diagnostics, odd noises, seasonal checkups, or maintenance that does not fit a preset service card.',
    priceLabel: '$100-$300',
    durationLabel: '1.0-2.0 hr',
    sgiRelated: false,
    featured: true,
    priceRange: { min: 100, max: 300 },
    durationRange: { minMinutes: 60, maxMinutes: 120 },
  },
  {
    id: 'fleet-pretrip',
    name: 'Fleet / Pre-Trip Inspection',
    shortName: 'Fleet Inspection',
    description:
      'Inspection time blocks for work vehicles, pre-trip checks, and operators who need faster scheduling than a phone-only shop.',
    priceLabel: '$80-$150',
    durationLabel: '45-60 min',
    sgiRelated: true,
    featured: false,
    priceRange: { min: 80, max: 150 },
    durationRange: { minMinutes: 45, maxMinutes: 60 },
  },
] as const;

export const vehicleCatalog: Readonly<Record<string, readonly string[]>> = {
  Chevrolet: ['Silverado 1500', 'Silverado 2500HD', 'Equinox', 'Tahoe', 'Suburban'],
  Ford: ['F-150', 'F-250 Super Duty', 'Escape', 'Explorer', 'Transit'],
  GMC: ['Sierra 1500', 'Sierra 2500HD', 'Terrain', 'Yukon', 'Savana'],
  Honda: ['Civic', 'CR-V', 'Pilot', 'Ridgeline'],
  Hyundai: ['Elantra', 'Santa Fe', 'Tucson', 'Palisade'],
  Jeep: ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Wrangler'],
  Nissan: ['Altima', 'Frontier', 'Murano', 'Pathfinder', 'Rogue'],
  Ram: ['1500', '2500', '3500', 'ProMaster'],
  Toyota: ['4Runner', 'Camry', 'Corolla', 'Highlander', 'RAV4', 'Tacoma', 'Tundra'],
} as const;

export const automotiveHeroHighlights: readonly TrustItem[] = [
  {
    title: 'Neighbourly feel',
    description:
      'Built for local families, work trucks, and drivers moving through the Cold Lake corridor.',
  },
  {
    title: 'Clear before arrival',
    description: 'See the usual time and price range before the vehicle ever hits the yard.',
  },
  {
    title: 'Easy to call',
    description: 'The shop line stays visible for anyone who would rather talk it through first.',
  },
] as const;

export const inspectionCoverage: readonly TrustItem[] = [
  {
    title: 'Brakes, tires, and steering',
    description: 'Pads, rotors, hydraulics, tread depth, inflation, steering, and suspension points.',
  },
  {
    title: 'Lights, glass, and visibility',
    description: 'Signals, headlights, mirrors, windshield condition, wipers, and defroster checks.',
  },
  {
    title: 'Electrical and driveline basics',
    description: 'Battery, fluid checks, exhaust, and core driveline safety items required for SGI compliance.',
  },
] as const;

export const bookingPrepChecklist: readonly string[] = [
  'Wash the vehicle before arrival so inspection points stay visible.',
  'Remove loose interior items and have registration ready at check-in.',
  'Allow 1.5 to 2.0 hours for SGI inspections depending on vehicle size.',
  'Call ahead if you are booking fleet units or oversized work trucks.',
] as const;

export const automotiveContactDetails: readonly ContactDetail[] = [
  {
    label: 'Location',
    value: companyProfile.automotiveLocationLabel,
    href: companyProfile.mapUrl,
  },
  {
    label: 'Phone',
    value: companyProfile.primaryPhoneDisplay,
    href: companyProfile.primaryPhoneHref,
  },
  {
    label: 'Fax',
    value: companyProfile.faxDisplay,
  },
  {
    label: 'Email',
    value: companyProfile.primaryEmail,
    href: companyProfile.primaryEmailHref,
  },
  {
    label: 'Hours',
    value: 'Call to confirm current automotive shop hours',
  },
] as const;

export const bookingAssurancePoints: readonly TrustItem[] = [
  {
    title: 'One place for common work',
    description: 'SGI inspections, oil changes, tires, brakes, and general maintenance live in one booking flow.',
  },
  {
    title: 'Good fit for work vehicles',
    description: 'Pre-trip and fleet requests can be staged without a long back-and-forth before the unit arrives.',
  },
  {
    title: 'Straightforward intake',
    description: 'Customers can leave the shop a clean record of the issue, the vehicle, and the time that works.',
  },
] as const;

export const storeBrandHighlights: readonly string[] = [
  'Castrol',
  'Mobil 1',
  'Valvoline',
  'FRAM',
  'Rain-X',
  'BlueDEF',
  'Prestone',
  'Sylvania',
] as const;

export const productShowcase: readonly ProductShowcase[] = [
  {
    id: 'fluids',
    title: 'Oils, fluids, and additives',
    description:
      'A future Wix shelf can show the everyday maintenance products customers already ask for at the counter.',
    availabilityLabel: 'Future Wix pickup shelf',
    brands: ['Castrol', 'Mobil 1', 'Valvoline', 'Prestone'],
    products: ['Full synthetic oil', 'Conventional oil', 'Coolant and washer fluid', 'DEF and fuel additives'],
  },
  {
    id: 'filters',
    title: 'Filters and tune-up basics',
    description:
      'Good add-on items for service appointments, fleet units, and customers who want a few basics ready at pickup.',
    availabilityLabel: 'Mockup category',
    brands: ['FRAM', 'Mobil 1', 'Sylvania'],
    products: ['Oil filters', 'Air and cabin filters', 'Spark plugs', 'Bulbs and fuses'],
  },
  {
    id: 'seasonal',
    title: 'Seasonal shelf staples',
    description:
      'A simple storefront can also surface the quick-pick items that move before winter, spring breakup, and lake season.',
    availabilityLabel: 'Mockup category',
    brands: ['Rain-X', 'BlueDEF', 'Prestone'],
    products: ['Wiper blades', 'Washer fluid', 'DEF jugs', 'Glass and cleaning products'],
  },
] as const;

export const buildVehicleYears = (startYear = new Date().getFullYear()): readonly string[] =>
  Array.from({ length: 28 }, (_, index) => String(startYear - index));

export const buildAppointmentDays = (
  count = 5,
  referenceDate = new Date(),
): readonly AppointmentDay[] => {
  const days: AppointmentDay[] = [];
  const cursor = new Date(referenceDate);
  cursor.setHours(0, 0, 0, 0);

  while (days.length < count) {
    const weekday = cursor.getDay();
    // Weekend slots stay closed until the shop confirms Saturday support.
    if (weekday !== 0 && weekday !== 6) {
      const isoDate = toLocalDateId(cursor);
      const slots = SERVICE_SLOT_TEMPLATES.map(({ id, hour, minute }) => {
        const slotDate = new Date(cursor);
        slotDate.setHours(hour, minute, 0, 0);

        return {
          id: `${isoDate}-${id}`,
          isoStart: slotDate.toISOString(),
          label: TIME_FORMAT.format(slotDate),
        };
      });

      days.push({
        id: isoDate,
        isoDate,
        shortLabel: DAY_LABEL_FORMAT.format(cursor),
        fullLabel: FULL_DATE_FORMAT.format(cursor),
        note:
          days.length === 0
            ? 'Earliest openings move fastest during inspection season.'
            : 'Need a different window? Call the shop and we can stage a manual hold.',
        slots,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

export const formatMoneyRange = (min: number, max: number): string => {
  if (min === 0 && max === 0) {
    return 'Free';
  }

  if (min === max) {
    return `$${min}`;
  }

  return `$${min}-$${max}`;
};

const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (remainder === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainder} min`;
};

export const formatDurationRange = (minMinutes: number, maxMinutes: number): string => {
  if (minMinutes === maxMinutes) {
    return formatMinutes(minMinutes);
  }

  return `${formatMinutes(minMinutes)}-${formatMinutes(maxMinutes)}`;
};

export const formatReadyWindow = (
  isoStart: string,
  minMinutes: number,
  maxMinutes: number,
): string => {
  const start = new Date(isoStart);
  const minReady = new Date(start.getTime() + minMinutes * 60_000);
  const maxReady = new Date(start.getTime() + maxMinutes * 60_000);

  if (minMinutes === maxMinutes) {
    return `Ready by about ${TIME_FORMAT.format(minReady)}`;
  }

  return `Ready around ${TIME_FORMAT.format(minReady)}-${TIME_FORMAT.format(maxReady)}`;
};
