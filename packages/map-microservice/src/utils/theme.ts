import { ThemeConfig } from '../types';

export const defaultTheme: ThemeConfig = {
  light: {
    background: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb',
    controlBackground: '#ffffff',
    controlBorder: '#d1d5db',
  },
  dark: {
    background: '#1f2937',
    text: '#f9fafb',
    border: '#374151',
    controlBackground: '#374151',
    controlBorder: '#4b5563',
  },
};

export const getThemeColors = (theme: 'light' | 'dark') => defaultTheme[theme];
