import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import am from './locales/am.json';
import om from './locales/om.json';

const STORAGE_KEY = 'iocms.lang';

export type SupportedLanguage = 'en' | 'am' | 'om';

export const supportedLanguages: { code: SupportedLanguage; label: string; nativeLabel: string }[] = [
  { code: 'om', label: 'Afaan Oromoo', nativeLabel: 'OR' },
  { code: 'en', label: 'English', nativeLabel: 'EN' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማ' },
];

const savedLang = (typeof window !== 'undefined' && (localStorage.getItem(STORAGE_KEY) as SupportedLanguage)) || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    am: { translation: am },
    om: { translation: om },
  },
  lng: savedLang,
  fallbackLng: 'en', // if an Amharic/Afaan Oromoo string is missing/empty, English is shown instead
  interpolation: { escapeValue: false },
  returnEmptyString: false, // treat "" values in am.json/om.json as missing -> falls back to English
});

export function setLanguage(lang: SupportedLanguage) {
  i18n.changeLanguage(lang);
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

export default i18n;
