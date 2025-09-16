import { getCurrentConfig } from './settings';

export type Theme = 'light' | 'dark' | 'auto';

const config = getCurrentConfig();
export const supportedThemes: Theme[] = (config.THEMES?.supported || ['light', 'dark', 'auto']) as Theme[];
export const defaultTheme: Theme = (config.THEMES?.default || 'auto') as Theme;

export const getThemeByName = (name: string): Theme | undefined => {
  return supportedThemes.find(theme => theme === name);
};

export const isThemeSupported = (theme: string): boolean => {
  return supportedThemes.includes(theme as Theme);
};

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'auto') {
    return getSystemTheme();
  }
  return theme;
};
