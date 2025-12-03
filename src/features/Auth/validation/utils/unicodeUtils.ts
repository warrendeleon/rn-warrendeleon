import unorm from 'unorm';

/**
 * Detects if a string contains characters from multiple scripts (homograph attack)
 *
 * @param value - String to check
 * @returns true if string contains mixed scripts (Latin + Cyrillic, etc.)
 */
export function containsMixedScripts(value: string): boolean {
  if (!value) return false;

  const normalized = unorm.nfc(value); // Normalize to NFC form

  // Unicode ranges
  const hasLatin = /[a-zA-Z]/.test(normalized);
  const hasCyrillic = /[\u0400-\u04FF]/.test(normalized); // Cyrillic
  const hasGreek = /[\u0370-\u03FF]/.test(normalized); // Greek
  const hasArabic = /[\u0600-\u06FF]/.test(normalized); // Arabic

  // Count how many scripts are present
  const scriptCount = [hasLatin, hasCyrillic, hasGreek, hasArabic].filter(Boolean).length;

  return scriptCount > 1;
}

/**
 * Normalizes string to NFC form and checks for non-Latin characters
 *
 * @param value - String to normalize
 * @returns Normalized string and validity flag
 */
export function normalizeAndValidate(value: string): { normalized: string; isValid: boolean } {
  if (!value) return { normalized: '', isValid: true };

  const normalized = unorm.nfc(value);

  // Allow only Latin letters, spaces, hyphens, apostrophes
  const isValid = /^[a-zA-Z\s'-]+$/.test(normalized);

  return { normalized, isValid };
}

/**
 * Detects common homograph characters
 *
 * @param value - String to check
 * @returns Array of detected lookalike characters
 */
export function detectHomographs(value: string): Array<{ char: string; position: number }> {
  if (!value) return [];

  const homographs: Array<{ char: string; position: number }> = [];

  // Common lookalikes (Cyrillic that look like Latin)
  const lookalikes: Record<string, string> = {
    а: 'a', // Cyrillic a
    е: 'e', // Cyrillic e
    о: 'o', // Cyrillic o
    р: 'p', // Cyrillic r
    с: 'c', // Cyrillic c
    у: 'y', // Cyrillic y
    х: 'x', // Cyrillic x
    А: 'A', // Cyrillic A
    В: 'B', // Cyrillic B
    Е: 'E', // Cyrillic E
    К: 'K', // Cyrillic K
    М: 'M', // Cyrillic M
    Н: 'H', // Cyrillic H
    О: 'O', // Cyrillic O
    Р: 'P', // Cyrillic P
    С: 'C', // Cyrillic C
    Т: 'T', // Cyrillic T
    Х: 'X', // Cyrillic X
  };

  for (let i = 0; i < value.length; i++) {
    const char = value[i]!;
    if (lookalikes[char]) {
      homographs.push({ char, position: i });
    }
  }

  return homographs;
}
