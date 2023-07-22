import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18next';

import en from './translations/en.json';
import es from './translations/es.json';

const resources = {
  en: {translation: en},
  es: {translation: es},
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  fallbackLng: 'en',
  lng: RNLocalize.getLocales()[0].languageCode,
  resources,
});

export const changeLanguage = (language: string) =>
  i18n.changeLanguage(language);

export default i18n;
