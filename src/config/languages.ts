import { getDefaultConfig } from './settings';

export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName?: string;
}

let _supportedLanguages: Language[] | null = null;
let _defaultLanguage: string | null = null;

export const getSupportedLanguages = (): Language[] => {
  if (_supportedLanguages === null) {
    _supportedLanguages = getDefaultConfig().languages.supported;
  }
  return _supportedLanguages;
};

export const getDefaultLanguage = (): string => {
  if (_defaultLanguage === null) {
    _defaultLanguage = getDefaultConfig().languages.default;
  }
  return _defaultLanguage;
};

// Deprecated - use getSupportedLanguages() instead
export const supportedLanguages: Language[] = [];

// Deprecated - use getDefaultLanguage() instead  
export const defaultLanguage: string = '';

export const getLanguageByCode = (code: string): Language | undefined => {
  return getSupportedLanguages().find(lang => lang.code === code);
};

export const isLanguageSupported = (code: string): boolean => {
  return getSupportedLanguages().some(lang => lang.code === code);
};
