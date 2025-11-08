import { type LocalizeModule, resolveLanguageTag } from '@app/i18n';

describe('resolveLanguageTag()', () => {
  it('returns the base language when the primary locale matches a supported language (e.g. es-ES → es)', () => {
    const localize: LocalizeModule = {
      getLocales: () => [{ languageTag: 'es-ES', languageCode: 'es' }],
    };

    const languageTag = resolveLanguageTag(localize);

    expect(languageTag).toBe('es');
  });

  it('defaults to English ("en") when the primary locale is not supported', () => {
    const localize: LocalizeModule = {
      getLocales: () => [{ languageTag: 'fr-FR', languageCode: 'fr' }],
    };

    const languageTag = resolveLanguageTag(localize);

    expect(languageTag).toBe('en');
  });

  it('defaults to English ("en") when getLocales is not provided', () => {
    const localize: LocalizeModule = {};

    const languageTag = resolveLanguageTag(localize);

    expect(languageTag).toBe('en');
  });
});
