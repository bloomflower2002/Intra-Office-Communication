import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import am from './locales/am.json';
import om from './locales/om.json';

const STORAGE_KEY = 'iocms.lang';

const savedLang = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    om: { translation: om },
    am: { translation: am },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export function setLanguage(lang: 'en' | 'om' | 'am') {
  i18n.changeLanguage(lang);
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

export default i18n;
