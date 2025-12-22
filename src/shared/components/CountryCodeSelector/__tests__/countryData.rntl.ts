/**
 * Tests for Country Data utilities
 *
 * Tests country data functions: flag emoji generation, country name lookup,
 * country list generation, and search functionality.
 */

import {
  DEFAULT_COUNTRY,
  getAllCountries,
  getCountryName,
  getFlagEmoji,
  searchCountries,
} from '../countryData';

describe('countryData utilities', () => {
  describe('getFlagEmoji', () => {
    it('converts GB to UK flag emoji', () => {
      expect(getFlagEmoji('GB')).toBe('🇬🇧');
    });

    it('converts US to US flag emoji', () => {
      expect(getFlagEmoji('US')).toBe('🇺🇸');
    });

    it('handles lowercase input', () => {
      expect(getFlagEmoji('gb')).toBe('🇬🇧');
    });

    it('converts any 2-letter code to regional indicators', () => {
      expect(getFlagEmoji('JP')).toBe('🇯🇵');
      expect(getFlagEmoji('FR')).toBe('🇫🇷');
      expect(getFlagEmoji('DE')).toBe('🇩🇪');
      expect(getFlagEmoji('AU')).toBe('🇦🇺');
    });

    it('handles mixed case input', () => {
      expect(getFlagEmoji('Gb')).toBe('🇬🇧');
      expect(getFlagEmoji('gB')).toBe('🇬🇧');
    });
  });

  describe('getCountryName', () => {
    it('returns full name for known codes', () => {
      expect(getCountryName('GB')).toBe('United Kingdom');
      expect(getCountryName('US')).toBe('United States');
    });

    it('returns code itself for unknown codes', () => {
      expect(getCountryName('XX')).toBe('XX');
      expect(getCountryName('ZZ')).toBe('ZZ');
    });

    it('returns names for European countries', () => {
      expect(getCountryName('FR')).toBe('France');
      expect(getCountryName('DE')).toBe('Germany');
      expect(getCountryName('ES')).toBe('Spain');
      expect(getCountryName('IT')).toBe('Italy');
    });

    it('returns names for Asian countries', () => {
      expect(getCountryName('JP')).toBe('Japan');
      expect(getCountryName('CN')).toBe('China');
      expect(getCountryName('IN')).toBe('India');
    });
  });

  describe('getAllCountries', () => {
    it('returns array of CountryData objects', () => {
      const countries = getAllCountries();

      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
      expect(countries[0]).toHaveProperty('code');
      expect(countries[0]).toHaveProperty('name');
      expect(countries[0]).toHaveProperty('callingCode');
      expect(countries[0]).toHaveProperty('flag');
    });

    it('places priority countries first (GB, US, CA, AU, IE, NZ)', () => {
      const countries = getAllCountries();
      const firstSix = countries.slice(0, 6).map(c => c.code);

      expect(firstSix).toEqual(['GB', 'US', 'CA', 'AU', 'IE', 'NZ']);
    });

    it('sorts remaining countries alphabetically by name', () => {
      const countries = getAllCountries();
      const afterPriority = countries.slice(6);

      // Check that countries after priority are sorted alphabetically
      for (let i = 0; i < afterPriority.length - 1; i++) {
        const current = afterPriority[i]!;
        const next = afterPriority[i + 1]!;
        const comparison = current.name.localeCompare(next.name);
        expect(comparison).toBeLessThanOrEqual(0);
      }
    });

    it('only includes countries with known names', () => {
      const countries = getAllCountries();

      countries.forEach(country => {
        expect(country.name).not.toBe(country.code);
      });
    });

    it('formats calling codes with + prefix', () => {
      const countries = getAllCountries();

      countries.forEach(country => {
        expect(country.callingCode).toMatch(/^\+\d+$/);
      });
    });

    it('includes flag emoji for each country', () => {
      const countries = getAllCountries();

      countries.forEach(country => {
        // Flag emojis are regional indicator symbols (U+1F1E6 to U+1F1FF)
        expect(country.flag.length).toBeGreaterThan(0);
      });
    });

    it('returns United Kingdom with correct data', () => {
      const countries = getAllCountries();
      const uk = countries.find(c => c.code === 'GB');

      expect(uk).toBeDefined();
      expect(uk?.name).toBe('United Kingdom');
      expect(uk?.callingCode).toBe('+44');
      expect(uk?.flag).toBe('🇬🇧');
    });
  });

  describe('searchCountries', () => {
    const countries = getAllCountries();

    it('returns all countries for empty query', () => {
      expect(searchCountries('', countries)).toEqual(countries);
      expect(searchCountries('  ', countries)).toEqual(countries);
    });

    it('searches by country name (case insensitive)', () => {
      const results = searchCountries('united', countries);

      expect(results.some(c => c.name === 'United Kingdom')).toBe(true);
      expect(results.some(c => c.name === 'United States')).toBe(true);
    });

    it('searches by calling code', () => {
      const results = searchCountries('+44', countries);

      expect(results.some(c => c.code === 'GB')).toBe(true);
    });

    it('searches by calling code without plus', () => {
      const results = searchCountries('44', countries);

      expect(results.some(c => c.code === 'GB')).toBe(true);
    });

    it('searches by country code', () => {
      const results = searchCountries('GB', countries);

      expect(results.some(c => c.code === 'GB')).toBe(true);
    });

    it('searches by lowercase country code', () => {
      const results = searchCountries('gb', countries);

      expect(results.some(c => c.code === 'GB')).toBe(true);
    });

    it('trims whitespace from query', () => {
      const results = searchCountries('  GB  ', countries);

      expect(results.some(c => c.code === 'GB')).toBe(true);
    });

    it('returns empty array when no matches', () => {
      const results = searchCountries('xyzxyz', countries);

      expect(results).toEqual([]);
    });

    it('handles partial name matches', () => {
      const results = searchCountries('king', countries);

      expect(results.some(c => c.name === 'United Kingdom')).toBe(true);
    });

    it('handles partial calling code matches', () => {
      const results = searchCountries('4', countries);

      // Should match any country with 4 in calling code
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_COUNTRY', () => {
    it('is United Kingdom', () => {
      expect(DEFAULT_COUNTRY.code).toBe('GB');
      expect(DEFAULT_COUNTRY.name).toBe('United Kingdom');
      expect(DEFAULT_COUNTRY.callingCode).toBe('+44');
    });

    it('has correct flag emoji', () => {
      expect(DEFAULT_COUNTRY.flag).toBe('🇬🇧');
    });

    it('matches the structure of CountryData', () => {
      expect(DEFAULT_COUNTRY).toHaveProperty('code');
      expect(DEFAULT_COUNTRY).toHaveProperty('name');
      expect(DEFAULT_COUNTRY).toHaveProperty('callingCode');
      expect(DEFAULT_COUNTRY).toHaveProperty('flag');
    });

    it('flag matches getFlagEmoji output', () => {
      expect(DEFAULT_COUNTRY.flag).toBe(getFlagEmoji('GB'));
    });
  });
});
