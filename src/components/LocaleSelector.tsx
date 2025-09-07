import React from 'react';
import { useTranslation } from 'react-i18next';
import { getSupportedLanguages, getLanguageByCode, isLanguageSupported } from '../config/languages';

export const LocaleSelector: React.FC = () => {
  const { i18n } = useTranslation();
  
  const supportedLanguages = getSupportedLanguages();
  const currentLanguage = getLanguageByCode(i18n.language) || supportedLanguages[0];

  // Debug logging
  console.log('LocaleSelector debug:', {
    'i18n.language': i18n.language,
    'supportedLanguages': supportedLanguages,
    'currentLanguage': currentLanguage
  });

  const handleLanguageChange = (languageCode: string) => {
    console.log('Language change requested:', languageCode);
    if (isLanguageSupported(languageCode)) {
      console.log('Language is supported, changing...');
      i18n.changeLanguage(languageCode);
      // Store language preference in localStorage
      localStorage.setItem('language', languageCode);
      console.log('Language changed to:', languageCode);
    } else {
      console.log('Language not supported:', languageCode);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div className="group">
        <button
          className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          type="button"
        >
          <span className="mr-2">{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
          <svg
            className="ml-2 -mr-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        <div className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`group flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 ${
                  i18n.language === language.code
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
              >
                <span className="mr-3">{language.flag}</span>
                <span>{language.name}</span>
                {i18n.language === language.code && (
                  <svg
                    className="ml-auto h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocaleSelector;
