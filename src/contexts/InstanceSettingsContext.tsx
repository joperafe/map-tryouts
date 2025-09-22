import { createContext, useState, useEffect, type ReactNode } from 'react';
import { getConfig } from '../config';
import { detectRuntimeEnvironment } from '../utils/environmentDetector';
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

export function InstanceSettingsProvider({ children }: InstanceSettingsProviderProps) {
  const [instanceSettings, setInstanceSettings] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEnvironment, setCurrentEnvironment] = useState(() => detectRuntimeEnvironment());

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

  // Listen for URL changes to detect environment switches
  useEffect(() => {
    const checkEnvironmentChange = () => {
      const newEnvironment = detectRuntimeEnvironment();
      if (newEnvironment !== currentEnvironment) {
        console.log('🔄 Environment changed in InstanceSettings:', currentEnvironment, '→', newEnvironment);
        setCurrentEnvironment(newEnvironment);
        // Reload settings for the new environment
        loadSettings();
      }
    };

    // Check for environment changes on URL changes
    const handlePopState = () => checkEnvironmentChange();
    const handleHashChange = () => checkEnvironmentChange();

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    // Also check after any programmatic navigation (like SPA redirects)
    const intervalId = setInterval(checkEnvironmentChange, 1000); // Check every second

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
      clearInterval(intervalId);
    };
  }, [currentEnvironment]);

  // Initial load
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