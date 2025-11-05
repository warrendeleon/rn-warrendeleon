// i18n initialisation
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

export type LanguageTagInfo = { languageTag: string; isRTL: boolean };

export interface LocalizeModule {
  findBestAvailableLanguage?: (tags: string[]) => LanguageTagInfo | undefined;
}

const fallback: LanguageTagInfo = { languageTag: 'en', isRTL: false };

export const resolveLanguageTag = (localize: LocalizeModule): string => {
  const result = localize.findBestAvailableLanguage?.(Object.keys(resources)) || fallback;

  return result.languageTag;
};

const languageTag = resolveLanguageTag(RNLocalize as unknown as LocalizeModule);

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: languageTag,
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
