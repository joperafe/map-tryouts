import { useState, useEffect } from 'react';
import { detectRuntimeEnvironment, getEnvironmentConfig, type RuntimeEnvironment, type EnvironmentConfig } from './environmentDetector';

/**
 * Hook that provides current environment and config, updating when URL changes
 */
export function useRuntimeEnvironment() {
  const [environment, setEnvironment] = useState<RuntimeEnvironment>(() => detectRuntimeEnvironment());
  const [config, setConfig] = useState<EnvironmentConfig>(() => getEnvironmentConfig());

  useEffect(() => {
    const updateEnvironment = () => {
      const newEnv = detectRuntimeEnvironment();
      const newConfig = getEnvironmentConfig();
      
      // Only update if actually changed
      if (newEnv !== environment) {
        console.log('🔄 Environment changed from', environment, 'to', newEnv);
        setEnvironment(newEnv);
        setConfig(newConfig);
      }
    };

    // Listen for URL changes (back/forward, manual URL changes)
    const handlePopState = () => {
      updateEnvironment();
    };

    // Listen for hash changes (if using hash routing)
    const handleHashChange = () => {
      updateEnvironment();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [environment]); // Only re-run when environment actually changes

  return { environment, config };
}