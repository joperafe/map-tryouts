import { 
  getEnvironmentSettings, 
  getDefaultConfig, 
  getAppConfig, 
  getCurrentEnvironment,
  type Environment 
} from './settings';

// Legacy support - use the new settings system
const getEnvironment = (): Environment => {
  return getCurrentEnvironment();
};

// Export configuration getter functions (lazy evaluation to avoid runtime errors)
export const getConfig = () => getAppConfig();

// Export individual parts for specific use cases (also lazy)
export const getEnvironmentSettings_ = () => getEnvironmentSettings();
export const getDefaultConfig_ = () => getDefaultConfig();

// Backward compatibility - lazy config object
let _config: ReturnType<typeof getAppConfig> | null = null;
export const config = new Proxy({} as ReturnType<typeof getAppConfig>, {
  get(_target, prop) {
    if (!_config) {
      _config = getAppConfig();
    }
    return _config[prop as keyof typeof _config];
  }
});

// Export utility functions
export { 
  getEnvironment, 
  getCurrentEnvironment,
  getEnvironmentSettings,
  getDefaultConfig,
  getAppConfig 
};
