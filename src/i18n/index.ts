import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import i18next from 'i18next';

import { resources } from './resources';

export { resources };
export const defaultNS = 'translation';

export type LanguageTagInfo = { languageTag: string; isRTL: boolean };

export interface LocalizeModule {
  getLocales?: () => Array<{
    languageTag: string;
    languageCode?: string;
  }>;
}

const fallback: LanguageTagInfo = { languageTag: 'en', isRTL: false };

export const resolveLanguageTag = (localize: LocalizeModule): string => {
  const supported = Object.keys(resources);
  const locales = localize.getLocales?.() ?? [];
  const primary = locales[0];

  if (primary) {
    const { languageTag, languageCode } = primary;

    // 1) Exact tag match (e.g. "en", "es")
    if (languageTag && supported.includes(languageTag)) {
      return languageTag;
    }

    // 2) Base language match (e.g. "es-ES" -> "es")
    if (languageCode) {
      const baseMatch = supported.find(code => code === languageCode);
      if (baseMatch) {
        return baseMatch;
      }
    }
  }

  // 3) Fallback to English if nothing matches
  return fallback.languageTag;
};

const languageTag = resolveLanguageTag({ getLocales });

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: languageTag,
  fallbackLng: 'en',
  defaultNS,
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
