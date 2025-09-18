import { useContext } from 'react';
import { InstanceSettingsContext, type InstanceSettingsContextType } from '../contexts/InstanceSettingsContext';
import type { AppConfig } from '../types';

export const useInstanceSettings = (): InstanceSettingsContextType => {
  const context = useContext(InstanceSettingsContext);
  if (context === undefined) {
    throw new Error('useInstanceSettings must be used within an InstanceSettingsProvider');
  }
  return context;
};

// Helper hook for direct access to settings (most common use case)
export const useSettings = (): AppConfig | null => {
  const { instanceSettings } = useInstanceSettings();
  return instanceSettings;
};

// Helper hook for map-specific settings
export const useMapSettings = () => {
  const { instanceSettings } = useInstanceSettings();
  return instanceSettings?.MAP || null;
};