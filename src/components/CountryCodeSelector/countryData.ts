import type { CountryCode } from 'libphonenumber-js';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

/**
 * Country data for the country code selector
 */
export interface CountryData {
  code: CountryCode;
  name: string;
  callingCode: string;
  flag: string;
}

/**
 * Country names mapping (ISO 3166-1 alpha-2 to English name)
 * Common countries for UK-based app
 */
const COUNTRY_NAMES: Record<string, string> = {
  GB: 'United Kingdom',
  US: 'United States',
  CA: 'Canada',
  AU: 'Australia',
  NZ: 'New Zealand',
  IE: 'Ireland',
  FR: 'France',
  DE: 'Germany',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'Netherlands',
  BE: 'Belgium',
  PT: 'Portugal',
  AT: 'Austria',
  CH: 'Switzerland',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  PL: 'Poland',
  CZ: 'Czech Republic',
  GR: 'Greece',
  RO: 'Romania',
  HU: 'Hungary',
  BG: 'Bulgaria',
  HR: 'Croatia',
  SK: 'Slovakia',
  SI: 'Slovenia',
  LT: 'Lithuania',
  LV: 'Latvia',
  EE: 'Estonia',
  CY: 'Cyprus',
  MT: 'Malta',
  LU: 'Luxembourg',
  IN: 'India',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  PH: 'Philippines',
  NG: 'Nigeria',
  GH: 'Ghana',
  KE: 'Kenya',
  ZA: 'South Africa',
  EG: 'Egypt',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  JP: 'Japan',
  KR: 'South Korea',
  CN: 'China',
  HK: 'Hong Kong',
  SG: 'Singapore',
  MY: 'Malaysia',
  TH: 'Thailand',
  ID: 'Indonesia',
  VN: 'Vietnam',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  CO: 'Colombia',
  CL: 'Chile',
  PE: 'Peru',
  RU: 'Russia',
  UA: 'Ukraine',
  TR: 'Turkey',
  IL: 'Israel',
};

/**
 * Convert ISO country code to flag emoji
 * Uses regional indicator symbols (A = 0x1F1E6, etc.)
 */
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

/**
 * Get country name from ISO code
 */
export function getCountryName(countryCode: string): string {
  return COUNTRY_NAMES[countryCode] || countryCode;
}

/**
 * Get all supported countries with their data
 * Sorted with priority countries first (GB, US, etc.), then alphabetically
 */
export function getAllCountries(): CountryData[] {
  const priorityCountries = ['GB', 'US', 'CA', 'AU', 'IE', 'NZ'];
  const countries = getCountries();

  const countryDataList: CountryData[] = countries
    .filter(code => COUNTRY_NAMES[code]) // Only include countries we have names for
    .map(code => ({
      code,
      name: getCountryName(code),
      callingCode: `+${getCountryCallingCode(code)}`,
      flag: getFlagEmoji(code),
    }));

  // Sort: priority countries first, then alphabetically by name
  return countryDataList.sort((a, b) => {
    const aPriority = priorityCountries.indexOf(a.code);
    const bPriority = priorityCountries.indexOf(b.code);

    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority;
    }
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;

    return a.name.localeCompare(b.name);
  });
}

/**
 * Search countries by name or calling code
 */
export function searchCountries(query: string, countries: CountryData[]): CountryData[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return countries;

  return countries.filter(
    country =>
      country.name.toLowerCase().includes(lowerQuery) ||
      country.callingCode.includes(lowerQuery) ||
      country.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Default country (United Kingdom)
 */
export const DEFAULT_COUNTRY: CountryData = {
  code: 'GB',
  name: 'United Kingdom',
  callingCode: '+44',
  flag: getFlagEmoji('GB'),
};
