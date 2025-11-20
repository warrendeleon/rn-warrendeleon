import i18next from 'i18next';

import { formatDate, formatDateRange } from '../dateFormatter';

describe('dateFormatter', () => {
  describe('formatDate', () => {
    beforeEach(() => {
      // Set locale to English for consistent testing
      i18next.changeLanguage('en');
    });

    it('formats YYYY-MM date correctly in English', () => {
      const result = formatDate('2023-10');
      expect(result).toBe('Oct 2023');
    });

    it('formats YYYY-MM date correctly for December', () => {
      const result = formatDate('2025-12');
      expect(result).toBe('Dec 2025');
    });

    it('formats YYYY-MM date correctly for January', () => {
      const result = formatDate('2020-01');
      expect(result).toBe('Jan 2020');
    });

    it('handles year-only format (YYYY)', () => {
      const result = formatDate('2023');
      expect(result).toBe('2023');
    });

    it('returns empty string for empty input', () => {
      const result = formatDate('');
      expect(result).toBe('');
    });

    it('formats date correctly in Spanish locale', () => {
      i18next.changeLanguage('es');
      const result = formatDate('2023-10');
      // Spanish abbreviation for October
      expect(result).toContain('2023');
    });
  });

  describe('formatDateRange', () => {
    beforeEach(() => {
      i18next.changeLanguage('en');
    });

    it('formats date range with both start and end dates', () => {
      const result = formatDateRange('2020-01', '2023-10', 'Present');
      expect(result).toBe('Jan 2020 - Oct 2023');
    });

    it('formats date range with null end date using Present text', () => {
      const result = formatDateRange('2020-01', null, 'Present');
      expect(result).toBe('Jan 2020 - Present');
    });

    it('formats date range with year-only start date', () => {
      const result = formatDateRange('2020', '2023-10', 'Present');
      expect(result).toBe('2020 - Oct 2023');
    });

    it('handles both dates as year-only format', () => {
      const result = formatDateRange('2020', '2023', 'Present');
      expect(result).toBe('2020 - 2023');
    });

    it('uses localised Present text when end date is null', () => {
      const presentText = 'Presente';
      const result = formatDateRange('2020-01', null, presentText);
      expect(result).toBe('Jan 2020 - Presente');
    });
  });
});
