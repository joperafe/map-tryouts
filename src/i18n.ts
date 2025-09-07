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
  console.log('i18n debug - storedLanguage:', storedLanguage);
  
  if (storedLanguage && isLanguageSupported(storedLanguage)) {
    console.log('Using stored language:', storedLanguage);
    return storedLanguage;
  }
  
  const envLanguage = import.meta.env.VITE_DEFAULT_LANGUAGE;
  console.log('i18n debug - envLanguage:', envLanguage);
  
  const defaultLang = getDefaultLanguage();
  console.log('i18n debug - defaultLanguage:', defaultLang);
  
  const finalLanguage = envLanguage && isLanguageSupported(envLanguage) ? envLanguage : defaultLang;
  console.log('i18n debug - finalLanguage:', finalLanguage);
  
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
