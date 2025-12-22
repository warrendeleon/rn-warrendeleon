/**
 * i18n Edge Cases Tests
 *
 * Tests edge cases in internationalisation:
 * - Missing translations and fallback behaviour
 * - Interpolation with special characters
 * - RTL language handling
 * - Empty/null values
 * - Language switching
 * - Nested key access
 * - Pluralisation
 *
 * @see src/i18n/index.ts
 */

import i18next from 'i18next';

import { type LocalizeModule, resolveLanguageTag } from '@app/i18n';

describe('i18n Edge Cases', () => {
  describe('resolveLanguageTag edge cases', () => {
    it('handles empty locales array', () => {
      const localize: LocalizeModule = {
        getLocales: () => [],
      };

      const languageTag = resolveLanguageTag(localize);

      expect(languageTag).toBe('en');
    });

    it('handles locale with only languageTag (no languageCode)', () => {
      const localize: LocalizeModule = {
        getLocales: () => [{ languageTag: 'es' }],
      };

      const languageTag = resolveLanguageTag(localize);

      expect(languageTag).toBe('es');
    });

    it('handles regional variant that matches base language', () => {
      const localize: LocalizeModule = {
        getLocales: () => [{ languageTag: 'es-MX', languageCode: 'es' }],
      };

      const languageTag = resolveLanguageTag(localize);

      expect(languageTag).toBe('es');
    });

    it('handles regional variant that does not match any supported language', () => {
      const localize: LocalizeModule = {
        getLocales: () => [{ languageTag: 'de-AT', languageCode: 'de' }],
      };

      const languageTag = resolveLanguageTag(localize);

      expect(languageTag).toBe('en');
    });

    it('handles Catalan locale correctly', () => {
      const localize: LocalizeModule = {
        getLocales: () => [{ languageTag: 'ca', languageCode: 'ca' }],
      };

      const languageTag = resolveLanguageTag(localize);

      expect(languageTag).toBe('ca');
    });

    it('handles Polish locale correctly', () => {
      const localize: LocalizeModule = {
        getLocales: () => [{ languageTag: 'pl-PL', languageCode: 'pl' }],
      };

      const languageTag = resolveLanguageTag(localize);

      expect(languageTag).toBe('pl');
    });

    it('handles Tagalog/Filipino locale correctly', () => {
      const localize: LocalizeModule = {
        getLocales: () => [{ languageTag: 'tl-PH', languageCode: 'tl' }],
      };

      const languageTag = resolveLanguageTag(localize);

      expect(languageTag).toBe('tl');
    });

    it('handles null getLocales result', () => {
      const localize: LocalizeModule = {
        getLocales: () => null as unknown as Array<{ languageTag: string }>,
      };

      const languageTag = resolveLanguageTag(localize);

      expect(languageTag).toBe('en');
    });

    it('handles undefined getLocales', () => {
      const localize: LocalizeModule = {
        getLocales: undefined,
      };

      const languageTag = resolveLanguageTag(localize);

      expect(languageTag).toBe('en');
    });

    it('handles locale with undefined languageCode', () => {
      const localize: LocalizeModule = {
        getLocales: () => [{ languageTag: 'unknown', languageCode: undefined }],
      };

      const languageTag = resolveLanguageTag(localize);

      expect(languageTag).toBe('en');
    });

    it('handles multiple locales and uses first matching', () => {
      const localize: LocalizeModule = {
        getLocales: () => [
          { languageTag: 'fr-FR', languageCode: 'fr' },
          { languageTag: 'es-ES', languageCode: 'es' },
          { languageTag: 'en-US', languageCode: 'en' },
        ],
      };

      // Should use first locale (fr), which isn't supported, so fallback to en
      const languageTag = resolveLanguageTag(localize);

      expect(languageTag).toBe('en');
    });
  });

  describe('Translation fallback behaviour', () => {
    it('returns key when translation is missing and fallback fails', () => {
      // Use type assertion to test nonexistent key behaviour
      const result = i18next.t('nonexistent.key.that.does.not.exist' as 'error.title');

      expect(result).toBe('nonexistent.key.that.does.not.exist');
    });

    it('uses fallback language when key missing in current language', async () => {
      // Save original language
      const originalLang = i18next.language;

      // Change to Spanish (assuming English is fallback)
      await i18next.changeLanguage('es');

      // Request a key that should exist in en (and es)
      const result = i18next.t('auth.login.title');

      // Restore
      await i18next.changeLanguage(originalLang);

      // Should return the Spanish translation or English fallback
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe('auth.login.title'); // Not returning the key
    });
  });

  describe('Interpolation edge cases', () => {
    // auth.forgotPassword.successMessage uses interpolation: "We've sent a password reset link to {{email}}"
    const interpolationKey = 'auth.forgotPassword.successMessage';

    it('handles interpolation with missing variables', () => {
      const result = i18next.t(interpolationKey, { email: undefined });

      // Should still return something (even if {{email}} is shown or replaced with empty)
      expect(typeof result).toBe('string');
    });

    it('handles interpolation with empty string', () => {
      const result = i18next.t(interpolationKey, { email: '' });

      expect(typeof result).toBe('string');
    });

    it('handles interpolation with normal value', () => {
      const result = i18next.t(interpolationKey, { email: 'test@example.com' });

      expect(typeof result).toBe('string');
      expect(result).toContain('test@example.com');
    });

    it('handles interpolation with special characters', () => {
      const result = i18next.t(interpolationKey, {
        email: '<script>alert("xss")</script>',
      });

      // i18next should not interpret HTML by default (escapeValue: false is set)
      expect(typeof result).toBe('string');
    });

    it('handles interpolation with unicode characters', () => {
      const result = i18next.t(interpolationKey, { email: 'user@日本語.com' });

      expect(typeof result).toBe('string');
      expect(result).toContain('日本語');
    });

    it('handles interpolation with emoji', () => {
      const result = i18next.t(interpolationKey, { email: 'emoji🎉@test.com' });

      expect(typeof result).toBe('string');
      expect(result).toContain('🎉');
    });
  });

  describe('Language switching', () => {
    afterEach(() => {
      // Reset to English after each test
      i18next.changeLanguage('en');
    });

    it.each([
      { langCode: 'es', langName: 'Spanish' },
      { langCode: 'ca', langName: 'Catalan' },
      { langCode: 'pl', langName: 'Polish' },
      { langCode: 'tl', langName: 'Tagalog' },
      { langCode: 'en', langName: 'English' },
    ])(
      'switches language to $langCode ($langName) and updates i18next.language',
      async ({ langCode }) => {
        await i18next.changeLanguage(langCode);

        expect(i18next.language).toBe(langCode);
      }
    );

    it('falls back gracefully when switching to unsupported language code', async () => {
      await i18next.changeLanguage('xx');

      // Should either stay on fallback or be 'xx' depending on config
      // The fallbackLng: 'en' means translations will come from English
      expect(['xx', 'en']).toContain(i18next.language);
    });

    it('returns to English after switching to another language', async () => {
      await i18next.changeLanguage('es');
      expect(i18next.language).toBe('es');

      await i18next.changeLanguage('en');
      expect(i18next.language).toBe('en');
    });

    it('preserves translation content after multiple sequential language switches', async () => {
      const originalTranslation = i18next.t('auth.login.title');

      await i18next.changeLanguage('es');
      await i18next.changeLanguage('ca');
      await i18next.changeLanguage('en');

      const finalTranslation = i18next.t('auth.login.title');

      expect(finalTranslation).toBe(originalTranslation);
    });
  });

  describe('Nested key access', () => {
    it('accesses first-level nested keys', () => {
      const result = i18next.t('auth.login.title');

      expect(typeof result).toBe('string');
      expect(result).not.toBe('auth.login.title');
      expect(result).toBe('Welcome Back');
    });

    it('accesses deeply nested keys (three levels)', () => {
      const result = i18next.t('auth.login.errors.emailRequired');

      expect(typeof result).toBe('string');
      expect(result).not.toBe('auth.login.errors.emailRequired');
      expect(result).toBe('Email is required');
    });

    it('handles non-existent nested path gracefully', () => {
      // Use type assertion to test nonexistent key behaviour
      const result = i18next.t('deeply.nested.path.that.does.not.exist' as 'error.title');

      expect(result).toBe('deeply.nested.path.that.does.not.exist');
    });

    it('returns key for non-existent path with existing parent', () => {
      // auth.login exists but auth.login.nonexistent doesn't
      // Use type assertion to test nonexistent key behaviour
      const result = i18next.t('auth.login.nonexistent' as 'error.title');

      expect(result).toBe('auth.login.nonexistent');
    });
  });

  describe('Translation value edge cases', () => {
    it('handles defaultValue option for existing key', () => {
      // When key exists, defaultValue is ignored
      const result = i18next.t('auth.login.title', { defaultValue: 'Default Title' });

      expect(typeof result).toBe('string');
      expect(result).toBe('Welcome Back'); // Real value, not default
    });

    it('handles defaultValue option for missing key', () => {
      const result = i18next.t('nonexistent.key', { defaultValue: 'Default Value' });

      expect(result).toBe('Default Value');
    });

    it('handles namespace prefix', () => {
      const result = i18next.t('translation:auth.login.title');

      expect(typeof result).toBe('string');
      expect(result).toBe('Welcome Back');
    });
  });

  describe('RTL language considerations', () => {
    it('supports RTL language switching (if implemented)', () => {
      // Currently no RTL languages are supported, but test the API
      // Arabic would be: ar, Hebrew would be: he
      const supportedLanguages = Object.keys(i18next.options.resources || {});

      // Verify which languages are supported
      expect(supportedLanguages).toContain('en');
      expect(supportedLanguages).toContain('es');
      expect(supportedLanguages).toContain('ca');
      expect(supportedLanguages).toContain('pl');
      expect(supportedLanguages).toContain('tl');
    });
  });

  describe('i18next configuration', () => {
    it('has escapeValue set to false', () => {
      // This is important for React Native where we handle escaping differently
      const escapeValue = i18next.options.interpolation?.escapeValue;

      expect(escapeValue).toBe(false);
    });

    it('has fallbackLng set to en', () => {
      expect(i18next.options.fallbackLng).toContain('en');
    });

    it('has defaultNS set to translation', () => {
      expect(i18next.options.defaultNS).toBe('translation');
    });

    it('has compatibilityJSON set to v4', () => {
      // This is needed for proper plural handling in newer i18next
      expect(i18next.options.compatibilityJSON).toBe('v4');
    });

    it('reports isInitialized as true after configuration is complete', () => {
      expect(i18next.isInitialized).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('does not throw on invalid key', () => {
      expect(() => {
        // Use type assertion to test empty key behaviour
        i18next.t('' as 'error.title');
      }).not.toThrow();
    });

    it('does not throw on null-ish options', () => {
      expect(() => {
        // Test null options behaviour - use valid key with empty object
        i18next.t('error.title', {});
      }).not.toThrow();
    });

    it('does not throw on undefined options', () => {
      expect(() => {
        // Test without options parameter
        i18next.t('error.title');
      }).not.toThrow();
    });
  });

  describe('Date and Number Formatting', () => {
    // Note: i18next itself doesn't format dates/numbers - that's handled by Intl
    // These tests verify the locale is correctly passed through for formatting

    describe('Number formatting with Intl', () => {
      it('formats numbers according to English locale', () => {
        const number = 1234567.89;
        const formatted = new Intl.NumberFormat('en').format(number);

        expect(formatted).toBe('1,234,567.89');
      });

      it('formats numbers according to Spanish locale', () => {
        const number = 1234567.89;
        const formatted = new Intl.NumberFormat('es').format(number);

        // Spanish uses period for thousands, comma for decimals
        expect(formatted).toMatch(/1\.234\.567,89|1.234.567,89/);
      });

      it('formats numbers according to Polish locale', () => {
        const number = 1234567.89;
        const formatted = new Intl.NumberFormat('pl').format(number);

        // Polish uses space for thousands, comma for decimals
        expect(formatted).toMatch(/1\s?234\s?567,89/);
      });

      it('formats currency according to locale', () => {
        const amount = 1234.56;

        const enFormatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);

        const esFormatted = new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
        }).format(amount);

        expect(enFormatted).toContain('$');
        expect(enFormatted).toContain('1,234.56');
        expect(esFormatted).toContain('€');
      });

      it('formats percentages according to locale', () => {
        const value = 0.1234;

        const enFormatted = new Intl.NumberFormat('en', {
          style: 'percent',
          minimumFractionDigits: 1,
        }).format(value);

        expect(enFormatted).toMatch(/12\.3%|12.3%/);
      });
    });

    describe('Date formatting with Intl', () => {
      const testDate = new Date('2024-03-15T10:30:00');

      it('formats dates according to English locale', () => {
        const formatted = new Intl.DateTimeFormat('en-GB').format(testDate);

        // UK format: DD/MM/YYYY
        expect(formatted).toMatch(/15\/0?3\/2024|15\/03\/2024/);
      });

      it('formats dates according to US locale', () => {
        const formatted = new Intl.DateTimeFormat('en-US').format(testDate);

        // US format: MM/DD/YYYY
        expect(formatted).toMatch(/0?3\/15\/2024|3\/15\/2024/);
      });

      it('formats dates according to Spanish locale', () => {
        const formatted = new Intl.DateTimeFormat('es-ES').format(testDate);

        // Spanish format: D/M/YYYY
        expect(formatted).toMatch(/15\/0?3\/2024|15\/3\/2024/);
      });

      it('formats time according to locale', () => {
        const enTime = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }).format(testDate);

        const esTime = new Intl.DateTimeFormat('es-ES', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        }).format(testDate);

        // US uses 12-hour with AM/PM
        expect(enTime).toMatch(/10:30\s?AM/i);
        // Spanish uses 24-hour
        expect(esTime).toMatch(/10:30/);
      });

      it('formats relative time descriptions', () => {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

        expect(rtf.format(-1, 'day')).toBe('yesterday');
        expect(rtf.format(1, 'day')).toBe('tomorrow');
        expect(rtf.format(-2, 'day')).toBe('2 days ago');
      });

      it('formats month names according to locale', () => {
        const enMonth = new Intl.DateTimeFormat('en', { month: 'long' }).format(testDate);
        const esMonth = new Intl.DateTimeFormat('es', { month: 'long' }).format(testDate);

        expect(enMonth).toBe('March');
        expect(esMonth.toLowerCase()).toBe('marzo');
      });

      it('formats day names according to locale', () => {
        const enDay = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(testDate);
        const esDay = new Intl.DateTimeFormat('es', { weekday: 'long' }).format(testDate);

        expect(enDay).toBe('Friday');
        expect(esDay.toLowerCase()).toBe('viernes');
      });
    });

    describe('Locale-specific edge cases', () => {
      it('handles negative numbers according to locale', () => {
        const number = -1234.56;

        const enFormatted = new Intl.NumberFormat('en').format(number);

        // Should include negative sign
        expect(enFormatted).toContain('-');
        expect(enFormatted).toContain('1,234.56');
      });

      it('handles zero with locale formatting', () => {
        const zero = 0;

        const enFormatted = new Intl.NumberFormat('en').format(zero);
        const esFormatted = new Intl.NumberFormat('es').format(zero);

        expect(enFormatted).toBe('0');
        expect(esFormatted).toBe('0');
      });

      it('handles very large numbers', () => {
        const largeNumber = 1234567890123;

        const formatted = new Intl.NumberFormat('en').format(largeNumber);

        expect(formatted).toBe('1,234,567,890,123');
      });

      it('handles very small decimal numbers', () => {
        const smallNumber = 0.00001;

        const formatted = new Intl.NumberFormat('en', {
          minimumFractionDigits: 5,
        }).format(smallNumber);

        expect(formatted).toBe('0.00001');
      });

      it('handles date at year boundaries', () => {
        const newYearsEve = new Date('2024-12-31T23:59:59');
        const newYearsDay = new Date('2025-01-01T00:00:00');

        const eveFormatted = new Intl.DateTimeFormat('en-GB').format(newYearsEve);
        const dayFormatted = new Intl.DateTimeFormat('en-GB').format(newYearsDay);

        expect(eveFormatted).toContain('2024');
        expect(dayFormatted).toContain('2025');
      });

      it('handles leap year date', () => {
        const leapDay = new Date('2024-02-29T12:00:00');

        const formatted = new Intl.DateTimeFormat('en-GB').format(leapDay);

        expect(formatted).toMatch(/29\/0?2\/2024|29\/02\/2024/);
      });
    });

    describe('Integration with i18next language', () => {
      afterEach(() => {
        i18next.changeLanguage('en');
      });

      it('can use i18next language for Intl formatting', async () => {
        await i18next.changeLanguage('es');

        const currentLang = i18next.language;
        const number = 1234.56;

        // Use es-ES for explicit Spanish locale (es alone may vary by environment)
        const formatted = new Intl.NumberFormat(
          currentLang === 'es' ? 'es-ES' : currentLang
        ).format(number);

        // Should use Spanish formatting (comma as decimal separator)
        expect(formatted).toMatch(/1\.?234,56/);
      });

      it('falls back gracefully for unsupported locales', () => {
        // Use a locale that might not be fully supported
        const formatted = new Intl.NumberFormat('tl-PH').format(1234.56);

        // Should still produce a formatted number
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      });
    });
  });
});
