import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import enGB from './translations/en-gb.json';
import esES from './translations/es-es.json';

const resources = {
  en: {translation: enGB},
  es: {translation: esES},
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  fallbackLng: 'en-GB',
  lng: RNLocalize.getLocales()[0].languageCode,
  resources,
});

export const changeLanguage = (language: string) =>
  i18n.changeLanguage(language);

export default i18n;
