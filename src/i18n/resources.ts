// src/i18n/resources.ts
import en from './locales/en.json';
import es from './locales/es.json';

export const resources = {
  en: { translation: en },
  es: { translation: es },
} as const;

export type Resources = typeof resources;
