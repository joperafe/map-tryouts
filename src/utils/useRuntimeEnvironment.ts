import { useState, useEffect } from 'react';
import { detectRuntimeEnvironment, getEnvironmentConfig, type RuntimeEnvironment, type EnvironmentConfig } from './environmentDetector';

/**
 * Hook that provides current environment and config, updating when URL changes
 */
export function useRuntimeEnvironment() {
  const [environment, setEnvironment] = useState<RuntimeEnvironment>('PROD');
  const [config, setConfig] = useState<EnvironmentConfig>(() => getEnvironmentConfig());

  useEffect(() => {
    const updateEnvironment = () => {
      const newEnv = detectRuntimeEnvironment();
      const newConfig = getEnvironmentConfig();
      
      console.log('🔄 Environment updated:', newEnv);
      setEnvironment(newEnv);
      setConfig(newConfig);
    };

    // Initial detection
    updateEnvironment();

    // Listen for URL changes (back/forward, manual URL changes)
    const handlePopState = () => {
      console.log('🔄 URL changed (popstate)');
      updateEnvironment();
    };

    // Listen for hash changes (if using hash routing)
    const handleHashChange = () => {
      console.log('🔄 Hash changed');
      updateEnvironment();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    // Also check for manual URL parameter changes every second (for development)
    let intervalId: number | undefined;
    if (import.meta.env.DEV) {
      intervalId = window.setInterval(() => {
        const currentEnv = detectRuntimeEnvironment();
        if (currentEnv !== environment) {
          console.log('🔄 Environment change detected via polling');
          updateEnvironment();
        }
      }, 1000);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [environment]);

  return { environment, config };
}