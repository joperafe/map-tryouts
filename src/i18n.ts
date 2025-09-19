import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getDefaultLanguage, isLanguageSupported } from './config/languages';
import enTranslation from './locales/en.json';
import ptTranslation from './locales/pt.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  pt: {
    translation: ptTranslation,
  },
};

// Get the stored language preference or use environment default
const getInitialLanguage = () => {
  const storedLanguage = localStorage.getItem('language');
  
  if (storedLanguage && isLanguageSupported(storedLanguage)) {
    return storedLanguage;
  }
  
  const envLanguage = import.meta.env.VITE_DEFAULT_LANGUAGE;
  
  const defaultLang = getDefaultLanguage();
  
  const finalLanguage = envLanguage && isLanguageSupported(envLanguage) ? envLanguage : defaultLang;
  
  return finalLanguage;
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: getDefaultLanguage(),
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
