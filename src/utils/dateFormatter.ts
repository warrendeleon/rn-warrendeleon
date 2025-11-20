import i18next from 'i18next';

/**
 * Format a date string (YYYY-MM or YYYY) to localised month and year
 * @param dateString - ISO date string (YYYY-MM or YYYY)
 * @returns Formatted date string (e.g., "Dec 2025" in English, "Dic 2025" in Spanish)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';

  const parts = dateString.split('-');
  const year = parts[0];
  const month = parts[1];

  // Year only (YYYY)
  if (!month) {
    return year ?? '';
  }

  // Year and month (YYYY-MM)
  const monthIndex = parseInt(month, 10) - 1; // 0-indexed
  const date = new Date(parseInt(year ?? '0', 10), monthIndex, 1);

  // Format using Intl.DateTimeFormat with current locale
  const locale = i18next.language || 'en';
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
  });

  return formatter.format(date);
};

/**
 * Format a date range for work experience
 * @param startDate - Start date (YYYY-MM or YYYY)
 * @param endDate - End date (YYYY-MM, YYYY, or null for Present)
 * @param presentText - Localised "Present" text
 * @returns Formatted date range (e.g., "Jan 2020 - Dec 2025" or "Jan 2020 - Present")
 */
export const formatDateRange = (
  startDate: string,
  endDate: string | null,
  presentText: string
): string => {
  const formattedStart = formatDate(startDate);

  if (!endDate) {
    return `${formattedStart} - ${presentText}`;
  }

  const formattedEnd = formatDate(endDate);
  return `${formattedStart} - ${formattedEnd}`;
};
