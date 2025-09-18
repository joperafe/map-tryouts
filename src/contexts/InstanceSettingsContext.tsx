import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { getConfig } from '../config';
import type { AppConfig } from '../types';

interface InstanceSettingsContextType {
  instanceSettings: AppConfig | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const InstanceSettingsContext = createContext<InstanceSettingsContextType | undefined>(undefined);

interface InstanceSettingsProviderProps {
  children: ReactNode;
}

export const InstanceSettingsProvider: React.FC<InstanceSettingsProviderProps> = ({ children }) => {
  const [instanceSettings, setInstanceSettings] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the merged configuration for the current environment
      const config = getConfig();
      
      // Store the complete merged configuration
      setInstanceSettings(config.environment);
      
      console.log('Instance settings loaded successfully:', config.environment.ENVIRONMENT);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load instance settings';
      setError(errorMessage);
      console.error('Error loading instance settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const reload = async () => {
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const contextValue: InstanceSettingsContextType = {
    instanceSettings,
    isLoading,
    error,
    reload,
  };

  return (
    <InstanceSettingsContext.Provider value={contextValue}>
      {children}
    </InstanceSettingsContext.Provider>
  );
};

// Export context and types for use in separate hooks file
export { InstanceSettingsContext };
export type { InstanceSettingsContextType };