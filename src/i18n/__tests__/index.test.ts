import { resolveLanguageTag, type LocalizeModule } from '@/i18n';

describe('resolveLanguageTag()', () => {
  it('returns the language tag provided by react-native-localize when available', () => {
    const localize: LocalizeModule = {
      findBestAvailableLanguage: () => ({ languageTag: 'es', isRTL: false }),
    };

    const languageTag = resolveLanguageTag(localize);

    expect(languageTag).toBe('es');
  });

  it('defaults to English ("en") when no best available language is found', () => {
    const localize: LocalizeModule = {
      findBestAvailableLanguage: () => undefined,
    };

    const languageTag = resolveLanguageTag(localize);

    expect(languageTag).toBe('en');
  });
});
