export const companyProfile = {
  name: 'MPS Group',
  automotiveName: 'MPS Group Automotive',
  primaryPhoneDisplay: '(780) 594-8100',
  primaryPhoneHref: 'tel:+1-780-594-8100',
  faxDisplay: '(780) 638-6029',
  primaryEmail: 'info@mpsgroup.ca',
  primaryEmailHref: 'mailto:info@mpsgroup.ca',
  mapUrl: 'https://maps.google.com/?q=54.3243751,-109.8403854',
  bookingTimeZone: 'America/Edmonton',
  automotiveLocationLabel: 'Highway 55, Pierceland, SK',
  automotiveLocationShort: 'Pierceland, Saskatchewan',
  physicalAddress: 'E Range Rd 3264, Highway 55, Pierceland, SK S0M 2K0',
  mailingAddress: 'PO Box 1230, Cold Lake, AB T9M 1P3',
  coordinates: {
    latitudeDisplay: '54.32° N',
    longitudeDisplay: '109.84° W',
  },
} as const;

export const getCurrentYear = (date = new Date()) => date.getFullYear();
